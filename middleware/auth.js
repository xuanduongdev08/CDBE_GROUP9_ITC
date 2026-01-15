// Middleware to check if user is authenticated (user thường, không phải admin)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user && !req.session.admin) {
    return next();
  }
  res.redirect('/auth/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  }
  res.redirect('/admin/login');
};

// Middleware to check if user is super admin (role === 'admin')
const isSuperAdmin = (req, res, next) => {
  const admin = req.session && req.session.admin;
  
  if (admin && admin.role === 'admin') {
    return next();
  }
  
  res.status(403).send('Bạn không có quyền truy cập trang này. Chỉ Admin mới có quyền này.');
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isSuperAdmin
};

