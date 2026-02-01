const express = require('express');
const menuService = require('../services/menu.service');

const router = express.Router();

// ============== CATEGORY ROUTES ==============

/**
 * GET /api/menu/categories
 * Get all categories
 */
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await menuService.getAllCategories();
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/menu/categories/:id
 * Get category by ID
 */
router.get('/categories/:id', async (req, res, next) => {
    try {
        const category = await menuService.getCategoryById(req.params.id);
        res.json(category);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/menu/categories
 * Create a new category
 */
router.post('/categories', async (req, res, next) => {
    try {
        const category = await menuService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/menu/categories/:id
 * Update a category
 */
router.put('/categories/:id', async (req, res, next) => {
    try {
        const category = await menuService.updateCategory(req.params.id, req.body);
        res.json(category);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/menu/categories/:id
 * Delete a category
 */
router.delete('/categories/:id', async (req, res, next) => {
    try {
        await menuService.deleteCategory(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/menu/categories/reorder
 * Reorder categories
 * Body: [{ id: string, order: number }]
 */
router.patch('/categories/reorder', async (req, res, next) => {
    try {
        const categories = await menuService.reorderCategories(req.body);
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// ============== MENU ITEM ROUTES ==============

/**
 * GET /api/menu/items
 * Get all menu items (admin view - all items)
 * Query params: categoryId, isActive
 */
router.get('/items', async (req, res, next) => {
    try {
        const filters = {};

        if (req.query.categoryId) {
            filters.categoryId = req.query.categoryId;
        }

        if (req.query.isActive !== undefined) {
            filters.isActive = req.query.isActive === 'true';
        }

        const items = await menuService.getAllMenuItems(filters);
        res.json(items);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/menu/items/public
 * Get only active menu items (client view)
 */
router.get('/items/public', async (req, res, next) => {
    try {
        const filters = { isActive: true };

        if (req.query.categoryId) {
            filters.categoryId = req.query.categoryId;
        }

        const items = await menuService.getAllMenuItems(filters);
        res.json(items);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/menu/items/:id
 * Get menu item by ID
 */
router.get('/items/:id', async (req, res, next) => {
    try {
        const item = await menuService.getMenuItemById(req.params.id);
        res.json(item);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/menu/items
 * Create a new menu item
 */
router.post('/items', async (req, res, next) => {
    try {
        const item = await menuService.createMenuItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/menu/items/:id
 * Update a menu item
 */
router.put('/items/:id', async (req, res, next) => {
    try {
        const item = await menuService.updateMenuItem(req.params.id, req.body);
        res.json(item);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/menu/items/:id/toggle
 * Toggle menu item active status
 */
router.patch('/items/:id/toggle', async (req, res, next) => {
    try {
        const item = await menuService.toggleMenuItemActive(req.params.id);
        res.json(item);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/menu/items/:id
 * Delete a menu item
 */
router.delete('/items/:id', async (req, res, next) => {
    try {
        await menuService.deleteMenuItem(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
