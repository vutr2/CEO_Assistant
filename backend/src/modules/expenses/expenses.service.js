/**
 * Expenses Service
 * Business logic for expense tracking and management
 */

const CompanyExpense = require('../../models/CompanyExpense');
const { Expense } = require('../finance/finance.model');
const logger = require('../../utils/logger');

const expensesService = {
  /**
   * Create new expense
   */
  createExpense: async (companyId, userId, expenseData) => {
    try {
      const expense = await CompanyExpense.create({
        companyId,
        userId,
        status: 'submitted',
        ...expenseData
      });

      await expense.populate('user', 'name email position department');

      return expense;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }
  },

  /**
   * Get all expenses with filters
   */
  getExpenses: async (companyId, filters = {}) => {
    try {
      const {
        userId,
        status,
        paymentStatus,
        category,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        department,
        isReimbursable,
        limit = 50,
        offset = 0,
        sortBy = 'expenseDate',
        sortOrder = 'desc'
      } = filters;

      const query = { companyId, isDeleted: false };

      if (userId) query.userId = userId;
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (category) query.category = category;
      if (department) query.department = department;
      if (isReimbursable !== undefined) query.isReimbursable = isReimbursable === 'true';

      // Date range filter
      if (startDate || endDate) {
        query.expenseDate = {};
        if (startDate) query.expenseDate.$gte = new Date(startDate);
        if (endDate) query.expenseDate.$lte = new Date(endDate);
      }

      // Amount range filter
      if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) query.amount.$gte = parseFloat(minAmount);
        if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const expenses = await CompanyExpense.find(query)
        .populate('user', 'name email position department')
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email')
        .sort(sort)
        .skip(parseInt(offset))
        .limit(parseInt(limit));

      const total = await CompanyExpense.countDocuments(query);

      return {
        data: expenses,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      logger.error('Error getting expenses:', error);
      throw error;
    }
  },

  /**
   * Get expense by ID
   */
  getExpenseById: async (companyId, expenseId) => {
    try {
      const expense = await CompanyExpense.findOne({
        _id: expenseId,
        companyId,
        isDeleted: false
      })
        .populate('user', 'name email position department')
        .populate('approvedBy', 'name email')
        .populate('rejectedBy', 'name email');

      return expense;
    } catch (error) {
      logger.error('Error getting expense by ID:', error);
      throw error;
    }
  },

  /**
   * Update expense
   */
  updateExpense: async (companyId, expenseId, userId, updateData) => {
    try {
      const expense = await CompanyExpense.findOne({
        _id: expenseId,
        companyId,
        isDeleted: false
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      // Check ownership
      if (expense.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update this expense');
      }

      // Can't update if already approved or rejected
      if (['approved', 'paid'].includes(expense.status)) {
        throw new Error('Cannot update approved or paid expenses');
      }

      Object.assign(expense, updateData);
      await expense.save();
      await expense.populate('user', 'name email position department');

      return expense;
    } catch (error) {
      logger.error('Error updating expense:', error);
      throw error;
    }
  },

  /**
   * Approve expense (managers/admins only)
   * Also syncs to Finance Expense when approved
   */
  approveExpense: async (companyId, expenseId, approverId) => {
    try {
      const expense = await CompanyExpense.findOne({
        _id: expenseId,
        companyId,
        isDeleted: false
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.status === 'approved') {
        throw new Error('Expense already approved');
      }

      // Map CompanyExpense category to Finance Expense category
      const categoryMap = {
        'office_supplies': 'Vận hành',
        'travel': 'Vận hành',
        'meals': 'Vận hành',
        'utilities': 'Vận hành',
        'rent': 'Vận hành',
        'salaries': 'Nhân sự',
        'marketing': 'Marketing',
        'equipment': 'Vận hành',
        'software': 'Vận hành',
        'services': 'Khác',
        'taxes': 'Khác',
        'insurance': 'Khác',
        'other': 'Khác'
      };

      // Map payment method
      const paymentMethodMap = {
        'cash': 'Cash',
        'bank_transfer': 'Bank Transfer',
        'credit_card': 'Credit Card',
        'company_card': 'Credit Card',
        'e_wallet': 'Other',
        'other': 'Other'
      };

      // Create Finance Expense record
      const financeExpense = await Expense.create({
        companyId,
        description: `${expense.title}${expense.vendor ? ' - ' + expense.vendor : ''}`,
        amount: expense.amount,
        category: categoryMap[expense.category] || 'Khác',
        date: expense.expenseDate,
        status: expense.paymentStatus === 'paid' ? 'paid' : 'approved',
        paymentMethod: paymentMethodMap[expense.paymentMethod] || 'Other',
        sourceExpenseId: expense._id,
        sourceType: 'employee_input'
      });

      expense.status = 'approved';
      expense.approvedBy = approverId;
      expense.approvedAt = new Date();
      expense.financeExpenseId = financeExpense._id;
      expense.syncedToFinance = true;
      await expense.save();

      await expense.populate('user', 'name email position department');
      await expense.populate('approvedBy', 'name email');

      logger.info('Expense approved and synced to Finance', {
        expenseId: expense._id,
        financeExpenseId: financeExpense._id
      });

      return { expense, financeExpense };
    } catch (error) {
      logger.error('Error approving expense:', error);
      throw error;
    }
  },

  /**
   * Reject expense (managers/admins only)
   */
  rejectExpense: async (companyId, expenseId, rejecterId, reason) => {
    try {
      const expense = await CompanyExpense.findOne({
        _id: expenseId,
        companyId,
        isDeleted: false
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.status === 'rejected') {
        throw new Error('Expense already rejected');
      }

      expense.status = 'rejected';
      expense.rejectedBy = rejecterId;
      expense.rejectedAt = new Date();
      expense.rejectionReason = reason;
      await expense.save();

      await expense.populate('user', 'name email position department');
      await expense.populate('rejectedBy', 'name email');

      return expense;
    } catch (error) {
      logger.error('Error rejecting expense:', error);
      throw error;
    }
  },

  /**
   * Delete expense (soft delete)
   */
  deleteExpense: async (companyId, expenseId, userId) => {
    try {
      const expense = await CompanyExpense.findOne({
        _id: expenseId,
        companyId,
        isDeleted: false
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      // Only owner can delete, and only if not approved
      if (expense.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this expense');
      }

      if (['approved', 'paid'].includes(expense.status)) {
        throw new Error('Cannot delete approved or paid expenses');
      }

      expense.isDeleted = true;
      await expense.save();

      return { message: 'Expense deleted successfully' };
    } catch (error) {
      logger.error('Error deleting expense:', error);
      throw error;
    }
  },

  /**
   * Get expense statistics
   */
  getExpenseStats: async (companyId, filters = {}) => {
    try {
      const { userId, startDate, endDate, department } = filters;

      const matchQuery = { companyId, isDeleted: false };
      if (userId) matchQuery.userId = userId;
      if (department) matchQuery.department = department;
      if (startDate || endDate) {
        matchQuery.expenseDate = {};
        if (startDate) matchQuery.expenseDate.$gte = new Date(startDate);
        if (endDate) matchQuery.expenseDate.$lte = new Date(endDate);
      }

      const stats = await CompanyExpense.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            byCategory: [
              { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            byPaymentStatus: [
              { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            overview: [
              {
                $group: {
                  _id: null,
                  totalExpenses: { $sum: '$amount' },
                  totalCount: { $sum: 1 },
                  avgExpense: { $avg: '$amount' },
                  approvedExpenses: {
                    $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
                  },
                  pendingExpenses: {
                    $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, '$amount', 0] }
                  },
                  reimbursableExpenses: {
                    $sum: { $cond: ['$isReimbursable', '$amount', 0] }
                  }
                }
              }
            ]
          }
        }
      ]);

      const result = stats[0];

      return {
        byStatus: result.byStatus,
        byCategory: result.byCategory,
        byPaymentStatus: result.byPaymentStatus,
        overview: result.overview[0] || {
          totalExpenses: 0,
          totalCount: 0,
          avgExpense: 0,
          approvedExpenses: 0,
          pendingExpenses: 0,
          reimbursableExpenses: 0
        }
      };
    } catch (error) {
      logger.error('Error getting expense stats:', error);
      throw error;
    }
  },

  /**
   * Get expenses by employee
   */
  getExpensesByEmployee: async (companyId, filters = {}) => {
    try {
      const { startDate, endDate, limit = 10 } = filters;

      const matchQuery = { companyId, isDeleted: false };
      if (startDate || endDate) {
        matchQuery.expenseDate = {};
        if (startDate) matchQuery.expenseDate.$gte = new Date(startDate);
        if (endDate) matchQuery.expenseDate.$lte = new Date(endDate);
      }

      const expensesByEmployee = await CompanyExpense.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$userId',
            totalExpenses: { $sum: '$amount' },
            expenseCount: { $sum: 1 },
            approvedExpenses: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
            },
            pendingExpenses: {
              $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, '$amount', 0] }
            }
          }
        },
        { $sort: { totalExpenses: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            position: '$user.position',
            department: '$user.department',
            totalExpenses: 1,
            expenseCount: 1,
            approvedExpenses: 1,
            pendingExpenses: 1
          }
        }
      ]);

      return expensesByEmployee;
    } catch (error) {
      logger.error('Error getting expenses by employee:', error);
      throw error;
    }
  },

  /**
   * Get pending expenses for approval
   */
  getPendingExpenses: async (companyId, filters = {}) => {
    try {
      const { limit = 50, offset = 0 } = filters;

      const expenses = await CompanyExpense.find({
        companyId,
        isDeleted: false,
        status: 'submitted' // Pending approval
      })
        .populate('user', 'name email position department')
        .sort({ expenseDate: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit));

      const total = await CompanyExpense.countDocuments({
        companyId,
        isDeleted: false,
        status: 'submitted'
      });

      return { data: expenses, total };
    } catch (error) {
      logger.error('Error getting pending expenses:', error);
      throw error;
    }
  }
};

module.exports = expensesService;
