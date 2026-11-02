
const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getMyOrders,
    getSellerOrders
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

// Place a new order
router.post("/place", protect, placeOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);
router.get("/seller-orders", protect, getSellerOrders);

module.exports = router;
