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

// POST /api/messages
// Submit a contact message
router.post('/', async (req, res, next) => {
    try {
        const message = await ContactMessage.create(req.body);
        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/messages/:id
// Update message status
router.patch('/:id', async (req, res, next) => {
    try {
        const message = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/messages/:id
// Delete a message
router.delete('/:id', async (req, res, next) => {
    try {
        const message = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
