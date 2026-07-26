const express = require('express');
const { peopleAuth } = require('../middleware/authMiddleware');
const router = express.Router();
const {
    view,
    editDetails,
    updatePassword
} = require('../controller/profileController');

// GET API for viewing logged in user profile 
router.get('/view', peopleAuth, view);

// PATCH API for updating the profile of logged in user
router.patch('/updateProfile', peopleAuth, editDetails);

// PATCH API to update the password
router.patch('/updatePassword', peopleAuth, updatePassword);
module.exports = router;