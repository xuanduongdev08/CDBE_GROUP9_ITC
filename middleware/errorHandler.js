const { errorResponse } = require('../utils/responseFormatter');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.path,
    ip: req.ip,
    userId: req.user?.id || null
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(errorResponse('Validation error', 400, 'VALIDATION_ERROR', errors));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json(
      errorResponse(`${field} already exists`, 400, 'DUPLICATE_ENTRY')
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token', 401, 'INVALID_TOKEN'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token expired', 401, 'TOKEN_EXPIRED'));
  }

  // Custom API error
  if (err.statusCode) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, err.statusCode, err.code)
    );
  }

  // Default server error
  res.status(500).json(
    errorResponse('Internal server error. Please try again later.', 500, 'SERVER_ERROR')
  );
};

// Not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json(
    errorResponse('The resource you requested does not exist', 404, 'NOT_FOUND')
  );
};

module.exports = {
  errorHandler,
  notFoundHandler
};
