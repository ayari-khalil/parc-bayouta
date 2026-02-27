const express = require('express');
const hallReservationService = require('../services/hallReservation.service');

const hallService = require('../services/hall.service');

const router = express.Router();

router.get('/halls', async (req, res) => {
    try {
        const halls = await hallService.getAllHalls();
        res.send(halls);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.patch('/halls/:hallId', async (req, res) => {
    try {
        const hall = await hallService.updateHallById(req.params.hallId, req.body);
        res.send(hall);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

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
        const filter = {};
        if (req.query.hall) {
            filter.hall = req.query.hall;
        }
        const reservations = await hallReservationService.getAllReservations(filter);
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
