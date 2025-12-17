const Expense = require('../models/');
const Visit = require('../models/Visit');
const Attendance = require('../models/Attendance');

async function getUserQuickOverview(userId) {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  /* ---------- Monthly Expense ---------- */
  const expenses = await Expense.find({
    userId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const monthlyExpenseAmount = expenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  /* ---------- Last Visit ---------- */
  const lastVisit = await Visit.findOne({ userId })
    .sort({ createdAt: -1 })
    .select('location city checkInTime');

  /* ---------- Attendance (Present Days) ---------- */
  const presentDays = await Attendance.countDocuments({
    userId,
    status: 'present',
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  /* ---------- Today Check-in ---------- */
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const todayAttendance = await Attendance.findOne({
    userId,
    date: { $gte: todayStart, $lte: todayEnd }
  }).select('checkInTime');

  return {
    monthlyExpense: {
      amount: monthlyExpenseAmount,
      count: expenses.length
    },
    lastVisit: lastVisit
      ? {
          location: lastVisit.location || lastVisit.city || 'N/A',
          time: lastVisit.checkInTime
        }
      : null,
    presentDaysThisMonth: presentDays,
    todayCheckInTime: todayAttendance?.checkInTime || null
  };
}

module.exports = { getUserQuickOverview };
