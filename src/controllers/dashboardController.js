const User = require('../models/User');
const Visit = require('../models/Visit');
const Expense = require('../models/Expense');
const Leave = require('../models/Leave');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get current month dates
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get last 7 days activity
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let dashboardData = {};

    if (userRole === 'executive') {
      // Executive Dashboard
      const visits = await Visit.find({
        executiveId: userId,
        createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const expenses = await Expense.find({
        executiveId: userId,
        expenseDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.actualAmount, 0);
      const approvedExpenses = expenses
        .filter(exp => exp.status === 'hr_approved')
        .reduce((sum, exp) => sum + exp.actualAmount, 0);
      const pendingExpenses = expenses
        .filter(exp => exp.status === 'pending')
        .reduce((sum, exp) => sum + exp.actualAmount, 0);

      const leaves = await Leave.find({
        executiveId: userId,
        fromDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const activities = await ActivityLog.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      })
        .sort('-createdAt')
        .limit(50);

      dashboardData = {
        monthly: {
          totalVisits: visits.length,
          completedVisits: visits.filter(v => v.status === 'completed').length,
          inProgressVisits: visits.filter(v => v.status === 'in-progress').length,
          totalExpenses,
          approvedExpenses,
          pendingExpenses,
          totalLeaves: leaves.length,
          approvedLeaves: leaves.filter(l => l.status === 'hr_approved').length
        },
        recentActivities: activities
      };
    } else if (userRole === 'manager') {
      // Manager Dashboard
      const subordinates = await User.find({ managerId: userId, isActive: true });
      const subordinateIds = subordinates.map(s => s._id);

      const visits = await Visit.find({
        managerId: userId,
        createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const expenses = await Expense.find({
        executiveId: { $in: subordinateIds },
        expenseDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const pendingExpenseApprovals = await Expense.find({
        executiveId: { $in: subordinateIds },
        status: 'pending'
      }).countDocuments();

      const leaves = await Leave.find({
        executiveId: { $in: subordinateIds },
        fromDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const pendingLeaveApprovals = await Leave.find({
        executiveId: { $in: subordinateIds },
        'managerApproval.status': 'pending'
      }).countDocuments();

      dashboardData = {
        monthly: {
          totalVisits: visits.length,
          totalExpenses: expenses.reduce((sum, exp) => sum + exp.actualAmount, 0),
          totalLeaves: leaves.length,
          pendingExpenseApprovals,
          pendingLeaveApprovals,
          teamSize: subordinates.length
        }
      };
    } else if (userRole === 'finance') {
      // Finance Dashboard
      const expenses = await Expense.find({
        expenseDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const pendingApprovals = await Expense.find({
        status: 'manager_approved',
        'financeApproval.status': 'pending'
      }).countDocuments();

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.actualAmount, 0);
      const approvedExpenses = expenses
        .filter(exp => ['finance_approved', 'hr_approved'].includes(exp.status))
        .reduce((sum, exp) => sum + exp.actualAmount, 0);

      dashboardData = {
        monthly: {
          totalExpenses,
          approvedExpenses,
          pendingExpenses: totalExpenses - approvedExpenses,
          pendingApprovals,
          totalClaims: expenses.length
        }
      };
    } else if (userRole === 'hr') {
      // HR Dashboard
      const expenses = await Expense.find({
        expenseDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const pendingExpenseApprovals = await Expense.find({
        status: 'finance_approved',
        'hrApproval.status': 'pending'
      }).countDocuments();

      const leaves = await Leave.find({
        fromDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      const pendingLeaveApprovals = await Leave.find({
        status: 'manager_approved',
        'hrApproval.status': 'pending'
      }).countDocuments();

      const totalUsers = await User.countDocuments({ isActive: true });

      dashboardData = {
        monthly: {
          totalExpenses: expenses.reduce((sum, exp) => sum + exp.actualAmount, 0),
          approvedExpenses: expenses
            .filter(exp => exp.status === 'hr_approved')
            .reduce((sum, exp) => sum + exp.actualAmount, 0),
          pendingExpenseApprovals,
          totalLeaves: leaves.length,
          approvedLeaves: leaves.filter(l => l.status === 'hr_approved').length,
          pendingLeaveApprovals,
          totalEmployees: totalUsers
        }
      };
    } else if (userRole === 'admin') {
      // Admin Dashboard
      const totalUsers = await User.countDocuments({ isActive: true });
      const visits = await Visit.find({
        createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });
      const expenses = await Expense.find({
        expenseDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });
      const leaves = await Leave.find({
        fromDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      });

      dashboardData = {
        monthly: {
          totalUsers,
          totalVisits: visits.length,
          totalExpenses: expenses.reduce((sum, exp) => sum + exp.actualAmount, 0),
          totalLeaves: leaves.length,
          pendingExpenses: expenses.filter(e => e.status === 'pending').length,
          pendingLeaves: leaves.filter(l => l.status === 'pending').length
        }
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

exports.getActivities = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activities = await ActivityLog.find({
      userId: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate('userId', 'name employeeId')
      .sort('-createdAt')
      .limit(100);

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};