const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate, requireCompany } = require('../../middlewares/auth');

// Apply authentication to all dashboard routes
router.use(authenticate);
router.use(requireCompany);

// Dashboard Overview - All authenticated users with company can view
router.get('/overview', dashboardController.getOverview);
router.get('/metrics', dashboardController.getMetrics);
router.get('/activities', dashboardController.getActivities);
router.get('/insights', dashboardController.getInsights);
router.get('/top-performers', dashboardController.getTopPerformers);

module.exports = router;
