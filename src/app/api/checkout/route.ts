import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// Lazy initialization to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
};

interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
}

interface CheckoutRequest {
  items: OrderItem[];
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  billingAddress: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  notes: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  isGuest: boolean;
  userId: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const supabase = createAdminClient();

    // Validate items
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Geen producten in bestelling' },
        { status: 400 }
      );
    }

    // Calculate loyalty points (1 point per euro)
    const loyaltyPointsEarned = body.userId ? Math.floor(body.subtotal) : 0;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: body.userId,
        guest_email: body.isGuest ? body.customer.email : null,
        status: 'pending',
        payment_status: 'pending',
        shipping_street: body.shippingAddress.street,
        shipping_house_number: body.shippingAddress.houseNumber,
        shipping_postal_code: body.shippingAddress.postalCode,
        shipping_city: body.shippingAddress.city,
        shipping_country: body.shippingAddress.country,
        billing_street: body.billingAddress.street,
        billing_house_number: body.billingAddress.houseNumber,
        billing_postal_code: body.billingAddress.postalCode,
        billing_city: body.billingAddress.city,
        billing_country: body.billingAddress.country,
        subtotal: body.subtotal,
        tax: body.tax,
        shipping_cost: body.shippingCost,
        total: body.total,
        loyalty_points_earned: loyaltyPointsEarned,
        notes: body.notes,
        is_b2b: false,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Kon bestelling niet aanmaken' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_sku: item.productSku,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Kon bestelling niet aanmaken' },
        { status: 500 }
      );
    }

    // Update stock quantities
    for (const item of body.items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.productId,
        quantity: item.quantity,
      });
    }

    // Create Stripe checkout session if Stripe is configured
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card', 'ideal'],
          line_items: body.items.map((item) => ({
            price_data: {
              currency: 'eur',
              product_data: {
                name: item.productName,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.order_number}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
          customer_email: body.customer.email,
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
          },
          shipping_options: [
            {
              shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: {
                  amount: Math.round(body.shippingCost * 100),
                  currency: 'eur',
                },
                display_name: body.shippingCost === 0 ? 'Gratis verzending' : 'Standaard verzending',
              },
            },
          ],
        });

        // Update order with payment intent
        await supabase
          .from('orders')
          .update({ payment_intent_id: session.id })
          .eq('id', order.id);

        return NextResponse.json({
          success: true,
          orderNumber: order.order_number,
          checkoutUrl: session.url,
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Return order without Stripe if there's an error
        return NextResponse.json({
          success: true,
          orderNumber: order.order_number,
          message: 'Bestelling aangemaakt (betaling via overschrijving)',
        });
      }
    }

    // Return order without Stripe
    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwerken van je bestelling' },
      { status: 500 }
    );
  }
}
