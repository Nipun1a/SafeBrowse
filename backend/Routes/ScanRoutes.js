const express = require('express');
const router = express.Router();

const scanController = require('../Controllers/ScanController');
const validateUrl = require('../Middleware/validateUrl');

router.post('/scan', validateUrl, scanController);

module.exports = router;

