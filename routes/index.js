const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { isAuthenticated } = require('../middleware/auth');

// Home page
router.get('/', async (req, res) => {
  try {
    let categories = [];
    let featuredProducts = [];
    let bestsellerProducts = [];

    try {
      categories = await Category.find().exec();
      featuredProducts = await Product.find().limit(8).populate('category_id').exec();
      bestsellerProducts = await Product.find().sort({ created_at: -1 }).limit(4).populate('category_id').exec();
    } catch (dbError) {
      console.log('Database query failed:', dbError.message);
      // Continue with empty arrays
    }

    res.render('index', {
      title: 'Home',
      categories: categories || [],
      featuredProducts: featuredProducts || [],
      bestsellerProducts: bestsellerProducts || [],
      keyboardProducts: [],
      mouseProducts: [],
      vgaProducts: []
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.render('index', {
      title: 'Home',
      categories: [],
      featuredProducts: [],
      bestsellerProducts: [],
      keyboardProducts: [],
      mouseProducts: [],
      vgaProducts: []
    });
  }
});

// Shop page
router.get('/shop', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const categoryId = req.query.category;
    const search = req.query.search;
    const priceMin = req.query.priceMin ? parseInt(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseInt(req.query.priceMax) : null;

    let query = {};
    if (categoryId) {
      query.category_id = categoryId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (priceMin !== null || priceMax !== null) {
      query.price = {};
      if (priceMin !== null) {
        query.price.$gte = priceMin;
      }
      if (priceMax !== null) {
        query.price.$lte = priceMax;
      }
    }

    const products = await Product.find(query)
      .populate('category_id')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    console.log(`Shop page - Page: ${page}, Limit: ${limit}, Products found: ${products.length}, Total products: ${totalProducts}`);

    const categories = await Category.find();

    // Check if this is an AJAX request
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.render('partials/shop-products', {
        products,
        currentPage: page,
        totalPages,
        categoryId,
        search,
        priceMin,
        priceMax,
        user: req.user || null
      });
    }

    res.render('shop', {
      title: 'Shop',
      products,
      categories,
      currentPage: page,
      totalPages,
      categoryId,
      search,
      priceMin,
      priceMax
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Single product page
router.get('/single/:id', async (req, res) => {
  try {
    const categories = await Category.find();
    const product = await Product.findById(req.params.id).populate('category_id');
    if (!product) {
      return res.status(404).render('404', { categories });
    }

    const relatedProducts = await Product.find({
      category_id: product.category_id,
      _id: { $ne: product._id }
    }).limit(4).populate('category_id');

    res.render('single', {
      title: product.name,
      product,
      relatedProducts,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Cart page
router.get('/cart', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find();
    const cart = await Cart.findOne({
      user_id: req.session.user._id,
      status: 'active'
    });

    let cartItems = [];
    let total = 0;

    if (cart) {
      cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
      total = cartItems.reduce((sum, item) => {
        if (item.product_id && item.product_id.price) {
          return sum + (item.product_id.price * item.quantity);
        }
        return sum;
      }, 0);
    }

    res.render('cart', {
      title: 'Cart',
      cartItems,
      total,
      categories
    });
  } catch (error) {
    console.error('Cart page error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

// Checkout page
router.get('/checkout', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find();
    const cart = await Cart.findOne({
      user_id: req.session.user._id,
      status: 'active'
    });

    if (!cart) {
      return res.redirect('/cart');
    }

    let cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');

    // Nếu có query parameter items, chỉ lấy các sản phẩm được chọn
    if (req.query.items) {
      const selectedItemIds = Array.isArray(req.query.items) ? req.query.items : [req.query.items];
      const filteredItems = cartItems.filter(item => selectedItemIds.includes(item._id.toString()));

      // Chỉ sử dụng filtered items nếu có ít nhất 1 item hợp lệ
      // Nếu không có item nào hợp lệ (items từ cart cũ), sử dụng tất cả items trong cart active
      if (filteredItems.length > 0) {
        cartItems = filteredItems;
      }
    }

    // If no items in active cart, redirect to cart page
    if (cartItems.length === 0) {
      return res.redirect('/cart');
    }

    const total = cartItems.reduce((sum, item) => {
      if (item.product_id && item.product_id.price) {
        return sum + (item.product_id.price * item.quantity);
      }
      return sum;
    }, 0);

    const PaymentMethod = require('../models/PaymentMethod');
    const paymentMethods = await PaymentMethod.find();

    res.render('checkout', {
      title: 'Checkout',
      cartItems,
      total,
      paymentMethods,
      categories
    });
  } catch (error) {
    console.error('Checkout page error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

// Order Success page
router.get('/order-success/:orderId', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find();
    const Order = require('../models/Order');
    const mongoose = require('mongoose');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.redirect('/orders');
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.redirect('/orders');
    }

    // Verify order belongs to current user
    if (order.user_id.toString() !== req.session.user._id.toString()) {
      return res.redirect('/orders');
    }

    res.render('order-success', {
      title: 'Đặt Hàng Thành Công',
      orderCode: order.orderCode,
      orderId: order._id,
      totalAmount: order.total_amount,
      categories
    });
  } catch (error) {
    console.error('Order success page error:', error);
    res.redirect('/orders');
  }
});

// Contact page
router.get('/contact', async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('contact', { title: 'Contact', categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Bestseller page
router.get('/bestseller', async (req, res) => {
  try {
    const categories = await Category.find();
    const products = await Product.find().sort({ created_at: -1 }).limit(20).populate('category_id');
    res.render('bestseller', {
      title: 'Bestseller',
      products,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// My Orders page (Customer order tracking)
router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    const categories = await Category.find();
    const Order = require('../models/Order');

    const orders = await Order.find({ user_id: req.session.user._id })
      .populate('address_id')
      .populate('payment_method_id')
      .sort({ order_date: -1 });

    res.render('orders', {
      title: 'Đơn Hàng Của Tôi',
      orders,
      categories,
      page: 'orders'
    });
  } catch (error) {
    console.error('Orders page error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

// Order Detail page (Customer)
router.get('/orders/:id', isAuthenticated, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const categories = await Category.find();
    const Order = require('../models/Order');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).render('404', { categories, error: 'Mã đơn hàng không hợp lệ' });
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
      });

    if (!order) {
      return res.status(404).render('404', { categories, error: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra xem đơn hàng có thuộc về user hiện tại không
    if (order.user_id._id.toString() !== req.session.user._id.toString()) {
      return res.status(403).render('404', { categories, error: 'Bạn không có quyền xem đơn hàng này' });
    }

    // Use order.items directly instead of querying OrderItem collection
    const orderItems = order.items || [];

    res.render('order-detail', {
      title: 'Chi Tiết Đơn Hàng',
      order,
      orderItems: orderItems,
      categories,
      page: 'orders'
    });
  } catch (error) {
    console.error('Order detail error:', error);
    const categories = await Category.find();
    res.status(500).render('404', { categories, error: 'Lỗi server: ' + error.message });
  }
});

// Cancel order (Customer)
router.post('/orders/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Order = require('../models/Order');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Mã đơn hàng không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền truy cập
    if (order.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền hủy đơn hàng này' });
    }

    // Chỉ cho phép hủy đơn hàng đang pending hoặc processing
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({
        success: false,
        error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý hoặc đang xử lý'
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'cancelled';

    // Nếu đã thanh toán, cập nhật payment_status thành refunded
    if (order.payment_status === 'paid') {
      order.payment_status = 'refunded';
    }

    await order.save();

    res.json({ success: true, message: 'Đơn hàng đã được hủy thành công' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server: ' + error.message });
  }
});

// Reorder (Buy again) - Add products from order to cart
router.post('/orders/:id/reorder', isAuthenticated, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Order = require('../models/Order');
    const OrderItem = require('../models/OrderItem');
    const Cart = require('../models/Cart');
    const CartItem = require('../models/CartItem');
    const Product = require('../models/Product');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Mã đơn hàng không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền truy cập
    if (order.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Bạn không có quyền mua lại đơn hàng này' });
    }

    // Chỉ cho phép mua lại đơn hàng đã hủy hoặc đã giao
    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Chỉ có thể mua lại đơn hàng đã hủy hoặc đã giao'
      });
    }

    // Lấy order items
    const orderItems = await OrderItem.find({ order_id: order._id }).populate('product_id');

    if (orderItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Đơn hàng không có sản phẩm' });
    }

    // Tìm hoặc tạo cart
    let cart = await Cart.findOne({
      user_id: req.session.user._id,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({
        user_id: req.session.user._id,
        status: 'active'
      });
      await cart.save();
    }

    // Thêm sản phẩm vào giỏ hàng
    let addedCount = 0;
    let skippedCount = 0;

    for (const orderItem of orderItems) {
      // Kiểm tra sản phẩm còn tồn tại không
      const product = await Product.findById(orderItem.product_id._id);
      if (!product) {
        skippedCount++;
        continue;
      }

      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const existingCartItem = await CartItem.findOne({
        cart_id: cart._id,
        product_id: product._id
      });

      if (existingCartItem) {
        // Cập nhật số lượng
        existingCartItem.quantity += orderItem.quantity;
        await existingCartItem.save();
        addedCount++;
      } else {
        // Thêm mới vào giỏ hàng
        const cartItem = new CartItem({
          cart_id: cart._id,
          product_id: product._id,
          quantity: orderItem.quantity
        });
        await cartItem.save();
        addedCount++;
      }
    }

    res.json({
      success: true,
      message: `Đã thêm ${addedCount} sản phẩm vào giỏ hàng${skippedCount > 0 ? ` (${skippedCount} sản phẩm không còn tồn tại)` : ''}`,
      addedCount,
      skippedCount
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;

