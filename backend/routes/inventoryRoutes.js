
const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const {
    createInventory,
    getInventories,
    getInventoryById,
    updateInventory,
    deleteInventory,
    searchInventory,
    getBinOccupancy
} = require(
    "../controllers/inventoryController"
);

router
    .route("/")
    .get(protect, getInventories)
    .post(
        protect,
        authorizeRoles("manager"),
        createInventory
    );

router
    .route("/:id")
    .get(protect, getInventoryById)
    .put(
        protect,
        authorizeRoles("manager"),
        updateInventory
    )
    .delete(
        protect,
        authorizeRoles("manager"),
        deleteInventory
    );


router.get(
    "/search/filter",
    protect,
    searchInventory
);


router.get(
    "/occupancy/map",
    protect,
    getBinOccupancy
);

module.exports = router;