const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  recipient_name: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  address_line: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  province: {
    type: String,
    default: null
  },
  postal_code: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Address', addressSchema);

