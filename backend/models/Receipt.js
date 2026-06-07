
// models/Receipt.js
const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
    {
        receiptNumber: {
            type: String,
            required: true,
            unique: true,
        },
        supplier: {
            type: String,
            required: true,
        },
        expectedDate: Date,
        items: [
            {
                sku: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "SKU",
                    required: true,
                },
                expectedQty: {
                    type: Number,
                    required: true,
                },
                receivedQty: {
                    type: Number,
                    default: 0,
                },
                status: {
                    type: String,
                    enum: ["pending", "partial", "completed"],
                    default: "pending",
                },
            },
        ],
        status: {
            type: String,
            enum: ["created", "receiving", "putaway", "closed"],
            default: "created",
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        notes: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);