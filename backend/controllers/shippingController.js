
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const Task = require("../models/Task")

const generateTrackingNumber = () => {
    return `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const generateShipmentNumber = () => {
    return `SHP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

exports.createShipment = async (req, res) => {
    try {
        const { orderId, carrier, estimatedDelivery } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const shipment = await Shipment.create({
            shipmentNumber: generateShipmentNumber(),
            order: orderId,
            trackingNumber: generateTrackingNumber(),
            carrier: carrier,
            status: "shipped",
            estimatedDelivery: estimatedDelivery,
            createdBy: req.user._id,
        });

        // Update order status
        order.status = "shipped";
        await order.save();

        res.status(201).json({
            success: true,
            data: shipment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find()
            .populate("order", "orderNumber customerName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: shipments.length,
            data: shipments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id)
            .populate("order", "orderNumber customerName items");

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found",
            });
        }

        res.status(200).json({
            success: true,
            data: shipment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateShipmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found",
            });
        }

        shipment.status = status;

        if (status === "delivered") {
            shipment.actualDelivery = new Date();
            // Update order status
            const order = await Order.findById(shipment.order);
            if (order) {
                order.status = "delivered";
                await order.save();
            }
        }

        await shipment.save();

        res.status(200).json({
            success: true,
            data: shipment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found",
            });
        }

        if (shipment.status === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete delivered shipment",
            });
        }

        await shipment.deleteOne();

        res.status(200).json({
            success: true,
            message: "Shipment deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getWorkerShipments = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        // Find orders where worker has tasks
        const tasks = await Task.find({
            assignedTo: workerId,
            order: { $ne: null }
        }).distinct("order");

        // Find shipments for those orders
        const shipments = await Shipment.find({
            order: { $in: tasks }
        })
            .populate("order", "orderNumber customerName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: shipments.length,
            data: shipments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};