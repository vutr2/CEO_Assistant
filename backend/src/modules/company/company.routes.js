const express = require('express');
const router = express.Router();
const companyController = require('./company.controller');

router.get('/', companyController.getCompanyInfo);
router.get('/profile', companyController.getCompanyInfo);
router.put('/', companyController.updateCompanyInfo);
router.put('/profile', companyController.updateCompanyInfo);
router.get('/stats', companyController.getCompanyStats);
router.get('/metrics', companyController.getCompanyMetrics);

module.exports = router;
