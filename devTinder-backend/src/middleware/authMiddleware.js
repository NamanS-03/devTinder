const jwt = require("jsonwebtoken");
const People = require('../models/people');

const peopleAuth = async (req, res, next) => {
    try {
        // fetching the token from the request
        const { token } = req.cookies;

        // validating whether the token exists/ is valid.
        if(!token) {
            throw new Error("Invalid Tokens");
        }

        // verifying the token against the secret key that we used at the time of signing in the token 
        const decodedMessage = await jwt.verify(token, "DEV@devTinder123");
        console.log("Decoded message: " , decodedMessage);

        // extracting the id from after verifying
        const { _id } = decodedMessage;

        // fetching tthe user based on the id 
        const user = await People.findById(_id);
        if(!user){
            throw new Error("Invalid User/Not Present");
        }

        // assigning the req.user we the user that we fetched here
        req.user = user;
        next();
    } catch (err) {
        res.status(400).json({
            message: "ERROR !! " + err.message
        })
    }
}

module.exports = {
    peopleAuth
}