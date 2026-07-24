const People = require('../models/people');
const { peopleAuth } = require('../middleware/authMiddleware');

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

module.exports = {
    view
}