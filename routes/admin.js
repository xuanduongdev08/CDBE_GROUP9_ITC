const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Admin = require('../models/Admin');
const PaymentMethod = require('../models/PaymentMethod');
const Address = require('../models/Address');
const { isAdmin, isSuperAdmin } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../img');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Admin login page
router.get('/login', (req, res) => {
  // If already logged in as admin, redirect to dashboard
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { title: 'Admin Login', error: null });
});

// Admin login handler
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra password với bcrypt hoặc MD5 (backward compatibility)
    let passwordMatch = false;
    
    // Nếu password trong DB có độ dài 60 ký tự (bcrypt hash), dùng bcrypt
    if (admin.password && admin.password.length === 60) {
      passwordMatch = await bcrypt.compare(password, admin.password);
    } else {
      // Nếu là MD5 hash cũ, kiểm tra MD5
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(password).digest('hex');
      passwordMatch = admin.password === hash;
      
      // Nếu đăng nhập thành công với MD5, tự động upgrade sang bcrypt
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin.password = hashedPassword;
        await admin.save();
      }
    }
    
    if (!passwordMatch) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Nếu đã đăng nhập user, xóa session user trước
    if (req.session.user) {
      delete req.session.user;
    }

    // Set session admin (riêng biệt với user)
    const adminRole = admin.role || 'staff';
    req.session.admin = {
      _id: admin._id.toString(),
      username: admin.username,
      full_name: admin.full_name || admin.username,
      role: adminRole,
      permissions: admin.permissions || {}
    };

    // Save session and redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'Lỗi hệ thống, vui lòng thử lại'
        });
      }
      res.redirect('/admin/dashboard');
    });
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      title: 'Admin Login',
      error: 'Lỗi hệ thống: ' + error.message
    });
  }
});

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Calculate total revenue from paid orders
    const totalRevenueResult = await Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Calculate monthly revenue
    const monthlyRevenueData = await Order.aggregate([
      { $match: { payment_status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$order_date' },
            month: { $month: '$order_date' }
          },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    const monthlyRevenue = monthlyRevenueData.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
        revenue: item.revenue
      };
    });

    const recentOrders = await Order.find()
      .populate('user_id')
      .sort({ order_date: -1 })
      .limit(10);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.session.admin,
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      monthlyRevenue,
      recentOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Products management
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate('category_id').sort({ created_at: -1 });
    const categories = await Category.find();
    
    res.render('admin/products', {
      title: 'Manage Products',
      user: req.session.admin,
      products,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// New product form
router.get('/products/new', isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.render('admin/product-new', {
      title: 'Thêm Sản Phẩm Mới',
      page: 'products',
      user: req.session.admin,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Create new product
router.post('/products/new', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.render('admin/product-new', {
        title: 'Thêm Sản Phẩm Mới',
        page: 'products',
        user: req.session.admin,
        categories: await Category.find().sort({ name: 1 }),
        error: 'Vui lòng điền đầy đủ thông tin bắt buộc (Tên sản phẩm và Giá)',
        formData: req.body
      });
    }
    
    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = 'img/' + req.file.filename;
    }
    
    const product = new Product({
      name,
      description: description || null,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category_id: category_id || null,
      image_url: imageUrl,
      created_by_admin: req.session.admin._id
    });
    
    await product.save();
    
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Create product error:', error);
    const categories = await Category.find().sort({ name: 1 });
    res.render('admin/product-new', {
      title: 'Thêm Sản Phẩm Mới',
      page: 'products',
      user: req.session.admin,
      categories,
      error: 'Lỗi khi tạo sản phẩm: ' + error.message,
      formData: req.body
    });
  }
});

// Product detail
router.get('/products/:id', isAdmin, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid product ID');
    }
    
    const product = await Product.findById(req.params.id)
      .populate('category_id')
      .populate('created_by_admin');
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    // Get order items for this product to see sales history
    const OrderItem = require('../models/OrderItem');
    const orderItems = await OrderItem.find({ product_id: product._id })
      .populate({
        path: 'order_id',
        populate: {
          path: 'user_id',
          select: 'full_name email'
        }
      })
      .sort({ order_id: -1 })
      .limit(10);
    
    // Calculate total sold
    const totalSold = await OrderItem.aggregate([
      { $match: { product_id: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const soldQuantity = totalSold.length > 0 ? totalSold[0].total : 0;
    
    // Get referrer page from query parameter
    const fromPage = req.query.from || 'products';
    const backUrl = fromPage === 'inventory' ? '/admin/inventory' : '/admin/products';
    
    res.render('admin/product-detail', {
      title: 'Chi Tiết Sản Phẩm',
      page: 'products',
      user: req.session.admin,
      product,
      orderItems: orderItems || [],
      soldQuantity,
      backUrl
    });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

// Update product stock
router.put('/products/:id/stock', isAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    const mongoose = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }
    
    // Validate stock
    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      return res.status(400).json({ success: false, error: 'Số lượng tồn kho không hợp lệ' });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: stockValue },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server: ' + error.message });
  }
});

// Delete product
router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid product ID' });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm' });
    }
    
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server: ' + error.message });
  }
});

