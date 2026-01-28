const expensesService = require('./expenses.service');
const logger = require('../../utils/logger');

const expensesController = {
  /**
   * Create new expense
   * POST /api/v1/expenses
   */
  createExpense: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;

      const expense = await expensesService.createExpense(companyId, userId, req.body);

      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error in createExpense:', error);
      next(error);
    }
  },

  /**
   * Get all expenses
   * GET /api/v1/expenses
   */
  getExpenses: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const result = await expensesService.getExpenses(companyId, req.query);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error in getExpenses:', error);
      next(error);
    }
  },

  /**
   * Get expense by ID
   * GET /api/v1/expenses/:id
   */
  getExpenseById: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const { id } = req.params;

      const expense = await expensesService.getExpenseById(companyId, id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error in getExpenseById:', error);
      next(error);
    }
  },

  /**
   * Update expense
   * PUT /api/v1/expenses/:id
   */
  updateExpense: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { id } = req.params;

      const expense = await expensesService.updateExpense(companyId, id, userId, req.body);

      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error in updateExpense:', error);
      next(error);
    }
  },

  /**
   * Approve expense and sync to Finance
   * POST /api/v1/expenses/:id/approve
   */
  approveExpense: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const approverId = req.user.id;
      const { id } = req.params;

      const result = await expensesService.approveExpense(companyId, id, approverId);

      res.status(200).json({
        success: true,
        message: 'Expense approved and synced to Finance',
        data: result
      });
    } catch (error) {
      logger.error('Error in approveExpense:', error);
      next(error);
    }
  },

  /**
   * Reject expense
   * POST /api/v1/expenses/:id/reject
   */
  rejectExpense: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const rejecterId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const expense = await expensesService.rejectExpense(companyId, id, rejecterId, reason);

      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      logger.error('Error in rejectExpense:', error);
      next(error);
    }
  },

  /**
   * Delete expense
   * DELETE /api/v1/expenses/:id
   */
  deleteExpense: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { id } = req.params;

      const result = await expensesService.deleteExpense(companyId, id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in deleteExpense:', error);
      next(error);
    }
  },

  /**
   * Get expense statistics
   * GET /api/v1/expenses/stats
   */
  getExpenseStats: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const stats = await expensesService.getExpenseStats(companyId, req.query);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getExpenseStats:', error);
      next(error);
    }
  },

  /**
   * Get expenses by employee
   * GET /api/v1/expenses/by-employee
   */
  getExpensesByEmployee: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const result = await expensesService.getExpensesByEmployee(companyId, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getExpensesByEmployee:', error);
      next(error);
    }
  },

  /**
   * Get pending expenses for approval
   * GET /api/v1/expenses/pending
   */
  getPendingExpenses: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const result = await expensesService.getPendingExpenses(companyId, req.query);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error in getPendingExpenses:', error);
      next(error);
    }
  }
};

module.exports = expensesController;
