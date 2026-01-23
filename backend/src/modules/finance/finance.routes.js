const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const { optionalAuth, authorize } = require('../../middlewares/auth.middleware');

// Use optional authentication for testing
router.use(optionalAuth);

// Financial Overview
router.get('/overview', financeController.getFinancialOverview);

// Transactions
router.get('/transactions', financeController.getTransactions);

// Revenue Management
router.get('/revenue', financeController.getRevenue);
router.post('/revenue', authorize('admin', 'manager'), financeController.addRevenue);
router.get('/revenue/:id', financeController.getRevenueById);
router.put('/revenue/:id', authorize('admin', 'manager'), financeController.updateRevenue);
router.delete('/revenue/:id', authorize('admin'), financeController.deleteRevenue);

// Expense Management
router.get('/expenses', financeController.getExpenses);
router.post('/expenses', authorize('admin', 'manager'), financeController.addExpense);
router.get('/expenses/:id', financeController.getExpenseById);
router.put('/expenses/:id', authorize('admin', 'manager'), financeController.updateExpense);
router.delete('/expenses/:id', authorize('admin'), financeController.deleteExpense);

// Financial Metrics
router.get('/metrics', financeController.getFinancialMetrics);
router.get('/metrics/trends', financeController.getFinancialTrends);
router.get('/metrics/forecast', financeController.getFinancialForecast);

// Budget Management
router.get('/budget', financeController.getBudget);
router.post('/budget', authorize('admin', 'manager'), financeController.createBudget);
router.put('/budget/:id', authorize('admin', 'manager'), financeController.updateBudget);

// Cash Flow
router.get('/cashflow', financeController.getCashFlow);

module.exports = router;
