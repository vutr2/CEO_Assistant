'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Briefcase, CheckCircle, ShieldCheck, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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

    // Simulate API call
    setTimeout(() => {
      console.log('Password reset attempt:', formData);
      setIsLoading(false);
      alert('Đặt lại mật khẩu thành công! Chuyển đến trang đăng nhập...');
      // Redirect to login page
      window.location.href = '/login';
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) return { strength: 0, text: '', color: '' };

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
      {/* Left Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt lại mật khẩu
            </h1>
            <p className="text-gray-600">
              Tạo mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="space-y-5">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
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
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12`}
                  placeholder="Nhập lại mật khẩu mới"
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

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Ít nhất 8 ký tự
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Kết hợp chữ hoa và chữ thường
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Ít nhất một số
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z\d]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Ký tự đặc biệt (!@#$%^&*)
                </li>
              </ul>
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
                  Đang xử lý...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </div>

          {/* Back to Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Nhớ mật khẩu?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Security Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center">
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-bold mb-6">
            Bảo mật tài khoản của bạn
          </h2>
          <p className="text-blue-100 text-lg mb-12">
            Chúng tôi cam kết bảo vệ thông tin và dữ liệu của bạn với các tiêu chuẩn bảo mật cao nhất.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Mã hóa đầu cuối</h3>
                <p className="text-blue-100">
                  Dữ liệu của bạn được mã hóa với chuẩn AES-256, đảm bảo an toàn tuyệt đối
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Xác thực hai yếu tố</h3>
                <p className="text-blue-100">
                  Tăng cường bảo mật với xác thực 2FA cho tài khoản của bạn
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Tuân thủ tiêu chuẩn</h3>
                <p className="text-blue-100">
                  Đạt chứng nhận ISO 27001, GDPR và các tiêu chuẩn bảo mật quốc tế
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Mẹo bảo mật</h4>
                <ul className="space-y-1 text-sm text-blue-100">
                  <li>• Sử dụng mật khẩu mạnh và duy nhất</li>
                  <li>• Không chia sẻ mật khẩu với người khác</li>
                  <li>• Kích hoạt xác thực hai yếu tố</li>
                  <li>• Thay đổi mật khẩu định kỳ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
