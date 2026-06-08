
const Inventory = require("../models/Inventory");


exports.createInventory = async (
    req,
    res
) => {
    try {
        const inventory =
            await Inventory.create(req.body);

        res.status(201).json({
            success: true,
            data: inventory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getInventories = async (
    req,
    res
) => {
    try {
        const inventories =
            await Inventory.find()
                .populate("sku")
                .populate("bin");

        res.status(200).json({
            success: true,
            count: inventories.length,
            data: inventories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getInventoryById = async (
    req,
    res
) => {
    try {
        const inventory =
            await Inventory.findById(
                req.params.id
            )
                .populate("sku")
                .populate("bin");

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message:
                    "Inventory not found",
            });
        }

        res.status(200).json({
            success: true,
            data: inventory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.updateInventory = async (
    req,
    res
) => {
    try {
        const inventory =
            await Inventory.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                }
            );

        res.status(200).json({
            success: true,
            data: inventory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.deleteInventory = async (
    req,
    res
) => {
    try {
        await Inventory.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Inventory deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.searchInventory = async (
    req,
    res
) => {
    try {
        const {
            sku,
            bin,
            status,
        } = req.query;

        let query = {};

        if (sku) query.sku = sku;
        if (bin) query.bin = bin;
        if (status)
            query.status = status;

        const inventory =
            await Inventory.find(query)
                .populate("sku")
                .populate("bin");

        res.status(200).json({
            success: true,
            data: inventory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.getBinOccupancy =
    async (req, res) => {
        try {
            const occupancy =
                await Inventory.aggregate([
                    {
                        $group: {
                            _id: "$bin",
                            totalQty: {
                                $sum: "$qty",
                            },
                        },
                    },
                ]);

            res.status(200).json({
                success: true,
                data: occupancy,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message:
                    error.message,
            });
        }
    };