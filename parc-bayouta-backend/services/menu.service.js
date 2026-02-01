const fs = require('fs');
const path = require('path');
const { MenuCategory, MenuItem } = require('../models/menu.model');

const logError = (error, context) => {
    const logPath = path.join(__dirname, '../error.log');
    const logMessage = `\n[${new Date().toISOString()}] ${context}\n${error.message}\n${error.stack}\n`;
    fs.appendFileSync(logPath, logMessage);
};

/**
 * Get all categories sorted by order
 * @returns {Promise<Array>}
 */
const getAllCategories = async () => {
    return await MenuCategory.find().sort({ order: 1 });
};

/**
 * Get category by ID
 * @param {string} categoryId
 * @returns {Promise<Object>}
 */
const getCategoryById = async (categoryId) => {
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

/**
 * Create a new category
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
const createCategory = async (categoryData) => {
    try {
        console.log('Creating category with data:', categoryData);
        // Get the highest order number and increment
        const maxOrder = await MenuCategory.findOne().sort({ order: -1 }).select('order');
        const order = maxOrder ? maxOrder.order + 1 : 1;

        const category = new MenuCategory({
            ...categoryData,
            order
        });

        const savedCategory = await category.save();
        console.log('Category saved successfully:', savedCategory);
        return savedCategory;
    } catch (error) {
        console.error('Error in createCategory service:', error);
        logError(error, 'createCategory');
        throw error;
    }
};

/**
 * Update a category
 * @param {string} categoryId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
const updateCategory = async (categoryId, updateData) => {
    const category = await MenuCategory.findByIdAndUpdate(
        categoryId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new Error('Category not found');
    }

    return category;
};

/**
 * Delete a category
 * @param {string} categoryId
 * @returns {Promise<Object>}
 */
const deleteCategory = async (categoryId) => {
    const category = await MenuCategory.findByIdAndDelete(categoryId);

    if (!category) {
        throw new Error('Category not found');
    }

    // Delete all items in this category
    await MenuItem.deleteMany({ category: categoryId });

    return category;
};

/**
 * Reorder categories
 * @param {Array} categoryOrders - Array of {id, order}
 * @returns {Promise<Array>}
 */
const reorderCategories = async (categoryOrders) => {
    const updatePromises = categoryOrders.map(({ id, order }) =>
        MenuCategory.findByIdAndUpdate(id, { order }, { new: true })
    );

    return await Promise.all(updatePromises);
};

/**
 * Get all menu items with optional filters
 * @param {Object} filters - { categoryId, isActive }
 * @returns {Promise<Array>}
 */
const getAllMenuItems = async (filters = {}) => {
    const query = {};

    if (filters.categoryId) {
        query.category = filters.categoryId;
    }

    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
    }

    return await MenuItem.find(query)
        .populate('category', 'name icon')
        .sort({ category: 1, name: 1 });
};

/**
 * Get menu item by ID
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
const getMenuItemById = async (itemId) => {
    const item = await MenuItem.findById(itemId).populate('category', 'name icon');
    if (!item) {
        throw new Error('Menu item not found');
    }
    return item;
};

/**
 * Create a new menu item
 * @param {Object} itemData
 * @returns {Promise<Object>}
 */
const createMenuItem = async (itemData) => {
    // Verify category exists
    const category = await MenuCategory.findById(itemData.category);
    if (!category) {
        throw new Error('Category not found');
    }

    const item = new MenuItem(itemData);
    return await item.save();
};

/**
 * Update a menu item
 * @param {string} itemId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
const updateMenuItem = async (itemId, updateData) => {
    // If category is being updated, verify it exists
    if (updateData.category) {
        const category = await MenuCategory.findById(updateData.category);
        if (!category) {
            throw new Error('Category not found');
        }
    }

    const item = await MenuItem.findByIdAndUpdate(
        itemId,
        updateData,
        { new: true, runValidators: true }
    ).populate('category', 'name icon');

    if (!item) {
        throw new Error('Menu item not found');
    }

    return item;
};

/**
 * Toggle menu item active status
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
const toggleMenuItemActive = async (itemId) => {
    const item = await MenuItem.findById(itemId);

    if (!item) {
        throw new Error('Menu item not found');
    }

    item.isActive = !item.isActive;
    return await item.save();
};

/**
 * Delete a menu item
 * @param {string} itemId
 * @returns {Promise<Object>}
 */
const deleteMenuItem = async (itemId) => {
    const item = await MenuItem.findByIdAndDelete(itemId);

    if (!item) {
        throw new Error('Menu item not found');
    }

    return item;
};

module.exports = {
    // Category operations
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,

    // Menu item operations
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    toggleMenuItemActive,
    deleteMenuItem
};
