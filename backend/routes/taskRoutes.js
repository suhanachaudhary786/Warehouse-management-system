

// routes/taskRoutes.js - Add worker-specific routes
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
    getPendingTasks,
    acceptTask,
    getPickTasks,
    completePickTask,
    generatePackTask,
    getPackTasks,
    completePackTask,
    generateShipTask,
    getShipTasks,
    completeShipTask,
    // New worker functions
    getWorkerTasks,
    getWorkerPendingTasks,
    completeWorkerTask,
    getWorkerTaskStats
} = require("../controllers/taskController");

// Existing routes
router.get("/pending", protect, getPendingTasks);
router.put("/accept/:id", protect, acceptTask);
router.get("/pick-tasks", protect, getPickTasks);
router.put("/pick-complete/:id", protect, completePickTask);
router.post("/generate-pack/:taskId", protect, generatePackTask);
router.get("/pack-tasks", protect, getPackTasks);
router.put("/pack-complete/:id", protect, completePackTask);
router.post("/generate-ship", protect, generateShipTask);
router.get("/ship-tasks", protect, getShipTasks);
router.put("/ship-complete/:id", protect, completeShipTask);

// NEW: Worker-specific routes
router.get("/worker/:workerId", protect, getWorkerTasks);
router.get("/worker/:workerId/pending", protect, getWorkerPendingTasks);
router.get("/worker/:workerId/stats", protect, getWorkerTaskStats);
router.put("/worker/complete/:id", protect, completeWorkerTask);

module.exports = router;