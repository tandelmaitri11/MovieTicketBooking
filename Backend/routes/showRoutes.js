const express = require("express");
const {
  getShows,
  getShowById,
  getShowsByMovie,
  createShows,
} = require("../controller/showController");
const protect = require("../Middleware/authmiddleware");
const adminOnly = require("../Middleware/adminMiddleware");

const router = express.Router();

// Public
router.get("/", getShows);
router.get("/movie/:movieId", getShowsByMovie);
router.get("/:id", getShowById);

// Admin (Protected)
router.post("/", protect, adminOnly, createShows);

module.exports = router;
