import { NextResponse } from 'next/server';
import { createPaymentUrl } from '../../../../lib/vnpay';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, planId, userId } = body;

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

    // TODO: Save order to database here
    // await saveOrder({ orderId, userId, planId, amount, status: 'pending' });

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
