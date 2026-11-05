/* Product details page: reads ?id=, renders the product, handles size, quantity, cart and wishlist. */
(function () {
  'use strict';

  const Luxora = window.Luxora;
  const ui = Luxora.ui;
  const storage = Luxora.storage;

  const root = document.getElementById('productRoot');
  const notFound = document.getElementById('notFound');
  if (!root || !notFound) return;

  function readProductId() {
    const raw = new URLSearchParams(window.location.search).get('id');
    return raw && /^\d+$/.test(raw) ? Number(raw) : null;
  }

  function showNotFound() {
    root.hidden = true;
    notFound.hidden = false;
    document.title = 'Product not found | LUXORA';
    document.getElementById('breadcrumbCurrent').textContent = 'Not found';
  }

  function renderBreadcrumb(product) {
    const crumbs = document.getElementById('breadcrumbTrail');
    crumbs.innerHTML = `
      <li class="breadcrumb-item"><a href="index.html">Home</a></li>
      <li class="breadcrumb-item"><a href="shop.html">Shop</a></li>
      <li class="breadcrumb-item"><a href="shop.html?category=${encodeURIComponent(product.category)}">${ui.escapeHtml(product.category)}</a></li>
      <li class="breadcrumb-item active" aria-current="page">${ui.escapeHtml(product.name)}</li>`;
  }

  function renderGallery(product) {
    const thumbs = product.images.map(function (src, index) {
      return `<button type="button" class="gallery-thumb${index === 0 ? ' is-active' : ''}" data-image-index="${index}"
                aria-label="Show ${index === 0 ? 'main view' : 'alternate colourway'}" aria-pressed="${index === 0}">
                <img src="${src}" alt="" width="160" height="200">
              </button>`;
    }).join('');
    return `
      <div class="gallery">
        <div class="gallery-main"><img id="mainImage" src="${product.images[0]}" alt="${ui.escapeHtml(product.name)}, main view" width="800" height="1000"></div>
        <div class="gallery-thumbs">${thumbs}</div>
      </div>`;
  }

  function renderSizes(product) {
    if (!product.sizes) return '';
    const options = product.sizes.map(function (size) {
      return `<label class="size-option"><input type="radio" name="size" value="${size}"><span>${size}</span></label>`;
    }).join('');
    return `
      <fieldset class="size-picker" aria-describedby="sizeError">
        <legend class="field-label">Size</legend>
        <div class="size-options">${options}</div>
        <p class="field-error" id="sizeError" role="alert"></p>
      </fieldset>`;
  }

  function renderProduct(product) {
    document.title = product.name + ' | LUXORA';
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = product.name + ' by LUXORA. ' + product.description;
    renderBreadcrumb(product);

    root.innerHTML = `
      <div class="row g-4 g-lg-5">
        <div class="col-lg-7">${renderGallery(product)}</div>
        <div class="col-lg-5">
          <div class="pdp-info">
            <p class="product-card__category">${ui.escapeHtml(product.category)}</p>
            <h1 class="pdp-title">${ui.escapeHtml(product.name)}</h1>
            <p class="price price--large">${Luxora.formatPrice(product.price)}</p>
            <p class="pdp-description">${ui.escapeHtml(product.description)}</p>
            <form id="addToCartForm" novalidate>
              ${renderSizes(product)}
              <div class="qty-block">
                <label class="field-label" for="quantity">Quantity</label>
                <div class="qty">
                  <button type="button" class="qty-btn" data-qty-step="-1" aria-label="Decrease quantity"><i class="bi bi-dash" aria-hidden="true"></i></button>
                  <input class="qty-input" id="quantity" type="number" inputmode="numeric" min="1" max="${Luxora.maxQuantity}" value="1">
                  <button type="button" class="qty-btn" data-qty-step="1" aria-label="Increase quantity"><i class="bi bi-plus" aria-hidden="true"></i></button>
                </div>
              </div>
              <div class="pdp-actions">
                <button type="submit" class="btn-lux btn-lux--block">Add to cart</button>
                <button type="button" class="btn-lux btn-lux--outline btn-lux--block" data-wishlist-toggle data-product-id="${product.id}"
                        data-product-name="${ui.escapeHtml(product.name)}" aria-pressed="false">
                  <i class="bi bi-heart" aria-hidden="true"></i> <span data-wish-label>Add to wishlist</span>
                </button>
              </div>
              <p class="form-status" id="cartStatus" role="status"></p>
            </form>
            <ul class="info-list">
              <li><i class="bi bi-truck" aria-hidden="true"></i><span>Free delivery over ${Luxora.formatPrice(Luxora.shipping.freeThreshold)}, otherwise ${Luxora.formatPrice(Luxora.shipping.flatRate)}. Delivered in 3 to 6 working days.</span></li>
              <li><i class="bi bi-arrow-repeat" aria-hidden="true"></i><span>Return unworn items with tags within 14 days.</span></li>
            </ul>
          </div>
        </div>
      </div>`;

    bindGallery();
    bindQuantity();
    bindAddToCart(product);
    renderRelated(product);
    ui.syncWishlistButtons();
  }

  function bindGallery() {
    const main = document.getElementById('mainImage');
    const thumbs = root.querySelectorAll('.gallery-thumb');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        const product = Luxora.getProductById(readProductId());
        main.src = product.images[Number(thumb.dataset.imageIndex)];
        thumbs.forEach(function (other) {
          other.classList.toggle('is-active', other === thumb);
          other.setAttribute('aria-pressed', String(other === thumb));
        });
      });
    });
  }

  function bindQuantity() {
    const input = document.getElementById('quantity');
    function clamp() {
      const value = Math.floor(Number(input.value));
      input.value = Number.isFinite(value) ? Math.min(Math.max(value, 1), Luxora.maxQuantity) : 1;
    }
    input.addEventListener('change', clamp);
    root.querySelectorAll('[data-qty-step]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = Number(input.value) + Number(button.dataset.qtyStep);
        clamp();
      });
    });
  }

  function bindAddToCart(product) {
    const form = document.getElementById('addToCartForm');
    const status = document.getElementById('cartStatus');
    const sizeError = document.getElementById('sizeError');

    form.addEventListener('change', function (event) {
      if (event.target.name === 'size' && sizeError) sizeError.textContent = '';
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const chosen = form.querySelector('input[name="size"]:checked');
      if (product.sizes && !chosen) {
        sizeError.textContent = 'Choose a size before adding to your cart.';
        return;
      }
      const quantity = Math.min(Math.max(Math.floor(Number(form.elements.quantity.value)) || 1, 1), Luxora.maxQuantity);
      storage.addToCart(product.id, chosen ? chosen.value : null, quantity);
      status.innerHTML = 'Added to your cart. <a href="cart.html">View cart</a>';
      ui.showToast(product.name + ' added to your cart.');
    });
  }

  function renderRelated(product) {
    const host = document.getElementById('relatedProducts');
    const others = Luxora.products.filter(function (item) { return item.id !== product.id; });
    const sameCategory = others.filter(function (item) { return item.category === product.category; });
    const rest = others.filter(function (item) { return item.category !== product.category; });
    host.innerHTML = sameCategory.concat(rest).slice(0, 4).map(ui.createProductCard).join('');
    document.getElementById('relatedSection').hidden = false;
  }

  const id = readProductId();
  const product = id ? Luxora.getProductById(id) : null;
  if (product) {
    renderProduct(product);
  } else {
    showNotFound();
  }
})();
