const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');
const { authenticate, requireCompany, requirePermission, authorize } = require('../../middlewares/auth');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireCompany);

// Stats and aggregations (must be before /:id to avoid conflicts)
router.get('/stats/overview', requirePermission('view_dashboard'), employeeController.getEmployeeStats);
router.get('/top-performers', requirePermission('view_dashboard'), employeeController.getTopPerformers);
router.get('/departments', requirePermission('view_dashboard'), employeeController.getDepartments);

// CRUD operations
router.get('/', requirePermission('view_dashboard'), employeeController.getAllEmployees);
router.get('/:id', requirePermission('view_dashboard'), employeeController.getEmployee);
router.post('/', requirePermission('manage_employees'), employeeController.createEmployee);
router.put('/:id', requirePermission('manage_employees'), employeeController.updateEmployee);
router.delete('/:id', authorize('owner', 'admin'), employeeController.deleteEmployee);

module.exports = router;
