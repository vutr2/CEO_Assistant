const billingService = require('./billing.service');

const billingController = {
  /**
   * Get payment history
   * GET /api/v1/billing/payments
   */
  getPaymentHistory: async (req, res, next) => {
    try {
      const { limit, offset } = req.query;
      const result = await billingService.getPaymentHistory({
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0
      });

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment methods
   * GET /api/v1/billing/payment-methods
   */
  getPaymentMethods: async (req, res, next) => {
    try {
      const methods = await billingService.getPaymentMethods();
      res.status(200).json({
        success: true,
        data: methods
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add payment method
   * POST /api/v1/billing/payment-methods
   */
  addPaymentMethod: async (req, res, next) => {
    try {
      const method = await billingService.addPaymentMethod(req.body);
      res.status(201).json({
        success: true,
        data: method
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update payment method
   * PUT /api/v1/billing/payment-methods/:id
   */
  updatePaymentMethod: async (req, res, next) => {
    try {
      const { id } = req.params;
      const method = await billingService.updatePaymentMethod(id, req.body);

      if (!method) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }

      res.status(200).json({
        success: true,
        data: method
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete payment method
   * DELETE /api/v1/billing/payment-methods/:id
   */
  deletePaymentMethod: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await billingService.deletePaymentMethod(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment method deleted'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get subscription info
   * GET /api/v1/billing/subscription
   */
  getSubscription: async (req, res, next) => {
    try {
      const subscription = await billingService.getSubscription();
      res.status(200).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = billingController;
