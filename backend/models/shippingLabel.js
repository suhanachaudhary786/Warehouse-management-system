
const mongoose = require("mongoose");

const shippingLabelSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        trackingNumber: {
            type: String,
            required: true,
            unique: true
        },
        carrier: {
            type: String,
            enum: ["fedex", "dhl", "ups", "usps", "other"],
            default: "other"
        },
        status: {
            type: String,
            enum: ["pending", "in_transit", "out_for_delivery", "delivered"],
            default: "pending"
        },
        estimatedDelivery: Date,
        actualDelivery: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ShippingLabel", shippingLabelSchema);