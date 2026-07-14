const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://naman-dev-cluster:NamanTest123@naman-dev-cluster.h0pxxoi.mongodb.net/devTinder");
} 

module.exports = {
    connectDB
}