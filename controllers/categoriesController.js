const Category = require('../models/Category');
const Product = require('../models/Product');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseFormatter');

// Create category (Admin only) - POST /api/v1/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId, image } = req.body;

    if (!name) {
      return res.status(400).json(errorResponse('Category name is required', 400));
    }

    const existingCategory = await Category.findOne({ name, isDeleted: false });
    if (existingCategory) {
      return res.status(400).json(errorResponse('Category already exists', 400));
    }

    const category = new Category({
      name,
      description: description || null,
      parentId: parentId || null,
      image: image || null
    });

    await category.save();

    return res.status(201).json(
      successResponse(category, 'Category created successfully', 201)
    );
  } catch (error) {
    next(error);
  }
};

// Get all categories with tree structure - GET /api/v1/categories
exports.getAllCategories = async (req, res, next) => {
  try {
    // Get parent categories
    const parentCategories = await Category.find({
      parentId: null,
      isDeleted: false
    }).sort({ name: 1 });

    // Build tree structure
    const tree = await Promise.all(
      parentCategories.map(async (parent) => {
        const children = await Category.find({
          parentId: parent._id,
          isDeleted: false
        }).sort({ name: 1 });

        return {
          ...parent.toObject(),
          children
        };
      })
    );

    return res.status(200).json(
      successResponse(tree, 'Categories retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Get category by ID or slug - GET /api/v1/categories/:id
exports.getCategoryDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    let category;
    category = await Category.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ],
      isDeleted: false
    });

    if (!category) {
      return res.status(404).json(errorResponse('Category not found', 404));
    }

    // Get child categories
    const children = await Category.find({
      parentId: category._id,
      isDeleted: false
    }).sort({ name: 1 });

    // Get products in this category
    const products = await Product.find({
      category_id: category._id,
      isDeleted: false
    }).limit(20);

    const result = {
      ...category.toObject(),
      children,
      productCount: await Product.countDocuments({ category_id: category._id, isDeleted: false }),
      products
    };

    return res.status(200).json(
      successResponse(result, 'Category retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Update category (Admin only) - PUT /api/v1/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, parentId, image } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json(errorResponse('Category not found', 404));
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (image) category.image = image;

    await category.save();

    return res.status(200).json(
      successResponse(category, 'Category updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete category (Admin only) - DELETE /api/v1/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json(errorResponse('Category not found', 404));
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category_id: category._id,
      isDeleted: false
    });

    if (productCount > 0) {
      return res.status(400).json(
        errorResponse('Cannot delete category with products. Please reassign or delete products first.', 400)
      );
    }

    // Soft delete
    category.isDeleted = true;
    await category.save();

    // Also soft delete child categories
    await Category.updateMany(
      { parentId: category._id, isDeleted: false },
      { isDeleted: true }
    );

    return res.status(200).json(
      successResponse(null, 'Category deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
