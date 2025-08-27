// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Thread = require("../models/threads"); // ✅ import threads model
const authMiddleware = require("../middleware/authMiddleware");

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.name !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

/**
 * 1️⃣ Get all users (with threadCount + lastLogin)
 */
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithExtras = await Promise.all(
      users.map(async (user) => {
        const threadCount = await Thread.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          threadCount,
          lastLogin: user.lastLogin || null,
        };
      })
    );

    res.json(usersWithExtras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 2️⃣ Activate/Deactivate user
 */
router.put(
  "/user/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.isActive = isActive;
      await user.save();

      res.json({ message: `User ${isActive ? "activated" : "deactivated"}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * 3️⃣ Change user role
 */
router.put(
  "/user/:id/role",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!["user", "admin"].includes(role))
        return res.status(400).json({ error: "Invalid role" });

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.role = role;
      await user.save();

      res.json({ message: `User role changed to ${role}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * 4️⃣ Change subscription plan
 */
router.put(
  "/user/:id/plan",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      if (!["Free", "Pro", "Premium"].includes(plan))
        return res.status(400).json({ error: "Invalid plan" });

      const user = await User.findById(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.subscriptionPlan = plan;
      await user.save();

      res.json({ message: `User plan updated to ${plan}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
