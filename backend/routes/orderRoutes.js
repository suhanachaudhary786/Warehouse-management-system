
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    trackShipment,

    getWorkerOrders,
    getWorkerOrderStats
} = require("../controllers/orderController");

router.route("/")
    .get(protect, getAllOrders)
    .post(protect, authorizeRoles("manager"), createOrder);

router.route("/:id")
    .get(protect, getOrderById)
    .put(protect, authorizeRoles("manager"), updateOrderStatus)
    .delete(protect, authorizeRoles("manager"), deleteOrder);

router.get("/:id/track", protect, trackShipment);


router.get("/worker/:workerId", protect, getWorkerOrders);
router.get("/worker/:workerId/stats", protect, getWorkerOrderStats);


module.exports = router;