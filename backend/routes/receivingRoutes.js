
const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    receiveInventory
}
    =
    require("../controllers/receivingController");

router.post(
    "/receive",
    protect,
    receiveInventory
);

module.exports = router;