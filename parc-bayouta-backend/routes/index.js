const express = require('express');
const hallReservationRoute = require('./hallReservation.route');
const fieldReservationRoute = require('./fieldReservation.route');
const menuRoute = require('./menu.route');
const uploadRoute = require('./upload.route');
const analyticsRoute = require('./analytics.route');
const eventRoute = require('./event.route');
const contactRoute = require('./contact.route');
const auditRoute = require('./audit.route');
const orderRoute = require('./order.route');
const notificationRoute = require('./notification.route');
const settingRoute = require('./setting.route');
const router = express.Router();

router.use('/hall-reservations', hallReservationRoute);
router.use('/field-reservations', fieldReservationRoute);
router.use('/menu', menuRoute);
router.use('/upload', uploadRoute);
router.use('/analytics', analyticsRoute);
router.use('/events', eventRoute);
router.use('/messages', contactRoute);
router.use('/audit', auditRoute);
router.use('/orders', orderRoute);
router.use('/notifications', notificationRoute);
router.use('/settings', settingRoute);

router.get('/health', (req, res) => {
    res.send('OK');
});

module.exports = router;
