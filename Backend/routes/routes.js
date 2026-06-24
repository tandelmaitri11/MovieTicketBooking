const express = require("express");
const router = express.Router();
const authController = require("../controller/userController");
const protect = require("../Middleware/authmiddleware");
const adminOnly = require("../Middleware/adminMiddleware");
const upload = require("../Middleware/uploadMiddleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.put("/me", protect, authController.updateMe);
router.put("/me/password", protect, authController.updatePassword);
router.post("/me/avatar", protect, upload.single("avatar"), authController.uploadProfilePic);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-otp", authController.verifyOtp);
router.get("/users", protect, adminOnly, authController.getAllUsers);
router.delete("/users/:id", protect, adminOnly, authController.deleteUser);

module.exports = router;
