// Multi-tenant Notifications Service using MongoDB

const Notification = require('../../models/Notification');
const logger = require('../../utils/logger');

const notificationsService = {
  /**
   * Get all notifications with pagination for a company
   */
  getAllNotifications: async (companyId, { limit = 10, offset = 0, read } = {}) => {
    logger.info('Getting notifications', { companyId, limit, offset, read });

    if (!companyId) {
      return { data: [], total: 0, unreadCount: 0 };
    }

    const query = { companyId };

    // Filter by read status if specified
    if (read !== undefined) {
      const isRead = read === 'true' || read === true;
      query.unread = !isRead;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ companyId, unread: true })
    ]);

    return {
      data: notifications.map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        category: n.category,
        read: !n.unread,
        priority: n.priority,
        iconName: n.iconName,
        iconColor: n.color,
        createdAt: n.createdAt
      })),
      total,
      unreadCount
    };
  },

  /**
   * Get unread count for a company
   */
  getUnreadCount: async (companyId) => {
    if (!companyId) {
      return { count: 0 };
    }

    const count = await Notification.countDocuments({ companyId, unread: true });
    return { count };
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (companyId, notificationId) => {
    logger.info('Marking notification as read', { companyId, notificationId });

    const query = { _id: notificationId };
    if (companyId) query.companyId = companyId;

    const notification = await Notification.findOneAndUpdate(
      query,
      { $set: { unread: false, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return null;
    }

    return {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: !notification.unread,
      createdAt: notification.createdAt
    };
  },

  /**
   * Mark all notifications as read for a company
   */
  markAllAsRead: async (companyId) => {
    logger.info('Marking all notifications as read', { companyId });

    if (!companyId) {
      return { success: false, message: 'Company ID required' };
    }

    await Notification.updateMany(
      { companyId, unread: true },
      { $set: { unread: false, readAt: new Date() } }
    );

    return { success: true, message: 'Đã đánh dấu tất cả là đã đọc' };
  },

  /**
   * Delete notification
   */
  deleteNotification: async (companyId, notificationId) => {
    logger.info('Deleting notification', { companyId, notificationId });

    const query = { _id: notificationId };
    if (companyId) query.companyId = companyId;

    const result = await Notification.deleteOne(query);

    if (result.deletedCount > 0) {
      return { success: true, message: 'Đã xóa thông báo' };
    }
    return null;
  },

  /**
   * Create notification for a company
   */
  createNotification: async (companyId, userId, notificationData) => {
    logger.info('Creating notification', { companyId, userId });

    if (!companyId || !userId) {
      throw new Error('Company ID and User ID are required');
    }

    const notification = await Notification.create({
      companyId,
      userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'system',
      category: notificationData.category || 'general',
      priority: notificationData.priority || 'medium',
      iconName: notificationData.iconName || 'Bell',
      color: notificationData.iconColor || 'blue',
      relatedId: notificationData.relatedId,
      relatedModel: notificationData.relatedModel
    });

    return {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: !notification.unread,
      createdAt: notification.createdAt
    };
  },

  /**
   * Get notification categories with counts for a company
   */
  getCategories: async (companyId) => {
    logger.info('Getting notification categories', { companyId });

    if (!companyId) {
      return [{ id: 'all', label: 'Tất cả', count: 0 }];
    }

    const [total, typeCounts] = await Promise.all([
      Notification.countDocuments({ companyId }),
      Notification.aggregate([
        { $match: { companyId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    const categoryLabels = {
      all: 'Tất cả',
      report: 'Báo cáo',
      task: 'Nhiệm vụ',
      meeting: 'Cuộc họp',
      payment: 'Thanh toán',
      alert: 'Cảnh báo',
      system: 'Hệ thống',
      announcement: 'Thông báo'
    };

    const categories = [
      { id: 'all', label: categoryLabels.all, count: total }
    ];

    typeCounts.forEach(tc => {
      categories.push({
        id: tc._id,
        label: categoryLabels[tc._id] || tc._id,
        count: tc.count
      });
    });

    return categories;
  }
};

module.exports = notificationsService;
