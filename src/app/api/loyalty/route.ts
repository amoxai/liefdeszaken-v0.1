import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rewardId } = body;

    if (!userId || !rewardId) {
      return NextResponse.json(
        { error: 'Gebruiker en beloning zijn verplicht' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get user's current points
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('loyalty_points')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: 'Beloning niet gevonden of niet meer beschikbaar' },
        { status: 404 }
      );
    }

    // Check if user has enough points
    if (profile.loyalty_points < reward.points_required) {
      return NextResponse.json(
        { error: 'Onvoldoende punten' },
        { status: 400 }
      );
    }

    // Create loyalty transaction (deduct points)
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        points: -reward.points_required,
        type: 'redeemed',
        description: `Beloning ingewisseld: ${reward.name}`,
      });

    if (transactionError) {
      return NextResponse.json(
        { error: 'Kon beloning niet inwisselen' },
        { status: 500 }
      );
    }

    // Generate reward code based on type
    let rewardCode = '';
    switch (reward.reward_type) {
      case 'discount':
        rewardCode = `KORTING-${reward.reward_value}-${Date.now().toString(36).toUpperCase()}`;
        break;
      case 'percentage':
        rewardCode = `PRCT${reward.reward_value}-${Date.now().toString(36).toUpperCase()}`;
        break;
      case 'free_shipping':
        rewardCode = `GRATISVERZENDING-${Date.now().toString(36).toUpperCase()}`;
        break;
      default:
        rewardCode = `REWARD-${Date.now().toString(36).toUpperCase()}`;
    }

    return NextResponse.json({
      success: true,
      message: `${reward.name} succesvol ingewisseld!`,
      rewardCode,
      newPointsBalance: profile.loyalty_points - reward.points_required,
    });
  } catch (error) {
    console.error('Redeem error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    );
  }
}

// Award loyalty points (called after successful order)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderId, amount, description } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Gebruiker en punten zijn verplicht' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Calculate points (1 point per euro)
    const points = Math.floor(amount);

    if (points <= 0) {
      return NextResponse.json({ success: true, points: 0 });
    }

    // Create loyalty transaction
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        order_id: orderId,
        points: points,
        type: 'earned',
        description: description || `Punten verdiend voor bestelling`,
      });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: 'Kon punten niet toekennen' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      points,
      message: `${points} punten toegekend!`,
    });
  } catch (error) {
    console.error('Award points error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    );
  }
}
