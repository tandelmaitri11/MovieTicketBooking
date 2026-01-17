const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      req.userId = decoded.id;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
