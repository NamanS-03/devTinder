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

const acceptedConnectionRequest = async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted"},
                { toUserId: loggedInUser._id, status: "accepted"}
            ]
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        if(!connectionRequests) {
            return res.status(400).json({
                message: "No Connections Present"
            })
        }

        // need to understand this
        // need filtering because we only need the data of loggedInUSer's connection and there is no need to send the information about 
        // loggedInUser to the frontend. 
        const data = connectionRequests.map((row) => {
            if(row.fromUserId._id.toString() == loggedInUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        })

        res.status(200).json({
            message: loggedInUser.firstName + "'s Connections ",
            data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = {
    pendingConnectionRequest,
    acceptedConnectionRequest
}