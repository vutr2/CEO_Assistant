const mongoose = require('mongoose');

// Revenue Model
const revenueSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Sales', 'Services', 'Investment', 'Other'],
    default: 'Sales'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Expense Model
const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Nhân sự', 'Vận hành', 'Marketing', 'R&D', 'Khác']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Other'],
    default: 'Bank Transfer'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Budget Model
const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  allocated: {
    type: Number,
    required: true,
    min: 0
  },
  used: {
    type: Number,
    default: 0,
    min: 0
  },
  period: {
    type: String,
    enum: ['week', 'month', 'quarter', 'year'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
revenueSchema.index({ companyId: 1, date: -1 });
expenseSchema.index({ companyId: 1, date: -1 });
budgetSchema.index({ companyId: 1, period: 1 });

// Models
const Revenue = mongoose.model('Revenue', revenueSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const Budget = mongoose.model('Budget', budgetSchema);

module.exports = {
  Revenue,
  Expense,
  Budget
};
