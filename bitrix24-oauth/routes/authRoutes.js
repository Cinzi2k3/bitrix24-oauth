const express = require('express');
const router = express.Router();
const { installApp, handleCallback, bitrixInstallHandler } = require('../controllers/authController');

router.get('/install', installApp);
router.get('/callback', handleCallback);
router.post('/', bitrixInstallHandler);

module.exports = router;
