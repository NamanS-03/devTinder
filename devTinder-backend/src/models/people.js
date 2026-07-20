const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const peopleSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Incorrect Credentials" + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        default: "The Information is mostly for Educational and Experimental Purpose."
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: `{values} is incorrect gender type`
        }
    },
    profilePicUrl: {
        type: String,
        trim: true,
        validate(value) {
            if(validator.isURL(value)) {
                throw new Error("Invalid URL " + value);
            }
        }
    },
    skills: {
        type: [String],
        trim: true,
        lowercase: true, 
        validate(value) {
            if( value.length > 8 ) {
                throw new Error("Skills cannot exceed 8");
            }
        }

    }
}, {
    timestamps: true
});

peopleSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
    return isPasswordValid;
}

peopleSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id}, "DEV@devTinder123");
    return token;
}

const People = mongoose.model("People", peopleSchema);

module.exports = People;