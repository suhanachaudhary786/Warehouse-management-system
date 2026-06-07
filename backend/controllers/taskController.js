
const Task =
    require("../models/Task");

const Inventory =
    require("../models/Inventory");

const SKU =
    require("../models/SKU");

const Order =
    require("../models/Order");

const ShippingLabel =
    require("../models/ShippingLabel");

const {
    generateTrackingNumber
}
    =
    require("../services/shippingService");


const {
    suggestCarton
}
    =
    require("../services/cartonService");

exports.getPendingTasks =
    async (req, res) => {

        const tasks =
            await Task.find({
                status: "pending"
            })
                .populate("inventory");

        res.status(200).json({
            success: true,
            data: tasks
        });
    };

exports.acceptTask = async (req, res) => {
    try {
        const { assignedWorker } = req.body;  // ✅ Frontend se worker ID le rahe hain

        console.log("Accept Task - Request body:", req.body);
        console.log("Assigned Worker ID:", assignedWorker);

        if (!assignedWorker) {
            return res.status(400).json({
                success: false,
                message: "Worker ID is required"
            });
        }
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                status: "assigned",  // Change from "accepted" to "assigned"
                assignedTo: assignedWorker    // Change from assignedWorker
            },
            { new: true }
        ).populate("assignedTo");

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getPickTasks =
    async (req, res) => {

        try {

            const tasks =
                await Task.find({

                    taskType: "pick",

                    status: { $in: ["pending", "assigned", "completed", "cancelled", "in_progress"] }

                })
                    .populate({
                        path: "inventory",
                        populate: [
                            {
                                path: "sku"
                            },
                            {
                                path: "bin"
                            }
                        ]
                    });

            res.status(200).json({

                success: true,

                data: tasks

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.completePickTask =
    async (req, res) => {

        try {

            const task =
                await Task.findById(
                    req.params.id
                );

            if (!task) {

                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            task.status =
                "completed";

            await task.save();

            const inventory =
                await Inventory.findById(
                    task.inventory
                );

            inventory.status =
                "picked";

            await inventory.save();

            res.status(200).json({

                success: true,

                message:
                    "Pick completed"

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.generatePackTask =
    async (req, res) => {

        try {

            const pickTask =
                await Task.findById(
                    req.params.taskId
                ).populate({
                    path: "inventory",
                    populate: {
                        path: "sku"
                    }
                });

            if (!pickTask) {

                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            const sku =
                pickTask.inventory.sku;

            const productVolume =
                sku.length *
                sku.width *
                sku.height *
                pickTask.qty;

            const totalWeight =
                sku.weight *
                pickTask.qty;

            const carton =
                await suggestCarton(
                    productVolume,
                    totalWeight
                );

            const packTask =
                await Task.create({

                    taskType: "pack",

                    inventory:
                        pickTask.inventory._id,

                    qty:
                        pickTask.qty,

                    carton:
                        carton?._id,

                    priority: 1,

                    status: "pending"

                });

            res.status(201).json({

                success: true,

                message:
                    "Pack task generated",

                suggestedCarton:
                    carton,

                task:
                    packTask

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.getPackTasks =
    async (req, res) => {

        try {

            const tasks =
                await Task.find({

                    taskType: "pack",

                    status: { $in: ["pending", "assigned", "completed", "cancelled", "in_progress"] }

                })
                    .populate("carton")
                    .populate({
                        path: "inventory",
                        populate: {
                            path: "sku"
                        }
                    });

            res.status(200).json({

                success: true,

                data: tasks

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.completePackTask =
    async (req, res) => {

        try {

            const task =
                await Task.findById(
                    req.params.id
                );

            if (!task) {

                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            task.status =
                "completed";

            await task.save();

            res.status(200).json({

                success: true,

                message:
                    "Packing completed"

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.generateShipTask =
    async (req, res) => {

        try {

            const {
                orderId
            }
                =
                req.body;

            const order =
                await Order.findById(orderId);

            if (!order) {

                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            const label =
                await ShippingLabel.create({

                    trackingNumber:
                        generateTrackingNumber(),

                    carrier: "BlueDart",

                    shippingAddress:
                        req.body.shippingAddress

                });

            order.shippingLabel =
                label._id;

            await order.save();

            const shipTask =
                await Task.create({

                    taskType: "ship",

                    status: "pending",

                    priority: 1

                });

            res.status(201).json({

                success: true,

                message:
                    "Ship task generated",

                label,

                task:
                    shipTask

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.getShipTasks =
    async (req, res) => {

        try {

            const tasks =
                await Task.find({

                    taskType: "ship",

                    status: { $in: ["pending", "assigned", "completed", "cancelled", "in_progress"] }

                });

            res.status(200).json({

                success: true,

                data: tasks

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


exports.completeShipTask =
    async (req, res) => {

        try {

            const task =
                await Task.findById(
                    req.params.id
                );

            if (!task) {

                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            task.status =
                "completed";

            await task.save();

            const order =
                await Order.findOne({
                    status: "allocated"
                });

            if (order) {

                order.status =
                    "shipped";

                await order.save();
            }

            res.status(200).json({

                success: true,

                message:
                    "Order shipped successfully"

            });

        }
        catch (error) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }
    };


// controllers/taskController.js - Add these new functions at the end

// GET TASKS FOR SPECIFIC WORKER
exports.getWorkerTasks = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const tasks = await Task.find({
            assignedTo: workerId
        })
            .populate("sku", "name skuCode weight")
            .populate("sourceBin", "code")
            .populate("destinationBin", "code")
            .populate("order", "orderNumber")
            .sort({ priority: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET PENDING TASKS FOR WORKER
exports.getWorkerPendingTasks = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const tasks = await Task.find({
            assignedTo: workerId,
            status: { $ne: "completed" }
        })
            .populate("sku", "name skuCode")
            .populate("sourceBin", "code")
            .sort({ priority: 1, createdAt: 1 });

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// WORKER COMPLETES TASK

// WORKER COMPLETES TASK
exports.completeWorkerTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // ✅ Add debug logs
        console.log("=== COMPLETE TASK DEBUG ===");
        console.log("Task ID:", req.params.id);
        console.log("Task assignedTo:", task.assignedTo?.toString());
        console.log("Logged in user ID:", req.user._id?.toString());
        console.log("User role:", req.user.role);
        console.log("Are they equal?", task.assignedTo?.toString() === req.user._id?.toString());

        // Check if task is assigned to this worker
        if (task.assignedTo?.toString() !== req.user._id?.toString() && req.user.role !== "manager") {
            console.log("❌ Authorization failed!");
            return res.status(403).json({
                success: false,
                message: "You are not authorized to complete this task"
            });
        }

        console.log("✅ Authorization passed!");

        task.status = "completed";
        task.completedAt = new Date();
        await task.save();

        console.log(`✅ Task ${task._id} marked as completed`);

        res.status(200).json({
            success: true,
            message: "Task completed successfully",
            data: task
        });
    } catch (error) {
        console.error("Error in completeWorkerTask:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET TASK STATS FOR WORKER
exports.getWorkerTaskStats = async (req, res) => {
    try {
        const workerId = req.params.workerId;

        const allTasks = await Task.find({ assignedTo: workerId });

        const pendingTasks = allTasks.filter(t => t.status !== "completed").length;
        const completedTasks = allTasks.filter(t => t.status === "completed").length;

        // Today's completed tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completedToday = allTasks.filter(t => {
            if (!t.completedAt) return false;
            return new Date(t.completedAt) >= today;
        }).length;

        res.status(200).json({
            success: true,
            data: {
                total: allTasks.length,
                pending: pendingTasks,
                completed: completedTasks,
                completedToday: completedToday
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getNextTaskForWorker = async (req, res) => {
    const worker = await Worker.findById(req.params.workerId);

    const eligibleTasks = await Task.find({
        status: "pending",
        "required_capabilities.equipment": { $in: worker.equipmentAuth },
        "required_capabilities.maxWeight": { $lte: worker.maxSafeWeight }
    }).populate("sourceBin");

    // Score by proximity
    const scoredTasks = eligibleTasks.map(task => {
        const distance = Math.abs(worker.lastBinId - task.sourceBin?.code);
        return { task, score: 1 / (distance + 1) };
    });

    const bestTask = scoredTasks.sort((a, b) => b.score - a.score)[0]?.task;

    res.json({ success: true, data: bestTask });
};