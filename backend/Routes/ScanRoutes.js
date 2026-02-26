const express = require('express');
const scanController = require('../Controllers/ScanController');
const validateUrl = require('../Middleware/validateUrl');

const router = express.Router();

router.post('/scan', validateUrl, scanController);

module.exports = router;
