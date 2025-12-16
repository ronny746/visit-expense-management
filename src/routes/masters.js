const express = require('express');
const {
  createExpenseMaster,
  getExpenseMasters,
  updateExpenseMaster,
  deleteExpenseMaster,
  createExpenseSubMaster,
  getExpenseSubMasters,
  updateExpenseSubMaster,
  deleteExpenseSubMaster
} = require('../controllers/masterController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/expense-masters', protect, authorize('admin'), createExpenseMaster);
router.get('/expense-masters', protect, getExpenseMasters);
router.put('/expense-masters/:id', protect, authorize('admin'), updateExpenseMaster);
router.delete('/expense-masters/:id', protect, authorize('admin'), deleteExpenseMaster);

router.post('/expense-sub-masters', protect, authorize('admin'), createExpenseSubMaster);
router.get('/expense-sub-masters', protect, getExpenseSubMasters);
router.put('/expense-sub-masters/:id', protect, authorize('admin'), updateExpenseSubMaster);
router.delete('/expense-sub-masters/:id', protect, authorize('admin'), deleteExpenseSubMaster);

module.exports = router;