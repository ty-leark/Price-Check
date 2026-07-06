const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const stores = ["Walmart", "Amazon", "Target", "Costco", "Home Depot", "eBay"];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function estimatePrice(query, storeName) {
  const baseSeed = query.toLowerCase().length;

  const storeMultiplier = {
    Walmart: 0.95,
    Amazon: 1.05,
    Target: 1.00,
    Costco: 0.90,
    "Home Depot": 1.10,
    eBay: 0.85
  };

  const hash = [...query].reduce((acc, char) => acc + char.charCodeAt(0), 0);

let basePrice = 100;

const q = query.toLowerCase();

if (q.includes("ps5") || q.includes("playstation")) {
  basePrice = 500;
} else if (q.includes("iphone")) {
  basePrice = 1000;
} else if (q.includes("macbook")) {
  basePrice = 1400;
} else if (q.includes("airpods")) {
  basePrice = 250;
} else if (q.includes("xbox")) {
  basePrice = 500;
} else if (q.includes("tv")) {
  basePrice = 700;
} else {
  basePrice = 50 + (hash % 300);
}  const multiplier = storeMultiplier[storeName] || 1;

  const noise = (Math.random() * 0.1) + 0.95; // small variation

  const price = basePrice * multiplier * noise;

  // Simulate missing listings (important for realism)
  if (Math.random() < 0.15) return null;

  return Number(price.toFixed(2));
}

app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Please enter a product name." });
  }

  const storeResults = stores.map(store => {
  const price = estimatePrice(query, store);
  return { store, price };
    });

  const validPrices = storeResults
  .filter(p => typeof p.price === "number")
  .map(p => p.price);

const averagePrice =
  validPrices.length
    ? Number(
        (validPrices.reduce((a, b) => a + b, 0) / validPrices.length).toFixed(2)
      )
    : null;

  res.json({
    product: query,
    averagePrice,
    storeResults
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});