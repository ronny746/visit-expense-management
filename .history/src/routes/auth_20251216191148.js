const express = require('express');
const { register, login, getMe, createUserByAdmin } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post(
  '/create-user',
  createUserByAdmin
);



module.exports = router;