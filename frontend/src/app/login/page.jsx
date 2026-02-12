'use client';

import { useEffect } from 'react';
import { Descope } from '@descope/react-sdk';
import { useRouter } from 'next/navigation';
import { useSession } from '@descope/react-sdk';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();

  useEffect(() => {
    if (isAuthenticated && !isSessionLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isSessionLoading, router]);

  const handleSuccess = (e) => {
    console.log('Login successful:', e.detail.user);
    router.push('/');
  };

  const handleError = (e) => {
    console.error('Login error:', e.detail.error);
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-[#a0a0b8] font-display">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center shadow-lg shadow-[#d4af37]/30">
                <Sparkles className="w-8 h-8 text-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gradient">
                  CEO Dashboard
                </h1>
                <p className="text-[#6b6b80] font-mono text-sm">
                  AI-Powered Business Analytics
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-display font-bold text-white leading-tight">
              Quản lý doanh nghiệp
              <br />
              <span className="text-gradient">thông minh với AI</span>
            </h2>

            <p className="text-[#a0a0b8] text-lg">
              Theo dõi doanh thu, phân tích xu hướng và đưa ra quyết định kinh
              doanh hiệu quả với sức mạnh của trí tuệ nhân tạo.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              {
                icon: TrendingUp,
                title: 'Phân tích thời gian thực',
                desc: 'Theo dõi doanh thu và chi phí mọi lúc mọi nơi',
              },
              {
                icon: Zap,
                title: 'AI Assistant',
                desc: 'Trợ lý AI trả lời mọi câu hỏi về kinh doanh',
              },
              {
                icon: Shield,
                title: 'Bảo mật tuyệt đối',
                desc: 'Dữ liệu được mã hóa và bảo vệ an toàn',
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[#6b6b80] text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#2a2a3e]">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Hỗ trợ' },
              { value: '256-bit', label: 'Mã hóa' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-2xl font-display font-bold text-[#d4af37]">
                  {stat.value}
                </p>
                <p className="text-[#6b6b80] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full">
          <div className="card-luxury rounded-2xl p-8 lg:p-10">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#0a0a0f]" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-gradient">
                    CEO Dashboard
                  </h1>
                </div>
              </div>
              <p className="text-center text-[#a0a0b8]">
                Đăng nhập để tiếp tục
              </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Chào mừng trở lại
              </h2>
              <p className="text-[#a0a0b8]">
                Đăng nhập vào tài khoản của bạn
              </p>
            </div>

            {/* Descope Login Component */}
            <div className="descope-container">
              <Descope
                flowId={process.env.NEXT_PUBLIC_DESCOPE_FLOW_ID || 'sign-up-or-in'}
                onSuccess={handleSuccess}
                onError={handleError}
                theme="dark"
              />
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[#2a2a3e] text-center">
              <p className="text-[#6b6b80] text-sm">
                Bằng cách đăng nhập, bạn đồng ý với{' '}
                <a href="#" className="text-[#d4af37] hover:underline">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="#" className="text-[#d4af37] hover:underline">
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
