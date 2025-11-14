import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected test route — return current user info
router.get("/me", protect, (req, res) => {
  // protect middleware sets req.user (without password)
  res.json(req.user);
});

// find by email (existing)
router.get("/find/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email }).select("_id name email");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// NEW: Get all users (for dashboard member selection)
router.get("/all", protect, async (req, res) => {
  const users = await User.find().select("_id name email");
  res.json(users);
});

export default router;
