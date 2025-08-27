const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const router = express.Router();

// ------------------- GET USER SETTINGS -------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const responseData = {
      profile: {
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        role: user.role || "", // added role
        subscriptionPlan: user.subscriptionPlan || "", // added subscriptionPlan
      },
      account: {
        email: user.email || "",
        username: user.username || "",
        linkedAccounts: user.linkedAccounts || "",
        status: user.isActive === false ? "Inactive" : "Active",
      },
      privacy: user.privacy || {
        visibility: "public",
        indexing: "enabled",
        dataSharing: "disabled",
      },
      notifications: user.notifications || {
        email: "enabled",
        push: "enabled",
        weekly: "enabled",
      },
      security: user.security || {
        twoFactor: "disabled",
        securityQuestion: "",
      },
    };

    res.json(responseData);
  } catch (err) {
    console.error("❌ Get settings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- UPDATE ANY FIELD -------------------
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const updateFields = req.body; // expects { fieldName: value }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update only fields that exist in the User model
    for (let key in updateFields) {
      if (updateFields[key] !== undefined && key in user) {
        user[key] = updateFields[key];
      }
    }

    await user.save();

    // Return the full updated settings
    const responseData = {
      profile: {
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        role: user.role || "",
        subscriptionPlan: user.subscriptionPlan || "",
      },
      account: {
        email: user.email || "",
        username: user.username || "",
        linkedAccounts: user.linkedAccounts || "",
        status: user.isActive === false ? "Inactive" : "Active",
      },
      privacy: user.privacy || {
        visibility: "public",
        indexing: "enabled",
        dataSharing: "disabled",
      },
      notifications: user.notifications || {
        email: "enabled",
        push: "enabled",
        weekly: "enabled",
      },
      security: user.security || {
        twoFactor: "disabled",
        securityQuestion: "",
      },
    };

    res.json({
      message: "Settings updated successfully",
      settings: responseData,
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- CHANGE PASSWORD -------------------
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "Both old and new passwords are required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
