/* Fieldstock — page-specific rendering (connected to Django backend) */

function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}

/* ---------- Home / catalog page ---------- */

function initCatalogPage() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  if (PRODUCTS.length === 0) {
    grid.innerHTML = `<p>Couldn't load products. Make sure the backend server is running.</p>`;
    return;
  }

  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  const filterBar = document.getElementById("filterBar");
  let activeCategory = "All";

  function renderFilters() {
    filterBar.innerHTML = categories
      .map(
        (cat) =>
          `<button class="filter-chip ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">${cat}</button>`
      )
      .join("");

    filterBar.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const items =
      activeCategory === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === activeCategory);

    document.getElementById("resultCount").textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

    grid.innerHTML = items
      .map(
        (p) => `
      <a class="product-card" href="product.html?id=${p.id}">
        <div class="product-thumb">${productIcon(p.icon)}</div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <span class="product-name">${p.name}</span>
          <div class="product-price">
            <span class="price">${formatPrice(p.price)}</span>
            <span style="font-size:0.75rem; color:${p.stock === 0 ? "var(--danger)" : "var(--muted)"};">
              ${p.stock === 0 ? "Out of stock" : "In stock"}
            </span>
          </div>
        </div>
      </a>`
      )
      .join("");
  }

  renderFilters();
  renderGrid();
}

/* ---------- Product detail page ---------- */

