const express = require('express');
const router = express.Router();
const categoriesController = require('../../controllers/categoriesController');
const { isAuthenticated } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/authorizeMiddleware');

// Public endpoints
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryDetail);

// Admin endpoints
router.post('/', isAuthenticated, isAdmin, categoriesController.createCategory);
router.put('/:id', isAuthenticated, isAdmin, categoriesController.updateCategory);
router.delete('/:id', isAuthenticated, isAdmin, categoriesController.deleteCategory);

module.exports = router;
