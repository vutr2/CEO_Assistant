const crypto = require('crypto');
const config = require('../../config/env');
const UserModel = require('../../models/user.model');

// Simple password hashing using crypto (in production, use bcrypt)
const hashPassword = (password) => {
  return crypto
    .createHmac('sha256', config.JWT_SECRET)
    .update(password)
    .digest('hex');
};

// Compare password
const comparePassword = (password, hashedPassword) => {
  const hash = hashPassword(password);
  return hash === hashedPassword;
};

// Generate JWT token
const generateToken = (userId, expiresIn = config.JWT_EXPIRES_IN) => {
  // Simple JWT implementation (in production, use jsonwebtoken library)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    userId,
    iat: Date.now(),
    exp: Date.now() + parseTimeToMs(expiresIn)
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', config.JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const [header, payload, signature] = token.split('.');

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

    // Check expiration
    if (decodedPayload.exp < Date.now()) {
      return null;
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
};

// Parse time string to milliseconds
const parseTimeToMs = (timeStr) => {
  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1));

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value;
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
    const { email, password, firstName, lastName, role } = userData;

    // Check if user already exists
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = generateRandomToken();

    // Create user
    const user = UserModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'user',
      emailVerificationToken,
      isEmailVerified: false
    });

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(user.id, config.JWT_REFRESH_EXPIRES_IN);

    // Save refresh token
    UserModel.update(user.id, { refreshToken });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      emailVerificationToken // In production, send this via email
    };
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (!comparePassword(password, user.password)) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateToken(user.id, config.JWT_REFRESH_EXPIRES_IN);

    // Save refresh token
    UserModel.update(user.id, { refreshToken });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  },

  /**
   * Logout user
   */
  logout: async (userId) => {
    // Clear refresh token
    UserModel.update(userId, { refreshToken: null });
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

    // Find user by refresh token
    const user = UserModel.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateToken(user.id);

    return {
      accessToken: newAccessToken,
      user: user.toJSON()
    };
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: 'If the email exists, a reset link will be sent' };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetExpires = Date.now() + 3600000; // 1 hour

    // Save reset token
    UserModel.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    return {
      success: true,
      resetToken, // In production, send this via email
      message: 'Password reset token generated'
    };
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    // Find user by reset token
    const user = UserModel.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password and clear reset token
    UserModel.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return { success: true, message: 'Password reset successful' };
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token) => {
    // Find user by email token
    const user = UserModel.findByEmailToken(token);
    if (!user) {
      throw new Error('Invalid email verification token');
    }

    // Update user
    UserModel.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null
    });

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

    const user = UserModel.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.toJSON();
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, updateData) => {
    const { firstName, lastName, email } = updateData;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== parseInt(userId)) {
        throw new Error('Email already in use');
      }
    }

    // Update user
    const updatedUser = UserModel.update(userId, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email, isEmailVerified: false }) // Re-verify if email changed
    });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser.toJSON();
  },

  /**
   * Change password
   */
  changePassword: async (userId, oldPassword, newPassword) => {
    // Find user
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    if (!comparePassword(oldPassword, user.password)) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password
    UserModel.update(userId, { password: hashedPassword });

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
