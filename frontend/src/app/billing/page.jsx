'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  X,
} from 'lucide-react';

const pricingPlans = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    period: 'mãi mãi',
    description: 'Dùng thử các tính năng cơ bản',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: '7 ngày dữ liệu', included: true },
      { text: '10 câu hỏi AI/tháng', included: true },
      { text: 'Báo cáo cơ bản', included: true },
      { text: '1 người dùng', included: true },
      { text: 'Biểu đồ thời gian thực', included: false },
      { text: 'Export dữ liệu', included: false },
      { text: 'API access', included: false },
      { text: 'Hỗ trợ ưu tiên', included: false },
    ],
    buttonText: 'Bắt đầu miễn phí',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 299000,
    period: 'tháng',
    description: 'Cho doanh nghiệp nhỏ và vừa',
    icon: Zap,
    color: 'from-blue-500 to-cyan-600',
    features: [
      { text: '90 ngày dữ liệu', included: true },
      { text: '500 câu hỏi AI/tháng', included: true },
      { text: 'Báo cáo nâng cao', included: true },
      { text: '5 người dùng', included: true },
      { text: 'Biểu đồ thời gian thực', included: true },
      { text: 'Export dữ liệu', included: true },
      { text: 'API access', included: false },
      { text: 'Hỗ trợ ưu tiên', included: false },
    ],
    buttonText: 'Nâng cấp ngay',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999000,
    period: 'tháng',
    description: 'Cho doanh nghiệp lớn',
    icon: Crown,
    color: 'from-[#d4af37] to-[#c19a6b]',
    features: [
      { text: 'Dữ liệu không giới hạn', included: true },
      { text: 'AI không giới hạn', included: true },
      { text: 'Báo cáo tùy chỉnh', included: true },
      { text: 'Không giới hạn người dùng', included: true },
      { text: 'Biểu đồ thời gian thực', included: true },
      { text: 'Export dữ liệu', included: true },
      { text: 'API access đầy đủ', included: true },
      { text: 'Hỗ trợ 24/7 ưu tiên', included: true },
    ],
    buttonText: 'Liên hệ tư vấn',
    highlighted: false,
  },
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      // Already on free plan
      return;
    }
    if (planId === 'enterprise') {
      // Contact sales
      window.location.href = 'mailto:sales@ceodashboard.com';
      return;
    }
    // Redirect to checkout
    window.location.href = `/checkout?plan=${planId}&cycle=${billingCycle}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                Bảng giá
              </h1>
              <p className="text-sm text-[#6b6b80]">
                Chọn gói phù hợp với nhu cầu của bạn
              </p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Nâng cấp trải nghiệm của bạn
          </h2>
          <p className="text-[#a0a0b8] text-lg mb-8">
            Chọn gói phù hợp với quy mô doanh nghiệp
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center space-x-2 p-1 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#d4af37] text-[#0a0a0f]'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              Thanh toán hàng tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-[#d4af37] text-[#0a0a0f]'
                  : 'text-[#a0a0b8] hover:text-white'
              }`}
            >
              Thanh toán hàng năm
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => {
            const yearlyPrice =
              billingCycle === 'yearly' ? plan.price * 12 * 0.8 : plan.price;
            const displayPrice =
              billingCycle === 'yearly' ? yearlyPrice / 12 : plan.price;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all hover:scale-105 ${
                  plan.highlighted
                    ? 'card-luxury border-2 border-[#d4af37] shadow-2xl shadow-[#d4af37]/20'
                    : 'card-luxury'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-bold text-sm rounded-full">
                    Phổ biến nhất
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}
                >
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan Info */}
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-[#a0a0b8] mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-display font-bold text-white">
                      {displayPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-[#6b6b80] ml-2">/{plan.period}</span>
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-green-400 text-sm mt-2">
                      Tiết kiệm{' '}
                      {(plan.price * 12 * 0.2).toLocaleString('vi-VN')}₫/năm
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-3 text-sm"
                    >
                      {feature.included ? (
                        <Check className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-[#6b6b80] flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included ? 'text-white' : 'text-[#6b6b80]'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] hover:shadow-xl hover:shadow-[#d4af37]/40'
                      : 'bg-[#1a1a2e] border border-[#2a2a3e] text-white hover:bg-[#2a2a3e]'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-display font-bold text-white text-center mb-8">
            Câu hỏi thường gặp
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Tôi có thể hủy bất cứ lúc nào không?',
                a: 'Có, bạn có thể hủy gói đăng ký bất cứ lúc nào. Không có phí hủy bỏ.',
              },
              {
                q: 'Phương thức thanh toán nào được chấp nhận?',
                a: 'Chúng tôi chấp nhận thanh toán qua VNPay (thẻ ATM, thẻ tín dụng, ví điện tử).',
              },
              {
                q: 'Có được hoàn tiền không?',
                a: 'Có, chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng.',
              },
              {
                q: 'Tôi có thể nâng cấp hoặc hạ cấp gói không?',
                a: 'Có, bạn có thể thay đổi gói bất cứ lúc nào. Phí sẽ được tính theo tỷ lệ.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="card-luxury rounded-xl p-6 hover:border-[#d4af37]/30 transition-all"
              >
                <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                <p className="text-[#a0a0b8]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center mt-12 pt-12 border-t border-[#2a2a3e]">
          <div className="flex items-center justify-center space-x-8 text-[#6b6b80]">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-[#d4af37]" />
              <span>Bảo mật SSL</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-[#d4af37]" />
              <span>Thanh toán an toàn</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-[#d4af37]" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
