/* Safe localStorage helpers for the cart and wishlist. Loaded after products.js. */
(function () {
  'use strict';

  const Luxora = (window.Luxora = window.Luxora || {});
  const CART_KEY = 'luxora_cart';
  const WISHLIST_KEY = 'luxora_wishlist';
  const memory = {}; // fallback when localStorage is blocked (e.g. some private modes)

  function readList(key) {
    let raw = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch (error) {
      raw = memory[key] || null;
    }
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return []; // malformed data is ignored
    }
  }

  function writeList(key, list) {
    const json = JSON.stringify(list);
    memory[key] = json;
    try {
      window.localStorage.setItem(key, json);
    } catch (error) {
      /* storage full or blocked: the in-memory copy still works for this visit */
    }
    document.dispatchEvent(new CustomEvent('luxora:storage-changed'));
  }

  function clampQuantity(value) {
    const quantity = Math.floor(Number(value));
    if (!Number.isFinite(quantity) || quantity < 1) return 1;
    return Math.min(quantity, Luxora.maxQuantity);
  }

  /* Drops invalid entries, merges duplicates and clamps quantities. */
  function sanitizeCart(rawItems) {
    const merged = [];
    rawItems.forEach(function (item) {
      if (!item || typeof item !== 'object') return;
      const product = Luxora.getProductById(item.id);
      if (!product) return;

      let size = null;
      if (product.sizes) {
        if (!product.sizes.includes(item.size)) return;
        size = item.size;
      }

      const existing = merged.find(function (entry) { return entry.id === product.id && entry.size === size; });
      if (existing) {
        existing.quantity = clampQuantity(existing.quantity + clampQuantity(item.quantity));
      } else {
        merged.push({ id: product.id, size: size, quantity: clampQuantity(item.quantity) });
      }
    });
    return merged;
  }

  /* ---------- Cart ---------- */
  function getCart() {
    return sanitizeCart(readList(CART_KEY));
  }

  function addToCart(productId, size, quantity) {
    const cart = getCart();
    const id = Number(productId);
    const chosenSize = size || null;
    const existing = cart.find(function (item) { return item.id === id && item.size === chosenSize; });
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + clampQuantity(quantity));
    } else {
      cart.push({ id: id, size: chosenSize, quantity: clampQuantity(quantity) });
    }
    writeList(CART_KEY, sanitizeCart(cart));
  }

  function setCartQuantity(productId, size, quantity) {
    const cart = getCart();
    const item = cart.find(function (entry) { return entry.id === Number(productId) && entry.size === (size || null); });
    if (!item) return;
    item.quantity = clampQuantity(quantity);
    writeList(CART_KEY, cart);
  }

  function removeFromCart(productId, size) {
    const remaining = getCart().filter(function (item) {
      return !(item.id === Number(productId) && item.size === (size || null));
    });
    writeList(CART_KEY, remaining);
  }

  function clearCart() {
    writeList(CART_KEY, []);
  }

  function cartCount() {
    return getCart().reduce(function (total, item) { return total + item.quantity; }, 0);
  }

  /* One place for subtotal, shipping and total so cart and checkout always agree. */
  function calculateTotals(cart) {
    const subtotal = cart.reduce(function (sum, item) {
      return sum + Luxora.getProductById(item.id).price * item.quantity;
    }, 0);
    const shipping = subtotal === 0 || subtotal >= Luxora.shipping.freeThreshold ? 0 : Luxora.shipping.flatRate;
    return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
  }

  /* ---------- Wishlist ---------- */
  function getWishlist() {
    const ids = readList(WISHLIST_KEY)
      .map(Number)
      .filter(function (id) { return Luxora.getProductById(id); });
    return ids.filter(function (id, index) { return ids.indexOf(id) === index; });
  }

  function isWished(productId) {
    return getWishlist().includes(Number(productId));
  }

  /* Returns true if the product is saved after the toggle. */
  function toggleWishlist(productId) {
    const id = Number(productId);
    const list = getWishlist();
    const index = list.indexOf(id);
    if (index === -1) {
      list.push(id);
    } else {
      list.splice(index, 1);
    }
    writeList(WISHLIST_KEY, list);
    return index === -1;
  }

  Luxora.storage = {
    getCart: getCart, addToCart: addToCart, setCartQuantity: setCartQuantity,
    removeFromCart: removeFromCart, clearCart: clearCart, cartCount: cartCount,
    calculateTotals: calculateTotals,
    getWishlist: getWishlist, isWished: isWished, toggleWishlist: toggleWishlist
  };

  // Keep other open tabs in sync.
  window.addEventListener('storage', function () {
    document.dispatchEvent(new CustomEvent('luxora:storage-changed'));
  });
})();
