
const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },

        x: Number,   // X coordinate
        y: Number,   // Y coordinate  
        z: Number,

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
            enum: ["AVAILABLE", "FULL", "MAINTENANCE", "INACTIVE"],
            default: "AVAILABLE",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Bin", binSchema);