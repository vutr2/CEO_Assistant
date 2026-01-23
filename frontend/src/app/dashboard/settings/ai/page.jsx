'use client';

import { useState } from 'react';
import { Bot, Zap, MessageSquare, FileText, TrendingUp, Save, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

export default function AISettingsPage() {
  const [formData, setFormData] = useState({
    // General AI Settings
    aiEnabled: true,
    aiModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,

    // Features
    autoSuggestions: true,
    contextAwareness: true,
    multiLanguage: true,
    voiceInput: false,

    // Response Settings
    responseStyle: 'professional',
    responseLength: 'medium',
    includeReferences: true,

    // Data & Privacy
    dataRetention: '90',
    allowLearning: true,
    anonymizeData: true,

    // Integrations
    slackIntegration: false,
    teamsIntegration: false,
    emailSummaries: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSaving(false);
    alert('Đã lưu cài đặt AI thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cấu hình AI</h2>
            <p className="text-sm text-gray-600">Tùy chỉnh cài đặt trợ lý AI của bạn</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Trạng thái AI</h3>
              <p className="text-sm text-gray-600">Bật hoặc tắt trợ lý AI cho toàn bộ hệ thống</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="aiEnabled"
                checked={formData.aiEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {formData.aiEnabled && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Zap className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-green-900">AI đang hoạt động</p>
                <p className="text-xs text-green-700 mt-1">
                  Trợ lý AI đang sẵn sàng hỗ trợ bạn với các tác vụ và phân tích
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Model Configuration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cấu hình mô hình</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô hình AI <Badge variant="primary">Premium</Badge>
              </label>
              <select
                name="aiModel"
                value={formData.aiModel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="gpt-4">GPT-4 (Khuyến nghị)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Nhanh hơn)</option>
                <option value="claude-2">Claude 2 (Chính xác cao)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Mô hình cao cấp hơn cung cấp kết quả chính xác và chi tiết hơn
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {formData.temperature}
              </label>
              <input
                type="range"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Chính xác (0)</span>
                <span>Sáng tạo (1)</span>
              </div>
            </div>

            <Input
              label="Số tokens tối đa"
              name="maxTokens"
              type="number"
              value={formData.maxTokens}
              onChange={handleChange}
              min="100"
              max="4000"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={18} />
            Tính năng AI
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Gợi ý tự động</div>
                <div className="text-sm text-gray-600">AI đề xuất câu trả lời và hành động</div>
              </div>
              <input
                type="checkbox"
                name="autoSuggestions"
                checked={formData.autoSuggestions}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Nhận thức ngữ cảnh</div>
                <div className="text-sm text-gray-600">AI hiểu ngữ cảnh cuộc hội thoại trước đó</div>
              </div>
              <input
                type="checkbox"
                name="contextAwareness"
                checked={formData.contextAwareness}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Hỗ trợ đa ngôn ngữ</div>
                <div className="text-sm text-gray-600">AI có thể giao tiếp bằng nhiều ngôn ngữ</div>
              </div>
              <input
                type="checkbox"
                name="multiLanguage"
                checked={formData.multiLanguage}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="font-medium text-gray-900">Nhập liệu bằng giọng nói</div>
                <Badge variant="warning">Sắp ra mắt</Badge>
              </div>
              <input
                type="checkbox"
                name="voiceInput"
                checked={formData.voiceInput}
                onChange={handleChange}
                disabled
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
            </label>
          </div>
        </div>

        {/* Response Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} />
            Cài đặt phản hồi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phong cách trả lời
              </label>
              <select
                name="responseStyle"
                value={formData.responseStyle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="professional">Chuyên nghiệp</option>
                <option value="casual">Thân thiện</option>
                <option value="technical">Kỹ thuật</option>
                <option value="concise">Ngắn gọn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ dài phản hồi
              </label>
              <select
                name="responseLength"
                value={formData.responseLength}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="short">Ngắn</option>
                <option value="medium">Trung bình</option>
                <option value="long">Dài</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="includeReferences"
                checked={formData.includeReferences}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Bao gồm tham chiếu</div>
                <div className="text-sm text-gray-600">Hiển thị nguồn và tham chiếu trong câu trả lời</div>
              </div>
            </label>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            Dữ liệu & Quyền riêng tư
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian lưu trữ dữ liệu (ngày)
              </label>
              <select
                name="dataRetention"
                value={formData.dataRetention}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="30">30 ngày</option>
                <option value="60">60 ngày</option>
                <option value="90">90 ngày</option>
                <option value="180">180 ngày</option>
                <option value="365">1 năm</option>
              </select>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="allowLearning"
                checked={formData.allowLearning}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Cho phép AI học từ dữ liệu</div>
                <div className="text-sm text-gray-600">AI sẽ cải thiện dựa trên tương tác của bạn</div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="anonymizeData"
                checked={formData.anonymizeData}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Ẩn danh hóa dữ liệu</div>
                <div className="text-sm text-gray-600">Xóa thông tin nhận dạng cá nhân trước khi lưu trữ</div>
              </div>
            </label>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Tích hợp
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-purple-600" size={18} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Slack</div>
                  <div className="text-sm text-gray-600">Nhận thông báo AI trên Slack</div>
                </div>
              </div>
              <input
                type="checkbox"
                name="slackIntegration"
                checked={formData.slackIntegration}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-blue-600" size={18} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Microsoft Teams</div>
                  <div className="text-sm text-gray-600">Tích hợp AI với Teams</div>
                </div>
              </div>
              <input
                type="checkbox"
                name="teamsIntegration"
                checked={formData.teamsIntegration}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Email tóm tắt hàng ngày</div>
                <div className="text-sm text-gray-600">Nhận bản tóm tắt AI qua email</div>
              </div>
              <input
                type="checkbox"
                name="emailSummaries"
                checked={formData.emailSummaries}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Button type="button" variant="outline">
            Khôi phục mặc định
          </Button>
          <Button type="submit" variant="primary" icon={Save} disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </form>
    </div>
  );
}
