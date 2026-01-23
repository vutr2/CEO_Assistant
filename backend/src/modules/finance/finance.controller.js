const financeService = require('./finance.service');
const logger = require('../../utils/logger');

const financeController = {
  /**
   * Get financial overview
   * GET /api/v1/finance/overview?period=month
   */
  getFinancialOverview: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const overview = await financeService.getOverviewByPeriod(period);

      res.status(200).json({
        success: true,
        data: overview
      });
    } catch (error) {
      logger.error('Get financial overview error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get recent transactions
   * GET /api/v1/finance/transactions?limit=10
   */
  getTransactions: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const transactions = await financeService.getRecentTransactions(parseInt(limit));

      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get revenue records
   * GET /api/v1/finance/revenue
   */
  getRevenue: async (req, res) => {
    try {
      const { startDate, endDate, source } = req.query;
      const revenue = await financeService.getRevenue({ startDate, endDate, source });

      res.status(200).json({
        success: true,
        data: revenue,
        count: revenue.length
      });
    } catch (error) {
      logger.error('Get revenue error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Add new revenue record
   * POST /api/v1/finance/revenue
   */
  addRevenue: async (req, res) => {
    try {
      const { amount, source, category, date, description } = req.body;

      // Validate required fields
      if (!amount || !source || !date) {
        return res.status(400).json({
          success: false,
          message: 'Amount, source, and date are required'
        });
      }

      const revenue = await financeService.addRevenue({
        amount: parseFloat(amount),
        source,
        category,
        date,
        description
      });

      logger.info(`Revenue added: ${revenue.id}`);

      res.status(201).json({
        success: true,
        message: 'Revenue record added successfully',
        data: revenue
      });
    } catch (error) {
      logger.error('Add revenue error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get revenue by ID
   * GET /api/v1/finance/revenue/:id
   */
  getRevenueById: async (req, res) => {
    try {
      const { id } = req.params;
      const revenue = await financeService.getRevenueById(id);

      if (!revenue) {
        return res.status(404).json({
          success: false,
          message: 'Revenue record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: revenue
      });
    } catch (error) {
      logger.error('Get revenue by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Update revenue record
   * PUT /api/v1/finance/revenue/:id
   */
  updateRevenue: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const revenue = await financeService.updateRevenue(id, updateData);

      if (!revenue) {
        return res.status(404).json({
          success: false,
          message: 'Revenue record not found'
        });
      }

      logger.info(`Revenue updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Revenue record updated successfully',
        data: revenue
      });
    } catch (error) {
      logger.error('Update revenue error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Delete revenue record
   * DELETE /api/v1/finance/revenue/:id
   */
  deleteRevenue: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await financeService.deleteRevenue(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Revenue record not found'
        });
      }

      logger.info(`Revenue deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Revenue record deleted successfully'
      });
    } catch (error) {
      logger.error('Delete revenue error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get expense records
   * GET /api/v1/finance/expenses
   */
  getExpenses: async (req, res) => {
    try {
      const { startDate, endDate, category, status } = req.query;
      const expenses = await financeService.getExpenses({ startDate, endDate, category, status });

      res.status(200).json({
        success: true,
        data: expenses,
        count: expenses.length
      });
    } catch (error) {
      logger.error('Get expenses error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Add new expense record
   * POST /api/v1/finance/expenses
   */
  addExpense: async (req, res) => {
    try {
      const { amount, category, date, description, vendor, status } = req.body;

      // Validate required fields
      if (!amount || !category || !date) {
        return res.status(400).json({
          success: false,
          message: 'Amount, category, and date are required'
        });
      }

      const expense = await financeService.addExpense({
        amount: parseFloat(amount),
        category,
        date,
        description,
        vendor,
        status
      });

      logger.info(`Expense added: ${expense.id}`);

      res.status(201).json({
        success: true,
        message: 'Expense record added successfully',
        data: expense
      });
    } catch (error) {
      logger.error('Add expense error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get expense by ID
   * GET /api/v1/finance/expenses/:id
   */
  getExpenseById: async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await financeService.getExpenseById(id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Get expense by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Update expense record
   * PUT /api/v1/finance/expenses/:id
   */
  updateExpense: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const expense = await financeService.updateExpense(id, updateData);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense record not found'
        });
      }

      logger.info(`Expense updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Expense record updated successfully',
        data: expense
      });
    } catch (error) {
      logger.error('Update expense error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Delete expense record
   * DELETE /api/v1/finance/expenses/:id
   */
  deleteExpense: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await financeService.deleteExpense(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Expense record not found'
        });
      }

      logger.info(`Expense deleted: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Expense record deleted successfully'
      });
    } catch (error) {
      logger.error('Delete expense error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get financial metrics
   * GET /api/v1/finance/metrics
   */
  getFinancialMetrics: async (req, res) => {
    try {
      const { period = 'monthly' } = req.query;
      const metrics = await financeService.getFinancialMetrics(period);

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Get financial metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get financial trends
   * GET /api/v1/finance/metrics/trends
   */
  getFinancialTrends: async (req, res) => {
    try {
      const { months = 12 } = req.query;
      const trends = await financeService.getFinancialTrends(parseInt(months));

      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Get financial trends error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get financial forecast
   * GET /api/v1/finance/metrics/forecast
   */
  getFinancialForecast: async (req, res) => {
    try {
      const { months = 6 } = req.query;
      const forecast = await financeService.getFinancialForecast(parseInt(months));

      res.status(200).json({
        success: true,
        data: forecast
      });
    } catch (error) {
      logger.error('Get financial forecast error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get budget
   * GET /api/v1/finance/budget?period=month
   */
  getBudget: async (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const budget = await financeService.getBudgetByPeriod(period);

      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      logger.error('Get budget error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Create budget
   * POST /api/v1/finance/budget
   */
  createBudget: async (req, res) => {
    try {
      const { year, totalBudget, categories } = req.body;

      // Validate required fields
      if (!year || !totalBudget || !categories) {
        return res.status(400).json({
          success: false,
          message: 'Year, total budget, and categories are required'
        });
      }

      const budget = await financeService.createBudget({
        year: parseInt(year),
        totalBudget: parseFloat(totalBudget),
        categories
      });

      logger.info(`Budget created for year: ${year}`);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget
      });
    } catch (error) {
      logger.error('Create budget error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Update budget
   * PUT /api/v1/finance/budget/:id
   */
  updateBudget: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const budget = await financeService.updateBudget(id, updateData);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      logger.info(`Budget updated: ${id}`);

      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: budget
      });
    } catch (error) {
      logger.error('Update budget error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get cash flow
   * GET /api/v1/finance/cashflow
   */
  getCashFlow: async (req, res) => {
    try {
      const { months = 12 } = req.query;
      const cashFlow = await financeService.getCashFlow(parseInt(months));

      res.status(200).json({
        success: true,
        data: cashFlow
      });
    } catch (error) {
      logger.error('Get cash flow error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = financeController;
