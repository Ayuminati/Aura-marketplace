const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Missing email or role" });
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: email.split("@")[0],
      email,
      role
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ user, token });
});

module.exports = router;
