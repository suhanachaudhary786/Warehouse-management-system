
// models/Order.js (Updated)
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true
        },
        customerName: {
            type: String,
            required: true
        },
        customerEmail: String,
        customerPhone: String,
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        items: [
            {
                sku: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "SKU",
                    required: true
                },
                qty: {
                    type: Number,
                    required: true,
                    min: 1
                },
                pickedQty: {
                    type: Number,
                    default: 0
                }
            }
        ],
        priority: {
            type: String,
            enum: ["high", "medium", "low"],
            default: "medium"
        },
        shippingLabel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShippingLabel"
        },
        status: {
            type: String,
            enum: [
                "created",
                "allocated",
                "picking",
                "packed",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "created"
        },
        notes: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);