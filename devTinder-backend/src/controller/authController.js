const { signupValidation } = require("../utils/validation");
const People = require('../models/people');
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
    try {
        // validating the signup data 
        signupValidation(req);

        const {
            firstName,
            lastName,
            email,
            password,
            age,
            gender,
            profilePicUrl,
            skills
        } = req.body;

        // encrypting the password
        const passwordHash = await bcrypt.hash(password, 10);

        // creating a new instance for saving it in db. 
        const newUser = new People({
            firstName,
            lastName,
            email,
            password: passwordHash,
            age,
            gender,
            profilePicUrl,
            skills
        })

        await newUser.save();
        res.status(201).json({
            message: "New User Added Successfully"
        })
    } catch (err) {
        res.status(400).json({
            message: "ERROR ‼️ " + err.message
        })
    }
}

module.exports = {
    signup
}