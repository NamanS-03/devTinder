const userService = require('../services/user.service');
const { getPagination } = require('../utils/pagination');

const pendingConnectionRequest = async (req, res) => {
    const connectionRequests = await userService.getReceivedRequests(req.user._id);

    res.status(200).json({
        message: "Data Fetched Successfully",
        data: connectionRequests
    })
}

const acceptedConnectionRequest = async (req, res) => {
    const data = await userService.getConnections(req.user._id);

    res.status(200).json({
        message: req.user.firstName + "'s Connections ",
        data
    })
}

const feed = async (req, res) => {
    const pagination = getPagination(req.query);
    const loggedInUserFeed = await userService.getFeed(req.user._id, pagination);

    res.status(200).json({
        loggedInUserFeed,
        page: pagination.page,
        limit: pagination.limit
    })
}

module.exports = {
    pendingConnectionRequest,
    acceptedConnectionRequest,
    feed
}
