const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Cart = require('../models/Cart');

// Login page
router.get('/login', async (req, res) => {
  // Nếu đã đăng nhập user (không phải admin), redirect về trang chủ
  if (req.session.user && !req.session.admin) {
    return res.redirect('/');
  }
  const Category = require('../models/Category');
  const categories = await Category.find();
  res.render('auth/login', { title: 'Login', error: null, categories });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find();
    const { email, password } = req.body;

    // Nếu đã đăng nhập admin, xóa session admin trước
    if (req.session.admin) {
      delete req.session.admin;
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password',
        categories
      });
    }

    // Kiểm tra password với bcrypt hoặc MD5 (backward compatibility)
    let passwordMatch = false;

    // Nếu password trong DB có độ dài 60 ký tự (bcrypt hash), dùng bcrypt
    if (user.password && user.password.length === 60) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Nếu là MD5 hash cũ, kiểm tra MD5
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(password).digest('hex');
      passwordMatch = user.password === hash;

      // Nếu đăng nhập thành công với MD5, tự động upgrade sang bcrypt
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
      }
    }

    if (!passwordMatch) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password',
        categories
      });
    }

    // Set session user (riêng biệt với admin)
    req.session.user = {
      _id: user._id,
      email: user.email,
      full_name: user.full_name
    };

    // Create cart if doesn't exist
    let cart = await Cart.findOne({ user_id: user._id, status: 'active' });
    if (!cart) {
      cart = new Cart({ user_id: user._id });
      await cart.save();
    }

    res.redirect('/');
  } catch (error) {
    console.error(error);
    const Category = require('../models/Category');
    const categories = await Category.find();
    res.render('auth/login', {
      title: 'Login',
      error: 'Server error. Please try again.',
      categories
    });
  }
});

// Register page
router.get('/register', async (req, res) => {
  // Nếu đã đăng nhập user (không phải admin), redirect về trang chủ
  if (req.session.user && !req.session.admin) {
    return res.redirect('/');
  }
  const Category = require('../models/Category');
  const categories = await Category.find();
  res.render('auth/register', { title: 'Register', error: null, categories });
});

// Register handler
router.post('/register', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find();
    const { full_name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email already exists',
        categories
      });
    }

    // Hash password với bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-generate username from email
    let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    // Ensure username is unique by appending random numbers if needed
    let usernameExists = await User.findOne({ username });
    while (usernameExists) {
      username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + Math.floor(Math.random() * 10000);
      usernameExists = await User.findOne({ username });
    }

    const user = new User({
      username,
      full_name,
      email,
      password: hashedPassword,
      phone: phone || null
    });

    await user.save();

    // Create cart for new user
    const cart = new Cart({ user_id: user._id });
    await cart.save();

    // Nếu đã đăng nhập admin, xóa session admin trước
    if (req.session.admin) {
      delete req.session.admin;
    }

    // Set session user (riêng biệt với admin)
    req.session.user = {
      _id: user._id,
      email: user.email,
      full_name: user.full_name
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    const Category = require('../models/Category');
    const categories = await Category.find();
    res.render('auth/register', {
      title: 'Register',
      error: 'Server error. Please try again.',
      categories
    });
  }
});

// Logout (chỉ logout user, không ảnh hưởng admin session)
router.get('/logout', (req, res) => {
  delete req.session.user;
  req.session.save((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

module.exports = router;

