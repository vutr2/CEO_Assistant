/**
 * Multi-tenant Auth Routes
 *
 * USE THIS FILE WHEN YOU ENABLE MONGODB
 * Replace auth.routes.js with this file
 */

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller.multitenant');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { tenantMiddleware } = require('../../middlewares/tenant.middleware');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes (require authentication)
router.use(authMiddleware);

router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.put('/change-password', authController.changePassword);

// Protected routes with tenant context
router.use(tenantMiddleware);

router.post('/invite', authController.inviteToCompany);

module.exports = router;
