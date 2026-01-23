'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Volume2, Check, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const notificationCategories = [
  {
    id: 'system',
    name: 'Hệ thống',
    description: 'Cập nhật hệ thống và thông báo quan trọng',
    icon: Bell,
    color: 'blue',
    settings: {
      email: true,
      push: true,
      inApp: true,
      sms: false
    }
  },
  {
    id: 'finance',
    name: 'Tài chính',
    description: 'Giao dịch, hóa đơn và cảnh báo tài chính',
    icon: Mail,
    color: 'green',
    settings: {
      email: true,
      push: true,
      inApp: true,
      sms: true
    }
  },
  {
    id: 'people',
    name: 'Nhân sự',
    description: 'Hoạt động nhân viên và phê duyệt',
    icon: MessageSquare,
    color: 'purple',
    settings: {
      email: true,
      push: false,
      inApp: true,
      sms: false
    }
  },
  {
    id: 'reports',
    name: 'Báo cáo',
    description: 'Báo cáo mới và cập nhật phân tích',
    icon: Mail,
    color: 'orange',
    settings: {
      email: true,
      push: false,
      inApp: true,
      sms: false
    }
  },
  {
    id: 'ai',
    name: 'Trợ lý AI',
    description: 'Gợi ý và thông tin chi tiết từ AI',
    icon: Smartphone,
    color: 'pink',
    settings: {
      email: false,
      push: true,
      inApp: true,
      sms: false
    }
  }
];

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState(notificationCategories);
  const [globalSettings, setGlobalSettings] = useState({
    doNotDisturb: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    soundEnabled: true,
    desktopNotifications: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (categoryId, channel) => {
    setNotifications(notifications.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            settings: {
              ...cat.settings,
              [channel]: !cat.settings[channel]
            }
          }
        : cat
    ));
  };

  const handleGlobalChange = (setting, value) => {
    setGlobalSettings({
      ...globalSettings,
      [setting]: value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    alert('Đã lưu cài đặt thông báo thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Bell className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cài đặt thông báo</h2>
            <p className="text-sm text-gray-600">Tùy chỉnh cách bạn nhận thông báo</p>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cài đặt chung</h3>

        <div className="space-y-4">
          {/* Do Not Disturb */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Không làm phiền</div>
              <div className="text-sm text-gray-600">Tắt tất cả thông báo tạm thời</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalSettings.doNotDisturb}
                onChange={(e) => handleGlobalChange('doNotDisturb', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Quiet Hours */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="font-medium text-gray-900 mb-3">Giờ yên tĩnh</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Bắt đầu</label>
                <input
                  type="time"
                  value={globalSettings.quietHoursStart}
                  onChange={(e) => handleGlobalChange('quietHoursStart', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Kết thúc</label>
                <input
                  type="time"
                  value={globalSettings.quietHoursEnd}
                  onChange={(e) => handleGlobalChange('quietHoursEnd', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Thông báo sẽ bị tắt trong khung giờ này
            </p>
          </div>

          {/* Sound */}
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Volume2 className="text-gray-600" size={20} />
              <div>
                <div className="font-medium text-gray-900">Âm thanh thông báo</div>
                <div className="text-sm text-gray-600">Phát âm thanh khi có thông báo mới</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={globalSettings.soundEnabled}
              onChange={(e) => handleGlobalChange('soundEnabled', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          {/* Desktop Notifications */}
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Smartphone className="text-gray-600" size={20} />
              <div>
                <div className="font-medium text-gray-900">Thông báo trên máy tính</div>
                <div className="text-sm text-gray-600">Hiển thị thông báo trên desktop</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={globalSettings.desktopNotifications}
              onChange={(e) => handleGlobalChange('desktopNotifications', e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Kênh thông báo theo danh mục</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Danh mục</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex flex-col items-center gap-1">
                    <Mail size={18} />
                    <span className="text-xs">Email</span>
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex flex-col items-center gap-1">
                    <Bell size={18} />
                    <span className="text-xs">Push</span>
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex flex-col items-center gap-1">
                    <MessageSquare size={18} />
                    <span className="text-xs">Trong app</span>
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone size={18} />
                    <span className="text-xs">SMS</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notifications.map((category) => {
                const Icon = category.icon;
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                          <Icon className={`text-${category.color}-600`} size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-600">{category.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={category.settings.email}
                        onChange={() => handleToggle(category.id, 'email')}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={category.settings.push}
                        onChange={() => handleToggle(category.id, 'push')}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={category.settings.inApp}
                        onChange={() => handleToggle(category.id, 'inApp')}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={category.settings.sms}
                        onChange={() => handleToggle(category.id, 'sms')}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Digest */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt qua Email</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="emailDigest"
              value="realtime"
              defaultChecked
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Thời gian thực</div>
              <div className="text-sm text-gray-600">Nhận email ngay khi có thông báo</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="emailDigest"
              value="daily"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Tóm tắt hàng ngày</div>
              <div className="text-sm text-gray-600">Nhận email tóm tắt 1 lần/ngày (9:00 AM)</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="emailDigest"
              value="weekly"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Tóm tắt hàng tuần</div>
              <div className="text-sm text-gray-600">Nhận email tóm tắt vào Thứ 2 hàng tuần</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="emailDigest"
              value="never"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">Không gửi</div>
              <div className="text-sm text-gray-600">Không nhận email tóm tắt</div>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <Button type="button" variant="outline">
          Khôi phục mặc định
        </Button>
        <Button variant="primary" icon={Save} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </div>
    </div>
  );
}
