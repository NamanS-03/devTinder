const ConnectionRequest = require('../models/connectionRequest');
const People = require('../models/people');

const USER_SAFE_DATA = "firstName lastName";

const pendingConnectionRequest = async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        if(!connectionRequests) {
            return res.status(400).json({
                message: "No Pending Requests"
            })
        }
        
        res.status(200).json({
            message: "Data Fetched Successfully",
            data: connectionRequests
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = {
    pendingConnectionRequest
}