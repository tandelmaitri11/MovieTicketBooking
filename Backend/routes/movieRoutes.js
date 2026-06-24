const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  createMovieUpload,
} = require("../controller/movieController");

const protect = require("../Middleware/authmiddleware");
const adminOnly = require("../Middleware/adminMiddleware");
const upload = require("../Middleware/movieUploadMiddleware");

// Public
router.get("/", getAllMovies);
router.get("/:id", getMovieById);

// Admin (Protected)
router.post("/", protect, adminOnly, createMovie);
router.post(
  "/upload",
  protect,
  adminOnly,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "backdrop", maxCount: 1 },
  ]),
  createMovieUpload
);

module.exports = router;
