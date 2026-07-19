const mongoose = require('mongoose');
const validator = require('validator');

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

const People = mongoose.model("People", peopleSchema);

module.exports = People;