const express = require('express');
const router = express.Router();
const { Event } = require('../models/event.model');

// GET /api/events
// Get all events
router.get('/', async (req, res, next) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
});

// POST /api/events
// Create a new event
router.post('/', async (req, res, next) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
