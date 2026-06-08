
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        taskType: {
            type: String,
            enum: ["pick", "putaway", "receive", "move", "return", "pack", "ship"],
            required: true
        },
        receipt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Receipt",
        },
        suggestedBin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bin",
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory"
        },
        sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SKU"
        },
        qty: {
            type: Number,
            required: function () {
                // qty required for pick, putaway, receive, move, return tasks
                return ["pick", "putaway", "receive", "move", "return"].includes(this.taskType);
            }
        },
        sourceBin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bin"
        },
        destinationBin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bin"
        },
        priority: {
            type: Number,
            min: 1,
            max: 5,
            default: 3
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker"
        },
        status: {
            type: String,
            enum: ["pending", "assigned", "in_progress", "completed", "cancelled"],
            default: "pending"
        },
        completedAt: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);