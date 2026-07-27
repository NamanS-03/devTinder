const express = require("express");
const router = express.Router();
const { peopleAuth } = require('../middleware/authMiddleware')
const { 
    pendingConnectionRequest,
    acceptedConnectionRequest
} = require('../controller/userController')

// getting the list of all the pending requests for the logged in user
router.get('/receivedRequest', peopleAuth, pendingConnectionRequest);

// getting the list of my connections 
router.get('/myConnections', peopleAuth, acceptedConnectionRequest);

module.exports = router;