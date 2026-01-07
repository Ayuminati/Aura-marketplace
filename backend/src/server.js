//D:\projects\Aura\backend\src\server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

app.use("/auth", authRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("Aura backend is running");
});

const PORT = process.env.PORT || 5000;

const productRoutes = require("./routes/products");
app.use("/products", productRoutes);

const orderRoutes = require("./routes/orders");
app.use("/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
