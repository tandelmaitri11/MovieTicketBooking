const express = require("express");
const {
  getAllTrailers,
  getTrailersByMovie,
  createTrailer,
  uploadTrailer,
} = require("../controller/trailerController");

const protect = require("../middleware/authmiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const upload = require("../middleware/trailerUploadMiddleware");

const router = express.Router();

router.get("/", getAllTrailers);
router.get("/:movieId", getTrailersByMovie);

// ADMIN
router.post("/", protect, adminOnly, createTrailer);

router.post(
  "/upload",
  protect,
  adminOnly,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  uploadTrailer
);

module.exports = router;
