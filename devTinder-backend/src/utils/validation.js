const validator = require("validator");

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

module.exports = {
    signupValidation
}