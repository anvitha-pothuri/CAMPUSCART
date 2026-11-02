
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// ADD TO WISHLIST
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.seller.toString() === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "You cannot wishlist your own product"
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.user.userId
        });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user.userId,
                products: []
            });
        }

        if (wishlist.products.some(id => id.toString() === productId)) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to add to wishlist",
            error: error.message
        });
    }
};


// VIEW WISHLIST
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user.userId
        }).populate("products");

        res.status(200).json({
            success: true,
            wishlist: wishlist || { products: [] }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch wishlist",
            error: error.message
        });
    }
};


// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user.userId
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        wishlist.products = wishlist.products.filter(
            id => id.toString() !== req.params.productId
        );

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to remove product",
            error: error.message
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
