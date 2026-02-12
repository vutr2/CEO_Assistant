'use client';

import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Brain,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Target,
  Clock,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gradient">
                  CEO Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Powered by AI</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Quản lý doanh nghiệp
              <br />
              <span className="text-gradient">thông minh với AI</span>
            </h1>

            <p className="text-xl text-[#a0a0b8] mb-12 max-w-2xl mx-auto">
              Dashboard tích hợp AI giúp CEO theo dõi doanh thu, phân tích xu hướng
              và đưa ra quyết định kinh doanh chính xác trong thời gian thực.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-bold text-lg hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <span>Dùng thử miễn phí</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white font-bold text-lg hover:bg-[#2a2a3e] transition-all w-full sm:w-auto text-center"
              >
                Tìm hiểu thêm
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-[#6b6b80]">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span>Miễn phí 30 ngày</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span>Không cần thẻ</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span>Hủy bất cứ lúc nào</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#d4af37] rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px]"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-[#a0a0b8] text-lg">
              Mọi thứ bạn cần để quản lý doanh nghiệp hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Phân tích thời gian thực',
                description:
                  'Theo dõi doanh thu, chi phí và lợi nhuận của bạn trong thời gian thực với biểu đồ trực quan và dễ hiểu.',
                color: 'from-emerald-500 to-teal-600',
              },
              {
                icon: Brain,
                title: 'AI Assistant',
                description:
                  'Trợ lý AI thông minh trả lời mọi câu hỏi về dữ liệu kinh doanh và đưa ra gợi ý chiến lược.',
                color: 'from-violet-500 to-purple-600',
              },
              {
                icon: BarChart3,
                title: 'Báo cáo chi tiết',
                description:
                  'Tạo báo cáo kinh doanh chi tiết với các chỉ số KPI quan trọng và xu hướng tăng trưởng.',
                color: 'from-blue-500 to-cyan-600',
              },
              {
                icon: Shield,
                title: 'Bảo mật tối đa',
                description:
                  'Dữ liệu được mã hóa end-to-end và tuân thủ các tiêu chuẩn bảo mật quốc tế.',
                color: 'from-orange-500 to-red-600',
              },
              {
                icon: Zap,
                title: 'Cảnh báo thông minh',
                description:
                  'Nhận thông báo tự động khi có biến động quan trọng trong kinh doanh của bạn.',
                color: 'from-yellow-500 to-orange-600',
              },
              {
                icon: Target,
                title: 'Đa nền tảng',
                description:
                  'Truy cập dashboard trên mọi thiết bị - desktop, tablet, mobile với giao diện tối ưu.',
                color: 'from-pink-500 to-rose-600',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card-luxury rounded-2xl p-6 hover-lift animate-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#a0a0b8]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '10,000+', label: 'Người dùng' },
              { icon: DollarSign, value: '$50M+', label: 'Doanh thu quản lý' },
              { icon: BarChart3, value: '99.9%', label: 'Uptime' },
              { icon: Clock, value: '24/7', label: 'Hỗ trợ' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex w-12 h-12 rounded-lg bg-[#d4af37]/20 items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-[#d4af37]" />
                </div>
                <p className="text-4xl font-display font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-[#a0a0b8]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-luxury rounded-3xl p-12">
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Sẵn sàng tăng tốc doanh nghiệp?
            </h2>
            <p className="text-[#a0a0b8] text-lg mb-8">
              Tham gia cùng hàng nghìn CEO đang sử dụng AI để quản lý kinh doanh
              thông minh hơn.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-bold text-lg hover:shadow-2xl hover:shadow-[#d4af37]/40 transition-all"
            >
              <span>Bắt đầu miễn phí ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-[#6b6b80] text-sm mt-4">
              Không cần thẻ tín dụng • Hủy bất cứ lúc nào
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3e] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#0a0a0f]" />
                </div>
                <span className="font-display font-bold text-white">
                  CEO Dashboard
                </span>
              </div>
              <p className="text-[#6b6b80] text-sm">
                AI-Powered Business Analytics cho CEO hiện đại
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-[#6b6b80]">
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Tính năng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Giá cả
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Công ty</h3>
              <ul className="space-y-2 text-[#6b6b80]">
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Tuyển dụng
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-[#6b6b80]">
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Điều khoản
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#d4af37] transition-colors">
                    Bảo mật
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2a2a3e] pt-8 text-center text-[#6b6b80] text-sm">
            <p>© 2024 CEO Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
