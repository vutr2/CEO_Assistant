/**
 * Multi-tenant Auth Controller
 * Handles authentication with company context
 *
 * USE THIS FILE WHEN YOU ENABLE MONGODB
 * Replace auth.controller.js with this file
 */

const authService = require('./auth.service.multitenant');
const logger = require('../../utils/logger');

const authControllerMultitenant = {
  /**
   * Register a new user AND create their company
   * POST /api/v1/auth/register
   */
  register: async (req, res, next) => {
    try {
      const { email, password, name, companyName, phone } = req.body;

      // Validate required fields
      if (!email || !password || !name || !companyName) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp email, mật khẩu, tên và tên công ty'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng email không hợp lệ'
        });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 8 ký tự'
        });
      }

      // Register user with company
      const result = await authService.registerWithCompany({
        email,
        password,
        name,
        companyName,
        phone
      });

      logger.info(`User registered with company: ${email} - ${companyName}`);

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: result
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Invite team member to company
   * POST /api/v1/auth/invite
   */
  inviteToCompany: async (req, res, next) => {
    try {
      const { email, password, name, phone, role } = req.body;
      const companyId = req.companyId; // From tenant middleware

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp email, mật khẩu và tên'
        });
      }

      // Only owner/admin can invite
      if (!['owner', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ chủ sở hữu hoặc admin mới có thể mời thành viên'
        });
      }

      // Validate role assignment
      const allowedRoles = ['admin', 'manager', 'employee'];
      if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ'
        });
      }

      // Owner can invite admins, but admins can only invite managers/employees
      if (req.user.role === 'admin' && role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin không thể mời admin khác'
        });
      }

      // Register user to company
      const result = await authService.registerToCompany(
        { email, password, name, phone, role },
        companyId
      );

      logger.info(`User invited to company: ${email} - companyId: ${companyId}`);

      res.status(201).json({
        success: true,
        message: 'Mời thành viên thành công',
        data: result
      });
    } catch (error) {
      logger.error('Invite error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp email và mật khẩu'
        });
      }

      // Login user
      const result = await authService.login(email, password);

      logger.info(`User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.userId;

      await authService.logout(userId, refreshToken);

      logger.info(`User logged out: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Logout from all devices
   * POST /api/v1/auth/logout-all
   */
  logoutAll: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      await authService.logoutAll(userId);

      logger.info(`User logged out from all devices: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Đã đăng xuất khỏi tất cả thiết bị'
      });
    } catch (error) {
      logger.error('Logout all error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token là bắt buộc'
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token đã được làm mới',
        data: result
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email là bắt buộc'
        });
      }

      const result = await authService.forgotPassword(email);

      logger.info(`Password reset requested for: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
        // In production, don't send resetToken in response
        ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password/:token
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới là bắt buộc'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 8 ký tự'
        });
      }

      await authService.resetPassword(token, password);

      logger.info(`Password reset successful for token: ${token.substring(0, 10)}...`);

      res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Change password
   * PUT /api/v1/auth/change-password
   */
  changePassword: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu cũ và mật khẩu mới là bắt buộc'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 8 ký tự'
        });
      }

      await authService.changePassword(userId, oldPassword, newPassword);

      logger.info(`Password changed for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get current user with company info
   * GET /api/v1/auth/me
   */
  getCurrentUser: async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const user = await authService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = authControllerMultitenant;
