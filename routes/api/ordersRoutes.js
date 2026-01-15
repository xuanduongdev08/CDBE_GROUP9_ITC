const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/ordersController');
const { isAuthenticated } = require('../../middleware/authMiddleware');
const { isModerator } = require('../../middleware/authorizeMiddleware');

// User endpoints
router.post('/', isAuthenticated, ordersController.createOrder);
router.get('/', isAuthenticated, ordersController.getOrders);
router.get('/:id', isAuthenticated, ordersController.getOrderDetail);
router.delete('/:id', isAuthenticated, ordersController.cancelOrder);

// Admin/Moderator endpoints
router.patch('/:id/status', isAuthenticated, isModerator, ordersController.updateOrderStatus);

module.exports = router;
