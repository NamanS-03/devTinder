// Load .env into process.env. This must run before anything reads it.
require("dotenv").config({ quiet: true });

// The server won't start without these
const REQUIRED_VARS = ["PORT", "DB_CONNECTION_STRING", "JWT_SECRET"];

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(", ")}`);
}

const config = {
    port: Number(process.env.PORT),
    dbConnectionString: process.env.DB_CONNECTION_STRING,
    jwt: Object.freeze({
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }),
    // "http://a.com, http://b.com" → ["http://a.com", "http://b.com"]
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim()),
    isProduction: process.env.NODE_ENV === "production"
};

module.exports = Object.freeze(config);
