
const Worker = require("../models/Worker");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createWorker = async (req, res) => {
    try {
        const { name, email, password, skills, equipmentAuth, maxSafeWeight, status, lastBinId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User account for worker
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: "worker"
        });

        // Create Worker profile
        const worker = await Worker.create({
            name: name,
            email: email,
            password: hashedPassword,
            skills: skills || [],
            equipmentAuth: equipmentAuth || [],
            maxSafeWeight: maxSafeWeight,
            status: status || "available",
            lastBinId: lastBinId || "A1",
            userId: user._id  // Link to User model
        });

        res.status(201).json({
            success: true,
            message: "Worker created successfully",
            data: {
                worker: worker,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllWorkers = async (req, res) => {
    const workers = await Worker.find();

    res.status(200).json({
        success: true,
        data: workers,
    });
};

exports.getWorkerById = async (req, res) => {
    const worker = await Worker.findById(
        req.params.id
    );

    res.status(200).json({
        success: true,
        data: worker,
    });
};

exports.updateWorker = async (req, res) => {
    const worker =
        await Worker.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

    res.status(200).json({
        success: true,
        data: worker,
    });
};

exports.deleteWorker = async (req, res) => {
    await Worker.findByIdAndDelete(
        req.params.id
    );

    res.status(200).json({
        success: true,
        message: "Worker deleted",
    });
};