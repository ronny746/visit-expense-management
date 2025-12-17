const { Dashboard, GlobalDashboardConfig } = require('../models/Dashboard');
const { logActivity } = require('../utils/logger');

// Get Dashboard Data (All Users) - Returns global items that are active
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dashboardData = await Dashboard.getGlobalDashboard(userId);

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard by User ID (Admin only)
exports.getDashboardByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const dashboardData = await Dashboard.getDashboardWithGlobalItems(userId);

    if (!dashboardData) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found for this user'
      });
    }

    // Populate user info
    const dashboard = await Dashboard.findOne({ userId }).populate('userId', 'name employeeId email');
    dashboardData.userId = dashboard.userId;

    res.json({
      success: true,
      data: dashboardData
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

// ============ GLOBAL QUICK ACCESS MANAGEMENT ============

// Get all Quick Access items (Admin) - including inactive
exports.getAllQuickAccess = async (req, res, next) => {
  try {
    let config = await GlobalDashboardConfig.findOne({ configType: 'quickAccess' });
    
    if (!config) {
      config = await GlobalDashboardConfig.create({
        configType: 'quickAccess',
        items: []
      });
    }

    res.json({
      success: true,
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Add Quick Access Item (Admin only) - Global for all users
exports.addQuickAccess = async (req, res, next) => {
  try {
    const { title, image, bgColor, route, isActive = true, order } = req.body;

    let config = await GlobalDashboardConfig.findOne({ configType: 'quickAccess' });
    
    if (!config) {
      config = await GlobalDashboardConfig.create({
        configType: 'quickAccess',
        items: []
      });
    }

    const newQuickAccess = {
      title,
      image,
      bgColor: bgColor || '#6366F1',
      route,
      isActive,
      order: order || config.items.length
    };

    config.items.push(newQuickAccess);
    await config.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_ADDED',
      'dashboard',
      config._id,
      `Quick access "${title}" added globally`
    );

    res.json({
      success: true,
      message: 'Quick access added for all users',
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Update Quick Access Item (Admin only)
exports.updateQuickAccess = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { title, image, bgColor, route, isActive, order } = req.body;

    const config = await GlobalDashboardConfig.findOne({ configType: 'quickAccess' });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Quick access configuration not found'
      });
    }

    const item = config.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Quick access item not found'
      });
    }

    // Update fields
    if (title !== undefined) item.title = title;
    if (image !== undefined) item.image = image;
    if (bgColor !== undefined) item.bgColor = bgColor;
    if (route !== undefined) item.route = route;
    if (isActive !== undefined) item.isActive = isActive;
    if (order !== undefined) item.order = order;

    await config.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_UPDATED',
      'dashboard',
      config._id,
      `Quick access "${item.title}" updated globally (Active: ${item.isActive})`
    );

    res.json({
      success: true,
      message: 'Quick access updated for all users',
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Quick Access Active Status (Admin only)
exports.toggleQuickAccessStatus = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const config = await GlobalDashboardConfig.findOne({ configType: 'quickAccess' });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Quick access configuration not found'
      });
    }

    const item = config.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Quick access item not found'
      });
    }

    item.isActive = !item.isActive;
    await config.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_STATUS_TOGGLED',
      'dashboard',
      config._id,
      `Quick access "${item.title}" ${item.isActive ? 'activated' : 'deactivated'}`
    );

    res.json({
      success: true,
      message: `Quick access ${item.isActive ? 'activated' : 'deactivated'} for all users`,
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Delete Quick Access Item (Admin only)
exports.deleteQuickAccess = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const config = await GlobalDashboardConfig.findOne({ configType: 'quickAccess' });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Quick access configuration not found'
      });
    }

    const item = config.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Quick access item not found'
      });
    }

    const deletedTitle = item.title;
    item.remove();
    await config.save();

    await logActivity(
      req.user.id,
      'QUICK_ACCESS_DELETED',
      'dashboard',
      config._id,
      `Quick access "${deletedTitle}" deleted globally`
    );

    res.json({
      success: true,
      message: 'Quick access deleted for all users',
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// ============ GLOBAL HOLIDAY MANAGEMENT ============

// Get all Holidays (Admin) - including inactive
exports.getAllHolidays = async (req, res, next) => {
  try {
    let config = await GlobalDashboardConfig.findOne({ configType: 'holidays' });
    
    if (!config) {
      config = await GlobalDashboardConfig.create({
        configType: 'holidays',
        items: []
      });
    }

    res.json({
      success: true,
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Add Upcoming Holiday (Admin only) - Global for all users
exports.addUpcomingHoliday = async (req, res, next) => {
  try {
    const { title, date, image, isActive = true, order } = req.body;

    let config = await GlobalDashboardConfig.findOne({ configType: 'holidays' });
    
    if (!config) {
      config = await GlobalDashboardConfig.create({
        configType: 'holidays',
        items: []
      });
    }

    const newHoliday = {
      title,
      date,
      image,
      isActive,
      order: order || config.items.length
    };

    config.items.push(newHoliday);
    await config.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_ADDED',
      'dashboard',
      config._id,
      `Holiday "${title}" added globally`
    );

    res.json({
      success: true,
      message: 'Holiday added for all users',
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Update Upcoming Holiday (Admin only)
exports.updateUpcomingHoliday = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { title, date, image, isActive, order } = req.body;

    const config = await GlobalDashboardConfig.findOne({ configType: 'holidays' });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Holiday configuration not found'
      });
    }

    const item = config.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    // Update fields
    if (title !== undefined) item.title = title;
    if (date !== undefined) item.date = date;
    if (image !== undefined) item.image = image;
    if (isActive !== undefined) item.isActive = isActive;
    if (order !== undefined) item.order = order;

    await config.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_UPDATED',
      'dashboard',
      config._id,
      `Holiday "${item.title}" updated globally (Active: ${item.isActive})`
    );

    res.json({
      success: true,
      message: 'Holiday updated for all users',
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Holiday Active Status (Admin only)
exports.toggleHolidayStatus = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const config = await GlobalDashboardConfig.findOne({ configType: 'holidays' });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Holiday configuration not found'
      });
    }

    const item = config.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    item.isActive = !item.isActive;
    await config.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_STATUS_TOGGLED',
      'dashboard',
      config._id,
      `Holiday "${item.title}" ${item.isActive ? 'activated' : 'deactivated'}`
    );

    res.json({
      success: true,
      message: `Holiday ${item.isActive ? 'activated' : 'deactivated'} for all users`,
      data: config.items
    });
  } catch (error) {
    next(error);
  }
};

// Delete Upcoming Holiday (Admin only)
exports.deleteUpcomingHoliday = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const config = await GlobalDashboardConfig.findOne({ configType: 'holidays' });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Holiday configuration not found'
      });
    }

    const item = config.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    const deletedTitle = item.title;
    item.remove();
    await config.save();

    await logActivity(
      req.user.id,
      'HOLIDAY_DELETED',
      'dashboard',
      config._id,
      `Holiday "${deletedTitle}" deleted globally`
    );

    res.json({
      success: true,
      message: 'Holiday deleted for all users',
      data: config.items
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