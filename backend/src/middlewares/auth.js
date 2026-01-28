/**
 * Authentication & Authorization Middleware
 * Multi-tenant auth with MongoDB
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const Company = require('../models/Company');
const logger = require('../utils/logger');

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user info to request
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
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if email is verified (can be disabled for testing)
    if (!user.isEmailVerified && config.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this resource'
      });
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      userId: user._id, // For backward compatibility
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      companyId: user.companyId
    };

    // Also attach companyId directly for easier access
    req.companyId = user.companyId;

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
            id: user._id,
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions || [],
            companyId: user.companyId
          };
          req.companyId = user.companyId;
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
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - Allowed roles
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
        message: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * Checks if user has specific permissions
 * @param  {...string} requiredPermissions - Required permissions
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Owner and admin have all permissions by default
    if (['owner', 'admin'].includes(req.user.role)) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Missing required permissions.',
        required: requiredPermissions,
        userPermissions
      });
    }

    next();
  };
};

/**
 * Ensure user belongs to a company (multi-tenant requirement)
 */
const requireCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      message: 'User is not associated with any company. Please complete company setup.'
    });
  }

  next();
};

/**
 * Check if user has access to specific company
 * Used for cross-company operations (admin only)
 */
const checkCompanyAccess = (req, res, next) => {
  const requestedCompanyId = req.params.companyId || req.body.companyId;

  if (!requestedCompanyId) {
    return next();
  }

  // Only owner can access other companies
  if (req.user.role !== 'owner' &&
      req.user.companyId.toString() !== requestedCompanyId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this company'
    });
  }

  next();
};

/**
 * Verify company subscription is active
 * Optional: Can be used to gate features by subscription
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Company association required'
      });
    }

    const company = await Company.findById(req.user.companyId);

    if (!company || !company.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Company is inactive'
      });
    }

    // Optional: Check subscription status
    if (company.subscription && company.subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Subscription expired. Please renew to continue.',
        plan: company.subscription.plan
      });
    }

    // Attach company info to request
    req.company = {
      id: company._id,
      name: company.name,
      plan: company.subscription?.plan || 'free',
      features: company.subscription?.features || []
    };

    next();
  } catch (error) {
    logger.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
};

/**
 * Check feature access based on subscription plan
 * @param {string} feature - Feature name to check
 */
const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.company) {
      return res.status(403).json({
        success: false,
        message: 'Subscription verification required'
      });
    }

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
        message: `Feature "${feature}" not available in ${req.company.plan} plan. Please upgrade.`,
        currentPlan: req.company.plan,
        feature
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  requireCompany,
  checkCompanyAccess,
  requireActiveSubscription,
  requireFeature
};
