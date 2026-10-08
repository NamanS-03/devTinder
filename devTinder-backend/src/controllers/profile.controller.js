const profileService = require('../services/profile.service');

// view logged in user profile
const view = async (req, res) => {
    const loggedInUser = req.user;

    res.status(200).json({
        message: loggedInUser.firstName + " details ",
        data: loggedInUser
    })
}

// edit profile of logged in user
const editDetails = async (req, res) => {
    const updatedUser = await profileService.updateProfile(req.user._id, req.body);

    res.status(200).json({
        message: "Profile Updated Successfully",
        data: updatedUser
    })
}

// update password of a loggedInUser
const updatePassword = async (req, res) => {
    await profileService.updatePassword(req.user, req.body);

    res.status(200).json({
        message: "Password Updated Successfully"
    })
}

module.exports = {
    view,
    editDetails,
    updatePassword
}
