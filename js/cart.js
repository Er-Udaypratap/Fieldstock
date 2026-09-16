/* Fieldstock — cart state (localStorage-backed for now, swap for API calls later) */

const CART_KEY = "fieldstock_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, qty) {
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty: qty });
  }
  saveCart(cart);
}

function updateCartQty(productId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const existing = cart.find((item) => item.id === productId);
    if (existing) existing.qty = qty;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartDetails() {
  return getCart()
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;
      return { ...product, qty: item.qty, lineTotal: product.price * item.qty };
    })
    .filter(Boolean);
}

function getCartSubtotal() {
  return getCartDetails().reduce((sum, item) => sum + item.lineTotal, 0);
}

function updateCartCount() {
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = getCartCount();
}

document.addEventListener("DOMContentLoaded", updateCartCount);
