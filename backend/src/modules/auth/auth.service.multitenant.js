/**
 * Multi-tenant Auth Service
 * Handles authentication with company context
 *
 * USE THIS FILE WHEN YOU ENABLE MONGODB
 * Replace auth.service.js with this file
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config/env');
const { User, Company } = require('../../models');

// Generate JWT token with company context
const generateToken = (user, expiresIn = config.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(
    {
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
      email: user.email
    },
    config.JWT_SECRET,
    { expiresIn }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    config.JWT_REFRESH_SECRET || config.JWT_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const authServiceMultitenant = {
  /**
   * Register a new user AND create their company
   * This is for new company signup
   */
  registerWithCompany: async (userData) => {
    const { email, password, name, companyName, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // Create company first
    const company = await Company.create({
      name: companyName,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date()
      }
    });

    // Create user as owner of the company
    const user = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      name,
      phone,
      companyId: company._id,
      role: 'owner',
      isEmailVerified: false,
      emailVerificationToken: generateRandomToken(),
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Update company owner
    company.owner = user._id;
    await company.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: company._id,
        companyName: company.name
      },
      company: {
        id: company._id,
        name: company.name,
        plan: company.subscription.plan
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Register a new user to an existing company
   * Used when inviting team members
   */
  registerToCompany: async (userData, companyId, inviteToken = null) => {
    const { email, password, name, phone, role = 'employee' } = userData;

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // TODO: Verify invite token if provided

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      phone,
      companyId: company._id,
      role: role,
      isEmailVerified: false
    });

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: company._id
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị khóa');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Get company info
    const company = await Company.findById(user.companyId);
    if (!company || !company.isActive) {
      throw new Error('Công ty không hoạt động');
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login and save refresh token
    user.lastLogin = new Date();
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Limit stored refresh tokens to last 5
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        companyId: company._id,
        companyName: company.name
      },
      company: {
        id: company._id,
        name: company.name,
        plan: company.subscription.plan,
        logo: company.logo
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Logout user
   */
  logout: async (userId, refreshToken) => {
    // Remove specific refresh token
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
    return { success: true };
  },

  /**
   * Logout from all devices
   */
  logoutAll: async (userId) => {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] }
    });
    return { success: true };
  },

  /**
   * Refresh access token
   */
  refreshToken: async (token) => {
    try {
      // Verify refresh token
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET || config.JWT_SECRET);

      // Find user with this refresh token
      const user = await User.findOne({
        _id: decoded.userId,
        'refreshTokens.token': token
      });

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = generateToken(user);

      return {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId
        }
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  },

  /**
   * Verify token and return user info
   */
  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return null;
      }

      return {
        userId: user._id,
        companyId: user.companyId,
        role: user.role,
        permissions: user.permissions
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset link

    return {
      success: true,
      resetToken // Remove this in production - only for testing
    };
  },

  /**
   * Reset password
   */
  resetPassword: async (token, newPassword) => {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Logout all devices
    await user.save();

    return { success: true };
  },

  /**
   * Change password
   */
  changePassword: async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User không tồn tại');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    user.password = newPassword;
    await user.save();

    return { success: true };
  },

  /**
   * Get current user with company info
   */
  getCurrentUser: async (userId) => {
    const user = await User.findById(userId).populate('companyId');
    if (!user) {
      throw new Error('User không tồn tại');
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      permissions: user.permissions,
      department: user.department,
      position: user.position,
      company: user.companyId ? {
        id: user.companyId._id,
        name: user.companyId.name,
        logo: user.companyId.logo,
        plan: user.companyId.subscription?.plan
      } : null
    };
  }
};

module.exports = authServiceMultitenant;
