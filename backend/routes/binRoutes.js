
const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createBin,
    getAllBins,
    getBinById,
    updateBin,
    deleteBin,
    deactivateBin,
    activateBin,
    hardDeleteBin,
} = require("../controllers/binController");

// Basic CRUD routes
router.route("/")
    .get(protect, getAllBins)
    .post(protect, authorizeRoles("manager"), createBin);

router.route("/:id")
    .get(protect, getBinById)
    .put(protect, authorizeRoles("manager"), updateBin)
    .delete(protect, authorizeRoles("manager"), deleteBin);  // Legacy delete with safety check

router.put("/:id/deactivate", protect, authorizeRoles("manager"), deactivateBin);
router.put("/:id/activate", protect, authorizeRoles("manager"), activateBin);

router.delete("/:id/hard", protect, authorizeRoles("manager"), hardDeleteBin);

module.exports = router;