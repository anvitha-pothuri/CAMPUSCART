
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        productTitles: [{
            type: String
        }],

        message: {
            type: String,
            required: true
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

notificationSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

