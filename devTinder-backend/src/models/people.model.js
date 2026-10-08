const mongoose = require('mongoose');
const validator = require('validator');
const { GENDERS, PROFILE_LIMITS } = require('../constants');

const peopleSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: PROFILE_LIMITS.NAME_MAX_LENGTH
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: PROFILE_LIMITS.NAME_MAX_LENGTH
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email " + value);
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        maxlength: PROFILE_LIMITS.BIO_MAX_LENGTH,
        default: "The Information is mostly for Educational and Experimental Purpose."
    },
    age: {
        type: Number,
        min: PROFILE_LIMITS.MIN_AGE,
        max: PROFILE_LIMITS.MAX_AGE
    },
    gender: {
        type: String,
        enum: {
            values: GENDERS,
            message: `{VALUE} is incorrect gender type`
        }
    },
    // holds either a regular http(s) URL or a base64 image data URI (what the
    // frontend currently uploads)
    profilePicUrl: {
        type: String,
        trim: true,
        validate(value) {
            if(value && !validator.isURL(value) && !validator.isDataURI(value)) {
                throw new Error("Invalid Profile Picture URL");
            }
        }
    },
    skills: {
        type: [{
            type: String,
            trim: true,
            lowercase: true,
            maxlength: PROFILE_LIMITS.SKILL_MAX_LENGTH
        }],
        validate(value) {
            if( value.length > PROFILE_LIMITS.MAX_SKILLS ) {
                throw new Error(`Skills cannot exceed ${PROFILE_LIMITS.MAX_SKILLS}`);
            }
        }
    }
}, {
    timestamps: true,
    toJSON: {
        // never send the password hash (or mongoose internals) to a client
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

const People = mongoose.model("People", peopleSchema);

module.exports = People;
