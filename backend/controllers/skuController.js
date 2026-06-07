
const SKU = require("../models/SKU");

exports.createSKU = async (req, res) => {
    try {
        const sku = await SKU.create(req.body);

        res.status(201).json({
            success: true,
            data: sku,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllSKUs = async (req, res) => {
    try {
        const skus = await SKU.find();

        res.status(200).json({
            success: true,
            count: skus.length,
            data: skus,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getSKUById = async (req, res) => {
    try {
        const sku = await SKU.findById(req.params.id);

        if (!sku) {
            return res.status(404).json({
                success: false,
                message: "SKU not found",
            });
        }

        res.status(200).json({
            success: true,
            data: sku,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateSKU = async (req, res) => {
    try {
        const sku = await SKU.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        res.status(200).json({
            success: true,
            data: sku,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteSKU = async (req, res) => {
    try {
        await SKU.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "SKU deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};