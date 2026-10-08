const express = require('express');
const router = express.Router();
const { sendConnectionRequest, acknowledgeConnectionRequest } = require('../controllers/request.controller');
const { validateSendRequest, validateReviewRequest } = require('../validators/request.validator');
const { peopleAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.use(peopleAuth);

// sending connection to other users -- status --> ignored/interested
router.post('/send/:status/:toUserId', validate(validateSendRequest), sendConnectionRequest);

// receiving/acknowledging the received connection requests -- status --> accepted/rejected
router.post('/receive/:status/:requestId', validate(validateReviewRequest), acknowledgeConnectionRequest);

module.exports = router;
