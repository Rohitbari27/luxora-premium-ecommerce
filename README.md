# LUXORA

**Style that speaks.** LUXORA is a multi-page, responsive fashion and lifestyle storefront built as a frontend portfolio project with HTML, CSS, Bootstrap 5 and vanilla JavaScript.

> Checkout and login are **frontend demonstrations only**. There is no backend, no real authentication, no payment processing and no order is ever placed. No form data is stored or sent anywhere.

## Features

- Six pages: Home, Shop, Product details, Cart, Checkout (demo) and Login / Register (demo)
- Shared product catalogue (14 products, 4 categories) in one file, `js/products.js`
- Shop page with search, category filter, maximum-price slider, sorting (featured, price low-high, price high-low, name A-Z) and a "saved items only" view. All controls combine and none overwrite each other
- Product details loaded from `product-details.html?id=1`, with image gallery, size selection, quantity selector, related products and a not-found state for missing or invalid ids
- Wishlist and cart saved in `localStorage`, with counts in the header on every page
- Cart quantities limited to 1-10, free delivery over ₹5,000 (otherwise ₹199), and safe handling of missing, malformed or tampered stored data
- Checkout and login forms with inline, accessible validation (email, 10-digit mobile, 6-digit PIN code, password length)
- Responsive layout for mobile, tablet and desktop, with a collapsing menu and filter panel
- Accessibility: semantic landmarks, skip link, labelled controls, visible focus, `aria-live` messages, reduced-motion support
- Image fallback: if any image fails to load, a local placeholder is shown

## Technologies

HTML5, CSS3 (custom properties), Bootstrap 5.3 (CDN, grid, collapse and utilities), Bootstrap Icons (CDN), Google Fonts (CDN), vanilla JavaScript (ES6+), `localStorage`.

## Project structure

```text
LUXORA/
├── index.html
├── shop.html
├── product-details.html
├── cart.html
├── checkout.html
├── login.html
├── assets/
│   ├── images/     (local SVG product artwork, hero and placeholder)
│   ├── icons/      (favicon)
│   └── fonts/      (note about fonts)
├── css/
│   ├── style.css       (tokens, base styles, page layouts)
│   ├── components.css  (header, footer, buttons, cards, forms, toasts)
│   └── responsive.css  (tablet and mobile breakpoints)
├── js/
│   ├── products.js         (catalogue and constants)
│   ├── storage.js          (safe localStorage cart and wishlist)
│   ├── main.js             (header, footer, counts, wishlist buttons, validation helpers)
│   ├── shop.js
│   ├── product-details.js
│   ├── cart.js
│   ├── checkout.js
│   └── login.js
└── README.md
```

The header and footer are rendered once from `js/main.js`, so every page shares the same navigation.

## Run locally

1. Extract `LUXORA_Frontend_Website.zip`.
2. Open `LUXORA/index.html` in a modern browser. No build step or server is required.
3. Optional: serve the folder (for example `python3 -m http.server` inside `LUXORA/`) and visit `http://localhost:8000`.

An internet connection is needed for Bootstrap, Bootstrap Icons and Google Fonts. Without it the site still works but looks plainer and icons will not show.

## Notes

- Product images are original SVG illustrations created for this project, not photographs.
- Bootstrap CDN links do not use Subresource Integrity hashes. Add them if you deploy the site.

## Screenshots

- Home: _placeholder_
- Shop: _placeholder_
- Product details: _placeholder_

## Future improvements

- Replace SVG artwork with real product photography
- Load products from an API and add pagination
- Real accounts, payments and order history through a backend
- A dedicated wishlist page and colour variants
- Self-hosted fonts and Subresource Integrity on CDN assets
- Automated tests (for example Playwright)
