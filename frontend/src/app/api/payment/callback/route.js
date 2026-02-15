import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  getPaymentByOrderId,
  updateUserPlan,
  getServerSupabase,
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

export async function GET(request) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { searchParams } = new URL(request.url);
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');
    const txnRef = searchParams.get('vnp_TxnRef');
    const secureHash = searchParams.get('vnp_SecureHash');
    const transactionNo = searchParams.get('vnp_TransactionNo');

    // Verify signature & process payment
    console.log('[Callback] txnRef:', txnRef, 'responseCode:', responseCode, 'transactionStatus:', transactionStatus);

    const signatureValid = secureHash && verifyVNPaySignature(request.url, secureHash);
    console.log('[Callback] Signature valid:', signatureValid);

    if (signatureValid && responseCode === '00' && transactionStatus === '00') {
      try {
        const payment = await getPaymentByOrderId(txnRef);
        console.log('[Callback] Payment found:', payment ? `id=${payment.id}, status=${payment.status}, user_id=${payment.user_id}, cycle=${payment.cycle}` : 'NULL');

        if (payment && payment.status !== 'completed') {
          const db = getServerSupabase();

          // Step 1: Update payment status to completed (only status column)
          const { error: updateErr } = await db
            .from('payments')
            .update({ status: 'completed' })
            .eq('order_id', txnRef);

          if (updateErr) {
            console.error('[Callback] Update payment status error:', updateErr.message);
          } else {
            console.log('[Callback] Payment status updated to completed');
          }

          // Step 2: Try to save transaction no (may fail if column missing — that's OK)
          try {
            await db
              .from('payments')
              .update({ vnp_transaction_no: transactionNo })
              .eq('order_id', txnRef);
          } catch (_) {
            // Column may not exist, ignore
          }

          // Step 3: Update user plan
          const expiresAt = new Date();
          if (payment.cycle === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
          }

          const planResult = await updateUserPlan(payment.user_id, 'pro', expiresAt.toISOString());
          console.log('[Callback] Plan updated to pro, expires:', expiresAt.toISOString(), 'result:', planResult);
        }
      } catch (dbErr) {
        console.error('[Callback] DB error:', dbErr.message, dbErr.stack);
      }
    } else if (signatureValid && responseCode !== '00') {
      try {
        const db = getServerSupabase();
        await db.from('payments').update({ status: 'failed' }).eq('order_id', txnRef);
        console.log('[Callback] Payment marked as failed:', txnRef);
      } catch (dbErr) {
        console.error('[Callback] DB error:', dbErr.message);
      }
    }

    // Redirect user to result page
    if (responseCode === '00') {
      return NextResponse.redirect(
        `${APP_URL}/payment/callback?status=success&txnRef=${txnRef}`
      );
    }

    const errorMessages = {
      '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ',
      '09': 'Thẻ/Tài khoản chưa đăng ký InternetBanking',
      10: 'Xác thực thông tin thẻ không đúng quá 3 lần',
      11: 'Đã hết hạn chờ thanh toán',
      12: 'Thẻ/Tài khoản bị khóa',
      13: 'Mật khẩu OTP không chính xác',
      24: 'Giao dịch đã bị hủy',
      51: 'Tài khoản không đủ số dư',
      65: 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      75: 'Ngân hàng thanh toán đang bảo trì',
      79: 'Nhập sai mật khẩu quá số lần quy định',
      99: 'Lỗi không xác định',
    };

    const errorMessage = errorMessages[responseCode] || 'Thanh toán thất bại';
    return NextResponse.redirect(
      `${APP_URL}/payment/callback?status=failed&message=${encodeURIComponent(errorMessage)}`
    );
  } catch (error) {
    console.error('[Callback] Error:', error);
    return NextResponse.redirect(
      `${APP_URL}/payment/callback?status=error&message=${encodeURIComponent('Lỗi hệ thống')}`
    );
  }
}
