
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 1
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Textbooks",
                "Calculators",
                "Lab Coats",
                "Electronics",
                "Stationery",
                "Story Books",
                "Lab Equipment",
                "Project Materials",
                "Other"
            ]
        },

        condition: {
            type: String,
            required: true,
            enum: ["New", "Like New", "Good", "Acceptable"]
        },

        images: [{
            type: String
        }],

        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["Available", "Sold"],
            default: "Available"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
