const form = document.getElementById("searchForm");
const input = document.getElementById("productInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

const API_BASE = "https://price-check-unfx.onrender.com";

function formatPrice(value) {
  if (value === null || value === undefined) return "—";
  return `$${Number(value).toFixed(2)}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = input.value.trim();

  if (!query) {
    statusEl.textContent = "Please enter a product name.";
    return;
  }

  statusEl.textContent = "Searching...";
  resultEl.classList.remove("show");
  resultEl.innerHTML = "";
  form.querySelector("button").disabled = true;

  try {
    const response = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    // ✅ EVERYTHING THAT USES "data" MUST BE INSIDE HERE

    const storeRows = (data.storeResults || [])
      .map(
        (item) => `
          <div class="store-row">
            <span>${item.store}</span>
            <span>${item.price ?? "—"}</span>
          </div>
        `
      )
      .join("");

    resultEl.innerHTML = `
      <h2>The estimated market price of</h2>
      <h1>${data.product}</h1>
      <div class="price">$${formatPrice(data.averagePrice)}</div>
      <div class="stores">${storeRows}</div>
    `;

    resultEl.classList.add("show");
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = err.message;
  } finally {
    form.querySelector("button").disabled = false;
  }
});