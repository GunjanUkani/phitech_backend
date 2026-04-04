const User = require('../models/User');

// Get all clients (Admin only)
const getClients = async (req, res) => {
  try {
    const clients = await User.find({ isAdmin: false }).select('-password');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create client (Admin only)
const createClient = async (req, res) => {
  const { clientId, mobile } = req.body;

  if (!clientId || !mobile) {
    return res.status(400).json({ message: 'Please provide clientId and mobile' });
  }

  try {
    const userExists = await User.findOne({ clientId });

    if (userExists) {
      return res.status(400).json({ message: 'Client already exists' });
    }

    const user = await User.create({
      clientId,
      mobile,
      password: mobile,
      isAdmin: false
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        clientId: user.clientId,
        mobile: user.mobile
      });
    } else {
      res.status(400).json({ message: 'Invalid client data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete client (Admin only)
const deleteClient = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'Client removed' });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client (Admin only)
const updateClient = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.clientId = req.body.clientId || user.clientId;
      user.mobile = req.body.mobile || user.mobile;
      if (req.body.mobile) {
          user.password = req.body.mobile; // Reset password to new mobile
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        clientId: updatedUser.clientId,
        mobile: updatedUser.mobile
      });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClients, createClient, deleteClient, updateClient };
