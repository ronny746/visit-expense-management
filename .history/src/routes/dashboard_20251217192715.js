const express = require('express');
const {
  getDashboard,
  getDashboardByUserId,
  getAllDashboards,
  createOrUpdateDashboard,
  addQuickAccess,
  updateQuickAccess,
  deleteQuickAccess,
  addUpcomingHoliday,
  updateUpcomingHoliday,
  deleteUpcomingHoliday,
  bulkUpdateQuickAccess,
  bulkUpdateHolidays,
  deleteDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// ============ User Routes (All Authenticated Users) ============
// Get current user's dashboard
router.get('/me', protect, getDashboard);

// ============ Admin Only Routes ============
// Get all dashboards
router.get('/', protect, authorize('admin'), getAllDashboards);

// Get dashboard by user ID
router.get('/user/:userId', protect, authorize('admin'), getDashboardByUserId);

// Create or update dashboard for a user
router.post('/', protect, authorize('admin'), createOrUpdateDashboard);

// Delete dashboard
router.delete('/user/:userId', protect, authorize('admin'), deleteDashboard);

// ============ Quick Access Management (Admin Only) ============
// Add quick access item
router.post('/quick-access', protect, authorize('admin'), addQuickAccess);

// Update quick access item
router.put('/quick-access/:userId/:index', protect, authorize('admin'), updateQuickAccess);

// Delete quick access item
router.delete('/quick-access/:userId/:index', protect, authorize('admin'), deleteQuickAccess);

// Bulk update quick access for all users
router.put('/quick-access/bulk', protect, authorize('admin'), bulkUpdateQuickAccess);

// ============ Holiday Management (Admin Only) ============
// Add upcoming holiday
router.post('/holidays', protect, authorize('admin'), addUpcomingHoliday);

// Update upcoming holiday
router.put('/holidays/:userId/:index', protect, authorize('admin'), updateUpcomingHoliday);

// Delete upcoming holiday
router.delete('/holidays/:userId/:index', protect, authorize('admin'), deleteUpcomingHoliday);

// Bulk update holidays for all users
router.put('/holidays/bulk', protect, authorize('admin'), bulkUpdateHolidays);

module.exports = router;