// routes/upgrade.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.name !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

/**
 * 1️⃣ User requests plan upgrade
 * Body: { plan: "pro" or "premium" }
 */
router.put("/request", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["Free","Pro", "Premium"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.upgradeRequest = plan;
    await user.save();

    res.json({ message: `Upgrade request for ${plan} submitted.` });
  } catch (err) {
    console.log("request catch");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 2️⃣ Admin fetches all pending upgrade requests
 */
router.get("/requests", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ upgradeRequest: { $ne: null } }).select(
      "name email upgradeRequest"
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 3️⃣ Admin approves a user's upgrade
 */
router.put(
  "/approve/:userId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user || !user.upgradeRequest) {
        return res.status(400).json({ error: "No pending upgrade request" });
      }

      // Approve the upgrade
      user.subscriptionPlan = user.upgradeRequest;
      user.upgradeRequest = null;
      await user.save();

      res.json({
        message: `${user.name}'s account upgraded to ${user.subscriptionPlan}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.put(
  "/reject/:userId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user || !user.upgradeRequest) {
        return res.status(400).json({ error: "No pending upgrade request" });
      }

      // Reject the upgrade: just clear the upgradeRequest
      const rejectedPlan = user.upgradeRequest;
      user.upgradeRequest = null;
      await user.save();

      res.json({
        message: `${user.name}'s request for ${rejectedPlan} plan has been rejected.`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


module.exports = router;
