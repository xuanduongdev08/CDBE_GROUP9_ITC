const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { successResponse, paginatedResponse } = require('../utils/responseFormatter');

// Search products - GET /api/v1/search/products
exports.searchProducts = async (req, res, next) => {
  try {
    const { 
      q, 
      category, 
      minPrice, 
      maxPrice, 
      inStock,
      brand,
      sort = '-created_at',
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };

    // Full-text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Category filter
    if (category) {
      filter.category_id = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Stock availability
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Brand
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Parse sort
    const sortObj = {};
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });

    const products = await Product.find(filter)
      .populate('category_id')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortObj || { created_at: -1 });

    const total = await Product.countDocuments(filter);

    return res.status(200).json(
      paginatedResponse(products, parseInt(page), parseInt(limit), total, 'Products found')
    );
  } catch (error) {
    next(error);
  }
};

// Search orders (Admin/Moderator only) - GET /api/v1/search/orders
exports.searchOrders = async (req, res, next) => {
  try {
    const { status, userId, orderCode, minDate, maxDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.user_id = userId;
    }

    if (orderCode) {
      filter.orderCode = { $regex: orderCode, $options: 'i' };
    }

    // Date range
    if (minDate || maxDate) {
      filter.order_date = {};
      if (minDate) {
        filter.order_date.$gte = new Date(minDate);
      }
      if (maxDate) {
        filter.order_date.$lte = new Date(maxDate);
      }
    }

    const orders = await Order.find(filter)
      .populate('user_id', 'full_name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ order_date: -1 });

    const total = await Order.countDocuments(filter);

    return res.status(200).json(
      paginatedResponse(orders, parseInt(page), parseInt(limit), total, 'Orders found')
    );
  } catch (error) {
    next(error);
  }
};

// Search users (Admin only) - GET /api/v1/search/users
exports.searchUsers = async (req, res, next) => {
  try {
    const { q, role, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { full_name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json(
      paginatedResponse(users, parseInt(page), parseInt(limit), total, 'Users found')
    );
  } catch (error) {
    next(error);
  }
};
