const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "customer", // Default role
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully!", user: savedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json({ message: "User not found!" });

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid credentials!" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    const { password, ...userInfo } = user._doc;
    res.status(200).json({ token, user: userInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
