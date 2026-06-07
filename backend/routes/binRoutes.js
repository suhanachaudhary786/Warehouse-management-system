
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
} = require("../controllers/binController");

router.route("/")
    .get(protect, getAllBins)
    .post(
        protect,
        authorizeRoles("manager"),
        createBin
    );

router.route("/:id")
    .get(protect, getBinById)
    .put(
        protect,
        authorizeRoles("manager"),
        updateBin
    )
    .delete(
        protect,
        authorizeRoles("manager"),
        deleteBin
    );

module.exports = router;