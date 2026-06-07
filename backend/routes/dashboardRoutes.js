
const express = require("express");

const router =
    express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    getDashboardStats, getTaskSummary
} = require(
    "../controllers/dashboardController"
);

router.get(
    "/stats",
    protect,
    getDashboardStats
);

router.get(
    "/task-summary",
    protect,
    getTaskSummary
);

module.exports = router;