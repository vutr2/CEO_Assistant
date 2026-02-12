'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Key,
  Trash2,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('vi');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout();
    }
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        'CẢNH BÁO: Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa tài khoản?'
      )
    ) {
      // TODO: Implement account deletion
      alert('Tính năng đang được phát triển');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                Cài đặt
              </h1>
              <p className="text-sm text-[#6b6b80]">
                Quản lý tài khoản và tùy chọn
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all"
            >
              ← Quay lại Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Section */}
        <section className="card-luxury rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center text-2xl font-bold text-[#0a0a0f]">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">
                  {user?.name || 'Người dùng'}
                </h2>
                <p className="text-[#a0a0b8]">{user?.email || 'email@example.com'}</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white hover:bg-[#2a2a3e] transition-all">
              Chỉnh sửa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
              <div className="flex items-center space-x-2 text-[#6b6b80] mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="text-white">{user?.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
              <div className="flex items-center space-x-2 text-[#6b6b80] mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">User ID</span>
              </div>
              <p className="text-white font-mono text-sm">
                {user?.userId || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="card-luxury rounded-2xl p-6">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            Tùy chọn hiển thị
          </h3>

          <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
              <div className="flex items-center space-x-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-[#d4af37]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#d4af37]" />
                )}
                <div>
                  <p className="text-white font-medium">Chế độ tối</p>
                  <p className="text-[#6b6b80] text-sm">
                    Sử dụng giao diện tối
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-all ${
                  darkMode ? 'bg-[#d4af37]' : 'bg-[#2a2a3e]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <p className="text-white font-medium">Ngôn ngữ</p>
                  <p className="text-[#6b6b80] text-sm">Tiếng Việt</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6b6b80]" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="card-luxury rounded-2xl p-6">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            Thông báo
          </h3>

          <div className="space-y-4">
            {[
              {
                key: 'email',
                icon: Mail,
                title: 'Email',
                desc: 'Nhận thông báo qua email',
              },
              {
                key: 'push',
                icon: Smartphone,
                title: 'Push Notifications',
                desc: 'Thông báo đẩy trên thiết bị',
              },
              {
                key: 'sms',
                icon: Bell,
                title: 'SMS',
                desc: 'Nhận tin nhắn SMS',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e]"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-[#6b6b80] text-sm">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]: !notifications[item.key],
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-all ${
                    notifications[item.key] ? 'bg-[#d4af37]' : 'bg-[#2a2a3e]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notifications[item.key]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 px-4 py-3 rounded-lg bg-[#d4af37]/20 text-[#d4af37] font-semibold hover:bg-[#d4af37]/30 transition-all flex items-center justify-center space-x-2">
            <Save className="w-5 h-5" />
            <span>Lưu thay đổi</span>
          </button>
        </section>

        {/* Security */}
        <section className="card-luxury rounded-2xl p-6">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            Bảo mật
          </h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-all text-left">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <p className="text-white font-medium">Đổi mật khẩu</p>
                  <p className="text-[#6b6b80] text-sm">
                    Cập nhật mật khẩu của bạn
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6b6b80]" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] hover:bg-[#2a2a3e] transition-all text-left">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <p className="text-white font-medium">
                    Xác thực hai yếu tố
                  </p>
                  <p className="text-[#6b6b80] text-sm">
                    Tăng cường bảo mật tài khoản
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6b6b80]" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="card-luxury rounded-2xl p-6 border-2 border-red-500/20">
          <h3 className="text-xl font-display font-bold text-red-400 mb-6">
            Vùng nguy hiểm
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-orange-400 font-medium">Đăng xuất</p>
                  <p className="text-[#6b6b80] text-sm">
                    Đăng xuất khỏi tài khoản này
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-orange-400" />
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-medium">Xóa tài khoản</p>
                  <p className="text-[#6b6b80] text-sm">
                    Xóa vĩnh viễn tài khoản và dữ liệu
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-[#6b6b80] text-sm">
          <p>CEO Dashboard v1.0.0</p>
          <p className="mt-2">
            © 2024 All rights reserved.{' '}
            <a href="#" className="text-[#d4af37] hover:underline">
              Privacy Policy
            </a>{' '}
            •{' '}
            <a href="#" className="text-[#d4af37] hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
