const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic Information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  businessCode: {
    type: String,
    trim: true
  },
  taxCode: {
    type: String,
    trim: true
  },

  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },

  // Company Details
  industry: {
    type: String,
    trim: true
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  foundedYear: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },

  // Branding
  logo: {
    type: String,
    default: null
  },

  // Subscription & Settings
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'cancelled'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    }
  },

  // Settings
  settings: {
    currency: {
      type: String,
      default: 'VND'
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    language: {
      type: String,
      default: 'vi'
    }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
companySchema.index({ email: 1 });
companySchema.index({ businessCode: 1 });

module.exports = mongoose.model('Company', companySchema);
