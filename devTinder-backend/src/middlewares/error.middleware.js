const ApiError = require("../utils/ApiError");
const config = require("../config/env");

// catch-all for routes that don't exist
const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} Not Found`));
}

// maps library errors to a proper status code + message
const normalizeError = (err) => {
    if(err instanceof ApiError) {
        return err;
    }
    if(err.name === "ValidationError") {
        const message = Object.values(err.errors).map((e) => e.message).join(", ");
        return ApiError.badRequest(message);
    }
    if(err.name === "CastError") {
        return ApiError.badRequest(`Invalid ${err.path}`);
    }
    if(err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "Field";
        return ApiError.conflict(`${field} already exists`);
    }
    if(err.name === "TokenExpiredError") {
        return ApiError.unauthorized("Session Expired, Please Login Again");
    }
    if(err.name === "JsonWebTokenError") {
        return ApiError.unauthorized("Invalid Token");
    }
    if(err.type === "entity.parse.failed") {
        return ApiError.badRequest("Malformed JSON in Request Body");
    }
    if(err.type === "entity.too.large") {
        return new ApiError(413, "Request Body Too Large");
    }
    return null;
}

// must keep all four arguments so express recognises it as an error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const apiError = normalizeError(err);

    if(!apiError) {
        // unexpected - log the full error but never leak internals to the client
        console.error(`[${req.method} ${req.originalUrl}]`, err);
        return res.status(500).json({
            message: "Something Went Wrong",
            ...(config.isProduction ? {} : { error: err.message })
        });
    }

    res.status(apiError.statusCode).json({
        message: apiError.message
    });
}

module.exports = {
    notFound,
    errorHandler
}
