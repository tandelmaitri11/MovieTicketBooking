const mongoose = require("mongoose");
const Show = require("../Models/Show");
const Movie = require("../Models/Movie");

// GET all shows
exports.getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.status(200).json(shows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shows" });
  }
};

// GET show by ID
exports.getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid show ID" });
    }

    const show = await Show.findById(id).populate("movie");
    if (!show) {
      return res.status(404).json({ message: "Show not found" });
    }
    res.status(200).json(show);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch show" });
  }
};

// GET shows by movie
exports.getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const shows = await Show.find({ movie: movieId })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.status(200).json(shows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shows" });
  }
};

// CREATE shows (Admin)
exports.createShows = async (req, res) => {
  try {
    const { movieId, showPrice, showDateTimes, showDateTime } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: "movieId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }
    if (showPrice === undefined || showPrice === null || showPrice === "") {
      return res.status(400).json({ message: "showPrice is required" });
    }

    const movieExists = await Movie.exists({ _id: movieId });
    if (!movieExists) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const dateTimes =
      Array.isArray(showDateTimes) && showDateTimes.length > 0
        ? showDateTimes
        : showDateTime
        ? [showDateTime]
        : [];

    if (dateTimes.length === 0) {
      return res
        .status(400)
        .json({ message: "showDateTime(s) is required" });
    }

    const docs = dateTimes.map((dt) => ({
      movie: movieId,
      showDateTime: dt,
      showPrice,
    }));

    const created = await Show.insertMany(docs);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: "Failed to create shows" });
  }
};
