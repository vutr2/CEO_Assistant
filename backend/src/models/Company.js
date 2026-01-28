const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  businessCode: {
    type: String,
    trim: true
  },
  taxCode: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '50-100', '100-500', '500+'],
    default: '1-10'
  },
  founded: {
    type: Date
  },
  logo: {
    type: String
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  // Subscription info
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired', 'trialing'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    trialEndDate: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    // Shopify integration fields
    shopifyCustomerId: {
      type: String,
      trim: true
    },
    shopifySubscriptionId: {
      type: String,
      trim: true
    },
    shopifyOrderId: {
      type: String,
      trim: true
    },
    // Features based on plan
    features: [{
      type: String,
      enum: [
        'basic_dashboard',
        'employee_management',
        'finance_tracking',
        'reports',
        'ai_assistant',
        'advanced_analytics',
        'priority_support',
        'custom_integrations',
        'unlimited_users'
      ]
    }]
  },
  // Settings
  settings: {
    currency: {
      type: String,
      default: 'VND'
    },
    language: {
      type: String,
      default: 'vi'
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    fiscalYearStart: {
      type: Number,
      default: 1 // January
    }
  },
  // Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
companySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

// Index for faster queries
companySchema.index({ slug: 1 });
companySchema.index({ owner: 1 });
companySchema.index({ 'subscription.plan': 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
