const express = require('express');
const notificationService = require('../services/notification.service');

const router = express.Router();

/**
 * POST /api/notifications/call-waiter
 * Call a waiter
 */
router.post('/call-waiter', async (req, res, next) => {
    try {
        const { tableNumber } = req.body;
        const notification = await notificationService.callWaiter(tableNumber);
        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/notifications/request-bill
 * Request the bill
 */
router.post('/request-bill', async (req, res, next) => {
    try {
        const { tableNumber } = req.body;
        const notification = await notificationService.requestBill(tableNumber);
        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/notifications
 * Get all notifications
 */
router.get('/', async (req, res, next) => {
    try {
        const notifications = await notificationService.getAllNotifications();
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id);
        res.json(notification);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
