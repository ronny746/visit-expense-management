const Leave = require('../models/Leave');
const { logActivity } = require('../utils/logger');

exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, fromDate, toDate, numberOfDays, reason } = req.body;

    const leave = await Leave.create({
      executiveId: req.user.id,
      leaveType,
      fromDate,
      toDate,
      numberOfDays,
      reason,
      status: 'pending'
    });

    await logActivity(
      req.user.id,
      'LEAVE_APPLIED',
      'leave',
      leave._id,
      `Leave applied for ${numberOfDays} days`
    );

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

exports.approveLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const { approvalType } = req.params; // 'manager' or 'hr'

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    if (approvalType === 'manager' && req.user.role === 'manager') {
      leave.managerApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      leave.status = 'manager_approved';
    } else if (approvalType === 'hr' && req.user.role === 'hr') {
      if (leave.managerApproval.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Manager approval required first'
        });
      }
      leave.hrApproval = {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      leave.status = 'hr_approved';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this approval type'
      });
    }

    await leave.save();

    await logActivity(
      req.user.id,
      `LEAVE_${approvalType.toUpperCase()}_APPROVED`,
      'leave',
      leave._id,
      `Leave approved by ${approvalType}`
    );

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectLeave = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const { approvalType } = req.params;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    if (approvalType === 'manager' && req.user.role === 'manager') {
      leave.managerApproval = {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      leave.status = 'rejected';
    } else if (approvalType === 'hr' && req.user.role === 'hr') {
      leave.hrApproval = {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks
      };
      leave.status = 'rejected';
    }

    await leave.save();

    await logActivity(
      req.user.id,
      `LEAVE_${approvalType.toUpperCase()}_REJECTED`,
      'leave',
      leave._id,
      `Leave rejected by ${approvalType}`
    );

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaves = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role === 'executive') {
      query.executiveId = req.user.id;
    }

    if (status) query.status = status;

    if (startDate || endDate) {
      query.fromDate = {};
      if (startDate) query.fromDate.$gte = new Date(startDate);
      if (endDate) query.fromDate.$lte = new Date(endDate);
    }

    const leaves = await Leave.find(query)
      .populate('executiveId', 'name employeeId')
      .populate('managerApproval.approvedBy', 'name')
      .populate('hrApproval.approvedBy', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('executiveId', 'name employeeId')
      .populate('managerApproval.approvedBy', 'name')
      .populate('hrApproval.approvedBy', 'name');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    next(error);
  }
};