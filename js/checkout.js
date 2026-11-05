/* Checkout demo: validates the form and shows a confirmation. No data is stored or sent anywhere. */
(function () {
  'use strict';

  const Luxora = window.Luxora;
  const ui = Luxora.ui;
  const storage = Luxora.storage;

  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const layout = document.getElementById('checkoutLayout');
  const emptyState = document.getElementById('checkoutEmpty');
  const successState = document.getElementById('orderSuccess');
  const summaryHost = document.getElementById('checkoutSummary');

  const rules = {
    fullName: function (value) { return value.length < 2 ? 'Enter your full name.' : ''; },
    email: ui.emailMessage,
    phone: function (value) {
      if (!value) return 'Enter your mobile number.';
      return /^[6-9]\d{9}$/.test(value.replace(/[\s-]/g, '')) ? '' : 'Enter a 10-digit mobile number.';
    },
    address1: function (value) { return value.length < 5 ? 'Enter your street address.' : ''; },
    city: function (value) { return value.length < 2 ? 'Enter your city.' : ''; },
    state: function (value) { return value ? '' : 'Choose your state.'; },
    postalCode: function (value) {
      if (!value) return 'Enter your postal code.';
      return /^[1-9]\d{5}$/.test(value) ? '' : 'Enter a valid 6-digit PIN code.';
    }
  };

  function renderSummary(cart) {
    const totals = storage.calculateTotals(cart);
    const rows = cart.map(function (item) {
      const product = Luxora.getProductById(item.id);
      return `
        <li class="summary-item">
          <img src="${product.images[0]}" alt="" width="800" height="1000">
          <div>
            <p class="summary-item__name">${ui.escapeHtml(product.name)}</p>
            <p class="summary-item__meta">${item.size ? 'Size ' + ui.escapeHtml(item.size) + '. ' : ''}Qty ${item.quantity}</p>
          </div>
          <p class="summary-item__price">${Luxora.formatPrice(product.price * item.quantity)}</p>
        </li>`;
    }).join('');
    summaryHost.innerHTML = `
      <h2 class="summary-title">Order summary</h2>
      <ul class="summary-items">${rows}</ul>
      <dl class="summary-rows">
        <div><dt>Subtotal</dt><dd>${Luxora.formatPrice(totals.subtotal)}</dd></div>
        <div><dt>Shipping</dt><dd>${totals.shipping === 0 ? 'Free' : Luxora.formatPrice(totals.shipping)}</dd></div>
        <div class="summary-total"><dt>Total</dt><dd>${Luxora.formatPrice(totals.total)}</dd></div>
      </dl>
      <a class="continue-link" href="cart.html">Edit cart</a>`;
  }

  function showSuccess(total, itemCount) {
    const reference = 'DEMO-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('orderReference').textContent = reference;
    document.getElementById('orderTotal').textContent = Luxora.formatPrice(total);
    document.getElementById('orderItems').textContent = itemCount + (itemCount === 1 ? ' item' : ' items');
    layout.hidden = true;
    successState.hidden = false;
    successState.focus();
    window.scrollTo({ top: 0 });
  }

  function init() {
    const cart = storage.getCart();
    if (cart.length === 0) {
      layout.hidden = true;
      emptyState.hidden = false;
      return;
    }
    renderSummary(cart);

    ui.attachValidation(form, rules, function () {
      const latest = storage.getCart();
      if (latest.length === 0) { // cart emptied in another tab
        layout.hidden = true;
        emptyState.hidden = false;
        return;
      }
      const totals = storage.calculateTotals(latest);
      const itemCount = latest.reduce(function (sum, item) { return sum + item.quantity; }, 0);
      storage.clearCart();
      showSuccess(totals.total, itemCount);
    });
  }

  init();
})();
