const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const productsController = require('../../controllers/productsController');
const { isAuthenticated } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/authorizeMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Public endpoints
router.get('/featured', productsController.getFeaturedProducts);
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductDetail);

// Admin endpoints
router.post('/', isAuthenticated, isAdmin, upload.array('images', 10), productsController.createProduct);
router.put('/:id', isAuthenticated, isAdmin, upload.array('images', 10), productsController.updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, productsController.deleteProduct);
router.put('/:id/stock', isAuthenticated, isAdmin, productsController.updateStock);

module.exports = router;
