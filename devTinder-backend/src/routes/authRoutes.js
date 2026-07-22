const express = require('express');
const router = express.Router();
const { 
    signup,
    login,
    logout
} = require('../controller/authController');
const { peopleAuth } = require("../middleware/authMiddleware");

// 1. signup API
router.post('/signup', signup);

// 2. login API
router.post('/login', login);

// 3. logout API
router.post('/logout', peopleAuth, logout);

module.exports = router;