// API functions and utilities for CEO Dashboard

// API functions (to be implemented later)
export async function getDashboardSummary() {
  // TODO: Implement real API call
  throw new Error('Not implemented');
}

export async function getTrends(period = 30) {
  // TODO: Implement real API call
  throw new Error('Not implemented');
}

export async function getAlerts() {
  // TODO: Implement real API call
  throw new Error('Not implemented');
}

export async function chatWithAI(message) {
  // TODO: Implement real API call
  throw new Error('Not implemented');
}

// Formatting utilities
export function formatCurrency(value) {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export function formatNumber(value) {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Analysis utilities
export function calculateChange(current, previous) {
  if (previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(2);
}

export function getTrendDirection(change) {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

export function getStatusColor(severity) {
  const colors = {
    high: 'red',
    medium: 'yellow',
    low: 'blue',
  };
  return colors[severity] || 'gray';
}

// Mock data generators
export function generateMockData() {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const baseRevenue = 50000000 + Math.random() * 30000000;
    const baseExpenses = 30000000 + Math.random() * 15000000;
    const profit = baseRevenue - baseExpenses;
    const profitMargin = ((profit / baseRevenue) * 100).toFixed(2);

    data.push({
      date: date.toISOString(),
      revenue: Math.round(baseRevenue),
      expenses: Math.round(baseExpenses),
      profit: Math.round(profit),
      profitMargin: parseFloat(profitMargin),
    });
  }

  return data;
}

export function generateMockSummary() {
  const todayRevenue = 65000000 + Math.random() * 20000000;
  const todayExpenses = 35000000 + Math.random() * 10000000;
  const todayProfit = todayRevenue - todayExpenses;
  const todayProfitMargin = ((todayProfit / todayRevenue) * 100).toFixed(2);

  const yesterdayRevenue = 60000000 + Math.random() * 20000000;
  const yesterdayExpenses = 32000000 + Math.random() * 10000000;
  const yesterdayProfit = yesterdayRevenue - yesterdayExpenses;

  return {
    today: {
      revenue: Math.round(todayRevenue),
      expenses: Math.round(todayExpenses),
      profit: Math.round(todayProfit),
      profitMargin: parseFloat(todayProfitMargin),
    },
    yesterday: {
      revenue: Math.round(yesterdayRevenue),
      expenses: Math.round(yesterdayExpenses),
      profit: Math.round(yesterdayProfit),
    },
    changes: {
      revenue: calculateChange(todayRevenue, yesterdayRevenue),
      expenses: calculateChange(todayExpenses, yesterdayExpenses),
      profit: calculateChange(todayProfit, yesterdayProfit),
    },
  };
}

export function generateMockAlerts() {
  const alerts = [
    {
      id: 1,
      message: 'Chi phí vận hành tăng 15% so với tuần trước',
      severity: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
    {
      id: 2,
      message: 'Doanh thu đạt mục tiêu tháng này',
      severity: 'low',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
    {
      id: 3,
      message: 'Biên lợi nhuận giảm nhẹ trong 3 ngày qua',
      severity: 'medium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: 4,
      message: 'Cần xem xét tối ưu hóa chi phí marketing',
      severity: 'medium',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
  ];

  return alerts;
}
