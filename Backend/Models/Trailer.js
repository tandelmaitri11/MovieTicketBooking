const mongoose = require("mongoose");

const trailerSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    image: { type: String, default: "" }, // thumbnail (uploaded or youtube thumb)
    videoUrl: { type: String, required: true }, // youtube url OR /uploads/videos/xxx.mp4
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trailer", trailerSchema);
