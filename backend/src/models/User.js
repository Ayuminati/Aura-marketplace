const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["CUSTOMER", "VENDOR", "RIDER", "ADMIN"] }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
