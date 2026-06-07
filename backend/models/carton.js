
const mongoose = require("mongoose");

const cartonSchema = new mongoose.Schema(
    {
        cartonCode: {
            type: String,
            required: true,
            unique: true
        },

        length: Number,
        width: Number,
        height: Number,

        maxWeight: Number
    },
    {
        timestamps: true
    });

module.exports =
    mongoose.model("Carton", cartonSchema);