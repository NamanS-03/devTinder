const express = require('express');
const router = express.Router();
const { 
    signup
} = require('../controller/authController');

// 1. signing up the new user (in our case people)
router.post('/signup', signup);

module.exports = router;