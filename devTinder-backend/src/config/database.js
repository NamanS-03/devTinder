const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
    await mongoose.connect(config.dbConnectionString);
}

const disconnectDB = async () => {
    await mongoose.connection.close();
}

module.exports = {
    connectDB,
    disconnectDB
}
