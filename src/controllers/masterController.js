const ExpenseMaster = require('../models/ExpenseMaster');
const ExpenseSubMaster = require('../models/ExpenseSubMaster');
const { logActivity } = require('../utils/logger');

exports.createExpenseMaster = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    const master = await ExpenseMaster.create({
      name,
      code,
      createdBy: req.user.id
    });

    await logActivity(
      req.user.id,
      'EXPENSE_MASTER_CREATED',
      'expense',
      master._id,
      `Expense master ${name} created`
    );

    res.status(201).json({
      success: true,
      data: master
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenseMasters = async (req, res, next) => {
  try {
    const masters = await ExpenseMaster.find({ isActive: true });

    const mastersWithSubs = await Promise.all(
      masters.map(async (master) => {
        const subMasters = await ExpenseSubMaster.find({
          masterId: master._id,
          isActive: true
        });
        return {
          ...master.toObject(),
          subMasters
        };
      })
    );

    res.json({
      success: true,
      count: mastersWithSubs.length,
      data: mastersWithSubs
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExpenseMaster = async (req, res, next) => {
  try {
    const { name, code, isActive } = req.body;

    const master = await ExpenseMaster.findByIdAndUpdate(
      req.params.id,
      { name, code, isActive },
      { new: true, runValidators: true }
    );

    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Expense master not found'
      });
    }

    await logActivity(
      req.user.id,
      'EXPENSE_MASTER_UPDATED',
      'expense',
      master._id,
      `Expense master ${name} updated`
    );

    res.json({
      success: true,
      data: master
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpenseMaster = async (req, res, next) => {
  try {
    const master = await ExpenseMaster.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Expense master not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense master deactivated'
    });
  } catch (error) {
    next(error);
  }
};

exports.createExpenseSubMaster = async (req, res, next) => {
  try {
    const { masterId, name, rate, unit } = req.body;

    const master = await ExpenseMaster.findById(masterId);
    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Expense master not found'
      });
    }

    const subMaster = await ExpenseSubMaster.create({
      masterId,
      name,
      rate,
      unit,
      createdBy: req.user.id
    });

    await logActivity(
      req.user.id,
      'EXPENSE_SUB_MASTER_CREATED',
      'expense',
      subMaster._id,
      `Expense sub-master ${name} created`
    );

    res.status(201).json({
      success: true,
      data: subMaster
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpenseSubMasters = async (req, res, next) => {
  try {
    const { masterId } = req.query;
    const query = { isActive: true };

    if (masterId) query.masterId = masterId;

    const subMasters = await ExpenseSubMaster.find(query)
      .populate('masterId', 'name code');

    res.json({
      success: true,
      count: subMasters.length,
      data: subMasters
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExpenseSubMaster = async (req, res, next) => {
  try {
    const { name, rate, unit, isActive } = req.body;

    const subMaster = await ExpenseSubMaster.findByIdAndUpdate(
      req.params.id,
      { name, rate, unit, isActive },
      { new: true, runValidators: true }
    );

    if (!subMaster) {
      return res.status(404).json({
        success: false,
        message: 'Expense sub-master not found'
      });
    }

    await logActivity(
      req.user.id,
      'EXPENSE_SUB_MASTER_UPDATED',
      'expense',
      subMaster._id,
      `Expense sub-master ${name} updated`
    );

    res.json({
      success: true,
      data: subMaster
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpenseSubMaster = async (req, res, next) => {
  try {
    const subMaster = await ExpenseSubMaster.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!subMaster) {
      return res.status(404).json({
        success: false,
        message: 'Expense sub-master not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense sub-master deactivated'
    });
  } catch (error) {
    next(error);
  }
};
