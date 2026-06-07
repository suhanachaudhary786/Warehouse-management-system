
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SKU",
            required: true,
        },

        bin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bin",
            required: true,
        },

        qty: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "available",
                "allocated",
                "picked",
                "hold",
                "damaged",
            ],
            default: "available",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Inventory",
    inventorySchema
);