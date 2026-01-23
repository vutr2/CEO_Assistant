'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
  TrendingUp,
  Filter,
  Check,
  Trash2,
  UserPlus,
  Award
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { notificationsAPI } from '@/lib/api';

// Map icon names from backend to actual icon components
const iconMap = {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
  TrendingUp,
  UserPlus,
  Award
};

// Map color names to Tailwind classes (Tailwind doesn't support dynamic class names)
const colorClasses = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterUnread, setFilterUnread] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const [notifData, categoriesData] = await Promise.all([
          notificationsAPI.getAll({ category: selectedCategory !== 'all' ? selectedCategory : undefined }),
          notificationsAPI.getCategories(),
        ]);

        // Transform backend data to match frontend expectations
        const transformedNotifications = (notifData.data || []).map(n => ({
          ...n,
          color: n.iconColor || 'blue',
          unread: !n.read,
          time: n.createdAt,
          category: n.type,
          priority: n.priority || 'medium'
        }));

        setNotifications(transformedNotifications);
        setCategories(categoriesData.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
        // No fallback mock data - show error state instead
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [selectedCategory]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Filter by unread
    if (filterUnread) {
      filtered = filtered.filter(n => n.unread);
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, unread: false } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleToggleSelect = (notificationId) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    } else {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleDeleteSelected = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn?`)) {
      setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'error',
      medium: 'warning',
      low: 'default'
    };
    const labels = {
      high: 'Quan trọng',
      medium: 'Trung bình',
      low: 'Thấp'
    };
    return <Badge variant={variants[priority]} size="sm">{labels[priority]}</Badge>;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông báo...</p>
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
            <Bell className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải thông báo</h2>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className={`text-sm ${
                      selectedCategory === category.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filter Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Bộ lọc</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterUnread}
                    onChange={(e) => setFilterUnread(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Chỉ hiển thị chưa đọc</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Actions Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedNotifications.length > 0
                        ? `Đã chọn ${selectedNotifications.length}`
                        : 'Chọn tất cả'
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedNotifications.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={handleDeleteSelected}
                      >
                        Xóa đã chọn
                      </Button>
                    )}
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Check}
                        onClick={handleMarkAllAsRead}
                      >
                        Đánh dấu tất cả đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-200">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => {
                    const Icon = iconMap[notification.iconName] || Bell;
                    const isSelected = selectedNotifications.includes(notification.id);

                    return (
                      <div
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-gray-50 transition ${
                          notification.unread ? 'bg-blue-50/50' : ''
                        } ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(notification.id)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />

                          {/* Icon */}
                          <div className={`w-10 h-10 ${(colorClasses[notification.color] || colorClasses.blue).bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={(colorClasses[notification.color] || colorClasses.blue).text} size={20} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className={`text-sm ${notification.unread ? 'text-gray-700' : 'text-gray-600'} mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.time)}
                              </span>
                              <div className="flex items-center gap-2">
                                {notification.unread && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    Đánh dấu đã đọc
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không có thông báo
                    </h3>
                    <p className="text-gray-600">
                      {filterUnread
                        ? 'Không có thông báo chưa đọc trong danh mục này'
                        : 'Không có thông báo nào trong danh mục này'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
