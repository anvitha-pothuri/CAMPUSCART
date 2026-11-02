
const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyOTP,
    loginUser,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require("../controllers/authController");

// Registration
router.post("/register", registerUser);

// Email verification
router.post("/verify-otp", verifyOTP);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
