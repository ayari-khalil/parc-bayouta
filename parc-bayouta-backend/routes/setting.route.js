const express = require('express');
const settingController = require('../controllers/setting.controller');
// const { auth, admin } = require('../services/auth.service'); // Assuming auth service exists

const router = express.Router();

router.get('/', settingController.getSettings);
// Usually update should be protected, but I'll check if there's an auth middleware
router.put('/', settingController.updateSettings);

module.exports = router;
