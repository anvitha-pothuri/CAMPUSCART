
const Product = require("../models/Product");

// ADD PRODUCT
const addProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition,
            images
        } = req.body;

        if (!title || !description || !price || !category || !condition) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required product details"
            });
        }

        const product = await Product.create({
            title,
            description,
            price,
            category,
            condition,
            images: images || [],
            seller: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to add product",
            error: error.message
        });
    }
};


// GET AVAILABLE PRODUCTS FOR MARKETPLACE
const getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;

        const filter = {
            status: "Available"
        };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        const products = await Product.find(filter)
            .populate("seller", "fullName")
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


// GET ALL PRODUCTS CREATED BY LOGGED-IN SELLER
// Includes both Available and Sold products
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            seller: req.user.userId
        })
            .populate("seller", "fullName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch your listings",
            error: error.message
        });
    }
};


// GET SINGLE PRODUCT DETAILS
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("seller", "fullName email");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch product details",
            error: error.message
        });
    }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.seller.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own products"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "price",
            "category",
            "condition",
            "images"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update product",
            error: error.message
        });
    }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.seller.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own products"
            });
        }

        await product.deleteOne();

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
    addProduct,
    getProducts,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
