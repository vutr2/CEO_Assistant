const authService = require('../modules/auth/auth.service');
const UserModel = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate user with JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const userId = authService.verifyAuthToken(token);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from database
    const user = UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user.toJSON();
    req.userId = userId;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to authorize user based on roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't block if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const userId = authService.verifyAuthToken(token);

      if (userId) {
        const user = UserModel.findById(userId);
        if (user) {
          req.user = user.toJSON();
          req.userId = userId;
        }
      }
    }

    next();
  } catch (error) {
    // Don't block request if optional auth fails
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
