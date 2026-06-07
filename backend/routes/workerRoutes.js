
const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createWorker,
    getAllWorkers,
    getWorkerById,
    updateWorker,
    deleteWorker,
} = require("../controllers/workerController");

router.route("/")
    .get(protect, getAllWorkers)
    .post(
        protect,
        authorizeRoles("manager"),
        createWorker
    );

router.route("/:id")
    .get(protect, getWorkerById)
    .put(
        protect,
        authorizeRoles("manager"),
        updateWorker
    )
    .delete(
        protect,
        authorizeRoles("manager"),
        deleteWorker
    );

module.exports = router;