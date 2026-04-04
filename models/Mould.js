const mongoose = require('mongoose');

const mouldSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Machine', 'Completed'],
    default: 'Pending',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedCompletion: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mould', mouldSchema);
