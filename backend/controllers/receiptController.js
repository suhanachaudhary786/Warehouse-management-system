
const Receipt = require("../models/Receipt");
const SKU = require("../models/SKU");
const Task = require("../models/Task");
const Inventory = require("../models/Inventory");
const Bin = require("../models/Bin");
const Worker = require("../models/Worker");
const { findBestBin, updateBinVolume, calculateRemainingVolume } = require("../services/slottingService");

function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}${month}${day}-${random}`;
}

exports.createReceipt = async (req, res) => {
    try {
        const { supplier, expectedDate, items, notes } = req.body;

        if (!supplier || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Supplier and items are required",
            });
        }

        for (const item of items) {
            const sku = await SKU.findById(item.sku);
            if (!sku) {
                return res.status(404).json({
                    success: false,
                    message: `SKU not found: ${item.sku}`,
                });
            }
        }

        const receipt = await Receipt.create({
            receiptNumber: generateReceiptNumber(),
            supplier,
            expectedDate: expectedDate || new Date(),
            items,
            notes,
            status: "created",
        });

        const populatedReceipt = await Receipt.findById(receipt._id).populate("items.sku", "skuCode name");

        res.status(201).json({
            success: true,
            message: "Receipt created successfully",
            data: populatedReceipt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllReceipts = async (req, res) => {
    try {
        const receipts = await Receipt.find()
            .populate("items.sku", "skuCode name weight length width height")
            .populate("receivedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: receipts.length,
            data: receipts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id)
            .populate("items.sku", "skuCode name weight length width height handlingClasses velocityClass")
            .populate("receivedBy", "name email");

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found",
            });
        }

        res.status(200).json({
            success: true,
            data: receipt,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.receiveGoods = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        console.log("Receipt ID:", id);

        // Find receipt with populated SKU
        const receipt = await Receipt.findById(id).populate("items.sku");

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found",
            });
        }

        console.log("Receipt:", receipt.receiptNumber, "Status:", receipt.status);

        if (receipt.status !== "created") {
            return res.status(400).json({
                success: false,
                message: `Receipt is already ${receipt.status}`,
            });
        }

        // Update received quantities
        for (const receivedItem of items) {
            const receiptItem = receipt.items.find(
                item => item.sku._id.toString() === receivedItem.skuId
            );

            if (receiptItem) {
                receiptItem.receivedQty = receivedItem.receivedQty;
                receiptItem.status = "completed";
                console.log(`Updated ${receiptItem.sku.skuCode}: Qty ${receiptItem.receivedQty}`);
            }
        }

        receipt.status = "receiving";
        receipt.receivedBy = req.user._id;
        await receipt.save();

        // Generate putaway tasks
        const putawayTasks = [];

        for (const item of receipt.items) {
            if (item.receivedQty > 0) {
                console.log(`\nCreating putaway task for: ${item.sku.skuCode}`);
                console.log(`Quantity: ${item.receivedQty}`);

                // Find a bin (any available bin for now)
                const bin = await Bin.findOne({ status: "AVAILABLE" });

                if (!bin) {
                    console.log("No bin found! Creating task without bin...");
                    // Create task without bin (will be assigned later)
                    const task = await Task.create({
                        taskType: "putaway",
                        receipt: receipt._id,
                        sku: item.sku._id,
                        qty: item.receivedQty,
                        sourceBin: null,
                        destinationBin: null,
                        priority: 2,
                        status: "pending",
                    });
                    putawayTasks.push(task);
                    console.log(`Task created: ${task._id} (no bin assigned)`);
                } else {
                    // Create task with bin
                    const task = await Task.create({
                        taskType: "putaway",
                        receipt: receipt._id,
                        sku: item.sku._id,
                        qty: item.receivedQty,
                        sourceBin: null,
                        destinationBin: bin._id,
                        priority: 2,
                        status: "pending",
                    });
                    putawayTasks.push(task);
                    console.log(`Task created: ${task._id} with bin ${bin.code}`);
                }
            }
        }

        console.log(`\nTotal putaway tasks created: ${putawayTasks.length}`);

        res.status(200).json({
            success: true,
            message: `Goods received. ${putawayTasks.length} putaway tasks created.`,
            data: {
                receipt,
                putawayTasks: putawayTasks,
                taskCount: putawayTasks.length,
            },
        });

    } catch (error) {
        console.error("Error in receiveGoods:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getPutawayTasks = async (req, res) => {
    try {
        console.log("Fetching putaway tasks...");

        const tasks = await Task.find({
            taskType: "putaway",
            status: { $in: ["pending", "assigned", "completed", "cancelled", "in_progress"] }
        })
            .populate("sku", "skuCode name weight length width height")
            .populate("destinationBin", "code x y volumeCapacity")
            .sort({ createdAt: 1 });

        console.log(`Found ${tasks.length} putaway tasks`);

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks,
        });

    } catch (error) {
        console.error("Error in getPutawayTasks:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.completePutaway = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { actualBinCode, scannedBinCode } = req.body;

        const task = await Task.findById(taskId)
            .populate("sku")
            .populate("destinationBin")
            .populate("receipt");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (task.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Task already completed",
            });
        }

        // Determine which bin to use
        let binCode = actualBinCode || scannedBinCode;
        let bin = null;

        if (binCode) {
            bin = await Bin.findOne({ code: binCode });
            if (!bin) {
                return res.status(404).json({
                    success: false,
                    message: `Bin not found: ${binCode}`,
                });
            }
        } else {
            bin = task.destinationBin;
        }

        // Check if bin has enough space
        const remainingVolume = await calculateRemainingVolume(bin._id);
        const skuVolume = (task.sku.length || 0) * (task.sku.width || 0) * (task.sku.height || 0);
        const requiredVolume = skuVolume * task.qty;

        console.log("...r", remainingVolume);
        console.log("ss", skuVolume)
        console.log("rrr", requiredVolume)

        if (remainingVolume < requiredVolume) {
            return res.status(400).json({
                success: false,
                message: `Not enough space in bin ${bin.code}. Required: ${requiredVolume}, Available: ${remainingVolume}`,
                remainingVolume,
                requiredVolume,
            });
        }

        // Update inventory
        let inventory = await Inventory.findOne({
            sku: task.sku._id,
            bin: bin._id,
            status: "available",
        });

        if (inventory) {
            inventory.qty += task.qty;
            await inventory.save();
        } else {
            inventory = await Inventory.create({
                sku: task.sku._id,
                bin: bin._id,
                qty: task.qty,
                status: "available",
            });
        }

        // Update bin volume
        await updateBinVolume(bin._id, task.sku, task.qty, true);

        // Update task
        task.status = "completed";
        task.completedAt = new Date();
        if (actualBinCode) {
            task.destinationBin = bin._id;
        }
        await task.save();

        // Update worker's last location
        const worker = await Worker.findOne({ userId: req.user._id });
        if (worker) {
            worker.lastBinId = bin.code;
            await worker.save();
        }

        // Check if all putaway tasks for this receipt are done
        if (task.receipt) {
            const remainingTasks = await Task.find({
                receipt: task.receipt._id,
                taskType: "putaway",
                status: { $ne: "completed" },
            });

            if (remainingTasks.length === 0) {
                await Receipt.findByIdAndUpdate(task.receipt._id, {
                    status: "closed",
                });
            } else {
                await Receipt.findByIdAndUpdate(task.receipt._id, {
                    status: "putaway",
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Putaway completed successfully",
            data: {
                inventory,
                bin: {
                    code: bin.code,
                    remainingVolume: remainingVolume - requiredVolume,
                },
                task,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findById(req.params.id);

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: "Receipt not found",
            });
        }

        // Only allow deletion of created receipts
        if (receipt.status !== "created") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete receipt that is already in progress",
            });
        }

        await Receipt.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Receipt deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

