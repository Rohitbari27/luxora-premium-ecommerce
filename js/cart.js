/* Cart page: lists items, changes quantities, removes items and shows totals. */
(function () {
  'use strict';

  const Luxora = window.Luxora;
  const ui = Luxora.ui;
  const storage = Luxora.storage;

  const itemsHost = document.getElementById('cartItems');
  if (!itemsHost) return;

  const content = document.getElementById('cartContent');
  const emptyState = document.getElementById('cartEmpty');
  const summaryHost = document.getElementById('cartSummary');

  function renderItem(item) {
    const product = Luxora.getProductById(item.id);
    const sizeAttr = item.size || '';
    const lineTotal = Luxora.formatPrice(product.price * item.quantity);
    return `
      <li class="cart-item">
        <a class="cart-item__image" href="${ui.productUrl(product)}">
          <img src="${product.images[0]}" alt="${ui.escapeHtml(product.name)}" width="800" height="1000" loading="lazy">
        </a>
        <div class="cart-item__details">
          <h2 class="cart-item__name"><a href="${ui.productUrl(product)}">${ui.escapeHtml(product.name)}</a></h2>
          <p class="cart-item__meta">${item.size ? 'Size ' + ui.escapeHtml(item.size) + '. ' : ''}${Luxora.formatPrice(product.price)} each</p>
          <div class="qty qty--small">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${product.id}" data-size="${sizeAttr}"
                    aria-label="Decrease quantity of ${ui.escapeHtml(product.name)}"${item.quantity <= 1 ? ' disabled' : ''}><i class="bi bi-dash" aria-hidden="true"></i></button>
            <span class="qty-value" aria-live="polite">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${product.id}" data-size="${sizeAttr}"
                    aria-label="Increase quantity of ${ui.escapeHtml(product.name)}"${item.quantity >= Luxora.maxQuantity ? ' disabled' : ''}><i class="bi bi-plus" aria-hidden="true"></i></button>
          </div>
        </div>
        <div class="cart-item__side">
          <p class="price">${lineTotal}</p>
          <button type="button" class="link-button" data-action="remove" data-id="${product.id}" data-size="${sizeAttr}"
                  aria-label="Remove ${ui.escapeHtml(product.name)} from cart">Remove</button>
        </div>
      </li>`;
  }

  function renderSummary(cart) {
    const totals = storage.calculateTotals(cart);
    const remaining = Luxora.shipping.freeThreshold - totals.subtotal;
    const shippingNote = totals.shipping === 0
      ? 'Your order qualifies for free delivery.'
      : 'Add ' + Luxora.formatPrice(remaining) + ' more for free delivery.';
    summaryHost.innerHTML = `
      <h2 class="summary-title">Order summary</h2>
      <dl class="summary-rows">
        <div><dt>Subtotal</dt><dd>${Luxora.formatPrice(totals.subtotal)}</dd></div>
        <div><dt>Shipping</dt><dd>${totals.shipping === 0 ? 'Free' : Luxora.formatPrice(totals.shipping)}</dd></div>
        <div class="summary-total"><dt>Total</dt><dd>${Luxora.formatPrice(totals.total)}</dd></div>
      </dl>
      <p class="summary-note">${shippingNote} Delivery is free on orders over ${Luxora.formatPrice(Luxora.shipping.freeThreshold)}; otherwise ${Luxora.formatPrice(Luxora.shipping.flatRate)}.</p>
      <a class="btn-lux btn-lux--block" href="checkout.html">Proceed to checkout</a>
      <a class="continue-link" href="shop.html">Continue shopping</a>`;
  }

  function render(focusSelector) {
    const cart = storage.getCart();
    const isEmpty = cart.length === 0;
    content.hidden = isEmpty;
    emptyState.hidden = !isEmpty;
    if (isEmpty) return;

    itemsHost.innerHTML = cart.map(renderItem).join('');
    renderSummary(cart);

    // Re-rendering replaces the buttons, so put keyboard focus back where it was.
    if (focusSelector) {
      const target = itemsHost.querySelector(focusSelector);
      if (target && !target.disabled) target.focus();
    }
  }

  itemsHost.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const size = button.dataset.size || null;
    const item = storage.getCart().find(function (entry) { return entry.id === id && entry.size === size; });
    if (!item) return;

    const selector = '[data-action="' + button.dataset.action + '"][data-id="' + id + '"][data-size="' + (size || '') + '"]';

    if (button.dataset.action === 'increase') {
      storage.setCartQuantity(id, size, item.quantity + 1);
      render(selector);
    } else if (button.dataset.action === 'decrease') {
      storage.setCartQuantity(id, size, item.quantity - 1);
      render(selector);
    } else if (button.dataset.action === 'remove') {
      storage.removeFromCart(id, size);
      ui.showToast(Luxora.getProductById(id).name + ' removed from your cart.');
      render();
    }
  });

  // Keep the page right if the cart changes in another tab.
  document.addEventListener('luxora:storage-changed', function () { render(); });

  render();
})();
