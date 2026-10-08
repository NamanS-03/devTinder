const connectionRequestRepository = require('../repositories/connectionRequest.repository');
const peopleRepository = require('../repositories/people.repository');
const { USER_PUBLIC_FIELDS } = require('../constants');

const getReceivedRequests = async (userId) => {
    return connectionRequestRepository.findPendingForReceiver(userId, USER_PUBLIC_FIELDS);
}

const getConnections = async (userId) => {
    const connectionRequests = await connectionRequestRepository.findAcceptedForUser(userId, USER_PUBLIC_FIELDS);

    // each accepted request holds both users - return only the other person,
    // the frontend already knows who the logged in user is
    // (a null entry means that user's account no longer exists, so skip it)
    return connectionRequests
        .map((row) => {
            if(row.fromUserId && row.fromUserId._id.equals(userId)) {
                return row.toUserId;
            }
            return row.fromUserId;
        })
        .filter(Boolean);
}

// everyone except the user themselves and anyone they already have a
// request with (in any status, in either direction)
const getFeed = async (userId, { skip, limit }) => {
    const existingConnections = await connectionRequestRepository.findAllInvolvingUser(userId);

    const excludedIds = new Set([userId.toString()]);
    existingConnections.forEach((connection) => {
        excludedIds.add(connection.fromUserId.toString());
        excludedIds.add(connection.toUserId.toString());
    });

    return peopleRepository.findExcluding({
        excludedIds: Array.from(excludedIds),
        fields: USER_PUBLIC_FIELDS,
        skip,
        limit
    });
}

module.exports = {
    getReceivedRequests,
    getConnections,
    getFeed
}
