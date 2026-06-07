
const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            unique: true
        },
        password: String,

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        skills: [String],

        equipmentAuth: [String],

        maxSafeWeight: Number,

        status: {
            type: String,
            enum: ["available", "offline"],
            default: "available",
        },

        lastBinId: {
            type: String,
            default: "A1",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Worker",
    workerSchema
);