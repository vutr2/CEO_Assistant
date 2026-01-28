/**
 * Sale Model
 * Tracks sales, deals, and revenue from employees
 */

const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Sale details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'VND',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'e_wallet', 'other'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Sale tracking
  status: {
    type: String,
    enum: ['lead', 'contacted', 'negotiating', 'won', 'lost'],
    default: 'lead'
  },
  category: {
    type: String,
    enum: ['product', 'service', 'subscription', 'other'],
    default: 'product'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'social_media', 'referral', 'walk_in', 'other'],
    default: 'other'
  },
  // Dates
  saleDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedCloseDate: {
    type: Date
  },
  actualCloseDate: {
    type: Date
  },
  // Products/Services
  items: [{
    name: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  // Additional info
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  department: {
    type: String,
    trim: true
  },
  // Invoice/Receipt
  invoiceNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  // Approval workflow for Finance integration
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Link to Finance Revenue when approved
  financeRevenueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Revenue'
  },
  syncedToFinance: {
    type: Boolean,
    default: false
  },
  // Metadata
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
saleSchema.index({ companyId: 1, saleDate: -1 });
saleSchema.index({ companyId: 1, userId: 1, saleDate: -1 });
saleSchema.index({ companyId: 1, status: 1 });
saleSchema.index({ companyId: 1, paymentStatus: 1 });
saleSchema.index({ companyId: 1, customerName: 1 });

// Calculate total before saving
saleSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const itemsTotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
    this.amount = itemsTotal - (this.discount || 0) + (this.tax || 0);
  }
  next();
});

// Virtual for user details
saleSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
saleSchema.set('toJSON', { virtuals: true });
saleSchema.set('toObject', { virtuals: true });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
