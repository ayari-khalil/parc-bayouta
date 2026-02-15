const express = require('express');
const orderService = require('../services/order.service');

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/orders
 * Get all orders
 */
router.get('/', async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
router.patch('/:id/status', async (req, res, next) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body);
        res.json(order);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
