const peopleRepository = require('../repositories/people.repository');
const hashAdapter = require('../adapters/hash.adapter');
const tokenAdapter = require('../adapters/token.adapter');
const ApiError = require('../utils/ApiError');

const signup = async ({ firstName, lastName, email, password, age, gender, profilePicUrl, skills, bio }) => {
    const normalizedEmail = email.trim();

    const existingUser = await peopleRepository.findByEmail(normalizedEmail);
    if(existingUser) {
        throw ApiError.conflict("Email is already registered");
    }

    // encrypting the password
    const passwordHash = await hashAdapter.hash(password);

    return peopleRepository.create({
        firstName,
        lastName,
        email: normalizedEmail,
        password: passwordHash,
        age,
        gender: gender || undefined,
        profilePicUrl: profilePicUrl || undefined,
        skills,
        bio
    });
}

const login = async ({ email, password }) => {
    const user = await peopleRepository.findByEmail(email.trim());

    // same message whether the email or the password is wrong, so the API
    // can't be used to find out which emails are registered
    const isPasswordCorrect = user && await hashAdapter.compare(password, user.password);
    if(!isPasswordCorrect) {
        throw ApiError.unauthorized("Invalid Email or Password");
    }

    const token = tokenAdapter.sign({ _id: user._id });
    return { user, token };
}

// Shared token verification: decodes the token and looks up the matching
// user. Throws on any failure (missing/invalid token, unknown user) -
// callers decide whether that's fatal (peopleAuth) or ignorable (logout).
const getUserFromToken = async (token) => {
    if(!token) {
        throw ApiError.unauthorized("Please Login");
    }

    const { _id } = tokenAdapter.verify(token);

    const user = await peopleRepository.findById(_id);
    if(!user) {
        throw ApiError.unauthorized("Invalid User/Not Present");
    }

    return user;
}

module.exports = {
    signup,
    login,
    getUserFromToken
}
