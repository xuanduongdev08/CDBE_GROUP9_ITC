const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  quantity: {
    type: Number,
    default: null
  },
  price: {
    type: Number,
    default: null
  }
});

module.exports = mongoose.model('OrderItem', orderItemSchema);

