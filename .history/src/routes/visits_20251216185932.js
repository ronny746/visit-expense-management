const express = require('express');
const {
  createPlannedVisit,
  createUnplannedVisit,
  checkIn,
  checkOut,
  getVisits
} = require('../controllers/visitController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/planned', protect, authorize('manager', 'admin'), createPlannedVisit);
router.post('/unplanned', protect, authorize('executive'), createUnplannedVisit);
router.post('/:id/checkin', protect, authorize('executive'), checkIn);
router.post('/:id/checkout', protect, authorize('executive'), checkOut);
router.get('/', protect, getVisits);

module.exports = router;