const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');

// User Routes
router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.get('/settings', usersController.getSettings);
router.put('/settings', usersController.updateSettings);
router.get('/performance', usersController.getPerformance);
router.get('/skills', usersController.getSkills);
router.get('/stats', usersController.getStats);
router.get('/activities', usersController.getActivities);
router.get('/achievements', usersController.getAchievements);

module.exports = router;
