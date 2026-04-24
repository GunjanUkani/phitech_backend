const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.route('/')
  .get(getClients)
  .post(protect, admin, upload.single('image'), createClient);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateClient)
  .delete(protect, admin, deleteClient);

module.exports = router;
