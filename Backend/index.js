const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/routes");
require("dotenv").config();

const movieRoutes = require("./routes/movieRoutes")
const trailerRoutes = require("./routes/trailerRoutes");
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");


const app = express();
// ------------------------------------------
// 🟢 Database Connection
// ------------------------------------------
connectDB();

// ------------------------------------------
// 🟢 CORS (VERY IMPORTANT FOR GOOGLE LOGIN)
// ------------------------------------------
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// ------------------------------------------
// 🟢 Popup Security Fix (Google OAuth)
// Prevents: Cross-Origin-Opener-Policy ERROR
// ------------------------------------------
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// ------------------------------------------
// 🟢 Body Parsers
// ------------------------------------------
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------------------------
// 🟢 Routes
// ------------------------------------------
app.use("/auth", authRoutes);

// ------------------------------------------
// 🟢 Protected Test Route
// ------------------------------------------
const protect = require("./Middleware/authmiddleware");
app.get("/protected", protect, (req, res) => {
  res.json({ message: "Authorized access!", userId: req.userId });
});

app.use("/api/movies",movieRoutes);
app.use("/api/trailers", trailerRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);

// ------------------------------------------
// 🟢 Start Server
// ------------------------------------------
const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
