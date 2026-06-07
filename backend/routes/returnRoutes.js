
const express =
    require("express");

const router =
    express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    createReturn, restockReturn, damageReturn, quarantineReturn, getReturns, getReturnById
}
    =
    require("../controllers/returnController");

router.post(
    "/create",
    protect,
    createReturn
);

router.put(
    "/restock/:id",
    protect,
    restockReturn
);

router.put(
    "/damage/:id",
    protect,
    damageReturn
);

router.put(
    "/quarantine/:id",
    protect,
    quarantineReturn
);

router.get(
    "/all",
    protect,
    getReturns
);

router.get("/:id", protect, getReturnById);

module.exports = router;