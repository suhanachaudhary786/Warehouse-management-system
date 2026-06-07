
const Bin = require("../models/Bin");

exports.createBin = async (req, res) => {
    const bin = await Bin.create(req.body);

    res.status(201).json({
        success: true,
        data: bin,
    });
};

exports.getAllBins = async (req, res) => {
    const bins = await Bin.find();

    res.status(200).json({
        success: true,
        data: bins,
    });
};

exports.getBinById = async (req, res) => {
    const bin = await Bin.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: bin,
    });
};

exports.updateBin = async (req, res) => {
    const bin = await Bin.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json({
        success: true,
        data: bin,
    });
};

exports.deleteBin = async (req, res) => {
    await Bin.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Bin deleted",
    });
};