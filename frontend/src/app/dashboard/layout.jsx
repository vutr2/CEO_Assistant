'use client'
import React, { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  FileText,
  MessageSquare,
  Settings,
  X
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: 'Tổng quan', href: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Tài chính', href: '/dashboard/finance', icon: DollarSign },
    { name: 'Nhân sự', href: '/dashboard/people', icon: Users },
    { name: 'Báo cáo', href: '/dashboard/reports', icon: FileText },
    { name: 'Hỏi AI', href: '/dashboard/ask-ai', icon: MessageSquare },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CEO Assistant</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <a
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <Settings size={20} />
            <span>Cài đặt</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all`}>
        {/* Top Bar */}
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
