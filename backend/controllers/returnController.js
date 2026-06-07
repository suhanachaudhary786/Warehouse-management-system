
// controllers/returnController.js
const Return = require("../models/Return");
const Task = require("../models/Task");
const Inventory = require("../models/Inventory"); // Add this import
const Order = require("../models/Order");

// CREATE RETURN
exports.createReturn = async (req, res) => {
    try {
        const { order, sku, qty, reason } = req.body;

        // Validation
        if (!order || !sku || !qty) {
            return res.status(400).json({
                success: false,
                message: "Order, SKU, and Quantity are required"
            });
        }

        // Check if order exists
        const existingOrder = await Order.findById(order);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Create return record
        const returnItem = await Return.create({
            order,
            sku,
            qty,
            reason,
            status: "pending"
        });

        // Create inspection task for return
        const inspectionTask = await Task.create({
            taskType: "return",  // Now this will work after updating enum
            sku: sku,
            qty: qty,
            order: order,
            priority: 2,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Return created successfully",
            data: {
                returnItem,
                inspectionTask
            }
        });
    } catch (error) {
        console.error("Create return error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// RESTOCK RETURN
exports.restockReturn = async (req, res) => {
    try {
        const returnItem = await Return.findById(req.params.id);

        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: "Return not found"
            });
        }

        if (returnItem.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending returns can be restocked"
            });
        }

        // Find available inventory for this SKU
        let inventory = await Inventory.findOne({
            sku: returnItem.sku,
            status: "available"
        });

        if (inventory) {
            // Add to existing inventory
            inventory.qty += returnItem.qty;
            await inventory.save();
        } else {
            // Find a default bin (you might want to configure this)
            const Bin = require("../models/Bin");
            const defaultBin = await Bin.findOne({ status: "AVAILABLE" });

            if (defaultBin) {
                // Create new inventory record
                inventory = await Inventory.create({
                    sku: returnItem.sku,
                    bin: defaultBin._id,
                    qty: returnItem.qty,
                    status: "available"
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "No available bin found for restocking"
                });
            }
        }

        // Update return status
        returnItem.status = "restocked";
        await returnItem.save();

        // Update the related task to completed
        await Task.findOneAndUpdate(
            {
                order: returnItem.order,
                sku: returnItem.sku,
                taskType: "return"
            },
            {
                status: "completed",
                completedAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: "Item restocked successfully",
            data: returnItem
        });
    } catch (error) {
        console.error("Restock error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// MARK AS DAMAGED
exports.damageReturn = async (req, res) => {
    try {
        const returnItem = await Return.findById(req.params.id);

        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: "Return not found"
            });
        }

        if (returnItem.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending returns can be marked as damaged"
            });
        }

        returnItem.status = "damaged";
        await returnItem.save();

        // Update task
        await Task.findOneAndUpdate(
            {
                order: returnItem.order,
                sku: returnItem.sku,
                taskType: "return"
            },
            {
                status: "cancelled",
                completedAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: "Item marked as damaged",
            data: returnItem
        });
    } catch (error) {
        console.error("Damage error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// QUARANTINE RETURN
exports.quarantineReturn = async (req, res) => {
    try {
        const returnItem = await Return.findById(req.params.id);

        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: "Return not found"
            });
        }

        if (returnItem.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending returns can be quarantined"
            });
        }

        returnItem.status = "quarantined";
        await returnItem.save();

        // Update task
        await Task.findOneAndUpdate(
            {
                order: returnItem.order,
                sku: returnItem.sku,
                taskType: "return"
            },
            {
                status: "in_progress",
                note: "Item quarantined for further inspection"
            }
        );

        res.status(200).json({
            success: true,
            message: "Item moved to quarantine",
            data: returnItem
        });
    } catch (error) {
        console.error("Quarantine error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL RETURNS
exports.getReturns = async (req, res) => {
    try {
        const returns = await Return.find()
            .populate("order", "orderNumber customerName status")
            .populate("sku", "skuCode name weight")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: returns.length,
            data: returns
        });
    } catch (error) {
        console.error("Get returns error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET RETURN BY ID
exports.getReturnById = async (req, res) => {
    try {
        const returnItem = await Return.findById(req.params.id)
            .populate("order", "orderNumber customerName status shippingAddress")
            .populate("sku", "skuCode name weight dimensions");

        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: "Return not found"
            });
        }

        // Get associated task
        const task = await Task.findOne({
            order: returnItem.order,
            sku: returnItem.sku,
            taskType: "return"
        });

        res.status(200).json({
            success: true,
            data: {
                ...returnItem.toObject(),
                task
            }
        });
    } catch (error) {
        console.error("Get return by ID error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};