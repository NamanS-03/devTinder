const People = require('../models/people');
const { peopleAuth } = require('../middleware/authMiddleware');
const { editDetailsValidation } = require('../utils/validation');

// view logged in user profile 
const view = async (req, res) => {
    try {
        const loggedInUser = req.user;
        res.status(200).json({
            message: loggedInUser.firstName + " details ",
            data: loggedInUser
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

// edit profile of logged in user 
const editDetails = async (req, res) => {
    try {
        if(!editDetailsValidation) {
            throw new Error("Invalid Field In Request Body")
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
        await loggedInUser.save();
        res.status(200).json({
            message: "Profile Updated Successfully",
            data: loggedInUser
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = {
    view,
    editDetails
}