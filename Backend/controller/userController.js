const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    await User.create({ email, phone, password });
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(301).json({ message: "Wrong password" });

    res.json(generateTokens(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        googleId,
        name: payload.name,
        profilePic: payload.picture,
      });
    }

    res.json(generateTokens(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REFRESH TOKEN
exports.refreshToken = (req, res) => {
  try {
    const { token } = req.body;

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(400).json({ message: "Invalid refresh token" });

      const newAccess = jwt.sign(
        { id: decoded.id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ accessToken: newAccess });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.json({ message: "Logged out" });
};
