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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // finding the user based on the emailId
        const user = await People.findOne({ email: email });
        if(!user) {
            throw new Error("Invalid User");
        }

        // checking whether the entered pasword is correct or not
        const isPasswordCorrect = await user.validatePassword(password);

        // if correct then singing in the token and wrapping it in cookie. 
        if(isPasswordCorrect){
            const token = await user.getJWT();
            res.cookie("token", token);
            res.status(200).json({
                message: user.firstName + " Logged In Successfully."
            })
        } else {
            throw new Error("Invalid Email or Password");
        }
    } catch (err) {
        res.status(401).json({
            message: err.message
        })
    }
}

module.exports = {
    signup,
    login
}