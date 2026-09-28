# Folio & Co. — Online Bookstore UI

A premium, responsive bookstore front end for selling physical books, eBooks and audiobooks. It is built with plain HTML, CSS and JavaScript, and has no build step or dependencies.

**Open `index.html` in a browser** (or serve the folder with `npx serve bookstore`).

## Pages

| Page | File | Highlights |
|---|---|---|
| Home | `index.html` | Hero with book stack and floating cards, trust strip, categories, featured grid with tabs, Top 10 carousel, new arrivals, festival banner with live countdown, AI recommendations, authors, reviews, blog, newsletter |
| Book listing | `books.html` | Filters for category, price range, author (searchable), rating, language and format; active-filter chips, sorting, grid/list view, pagination, mobile filter drawer. URL params: `?q=`, `?cat=`, `?author=`, `?collection=bestseller\|new\|offer` |
| Book detail | `book.html?id=1` | Gallery (front, back, first page, contents), format selector with per-format pricing, quantity, Add to cart / Buy now, details / author / reviews tabs, related carousel, sticky mobile buy bar |
| Cart | `cart.html` | Quantity controls, remove, save for later, free-shipping progress, discount codes (`READ10`, `SUMMER30`, `FREESHIP`), summary |
| Checkout | `checkout.html` | 3 steps (Shipping → Payment → Confirm) with inline validation; digital-only orders skip the address step |
| Account | `account.html` | Profile, order history, wishlist, saved addresses, payment methods, reading preferences |
| Wishlist | `wishlist.html` | Move to cart, remove, move all, price-drop indicators |
| Design system | `design-system.html` | Color tokens, type scale, spacing/radius/elevation, buttons, forms, cards, navigation, feedback, UX principles |

## Languages: فارسی / English

- The site runs in **Persian (right-to-left)** and **English (left-to-right)**. Persian is the default.
- Switch with the language button in the header (or the mobile menu). The choice is remembered, and a `?lang=en` / `?lang=fa` link forces one.
- Everything is translated: interface text, book titles and descriptions, authors, reviews and articles. Persian also uses Persian digits and the Solar Hijri calendar.
- The CSS uses logical properties (`margin-inline-start`, `inset-inline-end`, …), so the whole layout mirrors automatically in RTL.
- `assets/js/i18n.js` holds the language setup and UI strings, `assets/js/i18n-static.js` holds the Persian text for static page copy, and the Persian catalog lives at the end of `assets/js/data.js`.
- To translate a static element, add `data-i18n="key"` to it (or `data-i18n-attr="placeholder:key"` for an attribute) and add the Persian string to `i18n-static.js`.

## Design system

- **Colors:** primary `#0F7C82` (teal), secondary `#68A936` (green), accent `#F4B323` (yellow, for high-intent actions), background `#F7F8F2`, text `#263238`.
- **Type:** in English, Fraunces for display headings and Inter for body and UI text; in Persian, Vazirmatn for both. Heading sizes are fluid via `clamp()`.
- **Tokens:** every color, space, radius, shadow and motion value is a CSS custom property at the top of `assets/css/styles.css`.
- **Accessibility:** includes a skip link, semantic landmarks, labelled controls, visible focus, keyboard-navigable search suggestions, Escape to close modals, 44px touch targets, and `prefers-reduced-motion` support.

## Structure

```
assets/css/styles.css   tokens → base → layout → components → sections → pages
assets/js/i18n.js       language setup (loaded in <head>), formatting helpers, UI strings
assets/js/i18n-static.js Persian text for static page copy
assets/js/data.js       demo catalog (+ Persian content), categories, authors, reviews, icon set
assets/js/app.js        store (cart/wishlist in localStorage), generated covers, header/footer, modals, search, carousels
assets/js/pages.js      per-page controllers keyed by <body data-page>
```

Book covers, author portraits and article images are generated as SVG, so the UI has no image dependencies. To use real artwork, replace `coverHTML()` in `app.js` with `<img>` tags.
