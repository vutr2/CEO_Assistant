import { NextResponse } from 'next/server';
import { createPaymentUrl } from '../../../../lib/vnpay';
import { createPayment, getUserByDescopeId } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, planId, userId, cycle } = body;

    // Validate input
    if (!amount || !planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order ID (numbers only, max 8 chars for VNPay)
    const orderId = Date.now().toString().slice(-8);

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddr = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

    // Create order info (ASCII only, no Vietnamese diacritics)
    const orderInfo = `Thanh toan goi ${planId}`;

    // Create payment URL
    const paymentUrl = createPaymentUrl({
      amount,
      orderId,
      orderInfo,
      ipAddr,
      locale: 'vn',
    });

    // Save order to Supabase
    try {
      const dbUser = await getUserByDescopeId(userId);
      if (dbUser) {
        await createPayment({
          userId: dbUser.id,
          orderId,
          planId,
          amount,
          cycle: cycle || 'monthly',
        });
      }
    } catch (dbError) {
      // Log but don't block payment if DB fails
      console.error('DB save error (non-blocking):', dbError.message);
    }

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
