
import API from "./axios";

// REGISTER
export const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

// VERIFY EMAIL OTP
export const verifyOTP = async (otpData) => {
    const response = await API.post("/auth/verify-otp", otpData);
    return response.data;
};

// LOGIN
export const loginUser = async (loginData) => {
    const response = await API.post("/auth/login", loginData);
    return response.data;
};

// FORGOT PASSWORD
export const forgotPassword = async (emailData) => {
    const response = await API.post("/auth/forgot-password", emailData);
    return response.data;
};

// VERIFY RESET OTP
export const verifyResetOTP = async (otpData) => {
    const response = await API.post("/auth/verify-reset-otp", otpData);
    return response.data;
};

// RESET PASSWORD
export const resetPassword = async (passwordData) => {
    const response = await API.post("/auth/reset-password", passwordData);
    return response.data;
};
