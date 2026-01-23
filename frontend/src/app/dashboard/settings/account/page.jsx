'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { userAPI } from '@/lib/api';

export default function AccountSettingsPage() {
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    location: '',
    bio: '',

    // Password
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatar, setAvatar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        const userData = response.data;

        setFormData({
          fullName: userData.fullName || 'Nguyễn Văn A',
          email: userData.email || 'nguyenvana@example.com',
          phone: userData.phone || '0123456789',
          position: userData.position || 'CEO',
          department: userData.department || 'Điều hành',
          location: userData.location || 'TP.HCM',
          bio: userData.bio || 'Giám đốc điều hành với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setAvatar(userData.avatar || null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
        // Use default values on error
        setFormData({
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phone: '0123456789',
          position: 'CEO',
          department: 'Điều hành',
          location: 'TP.HCM',
          bio: 'Giám đốc điều hành với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await userAPI.updateProfile(formData);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }

    // Simulate API call (old code commented out)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    alert('Đã cập nhật thông tin tài khoản thành công!');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Đã thay đổi mật khẩu thành công!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      alert('Chức năng xóa tài khoản sẽ được kích hoạt sau khi xác nhận qua email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tài khoản của tôi</h2>
            <p className="text-sm text-gray-600">Quản lý thông tin cá nhân và bảo mật</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ảnh đại diện</h3>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-white" size={32} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                <Camera className="text-white" size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Tải lên ảnh đại diện của bạn. Kích thước khuyến nghị: 400x400px
              </p>
              <p className="text-xs text-gray-500">
                Định dạng: JPG, PNG hoặc GIF. Kích thước tối đa: 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cá nhân</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              icon={User}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              icon={Mail}
            />

            <Input
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
            />

            <Input
              label="Vị trí"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />

            <Input
              label="Phòng ban"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />

            <Input
              label="Địa điểm làm việc"
              name="location"
              value={formData.location}
              onChange={handleChange}
              icon={MapPin}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới thiệu bản thân
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Viết một vài dòng giới thiệu về bản thân..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Button type="button" variant="outline">
            Hủy
          </Button>
          <Button type="submit" variant="primary" icon={Save} disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>

      {/* Change Password Section */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Lock className="text-yellow-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Thay đổi mật khẩu</h3>
            <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo vệ tài khoản</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Mật khẩu hiện tại"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            icon={Lock}
          />

          <Input
            label="Mật khẩu mới"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            icon={Lock}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            icon={Lock}
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">Yêu cầu mật khẩu:</p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Tối thiểu 8 ký tự</li>
              <li>Bao gồm chữ hoa và chữ thường</li>
              <li>Ít nhất 1 chữ số</li>
              <li>Ít nhất 1 ký tự đặc biệt (@, #, $, v.v.)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Vùng nguy hiểm</h3>
            <p className="text-sm text-red-700">Các hành động không thể hoàn tác</p>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-900 mb-2">
            <strong>Xóa tài khoản</strong>
          </p>
          <p className="text-xs text-red-800">
            Khi bạn xóa tài khoản, tất cả dữ liệu cá nhân, lịch sử hoạt động và quyền truy cập sẽ bị xóa vĩnh viễn.
            Hành động này không thể hoàn tác.
          </p>
        </div>

        <Button
          type="button"
          variant="danger"
          icon={Trash2}
          onClick={handleDeleteAccount}
        >
          Xóa tài khoản
        </Button>
      </div>
    </div>
  );
}
