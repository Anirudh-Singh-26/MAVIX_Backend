// backend/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET ="this_is_best";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };

    next(); // proceed to the route
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;
