const express = require("express");
const app = express();
const { connectDB } = require("./src/config/database");
const authRouter = require('./src/routes/authRoutes');
const profileRouter = require('./src/routes/profileRoutes');
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser())
app.use("/", authRouter);
app.use('/profile', profileRouter);


connectDB()
    .then(() => {
        console.log("Connected to devTinder DB Succesfully");
        app.listen(2003, () => {
            console.log("Server Running Successfully on Port 2003");
        })
    })
    .catch((err) => {
        console.log("Error Starting the Server", err);
    })
