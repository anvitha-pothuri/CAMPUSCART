
const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getAllProducts,
    getAllOrders,
    updateOrderStatus,
    deleteProduct
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// All routes require login and admin access
router.get("/users", protect, admin, getAllUsers);

router.get("/products", protect, admin, getAllProducts);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);
router.delete("/products/:id", protect, admin, deleteProduct);

module.exports = router;
