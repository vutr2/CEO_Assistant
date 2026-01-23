'use client'
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  CreditCard,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { financeAPI } from '@/lib/api';

export default function FinanceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);

  // Fetch financial data when period changes
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all financial data in parallel
        const [overviewData, transactionsData, budgetData] = await Promise.all([
          financeAPI.getOverview(selectedPeriod),
          financeAPI.getTransactions(5),
          financeAPI.getBudget(selectedPeriod),
        ]);

        setFinancialData(overviewData.data);
        setRecentTransactions(transactionsData.data || []);
        setBudgetCategories(budgetData.data?.categories || []);
        setUpcomingPayments(budgetData.data?.upcomingPayments || []);
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError(err.message);
        // No fallback mock data - show error state instead
      } finally{
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [selectedPeriod]);

  const currentData = financialData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const getPeriodLabel = () => {
    const labels = {
      week: 'tuần trước',
      month: 'tháng trước',
      quarter: 'quý trước',
      year: 'năm trước'
    };
    return labels[selectedPeriod];
  };

  // Calculate metrics from current data
  const metrics = currentData ? [
    {
      id: 1,
      title: 'Tổng doanh thu',
      value: formatCurrency(currentData.revenue),
      change: currentData.revenueChange,
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
      description: `So với ${getPeriodLabel()}`
    },
    {
      id: 2,
      title: 'Chi phí',
      value: formatCurrency(currentData.expense),
      change: currentData.expenseChange,
      trend: 'up',
      icon: CreditCard,
      color: 'red',
      description: `So với ${getPeriodLabel()}`
    },
    {
      id: 3,
      title: 'Lợi nhuận ròng',
      value: formatCurrency(currentData.profit),
      change: currentData.profitChange,
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
      description: `So với ${getPeriodLabel()}`
    },
    {
      id: 4,
      title: 'Dòng tiền',
      value: formatCurrency(currentData.cashflow),
      change: currentData.cashflowChange,
      trend: currentData.cashflowChange.includes('-') ? 'down' : 'up',
      icon: Wallet,
      color: 'orange',
      description: `So với ${getPeriodLabel()}`
    }
  ] : [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAddPayment = () => {
    alert('Chức năng thêm thanh toán mới sẽ được triển khai');
  };

  const handleViewAllPayments = () => {
    window.location.href = '/dashboard/settings/billing';
  };

  const handleExportReport = () => {
    if (!currentData) {
      alert('Không có dữ liệu để xuất báo cáo');
      return;
    }

    // Get period label for report title
    const periodLabels = {
      week: 'Tuần',
      month: 'Tháng',
      quarter: 'Quý',
      year: 'Năm'
    };

    // Create report content
    const reportDate = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const reportContent = `
BÁO CÁO TÀI CHÍNH - CEO AI ASSISTANT
=====================================
Kỳ báo cáo: ${periodLabels[selectedPeriod]}
Ngày xuất: ${reportDate}

TỔNG QUAN TÀI CHÍNH
-------------------
Tổng doanh thu:     ${formatCurrency(currentData.revenue)}  (${currentData.revenueChange} so với kỳ trước)
Chi phí:            ${formatCurrency(currentData.expense)}  (${currentData.expenseChange} so với kỳ trước)
Lợi nhuận ròng:     ${formatCurrency(currentData.profit)}  (${currentData.profitChange} so với kỳ trước)
Dòng tiền:          ${formatCurrency(currentData.cashflow)}  (${currentData.cashflowChange} so với kỳ trước)

NGÂN SÁCH THEO DANH MỤC
-----------------------
${budgetCategories.map(cat => {
  const percentage = ((cat.used / cat.total) * 100).toFixed(1);
  return `${cat.name.padEnd(15)} ${formatCurrency(cat.used).padStart(20)} / ${formatCurrency(cat.total).padStart(20)} (${percentage}%)`;
}).join('\n')}

GIAO DỊCH GẦN ĐÂY
-----------------
${recentTransactions.map(t => {
  const sign = t.type === 'income' ? '+' : '-';
  return `${formatDate(t.date)}  ${t.description.padEnd(30)}  ${sign}${formatCurrency(t.amount).padStart(15)}  [${t.status}]`;
}).join('\n')}

THANH TOÁN SẮP TỚI
------------------
${upcomingPayments.map(p => {
  const urgentMark = p.status === 'urgent' ? ' [KHẨN CẤP]' : '';
  return `${formatDate(p.dueDate)}  ${p.description.padEnd(25)}  ${formatCurrency(p.amount).padStart(15)}${urgentMark}`;
}).join('\n')}

=====================================
Báo cáo được tạo tự động bởi CEO AI Assistant
    `.trim();

    // Create and download the file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-tai-chinh-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    alert('Đã xuất báo cáo thành công!');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu tài chính...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu tài chính</h2>
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
              <h1 className="text-3xl font-bold text-gray-900">Tài chính</h1>
              <p className="text-gray-600 mt-1">Theo dõi doanh thu, chi phí và dòng tiền</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
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
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                <span className="text-sm font-medium">Xuất báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              red: 'bg-red-50 text-red-600',
              green: 'bg-green-50 text-green-600',
              orange: 'bg-orange-50 text-orange-600'
            };

            return (
              <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[metric.color]} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  {metric.trend === 'up' ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <ArrowUpRight size={16} />
                      {metric.change}
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 text-sm font-medium">
                      <ArrowDownRight size={16} />
                      {metric.change}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{metric.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Charts & Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Lợi nhuận</h2>
                <p className="text-sm text-gray-500">
                  {selectedPeriod === 'week' && '7 ngày gần nhất'}
                  {selectedPeriod === 'month' && '12 tháng gần nhất'}
                  {selectedPeriod === 'quarter' && '4 quý gần nhất'}
                  {selectedPeriod === 'year' && '5 năm gần nhất'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-400" />
              </div>
            </div>
            {/* Simple Chart Visualization */}
            <div className="space-y-3">
              {(() => {
                const chartData = {
                  week: [
                    { label: 'T2', profit: 46, amount: 161000000 },
                    { label: 'T3', profit: 52, amount: 182000000 },
                    { label: 'T4', profit: 44, amount: 154000000 },
                    { label: 'T5', profit: 58, amount: 203000000 },
                    { label: 'T6', profit: 51, amount: 178000000 },
                    { label: 'T7', profit: 48, amount: 168000000 },
                    { label: 'CN', profit: 38, amount: 133000000 }
                  ],
                  month: [
                    { label: 'T1', profit: 48, amount: 1368000000 },
                    { label: 'T2', profit: 42, amount: 1197000000 },
                    { label: 'T3', profit: 52, amount: 1482000000 },
                    { label: 'T4', profit: 45, amount: 1282000000 },
                    { label: 'T5', profit: 58, amount: 1652000000 },
                    { label: 'T6', profit: 50, amount: 1425000000 },
                    { label: 'T7', profit: 47, amount: 1339000000 },
                    { label: 'T8', profit: 60, amount: 1710000000 },
                    { label: 'T9', profit: 52, amount: 1482000000 },
                    { label: 'T10', profit: 56, amount: 1596000000 },
                    { label: 'T11', profit: 54, amount: 1539000000 },
                    { label: 'T12', profit: 62, amount: 1767000000 }
                  ],
                  quarter: [
                    { label: 'Q1', profit: 48, amount: 4104000000 },
                    { label: 'Q2', profit: 55, amount: 4709000000 },
                    { label: 'Q3', profit: 52, amount: 4446000000 },
                    { label: 'Q4', profit: 60, amount: 5133000000 }
                  ],
                  year: [
                    { label: '2021', profit: 42, amount: 7138500000 },
                    { label: '2022', profit: 48, amount: 8156400000 },
                    { label: '2023', profit: 52, amount: 8836200000 },
                    { label: '2024', profit: 56, average: 9516000000 },
                    { label: '2025', profit: 62, amount: 10537200000 }
                  ]
                };
                return chartData[selectedPeriod];
              })().map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-8">{data.label}</span>
                  <div className="flex-1">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-10 rounded-lg flex items-center justify-between px-3 shadow-sm hover:shadow-md transition"
                      style={{ width: `${data.profit}%` }}
                    >
                      <span className="text-xs text-white font-semibold">{data.profit}%</span>
                      <span className="text-xs text-white/90">{formatCurrency(data.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded"></div>
                <span className="text-sm text-gray-600">Tỷ suất lợi nhuận (%)</span>
              </div>
              <span className="text-xs text-gray-500">Lợi nhuận / Doanh thu × 100</span>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ngân sách</h2>
                <p className="text-sm text-gray-500">Theo danh mục</p>
              </div>
              <PieChartIcon size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {budgetCategories.map((category, index) => {
                const percentage = (category.used / category.total) * 100;
                const colorClasses = {
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  purple: 'bg-purple-500',
                  orange: 'bg-orange-500',
                  pink: 'bg-pink-500'
                };

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className="text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${colorClasses[category.color]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatCurrency(category.used)}
                      </span>
                      <span className="text-xs text-gray-500">
                        / {formatCurrency(category.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Giao dịch gần đây</h2>
                  <p className="text-sm text-gray-500">5 giao dịch mới nhất</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  Xem tất cả
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownRight size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{transaction.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                          <CheckCircle size={12} />
                          Hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-600 mt-1">
                          <Clock size={12} />
                          Đang xử lý
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Thanh toán sắp tới</h2>
                  <p className="text-sm text-gray-500">Cần xử lý</p>
                </div>
                <button
                  onClick={handleAddPayment}
                  className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    payment.status === 'urgent'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{payment.description}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        Hạn: {formatDate(payment.dueDate)}
                      </p>
                    </div>
                    {payment.status === 'urgent' && (
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <button
                onClick={handleViewAllPayments}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
