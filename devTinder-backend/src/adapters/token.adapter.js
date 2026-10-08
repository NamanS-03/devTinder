const jwt = require("jsonwebtoken");
const config = require("../config/env");

// Wraps the JWT library; signing and verifying always use the same secret.
const sign = (payload) => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// throws JsonWebTokenError / TokenExpiredError on an invalid token
const verify = (token) => {
    return jwt.verify(token, config.jwt.secret);
}

module.exports = {
    sign,
    verify
}
