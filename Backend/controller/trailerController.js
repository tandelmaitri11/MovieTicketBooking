const Trailer = require("../Models/Trailer");
const mongoose = require("mongoose");

// GET trailers by movieId
exports.getTrailersByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    // 🛑 validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const trailers = await Trailer.find({ movieId });

    res.status(200).json(trailers);
  } catch (error) {
    console.error("Trailer fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE trailer
exports.createTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.create(req.body);
    res.status(201).json(trailer);
  } catch (error) {
    console.error("Trailer create error:", error);
    res.status(500).json({ message: error.message });
  }
};
