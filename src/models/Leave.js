const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  executiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'earned', 'unpaid'],
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'manager_approved', 'hr_approved', 'rejected'],
    default: 'pending'
  },
  managerApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    remarks: String
  },
  hrApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    remarks: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);