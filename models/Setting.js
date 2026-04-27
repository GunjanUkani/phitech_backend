const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  youtube: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
