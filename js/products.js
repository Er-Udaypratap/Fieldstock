/* Fieldstock — product catalog (now loaded from the Django API) */

let PRODUCTS = [];
let productsLoaded = false;

async function loadProducts() {
  if (productsLoaded) return PRODUCTS;
  try {
    const res = await fetch(`${API_BASE_URL}/products/`);
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    PRODUCTS = data.products;
    productsLoaded = true;
  } catch (err) {
    console.error("Could not load products from the backend:", err);
    PRODUCTS = [];
  }
  return PRODUCTS;
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function formatPrice(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

/* Simple inline icon set — keeps the catalog visuals dependency-free */
function productIcon(type) {
  const icons = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3h6"/><path d="M10 3v5l-4 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-9V3"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3-2 2h-4L8 4Z"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 7a4 4 0 0 1 5.6 4.6L21 13l-3 3-1.4-1.4A4 4 0 0 1 12 10"/><path d="M4 20l6-6"/></svg>',
    boot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 3v9l-4 4v3h18v-2c0-2-2-3-5-3h-2V3H7Z"/></svg>',
    stove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="14" r="6"/><path d="M12 8V4M9 4h6"/></svg>',
    sock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3h5v9l4 3a3 3 0 0 1-2 5H9a3 3 0 0 1-3-3V3h3Z"/></svg>',
    mug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 6h11v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V6Z"/><path d="M16 9h2a2 2 0 0 1 0 4h-2"/></svg>'
  };
  return icons[type] || icons.bag;
}
