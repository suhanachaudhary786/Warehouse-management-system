
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createReceipt,
    getAllReceipts,
    getReceiptById,
    receiveGoods,
    getPutawayTasks,
    completePutaway,
    deleteReceipt,
} = require("../controllers/receiptController");

// Manager routes
router.post("/", protect, authorizeRoles("manager"), createReceipt);
router.get("/", protect, getAllReceipts);
router.get("/:id", protect, getReceiptById);
router.delete("/:id", protect, authorizeRoles("manager"), deleteReceipt);

// Worker routes
router.put("/:id/receive", protect, receiveGoods);
router.get("/putaway/tasks", protect, getPutawayTasks);
router.put("/putaway/complete/:taskId", protect, completePutaway);

module.exports = router;