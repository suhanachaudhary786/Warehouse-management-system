
// models/Shipment.js
const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
    {
        shipmentNumber: {
            type: String,
            required: true,
            unique: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        trackingNumber: {
            type: String,
            required: true,
            unique: true,
        },
        carrier: {
            type: String,
            enum: ["fedex", "dhl", "ups", "blue_dart", "delhivery", "other"],
            required: true,
        },
        serviceType: {
            type: String,
            enum: ["standard", "express", "overnight", "international"],
            default: "standard",
        },
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        packageDetails: {
            weight: Number,
            dimensions: {
                length: Number,
                width: Number,
                height: Number,
            },
            packages: [{
                packageId: String,
                weight: Number,
                trackingNumber: String,
            }],
        },
        status: {
            type: String,
            enum: [
                "pending",
                "in_transit",
                "shipped",
                "delivered",
                "cancelled",
                "returned"
            ],
            default: "pending",
        },
        estimatedDelivery: Date,
        actualDelivery: Date,
        shippingCost: Number,
        insuranceAmount: Number,
        documents: [{
            type: String, // invoice, label, receipt
            url: String,
        }],
        statusHistory: [{
            status: String,
            location: String,
            timestamp: Date,
            description: String,
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Shipment", shipmentSchema);