
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require("../controllers/notificationController");

router.get("/", protect, getMyNotifications);

router.patch("/read-all", protect, markAllNotificationsAsRead);

router.patch("/:id/read", protect, markNotificationAsRead);

module.exports = router;
