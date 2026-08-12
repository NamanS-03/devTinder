const express = require('express');
const router = express.Router();
const { 
    signup,
    login,
    logout
} = require('../controller/authController');
// 1. signup API
router.post('/signup', signup);

// 2. login API
router.post('/login', login);

// 3. logout API
// Not gated behind peopleAuth: logout's job is to clear the cookie, and it
// must succeed even if the token is missing/expired. The controller still
// best-effort identifies the user from the token for logging purposes.
router.post('/logout', logout);

module.exports = router;