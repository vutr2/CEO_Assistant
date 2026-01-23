'use client'
import React, { useState} from 'react';
import {Mail, ArrowLeft, CheckCircle, Shield, Clock, Smartphone} from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async () => {
        setError('');

        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }

        if (!validateEmail(email)) {
            setError("Email khong hop le")
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            console.log('Reset password for', email)
            setIsLoading(false);
            setIsSubmitted(true);

        }, 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter'){
            handleSubmit();
        }
    };

    const handleResend = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert('Email da dc gui lai');
        }, 1500);
    };


    if (!isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Back Button */}
                    <a
                        href="/login"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại đăng nhập
                    </a>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center transform rotate-3">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Quên mật khẩu?
                            </h1>
                            <p className="text-gray-600">
                                Nhập email của bạn để nhận link đặt lại mật khẩu
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="your.email@example.com"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <span className="w-4 h-4 mr-1">⚠️</span>
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang gửi...
                                    </div>
                                ) : (
                                    'Gửi link đặt lại mật khẩu'
                                )}
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">Lưu ý:</p>
                                    <p className="text-blue-700">
                                        Link đặt lại mật khẩu sẽ hết hạn sau 24 giờ. Vui lòng kiểm tra cả hộp thư spam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Cần hỗ trợ?{' '}
                        <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                            Liên hệ với chúng tôi
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // Success State
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Kiểm tra email của bạn
                        </h1>
                        <p className="text-gray-600">
                            Chúng tôi đã gửi link đặt lại mật khẩu đến
                        </p>
                        <p className="text-blue-600 font-medium mt-2">
                            {email}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 font-bold text-sm">1</span>
                            </div>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">Mở email</p>
                                <p className="text-gray-600">Kiểm tra hộp thư đến (và cả spam nếu cần)</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 font-bold text-sm">2</span>
                            </div>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">Nhấp vào link</p>
                                <p className="text-gray-600">Link sẽ đưa bạn đến trang đặt lại mật khẩu</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 font-bold text-sm">3</span>
                            </div>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">Tạo mật khẩu mới</p>
                                <p className="text-gray-600">Chọn một mật khẩu mạnh và an toàn</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleResend}
                            disabled={isLoading}
                            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Đang gửi lại...
                                </div>
                            ) : (
                                'Gửi lại email'
                            )}
                        </button>

                        <a
                            href="/login"
                            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-center"
                        >
                            Quay lại đăng nhập
                        </a>
                    </div>

                    {/* Support Info */}
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <div className="flex items-start space-x-3">
                            <SmartPhone className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-900">
                                <p className="font-medium mb-1">Không nhận được email?</p>
                                <p className="text-yellow-700">
                                    Kiểm tra địa chỉ email, thư mục spam hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Cần hỗ trợ?{' '}
                    <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                        Liên hệ với chúng tôi
                    </a>
                </div>
            </div>
        </div>
    );
}