const express = require('express');
const {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaves,
  getLeaveById
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize('executive'), applyLeave);
router.post('/:id/approve/:approvalType', protect, authorize('manager', 'hr'), approveLeave);
router.post('/:id/reject/:approvalType', protect, authorize('manager', 'hr'), rejectLeave);
router.get('/', protect, getLeaves);
router.get('/:id', protect, getLeaveById);

module.exports = router;