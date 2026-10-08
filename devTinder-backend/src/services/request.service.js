const connectionRequestRepository = require('../repositories/connectionRequest.repository');
const peopleRepository = require('../repositories/people.repository');
const ApiError = require('../utils/ApiError');

// sending a connection request (ignored/interested) to another user
const sendRequest = async ({ fromUserId, toUserId, status }) => {
    if(fromUserId.equals(toUserId)) {
        throw ApiError.badRequest("Cannot Send Connection Request to Yourself");
    }

    const receiverExists = await peopleRepository.existsById(toUserId);
    if(!receiverExists) {
        throw ApiError.notFound("User Not Found");
    }

    // a request in either direction means these two have already interacted
    const existingConnectionRequest = await connectionRequestRepository.findBetweenUsers(fromUserId, toUserId);
    if(existingConnectionRequest) {
        throw ApiError.conflict("Connection Request already exists");
    }

    return connectionRequestRepository.create({
        fromUserId,
        toUserId,
        status
    });
}

// accepting/rejecting a request the logged in user received
const reviewRequest = async ({ receiverId, requestId, status }) => {
    const connectionRequest = await connectionRequestRepository.findPendingByIdForReceiver(requestId, receiverId);
    if(!connectionRequest) {
        throw ApiError.notFound("Connection Request Not Found");
    }

    return connectionRequestRepository.updateStatus(connectionRequest, status);
}

module.exports = {
    sendRequest,
    reviewRequest
}
