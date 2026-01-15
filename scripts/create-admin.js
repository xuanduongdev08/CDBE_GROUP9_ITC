const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plt_shop');
    console.log('Connected to database');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin1' });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Username: admin1');
      console.log('Password: 123456');
      await mongoose.disconnect();
      return;
    }

    // Create default admin
    const hashedPassword = await hashPassword('123456');
    const admin = await Admin.create({
      username: 'admin1',
      password: hashedPassword,
      full_name: 'Nguyễn Đăng Khôi',
      role: 'admin'
    });

    console.log('Admin created successfully!');
    console.log('Username: admin1');
    console.log('Password: 123456');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();



