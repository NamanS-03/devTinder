const config = require("./config/env");
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/database");

const startServer = async () => {
    await connectDB();
    console.log("Connected to devTinder DB Successfully");

    const server = app.listen(config.port, () => {
        console.log(`Server Running Successfully on Port ${config.port} (${config.nodeEnv})`);
    });

    // let in-flight requests finish before exiting on deploy/restart
    const shutdown = (signal) => {
        console.log(`${signal} received, shutting down`);
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
    console.error("Error Starting the Server", err);
    process.exit(1);
});
