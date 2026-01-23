/**
 * Multi-tenant Auth Middleware
 *
 * USE THIS FILE WHEN YOU ENABLE MONGODB
 * Replace auth.middleware.js with this file
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Company } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate user with JWT token
 * Attaches user info including companyId to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Token không được cung cấp.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị khóa'
      });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      companyId: user.companyId
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Xác thực thất bại'
    });
  }
};

/**
 * Middleware to authorize user based on roles
 * @param  {...string} allowedRoles - Allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu xác thực'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập. Quyền hạn không đủ.'
      });
    }

    next();
  };
};

/**
 * Middleware to check specific permissions
 * @param  {...string} requiredPermissions - Required permissions
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu xác thực'
      });
    }

    // Owner and admin have all permissions
    if (['owner', 'admin'].includes(req.user.role)) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền thực hiện hành động này'
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

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive) {
          req.user = {
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            companyId: user.companyId
          };
        }
      } catch (err) {
        // Token invalid, but don't block - this is optional auth
      }
    }

    next();
  } catch (error) {
    // Don't block request if optional auth fails
    next();
  }
};

/**
 * Middleware to verify company subscription is active
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Không thuộc công ty nào'
      });
    }

    const company = await Company.findById(req.user.companyId);

    if (!company || !company.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Công ty không hoạt động'
      });
    }

    if (company.subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Gói đăng ký đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.'
      });
    }

    // Attach company to request
    req.company = {
      id: company._id,
      name: company.name,
      plan: company.subscription.plan,
      features: company.subscription.features
    };

    next();
  } catch (error) {
    logger.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra gói đăng ký'
    });
  }
};

/**
 * Middleware to check feature access based on subscription plan
 * @param {string} feature - Feature name to check
 */
const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.company) {
      return res.status(403).json({
        success: false,
        message: 'Yêu cầu kiểm tra gói đăng ký trước'
      });
    }

    const features = req.company.features || [];

    // Define features by plan
    const planFeatures = {
      free: ['basic_dashboard', 'employee_management'],
      starter: ['basic_dashboard', 'employee_management', 'finance_tracking', 'reports'],
      professional: ['basic_dashboard', 'employee_management', 'finance_tracking', 'reports', 'ai_assistant', 'advanced_analytics'],
      enterprise: ['all']
    };

    const allowedFeatures = planFeatures[req.company.plan] || planFeatures.free;

    if (!allowedFeatures.includes('all') && !allowedFeatures.includes(feature)) {
      return res.status(403).json({
        success: false,
        message: `Tính năng "${feature}" không có trong gói ${req.company.plan}. Vui lòng nâng cấp gói.`
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  authorize,
  requirePermission,
  optionalAuth,
  requireActiveSubscription,
  requireFeature
};
