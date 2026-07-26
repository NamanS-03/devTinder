const validator = require("validator");

// necessary validation for signing up the user
const signupValidation = (req) => {
    const {
        firstName, 
        lastName,
        email,
        password
    } = req.body;

    if( !firstName || !lastName ){
        throw new Error("First name and Last name is Required");
    } else if( !email || !validator.isEmail(email)) {
        throw new Error("Email is not Valid");
    } else if(!validator.isStrongPassword(password)) {
        throw new Error ("Enter a Strong Password");
    }
}

// necessary validations when updating the details of the user
const editDetailsValidation = (req) => {
    const ALLOWED_FIELDS_FOR_UPDATE = [
        "bio",
        "age",
        "gender",
        "profilePicUrl",
        "skills",
        "firstName",
        "lastName"
    ]

    const isUpdateAllowed = Object.keys(req.body).every((field) => ALLOWED_FIELDS_FOR_UPDATE.includes(field));

    return isUpdateAllowed;
}

module.exports = {
    signupValidation,
    editDetailsValidation
}