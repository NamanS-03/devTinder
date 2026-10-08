const CONNECTION_STATUS = Object.freeze({
    IGNORED: "ignored",
    INTERESTED: "interested",
    ACCEPTED: "accepted",
    REJECTED: "rejected"
});

// statuses a sender can choose when swiping on someone
const SEND_REQUEST_STATUSES = [CONNECTION_STATUS.IGNORED, CONNECTION_STATUS.INTERESTED];

// statuses a receiver can choose when reviewing a request
const REVIEW_REQUEST_STATUSES = [CONNECTION_STATUS.ACCEPTED, CONNECTION_STATUS.REJECTED];

// "others" is kept only so older documents stay valid; new input should use "other"
const GENDERS = ["male", "female", "other", "others"];

// fields that are safe to expose about another user
const USER_PUBLIC_FIELDS = "firstName lastName bio skills profilePicUrl age gender";

// fields the logged in user is allowed to change through the edit profile API
const EDITABLE_PROFILE_FIELDS = [
    "bio",
    "age",
    "gender",
    "profilePicUrl",
    "skills",
    "firstName",
    "lastName"
];

const PROFILE_LIMITS = Object.freeze({
    NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 500,
    MIN_AGE: 1,
    MAX_AGE: 120,
    MAX_SKILLS: 8,
    SKILL_MAX_LENGTH: 30
});

const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
});

module.exports = {
    CONNECTION_STATUS,
    SEND_REQUEST_STATUSES,
    REVIEW_REQUEST_STATUSES,
    GENDERS,
    USER_PUBLIC_FIELDS,
    EDITABLE_PROFILE_FIELDS,
    PROFILE_LIMITS,
    PAGINATION
}
