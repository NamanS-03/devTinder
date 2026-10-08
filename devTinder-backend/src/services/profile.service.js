const peopleRepository = require('../repositories/people.repository');
const hashAdapter = require('../adapters/hash.adapter');
const ApiError = require('../utils/ApiError');

// fields where an empty string from the client means "remove this value"
const CLEARABLE_FIELDS = ["gender", "profilePicUrl"];

const updateProfile = async (userId, updates) => {
    const $set = {};
    const $unset = {};

    Object.entries(updates).forEach(([field, value]) => {
        if(CLEARABLE_FIELDS.includes(field) && value === "") {
            $unset[field] = "";
        } else {
            $set[field] = value;
        }
    });

    const updatedUser = await peopleRepository.updateById(userId, { $set, $unset });
    if(!updatedUser) {
        throw ApiError.notFound("User Not Found");
    }
    return updatedUser;
}

const updatePassword = async (user, { oldPassword, newPassword }) => {
    const isOldPasswordCorrect = await hashAdapter.compare(oldPassword, user.password);
    if(!isOldPasswordCorrect) {
        throw ApiError.badRequest("Invalid Password");
    }

    const passwordHash = await hashAdapter.hash(newPassword);
    await peopleRepository.updatePassword(user._id, passwordHash);
}

module.exports = {
    updateProfile,
    updatePassword
}
