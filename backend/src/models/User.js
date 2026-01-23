const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  // Multi-tenant: Link to company
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  // Role within the company
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'employee'],
    default: 'employee'
  },
  // Permissions (can be customized per user)
  permissions: [{
    type: String,
    enum: [
      'view_dashboard',
      'manage_employees',
      'view_finance',
      'manage_finance',
      'view_reports',
      'create_reports',
      'manage_settings',
      'manage_billing',
      'use_ai',
      'manage_users'
    ]
  }],
  // Department within company
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Email verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // Last login tracking
  lastLogin: Date,
  // Refresh tokens for JWT
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role') && this.permissions.length === 0) {
    const rolePermissions = {
      owner: [
        'view_dashboard', 'manage_employees', 'view_finance', 'manage_finance',
        'view_reports', 'create_reports', 'manage_settings', 'manage_billing',
        'use_ai', 'manage_users'
      ],
      admin: [
        'view_dashboard', 'manage_employees', 'view_finance', 'manage_finance',
        'view_reports', 'create_reports', 'manage_settings', 'use_ai', 'manage_users'
      ],
      manager: [
        'view_dashboard', 'manage_employees', 'view_finance',
        'view_reports', 'create_reports', 'use_ai'
      ],
      employee: [
        'view_dashboard', 'view_reports', 'use_ai'
      ]
    };
    this.permissions = rolePermissions[this.role] || rolePermissions.employee;
  }
  next();
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ companyId: 1, role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
