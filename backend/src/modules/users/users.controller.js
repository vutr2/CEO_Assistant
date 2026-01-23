const UserModel = require('../../models/user.model');
const authService = require('../auth/auth.service');

const usersController = {
  /**
   * Get current user profile
   */
  getProfile: async (req, res, next) => {
    try {
      // Get user from auth middleware or token
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Return mock profile for demo
        return res.status(200).json({
          success: true,
          data: {
            id: 1,
            email: 'demo@ceoassistant.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'admin',
            companyId: 1,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      const token = authHeader.split(' ')[1];
      const userId = authService.verifyAuthToken(token);

      if (!userId) {
        // Return mock profile for demo
        return res.status(200).json({
          success: true,
          data: {
            id: 1,
            email: 'demo@ceoassistant.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'admin',
            companyId: 1,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      const user = UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user.toJSON()
      });

    } catch (error) {
      console.error('Error in getProfile:', error);
      next(error);
    }
  },

  /**
   * Update current user profile
   */
  updateProfile: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const token = authHeader.split(' ')[1];
      const userId = authService.verifyAuthToken(token);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      const { firstName, lastName, email, phone } = req.body;

      const updatedUser = await authService.updateProfile(userId, {
        firstName,
        lastName,
        email
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Error in updateProfile:', error);
      next(error);
    }
  },

  /**
   * Get user settings
   */
  getSettings: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
          theme: 'light'
        }
      });
    } catch (error) {
      console.error('Error in getSettings:', error);
      next(error);
    }
  },

  /**
   * Update user settings
   */
  updateSettings: async (req, res, next) => {
    try {
      const { notifications, language, timezone, theme } = req.body;

      res.status(200).json({
        success: true,
        data: {
          notifications: notifications || { email: true, push: true, sms: false },
          language: language || 'vi',
          timezone: timezone || 'Asia/Ho_Chi_Minh',
          theme: theme || 'light'
        },
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
      next(error);
    }
  },

  /**
   * Get user performance data
   */
  getPerformance: async (req, res, next) => {
    try {
      // Return as array for chart rendering
      const performanceData = [
        { month: 'T1', tasks: 38, completed: 32, efficiency: 84 },
        { month: 'T2', tasks: 42, completed: 38, efficiency: 90 },
        { month: 'T3', tasks: 35, completed: 30, efficiency: 86 },
        { month: 'T4', tasks: 48, completed: 44, efficiency: 92 },
        { month: 'T5', tasks: 52, completed: 48, efficiency: 92 },
        { month: 'T6', tasks: 45, completed: 40, efficiency: 89 },
        { month: 'T7', tasks: 50, completed: 46, efficiency: 92 },
        { month: 'T8', tasks: 55, completed: 50, efficiency: 91 },
        { month: 'T9', tasks: 48, completed: 44, efficiency: 92 },
        { month: 'T10', tasks: 52, completed: 48, efficiency: 92 },
        { month: 'T11', tasks: 58, completed: 54, efficiency: 93 },
        { month: 'T12', tasks: 45, completed: 42, efficiency: 93 }
      ];

      res.status(200).json({
        success: true,
        data: performanceData
      });
    } catch (error) {
      console.error('Error in getPerformance:', error);
      next(error);
    }
  },

  /**
   * Get user skills
   */
  getSkills: async (req, res, next) => {
    try {
      // Return as array for frontend mapping
      const skillsData = [
        { name: 'Leadership', level: 90, category: 'management' },
        { name: 'Strategic Planning', level: 85, category: 'management' },
        { name: 'Financial Analysis', level: 80, category: 'technical' },
        { name: 'Team Management', level: 88, category: 'management' },
        { name: 'Data Analysis', level: 75, category: 'technical' },
        { name: 'Communication', level: 92, category: 'soft' },
        { name: 'Problem Solving', level: 87, category: 'soft' },
        { name: 'Project Management', level: 82, category: 'management' }
      ];

      res.status(200).json({
        success: true,
        data: skillsData
      });
    } catch (error) {
      console.error('Error in getSkills:', error);
      next(error);
    }
  },

  /**
   * Get user stats
   */
  getStats: async (req, res, next) => {
    try {
      // Return as array for frontend mapping
      const statsData = [
        {
          icon: 'Target',
          color: 'blue',
          value: '24',
          label: 'Dự án',
          change: '+12%'
        },
        {
          icon: 'CheckCircle',
          color: 'green',
          value: '156',
          label: 'Nhiệm vụ hoàn thành',
          change: '+8%'
        },
        {
          icon: 'Users',
          color: 'purple',
          value: '15',
          label: 'Thành viên team',
          change: '+2'
        },
        {
          icon: 'TrendingUp',
          color: 'orange',
          value: '94%',
          label: 'Hiệu suất',
          change: '+5%'
        }
      ];

      res.status(200).json({
        success: true,
        data: statsData
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      next(error);
    }
  },

  /**
   * Get user activities
   */
  getActivities: async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;

      const activities = [
        {
          id: 1,
          type: 'report',
          title: 'Tạo báo cáo tài chính Q4',
          description: 'Đã hoàn thành báo cáo tài chính quý 4 năm 2024',
          time: '30 phút trước',
          color: 'blue',
          icon: 'FileText'
        },
        {
          id: 2,
          type: 'meeting',
          title: 'Tham gia cuộc họp chiến lược',
          description: 'Họp với ban lãnh đạo về kế hoạch năm 2025',
          time: '2 giờ trước',
          color: 'purple',
          icon: 'Users'
        },
        {
          id: 3,
          type: 'approval',
          title: 'Phê duyệt ngân sách marketing',
          description: 'Đã phê duyệt ngân sách 500 triệu cho Q1',
          time: '4 giờ trước',
          color: 'green',
          icon: 'CheckCircle'
        },
        {
          id: 4,
          type: 'task',
          title: 'Hoàn thành review nhân sự',
          description: 'Đánh giá hiệu suất 15 nhân viên',
          time: '8 giờ trước',
          color: 'orange',
          icon: 'ClipboardCheck'
        },
        {
          id: 5,
          type: 'ai',
          title: 'Tương tác với AI Assistant',
          description: 'Phân tích dữ liệu doanh thu với AI',
          time: '12 giờ trước',
          color: 'blue',
          icon: 'Bot'
        },
        {
          id: 6,
          type: 'document',
          title: 'Upload tài liệu dự án',
          description: 'Tải lên hồ sơ dự án mở rộng',
          time: '1 ngày trước',
          color: 'gray',
          icon: 'Upload'
        },
        {
          id: 7,
          type: 'decision',
          title: 'Quyết định mở rộng thị trường',
          description: 'Phê duyệt kế hoạch mở rộng ra miền Trung',
          time: '2 ngày trước',
          color: 'red',
          icon: 'Target'
        },
        {
          id: 8,
          type: 'analysis',
          title: 'Xem phân tích doanh thu',
          description: 'Review báo cáo phân tích doanh thu tháng 12',
          time: '3 ngày trước',
          color: 'blue',
          icon: 'BarChart'
        },
        {
          id: 9,
          type: 'team',
          title: 'Thêm thành viên mới vào team',
          description: 'Chào đón 2 nhân viên mới vào phòng Tech',
          time: '4 ngày trước',
          color: 'green',
          icon: 'UserPlus'
        },
        {
          id: 10,
          type: 'settings',
          title: 'Cập nhật cài đặt tài khoản',
          description: 'Thay đổi thông tin bảo mật',
          time: '5 ngày trước',
          color: 'gray',
          icon: 'Settings'
        }
      ];

      res.status(200).json({
        success: true,
        data: activities.slice(0, parseInt(limit))
      });
    } catch (error) {
      console.error('Error in getActivities:', error);
      next(error);
    }
  },

  /**
   * Get user achievements
   */
  getAchievements: async (req, res, next) => {
    try {
      // Return as array for frontend mapping
      const achievementsData = [
        {
          id: 1,
          name: 'Nhà lãnh đạo xuất sắc',
          description: 'Hoàn thành 100 quyết định chiến lược',
          icon: 'Trophy',
          color: 'yellow',
          earnedDate: '2024-12-01'
        },
        {
          id: 2,
          name: 'Chuyên gia phân tích',
          description: 'Xem 500 báo cáo phân tích',
          icon: 'BarChart2',
          color: 'blue',
          earnedDate: '2024-11-15'
        },
        {
          id: 3,
          name: 'Người dùng AI tích cực',
          description: 'Tương tác 200 lần với AI Assistant',
          icon: 'Bot',
          color: 'purple',
          earnedDate: '2024-11-01'
        },
        {
          id: 4,
          name: 'Quản lý tài chính',
          description: 'Phê duyệt 50 ngân sách',
          icon: 'DollarSign',
          color: 'green',
          earnedDate: '2024-10-20'
        },
        {
          id: 5,
          name: 'Người xây dựng đội ngũ',
          description: 'Quản lý team 20+ nhân viên',
          icon: 'Users',
          color: 'orange',
          earnedDate: '2024-10-01'
        },
        {
          id: 6,
          name: 'Người tiên phong',
          description: 'Sử dụng hệ thống từ những ngày đầu',
          icon: 'Rocket',
          color: 'red',
          earnedDate: '2023-01-15'
        }
      ];

      res.status(200).json({
        success: true,
        data: achievementsData
      });
    } catch (error) {
      console.error('Error in getAchievements:', error);
      next(error);
    }
  }
};

module.exports = usersController;
