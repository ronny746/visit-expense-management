// const Dashboard = require('../models/Dashboard');
// const User = require('../models/User');
// const { logActivity } = require('../utils/logger');
// const { getGreetingByTime } = require('../utils/greetings');
// const { getUserQuickOverview } = require('../utils/quickOverview');



// /* ===== USER DASHBOARD ===== */
// exports.getDashboard = async (req, res, next) => {
//   try {

//     const greeting = getGreetingByTime();
//     const user = await User.findById(req.user.id)
//       .select('name email role employeeId');
//     const quickOverview = await getUserQuickOverview(req.user.id);
//     const dashboard = await Dashboard.getActiveDashboard();

//     res.json({
//       success: true,
//       home: {
//         greeting,
//         user,
//         quickOverview,
//         dashboard
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// /* ===== ADMIN: FULL DASHBOARD ===== */
// exports.getAdminDashboard = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     res.json({ success: true, data: dashboard });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ===== QUICK ACCESS ===== */
// exports.addQuickAccess = async (req, res, next) => {
//   try {
//     const { title, image, bgColor, route, order } = req.body;

//     const dashboard = await Dashboard.getDashboard();
//     dashboard.quickAccess.push({
//       title,
//       image,
//       bgColor,
//       route,
//       order: order ?? dashboard.quickAccess.length
//     });

//     await dashboard.save();
//     await logActivity(req.user.id, 'QUICK_ACCESS_ADD', 'dashboard', dashboard._id);

//     res.json({ success: true, data: dashboard.quickAccess });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.updateQuickAccess = async (req, res, next) => {
//   try {
//     const { itemId } = req.params;
//     const dashboard = await Dashboard.getDashboard();

//     const item = dashboard.quickAccess.id(itemId);
//     if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

//     Object.assign(item, req.body);
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.quickAccess });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.toggleQuickAccess = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     const item = dashboard.quickAccess.id(req.params.itemId);

//     if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

//     item.isActive = !item.isActive;
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.quickAccess });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.deleteQuickAccess = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     dashboard.quickAccess.id(req.params.itemId)?.remove();
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.quickAccess });
//   } catch (err) {
//     next(err);
//   }
// };

// /* ===== HOLIDAYS ===== */
// exports.addHoliday = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     dashboard.upcomingHolidays.push(req.body);
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.upcomingHolidays });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.updateHoliday = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     const item = dashboard.upcomingHolidays.id(req.params.itemId);

//     if (!item) return res.status(404).json({ success: false, message: 'Holiday not found' });

//     Object.assign(item, req.body);
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.upcomingHolidays });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.toggleHoliday = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     const item = dashboard.upcomingHolidays.id(req.params.itemId);

