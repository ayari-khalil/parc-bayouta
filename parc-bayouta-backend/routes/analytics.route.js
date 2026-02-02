const express = require('express');
const router = express.Router();
const Analytics = require('../models/analytics.model');

// POST /api/analytics/visit
// Record a visit for today
router.post('/visit', async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Increment the count for today, or create if it doesn't exist
        const analytics = await Analytics.findOneAndUpdate(
            { date: today },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, count: analytics.count });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/today
// Get today's visit count
router.get('/today', async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const analytics = await Analytics.findOne({ date: today });

        res.status(200).json({
            success: true,
            count: analytics ? analytics.count : 0
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
