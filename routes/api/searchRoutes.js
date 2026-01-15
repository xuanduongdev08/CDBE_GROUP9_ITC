const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');
const { isAuthenticated } = require('../../middleware/authMiddleware');
const { isModerator, isAdmin } = require('../../middleware/authorizeMiddleware');

// Public search
router.get('/products', searchController.searchProducts);

// Admin/Moderator search
router.get('/orders', isAuthenticated, isModerator, searchController.searchOrders);

// Admin search
router.get('/users', isAuthenticated, isAdmin, searchController.searchUsers);

module.exports = router;