// Orders management
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id')
      .populate('address_id')
      .sort({ order_date: -1 });
    
    res.render('admin/orders', {
      title: 'Manage Orders',
      user: req.session.admin,
      orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Order detail
router.get('/orders/:id', isAdmin, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid order ID');
    }
    
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user_id',
        select: 'full_name email phone'
      })
      .populate({
        path: 'address_id',
        select: 'recipient_name phone address_line city province postal_code'
      })
      .populate({
        path: 'payment_method_id',
        select: 'name description type'
      })
      .populate({
        path: 'processed_by',
        select: 'username full_name'
      });
    
    if (!order) {
      return res.status(404).send('Order not found');
    }
    
    // Convert to plain object for easier handling
    const orderObj = order.toObject ? order.toObject() : order;
    
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate({
        path: 'product_id',
        select: 'name price image_url'
      });
    
    // Convert orderItems to plain objects
    const orderItemsObj = orderItems.map(item => item.toObject ? item.toObject() : item);
    
    res.render('admin/order-detail', {
      title: 'Chi Tiết Đơn Hàng',
      page: 'orders',
      user: req.session.admin,
      order: orderObj,
      orderItems: orderItemsObj || []
    });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

// Update order status
router.put('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Trạng thái không hợp lệ' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        processed_by: req.session.admin._id
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Update payment status
router.put('/orders/:id/payment', isAdmin, async (req, res) => {
  try {
    const { payment_status } = req.body;
    const validStatuses = ['unpaid', 'paid', 'refunded'];
    
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ success: false, error: 'Trạng thái thanh toán không hợp lệ' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { payment_status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Users management (only super admin)
router.get('/users', isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    
    res.render('admin/users', {
      title: 'Quản Lý Người Dùng',
      page: 'users',
      user: req.session.admin,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// User orders history
router.get('/users/:id/orders', isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid user ID');
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    const orders = await Order.find({ user_id: req.params.id })
      .populate('address_id')
      .populate('payment_method_id')
      .sort({ order_date: -1 });
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject ? order.toObject() : order;
        const orderItems = await OrderItem.find({ order_id: order._id })
          .populate('product_id');
        return {
          ...orderObj,
          items: orderItems.map(item => item.toObject ? item.toObject() : item)
        };
      })
    );
    
    res.render('admin/user-orders', {
      title: 'Lịch Sử Mua Hàng',
      page: 'users',
      user: req.session.admin,
      targetUser: user,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('User orders error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

// Admins management (all admins can view)
router.get('/admins', isAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().sort({ created_at: -1 });
    
    res.render('admin/admins', {
      title: 'Quản Lý Admin & Nhân Viên',
      page: 'admins',
      user: req.session.admin,
      admins
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Categories management
router.get('/categories', isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: -1 });
    
    res.render('admin/categories', {
      title: 'Manage Categories',
      user: req.session.admin,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Contacts management
router.get('/contacts', isAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ created_at: -1 });
    
    res.render('admin/contacts', {
      title: 'Manage Contacts',
      user: req.session.admin,
      contacts
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Inventory management
router.get('/inventory', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate('category_id').sort({ created_at: -1 });
    
    // Calculate inventory stats
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock < 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    
    res.render('admin/inventory', {
      title: 'Inventory Management',
      user: req.session.admin,
      products,
      stats: {
        totalProducts,
        lowStock,
        outOfStock,
        totalStock
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Reports management
router.get('/reports', isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user_id').sort({ order_date: -1 });
    const products = await Product.find();
    
    // Calculate report stats
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalProducts = products.length;
    const totalUsers = await User.countDocuments();
    
    // Monthly revenue
    const monthlyRevenue = {};
    orders.forEach(order => {
      if (order.payment_status === 'paid' && order.order_date) {
        const month = new Date(order.order_date).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total_amount || 0);
      }
    });
    
    res.render('admin/reports', {
      title: 'Reports',
      user: req.session.admin,
      orders,
      stats: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers
      },
      monthlyRevenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Get permissions for an admin
router.get('/admins/:id/permissions', isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
    }
    res.json({ success: true, permissions: admin.permissions || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Update permissions for an admin
router.put('/admins/:id/permissions', isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const { permissions } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    );
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy admin' });
    }
    
    res.json({ success: true, admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Delete admin (only super admin can delete)
router.delete('/admins/:id', isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;
    
    // Prevent deleting own account
    if (adminId === req.session.admin._id.toString()) {
      return res.json({ success: false, error: 'Không thể xóa tài khoản của chính bạn' });
    }

    const admin = await Admin.findByIdAndDelete(adminId);
    
    if (!admin) {
      return res.json({ success: false, error: 'Không tìm thấy admin' });
    }

    res.json({ success: true, message: 'Xóa admin thành công' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.json({ success: false, error: 'Lỗi hệ thống: ' + error.message });
  }
});

// Logout (chỉ logout admin, không ảnh hưởng user session)
router.get('/logout', isAdmin, (req, res) => {
  delete req.session.admin;
  req.session.save((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/admin/login');
  });
});

module.exports = router;

