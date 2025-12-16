const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['visit', 'expense', 'leave', 'user'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);