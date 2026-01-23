// Multi-tenant Notifications Service
// Data is stored per company using companyId as key

const dataByCompany = {};
let notificationIdCounter = 1;

// Initialize company data if not exists
const initCompanyData = (companyId) => {
  const key = companyId?.toString() || 'default';
  if (!dataByCompany[key]) {
    dataByCompany[key] = {
      notifications: []
    };
    generateMockNotificationsForCompany(key);
  }
  return dataByCompany[key];
};

// Generate mock notifications for a company
const generateMockNotificationsForCompany = (companyKey) => {
  const data = dataByCompany[companyKey];

  data.notifications = [
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Báo cáo tài chính Q4 đã hoàn thành',
      message: 'Báo cáo tài chính quý 4 năm 2025 đã được tạo và sẵn sàng xem',
      type: 'report',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      iconName: 'FileText',
      iconColor: 'blue'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Nhân viên mới đã được thêm',
      message: 'Nguyễn Văn An đã được thêm vào phòng Công nghệ',
      type: 'employee',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      iconName: 'UserPlus',
      iconColor: 'green'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Thanh toán sắp đến hạn',
      message: 'Tiền lương tháng 1 sẽ đến hạn trong 3 ngày',
      type: 'payment',
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      iconName: 'AlertCircle',
      iconColor: 'orange'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Hiệu suất nhân viên đã được cập nhật',
      message: 'Đánh giá hiệu suất Q4 cho tất cả nhân viên đã hoàn tất',
      type: 'performance',
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      iconName: 'TrendingUp',
      iconColor: 'purple'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Mục tiêu KPI đã đạt được',
      message: 'Phòng Kinh doanh đã đạt 105% mục tiêu doanh thu tháng 12',
      type: 'achievement',
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      iconName: 'Award',
      iconColor: 'gold'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Yêu cầu nghỉ phép đang chờ',
      message: 'Trần Thị Bình đã gửi yêu cầu nghỉ phép 3 ngày',
      type: 'leave',
      read: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      iconName: 'Calendar',
      iconColor: 'blue'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Ngân sách đã được phê duyệt',
      message: 'Ngân sách Q1 2026 cho phòng Marketing đã được phê duyệt',
      type: 'budget',
      read: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      iconName: 'DollarSign',
      iconColor: 'green'
    },
    {
      id: notificationIdCounter++,
      companyId: companyKey,
      title: 'Cuộc họp sắp diễn ra',
      message: 'Cuộc họp ban lãnh đạo sẽ bắt đầu vào lúc 14:00 hôm nay',
      type: 'meeting',
      read: true,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      iconName: 'Users',
      iconColor: 'purple'
    }
  ];
};

const notificationsService = {
  /**
   * Get all notifications with pagination for a company
   * @param {string} companyId - Company ID for multi-tenant filtering
   */
  getAllNotifications: async (companyId, { limit = 10, offset = 0, read } = {}) => {
    const data = initCompanyData(companyId);
    let notifications = [...data.notifications];

    // Filter by read status if specified
    if (read !== undefined) {
      const isRead = read === 'true' || read === true;
      notifications = notifications.filter(n => n.read === isRead);
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedNotifications = notifications.slice(offset, offset + limit);

    return {
      data: paginatedNotifications,
      total: notifications.length,
      unreadCount: data.notifications.filter(n => !n.read).length
    };
  },

  /**
   * Get unread count for a company
   */
  getUnreadCount: async (companyId) => {
    const data = initCompanyData(companyId);
    const unreadCount = data.notifications.filter(n => !n.read).length;
    return { count: unreadCount };
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (companyId, notificationId) => {
    const data = initCompanyData(companyId);
    const notification = data.notifications.find(n => n.id === parseInt(notificationId));
    if (notification) {
      notification.read = true;
      return notification;
    }
    return null;
  },

  /**
   * Mark all notifications as read for a company
   */
  markAllAsRead: async (companyId) => {
    const data = initCompanyData(companyId);
    data.notifications.forEach(n => {
      n.read = true;
    });
    return { success: true, message: 'Đã đánh dấu tất cả là đã đọc' };
  },

  /**
   * Delete notification
   */
  deleteNotification: async (companyId, notificationId) => {
    const data = initCompanyData(companyId);
    const index = data.notifications.findIndex(n => n.id === parseInt(notificationId));
    if (index !== -1) {
      data.notifications.splice(index, 1);
      return { success: true, message: 'Đã xóa thông báo' };
    }
    return null;
  },

  /**
   * Create notification for a company
   */
  createNotification: async (companyId, notificationData) => {
    const data = initCompanyData(companyId);
    const newNotification = {
      id: notificationIdCounter++,
      companyId,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
    data.notifications.unshift(newNotification);
    return newNotification;
  },

  /**
   * Get notification categories with counts for a company
   */
  getCategories: async (companyId) => {
    const data = initCompanyData(companyId);
    const typeCounts = {};
    data.notifications.forEach(n => {
      typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    });

    const categoryLabels = {
      all: 'Tất cả',
      report: 'Báo cáo',
      employee: 'Nhân sự',
      payment: 'Thanh toán',
      performance: 'Hiệu suất',
      achievement: 'Thành tích',
      leave: 'Nghỉ phép',
      budget: 'Ngân sách',
      meeting: 'Cuộc họp'
    };

    const categories = [
      { id: 'all', label: categoryLabels.all, count: data.notifications.length }
    ];

    Object.keys(typeCounts).forEach(type => {
      categories.push({
        id: type,
        label: categoryLabels[type] || type,
        count: typeCounts[type]
      });
    });

    return categories;
  }
};

module.exports = notificationsService;
