require("dotenv").config({ quiet: true });

// Every required variable is checked once at startup so a missing secret
// fails loudly here instead of surfacing later as an opaque auth error.
const REQUIRED_VARS = ["PORT", "DB_CONNECTION_STRING", "JWT_SECRET"];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const nodeEnv = process.env.NODE_ENV || "development";

const config = Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === "production",
    port: Number(process.env.PORT),
    dbConnectionString: process.env.DB_CONNECTION_STRING,
    jwt: Object.freeze({
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }),
    // comma separated list, e.g. "http://localhost:5173,https://devtinder.app"
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10)
});

module.exports = config;
