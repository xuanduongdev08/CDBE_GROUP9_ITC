const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['cod', 'momo', 'bank', 'vnpay'],
    default: 'cod'
  }
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);

