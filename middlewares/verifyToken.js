const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify if token is provided and valid
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token!" });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ message: "Token is required!" });
  }
};

// Allow access if user is the same or admin
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied: not authorized!" });
    }
  });
};

// Only admin users
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied: admin only!" });
    }
  });
};

// Only vendor users
const verifyTokenAndVendor = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "vendor") {
      next();
    } else {
      res.status(403).json({ message: "Access denied: vendor only!" });
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndVendor,
};
