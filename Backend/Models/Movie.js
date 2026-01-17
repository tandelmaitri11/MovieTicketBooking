const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
    },
    poster_path: {
      type: String,
      required: true,
    },
    backdrop_path: {
      type: String,
    },
    genres: [
      {
        id: Number,
        name: String,
      },
    ],
    release_date: String,
    original_language: String,
    tagline: String,
    vote_average: {
      type: Number,
      default: 0,
    },
    vote_count: {
      type: Number,
      default: 0,
    },
    runtime: Number,
    isActive: {
      type: Boolean,
      default: true, // now showing
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
