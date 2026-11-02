
const User = require("../models/User");

// GET USER PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password -emailOtpHash -emailOtpExpires -resetOtpHash -resetOtpExpires");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch profile",
            error: error.message
        });
    }
};


// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Full name cannot be empty"
                });
            }

            user.fullName = fullName.trim();
        }

        if (phone !== undefined) {
            user.phone = phone;
        }

        if (address && typeof address === "object") {
            const allowedFields = [
                "street",
                "city",
                "state",
                "postalCode",
                "country"
            ];

            allowedFields.forEach((field) => {
                if (address[field] !== undefined) {
                    user.address[field] = address[field];
                }
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to update profile",
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
