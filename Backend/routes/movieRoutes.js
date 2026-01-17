const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
} = require("../controller/movieController");

const protect = require("../Middleware/authmiddleware");

// Public
router.get("/", getAllMovies);
router.get("/:id", getMovieById);

// Admin (Protected)
router.post("/", protect, createMovie);

module.exports = router;
