const express = require('express');
const router = express.Router();
const {
    sendConnectionRequest,
    acknowledgeConnectionRequest
} = require('../controller/requestController');
const { peopleAuth } = require('../middleware/authMiddleware');

// sending connection to other users -- status --> ignored/interested
router.post('/send/:status/:toUserId', peopleAuth, sendConnectionRequest);

// receiving/acknowledging the received connection requests -- status --> accepted/rejected
router.post('/receive/:status/:requestId', peopleAuth, acknowledgeConnectionRequest);

module.exports = router;
