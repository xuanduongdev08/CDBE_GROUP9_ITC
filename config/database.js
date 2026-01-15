const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plt_shop', {
      serverSelectionTimeoutMS: 3000 // 3 second timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Warning: MongoDB connection failed - ${error.message}`);
    console.log('Server will run with limited functionality');
  }
};

module.exports = connectDB;

