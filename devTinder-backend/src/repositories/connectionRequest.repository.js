const ConnectionRequest = require('../models/connectionRequest.model');
const { CONNECTION_STATUS } = require('../constants');

// All database access for the ConnectionRequest collection lives here.

const create = async (data) => {
    return ConnectionRequest.create(data);
}

// any request between the two users, in either direction
const findBetweenUsers = async (userIdA, userIdB) => {
    return ConnectionRequest.findOne({
        $or: [
            { fromUserId: userIdA, toUserId: userIdB },
            { fromUserId: userIdB, toUserId: userIdA }
        ]
    });
}

// a request still waiting on this receiver's decision
const findPendingByIdForReceiver = async (requestId, receiverId) => {
    return ConnectionRequest.findOne({
        _id: requestId,
        toUserId: receiverId,
        status: CONNECTION_STATUS.INTERESTED
    });
}

const updateStatus = async (connectionRequest, status) => {
    connectionRequest.status = status;
    return connectionRequest.save();
}

const findPendingForReceiver = async (receiverId, populateFields) => {
    return ConnectionRequest.find({
        toUserId: receiverId,
        status: CONNECTION_STATUS.INTERESTED
    })
    .populate("fromUserId", populateFields)
    .populate("toUserId", populateFields);
}

const findAcceptedForUser = async (userId, populateFields) => {
    return ConnectionRequest.find({
        $or: [
            { fromUserId: userId },
            { toUserId: userId }
        ],
        status: CONNECTION_STATUS.ACCEPTED
    })
    .populate("fromUserId", populateFields)
    .populate("toUserId", populateFields);
}

// every request the user sent or received, only the two user ids
const findAllInvolvingUser = async (userId) => {
    return ConnectionRequest.find({
        $or: [
            { fromUserId: userId },
            { toUserId: userId }
        ]
    })
    .select("fromUserId toUserId")
    .lean();
}

module.exports = {
    create,
    findBetweenUsers,
    findPendingByIdForReceiver,
    updateStatus,
    findPendingForReceiver,
    findAcceptedForUser,
    findAllInvolvingUser
}
