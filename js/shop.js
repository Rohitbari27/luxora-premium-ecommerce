/* Shop page: search, category, price and sort all work together from one state object. */
(function () {
  'use strict';

  const Luxora = window.Luxora;
  const ui = Luxora.ui;
  const storage = Luxora.storage;

  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const searchInput = document.getElementById('shopSearch');
  const sortSelect = document.getElementById('sortSelect');
  const priceRange = document.getElementById('priceRange');
  const priceLabel = document.getElementById('priceLabel');
  const savedOnlyBox = document.getElementById('savedOnly');
  const categoryInputs = document.querySelectorAll('input[name="category"]');
  const countLabel = document.getElementById('productCount');
  const emptyState = document.getElementById('emptyState');
  const clearButtons = document.querySelectorAll('[data-clear-filters]');

  // Price slider goes up to the most expensive product, rounded up to the next 500.
  const highestPrice = Math.ceil(Math.max.apply(null, Luxora.products.map(function (p) { return p.price; })) / 500) * 500;

  const state = readStateFromUrl();

  function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    return {
      query: (params.get('q') || '').trim(),
      category: Luxora.categories.includes(category) ? category : 'All',
      maxPrice: highestPrice,
      sort: 'featured',
      savedOnly: params.get('saved') === '1'
    };
  }

  function writeStateToUrl() {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query);
    if (state.category !== 'All') params.set('category', state.category);
    if (state.savedOnly) params.set('saved', '1');
    const queryString = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (queryString ? '?' + queryString : ''));
  }

  function matchesQuery(product) {
    const haystack = (product.name + ' ' + product.category).toLowerCase();
    return state.query.toLowerCase().split(/\s+/).filter(Boolean).every(function (word) {
      return haystack.includes(word);
    });
  }

  function sortProducts(list) {
    const sorted = list.slice();
    if (state.sort === 'price-asc') sorted.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === 'price-desc') sorted.sort(function (a, b) { return b.price - a.price; });
    if (state.sort === 'name') sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (state.sort === 'featured') {
      sorted.sort(function (a, b) { return Number(b.isFeatured) - Number(a.isFeatured) || a.id - b.id; });
    }
    return sorted;
  }

  function getVisibleProducts() {
    const wishlist = storage.getWishlist();
    const filtered = Luxora.products.filter(function (product) {
      return matchesQuery(product) &&
        (state.category === 'All' || product.category === state.category) &&
        product.price <= state.maxPrice &&
        (!state.savedOnly || wishlist.includes(product.id));
    });
    return sortProducts(filtered);
  }

  function render() {
    const visible = getVisibleProducts();
    grid.innerHTML = visible.map(ui.createProductCard).join('');
    grid.hidden = visible.length === 0;
    emptyState.hidden = visible.length !== 0;
    countLabel.textContent = visible.length + (visible.length === 1 ? ' product' : ' products');
    priceLabel.textContent = 'Up to ' + Luxora.formatPrice(state.maxPrice);

    const emptyText = document.getElementById('emptyText');
    emptyText.textContent = state.savedOnly && storage.getWishlist().length === 0
      ? 'You have not saved anything yet. Tap the heart on any product to save it here.'
      : 'Try a different search, widen the price range or clear your filters.';

    ui.syncWishlistButtons();
    writeStateToUrl();
  }

  function syncControlsFromState() {
    searchInput.value = state.query;
    sortSelect.value = state.sort;
    priceRange.max = highestPrice;
    priceRange.value = state.maxPrice;
    savedOnlyBox.checked = state.savedOnly;
    categoryInputs.forEach(function (input) { input.checked = input.value === state.category; });
  }

  function clearFilters() {
    state.query = '';
    state.category = 'All';
    state.maxPrice = highestPrice;
    state.sort = 'featured';
    state.savedOnly = false;
    const headerSearch = document.getElementById('headerSearchInput');
    if (headerSearch) headerSearch.value = '';
    syncControlsFromState();
    render();
  }

  searchInput.addEventListener('input', function () {
    state.query = searchInput.value.trim();
    render();
  });
  sortSelect.addEventListener('change', function () { state.sort = sortSelect.value; render(); });
  priceRange.addEventListener('input', function () { state.maxPrice = Number(priceRange.value); render(); });
  savedOnlyBox.addEventListener('change', function () { state.savedOnly = savedOnlyBox.checked; render(); });
  categoryInputs.forEach(function (input) {
    input.addEventListener('change', function () { state.category = input.value; render(); });
  });
  clearButtons.forEach(function (button) { button.addEventListener('click', clearFilters); });
  document.getElementById('searchForm').addEventListener('submit', function (event) { event.preventDefault(); });

  // When a product is removed while "saved only" is on, refresh the grid.
  document.addEventListener('luxora:storage-changed', function () {
    if (state.savedOnly) render();
  });

  syncControlsFromState();
  render();
})();
