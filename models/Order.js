const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    unique: true,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    default: null
  },
  address_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    default: null
  },
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productSnapshot: {
      name: String,
      image: String,
      price: Number
    },
    quantity: {
      type: Number,
      min: 1
    },
    price: Number
  }],
  order_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_method_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    default: null
  },
  payment_status: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  shipping_method: {
    type: String,
    default: null
  },
  shipping_fee: {
    type: Number,
    default: 0,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: null
  },
  tracking_number: {
    type: String,
    default: null
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes (orderCode already indexed via unique: true)
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ order_date: -1 });
orderSchema.index({ isDeleted: 1 });

// Pre-save middleware
orderSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);

