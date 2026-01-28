'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Edit,
  Settings,
  BarChart3,
  Users,
  MessageSquare,
  Star,
  FileText,
  Bot,
  Upload,
  UserPlus,
  BarChart,
  DollarSign,
  Trophy,
  BarChart2,
  Rocket,
  Database,
  ClipboardCheck,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { userAPI } from '@/lib/api';

// Icon mapping for dynamic icon rendering
const iconMap = {
  Target,
  CheckCircle,
  Users,
  TrendingUp,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Clock,
  Edit,
  Settings,
  BarChart3,
  MessageSquare,
  Star,
  FileText,
  Bot,
  Upload,
  UserPlus,
  BarChart,
  DollarSign,
  Trophy,
  BarChart2,
  Rocket,
  Database,
  ClipboardCheck,
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [stats, setStats] = useState([]);
  const [skills, setSkills] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          profileData,
          perfData,
          statsData,
          skillsData,
          activitiesData,
          achievementsData,
        ] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getPerformance(),
          userAPI.getStats(),
          userAPI.getSkills(),
          userAPI.getActivities(5),
          userAPI.getAchievements(),
        ]);

        setUserProfile(profileData.data);
        setPerformanceData(perfData.data || []);
        setStats(statsData.data || []);
        setSkills(skillsData.data || []);
        setRecentActivities(activitiesData.data || []);
        setAchievements(achievementsData.data || []);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
        // No fallback mock data - show error state instead
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getYearsWorked = () => {
    const joinDate = new Date(userProfile.joinDate);
    const now = new Date();
    const years = now.getFullYear() - joinDate.getFullYear();
    return years;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
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
            <User className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không thể tải hồ sơ
          </h2>
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
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="px-6 pb-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                {userProfile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="text-white" size={48} />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {userProfile.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {userProfile.position}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} />
                    <span>{userProfile.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      Tham gia {formatDate(userProfile.joinDate)} (
                      {getYearsWorked()} năm)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  icon={Edit}
                  href="/dashboard/settings/account"
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  icon={Settings}
                  href="/dashboard/settings"
                >
                  Cài đặt
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <p className="text-gray-700">{userProfile.bio}</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-blue-600" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="text-green-600" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Điện thoại</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="text-red-600" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Địa điểm</p>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'activity', label: 'Hoạt động' },
                { id: 'skills', label: 'Kỹ năng' },
                { id: 'achievements', label: 'Thành tích' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = iconMap[stat.icon] || Target;
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                          >
                            <Icon
                              className={`text-${stat.color}-600`}
                              size={24}
                            />
                          </div>
                          <Badge variant="success" size="sm">
                            {stat.change}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Performance Chart */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Hiệu suất làm việc năm 2025
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                          }}
                          formatter={(value, name) => {
                            if (name === 'tasks') return [value, 'Nhiệm vụ'];
                            if (name === 'completed')
                              return [value, 'Hoàn thành'];
                            if (name === 'efficiency')
                              return [value + '%', 'Hiệu suất'];
                            return [value, name];
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (value === 'tasks') return 'Nhiệm vụ';
                            if (value === 'completed') return 'Hoàn thành';
                            if (value === 'efficiency') return 'Hiệu suất (%)';
                            return value;
                          }}
                        />
                        <Bar dataKey="tasks" fill="#3b82f6" name="tasks" />
                        <Bar
                          dataKey="completed"
                          fill="#10b981"
                          name="completed"
                        />
                        <Bar
                          dataKey="efficiency"
                          fill="#f59e0b"
                          name="efficiency"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Hoạt động gần đây
                </h3>
                {recentActivities.map((activity) => {
                  const Icon = iconMap[activity.icon] || Clock;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div
                        className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon
                          className={`text-${activity.color}-600`}
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Kỹ năng chuyên môn
                </h3>
                {skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Thành tích & Giải thưởng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => {
                    const Icon = iconMap[achievement.icon] || Trophy;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition"
                      >
                        <div
                          className={`w-16 h-16 bg-${achievement.color}-100 rounded-full flex items-center justify-center`}
                        >
                          <Icon
                            className={`text-${achievement.color}-600`}
                            size={28}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {achievement.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Đạt được năm 2025
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
