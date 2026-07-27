const ConnectionRequest = require('../models/connectionRequest');
const People = require('../models/people');

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

module.exports = {
    sendConnectionRequest
}