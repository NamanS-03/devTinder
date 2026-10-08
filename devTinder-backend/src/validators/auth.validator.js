const validator = require("validator");
const ApiError = require("../utils/ApiError");
const { assertName, assertStrongPassword, assertProfileFields, isNonEmptyString } = require("./common.validator");

// necessary validation for signing up the user
const validateSignup = (req) => {
    const { firstName, lastName, email, password } = req.body;

    assertName(firstName, "First Name");
    assertName(lastName, "Last Name");

    if(typeof email !== "string" || !validator.isEmail(email.trim())) {
        throw ApiError.badRequest("Email is not Valid");
    }

    assertStrongPassword(password);
    assertProfileFields(req.body);
}

const validateLogin = (req) => {
    const { email, password } = req.body;

    if(!isNonEmptyString(email) || !isNonEmptyString(password)) {
        throw ApiError.badRequest("Email and Password are Required");
    }
}

module.exports = {
    validateSignup,
    validateLogin
}
