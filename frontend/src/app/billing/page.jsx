'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X as XIcon, Zap, ArrowRight, Shield, Star, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function BillingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [userPlan, setUserPlan] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    fetch('/api/user/plan', {
      headers: { 'x-user-id': user.userId },
    })
      .then((r) => r.json())
      .then((d) => {
        setUserPlan(d.plan);
        setDaysLeft(d.daysLeft);
        setCancelled(d.cancelled || false);
        setExpiresAt(d.expiresAt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const monthlyPrice = 199000;
  const yearlyPrice = monthlyPrice * 12 * 0.8;
  const displayPrice = billingCycle === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice;

  const freeFeatures = [
    { text: 'Dashboard phân tích tổng quan', included: true },
    { text: 'Kết nối Google Sheets', included: true },
    { text: 'Biểu đồ doanh thu, chi phí', included: true },
    { text: 'Đồng bộ dữ liệu thủ công', included: true },
    { text: 'AI Chat hỏi về dữ liệu', included: false },
    { text: 'Cảnh báo thông minh', included: false },
    { text: 'Export báo cáo PDF/Excel', included: false },
    { text: 'Hỗ trợ qua email ưu tiên', included: false },
  ];

  const proFeatures = [
    { text: 'Tất cả tính năng Free', included: true },
    { text: 'AI Chat hỏi về dữ liệu kinh doanh', included: true },
    { text: 'Cảnh báo thông minh tự động', included: true },
    { text: 'Export báo cáo PDF/Excel', included: true },
    { text: 'Đồng bộ tự động theo lịch', included: true },
    { text: 'Hỗ trợ qua email ưu tiên', included: true },
  ];

  const handleUpgrade = () => {
    window.location.href = `/checkout?plan=pro&cycle=${billingCycle}`;
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/user/cancel', {
        method: 'POST',
        headers: { 'x-user-id': user.userId },
      });
      const data = await res.json();
      if (data.success) {
        setCancelled(true);
        setExpiresAt(data.expiresAt);
        setShowCancelConfirm(false);
      }
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isPro = userPlan === 'pro';
  const isFree = userPlan === 'free' || !userPlan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Gói dịch vụ</h1>
              <p className="text-sm text-[#6b6b80]">Chọn gói phù hợp với nhu cầu của bạn</p>
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
        {/* Status Banners */}
        {!loading && isPro && !cancelled && (
          <div className="mb-10 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center space-x-3">
            <Star className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300 text-sm">
              Bạn đang sử dụng gói <strong>Pro</strong>.
              {expiresAt && <> Còn hiệu lực đến <strong>{formatDate(expiresAt)}</strong>.</>}
            </p>
          </div>
        )}
        {!loading && isPro && cancelled && (
          <div className="mb-10 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-sm">
              Bạn đã hủy gói Pro. Vẫn sử dụng được đến <strong>{formatDate(expiresAt)}</strong>, sau đó sẽ chuyển về gói Free.
            </p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Chọn gói phù hợp
          </h2>
          <p className="text-[#a0a0b8] text-lg">
            Bắt đầu miễn phí. Nâng cấp Pro khi cần AI Chat và tính năng nâng cao.
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative rounded-2xl p-8 card-luxury border border-[#2a2a3e]">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6b6b80] to-[#4b4b60] flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-2xl font-display font-bold text-white mb-1">Free</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-display font-bold text-white">0₫</span>
              <span className="text-[#6b6b80] ml-2">/mãi mãi</span>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm">
                  {f.included ? (
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XIcon className="w-5 h-5 text-[#4b4b60] flex-shrink-0 mt-0.5" />
                  )}
                  <span className={f.included ? 'text-white' : 'text-[#6b6b80]'}>{f.text}</span>
                </li>
              ))}
            </ul>

            {isFree ? (
              <div className="w-full py-3 rounded-lg font-semibold text-center bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6b80] cursor-default">
                Đang dùng
              </div>
            ) : (
              <div className="w-full py-3 rounded-lg font-semibold text-center bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6b80] cursor-default">
                Gói cơ bản
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl p-8 card-luxury border-2 border-[#d4af37] shadow-2xl shadow-[#d4af37]/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-bold text-sm rounded-full whitespace-nowrap">
              CEO PRO
            </div>

            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center mb-6">
              <Crown className="w-7 h-7 text-[#0a0a0f]" />
            </div>

            <h3 className="text-2xl font-display font-bold text-white mb-1">Pro</h3>
            <div className="mb-2">
              <div className="flex items-baseline">
                <span className="text-4xl font-display font-bold text-white">
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
                  Hoặc {Math.round(yearlyPrice / 12).toLocaleString('vi-VN')}₫/tháng khi trả năm
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8 mt-6">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm">
                  <Check className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <span className="text-white">{f.text}</span>
                </li>
              ))}
            </ul>

            {isPro && !cancelled ? (
              <div className="space-y-3">
                <div className="w-full py-3 rounded-lg font-semibold text-center bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6b80] cursor-default">
                  Đang dùng
                </div>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-2 rounded-lg text-sm text-[#6b6b80] hover:text-red-400 transition-all"
                >
                  Hủy gói
                </button>
              </div>
            ) : isPro && cancelled ? (
              <div className="w-full py-3 rounded-lg font-semibold text-center bg-amber-500/10 border border-amber-500/30 text-amber-300 cursor-default text-sm">
                Đã hủy — còn dùng đến {formatDate(expiresAt)}
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] hover:shadow-xl hover:shadow-[#d4af37]/40 hover:scale-[1.02]"
              >
                <span>Nâng cấp ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="card-luxury rounded-2xl p-8 max-w-md w-full mx-4 border border-[#2a2a3e]">
              <h3 className="text-xl font-display font-bold text-white mb-3">Xác nhận hủy gói Pro</h3>
              <p className="text-[#a0a0b8] text-sm mb-2">
                Bạn sẽ vẫn sử dụng được gói Pro đến hết ngày <strong className="text-white">{formatDate(expiresAt)}</strong>.
              </p>
              <p className="text-[#a0a0b8] text-sm mb-6">
                Sau đó tài khoản sẽ chuyển về gói Free. Bạn có thể nâng cấp lại bất kỳ lúc nào.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 rounded-lg font-semibold bg-[#1a1a2e] border border-[#2a2a3e] text-white hover:bg-[#2a2a3e] transition-all"
                >
                  Giữ gói Pro
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-lg font-semibold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h3 className="text-2xl font-display font-bold text-white text-center mb-8">
            Câu hỏi thường gặp
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Gói Free bao gồm những gì?',
                a: 'Gói Free cho phép bạn kết nối Google Sheets, xem dashboard tổng quan và biểu đồ. Bạn không thể sử dụng AI Chat, cảnh báo thông minh hay export báo cáo.',
              },
              {
                q: 'Tôi có thể hủy gói Pro bất cứ lúc nào không?',
                a: 'Có. Bạn có thể hủy bất kỳ lúc nào. Gói Pro vẫn hoạt động đến hết chu kỳ đã thanh toán, sau đó tự động chuyển về Free.',
              },
              {
                q: 'Phương thức thanh toán nào được chấp nhận?',
                a: 'Chúng tôi chấp nhận thanh toán qua VNPay: thẻ ATM nội địa, thẻ tín dụng Visa/Mastercard, ví MoMo, ZaloPay.',
              },
              {
                q: 'Dữ liệu có bị mất khi chuyển về Free không?',
                a: 'Không. Toàn bộ dữ liệu của bạn vẫn được giữ nguyên. Bạn chỉ không thể sử dụng AI Chat và các tính năng Pro.',
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
