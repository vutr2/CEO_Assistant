'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const txnRef = searchParams.get('txnRef');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="card-luxury rounded-2xl p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          ) : isError ? (
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-orange-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-display font-bold text-white mb-3">
          {isSuccess
            ? 'Thanh toán thành công!'
            : isError
              ? 'Lỗi hệ thống'
              : 'Thanh toán thất bại'}
        </h1>

        {/* Message */}
        <p className="text-[#a0a0b8] mb-2">
          {isSuccess
            ? 'Gói của bạn đã được kích hoạt. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ!'
            : message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
        </p>

        {/* Transaction ID */}
        {txnRef && (
          <p className="text-[#6b6b80] text-sm mb-8">
            Mã giao dịch: <span className="font-mono text-white">{txnRef}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all text-center"
          >
            Về Dashboard
          </Link>
          {!isSuccess && (
            <Link
              href="/billing"
              className="w-full py-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white font-semibold hover:bg-[#2a2a3e] transition-all text-center"
            >
              Thử lại
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d4af37]"></div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
