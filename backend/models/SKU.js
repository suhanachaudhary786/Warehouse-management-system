
const mongoose = require("mongoose");

const skuSchema = new mongoose.Schema(
    {
        skuCode: {
            type: String,
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: true,
        },

        length: Number,
        width: Number,
        height: Number,

        weight: {
            type: Number,
            required: true,
        },

        velocityClass: {
            type: String,
            enum: ["FAST", "MEDIUM", "SLOW"],
            default: "MEDIUM",
        },

        handlingClasses: [String],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SKU", skuSchema);