const ConnectionRequest = require('../models/connectionRequest');
const People = require('../models/people');

// controller for sending the connection request to other users
const sendConnectionRequest = async (req, res) => {
    try {
        // extracting details from the body and URL
        const loggedInUser = req.user;
        const fromUserId = loggedInUser._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // API level validations - 
        // checking whether toUserId exists in the db or not 
        const receiver = await People.findById({ _id: toUserId});
        if(!receiver) {
            return receiver.status(400).json({
                message: "User Not Found",
                status: false
            })
        }

        // checking whether status is either ignored or interested
        const ALLOWED_STATUS = ["ignored", "interested"];
        if(!ALLOWED_STATUS.includes(status)) {
            throw new Error("Invalid Status Type");
        }

        // checking for existing connection requests 
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId},
                { fromUserId: toUserId, toUserId: fromUserId}
            ]
        })
        if(existingConnectionRequest) {
            throw new Error("Connection Request already exists");
        }

        // checking whether connection request in not being to ourself only -- for this we have pre middleware
        // creating the instance of ConnectionRequest for saving the CR's data -- using create method 
        const connectionRequestInstance = await ConnectionRequest.create({
            fromUserId,
            toUserId,
            status
        })

        res.status(200).json({
            message: "Connection Request Sent Successfully",
            data: connectionRequestInstance
        })
        
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

// controller to acknowledge the connection requests received from other users
const acknowledgeConnectionRequest = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const ALLOWED_STATUS = ["accepted", "rejected"];
        if(!ALLOWED_STATUS.includes(status)) {
            throw new Error("Invalid Status Type");
        }

        const connectionRequestInstance = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
        if(!connectionRequestInstance) {
            return res.status(400).json({
                message: "Connection Request Not Found"
            })
        }

        connectionRequestInstance.status = status;
        const data = await connectionRequestInstance.save();

        res.status(200).json({
            message: "Connection Request " + status,
            data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

module.exports = {
    sendConnectionRequest,
    acknowledgeConnectionRequest
}