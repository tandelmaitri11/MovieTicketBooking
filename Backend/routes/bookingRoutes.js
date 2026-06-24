const express = require("express");
const router = express.Router();
const protect = require("../Middleware/authmiddleware");
const adminOnly = require("../Middleware/adminMiddleware");
const { getMyBookings, getAllBookings, createBooking, createRazorpayOrder } = require("../controller/bookingController");

router.post("/order", protect, createRazorpayOrder);
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, adminOnly, getAllBookings);

module.exports = router;
