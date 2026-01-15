const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseFormatter');

// Verify JWT Token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
      return res.status(401).json(errorResponse('Missing authentication token', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(errorResponse('Invalid token', 401, 'INVALID_TOKEN'));
    }
    return res.status(401).json(errorResponse('Authentication failed', 401));
  }
};

// Backward compatibility - also accept session-based auth
const isAuthenticated = (req, res, next) => {
  // Try JWT first
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return verifyToken(req, res, next);
  }

  // Fall back to session
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json(errorResponse('Authentication required', 401));
};

module.exports = {
  verifyToken,
  isAuthenticated
};
