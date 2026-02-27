const express = require('express');
const { fieldReservationService } = require('../services');

const router = express.Router();

router.get('/fields', async (req, res) => {
    try {
        const fields = await fieldReservationService.getFields();
        res.send(fields);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.patch('/fields/:fieldId', async (req, res) => {
    try {
        const field = await fieldReservationService.updateFieldById(req.params.fieldId, req.body);
        res.send(field);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router
    .route('/')
    .post(async (req, res) => {
        try {
            const reservation = await fieldReservationService.createReservation(req.body);
            res.status(201).send(reservation);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    })
    .get(async (req, res) => {
        try {
            const result = await fieldReservationService.getAllReservations();
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

router
    .route('/:reservationId')
    .get(async (req, res) => {
        try {
            const reservation = await fieldReservationService.getReservationById(req.params.reservationId);
            if (!reservation) {
                return res.status(404).send({ message: 'Reservation not found' });
            }
            res.send(reservation);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    })
    .patch(async (req, res) => {
        try {
            const reservation = await fieldReservationService.updateReservationById(req.params.reservationId, req.body);
            res.send(reservation);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    })
    .delete(async (req, res) => {
        try {
            await fieldReservationService.deleteReservationById(req.params.reservationId);
            res.status(204).send();
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    });

module.exports = router;
