'use client'
import React, { useState} from 'react';
import { Eye, EyeOff, Briefcase, CheckCircle, Building2, User, Mail} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { saveAuthData } from '@/lib/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Vui lòng nhập tên công ty';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullname = 'Vui lòng nhập họ tên';
        }

        if (!formData.email.trim()) {
            newErrors.emai = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password  = 'Vui lòng nhập mật khẩu';

        } else if (formData.password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
        }

        if (formData.password != formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Split fullName into firstName and lastName
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || nameParts[0];

            // Call real API
            const response = await authAPI.register({
                email: formData.email,
                password: formData.password,
                firstName: firstName,
                lastName: lastName,
                companyName: formData.companyName,
                role: 'admin' // First user is admin by default
            });

            // Save auth data to localStorage
            saveAuthData(response.data);

            // Redirect to dashboard
            router.push('/dashboard/overview');
        } catch (err) {
            console.error('Registration error:', err);
            setErrors({
                submit: err.message || 'Đăng ký thất bại. Vui lòng thử lại.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (errors[name]) {
            setErrors({ ...errors, [name]: ''});
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;

        if(!password) return { strength: 0, text: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength, text: 'Yếu', color: 'bg-red-500' };
        if (strength <= 3) return { strength, text: 'Trung bình', color: 'bg-yellow-500' };
        return { strength, text: 'Mạnh', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
    <div className="min-h-screen flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-gray-600">
              Bắt đầu quản lý doanh nghiệp thông minh với AI
            </p>
          </div>

          {/* Register Form */}
          <div className="space-y-5">
            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Tên công ty
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="ABC Technology Co., Ltd"
                />
              </div>
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="ceo@congty.vn"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12`}
                  placeholder="Ít nhất 8 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{passwordStrength.text}</span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyPress}
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Chính sách bảo mật
                  </a>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
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
                  Đang tạo tài khoản...
                </>
              ) : (
                'Tạo tài khoản'
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
                <span className="px-4 bg-white text-gray-500">hoặc đăng ký với</span>
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
              <span className="text-gray-700 font-medium">Đăng ký với Google</span>
            </button>

            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#0078D4">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
              </svg>
              <span className="text-gray-700 font-medium">Đăng ký với Microsoft</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">
            Tham gia cùng hàng nghìn CEO đang quản lý thông minh
          </h2>
          <p className="text-blue-100 text-lg mb-12">
            Dùng thử miễn phí 14 ngày, không cần thẻ tín dụng
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Thiết lập trong 5 phút</h3>
                <p className="text-blue-100">
                  Không cần cài đặt phức tạp, bắt đầu ngay lập tức với hướng dẫn từng bước
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Bảo mật tuyệt đối</h3>
                <p className="text-blue-100">
                  Dữ liệu được mã hóa end-to-end, tuân thủ ISO 27001 và GDPR
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Hỗ trợ 24/7</h3>
                <p className="text-blue-100">
                  Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Không giới hạn người dùng</h3>
                <p className="text-blue-100">
                  Thêm toàn bộ đội ngũ của bạn mà không tốn thêm chi phí
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm font-semibold">2,500+ công ty</p>
                <p className="text-xs text-blue-100">đang sử dụng CEO Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm">4.9/5 từ 1,200+ đánh giá</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}