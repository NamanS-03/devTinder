const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

// Builds the express app without starting it, so it can be imported by
// tests without opening a port or a DB connection.
const app = express();

app.disable("x-powered-by");
app.set('json spaces', 2);

app.use(cors({
    origin: config.corsOrigins,
    credentials: true
}));
// large limit because profile pictures are currently sent as base64 strings
app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());

app.use("/", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
