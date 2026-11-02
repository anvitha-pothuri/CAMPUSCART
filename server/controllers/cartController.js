
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ADD PRODUCT TO CART
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid product ID and quantity are required"
            });
        }

        const product = await Product.findOne({
            _id: productId,
            status: "Available"
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unavailable"
            });
        }

        if (product.seller.toString() === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot add your own product to cart"
            });
        }

        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            cart = new Cart({
                user: req.user.userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to add product to cart",
            error: error.message
        });
    }
};


// VIEW CART
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        }).populate("items.product");

        res.status(200).json({
            success: true,
            cart: cart || { items: [] }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch cart",
            error: error.message
        });
    }
};


// REMOVE PRODUCT FROM CART
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to remove product",
            error: error.message
        });
    }
};


// UPDATE CART QUANTITY
const updateCartQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const cart = await Cart.findOne({
            user: req.user.userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.product.toString() === req.params.productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        item.quantity = quantity;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update cart",
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
};
