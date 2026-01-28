'use client'
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  FileText,
  MessageSquare,
  Settings,
  X,
  TrendingUp,
  Receipt,
  Activity,
  CheckSquare,
  Menu
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import { userAPI } from '@/lib/api';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await userAPI.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const userRole = user?.role || 'employee';

  // Menu items for CEO/Owner/Admin - Full access
  const ceoNavigation = [
    { name: 'Tổng quan', href: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Tài chính', href: '/dashboard/finance', icon: DollarSign },
    { name: 'Nhân sự', href: '/dashboard/people', icon: Users },
    { name: 'Báo cáo', href: '/dashboard/reports', icon: FileText },
    { name: 'Hỏi AI', href: '/dashboard/ask-ai', icon: MessageSquare },
  ];

  // Menu items for Manager - Can approve + view some dashboards
  const managerNavigation = [
    { name: 'Tổng quan', href: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Tài chính', href: '/dashboard/finance', icon: DollarSign },
    { name: 'Nhân sự', href: '/dashboard/people', icon: Users },
    { name: 'Báo cáo', href: '/dashboard/reports', icon: FileText },
    { name: 'Hỏi AI', href: '/dashboard/ask-ai', icon: MessageSquare },
  ];

  // Menu items for Employee - Only input data and reports
  const employeeNavigation = [
    { name: 'Báo cáo', href: '/dashboard/reports', icon: FileText },
  ];

  // Employee input section - for all users
  const inputNavigation = [
    { name: 'Bán hàng', href: '/dashboard/sales', icon: TrendingUp },
    { name: 'Chi phí', href: '/dashboard/expenses', icon: Receipt },
    { name: 'Hoạt động', href: '/dashboard/activities', icon: Activity },
  ];

  // Approval section - for managers and above
  const approvalNavigation = [
    { name: 'Duyệt yêu cầu', href: '/dashboard/approvals', icon: CheckSquare },
  ];

  // Get navigation based on role
  const getMainNavigation = () => {
    if (['owner', 'admin'].includes(userRole)) {
      return ceoNavigation;
    } else if (userRole === 'manager') {
      return managerNavigation;
    } else {
      return employeeNavigation;
    }
  };

  // Check if user can approve
  const canApprove = ['owner', 'admin', 'manager'].includes(userRole);

  // Check if user can access settings
  const canAccessSettings = ['owner', 'admin'].includes(userRole);

  const isActive = (href) => pathname === href;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">
            {userRole === 'owner' ? 'Chủ sở hữu' :
             userRole === 'admin' ? 'Quản trị viên' :
             userRole === 'manager' ? 'Quản lý' : 'Nhân viên'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Main Navigation */}
          {getMainNavigation().map((item) => {
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

          {/* Employee Input Section */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Nhập liệu
            </p>
            {inputNavigation.map((item) => {
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
          </div>

          {/* Approval Section - Only for managers and above */}
          {canApprove && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Quản lý
              </p>
              {approvalNavigation.map((item) => {
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
            </div>
          )}
        </nav>

        {/* Settings - Only for admin/owner */}
        {canAccessSettings && (
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
            <a
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              <Settings size={20} />
              <span>Cài đặt</span>
            </a>
          </div>
        )}
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
