const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  address: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;
