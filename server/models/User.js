
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
    type: String,
    default: ""
},

address: {
    street: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    postalCode: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: "India"
    }
},

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer"
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        // Registration OTP
        emailOtpHash: {
            type: String,
            default: null
        },

        emailOtpExpires: {
            type: Date,
            default: null
        },

        // Password Reset OTP
        resetOtpHash: {
            type: String,
            default: null
        },

        resetOtpExpires: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
