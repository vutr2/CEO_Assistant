'use client'
import React, { useEffect, useState, Suspense } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function VNPayCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get all query parameters
        const params = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // Send to backend for verification
        const queryString = new URLSearchParams(params).toString();

        fetch(`${API_BASE_URL}/payment/vnpay/callback?${queryString}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('success');
                    setPaymentInfo({
                        orderId: data.orderId,
                        amount: data.amount,
                        transactionId: data.transactionId,
                        responseCode: data.responseCode
                    });
                } else {
                    setStatus('failed');
                    setError(data.message || 'Giao dịch thất bại');
                }
            })
            .catch(err => {
                console.error('Callback error:', err);
                setStatus('failed');
                setError('Không thể xác minh giao dịch');
            });
    }, [searchParams]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (status === 'processing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Đang xử lý giao dịch
                    </h1>
                    <p className="text-gray-600">
                        Vui lòng đợi trong giây lát...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle className="w-14 h-14 text-white" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Thanh toán thành công!
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Giao dịch của bạn đã được xử lý thành công
                            </p>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <span className="text-gray-600">Mã giao dịch</span>
                                <span className="font-mono font-semibold text-gray-900">
                                    {paymentInfo?.transactionId}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                <span className="text-gray-600">Mã đơn hàng</span>
                                <span className="font-mono font-semibold text-gray-900">
                                    {paymentInfo?.orderId}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600">Số tiền</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(paymentInfo?.amount)}
                                </span>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Bước tiếp theo
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start">
                                    <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Tài khoản của bạn đã được nâng cấp lên gói Premium</span>
                                </li>
                                <li className="flex items-start">
                                    <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Bạn có thể bắt đầu sử dụng tất cả tính năng cao cấp ngay bây giờ</span>
                                </li>
                                <li className="flex items-start">
                                    <ArrowRight className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Hóa đơn đã được gửi đến email của bạn</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push('/dashboard/overview')}
                                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Về Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/settings/billing')}
                                className="flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Xem hóa đơn
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Cảm ơn bạn đã tin tưởng sử dụng CEO AI Assistant
                    </div>
                </div>
            </div>
        );
    }

    // Failed state
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                            <XCircle className="w-14 h-14 text-white" />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Thanh toán không thành công
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {error || 'Đã có lỗi xảy ra trong quá trình thanh toán'}
                        </p>
                    </div>

                    {/* Error Details */}
                    <div className="bg-red-50 rounded-xl p-6 mb-8 border border-red-100">
                        <h3 className="font-semibold text-red-900 mb-2">
                            Có thể do các nguyên nhân sau:
                        </h3>
                        <ul className="space-y-2 text-sm text-red-800">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Số dư tài khoản không đủ</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Thông tin thẻ không chính xác</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Ngân hàng từ chối giao dịch</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Bạn đã hủy giao dịch</span>
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => router.push('/payment')}
                            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Thử lại
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/overview')}
                            className="flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Về Dashboard
                        </button>
                    </div>
                </div>

                {/* Support */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Cần hỗ trợ?{' '}
                    <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Liên hệ với chúng tôi
                    </a>
                </div>
            </div>
        </div>
    );
}

function VNPayCallbackLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Đang tải...
                </h1>
            </div>
        </div>
    );
}

export default function VNPayCallbackPage() {
    return (
        <Suspense fallback={<VNPayCallbackLoading />}>
            <VNPayCallbackContent />
        </Suspense>
    );
}
