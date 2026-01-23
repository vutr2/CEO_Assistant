const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');

// Stats and aggregations (must be before /:id to avoid conflicts)
router.get('/stats/overview', employeeController.getEmployeeStats);
router.get('/top-performers', employeeController.getTopPerformers);
router.get('/departments', employeeController.getDepartments);

// CRUD operations
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployee);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
