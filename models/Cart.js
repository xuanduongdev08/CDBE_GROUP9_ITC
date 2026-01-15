const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'converted', 'abandoned'],
    default: 'active'
  }
});

module.exports = mongoose.model('Cart', cartSchema);

