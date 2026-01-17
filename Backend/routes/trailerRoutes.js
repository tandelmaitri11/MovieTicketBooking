const express = require("express");
const {
  getTrailersByMovie,
  createTrailer,
} = require("../controller/trailerController");

const router = express.Router();

// PUBLIC (NO TOKEN NEEDED)
router.get("/:movieId", getTrailersByMovie);

// PROTECTED (ADMIN)
router.post("/", createTrailer);

module.exports = router;
