// Multi-tenant Financial Service using MongoDB

const { Revenue, Expense, Budget } = require('./finance.model');
const logger = require('../../utils/logger');

// Helper functions
function isSameMonth(date1, date2) {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

const financeService = {
  /**
   * Get financial overview for a company
   */
  getFinancialOverview: async (companyId) => {
    logger.info('Getting financial overview', { companyId });

    if (!companyId) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        currentMonth: { revenue: 0, expenses: 0, profit: 0 },
        growth: { revenue: '0', expenses: '0' },
        topExpenseCategories: []
      };
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get total revenue and expenses
    const [totalRevenue, totalExpenses] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, status: { $in: ['approved', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const totalExpensesAmount = totalExpenses[0]?.total || 0;
    const netProfit = totalRevenueAmount - totalExpensesAmount;

    // Get current month data
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const [currentMonthRevenue, currentMonthExpenses] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: startOfMonth, $lte: endOfMonth }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: startOfMonth, $lte: endOfMonth }, status: { $in: ['approved', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get top expense categories
    const topExpenseCategories = await Expense.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
      { $limit: 5 },
      { $project: { category: '$_id', amount: 1, _id: 0 } }
    ]);

    return {
      totalRevenue: totalRevenueAmount,
      totalExpenses: totalExpensesAmount,
      netProfit,
      profitMargin: totalRevenueAmount > 0 ? (netProfit / totalRevenueAmount) * 100 : 0,
      currentMonth: {
        revenue: currentMonthRevenue[0]?.total || 0,
        expenses: currentMonthExpenses[0]?.total || 0,
        profit: (currentMonthRevenue[0]?.total || 0) - (currentMonthExpenses[0]?.total || 0)
      },
      growth: { revenue: '0', expenses: '0' },
      topExpenseCategories
    };
  },

  /**
   * Get all revenue records for a company
   */
  getRevenue: async (companyId, filters = {}) => {
    logger.info('Getting revenue', { companyId, filters });

    const query = {};
    if (companyId) query.companyId = companyId;

    if (filters.startDate) {
      query.date = { ...query.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.date = { ...query.date, $lte: new Date(filters.endDate) };
    }
    if (filters.source) {
      query.source = filters.source;
    }

    const revenue = await Revenue.find(query).sort({ date: -1 });
    return revenue;
  },

  /**
   * Add new revenue record
   */
  addRevenue: async (companyId, revenueRecord) => {
    logger.info('Adding revenue', { companyId });

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const newRevenue = await Revenue.create({
      companyId,
      ...revenueRecord
    });

    return newRevenue;
  },

  /**
   * Get revenue by ID
   */
  getRevenueById: async (companyId, id) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;
    return await Revenue.findOne(query);
  },

  /**
   * Update revenue record
   */
  updateRevenue: async (companyId, id, updateData) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;

    return await Revenue.findOneAndUpdate(query, { $set: updateData }, { new: true });
  },

  /**
   * Delete revenue record
   */
  deleteRevenue: async (companyId, id) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;

    const result = await Revenue.deleteOne(query);
    return result.deletedCount > 0;
  },

  /**
   * Get all expenses for a company
   */
  getExpenses: async (companyId, filters = {}) => {
    logger.info('Getting expenses', { companyId, filters });

    const query = {};
    if (companyId) query.companyId = companyId;

    if (filters.startDate) {
      query.date = { ...query.date, $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.date = { ...query.date, $lte: new Date(filters.endDate) };
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    return expenses;
  },

  /**
   * Add new expense record
   */
  addExpense: async (companyId, expenseRecord) => {
    logger.info('Adding expense', { companyId });

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const newExpense = await Expense.create({
      companyId,
      ...expenseRecord
    });

    return newExpense;
  },

  /**
   * Get expense by ID
   */
  getExpenseById: async (companyId, id) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;
    return await Expense.findOne(query);
  },

  /**
   * Update expense record
   */
  updateExpense: async (companyId, id, updateData) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;

    return await Expense.findOneAndUpdate(query, { $set: updateData }, { new: true });
  },

  /**
   * Delete expense record
   */
  deleteExpense: async (companyId, id) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;

    const result = await Expense.deleteOne(query);
    return result.deletedCount > 0;
  },

  /**
   * Get financial metrics
   */
  getFinancialMetrics: async (companyId, period = 'monthly') => {
    logger.info('Getting financial metrics', { companyId, period });

    // Return empty metrics if no companyId
    if (!companyId) {
      return {
        revenue: { current: 0, previous: 0, growth: 0 },
        expenses: { current: 0, previous: 0, growth: 0 },
        profit: { current: 0, previous: 0, growth: 0 }
      };
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0);

    const [currentRevenue, previousRevenue, currentExpenses, previousExpenses] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: startOfCurrentMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: startOfCurrentMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const currentRev = currentRevenue[0]?.total || 0;
    const prevRev = previousRevenue[0]?.total || 0;
    const currentExp = currentExpenses[0]?.total || 0;
    const prevExp = previousExpenses[0]?.total || 0;

    return {
      revenue: {
        current: currentRev,
        previous: prevRev,
        growth: prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0
      },
      expenses: {
        current: currentExp,
        previous: prevExp,
        growth: prevExp > 0 ? ((currentExp - prevExp) / prevExp) * 100 : 0
      },
      profit: {
        current: currentRev - currentExp,
        previous: prevRev - prevExp,
        growth: (prevRev - prevExp) > 0 ? (((currentRev - currentExp) - (prevRev - prevExp)) / (prevRev - prevExp)) * 100 : 0
      }
    };
  },

  /**
   * Get financial trends
   */
  getFinancialTrends: async (companyId, months = 12) => {
    logger.info('Getting financial trends', { companyId, months });

    if (!companyId) {
      return [];
    }

    const trends = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

      const [monthRevenue, monthExpenses] = await Promise.all([
        Revenue.aggregate([
          { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Expense.aggregate([
          { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const revenue = monthRevenue[0]?.total || 0;
      const expenses = monthExpenses[0]?.total || 0;

      trends.push({
        month: startDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        profit: revenue - expenses
      });
    }

    return trends;
  },

  /**
   * Get budget
   */
  getBudget: async (companyId, year) => {
    if (!companyId) return null;

    const targetYear = year || new Date().getFullYear();
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31);

    return await Budget.findOne({
      companyId,
      startDate: { $gte: startOfYear },
      endDate: { $lte: endOfYear }
    });
  },

  /**
   * Create budget
   */
  createBudget: async (companyId, budgetInfo) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const newBudget = await Budget.create({
      companyId,
      ...budgetInfo
    });

    return newBudget;
  },

  /**
   * Update budget
   */
  updateBudget: async (companyId, id, updateData) => {
    const query = { _id: id };
    if (companyId) query.companyId = companyId;

    return await Budget.findOneAndUpdate(query, { $set: updateData }, { new: true });
  },

  /**
   * Get overview by period (for Finance Dashboard page)
   */
  getOverviewByPeriod: async (companyId, period = 'month') => {
    logger.info('Getting overview by period', { companyId, period });

    if (!companyId) {
      return {
        revenue: 0,
        expense: 0,
        profit: 0,
        cashflow: 0,
        revenueChange: '0%',
        expenseChange: '0%',
        profitChange: '0%',
        cashflowChange: '0%'
      };
    }

    const currentDate = new Date();
    let startDate, endDate, prevStartDate, prevEndDate;

    if (period === 'week') {
      startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = currentDate;
      prevStartDate = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
      prevEndDate = startDate;
    } else if (period === 'month') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      prevStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      prevEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    } else if (period === 'quarter') {
      const quarter = Math.floor(currentDate.getMonth() / 3);
      startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
      endDate = new Date(currentDate.getFullYear(), (quarter + 1) * 3, 0);
      prevStartDate = new Date(currentDate.getFullYear(), (quarter - 1) * 3, 1);
      prevEndDate = new Date(currentDate.getFullYear(), quarter * 3, 0);
    } else {
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      prevStartDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(currentDate.getFullYear() - 1, 11, 31);
    }

    const [revenue, expense, prevRevenue, prevExpense] = await Promise.all([
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Revenue.aggregate([
        { $match: { companyId, date: { $gte: prevStartDate, $lte: prevEndDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { companyId, date: { $gte: prevStartDate, $lte: prevEndDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenueAmount = revenue[0]?.total || 0;
    const expenseAmount = expense[0]?.total || 0;
    const prevRevenueAmount = prevRevenue[0]?.total || 0;
    const prevExpenseAmount = prevExpense[0]?.total || 0;

    const profit = revenueAmount - expenseAmount;
    const prevProfit = prevRevenueAmount - prevExpenseAmount;

    const calcChange = (current, previous) => {
      if (previous === 0) return '0%';
      return (((current - previous) / previous) * 100).toFixed(1) + '%';
    };

    return {
      revenue: revenueAmount,
      expense: expenseAmount,
      profit,
      cashflow: profit,
      revenueChange: calcChange(revenueAmount, prevRevenueAmount),
      expenseChange: calcChange(expenseAmount, prevExpenseAmount),
      profitChange: calcChange(profit, prevProfit),
      cashflowChange: calcChange(profit, prevProfit)
    };
  },

  /**
   * Get recent transactions
   */
  getRecentTransactions: async (companyId, limit = 10) => {
    logger.info('Getting recent transactions', { companyId, limit });

    if (!companyId) {
      return [];
    }

    const [revenueRecords, expenseRecords] = await Promise.all([
      Revenue.find({ companyId }).sort({ date: -1 }).limit(limit),
      Expense.find({ companyId }).sort({ date: -1 }).limit(limit)
    ]);

    const transactions = [];

    revenueRecords.forEach(item => {
      transactions.push({
        id: item._id,
        type: 'income',
        description: item.description,
        amount: item.amount,
        category: item.source,
        date: item.date,
        status: item.status === 'completed' ? 'completed' : 'pending'
      });
    });

    expenseRecords.forEach(item => {
      transactions.push({
        id: item._id,
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
    logger.info('Getting budget by period', { companyId, period });

    // Return empty structure if no data
    return {
      categories: [],
      upcomingPayments: []
    };
  },

  /**
   * Get cash flow data
   */
  getCashFlow: async (companyId, months = 12) => {
    logger.info('Getting cash flow', { companyId, months });

    if (!companyId) {
      return [];
    }

    const cashFlow = [];
    const currentDate = new Date();
    let runningBalance = 0;

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

      const [monthRevenue, monthExpenses] = await Promise.all([
        Revenue.aggregate([
          { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Expense.aggregate([
          { $match: { companyId, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const inflow = monthRevenue[0]?.total || 0;
      const outflow = monthExpenses[0]?.total || 0;
      const netCashFlow = inflow - outflow;
      runningBalance += netCashFlow;

      cashFlow.push({
        month: startDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        inflow,
        outflow,
        netCashFlow,
        balance: runningBalance
      });
    }

    return cashFlow;
  },

  /**
   * Get financial forecast
   */
  getFinancialForecast: async (companyId, months = 6) => {
    logger.info('Getting financial forecast', { companyId, months });

    // TODO: Implement AI-powered forecasting
    return [];
  }
};

module.exports = financeService;