function initProductDetailPage() {
  const root = document.getElementById("productDetailRoot");
  if (!root) return;

  const product = getProductById(qs("id"));

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <h2>Product not found</h2>
        <p>This item may have been removed, or the backend isn't running.</p>
        <a href="index.html" class="btn btn-primary">Back to shop</a>
      </div>`;
    return;
  }

  document.title = `${product.name} — Fieldstock`;

  const specsRow = Object.entries(product.specs || {})
    .map(([label, value]) => `<div><strong>${value}</strong>${label}</div>`)
    .join("");

  root.innerHTML = `
    <div class="product-detail">
      <div class="detail-gallery">${productIcon(product.icon)}</div>
      <div class="detail-body">
        <span class="product-category">${product.category}</span>
        <h1>${product.name}</h1>
        <div class="detail-price">${formatPrice(product.price)}</div>
        <div class="detail-desc"><p style="margin:0;">${product.description}</p></div>
        <div class="detail-meta">${specsRow}</div>

        <div class="qty-row">
          <div class="qty-control">
            <button type="button" id="qtyMinus">−</button>
            <input type="text" id="qtyValue" value="1" readonly>
            <button type="button" id="qtyPlus">+</button>
          </div>
          <span class="stock-note ${product.stock === 0 ? "low" : ""}">
            ${product.stock === 0 ? "Out of stock" : product.stock < 10 ? `Only ${product.stock} left` : "In stock"}
          </span>
        </div>

        <button class="btn btn-accent" id="addToCartBtn" ${product.stock === 0 ? "disabled" : ""}>
          ${product.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
        <div class="add-feedback" id="addFeedback"></div>
      </div>
    </div>`;

  let qty = 1;
  const qtyValue = document.getElementById("qtyValue");

  document.getElementById("qtyMinus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValue.value = qty;
  });

  document.getElementById("qtyPlus").addEventListener("click", () => {
    qty = Math.min(product.stock, qty + 1);
    qtyValue.value = qty;
  });

  const addBtn = document.getElementById("addToCartBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(product.id, qty);
      document.getElementById("addFeedback").textContent = `Added ${qty} to your cart.`;
    });
  }
}

/* ---------- Cart page (still client-side — fast to edit, synced at checkout) ---------- */

function initCartPage() {
  const root = document.getElementById("cartRoot");
  if (!root) return;

  function render() {
    const items = getCartDetails();

    if (items.length === 0) {
      root.innerHTML = `
        <div class="cart-empty" style="grid-column: 1 / -1;">
          <h2>Your cart is empty</h2>
          <p>Add something from the catalog to see it here.</p>
          <a href="index.html" class="btn btn-primary">Browse the catalog</a>
        </div>`;
      return;
    }

    const subtotal = getCartSubtotal();

    root.innerHTML = `
      <div class="cart-items">
        ${items
          .map(
            (item) => `
          <div class="cart-item" data-id="${item.id}">
            <div class="thumb">${productIcon(item.icon)}</div>
            <div>
              <div class="name">${item.name}</div>
              <div style="font-size:0.85rem; color:var(--muted);">${formatPrice(item.price)} each</div>
              <button class="remove" data-remove="${item.id}">Remove</button>
            </div>
            <div class="qty-control">
              <button type="button" data-decrease="${item.id}">−</button>
              <input type="text" value="${item.qty}" readonly>
              <button type="button" data-increase="${item.id}">+</button>
            </div>
            <div class="line-total">${formatPrice(item.lineTotal)}</div>
          </div>`
          )
          .join("")}
      </div>
      <div class="summary-box">
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>Free</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatPrice(subtotal)}</span></div>
        <a href="checkout.html" class="btn btn-accent btn-block">Proceed to checkout</a>
      </div>`;

    root.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        removeFromCart(btn.dataset.remove);
        render();
      })
    );
    root.querySelectorAll("[data-increase]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const item = getCartDetails().find((i) => i.id === btn.dataset.increase);
        if (item) updateCartQty(item.id, Math.min(item.stock, item.qty + 1));
        render();
      })
    );
    root.querySelectorAll("[data-decrease]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const item = getCartDetails().find((i) => i.id === btn.dataset.decrease);
        if (item) updateCartQty(item.id, item.qty - 1);
        render();
      })
    );
  }

  render();
}

/* ---------- Checkout page (submits the real order to Django) ---------- */

function initCheckoutPage() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const items = getCartDetails();
  const subtotal = getCartSubtotal();

  if (items.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  const session = getSession();
  if (!session) {
    alert("Please log in before checking out.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("checkoutItemCount").textContent = items.reduce((s, i) => s + i.qty, 0);
  document.getElementById("checkoutSubtotal").textContent = formatPrice(subtotal);
  document.getElementById("checkoutTotal").textContent = formatPrice(subtotal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("checkoutError");
    const submitBtn = form.querySelector("button[type=submit]");
    errorEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing order...";

    const payload = {
      items: items.map((item) => ({ id: item.id, qty: item.qty })),
      customer: {
        name: document.getElementById("fullName").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        pincode: document.getElementById("pincode").value,
        phone: document.getElementById("phone").value
      }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error || "Could not place the order.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Place order";
        return;
      }

      localStorage.setItem(
        "fieldstock_last_order",
        JSON.stringify({
          orderId: data.orderId,
          subtotal: data.subtotal,
          items,
          customer: payload.customer
        })
      );

      clearCart();
      window.location.href = "order-confirmation.html";
    } catch (err) {
      errorEl.textContent = "Could not reach the server. Is the backend running?";
      submitBtn.disabled = false;
      submitBtn.textContent = "Place order";
    }
  });
}

/* ---------- Order confirmation page ---------- */

function initOrderConfirmationPage() {
  const root = document.getElementById("orderConfirmRoot");
  if (!root) return;

  const order = JSON.parse(localStorage.getItem("fieldstock_last_order") || "null");

  if (!order) {
    root.innerHTML = `
      <div class="empty-state">
        <h2>No recent order found</h2>
        <a href="index.html" class="btn btn-primary">Back to shop</a>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="mark-big">✓</div>
    <h1>Order placed</h1>
    <p>Thanks, ${order.customer.name.split(" ")[0]}. Your order has been recorded on the server.</p>
    <div class="order-id">Order ID: ${order.orderId}</div>
    <div class="summary-box" style="margin-bottom:24px;">
      ${order.items
        .map(
          (item) =>
            `<div class="summary-row"><span>${item.name} × ${item.qty}</span><span>${formatPrice(item.lineTotal)}</span></div>`
        )
        .join("")}
      <div class="summary-row total"><span>Total</span><span>${formatPrice(order.subtotal)}</span></div>
    </div>
    <p>Delivering to: ${order.customer.address}, ${order.customer.city} — ${order.customer.pincode}</p>
    <a href="index.html" class="btn btn-primary">Continue shopping</a>`;
}

/* ---------- Login page ---------- */

function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("loginError");
    const submitBtn = form.querySelector("button[type=submit]");

    errorEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    const result = await loginUser(email, password);

    if (!result.ok) {
      errorEl.textContent = result.message;
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
      return;
    }
    window.location.href = "index.html";
  });
}

/* ---------- Register page ---------- */

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorEl = document.getElementById("registerError");
    const submitBtn = form.querySelector("button[type=submit]");

    if (password !== confirmPassword) {
      errorEl.textContent = "Passwords do not match.";
      return;
    }

    errorEl.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const result = await registerUser(name, email, password);
    if (!result.ok) {
      errorEl.textContent = result.message;
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
      return;
    }
    window.location.href = "index.html";
  });
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts(); // wait for the catalog before rendering anything that needs it
  initCatalogPage();
  initProductDetailPage();
  initCartPage();
  initCheckoutPage();
  initOrderConfirmationPage();
  initLoginPage();
  initRegisterPage();
});
