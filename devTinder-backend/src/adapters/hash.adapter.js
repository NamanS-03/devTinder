const bcrypt = require("bcrypt");
const config = require("../config/env");

// Wraps the hashing library so the rest of the app never imports bcrypt
// directly - swapping it out (e.g. for argon2) only touches this file.
const hash = async (plainText) => {
    return bcrypt.hash(plainText, config.bcryptSaltRounds);
}

const compare = async (plainText, hashed) => {
    return bcrypt.compare(plainText, hashed);
}

module.exports = {
    hash,
    compare
}
