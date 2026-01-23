// Multi-tenant Financial Service
// Data is stored per company using companyId as key

const dataByCompany = {};
let revenueIdCounter = 1;
let expenseIdCounter = 1;
let budgetIdCounter = 1;

// Initialize company data if not exists
const initCompanyData = (companyId) => {
  const key = companyId?.toString() || 'default';
  if (!dataByCompany[key]) {
    dataByCompany[key] = {
      revenue: [],
      expenses: [],
      budgets: []
    };
    generateMockDataForCompany(key);
  }
  return dataByCompany[key];
};

// Generate mock financial data for a company
const generateMockDataForCompany = (companyKey) => {
  const data = dataByCompany[companyKey];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Generate revenue for last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 15);
    data.revenue.push({
      id: revenueIdCounter++,
      companyId: companyKey,
      amount: Math.floor(Math.random() * 500000000) + 300000000, // VND
      source: ['Bán hàng', 'Dịch vụ', 'Đăng ký', 'Tư vấn'][Math.floor(Math.random() * 4)],
      category: 'revenue',
      date: date.toISOString(),
      description: `Doanh thu ${date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`,
      createdAt: date.toISOString()
    });
  }

  // Generate expenses for last 12 months
  const expenseCategories = ['Lương', 'Marketing', 'Thuê văn phòng', 'Công nghệ', 'Điện nước', 'Công tác'];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, Math.floor(Math.random() * 28) + 1);
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    data.expenses.push({
      id: expenseIdCounter++,
      companyId: companyKey,
      amount: Math.floor(Math.random() * 150000000) + 50000000, // VND
      category,
      date: date.toISOString(),
      description: `Chi phí ${category} ${date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`,
      vendor: `Nhà cung cấp ${Math.floor(Math.random() * 100)}`,
      status: ['paid', 'pending', 'overdue'][Math.floor(Math.random() * 3)],
      createdAt: date.toISOString()
    });
  }

  // Generate budget for current year
  data.budgets.push({
    id: budgetIdCounter++,
    companyId: companyKey,
    year: currentYear,
    totalBudget: 5000000000,
    categories: {
      salaries: 2000000000,
      marketing: 800000000,
      technology: 700000000,
      operations: 500000000,
      other: 1000000000
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

// Helper functions
function isSameMonth(date1, date2) {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

function calculateMetrics(data, period) {
  const currentDate = new Date();
  let current = 0;
  let previous = 0;

  if (period === 'monthly') {
    current = data
      .filter(item => new Date(item.date).getMonth() === currentDate.getMonth())
      .reduce((sum, item) => sum + item.amount, 0);

    previous = data
      .filter(item => new Date(item.date).getMonth() === currentDate.getMonth() - 1)
      .reduce((sum, item) => sum + item.amount, 0);
  }

  const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  return { current, previous, growth };
}

function getTopExpenseCategories(expenseData) {
  const categoryTotals = {};

  expenseData.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });

  return Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));
}

