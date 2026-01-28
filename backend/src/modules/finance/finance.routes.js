const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const { authenticate, requireCompany, requirePermission, authorize } = require('../../middlewares/auth');

// Apply authentication and company requirement to all routes
router.use(authenticate);
router.use(requireCompany);

// Financial Overview
router.get('/overview', requirePermission('view_finance'), financeController.getFinancialOverview);

// Transactions
router.get('/transactions', requirePermission('view_finance'), financeController.getTransactions);

// Revenue Management
router.get('/revenue', requirePermission('view_finance'), financeController.getRevenue);
router.post('/revenue', requirePermission('manage_finance'), financeController.addRevenue);
router.get('/revenue/:id', requirePermission('view_finance'), financeController.getRevenueById);
router.put('/revenue/:id', requirePermission('manage_finance'), financeController.updateRevenue);
router.delete('/revenue/:id', authorize('owner', 'admin'), financeController.deleteRevenue);

// Expense Management
router.get('/expenses', requirePermission('view_finance'), financeController.getExpenses);
router.post('/expenses', requirePermission('manage_finance'), financeController.addExpense);
router.get('/expenses/:id', requirePermission('view_finance'), financeController.getExpenseById);
router.put('/expenses/:id', requirePermission('manage_finance'), financeController.updateExpense);
router.delete('/expenses/:id', authorize('owner', 'admin'), financeController.deleteExpense);

// Financial Metrics
router.get('/metrics', requirePermission('view_finance'), financeController.getFinancialMetrics);
router.get('/metrics/trends', requirePermission('view_finance'), financeController.getFinancialTrends);
router.get('/metrics/forecast', requirePermission('view_finance'), financeController.getFinancialForecast);

// Budget Management
router.get('/budget', requirePermission('view_finance'), financeController.getBudget);
router.post('/budget', requirePermission('manage_finance'), financeController.createBudget);
router.put('/budget/:id', requirePermission('manage_finance'), financeController.updateBudget);

// Cash Flow
router.get('/cashflow', requirePermission('view_finance'), financeController.getCashFlow);

module.exports = router;
