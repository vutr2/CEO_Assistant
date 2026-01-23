'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { Building2, Smartphone, Check, ArrowLeft, Shield, Zap, Crown, Star, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function PaymentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams.get('plan') || 'premium';

    const [selectedPlan, setSelectedPlan] = useState(planParam);
    const [selectedGateway, setSelectedGateway] = useState('vnpay');
    const [selectedBank, setSelectedBank] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        // Fetch payment plans
        fetch(`${API_BASE_URL}/payment/plans`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPlans(data.plans);
                }
            })
            .catch(err => console.error('Error fetching plans:', err));

        // Fetch VNPay banks
        fetch(`${API_BASE_URL}/payment/vnpay/banks`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBanks(data.banks);
                }
            })
            .catch(err => console.error('Error fetching banks:', err));
    }, []);

    // Update selected plan when URL param changes
    useEffect(() => {
        const planFromUrl = searchParams.get('plan');
        if (planFromUrl && planFromUrl !== selectedPlan) {
            setSelectedPlan(planFromUrl);
        }
    }, [searchParams]);

    // Tìm plan được chọn, nếu không có thì dùng default dựa trên selectedPlan
    const getDefaultPlanData = () => {
        const defaults = {
            'basic': { id: 'basic', name: 'Basic', price: 0, features: [] },
            'premium': { id: 'premium', name: 'Premium', price: 2500000, features: [] },
            'enterprise': { id: 'enterprise', name: 'Enterprise', price: 5000000, features: [] }
        };
        return defaults[selectedPlan] || defaults['premium'];
    };

    const selectedPlanData = plans.find(p => p.id === selectedPlan) || getDefaultPlanData();

    // Debug log
    console.log('Selected Plan:', selectedPlan);
    console.log('Selected Plan Data:', selectedPlanData);
    console.log('Available Plans:', plans);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handlePayment = async () => {
        if (selectedGateway === 'vnpay' && !selectedBank) {
            alert('Vui lòng chọn ngân hàng');
            return;
        }

        setIsLoading(true);

        try {
            // Get auth token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Vui lòng đăng nhập trước khi thanh toán');
                router.push('/login');
                return;
            }

            const endpoint = selectedGateway === 'vnpay'
                ? `${API_BASE_URL}/payment/vnpay/create`
                : `${API_BASE_URL}/payment/momo/create`;

            const payload = selectedGateway === 'vnpay'
                ? {
                    amount: selectedPlanData.price,
                    orderDescription: `Nâng cấp gói ${selectedPlanData.name}`,
                    bankCode: selectedBank,
                    plan: selectedPlan
                  }
                : {
                    amount: selectedPlanData.price,
                    orderInfo: `Nâng cấp gói ${selectedPlanData.name}`,
                    plan: selectedPlan
                  };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success && data.paymentUrl) {
                // Redirect to payment gateway
                window.location.href = data.paymentUrl;
            } else {
                alert(data.message || 'Không thể tạo thanh toán');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Đã xảy ra lỗi khi tạo thanh toán');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Nâng cấp gói dịch vụ
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Chọn gói dịch vụ và phương thức thanh toán phù hợp với bạn
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                            {/* Step 1 */}
                            <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold">
                                    1
                                </div>
                                <span className="ml-3 text-sm font-semibold text-indigo-600">Chọn gói</span>
                            </div>
                            <div className="w-16 h-1 bg-indigo-600"></div>

                            {/* Step 2 */}
                            <div className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${selectedPlan ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'} font-bold`}>
                                    2
                                </div>
                                <span className={`ml-3 text-sm font-semibold ${selectedPlan ? 'text-indigo-600' : 'text-gray-500'}`}>Chọn thanh toán</span>
                            </div>
                            <div className={`w-16 h-1 ${selectedPlan && selectedGateway ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>

                            {/* Step 3 */}
                            <div className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${selectedPlan && selectedGateway && (selectedGateway === 'momo' || selectedBank) ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'} font-bold`}>
                                    3
                                </div>
                                <span className={`ml-3 text-sm font-semibold ${selectedPlan && selectedGateway && (selectedGateway === 'momo' || selectedBank) ? 'text-indigo-600' : 'text-gray-500'}`}>Hoàn tất</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Plan Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plans */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-200 border-dashed">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mr-3 font-bold text-sm">
                                        1
                                    </div>
                                    Chọn gói dịch vụ
                                </h2>
                                {selectedPlan && (
                                    <div className="flex items-center text-green-600 text-sm font-semibold">
                                        <Check className="w-4 h-4 mr-1" />
                                        Đã chọn
                                    </div>
                                )}
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        disabled={plan.price === 0}
                                        className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                                            selectedPlan === plan.id
                                                ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                        } ${plan.price === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {plan.recommended && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    Khuyên dùng
                                                </span>
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                            <div className="mt-2">
                                                <span className="text-3xl font-bold text-indigo-600">
                                                    {formatCurrency(plan.price)}
                                                </span>
                                                <span className="text-gray-600 ml-1">/tháng</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            {plan.features.slice(0, 3).map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {selectedPlan === plan.id && (
                                            <div className="absolute top-4 right-4">
                                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Gateway Selection */}
                        <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 ${selectedPlan ? 'border-indigo-200 border-dashed' : 'border-gray-200 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <div className={`w-8 h-8 rounded-full ${selectedPlan ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'} flex items-center justify-center mr-3 font-bold text-sm`}>
                                        2
                                    </div>
                                    Chọn phương thức thanh toán
                                </h2>
                                {selectedGateway && selectedPlan && (
                                    <div className="flex items-center text-green-600 text-sm font-semibold">
                                        <Check className="w-4 h-4 mr-1" />
                                        Đã chọn
                                    </div>
                                )}
                            </div>

                            {!selectedPlan && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Vui lòng chọn gói dịch vụ ở bước 1 trước</p>
                                </div>
                            )}

                            {selectedPlan && (
                            <>
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <button
                                    onClick={() => setSelectedGateway('vnpay')}
                                    className={`p-6 rounded-xl border-2 transition-all ${
                                        selectedGateway === 'vnpay'
                                            ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                                            : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Building2 className="w-8 h-8 text-indigo-600" />
                                        {selectedGateway === 'vnpay' && (
                                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">VNPay</h3>
                                    <p className="text-sm text-gray-600">
                                        Thanh toán qua ngân hàng, thẻ ATM, thẻ quốc tế
                                    </p>
                                </button>

                                <button
                                    onClick={() => setSelectedGateway('momo')}
                                    className={`p-6 rounded-xl border-2 transition-all ${
                                        selectedGateway === 'momo'
                                            ? 'border-pink-600 bg-pink-50 shadow-lg'
                                            : 'border-gray-200 hover:border-pink-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Smartphone className="w-8 h-8 text-pink-600" />
                                        {selectedGateway === 'momo' && (
                                            <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Momo</h3>
                                    <p className="text-sm text-gray-600">
                                        Thanh toán qua ví điện tử Momo
                                    </p>
                                </button>
                            </div>

                            {/* Bank Selection for VNPay */}
                            {selectedGateway === 'vnpay' && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Chọn ngân hàng
                                    </label>
                                    <select
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">-- Chọn ngân hàng --</option>
                                        {banks.map((bank) => (
                                            <option key={bank.code} value={bank.code}>
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            </>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Tóm tắt đơn hàng
                            </h2>

                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                <div className="flex justify-between text-gray-700">
                                    <span>Gói đăng ký</span>
                                    <span className="font-semibold">{selectedPlanData.name}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Thời gian</span>
                                    <span className="font-semibold">1 tháng</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Phương thức</span>
                                    <span className="font-semibold capitalize">
                                        {selectedGateway === 'vnpay' ? 'VNPay' : 'Momo'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-bold text-indigo-600">
                                    {formatCurrency(selectedPlanData.price)}
                                </span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={!selectedPlan || isLoading || (selectedGateway === 'vnpay' && !selectedBank)}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang xử lý...
                                    </div>
                                ) : !selectedPlan ? (
                                    'Vui lòng chọn gói dịch vụ'
                                ) : (selectedGateway === 'vnpay' && !selectedBank) ? (
                                    'Vui lòng chọn ngân hàng'
                                ) : (
                                    'Thanh toán ngay'
                                )}
                            </button>

                            {!selectedPlan && (
                                <p className="mt-3 text-sm text-amber-600 text-center">
                                    ⚠️ Bạn cần chọn gói dịch vụ ở bước 1 để tiếp tục
                                </p>
                            )}

                            {/* Security Info */}
                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-start space-x-3">
                                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-green-900">
                                        <p className="font-medium mb-1">Thanh toán an toàn</p>
                                        <p className="text-green-700">
                                            Mọi giao dịch được mã hóa và bảo mật bởi VNPay & Momo
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    Tính năng gói {selectedPlanData.name}
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {selectedPlanData.features?.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-600 mb-4">Được tin tưởng bởi hàng ngàn doanh nghiệp</p>
                    <div className="flex justify-center items-center space-x-8 opacity-50">
                        <Shield className="w-8 h-8 text-gray-400" />
                        <Zap className="w-8 h-8 text-gray-400" />
                        <Crown className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentPageLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Đang tải...
                </h1>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<PaymentPageLoading />}>
            <PaymentPageContent />
        </Suspense>
    );
}
