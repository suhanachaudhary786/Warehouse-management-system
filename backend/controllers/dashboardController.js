
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Task = require("../models/Task");
const Bin = require("../models/Bin");

exports.getDashboardStats = async (
    req,
    res
) => {
    try {

        const totalOrders =
            await Order.countDocuments();

        const totalInventory =
            await Inventory.aggregate([
                {
                    $group: {
                        _id: null,
                        totalQty: {
                            $sum: "$qty"
                        }
                    }
                }
            ]);

        const activeTasks =
            await Task.countDocuments({
                status: {
                    $in: [
                        "pending",
                        "accepted",
                        "in_progress"
                    ]
                }
            });

        const totalBins =
            await Bin.countDocuments();

        const occupiedBins =
            await Inventory.distinct(
                "bin"
            );

        const occupancyPercentage =
            totalBins === 0
                ? 0
                : (
                    occupiedBins.length /
                    totalBins
                ) * 100;

        res.status(200).json({
            success: true,

            data: {
                totalOrders,

                totalInventory:
                    totalInventory[0]
                        ?.totalQty || 0,

                activeTasks,

                warehouseOccupancy:
                    occupancyPercentage.toFixed(
                        2
                    )
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


exports.getTaskSummary =
    async (req, res) => {

        const summary =
            await Task.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);

        res.status(200).json({
            success: true,
            data: summary
        });

    };