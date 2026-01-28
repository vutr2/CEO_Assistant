const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config/env');
const User = require('../../models/User');
const emailService = require('../../utils/emailService');

// Generate JWT token
const generateToken = (userId, expiresIn = config.JWT_EXPIRES_IN) => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const { email, password, firstName, lastName, role, companyId, position, department, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Generate email verification token
    const emailVerificationToken = generateRandomToken();

    // Create user (password is hashed by the User model pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name: `${firstName} ${lastName}`,
      phone: phone || undefined,
      role: role || 'employee',
      companyId: companyId || undefined,
      position: position || undefined,
      department: department || undefined,
      emailVerificationToken,
      isEmailVerified: false
    });

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, config.JWT_REFRESH_EXPIRES_IN);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, emailVerificationToken, user.name);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        position: user.position,
        department: user.department,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken,
      emailVerificationToken
    };
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Your account has been deactivated');
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateToken(user._id, config.JWT_REFRESH_EXPIRES_IN);

    // Save refresh token and update last login
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    user.lastLogin = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        companyId: user.companyId
      },
      accessToken,
      refreshToken
    };
  },

  /**
   * Logout user
   */
  logout: async (userId) => {
    // Clear all refresh tokens
    await User.findByIdAndUpdate(userId, { refreshTokens: [] });
    return { success: true };
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken) => {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid or expired refresh token');
    }

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    return {
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { success: true, message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    return {
      success: true,
      message: 'Password reset email sent successfully'
    };
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { success: true, message: 'Password reset successful' };
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token) => {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new Error('Invalid email verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail verification if welcome email fails
    }

    return { success: true, message: 'Email verified successfully' };
  },

  /**
   * Get current user by token
   */
  getCurrentUser: async (token) => {
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid or expired token');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      companyId: user.companyId,
      permissions: user.permissions
    };
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, updateData) => {
    const { firstName, lastName, email } = updateData;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new Error('Email already in use');
      }
    }

    const updateFields = {};
    if (firstName && lastName) {
      updateFields.name = `${firstName} ${lastName}`;
    }
    if (email) {
      updateFields.email = email.toLowerCase();
      updateFields.isEmailVerified = false;
    }

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  },

  /**
   * Change password
   */
  changePassword: async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: 'Password changed successfully' };
  },

  /**
   * Verify token and return user ID
   */
  verifyAuthToken: (token) => {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    return decoded.userId;
  }
};

module.exports = authService;
