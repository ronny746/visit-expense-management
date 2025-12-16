const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  visitType: {
    type: String,
    enum: ['planned', 'unplanned'],
    required: true
  },
  executiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  plannedDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  fromLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  toLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  purpose: {
    type: String,
    required: true
  },
  checkInTime: Date,
  checkInLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  checkOutTime: Date,
  checkOutLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  cancelReason: {
    type: String,
    trim: true,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String
}, { timestamps: true });

visitSchema.index({ fromLocation: '2dsphere' });
visitSchema.index({ toLocation: '2dsphere' });

module.exports = mongoose.model('Visit', visitSchema);