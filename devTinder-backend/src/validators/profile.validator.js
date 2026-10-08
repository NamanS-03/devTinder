const ApiError = require("../utils/ApiError");
const { EDITABLE_PROFILE_FIELDS } = require("../constants");
const { assertName, assertStrongPassword, assertProfileFields, isNonEmptyString } = require("./common.validator");

// necessary validations when updating the details of the user
const validateEditProfile = (req) => {
    const fields = Object.keys(req.body || {});

    if(fields.length === 0) {
        throw ApiError.badRequest("Nothing to Update");
    }

    const isUpdateAllowed = fields.every((field) => EDITABLE_PROFILE_FIELDS.includes(field));
    if(!isUpdateAllowed) {
        throw ApiError.badRequest("Invalid Field In Request Body");
    }

    if(req.body.firstName !== undefined) {
        assertName(req.body.firstName, "First Name");
    }
    if(req.body.lastName !== undefined) {
        assertName(req.body.lastName, "Last Name");
    }

    assertProfileFields(req.body);
}

const validateUpdatePassword = (req) => {
    const { oldPassword, newPassword } = req.body;

    if(!isNonEmptyString(oldPassword)) {
        throw ApiError.badRequest("Old Password is Required");
    }

    assertStrongPassword(newPassword, "New Password");

    if(oldPassword === newPassword) {
        throw ApiError.badRequest("New Password must be different from the Old Password");
    }
}

module.exports = {
    validateEditProfile,
    validateUpdatePassword
}
