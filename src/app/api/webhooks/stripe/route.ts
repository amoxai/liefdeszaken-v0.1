import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const orderNumber = session.metadata?.orderNumber;

      if (orderId) {
        // Update order status to paid
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'paid',
            payment_intent_id: session.payment_intent as string,
          })
          .eq('id', orderId);

        if (error) {
          console.error('Error updating order:', error);
        }

        // Get order details for loyalty points
        const { data: order } = await supabase
          .from('orders')
          .select('user_id, subtotal, loyalty_points_earned')
          .eq('id', orderId)
          .single();

        // Award loyalty points if logged-in user
        if (order?.user_id && order.loyalty_points_earned > 0) {
          await supabase.from('loyalty_transactions').insert({
            user_id: order.user_id,
            order_id: orderId,
            points: order.loyalty_points_earned,
            type: 'earned',
            description: `Punten verdiend voor bestelling ${orderNumber}`,
          });
        }

        console.log(`Order ${orderNumber} marked as paid`);
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        // Update order status to cancelled
        await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            payment_status: 'failed',
          })
          .eq('id', orderId);

        console.log(`Order ${orderId} marked as cancelled (session expired)`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find order by payment intent and mark as failed
      const { data: order } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('payment_intent_id', paymentIntent.id)
        .single();

      if (order) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', order.id);

        console.log(`Order ${order.order_number} payment failed`);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (paymentIntentId) {
        const { data: order } = await supabase
          .from('orders')
          .select('id, order_number, user_id, loyalty_points_earned')
          .eq('payment_intent_id', paymentIntentId)
          .single();

        if (order) {
          await supabase
            .from('orders')
            .update({
              status: 'refunded',
              payment_status: 'refunded',
            })
            .eq('id', order.id);

          // Deduct loyalty points if they were earned
          if (order.user_id && order.loyalty_points_earned > 0) {
            await supabase.from('loyalty_transactions').insert({
              user_id: order.user_id,
              order_id: order.id,
              points: -order.loyalty_points_earned,
              type: 'adjusted',
              description: `Punten teruggenomen voor terugbetaling ${order.order_number}`,
            });
          }

          console.log(`Order ${order.order_number} refunded`);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
