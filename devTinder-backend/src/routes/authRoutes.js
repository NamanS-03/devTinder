const express = require('express');
const router = express.Router();
const { 
    signup,
    login
} = require('../controller/authController');

// 1. signing up the new user (in our case people)
router.post('/signup', signup);

// 2. login API
router.post('/login', login);

module.exports = router;