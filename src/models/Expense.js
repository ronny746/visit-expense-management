const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: true
  },
  executiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  masterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseMaster',
    required: true
  },
  subMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseSubMaster',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  calculatedAmount: {
    type: Number,
    required: true
  },
  actualAmount: {
    type: Number,
    required: true
  },
  description: String,
  expenseDate: {
    type: Date,
    required: true
  },
  receiptImage: String,
  status: {
    type: String,
    enum: ['pending', 'manager_approved', 'finance_approved', 'hr_approved', 'rejected'],
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
  financeApproval: {
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

module.exports = mongoose.model('Expense', expenseSchema);