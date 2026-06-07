
const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },

        x: Number,
        y: Number,

        volumeCapacity: {
            type: Number,
            required: true,
        },

        remainingVolume: {
            type: Number,
            default: 0,
        },

        maxWeight: Number,

        allowedHandlingClasses: [String],

        status: {
            type: String,
            enum: ["AVAILABLE", "FULL"],
            default: "AVAILABLE",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Bin", binSchema);