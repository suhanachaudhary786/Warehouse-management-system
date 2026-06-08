
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Task = require("../models/Task");
const ShippingLabel = require("../models/shippingLabel");

exports.createOrder = async (req, res) => {
    try {
        const { items, customerName, customerEmail, shippingAddress, priority } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required"
            });
        }

        const createdOrder = await Order.create({
            orderNumber: `ORD-${Date.now()}`,
            items,
            customerName,
            customerEmail,
            shippingAddress,
            priority: priority || "medium",
            status: "created"
        });

        for (const item of items) {
            const inventory = await Inventory.findOne({
                sku: item.sku,
                status: "available",
                qty: { $gte: item.qty }
            }).populate("bin");

            if (!inventory) {
                await Order.findByIdAndDelete(createdOrder._id);
                return res.status(400).json({
                    success: false,
                    message: `Insufficient inventory for SKU: ${item.sku}`
                });
            }

            inventory.qty = inventory.qty - item.qty;
            inventory.status = "allocated";
            await inventory.save();

            await Task.create({
                taskType: "pick",
                order: createdOrder._id,
                inventory: inventory._id,
                sku: item.sku,
                qty: item.qty,
                sourceBin: inventory.bin._id,
                priority: priority === "high" ? 1 : priority === "medium" ? 2 : 3,
                status: "pending"
            });
        }

        createdOrder.status = "allocated";
        await createdOrder.save();

        const populatedOrder = await Order.findById(createdOrder._id)
            .populate("items.sku")
            .populate("shippingLabel");

        res.status(201).json({
            success: true,
            message: "Order allocated successfully",
            data: populatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("items.sku")
            .populate("shippingLabel")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.sku")
            .populate("shippingLabel");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        order.status = status;
        await order.save();

        // If order is shipped, create shipping label
        if (status === "shipped") {
            const shippingLabel = await ShippingLabel.create({
                order: order._id,
                trackingNumber: `TRK-${Date.now()}`,
                status: "in_transit"
            });
            order.shippingLabel = shippingLabel._id;
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: "Order status updated",
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only allow deletion of created/allocated orders
        if (order.status !== "created" && order.status !== "allocated") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete order that is in progress or shipped"
            });
        }

        if (order.status === "allocated") {
            for (const item of order.items) {
                const inventory = await Inventory.findOne({
                    sku: item.sku,
                    status: "allocated"
                });
                if (inventory) {
                    inventory.qty = inventory.qty + item.qty;
                    inventory.status = "available";
                    await inventory.save();
                }
            }
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.trackShipment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("shippingLabel");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!order.shippingLabel) {
            return res.status(404).json({
                success: false,
                message: "Shipping label not generated yet"
            });
        }

        res.status(200).json({
            success: true,
            tracking: order.shippingLabel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



exports.getWorkerOrderStats = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const tasks = await Task.find({
            assignedTo: workerId,
            order: { $ne: null }
        }).distinct("order");

        const orders = await Order.find({
            _id: { $in: tasks }
        });

        const completedOrders = orders.filter(o => o.status === "delivered").length;
        const inProgressOrders = orders.filter(o => ["allocated", "picking", "packed", "shipped"].includes(o.status)).length;

        res.status(200).json({
            success: true,
            data: {
                total: orders.length,
                completed: completedOrders,
                inProgress: inProgressOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getWorkerOrders = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        console.log("Fetching orders for worker:", workerId);

        // First, find all tasks assigned to this worker that have an order
        const tasks = await Task.find({
            assignedTo: workerId,
            order: { $ne: null }  // Tasks that have an order linked
        }).distinct("order");

        console.log(`Found ${tasks.length} orders linked to worker's tasks`);

        // Then fetch those orders with populated data
        const orders = await Order.find({
            _id: { $in: tasks }
        })
            .populate("items.sku", "skuCode name weight")
            .populate("shippingLabel")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Error in getWorkerOrders:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};