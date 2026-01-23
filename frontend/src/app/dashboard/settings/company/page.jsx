'use client';

import { useState, useEffect } from 'react';
import { Building2, Upload, Save, MapPin, Phone, Mail, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { companyAPI } from '@/lib/api';

export default function CompanySettingsPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    businessCode: '',
    taxCode: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    industry: '',
    employeeCount: '',
    foundedYear: '',
    description: ''
  });

  const [logo, setLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setLoading(true);
        const response = await companyAPI.getProfile();
        const data = response.data || {};

        // Map API response to form fields, ensuring no undefined values
        setFormData({
          companyName: data.name || data.companyName || 'CEO AI Assistant Corp',
          businessCode: data.businessCode || '0123456789',
          taxCode: data.taxCode || '0123456789',
          address: data.location || data.address || '123 Đường ABC, Quận 1, TP.HCM',
          phone: data.phone || '028 1234 5678',
          email: data.email || 'info@ceoai.vn',
          website: data.website || 'https://ceoai.vn',
          industry: data.industry || 'Công nghệ thông tin',
          employeeCount: data.size ? String(data.size) : data.employeeCount || '50-100',
          foundedYear: data.founded ? new Date(data.founded).getFullYear().toString() : data.foundedYear || '2023',
          description: data.description || 'Công ty chuyên cung cấp giải pháp AI cho doanh nghiệp'
        });
        setLogo(data.logo || null);
      } catch (err) {
        console.error('Error fetching company profile:', err);
        // Set default values on error
        setFormData({
          companyName: 'CEO AI Assistant Corp',
          businessCode: '0123456789',
          taxCode: '0123456789',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          phone: '028 1234 5678',
          email: 'info@ceoai.vn',
          website: 'https://ceoai.vn',
          industry: 'Công nghệ thông tin',
          employeeCount: '50-100',
          foundedYear: '2023',
          description: 'Công ty chuyên cung cấp giải pháp AI cho doanh nghiệp'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    alert('Đã lưu thông tin công ty thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thông tin công ty</h2>
            <p className="text-sm text-gray-600">Quản lý thông tin cơ bản về công ty của bạn</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Logo công ty</h3>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-white" size={32} />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-3">
                Logo sẽ được hiển thị trên hệ thống và các báo cáo. Kích thước khuyến nghị: 500x500px
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button type="button" variant="outline" icon={Upload}>
                  Tải lên logo
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cơ bản</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên công ty"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              icon={Building2}
            />

            <Input
              label="Mã số doanh nghiệp"
              name="businessCode"
              value={formData.businessCode}
              onChange={handleChange}
              required
            />

            <Input
              label="Mã số thuế"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
              required
            />

            <Input
              label="Lĩnh vực hoạt động"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            />

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng nhân viên
              </label>
              <select
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="1-10">1-10 nhân viên</option>
                <option value="11-50">11-50 nhân viên</option>
                <option value="50-100">50-100 nhân viên</option>
                <option value="100-500">100-500 nhân viên</option>
                <option value="500+">500+ nhân viên</option>
              </select>
            </div>

            <Input
              label="Năm thành lập"
              name="foundedYear"
              type="number"
              value={formData.foundedYear}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>

          <div className="space-y-4">
            <Input
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleChange}
              icon={MapPin}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
              />
            </div>

            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              icon={Globe}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mô tả công ty</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Nhập mô tả về công ty của bạn..."
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
    </div>
  );
}
