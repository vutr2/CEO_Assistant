'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  CreditCard,
  ArrowLeft,
  Loader2,
  Zap,
  Check,
} from 'lucide-react';

const plans = {
  pro: {
    name: 'CEO Pro',
    icon: Zap,
    color: 'from-[#d4af37] to-[#c19a6b]',
    monthly: 199000,
    yearly: Math.round(199000 * 12 * 0.8),
    features: [
      'Ket noi Google Sheets khong gioi han',
      'Doc tat ca tab & cot dong',
      'Dashboard phan tich tong quan',
      'AI Chat hoi ve du lieu kinh doanh',
      'Canh bao thong minh',
      'Export bao cao PDF/Excel',
    ],
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const planId = searchParams.get('plan') || 'pro';
  const cycle = searchParams.get('cycle') || 'monthly';
  const plan = plans[planId];

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e] flex items-center justify-center p-4">
        <div className="card-luxury rounded-2xl p-10 text-center">
          <p className="text-white text-xl mb-4">Gói không tồn tại</p>
          <Link href="/billing" className="text-[#d4af37] hover:underline">
            ← Quay lại bảng giá
          </Link>
        </div>
      </div>
    );
  }

  const amount = cycle === 'yearly' ? plan.yearly : plan.monthly;
  const PlanIcon = plan.icon;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          planId,
          cycle,
          userId: user?.userId || 'anonymous',
          userEmail: user?.email || 'unknown',
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'Không thể tạo đơn thanh toán');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                Thanh toán
              </h1>
              <p className="text-sm text-[#6b6b80]">Xác nhận và thanh toán</p>
            </div>
            <Link
              href="/billing"
              className="px-4 py-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="card-luxury rounded-2xl p-8">
            <h2 className="text-xl font-display font-bold text-white mb-6">
              Tóm tắt đơn hàng
            </h2>

            {/* Plan Info */}
            <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-[#2a2a3e]">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}
              >
                <PlanIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {plan.name}
                </h3>
                <p className="text-[#a0a0b8] text-sm">
                  {cycle === 'yearly' ? 'Thanh toán hàng năm' : 'Thanh toán hàng tháng'}
                </p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6 pb-6 border-b border-[#2a2a3e]">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                  <span className="text-[#a0a0b8] text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-[#a0a0b8]">
                <span>Gói {plan.name}</span>
                <span>{amount.toLocaleString('vi-VN')}₫</span>
              </div>
              {cycle === 'yearly' && (
                <div className="flex justify-between text-green-400 text-sm">
                  <span>Tiết kiệm 20%</span>
                  <span>
                    -{((plan.monthly * 12) - plan.yearly).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-[#2a2a3e]">
                <span>Tổng cộng</span>
                <span className="text-[#d4af37]">
                  {amount.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card-luxury rounded-2xl p-8">
            <h2 className="text-xl font-display font-bold text-white mb-6">
              Phương thức thanh toán
            </h2>

            {/* User Info */}
            <div className="p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] mb-6">
              <p className="text-[#6b6b80] text-sm mb-1">Tài khoản</p>
              <p className="text-white font-medium">
                {user?.email || 'Chưa đăng nhập'}
              </p>
            </div>

            {/* VNPay */}
            <div className="p-4 rounded-lg bg-[#1a1a2e] border-2 border-[#d4af37] mb-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-[#d4af37]" />
                <div>
                  <p className="text-white font-semibold">VNPay</p>
                  <p className="text-[#6b6b80] text-sm">
                    ATM, Visa, MasterCard, JCB, Ví QR Pay
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-bold text-lg hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Thanh toán {amount.toLocaleString('vi-VN')}₫</span>
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="flex items-center space-x-2 mt-6 text-[#6b6b80] text-sm justify-center">
              <Shield className="w-4 h-4" />
              <span>Thanh toán được bảo mật bởi VNPay</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d4af37]"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
