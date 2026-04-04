const express = require('express');
const router = express.Router();
const { registerUser, authUser, adminLogin } = require('../controllers/authController');
const { adminLoginValidation } = require('../middleware/validate');

// User Login - URL/api/auth/login
router.post('/login', authUser);

// Admin Login - URL/api/auth/admin-login
router.post('/admin-login', adminLoginValidation, adminLogin);

// Register - URL/api/auth/register (can be admin or user)
router.post('/register', registerUser);

module.exports = router;
