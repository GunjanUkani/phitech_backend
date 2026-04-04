const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../middleware/upload');

// Get all products (Public)
router.get('/', getProducts);

// Create product (Admin)
router.post('/', protect, admin, upload.array('photos', 5), createProduct);

// Delete product (Admin)
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
