const express = require('express');
const { getDashboard, getActivities } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, getDashboard);
router.get('/activities', protect, getActivities);

module.exports = router;