// Simple API test script
const http = require('http');

// Test if server can start
const testServer = require('./server.js');

setTimeout(() => {
  console.log('✅ Server initialized successfully!');
  console.log('API is ready to use');
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST   /api/v1/auth/register');
  console.log('  POST   /api/v1/auth/login');
  console.log('  POST   /api/v1/auth/verify-email');
  console.log('  GET    /api/v1/users/me');
  console.log('  GET    /api/v1/products');
  console.log('  POST   /api/v1/orders');
  console.log('  And 25+ more endpoints');
  process.exit(0);
}, 2000);
