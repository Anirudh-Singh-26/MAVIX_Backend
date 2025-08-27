// backend/routes/auth.routes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Secret for JWT (in production, put in .env)
const JWT_SECRET = "this_is_best";
const JWT_EXPIRES_IN = "1h"; // token expiry

// ------------------- SIGNUP -------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("SignUp: "+ user);
    res
      .status(201)
      .json({ message: "User created successfully", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- LOGIN -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for checking
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // ✅ Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
    console.log(token);

    res
      .cookie("token", token, {
        httpOnly: true, // cannot be accessed by JS on frontend
        secure: process.env.NODE_ENV === "production", // only send over HTTPS in production
        sameSite: "none", // CSRF protection
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      })
      .json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- LOGOUT -------------------
// backend/routes/auth.routes.js
router.post("/logout", (req, res) => {
  try {
    // Clear the cookie by setting it to empty and expiring immediately
    res
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(0), // immediately expire
        sameSite: "none",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- GET CURRENT USER -------------------
router.get("/me", authMiddleware, (req, res) => {
  try {
    // req.user is set by authMiddleware if token is valid
    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Get full user details including subscription plan
router.get("/me/details", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email username isActive role subscriptionPlan upgradeRequest"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me/role", authMiddleware, async (req, res) => {
  try {
    // Fetch fresh role from DB
    const user = await User.findById(req.user.id).select("role");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




module.exports = router;
