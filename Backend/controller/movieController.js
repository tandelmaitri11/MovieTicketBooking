const Movie = require("../Models/Movie");

const parsePeopleList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, profile_path, role] = line.split("|").map((p) => p.trim());
      return { name, profile_path, role };
    })
    .filter((item) => item.name);
};

const parseNameList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
};

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
    const payload = {
      ...req.body,
      casts: parsePeopleList(req.body.casts),
      crew: parsePeopleList(req.body.crew),
      director: parseNameList(req.body.director),
      producer: parseNameList(req.body.producer),
    };
    const movie = await Movie.create(payload);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: "Failed to create movie" });
  }
};

// ADD movie with image upload (Admin)
exports.createMovieUpload = async (req, res) => {
  try {
    const {
      title,
      overview,
      release_date,
      original_language,
      tagline,
      runtime,
      casts,
      crew,
      director,
      producer,
    } = req.body;

    const posterFile = req.files?.poster?.[0];
    if (!posterFile) {
      return res.status(400).json({ message: "Poster image is required" });
    }
    const backdropFile = req.files?.backdrop?.[0];

    const genresInput = req.body.genres;
    const genres =
      Array.isArray(genresInput)
        ? genresInput.map((g, idx) => ({
            id: Number(g.id) || idx + 1,
            name: g.name || String(g),
          }))
        : typeof genresInput === "string"
        ? genresInput
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
            .map((name, idx) => ({ id: idx + 1, name }))
        : [];

    const movie = await Movie.create({
      title,
      overview,
      release_date,
      original_language,
      tagline,
      runtime: runtime ? Number(runtime) : undefined,
      genres,
      casts: parsePeopleList(casts),
      crew: parsePeopleList(crew),
      director: parseNameList(director),
      producer: parseNameList(producer),
      poster_path: `/uploads/images/${posterFile.filename}`,
      backdrop_path: backdropFile
        ? `/uploads/images/${backdropFile.filename}`
        : "",
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: "Failed to create movie" });
  }
};
