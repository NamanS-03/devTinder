const express = require('express');
const { peopleAuth } = require('../middleware/authMiddleware');
const router = express.Router();
const {
    view
} = require('../controller/profileController');

router.get('/view', peopleAuth, view);

module.exports = router;