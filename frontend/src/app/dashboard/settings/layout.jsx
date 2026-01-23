'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Bot, User, Bell, Shield, CreditCard, Crown } from 'lucide-react';

const settingsTabs = [
  {
    name: 'Công ty',
    href: '/dashboard/settings/company',
    icon: Building2,
    description: 'Thông tin và cài đặt công ty'
  },
  {
    name: 'Vai trò & Quyền',
    href: '/dashboard/settings/roles',
    icon: Shield,
    description: 'Quản lý vai trò và phân quyền'
  },
  {
    name: 'Cấu hình AI',
    href: '/dashboard/settings/ai',
    icon: Bot,
    description: 'Cài đặt trợ lý AI'
  },
  {
    name: 'Tài khoản',
    href: '/dashboard/settings/account',
    icon: User,
    description: 'Thông tin cá nhân và bảo mật'
  },
  {
    name: 'Thông báo',
    href: '/dashboard/settings/notifications',
    icon: Bell,
    description: 'Tùy chọn thông báo'
  },
  {
    name: 'Thanh toán',
    href: '/dashboard/settings/billing',
    icon: CreditCard,
    description: 'Hóa đơn và lịch sử thanh toán'
  },
  {
    name: 'Gói đăng ký',
    href: '/dashboard/settings/subscription',
    icon: Crown,
    description: 'Quản lý gói và nâng cấp'
  }
];

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="mt-2 text-gray-600">
            Quản lý cài đặt công ty, vai trò người dùng và tùy chọn hệ thống
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
