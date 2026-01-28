const express = require('express');
const router = express.Router();
const activitiesController = require('./activities.controller');
const { authenticate, requireCompany } = require('../../middlewares/auth');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireCompany);

// Activity routes
router.post('/', activitiesController.createActivity);
router.get('/', activitiesController.getActivities);
router.get('/stats', activitiesController.getActivityStats);
router.get('/top-performers', activitiesController.getTopPerformers);
router.get('/:id', activitiesController.getActivityById);
router.put('/:id', activitiesController.updateActivity);
router.delete('/:id', activitiesController.deleteActivity);

module.exports = router;
