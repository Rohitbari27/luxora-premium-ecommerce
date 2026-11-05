/* Shared product catalogue and shop-wide constants. Loaded before every other script. */
(function () {
  'use strict';

  const IMG = 'assets/images/';
  const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  const FOOTWEAR_SIZES = ['6', '7', '8', '9', '10', '11'];
  const BELT_SIZES = ['S', 'M', 'L'];

  function images(id) {
    return [`${IMG}product-${id}-a.svg`, `${IMG}product-${id}-b.svg`];
  }

  const products = [
    { id: 1, name: 'Structured Wool Blazer', category: 'Clothing', price: 12990,
      description: 'A sharply cut single-breasted blazer in a dense wool blend, with soft shoulders and a clean, lined finish.',
      sizes: CLOTHING_SIZES, isFeatured: true, isBestseller: true },
    { id: 2, name: 'Relaxed Linen Shirt', category: 'Clothing', price: 3490,
      description: 'A breathable, easy-fitting shirt in washed European linen. Wear it buttoned up or open over a tee.',
      sizes: CLOTHING_SIZES, isFeatured: true, isNew: true },
    { id: 3, name: 'Silk Slip Dress', category: 'Clothing', price: 7990,
      description: 'A bias-cut slip dress in heavy silk satin that skims the body and moves beautifully.',
      sizes: CLOTHING_SIZES, isNew: true },
    { id: 4, name: 'Tailored Pleated Trousers', category: 'Clothing', price: 4990,
      description: 'High-waisted trousers with a double pleat and a straight, full-length leg in a fluid crepe.',
      sizes: CLOTHING_SIZES },
    { id: 5, name: 'Minimal Leather Sneakers', category: 'Footwear', price: 6490,
      description: 'Low-profile sneakers in smooth Italian leather with a cushioned insole and a durable rubber sole.',
      sizes: FOOTWEAR_SIZES, isFeatured: true, isBestseller: true },
    { id: 6, name: 'Suede Chelsea Boots', category: 'Footwear', price: 9990,
      description: 'Soft suede boots with elastic side panels, a pull tab and a stacked leather sole.',
      sizes: FOOTWEAR_SIZES, isNew: true },
    { id: 7, name: 'Classic Penny Loafers', category: 'Footwear', price: 7490,
      description: 'Hand-finished leather loafers with a flexible sole, made to be worn with or without socks.',
      sizes: FOOTWEAR_SIZES },
    { id: 8, name: 'Aviator Sunglasses', category: 'Accessories', price: 3990,
      description: 'Lightweight metal-frame aviators with UV400 lenses and adjustable nose pads.',
      isBestseller: true },
    { id: 9, name: 'Merino Wool Scarf', category: 'Accessories', price: 2990,
      description: 'A generous, featherweight scarf in fine merino wool with a hand-rolled fringe.',
      isNew: true },
    { id: 10, name: 'Leather Dress Belt', category: 'Accessories', price: 2490,
      description: 'A slim full-grain leather belt with a brushed brass buckle and edge-painted finish.',
      sizes: BELT_SIZES },
    { id: 11, name: 'Everyday Leather Tote', category: 'Bags', price: 11990,
      description: 'A roomy, structured tote with an internal zip pocket, sized to fit a 14-inch laptop.',
      isFeatured: true, isBestseller: true },
    { id: 12, name: 'Mini Crossbody Bag', category: 'Bags', price: 6990,
      description: 'A compact crossbody with a magnetic flap and an adjustable strap, big enough for the essentials.',
      isNew: true },
    { id: 13, name: 'Canvas Weekender Bag', category: 'Bags', price: 8490,
      description: 'A hard-wearing waxed canvas duffel with leather trims, a shoulder strap and a wide zip opening.' },
    { id: 14, name: 'Slim Card Wallet', category: 'Accessories', price: 1990,
      description: 'A minimal wallet in vegetable-tanned leather with four card slots and a centre pocket for notes.',
      isBestseller: true }
  ].map(function (product) {
    // Every product gets two images: the main view and an alternate colourway.
    return Object.assign({ sizes: null, isFeatured: false, isNew: false, isBestseller: false }, product, {
      images: images(product.id)
    });
  });

  const Luxora = (window.Luxora = window.Luxora || {});

  Luxora.products = products;
  Luxora.categories = ['Clothing', 'Footwear', 'Accessories', 'Bags'];
  Luxora.shipping = { freeThreshold: 5000, flatRate: 199 };
  Luxora.maxQuantity = 10;
  Luxora.fallbackImage = IMG + 'placeholder.svg';

  Luxora.getProductById = function (id) {
    const numericId = Number(id);
    return products.find(function (product) { return product.id === numericId; }) || null;
  };

  Luxora.formatPrice = function (amount) {
    return '\u20B9' + Number(amount).toLocaleString('en-IN');
  };
})();
