const mongoose = require('mongoose');

const expenseSubMasterSchema = new mongoose.Schema({
  masterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseMaster',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['per_km', 'per_day', 'fixed', 'per_unit']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('ExpenseSubMaster', expenseSubMasterSchema);