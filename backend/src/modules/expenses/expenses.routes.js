const express = require('express');
const router = express.Router();
const expensesController = require('./expenses.controller');
const { authenticate, requireCompany, authorize } = require('../../middlewares/auth');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireCompany);

// Expense routes
router.post('/', expensesController.createExpense);
router.get('/', expensesController.getExpenses);
router.get('/stats', expensesController.getExpenseStats);
router.get('/by-employee', expensesController.getExpensesByEmployee);
router.get('/pending', expensesController.getPendingExpenses);
router.get('/:id', expensesController.getExpenseById);
router.put('/:id', expensesController.updateExpense);
router.delete('/:id', expensesController.deleteExpense);

// Approval routes (managers/admins only) - syncs to Finance when approved
router.post('/:id/approve', authorize('owner', 'admin', 'manager'), expensesController.approveExpense);
router.post('/:id/reject', authorize('owner', 'admin', 'manager'), expensesController.rejectExpense);

module.exports = router;
