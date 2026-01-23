const notificationsService = require('./notifications.service');

const notificationsController = {
  /**
   * Get all notifications
   * GET /api/v1/notifications
   */
  getAllNotifications: async (req, res, next) => {
    try {
      const { limit = 10, offset = 0, read } = req.query;
      const result = await notificationsService.getAllNotifications({
        limit: parseInt(limit),
        offset: parseInt(offset),
        read
      });

      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        unreadCount: result.unreadCount
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread count
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount: async (req, res, next) => {
    try {
      const result = await notificationsService.getUnreadCount();
      res.status(200).json({
        success: true,
        count: result.count
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notification = await notificationsService.markAsRead(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead: async (req, res, next) => {
    try {
      const result = await notificationsService.markAllAsRead();
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await notificationsService.deleteNotification(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get notification categories
   * GET /api/v1/notifications/categories
   */
  getCategories: async (req, res, next) => {
    try {
      const categories = await notificationsService.getCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationsController;
