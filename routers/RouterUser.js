const express = require("express");
const { doSignup, doLogin, doResetPassword, genOtp, getToken, logout,verifyOtp } = require("../controllers/ControllerUser");
const limiter = require("../MiddleWare/rateLimiter")
const router = express.Router();

// Public routes for user registration, authentication & password recovery
router.post("/signup",limiter(5,60) ,doSignup);
router.post("/login",limiter(5,15), doLogin);
router.post("/reset-password",limiter(3,15), doResetPassword);
router.post("/otp",limiter(3,15), genOtp);
router.post("/verify-otp",limiter(3,15), verifyOtp);

// Token refresh & session management (uses refreshToken cookie)
router.post("/genToken",limiter(30,1), getToken);
router.post("/logout", logout);

module.exports = router;
