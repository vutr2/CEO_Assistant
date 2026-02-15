'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Download,
  Bell,
  Menu,
  X,
  BarChart3,
  Activity,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CreditCard,
  Link2,
  Copy,
  Check,
  Trash2,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getDashboardSummary,
  getTrends,
  getAlerts,
  chatWithAI,
  formatCurrency,
  formatNumber,
  formatDate,
  calculateChange,
  getTrendDirection,
  getStatusColor,
} from '../../lib/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [period, setPeriod] = useState(30);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [planStatus, setPlanStatus] = useState(null); // 'free' | 'pro' | 'expired'
  const [planCancelled, setPlanCancelled] = useState(false);
  const [planDaysLeft, setPlanDaysLeft] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = user?.userId;
      const [summaryResult, trendsResult, alertsResult] = await Promise.allSettled([
        getDashboardSummary(userId),
        getTrends(userId, period),
        getAlerts(userId),
      ]);

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        console.error('Failed to fetch summary:', summaryResult.reason);
        setSummary(null);
      }

      if (trendsResult.status === 'fulfilled') {
        setTrends(Array.isArray(trendsResult.value) ? trendsResult.value : []);
      } else {
        console.error('Failed to fetch trends:', trendsResult.reason);
        setTrends([]);
      }

      if (alertsResult.status === 'fulfilled') {
        setAlerts(Array.isArray(alertsResult.value) ? alertsResult.value : []);
      } else {
        console.error('Failed to fetch alerts:', alertsResult.reason);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, period]);

  useEffect(() => {
    if (user?.userId) {
      loadDashboardData();
    }
  }, [loadDashboardData, user?.userId]);

  // Fetch plan status
  useEffect(() => {
    if (!user?.userId) return;
    fetch('/api/user/plan', { headers: { 'x-user-id': user.userId } })
      .then((r) => r.json())
      .then((d) => {
        setPlanStatus(d.plan);
        setPlanCancelled(d.cancelled || false);
        setPlanDaysLeft(d.daysLeft);
      })
      .catch(() => {});
  }, [user?.userId]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const userId = user?.userId;
      const response = await chatWithAI(userId, chatInput, chatMessages);
      const aiMessage = {
        role: 'assistant',
        content: response.message || response.output || 'Không có phản hồi từ AI.',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-[#a0a0b8] font-display">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#14141f] to-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gradient">
                  CEO Dashboard
                </h1>
                <p className="text-xs text-[#6b6b80] font-mono">
                  AI-Powered Analytics
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {[
                { id: 'dashboard', label: 'Tổng quan', icon: Activity },
                { id: 'analytics', label: 'Phân tích', icon: BarChart3 },
                { id: 'chat', label: 'AI Chat', icon: MessageSquare },
                { id: 'alerts', label: 'Cảnh báo', icon: Bell },
                { id: 'sheets', label: 'Kết nối', icon: FileSpreadsheet },
                {
                  id: 'billing',
                  label: 'Billing',
                  icon: CreditCard,
                  href: '/billing',
                },
              ].map((tab) =>
                tab.href ? (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-all text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e]"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </Link>
                ) : (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#d4af37]/20 text-[#d4af37] shadow-lg shadow-[#d4af37]/20'
                        : 'text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all">
                <Bell className="w-5 h-5" />
                {alerts.filter((a) => !a.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative profile-menu">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#c19a6b] flex items-center justify-center text-sm font-bold text-[#0a0a0f]">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] shadow-xl shadow-black/50 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-[#2a2a3e]">
                      <p className="text-white font-semibold truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-[#6b6b80] text-sm truncate">
                        {user?.email || 'email@example.com'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e] transition-all"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-[#2a2a3e] transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e]"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Plan Banners */}
      {planStatus === 'free' && (
        <div className="bg-[#d4af37]/10 border-b border-[#d4af37]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <span className="text-[#d4af37] text-sm">
              Nâng cấp Pro để sử dụng AI Chat và tính năng nâng cao.
            </span>
            <Link
              href="/billing"
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 transition-all"
            >
              Xem gói Pro →
            </Link>
          </div>
        </div>
      )}
      {planStatus === 'pro' && planCancelled && (
        <div className="bg-amber-500/10 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <span className="text-amber-300 text-sm">
              Gói Pro đã hủy — còn sử dụng được <strong className="text-amber-200">{planDaysLeft} ngày</strong>.
            </span>
            <Link
              href="/billing"
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-all"
            >
              Gia hạn →
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            trends={trends}
            period={period}
            setPeriod={setPeriod}
            planStatus={planStatus}
            user={user}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsView trends={trends} />}
        {activeTab === 'chat' && (
          <ChatView
            messages={chatMessages}
            input={chatInput}
            setInput={setChatInput}
            onSubmit={handleChat}
            isTyping={isTyping}
            planStatus={planStatus}
          />
        )}
        {activeTab === 'alerts' && <AlertsView alerts={alerts} planStatus={planStatus} />}
        {activeTab === 'sheets' && <SheetsView user={user} planStatus={planStatus} />}
      </main>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ summary, trends, period, setPeriod, planStatus, user }) {
  const [exporting, setExporting] = useState(false);
  const [showExportUpgrade, setShowExportUpgrade] = useState(false);

  const handleExport = async () => {
    if (planStatus === 'free') {
      setShowExportUpgrade(true);
      return;
    }
    setExporting(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId, period }),
      });
      if (res.status === 403) {
        setShowExportUpgrade(true);
        return;
      }
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-kinh-doanh-${period}ngay.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!summary) return null;

  const revenueChange = parseFloat(summary.changes.revenue);
  const expensesChange = parseFloat(summary.changes.expenses);
  const profitChange = parseFloat(summary.changes.profit);

  return (
    <div className="space-y-6 animate-in">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Chào buổi sáng, <span className="text-gradient">CEO</span>
          </h2>
          <p className="text-[#a0a0b8]">
            Dưới đây là tổng quan kinh doanh của bạn hôm nay
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] text-white focus:outline-none focus:border-[#d4af37]"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              planStatus === 'free'
                ? 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6b80] hover:text-[#d4af37] hover:border-[#d4af37]/50'
                : 'bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30'
            }`}
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#d4af37] border-t-transparent"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {planStatus === 'free' ? 'Export Pro' : 'Export Excel'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Doanh thu hôm nay',
            value: summary.today.revenue,
            change: revenueChange,
            icon: DollarSign,
            color: 'from-emerald-500 to-teal-600',
          },
          {
            title: 'Chi phí',
            value: summary.today.expenses,
            change: expensesChange,
            icon: TrendingDown,
            color: 'from-orange-500 to-red-600',
          },
          {
            title: 'Lợi nhuận',
            value: summary.today.profit,
            change: profitChange,
            icon: PieChart,
            color: 'from-violet-500 to-purple-600',
          },
          {
            title: 'Biên lợi nhuận',
            value: `${summary.today.profitMargin}%`,
            change: 0,
            icon: Activity,
            color: 'from-blue-500 to-cyan-600',
            isPercentage: true,
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="card-luxury rounded-2xl p-6 hover-lift animate-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}
              >
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              {!kpi.isPercentage && kpi.change !== 0 && (
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                    kpi.change > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {kpi.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-xs font-mono font-semibold">
                    {Math.abs(kpi.change)}%
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-[#a0a0b8] text-sm mb-2">{kpi.title}</h3>
            <p className="text-2xl font-display font-bold text-white">
              {kpi.isPercentage ? kpi.value : formatCurrency(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profit Trend */}
        <div className="card-luxury rounded-2xl p-6 animate-in-delay-1">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            Xu hướng Doanh thu & Lợi nhuận
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis
                dataKey="date"
                stroke="#6b6b80"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis
                stroke="#6b6b80"
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value) => [formatCurrency(value), '']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Doanh thu"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#d4af37"
                fillOpacity={1}
                fill="url(#colorProfit)"
                name="Lợi nhuận"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses Breakdown */}
        <div className="card-luxury rounded-2xl p-6 animate-in-delay-2">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            Chi phí theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis
                dataKey="date"
                stroke="#6b6b80"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis
                stroke="#6b6b80"
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #2a2a3e',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value) => [formatCurrency(value), 'Chi phí']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Bar dataKey="expenses" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Margin Trend */}
      <div className="card-luxury rounded-2xl p-6 animate-in-delay-3">
        <h3 className="text-xl font-display font-bold text-white mb-6">
          Biên lợi nhuận (%)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis
              dataKey="date"
              stroke="#6b6b80"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="#6b6b80" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #2a2a3e',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value) => [`${value}%`, 'Biên lợi nhuận']}
              labelFormatter={(label) => formatDate(label)}
            />
            <Line
              type="monotone"
              dataKey="profitMargin"
              stroke="#d4af37"
              strokeWidth={3}
              dot={{ fill: '#d4af37', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Export upgrade modal */}
      {showExportUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card-luxury rounded-2xl p-8 max-w-md w-full mx-4 border border-[#2a2a3e]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/20 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Tính năng Pro
              </h3>
              <p className="text-[#a0a0b8] mb-6">
                Export báo cáo Excel giúp bạn tải về dữ liệu kinh doanh để chia sẻ với đội ngũ và đối tác. Nâng cấp Pro để sử dụng.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExportUpgrade(false)}
                  className="flex-1 py-3 rounded-lg font-semibold bg-[#1a1a2e] border border-[#2a2a3e] text-white hover:bg-[#2a2a3e] transition-all"
                >
                  Đóng
                </button>
                <Link
                  href="/billing"
                  className="flex-1 py-3 rounded-lg font-semibold text-center bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] hover:shadow-xl hover:shadow-[#d4af37]/40 transition-all"
                >
                  Nâng cấp Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ trends }) {
  const totalRevenue = trends.reduce((sum, day) => sum + day.revenue, 0);
  const totalExpenses = trends.reduce((sum, day) => sum + day.expenses, 0);
  const totalProfit = trends.reduce((sum, day) => sum + day.profit, 0);
  const avgProfitMargin = (
    trends.reduce((sum, day) => sum + day.profitMargin, 0) / trends.length
  ).toFixed(2);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          Phân tích chi tiết
        </h2>
        <p className="text-[#a0a0b8]">
          Báo cáo tổng hợp và xu hướng kinh doanh
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Tổng doanh thu',
            value: totalRevenue,
            icon: DollarSign,
            color: 'emerald',
          },
          {
            label: 'Tổng chi phí',
            value: totalExpenses,
            icon: TrendingDown,
            color: 'orange',
          },
          {
            label: 'Tổng lợi nhuận',
            value: totalProfit,
            icon: TrendingUp,
            color: 'violet',
          },
          {
            label: 'Biên LN trung bình',
            value: `${avgProfitMargin}%`,
            icon: PieChart,
            color: 'blue',
            isPercent: true,
          },
        ].map((item, idx) => (
          <div key={idx} className="card-luxury rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}
              >
                <item.icon className={`w-5 h-5 text-${item.color}-400`} />
              </div>
              <span className="text-[#a0a0b8] text-sm">{item.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">
              {item.isPercent ? item.value : formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Chart */}
      <div className="card-luxury rounded-2xl p-6">
        <h3 className="text-xl font-display font-bold text-white mb-6">
          Phân tích tổng hợp
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
            <XAxis
              dataKey="date"
              stroke="#6b6b80"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke="#6b6b80"
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #2a2a3e',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value) => [formatCurrency(value), '']}
              labelFormatter={(label) => formatDate(label)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              name="Doanh thu"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Chi phí"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#d4af37"
              strokeWidth={2}
              name="Lợi nhuận"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Chat View Component
function ChatView({ messages, input, setInput, onSubmit, isTyping, planStatus }) {
  if (planStatus === 'free') {
    return (
      <div className="space-y-6 animate-in">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            AI Assistant
          </h2>
          <p className="text-[#a0a0b8]">
            Hỏi bất kỳ điều gì về dữ liệu kinh doanh của bạn
          </p>
        </div>
        <div className="card-luxury rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#d4af37]/20 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-[#d4af37]" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-3">
            Tính năng Pro
          </h3>
          <p className="text-[#a0a0b8] mb-6 max-w-md">
            AI Chat giúp bạn hỏi về doanh thu, chi phí, lợi nhuận và đưa ra gợi ý kinh doanh thông minh. Nâng cấp Pro để sử dụng.
          </p>
          <Link
            href="/billing"
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] hover:shadow-xl hover:shadow-[#d4af37]/40 hover:scale-[1.02] transition-all"
          >
            Nâng cấp Pro →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          AI Assistant
        </h2>
        <p className="text-[#a0a0b8]">
          Hỏi bất kỳ điều gì về dữ liệu kinh doanh của bạn
        </p>
      </div>

      <div className="card-luxury rounded-2xl p-6 h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-[#d4af37] mx-auto mb-4" />
                <p className="text-[#a0a0b8]">Bắt đầu cuộc trò chuyện với AI</p>
                <p className="text-[#6b6b80] text-sm mt-2">
                  Ví dụ: Doanh thu hôm nay thế nào?
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#d4af37]/20 text-white'
                      : 'bg-[#1a1a2e] text-white border border-[#2a2a3e]'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs text-[#6b6b80] mt-1 block">
                    {msg.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a2e] rounded-2xl px-4 py-3 border border-[#2a2a3e]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={onSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#d4af37]"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-semibold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Alerts View Component
function AlertsView({ alerts, planStatus }) {
  if (planStatus === 'free') {
    return (
      <div className="space-y-6 animate-in">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Cảnh báo & Thông báo
          </h2>
          <p className="text-[#a0a0b8]">Các vấn đề quan trọng cần chú ý</p>
        </div>
        <div className="card-luxury rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#d4af37]/20 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-[#d4af37]" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-3">
            Tính năng Pro
          </h3>
          <p className="text-[#a0a0b8] mb-6 max-w-md">
            Cảnh báo thông minh tự động phát hiện các vấn đề về doanh thu giảm, chi phí tăng đột biến và biên lợi nhuận thấp. Nâng cấp Pro để sử dụng.
          </p>
          <Link
            href="/billing"
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] hover:shadow-xl hover:shadow-[#d4af37]/40 hover:scale-[1.02] transition-all"
          >
            Nâng cấp Pro →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          Cảnh báo & Thông báo
        </h2>
        <p className="text-[#a0a0b8]">Các vấn đề quan trọng cần chú ý</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`card-luxury rounded-2xl p-6 flex items-start space-x-4 ${
              !alert.isRead ? 'border-l-4 border-[#d4af37]' : ''
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                alert.severity === 'high'
                  ? 'bg-red-500/20'
                  : alert.severity === 'medium'
                    ? 'bg-yellow-500/20'
                    : 'bg-blue-500/20'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  alert.severity === 'high'
                    ? 'text-red-400'
                    : alert.severity === 'medium'
                      ? 'text-yellow-400'
                      : 'text-blue-400'
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-1">{alert.message}</p>
              <p className="text-[#6b6b80] text-sm">
                {new Date(alert.timestamp).toLocaleString('vi-VN')}
              </p>
            </div>
            {!alert.isRead && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-semibold">
                Mới
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sheets Connection View Component
function SheetsView({ user, planStatus }) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [connectedSheet, setConnectedSheet] = useState(null);
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (user?.userId) loadConnection();
  }, [user?.userId]);

  const loadConnection = async () => {
    try {
      const res = await fetch('/api/sheets/connect', {
        headers: { 'x-user-id': user.userId },
      });
      if (res.ok) {
        const data = await res.json();
        setConnectedSheet(data.sheet);
        setServiceAccountEmail(data.serviceAccountEmail || '');
      }
    } catch (err) {
      console.error('Failed to load connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!sheetUrl.trim()) {
      setError('Vui lòng nhập URL Google Sheets');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/sheets/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, sheetUrl, email: user.email, name: user.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setConnectedSheet(data.sheet);
        setSheetUrl('');
      } else {
        setError(data.error || 'Không thể kết nối');
        if (data.serviceAccountEmail) {
          setServiceAccountEmail(data.serviceAccountEmail);
        }
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/sheets/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId }),
      });
      setConnectedSheet(null);
      setSyncResult(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);
    try {
      const res = await fetch('/api/sheets/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(data);
        await loadConnection();
      } else {
        setError(data.error || 'Đồng bộ thất bại');
      }
    } catch (err) {
      setError('Lỗi đồng bộ: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          Kết nối Google Sheets
        </h2>
        <p className="text-[#a0a0b8]">
          Nhân viên nhập dữ liệu vào Google Sheets, nhấn đồng bộ để cập nhật Dashboard
        </p>
      </div>

      {/* Step-by-step guide with service account email */}
      <div className="card-luxury rounded-2xl p-6">
        <h3 className="text-xl font-display font-bold text-white mb-5">
          Hướng dẫn kết nối (chỉ 3 bước)
        </h3>
        <div className="space-y-5">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-lg shrink-0">
              1
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold mb-2">Cấp quyền xem cho hệ thống</p>
              <p className="text-[#a0a0b8] text-sm mb-3">
                Mở Google Sheet của bạn → nhấn nút <span className="text-white font-semibold">Chia sẻ (Share)</span> ở góc trên bên phải → dán email bên dưới vào → chọn quyền <span className="text-white font-semibold">Người xem (Viewer)</span> → nhấn <span className="text-white font-semibold">Gửi (Send)</span>
              </p>
              {serviceAccountEmail && (
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-3 rounded-lg bg-[#0a0a0f] border border-[#2a2a3e] text-[#d4af37] font-mono text-sm break-all">
                    {serviceAccountEmail}
                  </code>
                  <button
                    onClick={() => copyToClipboard(serviceAccountEmail, 'email')}
                    className="p-3 rounded-lg border border-[#2a2a3e] text-[#a0a0b8] hover:text-white hover:bg-[#1a1a2e] transition-all shrink-0"
                  >
                    {copiedId === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-lg shrink-0">
              2
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Dán link Google Sheet vào ô bên dưới</p>
              <p className="text-[#a0a0b8] text-sm">
                Copy đường link trên thanh địa chỉ trình duyệt khi đang mở Google Sheet, rồi dán vào ô &quot;Kết nối&quot; phía dưới.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-lg shrink-0">
              3
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Nhấn &quot;Đồng bộ ngay&quot;</p>
              <p className="text-[#a0a0b8] text-sm">
                Dữ liệu từ Google Sheet sẽ tự động được đọc và hiển thị trên Dashboard. Mỗi khi nhân viên cập nhật sheet, bạn chỉ cần nhấn đồng bộ lại.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Card */}
      <div className="card-luxury rounded-2xl p-6">
        <h3 className="text-xl font-display font-bold text-white mb-4">
          {connectedSheet ? 'Sheet đã kết nối' : 'Kết nối Google Sheet'}
        </h3>

        {loading ? (
          <p className="text-[#6b6b80]">Đang tải...</p>
        ) : connectedSheet ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-emerald-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold">{connectedSheet.sheet_name || 'Google Sheet'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Đã kết nối</span>
              </div>
              <code className="text-[#6b6b80] text-xs font-mono block truncate mb-2">
                {connectedSheet.sheet_url}
              </code>
              {connectedSheet.last_sync_at && (
                <p className="text-[#6b6b80] text-xs">
                  Đồng bộ lần cuối: {new Date(connectedSheet.last_sync_at).toLocaleString('vi-VN')}
                </p>
              )}
              {planStatus === 'pro' ? (
                <div className="mt-2 flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-emerald-400 text-xs font-medium">Tự động đồng bộ mỗi ngày</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center space-x-1.5">
                  <span className="text-[#6b6b80] text-xs">Nâng cấp Pro để tự động đồng bộ mỗi ngày</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0a0a0f] border-t-transparent"></div>
                    <span>Đang đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Đồng bộ ngay</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-3 rounded-xl border border-[#2a2a3e] text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ngắt kết nối</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#d4af37]"
              />
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c19a6b] text-[#0a0a0f] font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0a0a0f] border-t-transparent"></div>
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    <span>Kết nối</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <p>{error}</p>
          </div>
        )}

        {/* Sync Result */}
        {syncResult && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-emerald-400 font-semibold mb-2">Đồng bộ thành công!</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(syncResult.results).map(([tabName, info]) => (
                <div key={tabName} className="text-center">
                  <p className="text-2xl font-bold text-white">{info.count}</p>
                  <p className="text-[#6b6b80] text-xs">{tabName}</p>
                  <p className="text-[#4b4b60] text-[10px]">
                    {info.type === 'known' ? info.sheetType : 'custom'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sheet Structure */}
      <div className="card-luxury rounded-2xl p-6">
        <h3 className="text-xl font-display font-bold text-white mb-4">
          Cấu trúc các tab trong Google Sheets
        </h3>
        <p className="text-[#a0a0b8] mb-4">
          Tạo Google Sheets với các tab sau. Dòng đầu tiên là header. Bạn có thể thêm cột và tab tùy ý — hệ thống sẽ tự động đọc tất cả.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'DonHang',
              columns: ['Ngày', 'Khách hàng', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Trạng thái', 'Ghi chú'],
            },
            {
              name: 'ChiPhi',
              columns: ['Ngày', 'Danh mục', 'Mô tả', 'Số tiền', 'Người chi', 'Ghi chú'],
            },
            {
              name: 'KhoHang',
              columns: ['Ngày', 'Sản phẩm', 'Nhập kho', 'Xuất kho', 'Tồn kho', 'Ghi chú'],
            },
            {
              name: 'NhanSu',
              columns: ['Tên NV', 'Chức vụ', 'Phòng ban', 'Lương', 'Ngày BĐ', 'Trạng thái', 'Ghi chú'],
            },
          ].map((sheet) => (
            <div key={sheet.name} className="p-4 rounded-xl bg-[#0a0a0f]/50 border border-[#2a2a3e]">
              <div className="flex items-center space-x-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold font-mono">{sheet.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sheet.columns.map((col, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md bg-[#1a1a2e] text-[#a0a0b8] text-xs"
                  >
                    {String.fromCharCode(65 + i)}: {col}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
