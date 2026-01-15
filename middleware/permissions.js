// Middleware to check permissions
const hasPermission = (module, action) => {
  return (req, res, next) => {
    const user = req.session && req.session.user;
    
    // Super admin (role === 'admin') has all permissions
    if (user && user.role === 'admin') {
      return next();
    }
    
    // Check if user has the specific permission
    if (user && user.permissions && user.permissions[module] && user.permissions[module][action]) {
      return next();
    }
    
    res.status(403).send(`Bạn không có quyền ${action} ${module}.`);
  };
};

module.exports = {
  hasPermission
};

