
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                title: {
                    type: String,
                    required: true
                },

                price: {
                    type: Number,
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],

        deliveryAddress: {
            fullName: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: {
                type: String,
                default: "India"
            }
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "Placed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Placed"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
