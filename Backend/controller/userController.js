const mongoose = require("mongoose");
const User = require("../Models/User");
const Movie = require("../Models/Movie");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const {
  sendSignupEmail,
  sendGoogleLoginEmail,
  sendOtpEmail,
} = require("../utils/mailer");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const isAdminEmail = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
};

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

    const newUser = await User.create({ email, phone, password });
    try {
      await sendSignupEmail({ to: newUser.email, name: newUser.name });
    } catch (emailErr) {
      console.error("Signup email failed:", emailErr.message);
    }
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const query = {};

    if (email) query.email = email;
    if (phone) query.phone = phone;

    if (!query.email && !query.phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(301).json({ message: "Wrong password" });

    res.json({
      ...generateTokens(user),
      email: user.email || "",
      isAdmin: isAdminEmail(user.email),
    });
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

    try {
      await sendGoogleLoginEmail({ to: user.email, name: user.name });
    } catch (emailErr) {
      console.error("Login email failed:", emailErr.message);
    }

    res.json({
      ...generateTokens(user),
      email: user.email,
      isAdmin: isAdminEmail(user.email),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PROFILE
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "email phone name profilePic createdAt updatedAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), isAdmin: isAdminEmail(user.email) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET FAVORITES
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD FAVORITE
exports.addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ message: "movieId is required" });
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.favorites.some((fav) => fav.toString() === movieId)) {
      const populated = await user.populate("favorites");
      return res.json(populated.favorites || []);
    }

    user.favorites.push(movieId);
    await user.save();
    await Movie.findByIdAndUpdate(movieId, { $inc: { vote_count: 1 } });
    const populated = await user.populate("favorites");
    res.json(populated.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE FAVORITE
exports.removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!movieId) return res.status(400).json({ message: "movieId is required" });
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: "Invalid movieId" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const removed = user.favorites.some((fav) => fav.toString() === movieId);
    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== movieId
    );
    await user.save();
    if (removed) {
      await Movie.findByIdAndUpdate(movieId, {
        $inc: { vote_count: -1 },
      });
    }
    const populated = await user.populate("favorites");
    res.json(populated.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PROFILE
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, profilePic } = req.body;
    const updates = {};
    const unset = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) {
      if (phone === "") unset.phone = "";
      else updates.phone = phone;
    }
    if (profilePic !== undefined) {
      if (profilePic === "") unset.profilePic = "";
      else updates.profilePic = profilePic;
    }

    const updatePayload = {};
    if (Object.keys(updates).length > 0) updatePayload.$set = updates;
    if (Object.keys(unset).length > 0) updatePayload.$unset = unset;

    const query = User.findByIdAndUpdate(req.userId, updatePayload, {
      new: true,
      runValidators: true,
    }).select("email phone name profilePic createdAt updatedAt");

    const user =
      Object.keys(updatePayload).length > 0
        ? await query
        : await User.findById(req.userId).select(
            "email phone name profilePic createdAt updatedAt"
          );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Password not set for this account" });
    }

    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// FORGOT PASSWORD (OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    if (isAdminEmail(email)) {
      return res.status(403).json({ message: "Reset not allowed for admin" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If the email exists, a reset link was sent" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOtpHash = otpHash;
    user.resetOtpExpires = Date.now() + 1000 * 60 * 10;
    await user.save();

    try {
      await sendOtpEmail({ to: user.email, name: user.name, otp });
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr.message);
    }

    res.json({ message: "If the email exists, an OTP was sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD (OTP)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "email, otp and newPassword are required" });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await User.findOne({
      email,
      resetOtpHash: otpHash,
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await User.findOne({
      email,
      resetOtpHash: otpHash,
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPLOAD PROFILE PIC
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePic = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { profilePic } },
      { new: true }
    ).select("email phone name profilePic createdAt updatedAt");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), isAdmin: isAdminEmail(user.email) });
  } catch (err) {
    res.status(400).json({ message: err.message });
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

// GET all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "email name phone createdAt updatedAt"
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
