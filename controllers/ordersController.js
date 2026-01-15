const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { successResponse, errorResponse, paginatedResponse, generateOrderCode } = require('../utils/responseFormatter');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// Create order - POST /api/v1/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, address_id, payment_method_id, shipping_method, notes } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json(errorResponse('Order items are required', 400));
    }

    if (!address_id) {
      return res.status(400).json(errorResponse('Shipping address is required', 400));
    }

    // Validate and check stock for all items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || product.isDeleted) {
        return res.status(404).json(
          errorResponse(`Product ${item.productId} not found`, 404)
        );
      }

      if (product.stock < item.quantity) {
        return res.status(400).json(
          errorResponse(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400)
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Create product snapshot
      const snapshot = {
        name: product.name,
        image: product.image_url || (product.images && product.images[0]),
        price: product.price
      };

      orderItems.push({
        product_id: product._id,
        productSnapshot: snapshot,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock (atomic operation)
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    // Generate order code
    const orderCode = generateOrderCode();

    // Create order
    const order = new Order({
      orderCode,
      user_id: userId,
      items: orderItems,
      address_id,
      payment_method_id: payment_method_id || null,
      shipping_method: shipping_method || 'standard',
      shipping_fee: 0,
      total_amount: totalAmount,
      notes: notes || null,
      status: 'pending',
      payment_status: 'unpaid'
    });

    await order.save();

    // Get user info for email
    const user = await User.findById(userId);

    // Send order confirmation email
    const emailTemplate = emailTemplates.orderConfirmation(
      orderCode,
      user.full_name,
      orderItems.map(item => ({
        name: item.productSnapshot.name,
        quantity: item.quantity,
        price: item.productSnapshot.price
      })),
      totalAmount
    );

    await sendEmail(user.email, `Order Confirmation - ${orderCode}`, emailTemplate);

    // Clear user's cart
    const cart = await Cart.findOne({ user_id: userId, status: 'active' });
    if (cart) {
      cart.status = 'converted';
      await cart.save();
    }

    return res.status(201).json(
      successResponse(
        {
          orderId: order._id,
          orderCode: order.orderCode,
          totalAmount: order.total_amount
        },
        'Order created successfully. Confirmation email sent.',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get orders - GET /api/v1/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    // Regular users see only their orders
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      filter.user_id = req.user.id;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.order_date = {};
      if (startDate) {
        filter.order_date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.order_date.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(filter)
      .populate('user_id', 'full_name email')
      .populate('address_id')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ order_date: -1 });

    const total = await Order.countDocuments(filter);

    return res.status(200).json(
      paginatedResponse(orders, parseInt(page), parseInt(limit), total, 'Orders retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Get order detail - GET /api/v1/orders/:id
exports.getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id')
      .populate('address_id')
      .populate('items.product_id');

    if (!order || order.isDeleted) {
      return res.status(404).json(errorResponse('Order not found', 404));
    }

    // Check if user is owner or admin
    if (req.user.role !== 'admin' && req.user.id !== order.user_id._id.toString()) {
      return res.status(403).json(errorResponse('You do not have permission to access this order', 403));
    }

    return res.status(200).json(
      successResponse(order, 'Order retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Update order status (Admin/Moderator) - PATCH /api/v1/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json(errorResponse('Status is required', 400));
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(errorResponse('Invalid status', 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      return res.status(404).json(errorResponse('Order not found', 404));
    }

    const oldStatus = order.status;
    order.status = status;
    order.processed_by = req.user.id;

    // If delivered, increase sold count for products
    if (status === 'delivered' && oldStatus !== 'delivered') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { sold: item.quantity } }
        );
      }
    }

    // If cancelled, restore stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.save();

    // Send status update email to customer
    const user = await User.findById(order.user_id);
    const emailTemplate = emailTemplates.orderStatusUpdate(
      order.orderCode,
      user.full_name,
      status
    );

    await sendEmail(user.email, `Order Status Update - ${order.orderCode}`, emailTemplate);

    return res.status(200).json(
      successResponse(order, 'Order status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Cancel order - DELETE /api/v1/orders/:id
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order || order.isDeleted) {
      return res.status(404).json(errorResponse('Order not found', 404));
    }

    // Check permission
    if (req.user.role !== 'admin' && req.user.id !== order.user_id.toString()) {
      return res.status(403).json(errorResponse('You do not have permission to cancel this order', 403));
    }

    // Non-admin users can only cancel pending orders
    if (req.user.role !== 'admin' && order.status !== 'pending') {
      return res.status(400).json(
        errorResponse('Only pending orders can be cancelled by customers', 400)
      );
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { stock: item.quantity } }
      );
    }

    // Soft delete or mark as cancelled
    order.status = 'cancelled';
    order.isDeleted = true;
    await order.save();

    // Send cancellation email
    const user = await User.findById(order.user_id);
    const emailTemplate = emailTemplates.orderStatusUpdate(
      order.orderCode,
      user.full_name,
      'cancelled'
    );

    await sendEmail(user.email, `Order Cancelled - ${order.orderCode}`, emailTemplate);

    return res.status(200).json(
      successResponse(null, 'Order cancelled successfully. Stock has been restored.')
    );
  } catch (error) {
    next(error);
  }
};
