const authService = require('./auth.service');
const logger = require('../../utils/logger');

const authController = {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email, password, first name, and last name'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Register user
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role
      });

      logger.info(`User registered successfully: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
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
          message: 'Please provide email and password'
        });
      }

      // Login user
      const result = await authService.login(email, password);

      logger.info(`User logged in successfully: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
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
      // Get user ID from token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const userId = authService.verifyAuthToken(token);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      // Logout user
      await authService.logout(userId);

      logger.info(`User logged out: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Logout successful'
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
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Refresh token
      const result = await authService.refreshToken(refreshToken);

      logger.info(`Token refreshed for user: ${result.user.id}`);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
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
          message: 'Email is required'
        });
      }

      // Request password reset
      const result = await authService.forgotPassword(email);

      logger.info(`Password reset requested for: ${email}`);

      res.status(200).json({
        success: true,
        message: result.message,
        // In production, don't send the token in response - send via email
        data: {
          resetToken: result.resetToken
        }
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
          message: 'New password is required'
        });
      }

      // Reset password
      await authService.resetPassword(token, password);

      logger.info(`Password reset successful for token: ${token.substring(0, 10)}...`);

      res.status(200).json({
        success: true,
        message: 'Password reset successful'
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
   * Verify email with token
   * GET /api/v1/auth/verify-email/:token
   */
  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.params;

      // Verify email
      await authService.verifyEmail(token);

      logger.info(`Email verified for token: ${token.substring(0, 10)}...`);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getCurrentUser: async (req, res, next) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      // Get current user
      const user = await authService.getCurrentUser(token);

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
  },

  /**
   * Update user profile
   * PUT /api/v1/auth/update-profile
   */
  updateProfile: async (req, res, next) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const userId = authService.verifyAuthToken(token);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      const { firstName, lastName, email } = req.body;

      // Update profile
      const user = await authService.updateProfile(userId, {
        firstName,
        lastName,
        email
      });

      logger.info(`Profile updated for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
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
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const userId = authService.verifyAuthToken(token);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Old password and new password are required'
        });
      }

      // Change password
      await authService.changePassword(userId, oldPassword, newPassword);

      logger.info(`Password changed for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = authController;
