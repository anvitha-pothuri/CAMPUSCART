
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addProduct,
    getProducts,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

router.post("/", protect, addProduct);

// Marketplace products
router.get("/", getProducts);

// Logged-in seller's complete listings
router.get("/my-listings", protect, getMyProducts);

// Single product
router.get("/:id", getProductById);

router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
