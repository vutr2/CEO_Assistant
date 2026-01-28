const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['financial', 'finance', 'hr', 'kpi', 'marketing', 'overview', 'custom']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'archived'],
    default: 'draft'
  },
  description: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  period: {
    start: Date,
    end: Date
  },
  fileUrl: {
    type: String
  },
  fileSize: {
    type: String
  },
  format: {
    type: String,
    enum: ['pdf', 'xlsx', 'csv', 'json'],
    default: 'pdf'
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ companyId: 1, type: 1 });
reportSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
