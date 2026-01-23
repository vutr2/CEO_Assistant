const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

// All dashboard routes (can be made optional for testing)
// router.use(authenticate);

// Dashboard Overview
router.get('/overview', dashboardController.getOverview);
router.get('/metrics', dashboardController.getMetrics);
router.get('/activities', dashboardController.getActivities);
router.get('/insights', dashboardController.getInsights);
router.get('/top-performers', dashboardController.getTopPerformers);

module.exports = router;
