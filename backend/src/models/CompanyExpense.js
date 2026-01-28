/**
 * CompanyExpense Model
 * Tracks company expenses and costs from employees
 */

const mongoose = require('mongoose');

const companyExpenseSchema = new mongoose.Schema({
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
  // Expense details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'office_supplies',
      'travel',
      'meals',
      'utilities',
      'rent',
      'salaries',
      'marketing',
      'equipment',
      'software',
      'services',
      'taxes',
      'insurance',
      'other'
    ],
    required: true
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
    enum: ['cash', 'bank_transfer', 'credit_card', 'company_card', 'e_wallet', 'other'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'reimbursed', 'cancelled'],
    default: 'pending'
  },
  // Tracking
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'paid'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Dates
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paidDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  // Vendor/Supplier
  vendor: {
    type: String,
    trim: true
  },
  vendorEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  vendorPhone: {
    type: String,
    trim: true
  },
  // Receipt/Invoice
  receiptNumber: {
    type: String,
    trim: true
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  // Tax
  isTaxDeductible: {
    type: Boolean,
    default: false
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Approval workflow
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
  project: {
    type: String,
    trim: true
  },
  // Reimbursement (for employee expenses)
  isReimbursable: {
    type: Boolean,
    default: false
  },
  reimbursedAt: {
    type: Date
  },
  // Link to Finance Expense when approved
  financeExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
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
companyExpenseSchema.index({ companyId: 1, expenseDate: -1 });
companyExpenseSchema.index({ companyId: 1, userId: 1, expenseDate: -1 });
companyExpenseSchema.index({ companyId: 1, status: 1 });
companyExpenseSchema.index({ companyId: 1, category: 1 });
companyExpenseSchema.index({ companyId: 1, paymentStatus: 1 });

// Virtual for user details
companyExpenseSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for approver details
companyExpenseSchema.virtual('approver', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
companyExpenseSchema.set('toJSON', { virtuals: true });
companyExpenseSchema.set('toObject', { virtuals: true });

const CompanyExpense = mongoose.model('CompanyExpense', companyExpenseSchema);

module.exports = CompanyExpense;
