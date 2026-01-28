'use client'
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Filter,
  Eye,
  Share2,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Send
} from 'lucide-react';
import { reportsAPI } from '@/lib/api';

export default function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [reportTemplates, setReportTemplates] = useState([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    period: 'month',
    startDate: '',
    endDate: '',
    includeCharts: true,
    includeSummary: true,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Icon mapping
  const iconMap = {
    CheckCircle,
    Clock,
    FileText,
    XCircle,
    DollarSign,
    Users,
    Target,
    TrendingUp,
  };

  // Default templates if API doesn't return any
  const defaultTemplates = [
    {
      id: 'finance',
      name: 'Báo cáo Tài chính',
      description: 'Doanh thu, chi phí và lợi nhuận',
      icon: DollarSign,
      color: 'blue',
      type: 'finance'
    },
    {
      id: 'hr',
      name: 'Báo cáo Nhân sự',
      description: 'Hiệu suất và phát triển nhân viên',
      icon: Users,
      color: 'green',
      type: 'hr'
    },
    {
      id: 'kpi',
      name: 'Báo cáo KPI',
      description: 'Theo dõi mục tiêu và chỉ số',
      icon: Target,
      color: 'purple',
      type: 'kpi'
    },
    {
      id: 'overview',
      name: 'Báo cáo Tổng quan',
      description: 'Phân tích toàn diện kinh doanh',
      icon: TrendingUp,
      color: 'orange',
      type: 'overview'
    }
  ];

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all reports data in parallel
        const [statsData, reportsData, templatesData] = await Promise.all([
          reportsAPI.getStats(selectedPeriod),
          reportsAPI.getCustomReports({ limit: 5 }),
          reportsAPI.getTemplates(),
        ]);

        // Process stats with icons
        const processedStats = statsData.data?.map(stat => ({
          ...stat,
          icon: iconMap[stat.iconName] || FileText,
        })) || [];

        // Process templates with icons or use defaults
        let processedTemplates = templatesData.data?.map(template => ({
          ...template,
          icon: iconMap[template.iconName] || FileText,
        })) || [];

        if (processedTemplates.length === 0) {
          processedTemplates = defaultTemplates;
        }

        setStats(processedStats);
        setRecentReports(reportsData.data || []);
        setReportTemplates(processedTemplates);
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError(err.message);
        // Use default templates on error
        setReportTemplates(defaultTemplates);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [selectedPeriod]);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      title: `${template.name} - ${new Date().toLocaleDateString('vi-VN')}`,
      type: template.type || template.id,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Format data for backend - uses name, type, and parameters
      const reportData = {
        name: formData.title,
        type: formData.type,
        parameters: {
          description: formData.description,
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
          includeCharts: formData.includeCharts,
          includeSummary: formData.includeSummary,
          notes: formData.notes,
        },
      };

      await reportsAPI.create(reportData);

      alert('Báo cáo đã được tạo thành công!');
      setShowForm(false);
      setSelectedTemplate(null);
      resetForm();

      // Refresh reports list
      const reportsData = await reportsAPI.getCustomReports({ limit: 5 });
      setRecentReports(reportsData.data || []);
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Lỗi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      period: 'month',
      startDate: '',
      endDate: '',
      includeCharts: true,
      includeSummary: true,
      notes: '',
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      finance: 'Tài chính',
      hr: 'Nhân sự',
      kpi: 'KPI',
      overview: 'Tổng quan',
    };
    return labels[type] || type;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Báo cáo</h1>
              <p className="text-gray-600 mt-1">Tạo và quản lý các báo cáo kinh doanh</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    selectedPeriod === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    selectedPeriod === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setSelectedPeriod('quarter')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    selectedPeriod === 'quarter'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quý
                </button>
                <button
                  onClick={() => setSelectedPeriod('year')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    selectedPeriod === 'year'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Năm
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Filter size={18} />
                <span className="text-sm font-medium">Lọc</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600',
                blue: 'bg-blue-50 text-blue-600',
                red: 'bg-red-50 text-red-600'
              };

              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color]} flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Report Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tạo báo cáo mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              const colorClasses = {
                blue: 'bg-blue-600',
                green: 'bg-green-600',
                purple: 'bg-purple-600',
                orange: 'bg-orange-600'
              };

              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition text-left"
                >
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[template.color]} text-white flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Báo cáo gần đây</h2>
                <p className="text-sm text-gray-500">Danh sách các báo cáo đã tạo</p>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên báo cáo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có báo cáo nào. Hãy tạo báo cáo mới!</p>
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr key={report.id || report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.name || report.title}</p>
                            {(report.parameters?.description || report.description) && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{report.parameters?.description || report.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {getTypeLabel(report.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{report.author || report.createdBy?.name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {new Date(report.date || report.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {report.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <CheckCircle size={14} />
                            Hoàn thành
                          </span>
                        )}
                        {report.status === 'processing' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            <Clock size={14} />
                            Đang xử lý
                          </span>
                        )}
                        {(report.status === 'draft' || !report.status) && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            <FileText size={14} />
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition" title="Xem">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition" title="Tải xuống">
                            <Download size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition" title="Chia sẻ">
                            <Share2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Report Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedTemplate && (
                  <div className={`w-10 h-10 rounded-lg ${
                    selectedTemplate.color === 'blue' ? 'bg-blue-600' :
                    selectedTemplate.color === 'green' ? 'bg-green-600' :
                    selectedTemplate.color === 'purple' ? 'bg-purple-600' : 'bg-orange-600'
                  } text-white flex items-center justify-center`}>
                    {selectedTemplate.icon && <selectedTemplate.icon size={20} />}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tạo {selectedTemplate?.name}</h2>
                  <p className="text-sm text-gray-500">{selectedTemplate?.description}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowForm(false); setSelectedTemplate(null); resetForm(); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề báo cáo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Báo cáo Tài chính Tháng 1/2026"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mô tả ngắn gọn về nội dung báo cáo..."
                />
              </div>

              {/* Period & Date Range */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kỳ báo cáo
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="week">Tuần</option>
                    <option value="month">Tháng</option>
                    <option value="quarter">Quý</option>
                    <option value="year">Năm</option>
                    <option value="custom">Tùy chọn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Tùy chọn báo cáo</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.includeCharts}
                      onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Bao gồm biểu đồ trực quan</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.includeSummary}
                      onChange={(e) => setFormData({ ...formData, includeSummary: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Bao gồm tóm tắt điều hành</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú thêm
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ghi chú hoặc yêu cầu đặc biệt..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setSelectedTemplate(null); resetForm(); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Tạo báo cáo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
