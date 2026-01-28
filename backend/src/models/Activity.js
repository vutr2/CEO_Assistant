/**
 * Activity Model
 * Tracks daily activities, tasks, and work logs from employees
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['task', 'meeting', 'call', 'email', 'project', 'other'],
    default: 'task'
  },
  category: {
    type: String,
    enum: ['sales', 'support', 'development', 'marketing', 'management', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  relatedTo: {
    type: String, // e.g., customer name, project name
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  // For team collaboration
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  department: {
    type: String,
    trim: true
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
activitySchema.index({ companyId: 1, date: -1 });
activitySchema.index({ companyId: 1, userId: 1, date: -1 });
activitySchema.index({ companyId: 1, status: 1 });
activitySchema.index({ companyId: 1, type: 1, date: -1 });

// Virtual for user details
activitySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
