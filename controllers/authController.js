const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
const registerUser = async (req, res) => {
  const { clientId, mobile, isAdmin, clientName, city } = req.body;

  if (!clientId || (!mobile && !isAdmin)) {
    return res.status(400).json({ message: 'Please provide clientId and mobile' });
  }

  try {
    const userExists = await User.findOne({ clientId });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // For clients, password is now clientId by default if not provided
    // For admins, we expect a password (handled in seed or separate logic)
    const user = await User.create({
      clientId,
      mobile,
      clientName,
      city,
      password: clientId, // Use clientId as password for clients
      isAdmin: isAdmin || false
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        clientId: user.clientId,
        mobile: user.mobile,
        clientName: user.clientName,
        city: user.city,
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
  const { city, clientId } = req.body; // clientId as password

  if (!city || !clientId) {
    return res.status(400).json({ message: 'Please provide city and clientId' });
  }

  try {
    // Find user by city and clientId (as an identifier)
    // Actually, clientId is unique, so we can just find by it and verify city
    const user = await User.findOne({ clientId, city, isAdmin: false });

    if (user && (await user.matchPassword(clientId))) {
      res.json({
        _id: user._id,
        clientId: user.clientId,
        mobile: user.mobile,
        clientName: user.clientName,
        city: user.city,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid city or client code' });
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
    console.log("Admin user found:", !!user);

    if (user && (await user.matchPassword(password))) {
      // Ensure JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing in environment variables");
        return res.status(500).json({ message: "Server configuration error: JWT_SECRET missing" });
      }

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
    console.error("Admin Login Error:", error);
    res.status(500).json({ 
      message: "Internal server error during login",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = { registerUser, authUser, adminLogin };
