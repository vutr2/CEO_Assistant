const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Personal Information
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
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },

  // Employment Information
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  position: {
    type: String,
    required: [true, 'Position is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Technology', 'Sales', 'Marketing', 'HR', 'Design', 'Finance', 'Operations', 'Other']
  },
  location: {
    type: String,
    default: ''
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'leave', 'terminated'],
    default: 'active'
  },

  // Performance
  performance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Company Reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // User Reference (if employee has login access)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
employeeSchema.index({ companyId: 1, department: 1 });
employeeSchema.index({ companyId: 1, status: 1 });
employeeSchema.index({ email: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
