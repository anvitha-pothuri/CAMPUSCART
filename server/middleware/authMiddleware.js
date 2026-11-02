
const jwt = require("jsonwebtoken");

// AUTHENTICATION MIDDLEWARE
const protect = async (req, res, next) => {
    try {
        // Get token from request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please log in."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach user details to request
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again."
        });
    }
};

module.exports = protect;
