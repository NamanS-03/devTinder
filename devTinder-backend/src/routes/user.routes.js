const express = require("express");
const router = express.Router();
const { pendingConnectionRequest, acceptedConnectionRequest, feed } = require('../controllers/user.controller');
const { peopleAuth } = require('../middlewares/auth.middleware');

router.use(peopleAuth);

// getting the list of all the pending requests for the logged in user
router.get('/receivedRequest', pendingConnectionRequest);

// getting the list of my connections
router.get('/myConnections', acceptedConnectionRequest);

// feed API for a logged in user -- supports ?page=&limit=
router.get('/feed', feed);

module.exports = router;
