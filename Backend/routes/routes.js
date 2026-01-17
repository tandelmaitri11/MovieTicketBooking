const express = require("express");
const router = express.Router();
const authController = require("../controller/userController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
