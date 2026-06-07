
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createSKU,
    getAllSKUs,
    getSKUById,
    updateSKU,
    deleteSKU,
} = require("../controllers/skuController");

router.route("/")
    .get(protect, getAllSKUs)
    .post(
        protect,
        authorizeRoles("manager"),
        createSKU
    );

router.route("/:id")
    .get(protect, getSKUById)
    .put(
        protect,
        authorizeRoles("manager"),
        updateSKU
    )
    .delete(
        protect,
        authorizeRoles("manager"),
        deleteSKU
    );

module.exports = router;