const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');

// Get payment history
router.get('/payments', billingController.getPaymentHistory);

// Get subscription info
router.get('/subscription', billingController.getSubscription);

// Payment methods
router.get('/payment-methods', billingController.getPaymentMethods);
router.post('/payment-methods', billingController.addPaymentMethod);
router.put('/payment-methods/:id', billingController.updatePaymentMethod);
router.delete('/payment-methods/:id', billingController.deletePaymentMethod);

module.exports = router;
