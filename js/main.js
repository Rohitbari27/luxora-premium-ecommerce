/* Shared behaviour: header/footer, counts, wishlist buttons, toasts, validation helpers, newsletter. */
(function () {
  'use strict';

  const Luxora = (window.Luxora = window.Luxora || {});
  const storage = Luxora.storage;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- Small helpers ---------- */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function currentPage() {
    const file = window.location.pathname.split('/').pop();
    return file || 'index.html';
  }

  function productUrl(product) {
    return 'product-details.html?id=' + product.id;
  }

  /* ---------- Toast ---------- */
  let toastStack = null;
  function showToast(message) {
    if (!toastStack) {
      toastStack = document.createElement('div');
      toastStack.className = 'toast-stack';
      toastStack.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastStack);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-note';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    toastStack.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, 3200);
  }

  /* ---------- Product card (used on home, shop and product pages) ---------- */
  function createProductCard(product) {
    const tag = product.isNew ? 'New' : product.isBestseller ? 'Bestseller' : '';
    const url = productUrl(product);
    return `
      <article class="product-card">
        <div class="product-card__media">
          <a class="product-card__link" href="${url}" tabindex="-1" aria-hidden="true">
            <img class="product-card__img" src="${product.images[0]}" alt="" loading="lazy" width="800" height="1000">
            <img class="product-card__img product-card__img--alt" src="${product.images[1]}" alt="" loading="lazy" width="800" height="1000">
          </a>
          ${tag ? `<span class="tag">${tag}</span>` : ''}
          <button type="button" class="wish-btn" data-wishlist-toggle data-product-id="${product.id}"
                  data-product-name="${escapeHtml(product.name)}" aria-pressed="false" aria-label="Add ${escapeHtml(product.name)} to wishlist">
            <i class="bi bi-heart" aria-hidden="true"></i>
          </button>
        </div>
        <div class="product-card__body">
          <p class="product-card__category">${escapeHtml(product.category)}</p>
          <h3 class="product-card__name"><a href="${url}">${escapeHtml(product.name)}</a></h3>
          <p class="price">${Luxora.formatPrice(product.price)}</p>
        </div>
      </article>`;
  }

  /* ---------- Wishlist buttons ---------- */
  function syncWishlistButtons() {
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (button) {
      const wished = storage.isWished(button.dataset.productId);
      const name = button.dataset.productName || 'this product';
      button.setAttribute('aria-pressed', String(wished));
      button.classList.toggle('is-saved', wished);
      const icon = button.querySelector('.bi');
      if (icon) icon.className = 'bi ' + (wished ? 'bi-heart-fill' : 'bi-heart');
      const label = button.querySelector('[data-wish-label]');
      if (label) {
        label.textContent = wished ? 'Saved to wishlist' : 'Add to wishlist';
      } else {
        button.setAttribute('aria-label', (wished ? 'Remove ' : 'Add ') + name + (wished ? ' from wishlist' : ' to wishlist'));
      }
    });
  }

  function updateCounts() {
    const counts = { cart: storage.cartCount(), wishlist: storage.getWishlist().length };
    Object.keys(counts).forEach(function (key) {
      document.querySelectorAll('[data-count="' + key + '"]').forEach(function (badge) {
        badge.textContent = counts[key];
        badge.hidden = counts[key] === 0;
      });
    });
  }

  function onDocumentClick(event) {
    const button = event.target.closest('[data-wishlist-toggle]');
    if (!button) return;
    const name = button.dataset.productName || 'Item';
    const saved = storage.toggleWishlist(button.dataset.productId);
    showToast(saved ? name + ' saved to your wishlist.' : name + ' removed from your wishlist.');
  }

  /* ---------- Header and footer (single source for all pages) ---------- */
  const NAV_LINKS = [
    { label: 'Home', href: 'index.html', page: 'index.html' },
    { label: 'Shop', href: 'shop.html', page: 'shop.html' },
    { label: 'Clothing', href: 'shop.html?category=Clothing' },
    { label: 'Footwear', href: 'shop.html?category=Footwear' },
    { label: 'Accessories', href: 'shop.html?category=Accessories' },
    { label: 'Bags', href: 'shop.html?category=Bags' }
  ];

  function renderHeader() {
    const host = document.getElementById('site-header');
    if (!host) return;
    const page = currentPage();
    const activeCategory = new URLSearchParams(window.location.search).get('category');

    const links = NAV_LINKS.map(function (link) {
      let active = false;
      if (link.page === 'shop.html') {
        active = (page === 'shop.html' || page === 'product-details.html') && !activeCategory;
      } else if (link.page) {
        active = page === link.page;
      } else {
        active = page === 'shop.html' && link.href.endsWith('=' + activeCategory);
      }
      return `<li class="nav-item"><a class="nav-link${active ? ' active' : ''}" href="${link.href}"${active ? ' aria-current="page"' : ''}>${link.label}</a></li>`;
    }).join('');

    host.innerHTML = `
      <div class="announcement">Free delivery on orders over ${Luxora.formatPrice(Luxora.shipping.freeThreshold)}. Easy 14-day returns.</div>
      <nav class="navbar navbar-expand-lg" aria-label="Main navigation">
        <div class="container">
          <button class="icon-btn navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainMenu"
                  aria-controls="mainMenu" aria-expanded="false" aria-label="Toggle navigation menu">
            <i class="bi bi-list" aria-hidden="true"></i>
          </button>
          <a class="brand" href="index.html" aria-label="LUXORA home">LUXORA</a>
          <div class="header-actions">
            <button class="icon-btn" type="button" id="searchToggle" aria-expanded="false" aria-controls="searchBar" aria-label="Search products">
              <i class="bi bi-search" aria-hidden="true"></i>
            </button>
            <a class="icon-btn" href="shop.html?saved=1" aria-label="Wishlist">
              <i class="bi bi-heart" aria-hidden="true"></i><span class="count-badge" data-count="wishlist" hidden>0</span>
            </a>
            <a class="icon-btn" href="cart.html" aria-label="Shopping cart">
              <i class="bi bi-bag" aria-hidden="true"></i><span class="count-badge" data-count="cart" hidden>0</span>
            </a>
            <a class="icon-btn d-none d-sm-inline-flex" href="login.html" aria-label="Log in or register">
              <i class="bi bi-person" aria-hidden="true"></i>
            </a>
          </div>
          <div class="collapse navbar-collapse" id="mainMenu">
            <ul class="navbar-nav mx-lg-auto">${links}
              <li class="nav-item d-sm-none"><a class="nav-link${page === 'login.html' ? ' active' : ''}" href="login.html">Log in / Register</a></li>
            </ul>
          </div>
        </div>
      </nav>
      <div class="search-bar" id="searchBar" hidden>
        <div class="container">
          <form class="search-form" id="headerSearchForm" role="search">
            <label class="visually-hidden" for="headerSearchInput">Search products</label>
            <input class="search-input" id="headerSearchInput" type="search" placeholder="Search by name or category" autocomplete="off">
            <button class="btn-lux" type="submit">Search</button>
          </form>
        </div>
      </div>`;
  }

  function renderFooter() {
    const host = document.getElementById('site-footer');
    if (!host) return;
    host.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand brand--light" href="index.html" aria-label="LUXORA home">LUXORA</a>
            <p class="footer-tagline">Style that speaks.</p>
            <p class="footer-note">LUXORA is a frontend portfolio project. No real orders, payments or accounts exist.</p>
          </div>
          <div>
            <h2 class="footer-title">Shop</h2>
            <ul class="footer-list">
              <li><a href="shop.html">All products</a></li>
              <li><a href="shop.html?category=Clothing">Clothing</a></li>
              <li><a href="shop.html?category=Footwear">Footwear</a></li>
              <li><a href="shop.html?category=Accessories">Accessories</a></li>
              <li><a href="shop.html?category=Bags">Bags</a></li>
            </ul>
          </div>
          <div>
            <h2 class="footer-title">Your account</h2>
            <ul class="footer-list">
              <li><a href="login.html">Log in or register</a></li>
              <li><a href="shop.html?saved=1">Wishlist</a></li>
              <li><a href="cart.html">Shopping cart</a></li>
              <li><a href="checkout.html">Checkout (demo)</a></li>
            </ul>
          </div>
          <div>
            <h2 class="footer-title">Delivery and returns</h2>
            <p class="footer-note">Free delivery over ${Luxora.formatPrice(Luxora.shipping.freeThreshold)}, otherwise ${Luxora.formatPrice(Luxora.shipping.flatRate)}. Return unworn items within 14 days.</p>
          </div>
        </div>
        <p class="footer-legal">&copy; <span id="footerYear"></span> LUXORA. Demo storefront for portfolio use.</p>
      </div>`;
    document.getElementById('footerYear').textContent = new Date().getFullYear();
  }

  function setupSearch() {
    const toggle = document.getElementById('searchToggle');
    const bar = document.getElementById('searchBar');
    const form = document.getElementById('headerSearchForm');
    const input = document.getElementById('headerSearchInput');
    if (!toggle || !bar || !form || !input) return;

    function setOpen(open) {
      bar.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
    }

    toggle.addEventListener('click', function () { setOpen(bar.hidden); });
    bar.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { setOpen(false); toggle.focus(); }
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input.value.trim();
      window.location.href = 'shop.html' + (query ? '?q=' + encodeURIComponent(query) : '');
    });

    // Show the active query when arriving from a search.
    const existing = new URLSearchParams(window.location.search).get('q');
    if (currentPage() === 'shop.html' && existing) input.value = existing;
  }

  /* ---------- Form validation helpers (shared by checkout, login, newsletter) ---------- */
  function setFieldError(input, message) {
    const error = document.getElementById(input.id + '-error');
    if (error) error.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  /*
   * rules: { fieldName: function(value) -> error message or '' }
   * Validates on blur, re-validates while typing once a field has an error,
   * and blocks submission until every field passes.
   */
  function attachValidation(form, rules, onValid) {
    form.setAttribute('novalidate', '');

    function validateField(input) {
      const rule = rules[input.name];
      if (!rule) return true;
      const message = rule(input.value.trim());
      setFieldError(input, message);
      return message === '';
    }

    form.addEventListener('focusout', function (event) {
      if (event.target.name in rules) validateField(event.target);
    });
    form.addEventListener('input', function (event) {
      if (event.target.classList.contains('is-invalid')) validateField(event.target);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      let firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        const input = form.elements[name];
        if (input && !validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      onValid(form);
    });
  }

  function emailMessage(value) {
    if (!value) return 'Enter your email address.';
    return EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email address, like name@example.com.';
  }

  /* ---------- Newsletter (home page) ---------- */
  function setupNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    const status = document.getElementById('newsletterStatus');
    attachValidation(form, { email: emailMessage }, function () {
      status.textContent = 'Thanks for signing up. This is a demo, so your email was not stored or sent anywhere.';
      form.reset();
    });
  }

  /* ---------- Home page product rows (elements are absent on other pages) ---------- */
  function renderHomeSections() {
    const sections = {
      newArrivals: function (product) { return product.isNew; },
      bestSellers: function (product) { return product.isBestseller; }
    };
    Object.keys(sections).forEach(function (id) {
      const host = document.getElementById(id);
      if (!host) return;
      host.innerHTML = Luxora.products.filter(sections[id]).slice(0, 4).map(createProductCard).join('');
    });
  }

  /* ---------- Image fallback: one capture-phase listener covers every <img> ---------- */
  function setupImageFallback() {
    document.addEventListener('error', function (event) {
      const img = event.target;
      if (img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.src = Luxora.fallbackImage;
    }, true);
  }

  /* ---------- Public API for page scripts ---------- */
  Luxora.ui = {
    escapeHtml: escapeHtml, showToast: showToast, createProductCard: createProductCard,
    productUrl: productUrl, syncWishlistButtons: syncWishlistButtons, updateCounts: updateCounts,
    setFieldError: setFieldError, attachValidation: attachValidation, emailMessage: emailMessage
  };

  function init() {
    setupImageFallback();
    renderHeader();
    renderFooter();
    setupSearch();
    setupNewsletter();
    renderHomeSections();
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('luxora:storage-changed', function () {
      updateCounts();
      syncWishlistButtons();
    });
    updateCounts();
    syncWishlistButtons();
  }

  // Scripts are deferred, so the DOM is ready by now.
  init();
})();
