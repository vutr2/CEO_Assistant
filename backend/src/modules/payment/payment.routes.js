/**
 * Payment Routes
 * Routes for VNPay and Momo payment processing
 */

const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');

// Public routes (no authentication required)
router.get('/plans', paymentController.getPaymentPlans);
router.get('/vnpay/banks', paymentController.getVNPayBanks);

// VNPay callback routes (no authentication for callbacks from gateway)
router.get('/vnpay/callback', paymentController.handleVNPayReturn);
router.get('/vnpay/ipn', paymentController.handleVNPayIPN);

// Momo callback routes (no authentication for callbacks from gateway)
router.get('/momo/callback', paymentController.handleMomoReturn);
router.post('/momo/ipn', paymentController.handleMomoIPN);

// Protected routes (authentication required)
router.use(authenticate);

// Create payments
router.post('/vnpay/create', paymentController.createVNPayPayment);
router.post('/momo/create', paymentController.createMomoPayment);

// Transaction management
router.get('/transactions', paymentController.getUserTransactions);
router.get('/transactions/:id', paymentController.getTransaction);

// Subscription management
router.get('/subscription', paymentController.getUserSubscription);
router.post('/subscription/cancel', paymentController.cancelUserSubscription);

// Admin routes (get all transactions)
router.get('/admin/transactions', paymentController.getAllTransactionsController);

module.exports = router;