//     item.isActive = !item.isActive;
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.upcomingHolidays });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.deleteHoliday = async (req, res, next) => {
//   try {
//     const dashboard = await Dashboard.getDashboard();
//     dashboard.upcomingHolidays.id(req.params.itemId)?.remove();
//     await dashboard.save();

//     res.json({ success: true, data: dashboard.upcomingHolidays });
//   } catch (err) {
//     next(err);
//   }
// };



const Dashboard = require('../models/Dashboard');
const User = require('../models/User');
const { logActivity } = require('../utils/logger');
const { getGreetingByTime } = require('../utils/greetings');
const { getUserQuickOverview } = require('../utils/quickOverview');

/* ===== ROLE-BASED DASHBOARD CONFIGURATIONS ===== */
const dashboardConfigs = {
  admin: {
    widgets: ['systemHealth', 'userManagement', 'auditLogs', 'backupStatus', 'serverMetrics'],
    permissions: ['view_all', 'manage_users', 'view_audit'],
    sections: {
      systemHealth: { title: 'System Health', icon: 'activity' },
      userManagement: { title: 'User Management', icon: 'users' },
      auditLogs: { title: 'Audit Logs', icon: 'file-text' },
      backupStatus: { title: 'Backup Status', icon: 'database' },
      serverMetrics: { title: 'Server Metrics', icon: 'bar-chart' }
    }
  },
  hr: {
    widgets: ['teamOverview', 'attendanceTracking', 'leaveRequests', 'recruitment', 'performance'],
    permissions: ['view_employees', 'manage_leave', 'manage_attendance', 'recruitment'],
    sections: {
      teamOverview: { title: 'Team Overview', icon: 'users' },
      attendanceTracking: { title: 'Attendance', icon: 'calendar' },
      leaveRequests: { title: 'Leave Requests', icon: 'inbox' },
      recruitment: { title: 'Recruitment', icon: 'briefcase' },
      performance: { title: 'Performance', icon: 'star' }
    }
  },
  finance: {
    widgets: ['budget', 'expenses', 'payroll', 'invoicing', 'reports'],
    permissions: ['view_finance', 'manage_budget', 'view_payroll'],
    sections: {
      budget: { title: 'Budget Overview', icon: 'pie-chart' },
      expenses: { title: 'Expense Tracking', icon: 'credit-card' },
      payroll: { title: 'Payroll', icon: 'dollar-sign' },
      invoicing: { title: 'Invoicing', icon: 'file-invoice' },
      reports: { title: 'Financial Reports', icon: 'bar-chart' }
    }
  },
  manager: {
    widgets: ['teamPerformance', 'projects', 'tasks', 'attendance', 'reports'],
    permissions: ['view_team', 'manage_tasks', 'view_attendance', 'manage_team'],
    sections: {
      teamPerformance: { title: 'Team Performance', icon: 'trending-up' },
      projects: { title: 'Projects', icon: 'folder' },
      tasks: { title: 'Tasks', icon: 'check-square' },
      attendance: { title: 'Team Attendance', icon: 'calendar' },
      reports: { title: 'Reports', icon: 'bar-chart' }
    }
  },
  executive: {
    widgets: ['overview', 'revenue', 'teamHealth', 'goals', 'alerts'],
    permissions: ['view_summary', 'view_revenue', 'view_all_reports'],
    sections: {
      overview: { title: 'Company Overview', icon: 'bar-chart-2' },
      revenue: { title: 'Revenue', icon: 'trending-up' },
      teamHealth: { title: 'Team Health', icon: 'heart' },
      goals: { title: 'Goals', icon: 'target' },
      alerts: { title: 'Alerts', icon: 'alert-circle' }
    }
  }
};

/* ===== ROLE-BASED QUICK ACCESS ===== */
const getQuickAccessByRole = (role) => {
  const quickAccessMap = {
    admin: [
      { title: 'Users', route: '/admin/users', bgColor: '#3B82F6', order: 1 },
      { title: 'Settings', route: '/admin/settings', bgColor: '#8B5CF6', order: 2 },
      { title: 'Logs', route: '/admin/logs', bgColor: '#EF4444', order: 3 }
    ],
    hr: [
      { title: 'Employees', route: '/hr/employees', bgColor: '#10B981', order: 1 },
      { title: 'Leave', route: '/hr/leave', bgColor: '#F59E0B', order: 2 },
      { title: 'Recruitment', route: '/hr/recruitment', bgColor: '#3B82F6', order: 3 }
    ],
    finance: [
      { title: 'Budget', route: '/finance/budget', bgColor: '#06B6D4', order: 1 },
      { title: 'Expenses', route: '/finance/expenses', bgColor: '#EC4899', order: 2 },
      { title: 'Reports', route: '/finance/reports', bgColor: '#8B5CF6', order: 3 }
    ],
    manager: [
      { title: 'Team', route: '/manager/team', bgColor: '#10B981', order: 1 },
      { title: 'Tasks', route: '/manager/tasks', bgColor: '#F59E0B', order: 2 },
      { title: 'Projects', route: '/manager/projects', bgColor: '#3B82F6', order: 3 }
    ],
    executive: [
      { title: 'Dashboard', route: '/executive/summary', bgColor: '#3B82F6', order: 1 },
      { title: 'Reports', route: '/executive/reports', bgColor: '#8B5CF6', order: 2 },
      { title: 'Analytics', route: '/executive/analytics', bgColor: '#10B981', order: 3 }
    ]
  };
  return quickAccessMap[role] || [];
};

/* ===== USER DASHBOARD (ROLE-BASED) ===== */
exports.getDashboard = async (req, res, next) => {
  try {
    const greeting = getGreetingByTime();
    const user = await User.findById(req.user.id)
      .select('name email role employeeId');
    
    const config = dashboardConfigs[user.role] || dashboardConfigs.executive;
    const quickOverview = await getUserQuickOverview(req.user.id);
    const quickAccess = getQuickAccessByRole(user.role);
    const dashboard = await Dashboard.getActiveDashboard();

    res.json({
      success: true,
      home: {
        greeting,
        user,
        role: user.role,
        quickOverview,
        quickAccess,
        config,
        dashboard
      }
    });
  } catch (err) {
    next(err);
  }
};

/* ===== ADMIN: FULL DASHBOARD ===== */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.getDashboard();
    const config = dashboardConfigs.admin;
    res.json({ 
      success: true, 
      data: dashboard,
      config 
    });
  } catch (err) {
    next(err);
  }
};

/* ===== GET DASHBOARD CONFIG BY ROLE ===== */
exports.getDashboardConfig = async (req, res, next) => {
  try {
    const { role } = req.query;
    const validRole = Object.keys(dashboardConfigs).includes(role) ? role : 'executive';
    const config = dashboardConfigs[validRole];

    res.json({
      success: true,
      role: validRole,
      config
    });
  } catch (err) {
    next(err);
  }
};

/* ===== QUICK ACCESS (ROLE-BASED) ===== */
exports.addQuickAccess = async (req, res, next) => {
  try {
    const { title, route, bgColor, order } = req.body;
    const user = await User.findById(req.user.id);

    const dashboard = await Dashboard.getDashboard();
    dashboard.quickAccess.push({
      title,
      route,
      bgColor,
      role: user.role,
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

/* ===== HOLIDAYS (UNCHANGED) ===== */
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