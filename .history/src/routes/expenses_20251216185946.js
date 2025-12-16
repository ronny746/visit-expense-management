const express = require('express');
const {
  createExpense,
  uploadReceipt,
  approveExpense,
  rejectExpense,
  getExpenses,
  getExpenseById
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.post('/', protect, authorize('executive'), createExpense);
router.post('/:id/receipt', protect, authorize('executive'), upload.single('receipt'), uploadReceipt);
router.post('/:id/approve/:approvalType', protect, authorize('manager', 'finance', 'hr'), approveExpense);
router.post('/:id/reject/:approvalType', protect, authorize('manager', 'finance', 'hr'), rejectExpense);
router.get('/', protect, getExpenses);
router.get('/:id', protect, getExpenseById);

module.exports = router;