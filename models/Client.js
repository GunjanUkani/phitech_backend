const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
