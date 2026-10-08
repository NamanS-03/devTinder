const requestService = require('../services/request.service');

// controller for sending the connection request to other users
const sendConnectionRequest = async (req, res) => {
    const { status, toUserId } = req.params;

    const connectionRequest = await requestService.sendRequest({
        fromUserId: req.user._id,
        toUserId,
        status
    });

    res.status(201).json({
        message: "Connection Request Sent Successfully",
        data: connectionRequest
    })
}

// controller to acknowledge the connection requests received from other users
const acknowledgeConnectionRequest = async (req, res) => {
    const { status, requestId } = req.params;

    const data = await requestService.reviewRequest({
        receiverId: req.user._id,
        requestId,
        status
    });

    res.status(200).json({
        message: "Connection Request " + status,
        data
    })
}

module.exports = {
    sendConnectionRequest,
    acknowledgeConnectionRequest
}
