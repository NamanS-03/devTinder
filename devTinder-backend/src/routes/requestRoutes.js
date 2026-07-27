const express = require('express');
const router = express.Router();
const {
    sendConnectionRequest
} = require('../controller/requestController');
const { peopleAuth } = require('../middleware/authMiddleware');

// sending connection to other users -- status --> ignored/interested
router.post('/send/:status/:toUserId', peopleAuth, sendConnectionRequest);

module.exports = router;
