const express = require('express');
const hallReservationRoute = require('./hallReservation.route');
const fieldReservationRoute = require('./fieldReservation.route');
const menuRoute = require('./menu.route');
const router = express.Router();

router.use('/hall-reservations', hallReservationRoute);
router.use('/field-reservations', fieldReservationRoute);
router.use('/menu', menuRoute);

router.get('/health', (req, res) => {
    res.send('OK');
});

module.exports = router;
