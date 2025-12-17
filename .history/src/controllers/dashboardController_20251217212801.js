const Dashboard = require('../models/Dashboard');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');

/* ===== USER DASHBOARD ===== */
exports.getDashboard = async (req, res, next) => {
  try {
    const user = User.find(req.user.id);
    const data = await Dashboard.getActiveDashboard();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/* ===== ADMIN: FULL DASHBOARD ===== */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    res.json({ success: true, data: dashboard });
  } catch (err) {
    next(err);
  }
};

/* ===== QUICK ACCESS ===== */
exports.addQuickAccess = async (req, res, next) => {
  try {
    const { title, image, bgColor, route, order } = req.body;

    const dashboard = await Dashboard.getDashboard();
    dashboard.quickAccess.push({
      title,
      image,
      bgColor,
      route,
      order: order ?? dashboard.quickAccess.length
    });

    await dashboard.save();
    await logActivity(req.user.id, 'QUICK_ACCESS_ADD', 'dashboard', dashboard._id);

    res.json({ success: true, data: dashboard.quickAccess });
  } catch (err) {
    next(err);
  }
};

exports.updateQuickAccess = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const dashboard = await Dashboard.getDashboard();

    const item = dashboard.quickAccess.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    Object.assign(item, req.body);
    await dashboard.save();

    res.json({ success: true, data: dashboard.quickAccess });
  } catch (err) {
    next(err);
  }
};

exports.toggleQuickAccess = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    const item = dashboard.quickAccess.id(req.params.itemId);

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.isActive = !item.isActive;
    await dashboard.save();

    res.json({ success: true, data: dashboard.quickAccess });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuickAccess = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    dashboard.quickAccess.id(req.params.itemId)?.remove();
    await dashboard.save();

    res.json({ success: true, data: dashboard.quickAccess });
  } catch (err) {
    next(err);
  }
};

/* ===== HOLIDAYS ===== */
exports.addHoliday = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    dashboard.upcomingHolidays.push(req.body);
    await dashboard.save();

    res.json({ success: true, data: dashboard.upcomingHolidays });
  } catch (err) {
    next(err);
  }
};

exports.updateHoliday = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    const item = dashboard.upcomingHolidays.id(req.params.itemId);

    if (!item) return res.status(404).json({ success: false, message: 'Holiday not found' });

    Object.assign(item, req.body);
    await dashboard.save();

    res.json({ success: true, data: dashboard.upcomingHolidays });
  } catch (err) {
    next(err);
  }
};

exports.toggleHoliday = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    const item = dashboard.upcomingHolidays.id(req.params.itemId);

    item.isActive = !item.isActive;
    await dashboard.save();

    res.json({ success: true, data: dashboard.upcomingHolidays });
  } catch (err) {
    next(err);
  }
};

exports.deleteHoliday = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    dashboard.upcomingHolidays.id(req.params.itemId)?.remove();
    await dashboard.save();

    res.json({ success: true, data: dashboard.upcomingHolidays });
  } catch (err) {
    next(err);
  }
};
