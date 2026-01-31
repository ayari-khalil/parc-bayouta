const express = require('express');
const router = express.Router();

// Defined routes will be mounted here
// const authRoute = require('./auth.route');
// router.use('/auth', authRoute);

router.get('/health', (req, res) => {
    res.send('OK');
});

module.exports = router;
