const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/overview', protect, admin, getOverview);

module.exports = router;
