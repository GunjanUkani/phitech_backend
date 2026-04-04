const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
const registerUser = async (req, res) => {
  const { clientId, mobile, isAdmin } = req.body;

  if (!clientId || !mobile) {
    return res.status(400).json({ message: 'Please provide clientId and mobile' });
  }

  try {
    const userExists = await User.findOne({ clientId });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set password as mobile
    const user = await User.create({
      clientId,
      mobile,
      password: mobile, // Pre-save hook hashes it
      isAdmin: isAdmin || false
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        clientId: user.clientId,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User (Client)
const authUser = async (req, res) => {
  const { clientId, mobile } = req.body; // mobile as password

  if (!clientId || !mobile) {
    return res.status(400).json({ message: 'Please provide clientId and mobile' });
  }

  try {
    const user = await User.findOne({ clientId, isAdmin: false });

    if (user && (await user.matchPassword(mobile))) {
      res.json({
        _id: user._id,
        clientId: user.clientId,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid clientId or mobile' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email, isAdmin: true });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, adminLogin };
