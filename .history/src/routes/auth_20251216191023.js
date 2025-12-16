const express = require('express');
const {
  register,
  login,
  getMe,
  createUserByAdmin
} = require('../controllers/authController');

const protect = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

const router = express.Router();

/* ===== PUBLIC ===== */
router.post('/register', register);   // executive only
router.post('/login', login);

/* ===== PROTECTED ===== */
router.get('/me', protect, getMe);

/* ===== ADMIN / HR ONLY ===== */
// router.post(
//   '/create-user',
//   protect,
//   roleCheck('admin', 'hr'),
//   createUserByAdmin
// );

module.exports = router;
