const express = require('express');
const router = express.Router();
const { getContactFields, testApi } = require('../controllers/miscController');


router.get('/contact-fields', getContactFields);
router.get('/test-api', testApi);

module.exports = router;