const financeService = {
  /**
   * Get financial overview for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  getFinancialOverview: async (companyId) => {
    const data = initCompanyData(companyId);
    const revenueData = data.revenue;
    const expenseData = data.expenses;
    const currentMonth = new Date().getMonth();

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Current month data
    const currentMonthRevenue = revenueData
      .filter(item => new Date(item.date).getMonth() === currentMonth)
      .reduce((sum, item) => sum + item.amount, 0);

    const currentMonthExpenses = expenseData
      .filter(item => new Date(item.date).getMonth() === currentMonth)
      .reduce((sum, item) => sum + item.amount, 0);

    // Calculate growth rates
    const lastMonthRevenue = revenueData
      .filter(item => new Date(item.date).getMonth() === currentMonth - 1)
      .reduce((sum, item) => sum + item.amount, 0);

    const revenueGrowth = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      currentMonth: {
        revenue: currentMonthRevenue,
        expenses: currentMonthExpenses,
        profit: currentMonthRevenue - currentMonthExpenses
      },
      growth: {
        revenue: revenueGrowth.toFixed(2),
        expenses: 0
      },
      topExpenseCategories: getTopExpenseCategories(expenseData)
    };
  },

  /**
   * Get all revenue records for a company
   */
  getRevenue: async (companyId, filters = {}) => {
    const data = initCompanyData(companyId);
    let filtered = [...data.revenue];

    if (filters.startDate) {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(item => new Date(item.date) <= new Date(filters.endDate));
    }
    if (filters.source) {
      filtered = filtered.filter(item => item.source === filters.source);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Add new revenue record
   */
  addRevenue: async (companyId, revenueRecord) => {
    const data = initCompanyData(companyId);
    const newRevenue = {
      id: revenueIdCounter++,
      companyId,
      ...revenueRecord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.revenue.push(newRevenue);
    return newRevenue;
  },

  /**
   * Get revenue by ID
   */
  getRevenueById: async (companyId, id) => {
    const data = initCompanyData(companyId);
    return data.revenue.find(item => item.id === parseInt(id));
  },

  /**
   * Update revenue record
   */
  updateRevenue: async (companyId, id, updateData) => {
    const data = initCompanyData(companyId);
    const index = data.revenue.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    data.revenue[index] = {
      ...data.revenue[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return data.revenue[index];
  },

  /**
   * Delete revenue record
   */
  deleteRevenue: async (companyId, id) => {
    const data = initCompanyData(companyId);
    const index = data.revenue.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;

    data.revenue.splice(index, 1);
    return true;
  },

  /**
   * Get all expenses for a company
   */
  getExpenses: async (companyId, filters = {}) => {
    const data = initCompanyData(companyId);
    let filtered = [...data.expenses];

    if (filters.startDate) {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(item => new Date(item.date) <= new Date(filters.endDate));
    }
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Add new expense record
   */
  addExpense: async (companyId, expenseRecord) => {
    const data = initCompanyData(companyId);
    const newExpense = {
      id: expenseIdCounter++,
      companyId,
      ...expenseRecord,
      status: expenseRecord.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.expenses.push(newExpense);
    return newExpense;
  },

  /**
   * Get expense by ID
   */
  getExpenseById: async (companyId, id) => {
    const data = initCompanyData(companyId);
    return data.expenses.find(item => item.id === parseInt(id));
  },

  /**
   * Update expense record
   */
  updateExpense: async (companyId, id, updateData) => {
    const data = initCompanyData(companyId);
    const index = data.expenses.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    data.expenses[index] = {
      ...data.expenses[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return data.expenses[index];
  },

  /**
   * Delete expense record
   */
  deleteExpense: async (companyId, id) => {
    const data = initCompanyData(companyId);
    const index = data.expenses.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;

    data.expenses.splice(index, 1);
    return true;
  },

  /**
   * Get financial metrics
   */
  getFinancialMetrics: async (companyId, period = 'monthly') => {
    const data = initCompanyData(companyId);
    const metrics = {
      revenue: calculateMetrics(data.revenue, period),
      expenses: calculateMetrics(data.expenses, period),
      profit: {
        current: 0,
        previous: 0,
        growth: 0
      }
    };

    metrics.profit.current = metrics.revenue.current - metrics.expenses.current;
    metrics.profit.previous = metrics.revenue.previous - metrics.expenses.previous;
    metrics.profit.growth = metrics.profit.previous > 0
      ? ((metrics.profit.current - metrics.profit.previous) / metrics.profit.previous) * 100
      : 0;

    return metrics;
  },

  /**
   * Get financial trends
   */
  getFinancialTrends: async (companyId, months = 12) => {
    const data = initCompanyData(companyId);
    const trends = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthRevenue = data.revenue
        .filter(item => isSameMonth(new Date(item.date), targetDate))
        .reduce((sum, item) => sum + item.amount, 0);

      const monthExpenses = data.expenses
        .filter(item => isSameMonth(new Date(item.date), targetDate))
        .reduce((sum, item) => sum + item.amount, 0);

      trends.push({
        month: targetDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      });
    }

    return trends;
  },

  /**
   * Get financial forecast
   */
  getFinancialForecast: async (companyId, months = 6) => {
    const trends = await financeService.getFinancialTrends(companyId, 12);
    const avgRevenue = trends.reduce((sum, item) => sum + item.revenue, 0) / trends.length;
    const avgExpenses = trends.reduce((sum, item) => sum + item.expenses, 0) / trends.length;

    const forecast = [];
    const currentDate = new Date();

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const revenueGrowth = 1 + (Math.random() * 0.1 - 0.05);
      const expenseGrowth = 1 + (Math.random() * 0.08 - 0.04);

      forecast.push({
        month: forecastDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        predictedRevenue: Math.round(avgRevenue * revenueGrowth),
        predictedExpenses: Math.round(avgExpenses * expenseGrowth),
        confidence: 85 - (i * 5)
      });
    }

    return forecast;
  },

  /**
   * Get budget
   */
  getBudget: async (companyId, year) => {
    const data = initCompanyData(companyId);
    const targetYear = year || new Date().getFullYear();
    return data.budgets.find(budget => budget.year === parseInt(targetYear));
  },

  /**
   * Create budget
   */
  createBudget: async (companyId, budgetInfo) => {
    const data = initCompanyData(companyId);
    const newBudget = {
      id: budgetIdCounter++,
      companyId,
      ...budgetInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.budgets.push(newBudget);
    return newBudget;
  },

  /**
   * Update budget
   */
  updateBudget: async (companyId, id, updateData) => {
    const data = initCompanyData(companyId);
    const index = data.budgets.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    data.budgets[index] = {
      ...data.budgets[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return data.budgets[index];
  },

  /**
   * Get cash flow data
   */
  getCashFlow: async (companyId, months = 12) => {
    const data = initCompanyData(companyId);
    const cashFlow = [];
    const currentDate = new Date();
    let runningBalance = 1000000000; // Starting balance

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthRevenue = data.revenue
        .filter(item => isSameMonth(new Date(item.date), targetDate))
        .reduce((sum, item) => sum + item.amount, 0);

      const monthExpenses = data.expenses
        .filter(item => isSameMonth(new Date(item.date), targetDate))
        .reduce((sum, item) => sum + item.amount, 0);

      const netCashFlow = monthRevenue - monthExpenses;
      runningBalance += netCashFlow;

      cashFlow.push({
        month: targetDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        inflow: monthRevenue,
        outflow: monthExpenses,
        netCashFlow,
        balance: runningBalance
      });
    }

    return cashFlow;
  },

  /**
   * Get overview by period (for Finance Dashboard page)
   */
  getOverviewByPeriod: async (companyId, period = 'month') => {
    const data = initCompanyData(companyId);
    const revenueData = data.revenue;
    const expenseData = data.expenses;
    const currentDate = new Date();
    let revenue = 0;
    let expense = 0;
    let prevRevenue = 0;
    let prevExpense = 0;

    if (period === 'week') {
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      revenue = revenueData.filter(item => new Date(item.date) >= weekAgo).reduce((sum, item) => sum + item.amount, 0);
      expense = expenseData.filter(item => new Date(item.date) >= weekAgo).reduce((sum, item) => sum + item.amount, 0);

      const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevRevenue = revenueData.filter(item => new Date(item.date) >= twoWeeksAgo && new Date(item.date) < weekAgo).reduce((sum, item) => sum + item.amount, 0);
      prevExpense = expenseData.filter(item => new Date(item.date) >= twoWeeksAgo && new Date(item.date) < weekAgo).reduce((sum, item) => sum + item.amount, 0);
    } else if (period === 'month') {
      revenue = revenueData.filter(item => new Date(item.date).getMonth() === currentDate.getMonth()).reduce((sum, item) => sum + item.amount, 0);
      expense = expenseData.filter(item => new Date(item.date).getMonth() === currentDate.getMonth()).reduce((sum, item) => sum + item.amount, 0);

      const lastMonth = currentDate.getMonth() - 1;
      prevRevenue = revenueData.filter(item => new Date(item.date).getMonth() === lastMonth).reduce((sum, item) => sum + item.amount, 0);
      prevExpense = expenseData.filter(item => new Date(item.date).getMonth() === lastMonth).reduce((sum, item) => sum + item.amount, 0);
    } else if (period === 'quarter') {
      const quarter = Math.floor(currentDate.getMonth() / 3);
      const startMonth = quarter * 3;
      revenue = revenueData.filter(item => {
        const month = new Date(item.date).getMonth();
        return month >= startMonth && month < startMonth + 3;
      }).reduce((sum, item) => sum + item.amount, 0);
      expense = expenseData.filter(item => {
        const month = new Date(item.date).getMonth();
        return month >= startMonth && month < startMonth + 3;
      }).reduce((sum, item) => sum + item.amount, 0);

      const prevStartMonth = (quarter - 1) * 3;
      prevRevenue = revenueData.filter(item => {
        const month = new Date(item.date).getMonth();
        return month >= prevStartMonth && month < prevStartMonth + 3;
      }).reduce((sum, item) => sum + item.amount, 0);
      prevExpense = expenseData.filter(item => {
        const month = new Date(item.date).getMonth();
        return month >= prevStartMonth && month < prevStartMonth + 3;
      }).reduce((sum, item) => sum + item.amount, 0);
    } else if (period === 'year') {
      revenue = revenueData.filter(item => new Date(item.date).getFullYear() === currentDate.getFullYear()).reduce((sum, item) => sum + item.amount, 0);
      expense = expenseData.filter(item => new Date(item.date).getFullYear() === currentDate.getFullYear()).reduce((sum, item) => sum + item.amount, 0);

      prevRevenue = revenueData.filter(item => new Date(item.date).getFullYear() === currentDate.getFullYear() - 1).reduce((sum, item) => sum + item.amount, 0);
      prevExpense = expenseData.filter(item => new Date(item.date).getFullYear() === currentDate.getFullYear() - 1).reduce((sum, item) => sum + item.amount, 0);
    }

    const profit = revenue - expense;
    const prevProfit = prevRevenue - prevExpense;
    const cashflow = profit;

    const revenueChange = prevRevenue > 0 ? (((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1) + '%' : '0%';
    const expenseChange = prevExpense > 0 ? (((expense - prevExpense) / prevExpense) * 100).toFixed(1) + '%' : '0%';
    const profitChange = prevProfit > 0 ? (((profit - prevProfit) / prevProfit) * 100).toFixed(1) + '%' : '0%';
    const cashflowChange = prevProfit > 0 ? (((cashflow - prevProfit) / prevProfit) * 100).toFixed(1) + '%' : '0%';

    return {
      revenue,
      expense,
      profit,
      cashflow,
      revenueChange,
      expenseChange,
      profitChange,
      cashflowChange
    };
  },

  /**
   * Get recent transactions
   */
  getRecentTransactions: async (companyId, limit = 10) => {
    const data = initCompanyData(companyId);
    const transactions = [];

    data.revenue.forEach(item => {
      transactions.push({
        id: `rev_${item.id}`,
        type: 'income',
        description: item.description,
        amount: item.amount,
        category: item.source,
        date: item.date,
        status: 'completed'
      });
    });

    data.expenses.forEach(item => {
      transactions.push({
        id: `exp_${item.id}`,
        type: 'expense',
        description: item.description,
        amount: item.amount,
        category: item.category,
        date: item.date,
        status: item.status === 'paid' ? 'completed' : 'pending'
      });
    });

    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  },

  /**
   * Get budget by period
   */
  getBudgetByPeriod: async (companyId, period = 'month') => {
    const currentDate = new Date();

    const categories = [
      { name: 'Nhân sự', total: 2000000000, used: 1650000000, color: 'blue' },
      { name: 'Marketing', total: 800000000, used: 680000000, color: 'green' },
      { name: 'Vận hành', total: 500000000, used: 450000000, color: 'purple' },
      { name: 'Công nghệ', total: 700000000, used: 595000000, color: 'orange' },
      { name: 'Khác', total: 1000000000, used: 750000000, color: 'pink' }
    ];

    const upcomingPayments = [
      {
        id: 1,
        description: 'Tiền lương tháng 1',
        amount: 180000000,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25).toISOString(),
        status: 'urgent'
      },
      {
        id: 2,
        description: 'Thuê văn phòng Q1',
        amount: 50000000,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28).toISOString(),
        status: 'normal'
      },
      {
        id: 3,
        description: 'Hóa đơn AWS',
        amount: 15000000,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5).toISOString(),
        status: 'normal'
      }
    ];

    return {
      categories,
      upcomingPayments
    };
  }
};

module.exports = financeService;
