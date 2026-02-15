import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  getPaymentByOrderId,
  updatePaymentStatus,
  updateUserPlan,
} from '../../../../lib/supabase';

const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET;

function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function verifyVNPaySignature(url, secureHash) {
  const urlObj = new URL(url);
  const queryString = urlObj.search.slice(1);

  const rawParams = {};
  for (const pair of queryString.split('&')) {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.substring(0, idx);
      const value = pair.substring(idx + 1);
      if (key.startsWith('vnp_')) {
        rawParams[key] = value;
      }
    }
  }

  delete rawParams['vnp_SecureHash'];
  delete rawParams['vnp_SecureHashType'];

  const sorted = sortObject(rawParams);

  const signData = Object.keys(sorted)
    .map((key) => `${key}=${sorted[key]}`)
    .join('&');

  const signed = crypto
    .createHmac('sha512', VNPAY_HASH_SECRET)
    .update(signData, 'utf-8')
    .digest('hex');

  return signed === secureHash;
}

function vnpayResponse(code, message) {
  return NextResponse.json(
    { RspCode: String(code).padStart(2, '0'), Message: message },
    { status: 200 }
  );
}

export async function GET(request) {
  try {
    if (!VNPAY_HASH_SECRET) {
      console.error('[IPN] Missing VNPAY_HASH_SECRET');
      return vnpayResponse('99', 'Config error');
    }

    const { searchParams } = new URL(request.url);

    const vnpParams = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('vnp_')) {
        vnpParams[key] = value;
      }
    }

    const txnRef = vnpParams.vnp_TxnRef;
    const secureHash = vnpParams.vnp_SecureHash;
    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionStatus = vnpParams.vnp_TransactionStatus;
    const transactionNo = vnpParams.vnp_TransactionNo;
    const amount = Number(vnpParams.vnp_Amount) / 100;

    if (!txnRef || !secureHash) {
      console.error('[IPN] Missing params');
      return vnpayResponse('99', 'Missing Parameters');
    }

    // Verify signature
    if (!verifyVNPaySignature(request.url, secureHash)) {
      console.error('[IPN] Invalid signature for txnRef:', txnRef);
      return vnpayResponse('97', 'Invalid signature');
    }

    // Look up order in Supabase
    const payment = await getPaymentByOrderId(txnRef);

    if (!payment) {
      console.log('[IPN] Order not found in DB, confirming anyway:', txnRef);
      return vnpayResponse('00', 'Confirm Success');
    }

    if (payment.status === 'completed') {
      return vnpayResponse('02', 'Order already confirmed');
    }

    if (Number(payment.amount) !== Number(amount)) {
      console.error('[IPN] Amount mismatch:', {
        expected: payment.amount,
        received: amount,
      });
      return vnpayResponse('04', 'Invalid amount');
    }

    if (responseCode === '00' && transactionStatus === '00') {
      // Payment succeeded - update payment record
      await updatePaymentStatus(txnRef, 'completed', {
        vnp_transaction_no: transactionNo,
        vnp_pay_date: vnpParams.vnp_PayDate,
        vnp_bank_code: vnpParams.vnp_BankCode,
        vnp_card_type: vnpParams.vnp_CardType,
        vnp_response_code: responseCode,
      });

      // Update user plan — always 'pro', duration depends on cycle
      const expiresAt = new Date();
      const isYearly = payment.cycle === 'yearly';
      if (isYearly) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await updateUserPlan(payment.user_id, 'pro', expiresAt.toISOString());

      console.log('[IPN] Payment completed:', txnRef);
    } else {
      // Payment failed
      await updatePaymentStatus(txnRef, 'failed', {
        vnp_response_code: responseCode,
      });

      console.log('[IPN] Payment failed:', txnRef, responseCode);
    }

    return vnpayResponse('00', 'Confirm Success');
  } catch (error) {
    console.error('[IPN] Error:', error);
    return vnpayResponse('99', 'Unknown error');
  }
}
