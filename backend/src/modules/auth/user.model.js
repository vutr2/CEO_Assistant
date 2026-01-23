const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
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
    minlength: 8,
    select: false // Don't return password by default
  },

  // Profile Information
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  position: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },

  // Company Reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // Role & Permissions
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee', 'viewer'],
    default: 'employee'
  },

  // Authentication
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'vi'
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ companyId: 1, role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Set password changed timestamp
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
