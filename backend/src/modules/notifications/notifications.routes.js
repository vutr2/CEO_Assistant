const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');

// Use optional authentication for testing
router.use(optionalAuth);

// Get unread count (must be before /:id to avoid conflicts)
router.get('/unread-count', notificationsController.getUnreadCount);

// Get notification categories (must be before /:id to avoid conflicts)
router.get('/categories', notificationsController.getCategories);

// Mark all as read (must be before /:id to avoid conflicts)
router.patch('/read-all', notificationsController.markAllAsRead);

// Get all notifications
router.get('/', notificationsController.getAllNotifications);

// Mark specific notification as read
router.patch('/:id/read', notificationsController.markAsRead);

// Delete notification
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
