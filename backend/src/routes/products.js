const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json([
    {
      id: "p1",
      name: "Aura Headphones",
      description: "Premium noise cancelling headphones",
      price: 299,
      stock: 12,
      category: "Tech",
      image: "https://picsum.photos/400/300?1",
      vendorId: "v1"
    },
    {
      id: "p2",
      name: "Aura Smartwatch",
      description: "Minimal smart wearable",
      price: 199,
      stock: 8,
      category: "Lifestyle",
      image: "https://picsum.photos/400/300?2",
      vendorId: "v1"
    }
  ]);
});

module.exports = router;
