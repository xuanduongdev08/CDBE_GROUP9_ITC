// Success response formatter
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data
  };
};

// Error response formatter
const errorResponse = (message, statusCode = 500, code = 'ERROR', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    code
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

// Paginated response formatter
const paginatedResponse = (data, page, limit, total, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Generate order code
const generateOrderCode = () => {
  const date = new Date();
  const dateString = date.getFullYear() + 
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${dateString}-${String(random).padStart(4, '0')}`;
};

// Hash password reset token
const hashToken = (token) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate random token
const generateToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  generateOrderCode,
  hashToken,
  generateToken
};
