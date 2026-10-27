const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
    await mongoose.connect(config.dbConnectionString);
} 

module.exports = {
    connectDB
}