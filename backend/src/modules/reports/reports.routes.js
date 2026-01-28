const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { authenticate, requireCompany } = require('../../middlewares/auth');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireCompany);

// List and Stats (must be before /:id)
router.get('/stats', reportsController.getReportStats);
router.get('/templates', reportsController.getReportTemplates);

// General Reports
router.get('/overview', reportsController.getOverviewReport);
router.get('/dashboard', reportsController.getDashboardReport);
router.get('/', reportsController.getAllReports);

// Financial Reports
router.get('/financial/summary', reportsController.getFinancialSummary);
router.get('/financial/detailed', reportsController.getDetailedFinancialReport);
router.get('/financial/profit-loss', reportsController.getProfitLossReport);

// Employee Reports
router.get('/employees/summary', reportsController.getEmployeeSummary);
router.get('/employees/performance', reportsController.getEmployeePerformance);
router.get('/employees/attendance', reportsController.getAttendanceReport);

// Custom Reports - employees can also create reports
router.post('/custom', reportsController.generateCustomReport);
router.get('/custom/:id', reportsController.getCustomReport);
router.get('/custom', reportsController.listCustomReports);

// Export Reports
router.post('/export', reportsController.exportReport);

module.exports = router;
