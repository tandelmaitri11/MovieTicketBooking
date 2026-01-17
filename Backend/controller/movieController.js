const Movie = require("../Models/Movie");

// 🔹 GET all movies (Now Showing)
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch movies" });
  }
};

// 🔹 GET single movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch movie" });
  }
};

// 🔹 ADD movie (Admin)
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: "Failed to create movie" });
  }
};
