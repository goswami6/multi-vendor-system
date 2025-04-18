const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

// Validation schema for update
const updateSchema = Joi.object({
  username: Joi.string().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid("customer", "vendor", "admin"),
});

// UPDATE USER
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    const { password, ...userWithoutPassword } = updatedUser._doc;
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// DELETE USER
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// GET SINGLE USER (Admin Only)
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// GET ALL USERS (Admin Only)
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ createdAt: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users.map(({ password, ...u }) => u));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// USER STATS (Admin Only)
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Import jwt
const jwt = require("jsonwebtoken");

// GET CURRENT USER INFO (protected route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // use req.user.id set by verifyToken
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
