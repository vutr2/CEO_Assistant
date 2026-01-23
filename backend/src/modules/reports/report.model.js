const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Tài chính', 'Nhân sự', 'KPI', 'Marketing', 'Tổng quan', 'Khác']
  },
  description: {
    type: String,
    trim: true
  },

  // Status & Dates
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'cancelled'],
    default: 'draft'
  },
  date: {
    type: Date,
    default: Date.now
  },
  period: {
    startDate: Date,
    endDate: Date
  },

  // File Information
  fileUrl: {
    type: String
  },
  fileSize: {
    type: String
  },
  fileName: {
    type: String
  },

  // Content
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  summary: {
    type: String,
    trim: true
  },

  // Metadata
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // Sharing & Permissions
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Template
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportTemplate'
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ companyId: 1, status: 1, date: -1 });
reportSchema.index({ author: 1, date: -1 });

module.exports = mongoose.model('Report', reportSchema);
