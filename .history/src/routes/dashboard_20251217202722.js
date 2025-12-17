const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

/* USER */
router.get('/', protect, ctrl.getDashboard);

/* ADMIN */
router.get('/admin', protect, authorize('admin'), ctrl.getAdminDashboard);

/* QUICK ACCESS */
router.post('/quick-access', protect, authorize('admin'), ctrl.addQuickAccess);
router.put('/quick-access/:itemId', protect, authorize('admin'), ctrl.updateQuickAccess);
router.patch('/quick-access/:itemId/toggle', protect, authorize('admin'), ctrl.toggleQuickAccess);
router.delete('/quick-access/:itemId', protect, authorize('admin'), ctrl.deleteQuickAccess);

/* HOLIDAYS */
router.post('/holidays', protect, authorize('admin'), ctrl.addHoliday);
router.put('/holidays/:itemId', protect, authorize('admin'), ctrl.updateHoliday);
router.patch('/holidays/:itemId/toggle', protect, authorize('admin'), ctrl.toggleHoliday);
router.delete('/holidays/:itemId', protect, authorize('admin'), ctrl.deleteHoliday);

module.exports = router;
