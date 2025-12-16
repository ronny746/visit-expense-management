const Visit = require('../models/Visit');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');

exports.createPlannedVisit = async (req, res, next) => {
  try {
    const { executiveId, plannedDate, fromAddress, toAddress, purpose, fromLocation, toLocation } = req.body;

    const executive = await User.findById(executiveId);
    if (!executive || executive.role !== 'executive') {
      return res.status(400).json({
        success: false,
        message: 'Invalid executive'
      });
    }

    const visit = await Visit.create({
      visitType: 'planned',
      executiveId,
      managerId: req.user.id,
      plannedDate,
      fromAddress,
      toAddress,
      fromLocation,
      toLocation,
      purpose,
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    await logActivity(
      req.user.id,
      'PLANNED_VISIT_CREATED',
      'visit',
      visit._id,
      `Planned visit created for ${executive.name}`
    );

    res.status(201).json({
      success: true,
      data: visit
    });
  } catch (error) {
    next(error);
  }
};

exports.createUnplannedVisit = async (req, res, next) => {
  try {
    const { fromAddress, toAddress, purpose, fromLocation, toLocation } = req.body;

    const visit = await Visit.create({
      visitType: 'unplanned',
      executiveId: req.user.id,
      fromAddress,
      toAddress,
      fromLocation,
      toLocation,
      purpose,
      status: 'approved'
    });

    await logActivity(
      req.user.id,
      'UNPLANNED_VISIT_CREATED',
      'visit',
      visit._id,
      'Unplanned visit created'
    );

    res.status(201).json({
      success: true,
      data: visit
    });
  } catch (error) {
    next(error);
  }
};

exports.checkIn = async (req, res, next) => {
  try {
    const { location } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    if (visit.executiveId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (visit.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in'
      });
    }

    visit.checkInTime = new Date();
    visit.checkInLocation = location;
    visit.status = 'in-progress';
    await visit.save();

    await logActivity(
      req.user.id,
      'VISIT_CHECKIN',
      'visit',
      visit._id,
      'Checked in to visit'
    );

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    next(error);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { location } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    if (visit.executiveId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!visit.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Must check in first'
      });
    }

    if (visit.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out'
      });
    }

    visit.checkOutTime = new Date();
    visit.checkOutLocation = location;
    visit.status = 'completed';
    await visit.save();

    await logActivity(
      req.user.id,
      'VISIT_CHECKOUT',
      'visit',
      visit._id,
      'Checked out from visit'
    );

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    next(error);
  }
};

exports.getVisits = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'executive') {
      query.executiveId = req.user.id;
    } else if (req.user.role === 'manager') {
      query.managerId = req.user.id;
    }

    const visits = await Visit.find(query)
      .populate('executiveId', 'name employeeId')
      .populate('managerId', 'name employeeId')
      .sort('-createdAt');

    res.json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    if (req.user.role === 'executive' && visit.executiveId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.user.role === 'manager' && visit.managerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    visit.status = 'cancelled';
    await visit.save();

    await logActivity(


