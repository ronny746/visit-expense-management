const Joi = require('joi');

exports.validateRegister = (req, res, next) => {
  const schema = Joi.object({
    employeeId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'hr', 'finance', 'manager', 'executive'),
    managerId: Joi.string(),
    department: Joi.string()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

exports.validateExpense = (req, res, next) => {
  const schema = Joi.object({
    visitId: Joi.string().required(),
    masterId: Joi.string().required(),
    subMasterId: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    actualAmount: Joi.number().min(0).required(),
    description: Joi.string.allow(''),
    expenseDate: Joi.date().required(),
    receiptImage: Joi.string.allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};
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

exports.validateLeave = (req, res, next) => {