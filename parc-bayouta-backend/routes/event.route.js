const express = require('express');
const router = express.Router();
const { eventService } = require('../services');

// --- EVENT ROUTES ---

// GET /api/events
router.get('/', async (req, res, next) => {
    try {
        const events = await eventService.queryEvents();
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
});

// POST /api/events
router.post('/', async (req, res, next) => {
    try {
        const event = await eventService.createEvent(req.body);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/events/:eventId
router.patch('/:eventId', async (req, res, next) => {
    try {
        const event = await eventService.updateEventById(req.params.eventId, req.body);
        res.status(200).json(event);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/events/:eventId
router.delete('/:eventId', async (req, res, next) => {
    try {
        await eventService.deleteEventById(req.params.eventId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// --- RESERVATION ROUTES ---

// GET /api/events/reservations
router.get('/reservations', async (req, res, next) => {
    try {
        const reservations = await eventService.queryReservations();
        res.status(200).json(reservations);
    } catch (error) {
        next(error);
    }
});

// POST /api/events/reservations
router.post('/reservations', async (req, res, next) => {
    try {
        const reservation = await eventService.createReservation(req.body);
        res.status(201).json(reservation);
    } catch (error) {
        next(error);
    }
});

// PATCH /api/events/reservations/:reservationId/status
router.patch('/reservations/:reservationId/status', async (req, res, next) => {
    try {
        const reservation = await eventService.updateReservationStatus(req.params.reservationId, req.body.status);
        res.status(200).json(reservation);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/events/reservations/:reservationId
router.delete('/reservations/:reservationId', async (req, res, next) => {
    try {
        await eventService.deleteReservationById(req.params.reservationId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
