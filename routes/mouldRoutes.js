const express = require('express');
const router = express.Router();
const { createMould, getAllMoulds, getMyMoulds, updateMould, deleteMould, getAnalytics } = require('../controllers/mouldController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { mouldValidation } = require('../middleware/validate');

router.route('/')
  .post(protect, admin, mouldValidation, createMould)
  .get(protect, admin, getAllMoulds);

router.get('/analytics', protect, admin, getAnalytics);

router.get('/mine', protect, getMyMoulds);

router.route('/:id')
  .put(protect, admin, updateMould)
  .delete(protect, admin, deleteMould);

module.exports = router;
