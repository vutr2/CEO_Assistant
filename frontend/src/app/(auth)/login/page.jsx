'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Briefcase, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { saveAuthData } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Call real API
      const response = await authAPI.login(formData.email, formData.password);

      // Save auth data to localStorage
      saveAuthData(response.data);

      // Redirect to dashboard
      router.push('/dashboard/overview');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CEO Assistant
            </h1>
            <p className="text-gray-600">
              Trợ lý AI thông minh cho lãnh đạo doanh nghiệp
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="ceo@congty.vn"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Quên mật khẩu?
              </a>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">hoặc</span>
              </div>
            </div>
          </div>

          {/* SSO Options */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Đăng nhập với Google</span>
            </button>

            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#0078D4">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
              </svg>
              <span className="text-gray-700 font-medium">Đăng nhập với Microsoft</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">
            Quản lý doanh nghiệp thông minh hơn với AI
          </h2>
          <p className="text-blue-100 text-lg mb-12">
            Theo dõi mọi chỉ số quan trọng, nhận thông tin chi tiết tức thì và đưa ra quyết định dựa trên dữ liệu - tất cả ở một nơi.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Theo dõi theo thời gian thực</h3>
                <p className="text-blue-100">
                  Nắm bắt doanh thu, dòng tiền và các chỉ số kinh doanh quan trọng mọi lúc
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Quản lý nhân sự hiệu quả</h3>
                <p className="text-blue-100">
                  Theo dõi hiệu suất làm việc, phát hiện xu hướng và tối ưu đội ngũ
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Trợ lý AI thông minh</h3>
                <p className="text-blue-100">
                  Đặt câu hỏi bất kỳ và nhận phân tích, gợi ý chiến lược từ dữ liệu công ty
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-blue-100">
              "CEO Assistant đã giúp tôi tiết kiệm hơn 15 giờ mỗi tuần và đưa ra quyết định nhanh hơn 3 lần."
            </p>
            <p className="text-sm font-semibold mt-2">
              — Nguyễn Văn A, CEO của TechCorp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}