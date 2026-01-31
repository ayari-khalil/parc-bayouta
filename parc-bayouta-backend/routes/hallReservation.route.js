const express = require('express');
const hallReservationService = require('../services/hallReservation.service');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const reservation = await hallReservationService.createReservation(req.body);
        res.status(201).send(reservation);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const reservations = await hallReservationService.getAllReservations();
        res.send(reservations);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.patch('/:reservationId', async (req, res) => {
    try {
        const reservation = await hallReservationService.updateReservationById(req.params.reservationId, req.body);
        res.send(reservation);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.delete('/:reservationId', async (req, res) => {
    try {
        await hallReservationService.deleteReservationById(req.params.reservationId);
        res.status(204).send();
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
