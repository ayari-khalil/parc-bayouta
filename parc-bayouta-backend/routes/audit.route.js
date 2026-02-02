const express = require('express');
const router = express.Router();
const Audit = require('../models/audit.model');

// GET /api/audit
// Fetch all audit logs
router.get('/', async (req, res, next) => {
    try {
        const logs = await Audit.find().sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        next(error);
    }
});

// POST /api/audit
// Record a new audit log
router.post('/', async (req, res, next) => {
    try {
        const log = await Audit.create(req.body);
        res.status(201).json(log);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
