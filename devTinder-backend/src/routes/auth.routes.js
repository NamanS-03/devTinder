const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/auth.controller');
const { validateSignup, validateLogin } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');

// 1. signup API
router.post('/signup', validate(validateSignup), signup);

// 2. login API
router.post('/login', validate(validateLogin), login);

// 3. logout API
// Not gated behind peopleAuth: logout's job is to clear the cookie, and it
// must succeed even if the token is missing/expired.
router.post('/logout', logout);

module.exports = router;
