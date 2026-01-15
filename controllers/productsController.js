const Product = require('../models/Product');
const Category = require('../models/Category');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');

// Create product (Admin only) - POST /api/v1/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount_price, stock, category_id, brand, specs } = req.body;

    if (!name || !price) {
      return res.status(400).json(
        errorResponse('Name and price are required', 400)
      );
    }

    // Handle multiple image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/img/${file.filename}`);
      });
    } else if (req.file) {
      images.push(`/img/${req.file.filename}`);
    }

    const product = new Product({
      name,
      description: description || null,
      price: parseFloat(price),
      discount_price: discount_price ? parseFloat(discount_price) : null,
      stock: parseInt(stock) || 0,
      category_id: category_id || null,
      brand: brand || null,
      images,
      image_url: images[0] || null, // For backward compatibility
      specs: specs ? JSON.parse(specs) : {},
      created_by_admin: req.user.id
    });

    await product.save();

    return res.status(201).json(
      successResponse(product, 'Product created successfully', 201)
    );
  } catch (error) {
    next(error);
  }
};

// Get all products - GET /api/v1/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      inStock,
      brand,
      sort = '-created_at'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter (including subcategories)
    if (category) {
      const categories = await Category.find({
        $or: [
          { _id: category },
          { parentId: category }
        ],
        isDeleted: false
      }).select('_id');

      const categoryIds = categories.map(c => c._id);
      filter.category_id = { $in: categoryIds };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Stock availability filter
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Parse sort parameter
    const sortObj = {};
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    });

    const products = await Product.find(filter)
      .populate('category_id')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortObj || { created_at: -1 });

    const total = await Product.countDocuments(filter);

    return res.status(200).json(
      paginatedResponse(products, parseInt(page), parseInt(limit), total, 'Products retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Get featured products - GET /api/v1/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate('category_id')
      .sort({ sold: -1, created_at: -1 })
      .limit(10);

    return res.status(200).json(
      successResponse(products, 'Featured products retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Get product by ID or slug - GET /api/v1/products/:id
exports.getProductDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product;
    // Try to find by ID first, then by slug
    product = await Product.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ],
      isDeleted: false
    }).populate('category_id').populate('reviews');

    if (!product) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }

    return res.status(200).json(
      successResponse(product, 'Product retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Update product (Admin only) - PUT /api/v1/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount_price, stock, category_id, brand, specs } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (discount_price) product.discount_price = parseFloat(discount_price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category_id) product.category_id = category_id;
    if (brand) product.brand = brand;
    if (specs) product.specs = JSON.parse(specs);

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        product.images.push(`/img/${file.filename}`);
      });
      product.image_url = product.images[0];
    } else if (req.file) {
      product.images.push(`/img/${req.file.filename}`);
      product.image_url = product.images[0];
    }

    await product.save();

    return res.status(200).json(
      successResponse(product, 'Product updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete product (Admin only) - DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }

    // Soft delete
    product.isDeleted = true;
    await product.save();

    return res.status(200).json(
      successResponse(null, 'Product deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update product stock - PUT /api/v1/products/:id/stock
exports.updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json(errorResponse('Product not found', 404));
    }

    product.stock = parseInt(quantity);
    await product.save();

    return res.status(200).json(
      successResponse(product, 'Stock updated successfully')
    );
  } catch (error) {
    next(error);
  }
};
