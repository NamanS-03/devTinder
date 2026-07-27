const express = require("express");
const router = express.Router();
const { peopleAuth } = require('../middleware/authMiddleware')
const { 
    pendingConnectionRequest
} = require('../controller/userController')

// getting the list of all the pending requests for the logged in user
router.get('/receivedRequest', peopleAuth, pendingConnectionRequest);

module.exports = router;