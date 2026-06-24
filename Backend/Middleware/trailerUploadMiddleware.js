const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const videoDir = path.join(__dirname, "..", "uploads", "videos");
const imageDir = path.join(__dirname, "..", "uploads", "images");
ensureDir(videoDir);
ensureDir(imageDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video") cb(null, videoDir);
    else cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    const allowed = ["video/mp4", "video/webm", "video/ogg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only MP4, WebM, or Ogg videos are allowed"));
    }
  }
  if (file.fieldname === "image") {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files allowed"));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});
