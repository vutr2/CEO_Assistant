/**
 * Sales Service
 * Business logic for sales and revenue tracking
 */

const Sale = require('../../models/Sale');
const { Revenue } = require('../finance/finance.model');
const logger = require('../../utils/logger');

const salesService = {
  /**
   * Create new sale
   */
  createSale: async (companyId, userId, saleData) => {
    try {
      const sale = await Sale.create({
        companyId,
        userId,
        ...saleData
      });

      await sale.populate('user', 'name email position department');

      return sale;
    } catch (error) {
      logger.error('Error creating sale:', error);
      throw error;
    }
  },

  /**
   * Get all sales with filters
   */
  getSales: async (companyId, filters = {}) => {
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
        customerName,
        department,
        limit = 50,
        offset = 0,
        sortBy = 'saleDate',
        sortOrder = 'desc'
      } = filters;

      const query = { companyId, isDeleted: false };

      if (userId) query.userId = userId;
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (category) query.category = category;
      if (department) query.department = department;
      if (customerName) {
        query.customerName = { $regex: customerName, $options: 'i' };
      }

      // Date range filter
      if (startDate || endDate) {
        query.saleDate = {};
        if (startDate) query.saleDate.$gte = new Date(startDate);
        if (endDate) query.saleDate.$lte = new Date(endDate);
      }

      // Amount range filter
      if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) query.amount.$gte = parseFloat(minAmount);
        if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const sales = await Sale.find(query)
        .populate('user', 'name email position department')
        .sort(sort)
        .skip(parseInt(offset))
        .limit(parseInt(limit));

      const total = await Sale.countDocuments(query);

      return {
        data: sales,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (error) {
      logger.error('Error getting sales:', error);
      throw error;
    }
  },

  /**
   * Get sale by ID
   */
  getSaleById: async (companyId, saleId) => {
    try {
      const sale = await Sale.findOne({
        _id: saleId,
        companyId,
        isDeleted: false
      }).populate('user', 'name email position department');

      return sale;
    } catch (error) {
      logger.error('Error getting sale by ID:', error);
      throw error;
    }
  },

  /**
   * Update sale
   */
  updateSale: async (companyId, saleId, userId, updateData) => {
    try {
      const sale = await Sale.findOne({
        _id: saleId,
        companyId,
        isDeleted: false
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      // Check ownership
      if (sale.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update this sale');
      }

      // Update actual close date if status changed to won
      if (updateData.status === 'won' && sale.status !== 'won') {
        updateData.actualCloseDate = new Date();
      }

      Object.assign(sale, updateData);
      await sale.save();
      await sale.populate('user', 'name email position department');

      return sale;
    } catch (error) {
      logger.error('Error updating sale:', error);
      throw error;
    }
  },

  /**
   * Delete sale (soft delete)
   */
  deleteSale: async (companyId, saleId, userId) => {
    try {
      const sale = await Sale.findOne({
        _id: saleId,
        companyId,
        isDeleted: false
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      // Only owner can delete
      if (sale.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this sale');
      }

      sale.isDeleted = true;
      await sale.save();

      return { message: 'Sale deleted successfully' };
    } catch (error) {
      logger.error('Error deleting sale:', error);
      throw error;
    }
  },

  /**
   * Get sales statistics
   */
  getSalesStats: async (companyId, filters = {}) => {
    try {
      const { userId, startDate, endDate, department } = filters;

      const matchQuery = { companyId, isDeleted: false };
      if (userId) matchQuery.userId = userId;
      if (department) matchQuery.department = department;
      if (startDate || endDate) {
        matchQuery.saleDate = {};
        if (startDate) matchQuery.saleDate.$gte = new Date(startDate);
        if (endDate) matchQuery.saleDate.$lte = new Date(endDate);
      }

      const stats = await Sale.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            byPaymentStatus: [
              { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            byCategory: [
              { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ],
            overview: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$amount' },
                  totalSales: { $sum: 1 },
                  avgSaleValue: { $avg: '$amount' },
                  wonDeals: {
                    $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
                  },
                  wonRevenue: {
                    $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$amount', 0] }
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
        byPaymentStatus: result.byPaymentStatus,
        byCategory: result.byCategory,
        overview: result.overview[0] || {
          totalRevenue: 0,
          totalSales: 0,
          avgSaleValue: 0,
          wonDeals: 0,
          wonRevenue: 0
        }
      };
    } catch (error) {
      logger.error('Error getting sales stats:', error);
      throw error;
    }
  },

  /**
   * Get top sales performers
   */
  getTopSalesPerformers: async (companyId, filters = {}) => {
    try {
      const { startDate, endDate, limit = 10 } = filters;

      const matchQuery = { companyId, isDeleted: false, status: 'won' };
      if (startDate || endDate) {
        matchQuery.saleDate = {};
        if (startDate) matchQuery.saleDate.$gte = new Date(startDate);
        if (endDate) matchQuery.saleDate.$lte = new Date(endDate);
      }

      const topPerformers = await Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$userId',
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$amount' },
            avgDealValue: { $avg: '$amount' }
          }
        },
        { $sort: { totalRevenue: -1 } },
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
            totalSales: 1,
            totalRevenue: 1,
            avgDealValue: 1
          }
        }
      ]);

      return topPerformers;
    } catch (error) {
      logger.error('Error getting top sales performers:', error);
      throw error;
    }
  },

  /**
   * Get revenue trends over time
   */
  getRevenueTrends: async (companyId, filters = {}) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = filters;

      const matchQuery = { companyId, isDeleted: false, status: 'won' };
      if (startDate || endDate) {
        matchQuery.saleDate = {};
        if (startDate) matchQuery.saleDate.$gte = new Date(startDate);
        if (endDate) matchQuery.saleDate.$lte = new Date(endDate);
      }

      let dateGroup;
      switch (groupBy) {
        case 'hour':
          dateGroup = {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' },
            hour: { $hour: '$saleDate' }
          };
          break;
        case 'day':
          dateGroup = {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' }
          };
          break;
        case 'week':
          dateGroup = {
            year: { $year: '$saleDate' },
            week: { $week: '$saleDate' }
          };
          break;
        case 'month':
          dateGroup = {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          };
          break;
        case 'year':
          dateGroup = {
            year: { $year: '$saleDate' }
          };
          break;
        default:
          dateGroup = {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' }
          };
      }

      const trends = await Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: dateGroup,
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
            avgValue: { $avg: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ]);

      return trends;
    } catch (error) {
      logger.error('Error getting revenue trends:', error);
      throw error;
    }
  },

  /**
   * Get pending sales for approval
   */
  getPendingSales: async (companyId, filters = {}) => {
    try {
      const { limit = 50, offset = 0 } = filters;

      const sales = await Sale.find({
        companyId,
        isDeleted: false,
        approvalStatus: 'pending',
        status: 'won' // Only won deals need approval for Finance
      })
        .populate('user', 'name email position department')
        .sort({ saleDate: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit));

      const total = await Sale.countDocuments({
        companyId,
        isDeleted: false,
        approvalStatus: 'pending',
        status: 'won'
      });

      return { data: sales, total };
    } catch (error) {
      logger.error('Error getting pending sales:', error);
      throw error;
    }
  },

  /**
   * Approve sale and sync to Finance Revenue
   */
  approveSale: async (companyId, saleId, approverId) => {
    try {
      const sale = await Sale.findOne({
        _id: saleId,
        companyId,
        isDeleted: false
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.approvalStatus === 'approved') {
        throw new Error('Sale already approved');
      }

      // Create Revenue record in Finance
      const revenueRecord = await Revenue.create({
        companyId,
        description: `${sale.title} - ${sale.customerName}`,
        amount: sale.amount,
        source: sale.customerName,
        category: sale.category === 'service' ? 'Services' : 'Sales',
        date: sale.saleDate,
        status: sale.paymentStatus === 'paid' ? 'completed' : 'pending',
        sourceSaleId: sale._id,
        sourceType: 'employee_input'
      });

      // Update sale with approval info and link to Revenue
      sale.approvalStatus = 'approved';
      sale.approvedBy = approverId;
      sale.approvedAt = new Date();
      sale.financeRevenueId = revenueRecord._id;
      sale.syncedToFinance = true;

      await sale.save();
      await sale.populate('user', 'name email position department');

      logger.info('Sale approved and synced to Finance', {
        saleId: sale._id,
        revenueId: revenueRecord._id
      });

      return { sale, revenueRecord };
    } catch (error) {
      logger.error('Error approving sale:', error);
      throw error;
    }
  },

  /**
   * Reject sale
   */
  rejectSale: async (companyId, saleId, rejecterId, reason) => {
    try {
      const sale = await Sale.findOne({
        _id: saleId,
        companyId,
        isDeleted: false
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.approvalStatus === 'approved') {
        throw new Error('Cannot reject an approved sale');
      }

      sale.approvalStatus = 'rejected';
      sale.rejectedBy = rejecterId;
      sale.rejectedAt = new Date();
      sale.rejectionReason = reason || '';

      await sale.save();
      await sale.populate('user', 'name email position department');

      logger.info('Sale rejected', { saleId: sale._id, reason });

      return sale;
    } catch (error) {
      logger.error('Error rejecting sale:', error);
      throw error;
    }
  }
};

module.exports = salesService;
