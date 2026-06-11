
const Bin = require("../models/Bin");
const Inventory = require("../models/Inventory");

// CREATE BIN
exports.createBin = async (req, res) => {
    try {
        const bin = await Bin.create(req.body);

        res.status(201).json({
            success: true,
            data: bin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL BINS
exports.getAllBins = async (req, res) => {
    try {
        const bins = await Bin.find();

        res.status(200).json({
            success: true,
            data: bins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET BIN BY ID
exports.getBinById = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found",
            });
        }

        res.status(200).json({
            success: true,
            data: bin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE BIN
exports.updateBin = async (req, res) => {
    try {
        const bin = await Bin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found",
            });
        }

        res.status(200).json({
            success: true,
            data: bin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 🟢 SOFT DELETE - Deactivate Bin (Recommended)
exports.deactivateBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found",
            });
        }

        // Check if bin has any inventory
        const inventoryInBin = await Inventory.find({ bin: bin._id });

        if (inventoryInBin.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot deactivate bin. ${inventoryInBin.length} item(s) still in this bin. Please move stock first.`,
                items: inventoryInBin.map(i => ({
                    sku: i.sku,
                    qty: i.qty
                }))
            });
        }

        // Deactivate bin (soft delete)
        bin.status = "INACTIVE";
        bin.isActive = false;
        await bin.save();

        res.status(200).json({
            success: true,
            message: "Bin deactivated successfully",
            data: bin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 🟢 ACTIVATE BIN (Reactivate deactivated bin)
exports.activateBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found",
            });
        }

        // Reactivate bin
        bin.status = "AVAILABLE";
        bin.isActive = true;
        await bin.save();

        res.status(200).json({
            success: true,
            message: "Bin activated successfully",
            data: bin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 🔴 HARD DELETE - Permanently delete (Only for empty bins, use with caution)
exports.hardDeleteBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found",
            });
        }

        // Check if bin has any inventory
        const inventoryInBin = await Inventory.find({ bin: bin._id });

        if (inventoryInBin.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete bin. ${inventoryInBin.length} item(s) still in this bin. Move stock first.`,
                items: inventoryInBin
            });
        }

        // Permanent delete
        await Bin.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Bin permanently deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ⚠️ LEGACY DELETE - Keep for backward compatibility but mark as deprecated
exports.deleteBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: "Bin not found",
            });
        }

        // Check if bin has any inventory
        const inventoryInBin = await Inventory.find({ bin: bin._id });

        if (inventoryInBin.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete bin. ${inventoryInBin.length} item(s) still in this bin. Please move stock first.`,
                items: inventoryInBin
            });
        }

        await Bin.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Bin deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};