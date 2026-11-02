
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const User = require("../models/User");

// PLACE ORDER
const placeOrder = async (req, res) => {
    try {
        const { deliveryAddress, paymentMethod, items } = req.body;

        if (
            !deliveryAddress ||
            !deliveryAddress.fullName ||
            !deliveryAddress.phone ||
            !deliveryAddress.street ||
            !deliveryAddress.city ||
            !deliveryAddress.state ||
            !deliveryAddress.postalCode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide complete delivery address"
            });
        }

        if (!["COD", "ONLINE"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        let requestedItems = [];

        if (Array.isArray(items) && items.length > 0) {
            requestedItems = items;
        } else {
            const cart = await Cart.findOne({
                user: req.user.userId
            }).populate("items.product");

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Your cart is empty"
                });
            }

            requestedItems = cart.items.map(item => ({
                product: item.product?._id,
                quantity: item.quantity
            }));
        }

        if (requestedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        let totalAmount = 0;
        const orderItems = [];
        const orderedProducts = [];

        for (const item of requestedItems) {
            const productId = item.product || item.productId;
            const quantity = Number(item.quantity);

            if (!productId || !Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product or quantity"
                });
            }

            const product = await Product.findById(productId);

            if (!product || product.status !== "Available") {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is unavailable"
                });
            }

            if (product.seller.toString() === req.user.userId) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot purchase your own product"
                });
            }

            if (quantity !== 1) {
                return res.status(400).json({
                    success: false,
                    message: `${product.title} can only be purchased once`
                });
            }

            totalAmount += Number(product.price);

            orderItems.push({
                product: product._id,
                title: product.title,
                price: product.price,
                quantity
            });

            orderedProducts.push(product);
        }

        const uniqueIds = new Set(
            orderItems.map(item => item.product.toString())
        );

        if (uniqueIds.size !== orderItems.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate products found in your cart"
            });
        }

        // Create order
        const order = await Order.create({
            buyer: req.user.userId,
            items: orderItems,
            deliveryAddress,
            totalAmount,
            paymentMethod,
            paymentStatus: "Pending",
            orderStatus: "Placed"
        });

        // Mark products as sold
        for (const product of orderedProducts) {
            await Product.findByIdAndUpdate(product._id, {
                status: "Sold"
            });
        }

        // Create one notification for each seller in this order
        try {
            const buyer = await User.findById(req.user.userId)
                .select("fullName");

            const sellerProducts = {};

            orderedProducts.forEach(product => {
                const sellerId = product.seller.toString();

                if (!sellerProducts[sellerId]) {
                    sellerProducts[sellerId] = [];
                }

                sellerProducts[sellerId].push(product.title);
            });

            const notifications = Object.entries(sellerProducts).map(
                ([sellerId, productTitles]) => ({
                    seller: sellerId,
                    buyer: req.user.userId,
                    order: order._id,
                    productTitles,
                    message: `${buyer?.fullName || "A buyer"} ordered ${productTitles.join(", ")}.`
                })
            );

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

        } catch (notificationError) {
            // Do not report order failure if notification creation fails.
            console.error(
                "Seller notification creation failed:",
                notificationError.message
            );
        }

        // Clear database cart
        await Cart.findOneAndUpdate(
            { user: req.user.userId },
            { $set: { items: [] } }
        );

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to place order",
            error: error.message
        });
    }
};


// GET BUYER'S ORDERS
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            buyer: req.user.userId
        })
            .populate("items.product")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch orders",
            error: error.message
        });
    }
};


// GET ORDERS CONTAINING LOGGED-IN SELLER'S PRODUCTS
const getSellerOrders = async (req, res) => {
    try {
        const sellerProducts = await Product.find({
            seller: req.user.userId
        }).select("_id");

        const productIds = sellerProducts.map(product => product._id);

        const orders = await Order.find({
            "items.product": { $in: productIds }
        })
            .populate("buyer", "fullName email")
            .populate({
                path: "items.product",
                select: "title price seller status"
            })
            .sort({ createdAt: -1 });

        const sellerOrders = orders.map(order => {
            const myItems = order.items.filter(item =>
                item.product &&
                item.product.seller &&
                item.product.seller.toString() === req.user.userId
            );

            return {
                ...order.toObject(),
                items: myItems
            };
        }).filter(order => order.items.length > 0);

        return res.status(200).json({
            success: true,
            count: sellerOrders.length,
            orders: sellerOrders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch seller orders",
            error: error.message
        });
    }
};


module.exports = {
    placeOrder,
    getMyOrders,
    getSellerOrders
};
