const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Multi-tenant: Required company reference
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
    index: true
  },
  // Link to user account (optional - employee may not have login)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Employee info
  employeeCode: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  // Work info
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  // Employment details
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'leave', 'terminated'],
    default: 'active'
  },
  // Salary info
  salary: {
    base: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'VND'
    }
  },
  // Performance
  performance: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastReviewDate: Date,
    nextReviewDate: Date
  },
  // Personal info
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    type: String,
    trim: true
  },
  // Emergency contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Documents
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Notes
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for multi-tenant queries
employeeSchema.index({ companyId: 1, status: 1 });
employeeSchema.index({ companyId: 1, department: 1 });
employeeSchema.index({ companyId: 1, email: 1 });

// Static method to find by company
employeeSchema.statics.findByCompany = function(companyId, filter = {}) {
  return this.find({ companyId, ...filter });
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
