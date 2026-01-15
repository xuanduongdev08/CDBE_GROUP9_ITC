const { errorResponse } = require('../utils/responseFormatter');

// Check if user has specific role(s)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('Authentication required', 401));
    }

    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json(
        errorResponse('You do not have permission to access this resource', 403, 'FORBIDDEN')
      );
    }

    next();
  };
};

// Admin only
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('Authentication required', 401));
  }

  const userRole = req.user.role || 'user';
  if (userRole !== 'admin') {
    return res.status(403).json(errorResponse('Admin access required', 403));
  }

  next();
};

// Moderator or Admin
const isModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('Authentication required', 401));
  }

  const userRole = req.user.role || 'user';
  if (!['admin', 'moderator'].includes(userRole)) {
    return res.status(403).json(errorResponse('Moderator access required', 403));
  }

  next();
};

// Check ownership or admin
const checkOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('Authentication required', 401));
  }

  const userId = req.params.userId || req.params.id;
  const userRole = req.user.role || 'user';

  if (userRole !== 'admin' && req.user.id !== userId) {
    return res.status(403).json(errorResponse('You can only access your own data', 403));
  }

  next();
};

module.exports = {
  authorize,
  isAdmin,
  isModerator,
  checkOwnershipOrAdmin
};
