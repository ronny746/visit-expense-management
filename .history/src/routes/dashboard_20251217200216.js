const express = require('express');
const {
  getDashboard,
  getDashboardByUserId,
  getAllDashboards,
  getAllQuickAccess,
  addQuickAccess,
  updateQuickAccess,
  toggleQuickAccessStatus,
  deleteQuickAccess,
  getAllHolidays,
  addUpcomingHoliday,
  updateUpcomingHoliday,
  toggleHolidayStatus,
  deleteUpcomingHoliday,
  deleteDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// ============ User Routes (All Authenticated Users) ============
// Get current user's dashboard (shows only active items)
router.get('/me', protect, getDashboard);

// ============ Admin Only Routes ============
// Get all dashboards
router.get('/', protect, authorize('admin'), getAllDashboards);

// Get dashboard by user ID
router.get('/user/:userId', protect, authorize('admin'), getDashboardByUserId);

// Delete dashboard
router.delete('/user/:userId', protect, authorize('admin'), deleteDashboard);

// ============ Quick Access Management (Admin Only - Global) ============
// Get all quick access items (including inactive)
router.get('/quick-access', protect, authorize('admin'), getAllQuickAccess);

// Add quick access item (applies to all users)
router.post('/quick-access', protect, authorize('admin'), addQuickAccess);

// Update quick access item by ID
router.put('/quick-access/:itemId', protect, authorize('admin'), updateQuickAccess);

// Toggle quick access active/inactive status
router.patch('/quick-access/:itemId/toggle', protect, authorize('admin'), toggleQuickAccessStatus);

// Delete quick access item
router.delete('/quick-access/:itemId', protect, authorize('admin'), deleteQuickAccess);

// ============ Holiday Management (Admin Only - Global) ============
// Get all holidays (including inactive)
router.get('/holidays', protect, authorize('admin'), getAllHolidays);

// Add upcoming holiday (applies to all users)
router.post('/holidays', protect, authorize('admin'), addUpcomingHoliday);

// Update upcoming holiday by ID
router.put('/holidays/:itemId', protect, authorize('admin'), updateUpcomingHoliday);

// Toggle holiday active/inactive status
router.patch('/holidays/:itemId/toggle', protect, authorize('admin'), toggleHolidayStatus);

// Delete upcoming holiday
router.delete('/holidays/:itemId', protect, authorize('admin'), deleteUpcomingHoliday);

module.exports = router;