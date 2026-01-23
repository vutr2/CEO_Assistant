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
  XCircle
} from 'lucide-react';
import { reportsAPI } from '@/lib/api';

export default function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [reportTemplates, setReportTemplates] = useState([]);

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

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all reports data in parallel
        const [statsData, reportsData, templatesData] = await Promise.all([
          reportsAPI.getStats(selectedPeriod),
          reportsAPI.getAll({ limit: 5, sort: '-createdAt' }),
          reportsAPI.getTemplates(),
        ]);

        // Process stats with icons
        const processedStats = statsData.data?.map(stat => ({
          ...stat,
          icon: iconMap[stat.iconName] || FileText,
        })) || [];

        // Process templates with icons
        const processedTemplates = templatesData.data?.map(template => ({
          ...template,
          icon: iconMap[template.iconName] || FileText,
        })) || [];

        setStats(processedStats);
        setRecentReports(reportsData.data || []);
        setReportTemplates(processedTemplates);
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError(err.message);
        // No fallback mock data - show error state instead
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [selectedPeriod]);

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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FileText className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải báo cáo</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Thử lại
          </button>
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
              {error && (
                <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg inline-block">
                  ⚠️ Đang sử dụng dữ liệu mẫu
                </div>
              )}
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
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-left"
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
                    Kích thước
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
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{report.author}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(report.date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{report.size}</p>
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
                      {report.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          <FileText size={14} />
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition">
                          <Download size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition">
                          <Share2 size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
