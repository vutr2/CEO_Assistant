'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight, Clock, Shield, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function BillingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [userPlan, setUserPlan] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    fetch('/api/user/plan', {
      headers: { 'x-user-id': user.userId },
    })
      .then((r) => r.json())
      .then((d) => {
        setUserPlan(d.plan);
        setDaysLeft(d.daysLeft);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const monthlyPrice = 199000;
  const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% off yearly
  const displayPrice = billingCycle === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice;

  const features = [
    'Kết nối Google Sheets không giới hạn',
    'Đọc tất cả tab & cột động',
    'Dashboard phân tích tổng quan',
    'Biểu đồ doanh thu, chi phí, kho hàng',
    'AI Chat hỏi về dữ liệu kinh doanh',
    'Cảnh báo thông minh',
    'Đồng bộ tự động theo lịch',
    'Export báo cáo PDF/Excel',
    'Hỗ trợ qua email ưu tiên',
  ];

  const handleUpgrade = () => {
    window.location.href = `/checkout?plan=pro&cycle=${billingCycle}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Nâng cấp tài khoản</h1>
              <p className="text-sm text-[#6b6b80]">Mở khóa toàn bộ tính năng CEO Dashboard</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all"
            >
              ← Quay lại Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trial Status Banner */}
        {!loading && userPlan === 'trial' && daysLeft !== null && (
          <div className="mb-10 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">
              Bạn đang trong thời gian dùng thử.{' '}
              <strong className="text-amber-200">Còn {daysLeft} ngày</strong> trước khi tài khoản bị khóa.
            </p>
          </div>
        )}
        {!loading && userPlan === 'expired' && (
          <div className="mb-10 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">
              Tài khoản của bạn đã hết hạn. Nâng cấp ngay để tiếp tục sử dụng.
            </p>
          </div>
        )}
        {!loading && userPlan === 'pro' && (
          <div className="mb-10 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center space-x-3">
            <Star className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">
              Bạn đang sử dụng gói <strong>Pro</strong>. Cảm ơn bạn đã tin dùng CEO Dashboard!
            </p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Dùng thử 7 ngày miễn phí
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Một gói. Toàn bộ tính năng.
          </h2>
          <p className="text-[#a0a0b8] text-lg">
            Không có gói Free hay Enterprise. Chỉ có Pro — với đầy đủ mọi công cụ bạn cần.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                billingCycle === 'monthly'
                  ? 'bg-[#d4af37] text-[#0a0a0f]'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all text-sm relative ${
                billingCycle === 'yearly'
                  ? 'bg-[#d4af37] text-[#0a0a0f]'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              Hàng năm
              <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card — centered, single plan */}
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl p-8 card-luxury border-2 border-[#d4af37] shadow-2xl shadow-[#d4af37]/20">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-bold text-sm rounded-full whitespace-nowrap">
              ✦ CEO PRO
            </div>

            {/* Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-[#0a0a0f]" />
            </div>

            {/* Price */}
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-5xl font-display font-bold text-white">
                  {displayPrice.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[#6b6b80] ml-2">/tháng</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-green-400 text-sm mt-1">
                  Thanh toán {yearlyPrice.toLocaleString('vi-VN')}₫/năm — tiết kiệm{' '}
                  {(monthlyPrice * 12 * 0.2).toLocaleString('vi-VN')}₫
                </p>
              )}
              {billingCycle === 'monthly' && (
                <p className="text-[#6b6b80] text-sm mt-1">
                  Hoặc {Math.round(yearlyPrice / 12).toLocaleString('vi-VN')}₫/tháng khi trả năm (tiết kiệm 20%)
                </p>
              )}
            </div>

            {/* Trial note */}
            <div className="flex items-center space-x-2 text-[#d4af37] text-sm mb-6 mt-3 p-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Dùng thử <strong>7 ngày miễn phí</strong> khi đăng ký mới — không cần thẻ</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm">
                  <Check className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <span className="text-white">{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            {userPlan === 'pro' ? (
              <div className="w-full py-3 rounded-lg font-semibold text-center bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6b80] cursor-default">
                Bạn đang dùng gói này ✓
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] hover:shadow-xl hover:shadow-[#d4af37]/40 hover:scale-[1.02]"
              >
                <span>{userPlan === 'trial' || userPlan === 'expired' ? 'Nâng cấp ngay' : 'Bắt đầu dùng thử'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h3 className="text-2xl font-display font-bold text-white text-center mb-8">
            Câu hỏi thường gặp
          </h3>
          <div className="space-y-4">
            {[
              {
                q: '7 ngày dùng thử hoạt động như thế nào?',
                a: 'Khi đăng ký tài khoản mới, bạn được dùng thử toàn bộ tính năng Pro trong 7 ngày. Không cần thẻ tín dụng hay thanh toán trước.',
              },
              {
                q: 'Sau 7 ngày nếu tôi không nâng cấp thì sao?',
                a: 'Tài khoản sẽ bị khóa và bạn không thể truy cập dashboard. Dữ liệu của bạn vẫn được giữ nguyên. Nâng cấp bất kỳ lúc nào để mở khóa.',
              },
              {
                q: 'Phương thức thanh toán nào được chấp nhận?',
                a: 'Chúng tôi chấp nhận thanh toán qua VNPay: thẻ ATM nội địa, thẻ tín dụng Visa/Mastercard, ví MoMo, ZaloPay.',
              },
              {
                q: 'Tôi có thể hủy bất cứ lúc nào không?',
                a: 'Có. Bạn có thể hủy bất kỳ lúc nào mà không mất phí. Gói Pro sẽ còn hiệu lực đến hết chu kỳ đã thanh toán.',
              },
            ].map((faq, i) => (
              <div key={i} className="card-luxury rounded-xl p-6">
                <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                <p className="text-[#a0a0b8] text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center mt-12 pt-12 border-t border-[#2a2a3e]">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[#6b6b80] text-sm">
            {['Bảo mật SSL 256-bit', 'Thanh toán qua VNPay', 'Dữ liệu được mã hóa', 'Hỗ trợ qua email'].map(
              (t) => (
                <div key={t} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#d4af37]" />
                  <span>{t}</span>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
