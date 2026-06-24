const Trailer = require("../models/Trailer");
const mongoose = require("mongoose");

// GET trailers by movieId
exports.getTrailersByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const trailers = await Trailer.find({ movieId }).sort({ createdAt: -1 });

    res.status(200).json(trailers);
  } catch (error) {
    console.error("Trailer fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE trailer (manual add)
exports.createTrailer = async (req, res) => {
  try {
    const { movieId, videoUrl, image } = req.body;

    if (!movieId || !videoUrl) {
      return res.status(400).json({ message: "movieId and videoUrl required" });
    }

    const trailer = await Trailer.create({ movieId, videoUrl, image: image || "" });
    res.status(201).json(trailer);
  } catch (error) {
    console.error("Trailer create error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET all trailers
exports.getAllTrailers = async (req, res) => {
  try {
    const trailers = await Trailer.find().sort({ createdAt: -1 });
    res.status(200).json(trailers);
  } catch (error) {
    console.error("Trailer fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPLOAD trailer video (and optional image)
exports.uploadTrailer = async (req, res) => {
  try {
    const { movieId } = req.body;

    if (!movieId) return res.status(400).json({ message: "movieId is required" });

    const videoFile = req.files?.video?.[0];
    if (!videoFile) return res.status(400).json({ message: "video file is required" });

    const imageFile = req.files?.image?.[0];

    const trailer = await Trailer.create({
      movieId,
      image: imageFile ? `/uploads/images/${imageFile.filename}` : "",
      videoUrl: `/uploads/videos/${videoFile.filename}`,
    });

    res.status(201).json(trailer);
  } catch (error) {
    console.error("Trailer upload error:", error);
    res.status(500).json({ message: error.message });
  }
};
