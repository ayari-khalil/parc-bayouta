const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/contact.model');

// GET /api/messages
// Get all contact messages
router.get('/', async (req, res, next) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
