// routes/demoUsers.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/load-demo-users", async (req, res) => {
  try {
    const demoUsers = [
      {
        name: "Alice Johnson",
        email: "alice@site.com",
        password: "password123",
        subscriptionPlan: "Pro",
      },
      {
        name: "Bob Kumar",
        email: "bob@site.com",
        password: "password123",
        subscriptionPlan: "Premium",
        role: "admin",
      },
      {
        name: "Priya Sharma",
        email: "priya@site.com",
        password: "password123",
        subscriptionPlan: "Pro",
        upgradeRequest: "Premium",
      },
      {
        name: "Charlie Lee",
        email: "charlie@site.com",
        password: "password123",
        subscriptionPlan: "Free",
      },
      {
        name: "Diana Patel",
        email: "diana@site.com",
        password: "password123",
        subscriptionPlan: "Free",
      },
      {
        name: "Ethan Rao",
        email: "ethan@site.com",
        password: "password123",
        subscriptionPlan: "Free",
        upgradeRequest: "Pro",
      },
      {
        name: "Farah Khan",
        email: "farah@site.com",
        password: "password123",
        subscriptionPlan: "Free",
      },
      {
        name: "Gaurav Singh",
        email: "gaurav@site.com",
        password: "password123",
        subscriptionPlan: "Pro",
      },
      {
        name: "Hina Mehta",
        email: "hina@site.com",
        password: "password123",
        subscriptionPlan: "Premium",
        upgradeRequest: "Pro",
      },
      {
        name: "Ishaan Verma",
        email: "ishaan@site.com",
        password: "password123",
        subscriptionPlan: "Free",
      },
      {
        name: "Jaya Nair",
        email: "jaya@site.com",
        password: "password123",
        subscriptionPlan: "Pro",
      },
      {
        name: "Kabir Das",
        email: "kabir@site.com",
        password: "password123",
        subscriptionPlan: "Free",
      },
      {
        name: "Lina Kapoor",
        email: "lina@site.com",
        password: "password123",
        subscriptionPlan: "Premium",
        upgradeRequest: "Pro",
      },
    ];

    const insertedUsers = [];
    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const newUser = new User(u);
        await newUser.save();
        insertedUsers.push(newUser);
      }
    }

    res.json({
      message: "Demo users loaded successfully",
      count: insertedUsers.length,
      users: insertedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load demo users" });
  }
});

module.exports = router;
