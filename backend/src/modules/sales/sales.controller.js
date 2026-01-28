const salesService = require('./sales.service');
const logger = require('../../utils/logger');

const salesController = {
  /**
   * Create new sale
   * POST /api/v1/sales
   */
  createSale: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;

      const sale = await salesService.createSale(companyId, userId, req.body);

      res.status(201).json({
        success: true,
        data: sale
      });
    } catch (error) {
      logger.error('Error in createSale:', error);
      next(error);
    }
  },

  /**
   * Get all sales
   * GET /api/v1/sales
   */
  getSales: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const result = await salesService.getSales(companyId, req.query);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error in getSales:', error);
      next(error);
    }
  },

  /**
   * Get sale by ID
   * GET /api/v1/sales/:id
   */
  getSaleById: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const { id } = req.params;

      const sale = await salesService.getSaleById(companyId, id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      res.status(200).json({
        success: true,
        data: sale
      });
    } catch (error) {
      logger.error('Error in getSaleById:', error);
      next(error);
    }
  },

  /**
   * Update sale
   * PUT /api/v1/sales/:id
   */
  updateSale: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { id } = req.params;

      const sale = await salesService.updateSale(companyId, id, userId, req.body);

      res.status(200).json({
        success: true,
        data: sale
      });
    } catch (error) {
      logger.error('Error in updateSale:', error);
      next(error);
    }
  },

  /**
   * Delete sale
   * DELETE /api/v1/sales/:id
   */
  deleteSale: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { id } = req.params;

      const result = await salesService.deleteSale(companyId, id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in deleteSale:', error);
      next(error);
    }
  },

  /**
   * Get sales statistics
   * GET /api/v1/sales/stats
   */
  getSalesStats: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const stats = await salesService.getSalesStats(companyId, req.query);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error in getSalesStats:', error);
      next(error);
    }
  },

  /**
   * Get top sales performers
   * GET /api/v1/sales/top-performers
   */
  getTopSalesPerformers: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const performers = await salesService.getTopSalesPerformers(companyId, req.query);

      res.status(200).json({
        success: true,
        data: performers
      });
    } catch (error) {
      logger.error('Error in getTopSalesPerformers:', error);
      next(error);
    }
  },

  /**
   * Get revenue trends
   * GET /api/v1/sales/trends
   */
  getRevenueTrends: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const trends = await salesService.getRevenueTrends(companyId, req.query);

      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (error) {
      logger.error('Error in getRevenueTrends:', error);
      next(error);
    }
  },

  /**
   * Get pending sales for approval
   * GET /api/v1/sales/pending
   */
  getPendingSales: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const result = await salesService.getPendingSales(companyId, req.query);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error in getPendingSales:', error);
      next(error);
    }
  },

  /**
   * Approve sale and sync to Finance
   * POST /api/v1/sales/:id/approve
   */
  approveSale: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const approverId = req.user.id;
      const { id } = req.params;

      const result = await salesService.approveSale(companyId, id, approverId);

      res.status(200).json({
        success: true,
        message: 'Sale approved and synced to Finance',
        data: result
      });
    } catch (error) {
      logger.error('Error in approveSale:', error);
      next(error);
    }
  },

  /**
   * Reject sale
   * POST /api/v1/sales/:id/reject
   */
  rejectSale: async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const rejecterId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const sale = await salesService.rejectSale(companyId, id, rejecterId, reason);

      res.status(200).json({
        success: true,
        message: 'Sale rejected',
        data: sale
      });
    } catch (error) {
      logger.error('Error in rejectSale:', error);
      next(error);
    }
  }
};

module.exports = salesController;
