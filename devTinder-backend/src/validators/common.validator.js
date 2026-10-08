const validator = require("validator");
const ApiError = require("../utils/ApiError");
const { GENDERS, PROFILE_LIMITS } = require("../constants");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const assertName = (value, label) => {
    if(!isNonEmptyString(value)) {
        throw ApiError.badRequest(`${label} is Required`);
    }
    if(value.trim().length > PROFILE_LIMITS.NAME_MAX_LENGTH) {
        throw ApiError.badRequest(`${label} cannot exceed ${PROFILE_LIMITS.NAME_MAX_LENGTH} characters`);
    }
}

const assertStrongPassword = (value, label = "Password") => {
    if(typeof value !== "string" || !validator.isStrongPassword(value)) {
        throw ApiError.badRequest(`${label} must be at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol`);
    }
}

const assertMongoId = (value, label) => {
    if(typeof value !== "string" || !validator.isMongoId(value)) {
        throw ApiError.badRequest(`Invalid ${label}`);
    }
}

// validates the optional profile fields shared by signup and edit profile.
// empty strings are allowed for gender/profilePicUrl and mean "clear it".
const assertProfileFields = (body) => {
    const { bio, age, gender, profilePicUrl, skills } = body;

    if(bio !== undefined) {
        if(typeof bio !== "string" || bio.length > PROFILE_LIMITS.BIO_MAX_LENGTH) {
            throw ApiError.badRequest(`Bio must be text of at most ${PROFILE_LIMITS.BIO_MAX_LENGTH} characters`);
        }
    }

    if(age !== undefined) {
        if(!Number.isInteger(age) || age < PROFILE_LIMITS.MIN_AGE || age > PROFILE_LIMITS.MAX_AGE) {
            throw ApiError.badRequest(`Age must be a whole number between ${PROFILE_LIMITS.MIN_AGE} and ${PROFILE_LIMITS.MAX_AGE}`);
        }
    }

    if(gender !== undefined && gender !== "" && !GENDERS.includes(gender)) {
        throw ApiError.badRequest("Invalid Gender");
    }

    if(profilePicUrl !== undefined && profilePicUrl !== "") {
        if(typeof profilePicUrl !== "string" || (!validator.isURL(profilePicUrl) && !validator.isDataURI(profilePicUrl))) {
            throw ApiError.badRequest("Invalid Profile Picture URL");
        }
    }

    if(skills !== undefined) {
        if(!Array.isArray(skills)) {
            throw ApiError.badRequest("Skills must be a list");
        }
        if(skills.length > PROFILE_LIMITS.MAX_SKILLS) {
            throw ApiError.badRequest(`Skills cannot exceed ${PROFILE_LIMITS.MAX_SKILLS}`);
        }
        const isEverySkillValid = skills.every(
            (skill) => isNonEmptyString(skill) && skill.trim().length <= PROFILE_LIMITS.SKILL_MAX_LENGTH
        );
        if(!isEverySkillValid) {
            throw ApiError.badRequest(`Each skill must be non-empty and at most ${PROFILE_LIMITS.SKILL_MAX_LENGTH} characters`);
        }
    }
}

module.exports = {
    isNonEmptyString,
    assertName,
    assertStrongPassword,
    assertMongoId,
    assertProfileFields
}
