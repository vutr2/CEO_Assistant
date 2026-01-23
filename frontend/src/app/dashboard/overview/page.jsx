'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { dashboardAPI } from '@/lib/api';

export default function OverviewDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for metrics
  const iconMap = {
    DollarSign,
    Users,
    Target,
    TrendingUp,
  };

  // Icon mapping for activities
  const activityIconMap = {
    CheckCircle,
    AlertCircle,
    Clock,
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [metricsData, activitiesData, insightsData, performersData] = await Promise.all([
          dashboardAPI.getMetrics(),
          dashboardAPI.getActivities(4),
          dashboardAPI.getInsights(),
          dashboardAPI.getTopPerformers(3),
        ]);

        // Process metrics with icons
        const processedMetrics = metricsData.data?.map(metric => ({
          ...metric,
          icon: iconMap[metric.iconName] || DollarSign,
        })) || [];

        // Process activities with icons
        const processedActivities = activitiesData.data?.map(activity => ({
          ...activity,
          icon: activityIconMap[activity.iconName] || CheckCircle,
        })) || [];

        setMetrics(processedMetrics);
        setRecentActivities(processedActivities);
        setInsights(insightsData.data || []);
        setTopPerformers(performersData.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
        // No fallback mock data - show error state instead
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
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
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng trở lại! Đây là bảng điều khiển của bạn.</p>
          {error && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
              ⚠️ Đang sử dụng dữ liệu mẫu. Không thể kết nối với server.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600',
              orange: 'bg-orange-50 text-orange-600'
            };

            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[metric.color]} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  <span className="flex items-center text-green-600 text-sm font-medium">
                    <ArrowUpRight size={16} />
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Insights */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20} />
                  Thông tin quan trọng từ AI
                </h2>
                <p className="text-sm text-gray-500">Phân tích dựa trên dữ liệu của bạn</p>
              </div>
            </div>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const impactColors = {
                  positive: 'bg-green-50 border-green-200 text-green-800',
                  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                  negative: 'bg-red-50 border-red-200 text-red-800'
                };

                const priorityBadges = {
                  high: 'bg-red-100 text-red-700',
                  medium: 'bg-blue-100 text-blue-700',
                  low: 'bg-gray-100 text-gray-700'
                };

                return (
                  <div key={index} className={`p-4 rounded-lg border ${impactColors[insight.impact]}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold">{insight.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityBadges[insight.priority]}`}>
                        {insight.priority === 'high' ? 'Cao' : insight.priority === 'medium' ? 'TB' : 'Thấp'}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                const typeColors = {
                  success: 'text-green-600 bg-green-50',
                  warning: 'text-yellow-600 bg-yellow-50',
                  info: 'text-blue-600 bg-blue-50'
                };

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${typeColors[activity.type]} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nhân viên xuất sắc</h2>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {performer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">{performer.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{performer.score}</p>
                    <p className="text-xs text-gray-500">điểm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hành động nhanh</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/dashboard/finance')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition"
              >
                <DollarSign className="text-blue-600 mb-2" size={24} />
                <p className="font-medium text-gray-900 text-sm">Xem tài chính</p>
              </button>
              <button
                onClick={() => router.push('/dashboard/people')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition"
              >
                <Users className="text-green-600 mb-2" size={24} />
                <p className="font-medium text-gray-900 text-sm">Quản lý nhân sự</p>
              </button>
              <button
                onClick={() => router.push('/dashboard/finance')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition"
              >
                <Target className="text-purple-600 mb-2" size={24} />
                <p className="font-medium text-gray-900 text-sm">Xem mục tiêu</p>
              </button>
              <button
                onClick={() => router.push('/dashboard/reports')}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition"
              >
                <TrendingUp className="text-orange-600 mb-2" size={24} />
                <p className="font-medium text-gray-900 text-sm">Báo cáo</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
