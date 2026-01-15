const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: null
  },
  message: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Chưa xử lý', 'Đang xử lý', 'Đã phản hồi'],
    default: 'Chưa xử lý'
  }
});

module.exports = mongoose.model('Contact', contactSchema);

