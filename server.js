require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// =========================
// FRONTEND ROUTES
// =========================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// =========================
// SERPAPI SEARCH
// =========================

async function searchLivePrices(query) {
  const response = await axios.get(
    "https://serpapi.com/search",
    {
      params: {
        engine: "google_shopping",
        q: query,
        api_key: process.env.SERPAPI_KEY
      }
    }
  );

  return response.data.shopping_results || [];
}


// =========================
// PRICE HELPERS
// =========================

function parsePrice(price) {
  if (!price) return null;

  const number = Number(
    price.replace(/[^0-9.]/g, "")
  );

  return isNaN(number) ? null : number;
}


function calculateMedian(numbers) {
  if (!numbers.length) return null;

  const sorted = [...numbers].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(
      ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2)
    );
  }

  return Number(sorted[middle].toFixed(2));
}


// =========================
// API ROUTE
// =========================

app.get("/api/search", async (req, res) => {

  const query = (req.query.q || "").trim();


  if (!query) {
    return res.status(400).json({
      error: "Please enter a product name."
    });
  }


  try {

    const results = await searchLivePrices(query);


    const storeResults = results.map(item => {

      return {
        store: item.source || "Unknown",
        price: parsePrice(item.price)
      };

    });


    const validPrices = storeResults
      .map(item => item.price)
      .filter(price => typeof price === "number");


    const medianPrice = calculateMedian(validPrices);



    let dealScore = null;
    let dealMessage = "No deal information available.";


    if (medianPrice && validPrices.length) {

      const lowestPrice = Math.min(...validPrices);


      const savingsPercent = Math.round(
        ((medianPrice - lowestPrice) / medianPrice) * 100
      );


      dealScore = savingsPercent;


      if (savingsPercent >= 15) {

        dealMessage = "🔥 Excellent Deal";

      } else if (savingsPercent >= 8) {

        dealMessage = "✅ Good Deal";

      } else if (savingsPercent > 0) {

        dealMessage = "👍 Fair Price";

      } else {

        dealMessage = "Average Market Price";

      }

    }



    res.json({

      product: query,

      averagePrice: medianPrice,

      dealScore,

      dealMessage,

      storeResults

    });


  } catch (error) {

    console.error(
      error.response?.data || error.message
    );


    res.status(500).json({

      error: "Unable to retrieve live prices."

    });

  }

});


// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

  console.log(
    `Server running at http://localhost:${PORT}`
  );

});