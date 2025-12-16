const Expense = require('../models/Expense');
const Visit = require('../models/Visit');
const ExpenseSubMaster = require('../models/ExpenseSubMaster');
const { logActivity } = require('../utils/logger');

exports.createExpense = async (req, res, next) => {
  try {
    const { visitId, masterId, subMasterId, quantity, actualAmount, description, expenseDate } = req.body;

    const visit = await Visit.findById(visitId);
    if (!visit || visit.executiveId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized or visit not found'
      });
    }

    const subMaster = await ExpenseSubMaster.findById(subMasterId);
    if (!subMaster) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense sub-master'
      });
    }

    const calculatedAmount = quantity * subMaster.rate;

    const expense = await Expense.create({
      visitId,
      executiveId: req.user.id,
      masterId,
      subMasterId,
      quantity,
      calculatedAmount,
      actualAmount,
      description,
      expenseDate,
      status: 'pending'
    });

    await logActivity(
      req.user.id,
      'EXPENSE_CREATED',
      'expense',
      expense._id,
      `Expense of ₹${actualAmount} created`
    );

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense || expense.executiveId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    expense.receiptImage = `/uploads/${req.file.filename}`;
    await expense.save();

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

exports.approveExpense = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const { approvalType } = req.params; // 'manager', 'finance', 'hr'

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (approvalType === 'manager' && req.user.role === 'manager') {
      expense.managerApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      expense.status = 'manager_approved';
    } else if (approvalType === 'finance' && req.user.role === 'finance') {
      if (expense.managerApproval.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Manager approval required first'
        });
      }
      expense.financeApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      expense.status = 'finance_approved';
    } else if (approvalType === 'hr' && req.user.role === 'hr') {
      if (expense.financeApproval.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Finance approval required first'
        });
      }
      expense.hrApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      expense.status = 'hr_approved';