const Dashboard = require('../models/Dashboard');
const { logActivity } = require('../utils/logger');

// Get Dashboard Data (All Users)
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let dashboard = await Dashboard.findOne({ userId });

    // If no dashboard exists for user, create default one
    if (!dashboard) {
      dashboard = await Dashboard.create({
        userId,
        quickAccess: [],
        upcomingHolidays: []
      });
    }

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard by User ID (Admin only)
exports.getDashboardByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    let dashboard = await Dashboard.findOne({ userId }).populate('userId', 'name employeeId email');

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found for this user'
      });
    }

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Get All Dashboards (Admin only)
exports.getAllDashboards = async (req, res, next) => {
  try {
    const dashboards = await Dashboard.find().populate('userId', 'name employeeId email').sort('-createdAt');

    res.json({
      success: true,
      count: dashboards.length,
      data: dashboards
    });
  } catch (error) {
    next(error);
  }
};

// Create/Update Dashboard for User (Admin only)
exports.createOrUpdateDashboard = async (req, res, next) => {
  try {
    const { userId, quickAccess, upcomingHolidays } = req.body;

    let dashboard = await Dashboard.findOne({ userId });

    if (dashboard) {
      // Update existing dashboard
      dashboard.quickAccess = quickAccess || dashboard.quickAccess;
      dashboard.upcomingHolidays = upcomingHolidays || dashboard.upcomingHolidays;
      await dashboard.save();

      await logActivity(
        req.user.id,
        'DASHBOARD_UPDATED',
        'dashboard',
        dashboard._id,
        `Dashboard updated for user ${userId}`
      );
    } else {
      // Create new dashboard
      dashboard = await Dashboard.create({
        userId,
        quickAccess: quickAccess || [],
        upcomingHolidays: upcomingHolidays || []
      });

      await logActivity(
        req.user.id,
        'DASHBOARD_CREATED',
        'dashboard',
        dashboard._id,
        `Dashboard created for user ${userId}`
      );
    }

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Add Quick Access Item (Admin only)
exports.addQuickAccess = async (req, res, next) => {
  try {
    const { userId, title, image, bgColor, route } = req.body;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    const newQuickAccess = { title, image, bgColor, route };
    dashboard.quickAccess.push(newQuickAccess);
    await dashboard.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_ADDED',
      'dashboard',
      dashboard._id,
      `Quick access "${title}" added`
    );

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Update Quick Access Item (Admin only)
exports.updateQuickAccess = async (req, res, next) => {
  try {
    const { userId, index } = req.params;
    const { title, image, bgColor, route } = req.body;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    if (index >= dashboard.quickAccess.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quick access index'
      });
    }

    dashboard.quickAccess[index] = {
      title: title || dashboard.quickAccess[index].title,
      image: image || dashboard.quickAccess[index].image,
      bgColor: bgColor || dashboard.quickAccess[index].bgColor,
      route: route !== undefined ? route : dashboard.quickAccess[index].route
    };

    await dashboard.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_UPDATED',
      'dashboard',
      dashboard._id,
      `Quick access at index ${index} updated`
    );

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Delete Quick Access Item (Admin only)
exports.deleteQuickAccess = async (req, res, next) => {
  try {
    const { userId, index } = req.params;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    if (index >= dashboard.quickAccess.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quick access index'
      });
    }

    const deletedItem = dashboard.quickAccess[index].title;
    dashboard.quickAccess.splice(index, 1);
    await dashboard.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_DELETED',
      'dashboard',
      dashboard._id,
      `Quick access "${deletedItem}" deleted`
    );

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Add Upcoming Holiday (Admin only)
exports.addUpcomingHoliday = async (req, res, next) => {
  try {
    const { userId, title, date, image } = req.body;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    const newHoliday = { title, date, image };
    dashboard.upcomingHolidays.push(newHoliday);
    await dashboard.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_ADDED',
      'dashboard',
      dashboard._id,
      `Holiday "${title}" added`
    );

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Update Upcoming Holiday (Admin only)
exports.updateUpcomingHoliday = async (req, res, next) => {
  try {
    const { userId, index } = req.params;
    const { title, date, image } = req.body;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    if (index >= dashboard.upcomingHolidays.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid holiday index'
      });
    }

    dashboard.upcomingHolidays[index] = {
      title: title || dashboard.upcomingHolidays[index].title,
      date: date || dashboard.upcomingHolidays[index].date,
      image: image || dashboard.upcomingHolidays[index].image
    };

    await dashboard.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_UPDATED',
      'dashboard',
      dashboard._id,
      `Holiday at index ${index} updated`
    );

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Delete Upcoming Holiday (Admin only)
exports.deleteUpcomingHoliday = async (req, res, next) => {
  try {
    const { userId, index } = req.params;

    const dashboard = await Dashboard.findOne({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    if (index >= dashboard.upcomingHolidays.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid holiday index'
      });
    }

    const deletedHoliday = dashboard.upcomingHolidays[index].title;
    dashboard.upcomingHolidays.splice(index, 1);
    await dashboard.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_DELETED',
      'dashboard',
      dashboard._id,
      `Holiday "${deletedHoliday}" deleted`
    );

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

// Bulk Update Quick Access for All Users (Admin only)
exports.bulkUpdateQuickAccess = async (req, res, next) => {
  try {
    const { quickAccess } = req.body;

    const result = await Dashboard.updateMany(
      {},
      { $set: { quickAccess } }
    );

    await logActivity(
      req.user.id,
      'BULK_QUICK_ACCESS_UPDATED',
      'dashboard',
      null,
      `Quick access updated for ${result.modifiedCount} dashboards`
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} dashboards`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Bulk Update Holidays for All Users (Admin only)
exports.bulkUpdateHolidays = async (req, res, next) => {
  try {
    const { upcomingHolidays } = req.body;

    const result = await Dashboard.updateMany(
      {},
      { $set: { upcomingHolidays } }
    );

    await logActivity(
      req.user.id,
      'BULK_HOLIDAYS_UPDATED',
      'dashboard',
      null,
      `Holidays updated for ${result.modifiedCount} dashboards`
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} dashboards`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Delete Dashboard (Admin only)
exports.deleteDashboard = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const dashboard = await Dashboard.findOneAndDelete({ userId });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found'
      });
    }

    await logActivity(
      req.user.id,
      'DASHBOARD_DELETED',
      'dashboard',
      dashboard._id,
      `Dashboard deleted for user ${userId}`
    );

    res.json({
      success: true,
      message: 'Dashboard deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};