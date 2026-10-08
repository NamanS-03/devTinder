const config = require("./env");

const TOKEN_COOKIE_NAME = "token";

// keep the cookie lifetime in step with the JWT expiry (default 7 days)
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const tokenCookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    maxAge: TOKEN_MAX_AGE_MS
};

module.exports = {
    TOKEN_COOKIE_NAME,
    tokenCookieOptions
}
