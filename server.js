const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const { exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Content Security Policy - Allow all resources including data URIs
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "script-src * 'unsafe-inline' 'unsafe-eval'; " +
    "style-src * 'unsafe-inline'; " +
    "img-src * data: blob: 'unsafe-inline'; " +
    "font-src * data:; " +
    "connect-src *;"
  );
  next();
});

// Rate limiting
const rateLimit = require('express-rate-limit');
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API || 300),
  message: 'Too many requests, please try again later',
  skip: (req, res) => {
    // Skip rate limiting for static files
    return req.path.match(/^\/css|^\/js|^\/img|^\/lib|^\/public/);
  }
});

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_LOGIN || 5),
  message: 'Too many login attempts, please try again later'
});

// Apply general limiter to API routes only
app.use('/api', generalLimiter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(methodOverride('_method'));

// Session configuration (use memory store for now)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Make user/admin available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || req.session.admin || null;
  res.locals.cartCount = 0;
  res.locals.cartTotal = 0;
  next();
});

// RESTful API Routes (v1)
app.use('/api/v1', require('./routes/api/v1'));

// Legacy routes (for backward compatibility with frontend)
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));

// 404 handler for views
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// File flag để kiểm tra xem đã mở trình duyệt chưa
const browserFlagFile = path.join(__dirname, '.browser-opened');

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  const clickableLink = `\u001b]8;;${url}\u001b\\${url}\u001b]8;;\u001b\\`;
  console.log(clickableLink);

  // Chỉ mở trình duyệt lần đầu tiên, không mở lại khi nodemon restart
  if (!fs.existsSync(browserFlagFile)) {
    fs.writeFileSync(browserFlagFile, '1');
    const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    setTimeout(() => {
      exec(`${start} ${url}`);
    }, 1000);
  }
});

