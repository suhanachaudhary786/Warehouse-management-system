
const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SKU",
            required: true
        },

        qty: {
            type: Number,
            required: true
        },

        reason: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "pending",
                "inspected",
                "restocked",
                "damaged",
                "quarantined"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    });

module.exports =
    mongoose.model("Return", returnSchema);