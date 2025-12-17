const Expense = require('../models/Expense');
const Visit = require('../models/Visit');

async function getUserQuickOverview(executiveId) {
  const now = new Date();

  /* ---------- Month Range ---------- */
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  /* ================= EXPENSE (THIS MONTH) ================= */
  const monthlyExpenses = await Expense.aggregate([
    {
      $match: {
        executiveId,
        expenseDate: { $gte: monthStart, $lte: monthEnd }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$actualAmount' },
        totalCount: { $sum: 1 }
      }
    }
  ]);

  const expenseSummary = {
    amount: monthlyExpenses[0]?.totalAmount || 0,
    count: monthlyExpenses[0]?.totalCount || 0
  };

  /* ================= LAST VISIT ================= */
  const lastVisit = await Visit.findOne({
    executiveId,
    status: { $in: ['in-progress', 'completed'] }
  })
    .sort({ createdAt: -1 })
    .select('fromAddress toAddress purpose checkInTime status');

  const lastVisitData = lastVisit
    ? {
        from: lastVisit.fromAddress,
        to: lastVisit.toAddress,
        purpose: lastVisit.purpose,
        checkInTime: lastVisit.checkInTime,
        status: lastVisit.status
      }
    : null;

  /* ================= PRESENT DAYS (THIS MONTH) =================
     Present = checkInTime exists
  */
  const presentDays = await Visit.aggregate([
    {
      $match: {
        executiveId,
        checkInTime: { $ne: null },
        createdAt: { $gte: monthStart, $lte: monthEnd }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' }
        }
      }
    },
    {
      $count: 'totalDays'
    }
  ]);

  /* ================= TODAY CHECK-IN ================= */
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayVisit = await Visit.findOne({
    executiveId,
    checkInTime: { $gte: todayStart, $lte: todayEnd }
  }).select('checkInTime');

  /* ================= FINAL RESPONSE ================= */
  return {
    monthlyExpense: expenseSummary,
    lastVisit: lastVisitData,
    presentDaysThisMonth: presentDays[0]?.totalDays || 0,
    todayCheckInTime: todayVisit?.checkInTime || null
  };
}

module.exports = { getUserQuickOverview };
