const express = require('express');
const router = express.Router();
const { getClients, createClient, deleteClient, updateClient } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Admin only routes for managing clients
router.route('/')
  .get(protect, admin, getClients)
  .post(protect, admin, createClient);

router.route('/:id')
  .delete(protect, admin, deleteClient)
  .put(protect, admin, updateClient);

module.exports = router;
