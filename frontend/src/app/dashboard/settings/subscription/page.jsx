'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Check, Crown, Sparkles, TrendingUp, Users, Database, HeadphonesIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const plans = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    period: 'tháng',
    description: 'Dùng thử các tính năng cơ bản',
    icon: Sparkles,
    color: 'gray',
    features: [
      { name: '5 người dùng', included: true },
      { name: '10 GB lưu trữ', included: true },
      { name: 'Báo cáo cơ bản', included: true },
      { name: 'Trợ lý AI (100 câu hỏi/tháng)', included: true },
      { name: 'Hỗ trợ email', included: true },
      { name: 'Báo cáo nâng cao', included: false },
      { name: 'Phân tích dự đoán', included: false },
      { name: 'Hỗ trợ ưu tiên', included: false },
      { name: 'API tích hợp', included: false }
    ],
    limitations: [
      'Giới hạn 100 câu hỏi AI/tháng',
      'Lưu trữ dữ liệu 30 ngày',
      'Không có API access'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1500000,
    period: 'tháng',
    description: 'Cho các công ty vừa và nhỏ',
    icon: TrendingUp,
    color: 'blue',
    popular: true,
    features: [
      { name: '20 người dùng', included: true },
      { name: '100 GB lưu trữ', included: true },
      { name: 'Báo cáo nâng cao', included: true },
      { name: 'Trợ lý AI (1000 câu hỏi/tháng)', included: true },
      { name: 'Phân tích dự đoán', included: true },
      { name: 'Hỗ trợ ưu tiên', included: true },
      { name: 'API tích hợp', included: true },
      { name: 'Tùy chỉnh báo cáo', included: true },
      { name: 'Export dữ liệu không giới hạn', included: true }
    ],
    limitations: []
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2500000,
    period: 'tháng',
    description: 'Giải pháp toàn diện cho doanh nghiệp',
    icon: Crown,
    color: 'purple',
    current: true,
    features: [
      { name: 'Không giới hạn người dùng', included: true },
      { name: '500 GB lưu trữ', included: true },
      { name: 'Tất cả tính năng Professional', included: true },
      { name: 'Trợ lý AI không giới hạn', included: true },
      { name: 'AI tùy chỉnh theo ngành', included: true },
      { name: 'Hỗ trợ 24/7', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'White-label option', included: true },
      { name: 'SLA 99.9%', included: true }
    ],
    limitations: []
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'tùy chỉnh',
    description: 'Giải pháp tùy chỉnh cho tập đoàn',
    icon: Users,
    color: 'gold',
    features: [
      { name: 'Tất cả tính năng Premium', included: true },
      { name: 'Lưu trữ không giới hạn', included: true },
      { name: 'Triển khai on-premise', included: true },
      { name: 'Tùy chỉnh hoàn toàn', included: true },
      { name: 'Security & compliance', included: true },
      { name: 'Training & onboarding', included: true },
      { name: 'Dedicated infrastructure', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'SLA tùy chỉnh', included: true }
    ],
    limitations: []
  }
];

