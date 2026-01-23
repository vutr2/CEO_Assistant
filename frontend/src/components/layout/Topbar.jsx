'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { notificationsAPI } from '@/lib/api';

const notificationsMock = [
  {
    id: 1,
    title: 'Báo cáo tài chính mới',
    message: 'Báo cáo tháng 12 đã sẵn sàng',
    time: '5 phút trước',
    unread: true,
    type: 'report'
  },
  {
    id: 2,
    title: 'Phê duyệt ngân sách',
    message: 'Yêu cầu phê duyệt ngân sách Q1',
    time: '1 giờ trước',
    unread: true,
    type: 'task'
  },
  {
    id: 3,
    title: 'Họp team Marketing',
    message: 'Cuộc họp bắt đầu lúc 14:00',
    time: '2 giờ trước',
    unread: false,
    type: 'meeting'
  },
  {
    id: 4,
    title: 'Thanh toán thành công',
    message: 'Gói Premium đã được gia hạn',
    time: '1 ngày trước',
    unread: false,
    type: 'payment'
  }
];

export default function Topbar({ onMenuClick }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifData, unreadData] = await Promise.all([
          notificationsAPI.getAll({ limit: 4 }),
          notificationsAPI.getUnreadCount(),
        ]);

        setNotifications(notifData.data || notificationsMock);
        setUnreadCount(unreadData.count || 0);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications(notificationsMock);
        setUnreadCount(notificationsMock.filter(n => n.unread).length);
      }
    };

    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.unread ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 text-center">
                  <a
                    href="/dashboard/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Xem tất cả thông báo
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">CEO User</p>
                <p className="text-xs text-gray-500">ceo@company.vn</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Hồ sơ
                </a>
                <a
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Cài đặt
                </a>
                <hr className="my-2 border-gray-100" />
                <a
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
