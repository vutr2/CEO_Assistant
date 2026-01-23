const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Authentication Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes (require authentication)
router.get('/me', authController.getCurrentUser);
router.put('/update-profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

module.exports = router;
