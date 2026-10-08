const People = require('../models/people.model');

// All database access for the People collection lives here, so services
// never build mongoose queries themselves.

const create = async (data) => {
    return People.create(data);
}

const findById = async (id) => {
    return People.findById(id);
}

const findByEmail = async (email) => {
    return People.findOne({ email });
}

const existsById = async (id) => {
    return People.exists({ _id: id });
}

const updateById = async (id, update) => {
    return People.findByIdAndUpdate(id, update, {
        returnDocument: 'after',
        runValidators: true
    });
}

const updatePassword = async (id, passwordHash) => {
    return People.updateOne({ _id: id }, { $set: { password: passwordHash } });
}

// users that are not in excludedIds, for the feed
const findExcluding = async ({ excludedIds, fields, skip, limit }) => {
    return People.find({ _id: { $nin: excludedIds } })
        .select(fields)
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit);
}

module.exports = {
    create,
    findById,
    findByEmail,
    existsById,
    updateById,
    updatePassword,
    findExcluding
}
