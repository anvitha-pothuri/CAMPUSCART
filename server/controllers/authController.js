const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// REGISTER USER
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        let user = await User.findOne({ email: normalizedEmail });

        if (user && user.isEmailVerified) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered. Please log in."
            });
        }

        // Generate a six-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        if (!user) {
            user = new User({
                fullName,
                email: normalizedEmail,
                password,
                emailOtpHash: otpHash,
                emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
            });
        } else {
            user.fullName = fullName;
            user.password = password;
            user.emailOtpHash = otpHash;
            user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        }

        await user.save();

        // Send OTP through email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: normalizedEmail,
            subject: "CAMPUSCART Email Verification",
            text: `Hello ${fullName},

Your CAMPUSCART verification OTP is: ${otp}

This OTP expires in 10 minutes.

If you did not request this, please ignore this email.`
        });

        res.status(201).json({
            success: true,
            message: "Registration started. Please check your email for the OTP."
        });

    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
};

// VERIFY EMAIL OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !user.emailOtpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification request."
            });
        }

        if (!user.emailOtpExpires || user.emailOtpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please register again."
            });
        }

        const isValidOTP = await bcrypt.compare(
            String(otp).trim(),
            user.emailOtpHash
        );

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP."
            });
        }

        user.isEmailVerified = true;
        user.emailOtpHash = null;
        user.emailOtpExpires = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in."
        });

    } catch (error) {
        console.error("OTP verification error:", error.message);
        res.status(500).json({
            success: false,
            message: "OTP verification failed."
        });
    }
};
// LOGIN USER
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check email verification
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response
        res.status(200).json({
            success: true,
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email."
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !user.isEmailVerified) {
            return res.status(404).json({
                success: false,
                message: "No verified account found with this email."
            });
        }

        // Generate six-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Hash OTP
        const otpHash = await bcrypt.hash(otp, 10);

        // Store OTP and expiry
        user.resetOtpHash = otpHash;
        user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        // Send reset OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: user.email,
            subject: "CAMPUSCART Password Reset OTP",
            text: `Hello ${user.fullName},

Your CAMPUSCART password reset OTP is: ${otp}

This OTP expires in 10 minutes.

If you did not request a password reset, please ignore this email.`
        });

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email."
        });

    } catch (error) {
        console.error("Forgot password error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to process password reset request."
        });
    }
};

// VERIFY PASSWORD RESET OTP
exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !user.resetOtpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid password reset request."
            });
        }

        if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        const isValidOTP = await bcrypt.compare(
            String(otp).trim(),
            user.resetOtpHash
        );

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP."
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can reset your password now."
        });

    } catch (error) {
        console.error("Reset OTP verification error:", error.message);

        return res.status(500).json({
            success: false,
            message: "OTP verification failed."
        });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Check required fields
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required."
            });
        }

        // Validate password strength
        const strongPassword =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPassword.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !user.resetOtpHash) {
            return res.status(400).json({
                success: false,
                message: "Invalid password reset request."
            });
        }

        // Check OTP expiry
        if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Verify OTP
        const isValidOTP = await bcrypt.compare(
            String(otp).trim(),
            user.resetOtpHash
        );

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP."
            });
        }

        // Update password
        user.password = newPassword;

        // Clear reset OTP
        user.resetOtpHash = null;
        user.resetOtpExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully! You can now log in with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Password reset failed. Please try again."
        });
    }
};
