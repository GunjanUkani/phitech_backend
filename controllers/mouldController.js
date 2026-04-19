const Mould = require('../models/Mould');
const User = require('../models/User');

// Create Mould - Admin Only
const createMould = async (req, res) => {
  const { clientId, productId, status, percentage, startDate, expectedCompletion } = req.body;

  try {
    const user = await User.findOne({ clientId, isAdmin: false });
    if (!user) {
      return res.status(400).json({ message: `Client with clientId ${clientId} not found` });
    }

    const mould = await Mould.create({
      user: user._id, 
      clientId, 
      productId, 
      status: status || 'Pending',
      percentage,
      startDate,
      expectedCompletion
    });

    res.status(201).json(mould);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Moulds
const getAllMoulds = async (req, res) => {
  try {
    const moulds = await Mould.find({}).populate('user', 'clientId mobile').sort({ createdAt: -1 });
    res.json(moulds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Moulds for Logged-in User
const getMyMoulds = async (req, res) => {
  try {
    const moulds = await Mould.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(moulds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Mould - Admin Only
const updateMould = async (req, res) => {
  try {
    const mould = await Mould.findById(req.params.id);
    if (!mould) {
      return res.status(404).json({ message: 'Mould not found' });
    }

    mould.status = req.body.status || mould.status;
    mould.productId = req.body.productId || mould.productId;
    mould.clientId = req.body.clientId || mould.clientId;
    if (req.body.percentage !== undefined) {
      mould.percentage = req.body.percentage;
    }
    mould.startDate = req.body.startDate || mould.startDate;
    mould.expectedCompletion = req.body.expectedCompletion || mould.expectedCompletion;
    if (req.body.status === 'Completed') {
      mould.completedDate = new Date();
    }

    const updatedMould = await mould.save();
    res.json(updatedMould);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Mould - Admin Only
const deleteMould = async (req, res) => {
  try {
    const mould = await Mould.findById(req.params.id);
    if (!mould) {
      return res.status(404).json({ message: 'Mould not found' });
    }
    await Mould.deleteOne({ _id: mould._id });
    res.json({ message: 'Mould removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Status Analytics - Admin Only
const getAnalytics = async (req, res) => {
    try {
        const totalClients = await User.countDocuments({ isAdmin: false });
        const totalMoulds = await Mould.countDocuments({});
        const completedMoulds = await Mould.countDocuments({ status: 'Completed' });
        const pendingMoulds = await Mould.countDocuments({ status: 'Pending' });
        const inMachineMoulds = await Mould.countDocuments({ status: 'In Machine' });

        res.json({
            totalClients,
            totalMoulds,
            statusCounts: {
                Completed: completedMoulds,
                Pending: pendingMoulds,
                InMachine: inMachineMoulds
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createMould, getAllMoulds, getMyMoulds, updateMould, deleteMould, getAnalytics };
