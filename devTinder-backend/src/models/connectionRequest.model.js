const mongoose = require('mongoose');
const { CONNECTION_STATUS } = require('../constants');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "People",
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "People",
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: Object.values(CONNECTION_STATUS),
            message: `{VALUE} is incorrect status type`
        }
    }
}, {
    timestamps: true
})

// almost every request query filters on this pair
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
connectionRequestSchema.index({ toUserId: 1, status: 1 });

// last line of defence - the request service already rejects this case
connectionRequestSchema.pre("save", function () {
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot Send Connection Request to Yourself");
    }
})

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;