const addons = [
  {
    id: 'storage',
    name: 'Lưu trữ bổ sung',
    description: 'Thêm 100GB lưu trữ',
    price: 200000,
    icon: Database
  },
  {
    id: 'ai-queries',
    name: 'Câu hỏi AI bổ sung',
    description: 'Thêm 500 câu hỏi AI/tháng',
    price: 300000,
    icon: Sparkles
  },
  {
    id: 'support',
    name: 'Hỗ trợ ưu tiên',
    description: 'Hỗ trợ 24/7 qua phone & chat',
    price: 500000,
    icon: HeadphonesIcon
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedAddons, setSelectedAddons] = useState([]);

  const currentPlan = plans.find(p => p.current);

  const formatCurrency = (amount) => {
    if (!amount) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleUpgrade = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan?.price) {
      alert('Vui lòng liên hệ với chúng tôi để được tư vấn gói Enterprise');
      return;
    }
    // Chuyển đến trang thanh toán với plan được chọn
    router.push(`/payment?plan=${planId}`);
  };

  const handleToggleAddon = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const planPrice = currentPlan?.price || 0;
    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return planPrice + addonsTotal;
  };

  const handleUpdateSubscription = () => {
    if (selectedAddons.length === 0) {
      alert('Vui lòng chọn ít nhất một tiện ích bổ sung');
      return;
    }

    const addonNames = selectedAddons.map(id => addons.find(a => a.id === id)?.name).join(', ');
    alert(`Đã cập nhật gói đăng ký với các tiện ích:\n${addonNames}\n\nTổng cộng: ${formatCurrency(calculateTotal())}/tháng`);

    // Reset selected addons after update
    setSelectedAddons([]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Crown className="text-purple-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gói đăng ký</h2>
            <p className="text-sm text-gray-600">Chọn gói phù hợp với nhu cầu của bạn</p>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">Gói hiện tại</p>
            <h3 className="text-3xl font-bold mb-2">{currentPlan?.name}</h3>
            <p className="text-lg">
              {formatCurrency(currentPlan?.price)}
              {currentPlan?.price && `/${currentPlan?.period}`}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="success" className="bg-white text-green-600 mb-2">Đang hoạt động</Badge>
            <p className="text-sm text-purple-100">Gia hạn: 01/02/2024</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-purple-400">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-purple-100 mb-1">Người dùng</p>
              <p className="font-semibold">15 / Không giới hạn</p>
            </div>
            <div>
              <p className="text-purple-100 mb-1">Lưu trữ</p>
              <p className="font-semibold">127 GB / 500 GB</p>
            </div>
            <div>
              <p className="text-purple-100 mb-1">Câu hỏi AI tháng này</p>
              <p className="font-semibold">2,341 / Không giới hạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hàng tháng
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hàng năm
            <Badge variant="success" size="sm" className="ml-2">Tiết kiệm 20%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.current;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-2 transition hover:shadow-lg ${
                isCurrent
                  ? 'border-purple-500 ring-2 ring-purple-200'
                  : plan.popular
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
            >
              {/* Plan Header */}
              <div className="text-center mb-6">
                {plan.popular && (
                  <Badge variant="primary" className="mb-3">Phổ biến nhất</Badge>
                )}
                {isCurrent && (
                  <Badge variant="success" className="mb-3">Gói hiện tại</Badge>
                )}

                <div className={`w-16 h-16 mx-auto mb-4 bg-${plan.color}-100 rounded-full flex items-center justify-center`}>
                  <Icon className={`text-${plan.color}-600`} size={28} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price ? formatCurrency(plan.price) : 'Liên hệ'}
                  </span>
                  {plan.price && (
                    <span className="text-gray-600">/{plan.period}</span>
                  )}
                </div>

                {billingCycle === 'yearly' && plan.price && (
                  <p className="text-sm text-green-600 font-medium">
                    Tiết kiệm {formatCurrency(plan.price * 12 * 0.2)}/năm
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${
                        feature.included ? 'text-green-600' : 'text-gray-300'
                      }`}
                    />
                    <span className={`text-sm ${
                      feature.included ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                variant={isCurrent ? 'outline' : plan.popular ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent}
              >
                {isCurrent ? 'Gói hiện tại' : plan.price ? 'Nâng cấp' : 'Liên hệ'}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tiện ích bổ sung</h3>
        <p className="text-sm text-gray-600 mb-6">
          Mở rộng gói đăng ký của bạn với các tính năng bổ sung
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addons.map((addon) => {
            const Icon = addon.icon;
            const isSelected = selectedAddons.includes(addon.id);

            return (
              <label
                key={addon.id}
                className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleAddon(addon.id)}
                  className="sr-only"
                />

                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={isSelected ? 'text-blue-600' : 'text-gray-600'} size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{addon.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="text-blue-600" size={20} />
                  )}
                </div>

                <p className="text-lg font-bold text-gray-900 mt-auto">
                  +{formatCurrency(addon.price)}
                </p>
              </label>
            );
          })}
        </div>

        {selectedAddons.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Tổng cộng hàng tháng:</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
            <Button variant="primary" className="w-full" onClick={handleUpdateSubscription}>
              Cập nhật gói đăng ký
            </Button>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tôi có thể hủy bất cứ lúc nào không?</h4>
            <p className="text-sm text-gray-600">
              Có, bạn có thể hủy đăng ký bất cứ lúc nào. Tài khoản của bạn sẽ được duy trì cho đến hết chu kỳ thanh toán hiện tại.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Chuyển đổi gói như thế nào?</h4>
            <p className="text-sm text-gray-600">
              Bạn có thể nâng cấp hoặc hạ cấp bất cứ lúc nào. Thay đổi sẽ có hiệu lực ngay lập tức và bạn sẽ chỉ thanh toán phần chênh lệch.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Có được hoàn tiền không?</h4>
            <p className="text-sm text-gray-600">
              Chúng tôi cung cấp chính sách hoàn tiền trong 30 ngày đầu tiên nếu bạn không hài lòng với dịch vụ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
