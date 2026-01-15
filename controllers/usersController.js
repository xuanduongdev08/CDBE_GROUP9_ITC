const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');

// Get current user profile - GET /api/v1/users/me
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken -resetPasswordToken');
    
    if (!user || user.isDeleted) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    return res.status(200).json(successResponse(user, 'User profile retrieved'));
  } catch (error) {
    next(error);
  }
};

// Update current user - PUT /api/v1/users/me
exports.updateCurrentUser = async (req, res, next) => {
  try {
    const { full_name, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.isDeleted) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    // Only allow non-admin fields to be updated by regular users
    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.status(200).json(
      successResponse(user, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Create user (Admin only) - POST /api/v1/users
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone, role } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json(
        errorResponse('Missing required fields', 400)
      );
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json(
        errorResponse('Email or username already exists', 400)
      );
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name,
      phone: phone || null,
      role: role || 'user',
      isVerified: true // Admin-created users are auto-verified
    });

    await user.save();

    return res.status(201).json(
      successResponse(
        { userId: user._id, email: user.email, username: user.username },
        'User created successfully',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get user by ID - GET /api/v1/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verificationToken -resetPasswordToken');

    if (!user || user.isDeleted) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    return res.status(200).json(successResponse(user, 'User retrieved'));
  } catch (error) {
    next(error);
  }
};

// Update user (Admin only) - PUT /api/v1/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { full_name, phone, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;
    if (role) user.role = role; // Only admin can change role
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    return res.status(200).json(
      successResponse(user, 'User updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only) - DELETE /api/v1/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    // Soft delete
    user.isDeleted = true;
    await user.save();

    return res.status(200).json(
      successResponse(null, 'User deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// List users (Admin only) - GET /api/v1/users
exports.listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isDeleted: false };
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json(
      paginatedResponse(users, parseInt(page), parseInt(limit), total, 'Users retrieved')
    );
  } catch (error) {
    next(error);
  }
};
