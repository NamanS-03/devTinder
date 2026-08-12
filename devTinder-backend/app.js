const express = require("express");
const app = express();
const cors = require("cors");
const { connectDB } = require("./src/config/database");
const authRouter = require('./src/routes/authRoutes');
const profileRouter = require('./src/routes/profileRoutes');
const requestRouter = require('./src/routes/requestRoutes');
const userRouter = require('./src/routes/userRoutes');
const cookieParser = require("cookie-parser");
require("dotenv").config({ quiet: true });

app.set('json spaces', 2);
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: "8mb" }));
app.use(cookieParser());
app.use("/", authRouter);
app.use('/profile', profileRouter);
app.use('/request', requestRouter);
app.use('/user', userRouter);

connectDB()
    .then(() => {
        console.log("Connected to devTinder DB Succesfully");
        app.listen(process.env.PORT, () => {
            console.log("Server Running Successfully on Port 2003");
        })
    })
    .catch((err) => {
        console.log("Error Starting the Server", err);
    })
