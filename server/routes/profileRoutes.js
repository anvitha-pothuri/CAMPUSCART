
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile
} = require("../controllers/profileController");

// Get logged-in user's profile
router.get("/", protect, getProfile);

// Update logged-in user's profile
router.put("/", protect, updateProfile);

module.exports = router;
