const mongoose = require('mongoose');

const savedCartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  saved_at: {
    type: Date,
    default: Date.now
  }
});

savedCartSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('SavedCart', savedCartSchema);

