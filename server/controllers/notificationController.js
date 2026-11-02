
const Notification = require("../models/Notification");

// GET LOGGED-IN SELLER'S NOTIFICATIONS
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            seller: req.user.userId
        })
            .populate("buyer", "fullName email")
            .populate("order", "totalAmount paymentMethod orderStatus createdAt")
            .sort({ createdAt: -1 });

        const unreadCount = notifications.filter(
            notification => !notification.isRead
        ).length;

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch notifications",
            error: error.message
        });
    }
};


// MARK ONE NOTIFICATION AS READ
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                seller: req.user.userId
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update notification",
            error: error.message
        });
    }
};


// MARK ALL NOTIFICATIONS AS READ
const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                seller: req.user.userId,
                isRead: false
            },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update notifications",
            error: error.message
        });
    }
};


module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
