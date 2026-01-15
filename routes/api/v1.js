const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usersRoutes = require('./usersRoutes');
const productsRoutes = require('./productsRoutes');
const categoriesRoutes = require('./categoriesRoutes');
const ordersRoutes = require('./ordersRoutes');
const searchRoutes = require('./searchRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/orders', ordersRoutes);
router.use('/search', searchRoutes);

module.exports = router;
