

// routes/shipmentRoutes.js - Simplified

const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createShipment,
    getAllShipments,
    getShipmentById,
    updateShipmentStatus,
    deleteShipment,
    getWorkerShipments,
} = require("../controllers/shippingController");

// Manager routes
router.route("/")
    .get(protect, getAllShipments)
    .post(protect, authorizeRoles("manager"), createShipment);

router.route("/:id")
    .get(protect, getShipmentById)
    .put(protect, authorizeRoles("manager"), updateShipmentStatus)
    .delete(protect, authorizeRoles("manager"), deleteShipment);

// Worker routes
router.get("/worker/:workerId", protect, getWorkerShipments);

module.exports = router;