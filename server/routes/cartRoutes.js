
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
} = require("../controllers/cartController");

router.post("/add", protect, addToCart);

router.get("/", protect, getCart);

router.delete("/remove/:productId", protect, removeFromCart);

router.put("/update/:productId", protect, updateCartQuantity);

module.exports = router;
