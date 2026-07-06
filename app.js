const form = document.getElementById("searchForm");
const input = document.getElementById("productInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

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
    const API_BASE = "https://price-check-unfx.onrender.com";

    const response = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    if (data.averagePrice === null) {
      statusEl.textContent = "No prices found.";
      resultEl.innerHTML = `<h2>No results found</h2>`;
      resultEl.classList.add("show");
      return;
    }

    const storeRows = data.storeResults
      .map(
        item => `
          <div class="store-row">
            <span>${item.store}</span>
            <span class="${item.price === null ? "muted" : ""}">${formatPrice(item.price)}</span>
          </div>
        `
      )
      .join("");

    resultEl.innerHTML = `
      <h2>The estimated market price of</h2>
      <div>${data.product}</div>
      <div class="price">${formatPrice(data.averagePrice)}</div>
      <div class="muted">Based on prices from the six stores below:</div>
      <div class="stores">${storeRows}</div>
    `;

    resultEl.classList.add("show");
    statusEl.textContent = "";
  } catch (error) {
    statusEl.textContent = error.message;
  } finally {
    form.querySelector("button").disabled = false;
  }
});