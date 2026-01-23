const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  // Content
  type: {
    type: String,
    required: true,
    enum: ['report', 'task', 'meeting', 'payment', 'alert', 'system', 'announcement']
  },
  category: {
    type: String,
    required: true,
    enum: ['finance', 'hr', 'general', 'analytics', 'system']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },

  // Status
  unread: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // UI Properties
  iconName: {
    type: String,
    default: 'Bell'
  },
  color: {
    type: String,
    default: 'blue'
  },

  // Reference
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedModel: {
    type: String
  },

  // Metadata
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, unread: 1, createdAt: -1 });
notificationSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
