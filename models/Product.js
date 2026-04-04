const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  photos: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one photo is required.'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
