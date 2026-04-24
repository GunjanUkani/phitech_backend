const Mould = require('../models/Mould');
const User = require('../models/User');
const path = require('path');
const { put } = require('@vercel/blob');

// Create Mould - Admin Only
const createMould = async (req, res) => {
  const { clientId, productId, status, percentage, startDate, expectedCompletion } = req.body;
  const shouldUseBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);

  try {
    const user = await User.findOne({ clientId, isAdmin: false });
    if (!user) {
      return res.status(400).json({ message: `Client with clientId ${clientId} not found` });
    }

    let imageUrl = '';
    if (req.file) {
      if (shouldUseBlob) {
        const original = req.file.originalname || 'mould';
        const ext = path.extname(original);
        const base = path.basename(original, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
        const blob = await put(`moulds/${base}${ext}`, req.file.buffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: req.file.mimetype,
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        imageUrl = blob.url;
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    let finalPercentage = percentage;
    if (status === 'Completed') {
      finalPercentage = 100;
    } else if (status === 'Pending' && percentage > 0) {
      finalPercentage = 0; 
    }

    const mould = await Mould.create({
      user: user._id, 
      clientId, 
      productId, 
      status: status || 'Pending',
      percentage: finalPercentage,
      startDate,
      expectedCompletion,
      image: imageUrl
    });

    res.status(201).json(mould);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get All Moulds
const getAllMoulds = async (req, res) => {
  try {
    const moulds = await Mould.find({}).populate('user', 'clientId mobile clientName city').sort({ createdAt: -1 });
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
  const shouldUseBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
  try {
    const mould = await Mould.findById(req.params.id);
    if (!mould) {
      return res.status(404).json({ message: 'Mould not found' });
    }

    if (req.file) {
      if (shouldUseBlob) {
        const original = req.file.originalname || 'mould';
        const ext = path.extname(original);
        const base = path.basename(original, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 60);
        const blob = await put(`moulds/${base}${ext}`, req.file.buffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: req.file.mimetype,
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        mould.image = blob.url;
      } else {
        mould.image = `/uploads/${req.file.filename}`;
      }
    }

    mould.status = req.body.status || mould.status;
    mould.productId = req.body.productId || mould.productId;
    mould.clientId = req.body.clientId || mould.clientId;

    if (mould.status === 'Completed') {
      mould.percentage = 100;
      mould.completedDate = new Date();
    } else if (req.body.percentage !== undefined) {
      if (mould.status === 'Pending') {
        mould.percentage = 0;
      } else {
        mould.percentage = req.body.percentage;
      }
    }

    mould.startDate = req.body.startDate || mould.startDate;
    mould.expectedCompletion = req.body.expectedCompletion || mould.expectedCompletion;

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
