const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Address = require('../models/Address');
const Contact = require('../models/Contact');
const { isAuthenticated } = require('../middleware/auth');

// Add to cart
router.post('/cart/add', isAuthenticated, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Validate product exists and has enough stock
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
    }

    const requestedQuantity = parseInt(quantity) || 1;

    // Check if product has enough stock
    if (product.stock < requestedQuantity) {
      return res.status(400).json({
        success: false,
        error: `Chỉ còn ${product.stock} sản phẩm trong kho`
      });
    }

    let cart = await Cart.findOne({
      user_id: req.session.user._id,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({ user_id: req.session.user._id });
      await cart.save();
    }

    const existingItem = await CartItem.findOne({
      cart_id: cart._id,
      product_id
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;

      // Check if total quantity exceeds stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          error: `Chỉ còn ${product.stock} sản phẩm trong kho. Bạn đã có ${existingItem.quantity} trong giỏ hàng.`
        });
      }

      existingItem.quantity = newQuantity;
      await existingItem.save();
    } else {
      const cartItem = new CartItem({
        cart_id: cart._id,
        product_id,
        quantity: requestedQuantity
      });
      await cartItem.save();
    }

    // Calculate cart count and total
    const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    let cartCount = 0;
    let cartTotal = 0;

    cartItems.forEach(item => {
      cartCount += item.quantity;
      if (item.product_id && item.product_id.price) {
        cartTotal += item.product_id.price * item.quantity;
      }
    });

    res.json({
      success: true,
      message: 'Added to cart',
      data: {
        cartCount: cartCount,
        cartTotal: cartTotal
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/cart/update/:id', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findById(req.params.id).populate('cart_id');

    if (!cartItem || cartItem.cart_id.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Remove from cart
router.delete('/cart/remove/:id', isAuthenticated, async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.id).populate('cart_id');

    if (!cartItem || cartItem.cart_id.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create order
router.post('/orders/create', isAuthenticated, async (req, res) => {
  try {
    const { address_id, payment_method_id, shipping_method, payment_confirmed } = req.body;
    const PaymentMethod = require('../models/PaymentMethod');

    const cart = await Cart.findOne({
      user_id: req.session.user._id,
      status: 'active'
    });

    console.log('=== ORDER CREATE DEBUG ===');
    console.log('User ID:', req.session.user._id);
    console.log('Cart found:', cart ? cart._id : 'NO CART');

    if (!cart) {
      console.log('ERROR: No active cart found');
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    console.log('Cart items count:', cartItems.length);
    cartItems.forEach((item, i) => {
      console.log(`  Item ${i + 1}:`, item._id, 'Product:', item.product_id ? item.product_id.name : 'NULL', 'Qty:', item.quantity);
    });

    if (cartItems.length === 0) {
      console.log('ERROR: Cart has no items');
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product_id.price * item.quantity);
    }, 0);

    // Get payment method to determine payment status
    const paymentMethod = await PaymentMethod.findById(payment_method_id);
    let paymentStatus = 'unpaid';

    // Set payment status based on payment method type
    if (paymentMethod) {
      if (paymentMethod.type === 'cod') {
        paymentStatus = 'unpaid'; // COD is always unpaid until delivery
      } else if (paymentMethod.type === 'momo' && payment_confirmed) {
        paymentStatus = 'paid'; // Momo is paid if confirmed
      } else if (paymentMethod.type === 'bank') {
        paymentStatus = 'unpaid'; // Bank transfer needs manual confirmation
      }
    }

    // Generate unique order code
    const generateOrderCode = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `ORD-${timestamp}-${random}`;
    };

    let orderCode = generateOrderCode();
    let orderCodeExists = await Order.findOne({ orderCode });
    while (orderCodeExists) {
      orderCode = generateOrderCode();
      orderCodeExists = await Order.findOne({ orderCode });
    }

    // Prepare items array with product snapshots
    const orderItems = cartItems.map(item => ({
      product_id: item.product_id._id,
      productSnapshot: {
        name: item.product_id.name,
        image: item.product_id.image_url,
        price: item.product_id.price
      },
      quantity: item.quantity,
      price: item.product_id.price
    }));

    const order = new Order({
      orderCode,
      user_id: req.session.user._id,
      cart_id: cart._id,
      address_id,
      payment_method_id,
      shipping_method,
      total_amount: totalAmount,
      payment_status: paymentStatus,
      status: paymentStatus === 'paid' ? 'processing' : 'pending',
      items: orderItems
    });

    await order.save();

    // Create order items in separate collection (for backward compatibility)
    for (const item of cartItems) {
      const orderItem = new OrderItem({
        order_id: order._id,
        product_id: item.product_id._id,
        quantity: item.quantity,
        price: item.product_id.price
      });
      await orderItem.save();
    }

    // Update product stock - Trừ số lượng đã đặt
    for (const item of cartItems) {
      try {
        const product = await Product.findById(item.product_id._id);
        if (product) {
          // Trừ stock theo số lượng đã đặt
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
          console.log(`Updated stock for ${product.name}: ${product.stock + item.quantity} -> ${product.stock}`);
        }
      } catch (stockError) {
        console.error('Error updating stock for product:', item.product_id._id, stockError);
        // Continue with other products even if one fails
      }
    }

    // Delete cart items instead of converting cart
    await CartItem.deleteMany({ cart_id: cart._id });
    console.log('Deleted all cart items. Cart remains active for future use.');

    // Send order confirmation email
    try {
      const { sendEmail, emailTemplates } = require('../utils/sendEmail');
      const User = require('../models/User');

      const user = await User.findById(req.session.user._id);

      if (user && user.email) {
        const emailItems = orderItems.map(item => ({
          name: item.productSnapshot.name,
          quantity: item.quantity,
          price: item.price
        }));

        const emailTemplate = emailTemplates.orderConfirmation(
          orderCode,
          user.full_name || user.username,
          emailItems,
          totalAmount
        );

        await sendEmail(
          user.email,
          `Xác nhận đơn hàng ${orderCode} - PLT Shop`,
          emailTemplate
        );

        console.log('Order confirmation email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.json({
      success: true,
      order_id: order._id,
      payment_status: paymentStatus,
      payment_method_type: paymentMethod ? paymentMethod.type : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const { full_name, email, subject, message } = req.body;

    // Validate input
    if (!full_name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Save contact to database
    const contact = new Contact({
      full_name,
      email,
      subject,
      message
    });

    await contact.save();

    // Send confirmation email to customer
    try {
      const { sendEmail, emailTemplates } = require('../utils/sendEmail');

      const emailTemplate = emailTemplates.contactConfirmation(
        full_name,
        subject,
        message
      );

      await sendEmail(
        email,
        'PLT Shop - Xác nhận đã nhận được liên hệ của bạn',
        emailTemplate
      );

      console.log('Contact confirmation email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send contact confirmation email:', emailError);
      // Don't fail the contact submission if email fails
    }

    res.json({ success: true, message: 'Cảm ơn bạn đã liên hệ! Chúng tôi đã gửi email xác nhận đến bạn.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get cart count and total
router.get('/cart/count', isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user_id: req.session.user._id,
      status: 'active'
    });

    if (!cart) {
      return res.json({ count: 0, total: 0 });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');

    let count = 0;
    let total = 0;

    cartItems.forEach(item => {
      count += item.quantity;
      if (item.product_id && item.product_id.price) {
        total += item.product_id.price * item.quantity;
      }
    });

    res.json({ count, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Create address
router.post('/addresses/create', isAuthenticated, async (req, res) => {
  try {
    const { recipient_name, phone, address_line, city, province, postal_code } = req.body;

    const address = new Address({
      user_id: req.session.user._id,
      recipient_name,
      phone,
      address_line,
      city,
      province,
      postal_code
    });

    await address.save();
    res.json({ success: true, address_id: address._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

