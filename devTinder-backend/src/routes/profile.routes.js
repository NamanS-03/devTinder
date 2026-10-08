const express = require('express');
const router = express.Router();
const { view, editDetails, updatePassword } = require('../controllers/profile.controller');
const { validateEditProfile, validateUpdatePassword } = require('../validators/profile.validator');
const { peopleAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// every profile route needs a logged in user
router.use(peopleAuth);

// GET API for viewing logged in user profile
router.get('/view', view);

// PATCH API for updating the profile of logged in user
router.patch('/updateProfile', validate(validateEditProfile), editDetails);

// PATCH API to update the password
router.patch('/updatePassword', validate(validateUpdatePassword), updatePassword);

module.exports = router;
