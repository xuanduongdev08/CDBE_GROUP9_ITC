const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { successResponse, errorResponse, generateToken, hashToken } = require('../utils/responseFormatter');
const crypto = require('crypto');

// Register - POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    // Validation
    if (!username || !email || !password || !full_name) {
      return res.status(400).json(
        errorResponse('Missing required fields: username, email, password, full_name', 400)
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(errorResponse('Invalid email format', 400));
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json(
        errorResponse('Password must contain at least 8 characters with uppercase, lowercase, number and special character', 400)
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json(
        errorResponse('Email or username already registered', 400, 'DUPLICATE_USER')
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));

    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name,
      phone: phone || null,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationTokenExpire
    });

    await user.save();

    // Send verification email
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailTemplate = emailTemplates.verifyEmail(full_name, verifyLink);
    
    await sendEmail(email, 'Verify Your Email - PLT Shop', emailTemplate);

    return res.status(201).json(
      successResponse(
        { userId: user._id, email: user.email },
        'Registration successful. Please check your email to verify your account.',
        201
      )
    );
  } catch (error) {
    next(error);
  }
};

// Verify Email - POST /api/v1/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(errorResponse('Verification token is required', 400));
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(
        errorResponse('Invalid or expired verification token', 400, 'INVALID_TOKEN')
      );
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpire = null;
    await user.save();

    return res.status(200).json(
      successResponse({ userId: user._id }, 'Email verified successfully. You can now login.')
    );
  } catch (error) {
    next(error);
  }
};

// Login - POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json(
        errorResponse('Invalid email or password', 401, 'INVALID_CREDENTIALS')
      );
    }

    if (!user.isVerified) {
      return res.status(401).json(
        errorResponse('Please verify your email before logging in', 401, 'EMAIL_NOT_VERIFIED')
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        errorResponse('Invalid email or password', 401, 'INVALID_CREDENTIALS')
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Also set session for backward compatibility
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    };

    return res.status(200).json(
      successResponse(
        {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            role: user.role
          }
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Forgot Password - POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(errorResponse('Email is required', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to avoid user enumeration
    if (!user) {
      return res.status(200).json(
        successResponse(null, 'If an account exists, a password reset link has been sent to your email')
      );
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailTemplate = emailTemplates.resetPassword(user.full_name, resetLink);
    
    await sendEmail(email, 'Password Reset Request - PLT Shop', emailTemplate);

    return res.status(200).json(
      successResponse(null, 'If an account exists, a password reset link has been sent to your email')
    );
  } catch (error) {
    next(error);
  }
};

// Reset Password - POST /api/v1/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json(
        errorResponse('Token and new password are required', 400)
      );
    }

    // Hash provided token to compare with stored hash
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(
        errorResponse('Invalid or expired reset token', 400, 'INVALID_TOKEN')
      );
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json(
        errorResponse('Password must contain at least 8 characters with uppercase, lowercase, number and special character', 400)
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS || 10));

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).json(
      successResponse(null, 'Password reset successfully. You can now login with your new password.')
    );
  } catch (error) {
    next(error);
  }
};

// Logout - POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    // Clear session if exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }

    return res.status(200).json(successResponse(null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};
