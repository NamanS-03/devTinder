const ApiError = require("../utils/ApiError");
const { SEND_REQUEST_STATUSES, REVIEW_REQUEST_STATUSES } = require("../constants");
const { assertMongoId } = require("./common.validator");

// sender can only mark someone as ignored or interested
const validateSendRequest = (req) => {
    const { status, toUserId } = req.params;

    if(!SEND_REQUEST_STATUSES.includes(status)) {
        throw ApiError.badRequest("Invalid Status Type");
    }
    assertMongoId(toUserId, "User Id");
}

// receiver can only accept or reject
const validateReviewRequest = (req) => {
    const { status, requestId } = req.params;

    if(!REVIEW_REQUEST_STATUSES.includes(status)) {
        throw ApiError.badRequest("Invalid Status Type");
    }
    assertMongoId(requestId, "Request Id");
}

module.exports = {
    validateSendRequest,
    validateReviewRequest
}
