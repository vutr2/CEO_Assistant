// In-memory user storage (mock database)
// In production, this would be replaced with MongoDB/PostgreSQL models

const crypto = require('crypto');

// Simple password hashing (must match auth.service.js)
const hashPassword = (password) => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  return crypto
    .createHmac('sha256', secret)
    .update(password)
    .digest('hex');
};

// Demo users - pre-seeded for testing
const users = [
  {
    id: 1,
    email: 'demo@ceoassistant.com',
    password: hashPassword('Demo@123'),
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    companyId: 1,
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    email: 'admin@company.com',
    password: hashPassword('Admin@123'),
    firstName: 'Admin',
    lastName: 'CEO',
    role: 'admin',
    companyId: 1,
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
let userIdCounter = 3;

class User {
  constructor(data) {
    this.id = data.id || userIdCounter++;
    this.email = data.email;
    this.password = data.password; // Should be hashed
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || 'user'; // 'admin', 'user', 'manager'
    this.companyId = data.companyId || null;
    this.isEmailVerified = data.isEmailVerified || false;
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpires = data.resetPasswordExpires || null;
    this.refreshToken = data.refreshToken || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Instance method to get user without password
  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    delete userObject.emailVerificationToken;
    return userObject;
  }
}

// Static methods for user operations
const UserModel = {
  // Create a new user
  create: (userData) => {
    const user = new User(userData);
    users.push(user);
    return user;
  },

  // Find user by email
  findByEmail: (email) => {
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    return user ? Object.assign(new User({}), user) : null;
  },

  // Find user by ID
  findById: (id) => {
    const user = users.find(user => user.id === parseInt(id));
    return user ? Object.assign(new User({}), user) : null;
  },

  // Find user by reset password token
  findByResetToken: (token) => {
    const user = users.find(user =>
      user.resetPasswordToken === token &&
      user.resetPasswordExpires > Date.now()
    );
    return user ? Object.assign(new User({}), user) : null;
  },

  // Find user by email verification token
  findByEmailToken: (token) => {
    const user = users.find(user => user.emailVerificationToken === token);
    return user ? Object.assign(new User({}), user) : null;
  },

  // Find user by refresh token
  findByRefreshToken: (token) => {
    const user = users.find(user => user.refreshToken === token);
    return user ? Object.assign(new User({}), user) : null;
  },

  // Update user
  update: (id, updateData) => {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date()
    };
    return users[userIndex];
  },

  // Delete user
  delete: (id) => {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    return true;
  },

  // Get all users
  findAll: () => {
    return users;
  },

  // Get users by company
  findByCompany: (companyId) => {
    return users.filter(user => user.companyId === parseInt(companyId));
  },

  // Clear all users (for testing)
  clear: () => {
    users.length = 0;
    userIdCounter = 1;
  }
};

module.exports = UserModel;
