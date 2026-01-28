const express = require('express');
const router = express.Router();
const companyController = require('./company.controller');
const { authenticate, requirePermission } = require('../../middlewares/auth');

// Public routes (no authentication required)
router.get('/search', companyController.searchCompanies);
router.get('/find-by-tax', companyController.findCompanyByTaxCode);

// Apply authentication to all remaining company routes
router.use(authenticate);

// Create company (authenticated users without company can create one)
router.post('/', companyController.createCompany);

// Company info - All users can view their company
router.get('/', companyController.getCompanyInfo);
router.get('/profile', companyController.getCompanyInfo);

// Update company - Only admins and owners
router.put('/', requirePermission('manage_settings'), companyController.updateCompanyInfo);
router.put('/profile', requirePermission('manage_settings'), companyController.updateCompanyInfo);

// Company statistics - All users can view
router.get('/stats', companyController.getCompanyStats);
router.get('/metrics', companyController.getCompanyMetrics);

module.exports = router;
