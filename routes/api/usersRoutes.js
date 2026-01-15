const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const { isAuthenticated } = require('../../middleware/authMiddleware');
const { isAdmin, checkOwnershipOrAdmin } = require('../../middleware/authorizeMiddleware');

// Get current user (Protected)
router.get('/me', isAuthenticated, usersController.getCurrentUser);

// Update current user (Protected)
router.put('/me', isAuthenticated, usersController.updateCurrentUser);

// Admin endpoints
router.post('/', isAuthenticated, isAdmin, usersController.createUser);
router.get('/', isAuthenticated, isAdmin, usersController.listUsers);
router.get('/:id', isAuthenticated, isAdmin, usersController.getUserById);
router.put('/:id', isAuthenticated, isAdmin, usersController.updateUser);
router.delete('/:id', isAuthenticated, isAdmin, usersController.deleteUser);

module.exports = router;
