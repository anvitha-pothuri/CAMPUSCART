
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password -otp -resetPasswordOTP");

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch users",
            error: error.message
        });
    }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("seller", "fullName email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch products",
            error: error.message
        });
    }
};

// GET ALL ORDERS
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("buyer", "fullName email")
            .populate("items.product", "title price")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch orders",
            error: error.message
        });
    }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Placed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update order status",
            error: error.message
        });
    }
};

// DELETE PRODUCT (ADMIN)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to delete product",
            error: error.message
        });
    }
};



module.exports = {
    getAllUsers,
    getAllProducts,
    getAllOrders,
    updateOrderStatus,
    deleteProduct
};
