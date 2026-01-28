const User = require('../../models/User');
const authService = require('../auth/auth.service');

const usersController = {
  /**
   * Get current user profile
   */
  getProfile: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - No token provided'
        });
      }

      const token = authHeader.split(' ')[1];
      const userId = authService.verifyAuthToken(token);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          isEmailVerified: user.isEmailVerified,
          permissions: user.permissions,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
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

      const { name, email, phone } = req.body;

      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) {
        updateFields.email = email.toLowerCase();
        updateFields.isEmailVerified = false;
      }
      if (phone) updateFields.phone = phone;

      const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
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

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Return user settings (default values if not set)
      res.status(200).json({
        success: true,
        data: {
          notifications: user.settings?.notifications || {
            email: true,
            push: true,
            sms: false
          },
          language: user.settings?.language || 'vi',
          timezone: user.settings?.timezone || 'Asia/Ho_Chi_Minh',
          theme: user.settings?.theme || 'light'
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

      const { notifications, language, timezone, theme } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          settings: {
            notifications: notifications || { email: true, push: true, sms: false },
            language: language || 'vi',
            timezone: timezone || 'Asia/Ho_Chi_Minh',
            theme: theme || 'light'
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user.settings,
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
      // TODO: Implement real performance tracking
      // For now return sample data structure
      const performanceData = [
        { month: 'T1', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T2', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T3', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T4', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T5', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T6', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T7', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T8', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T9', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T10', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T11', tasks: 0, completed: 0, efficiency: 0 },
        { month: 'T12', tasks: 0, completed: 0, efficiency: 0 }
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
      // TODO: Implement real skills tracking
      const skillsData = [];

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
      // TODO: Calculate real stats from database
      const statsData = [
        {
          icon: 'Target',
          color: 'blue',
          value: '0',
          label: 'Dự án',
          change: '0%'
        },
        {
          icon: 'CheckCircle',
          color: 'green',
          value: '0',
          label: 'Nhiệm vụ hoàn thành',
          change: '0%'
        },
        {
          icon: 'Users',
          color: 'purple',
          value: '0',
          label: 'Thành viên team',
          change: '0'
        },
        {
          icon: 'TrendingUp',
          color: 'orange',
          value: '0%',
          label: 'Hiệu suất',
          change: '0%'
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

      // TODO: Implement real activity logging
      const activities = [];

      res.status(200).json({
        success: true,
        data: activities
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
      // TODO: Implement real achievements system
      const achievementsData = [];

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
