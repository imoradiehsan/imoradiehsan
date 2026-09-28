# Saba & Bahar Publishing (انتشارات صبا و بهار) — Online Bookstore UI

A premium, responsive bookstore front end for selling physical books, eBooks and audiobooks. It is built with plain HTML, CSS and JavaScript, and has no build step or dependencies.

**Serve the folder over HTTP** (e.g. `npx serve bookstore`, or GitHub Pages). Opening `index.html` directly as a file mostly works, but the logo will not show, because browsers block CSS masks on `file://` pages.

**Logo:** `assets/brand/logo.png` is a transparent version of the calligraphic logo. It is used as a CSS mask, so it takes the active template's color in the header and turns white in the footer. To replace it, upload a new transparent PNG with the same name and update `aspect-ratio` on `.logo__img` in `styles.css` if the proportions change.

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

## Settings you can edit — `assets/js/config.js`

- **Hero banners:** the homepage opens with a full-width slider (autoplay, arrows, dots, swipe). To change an image, upload a new file with the **same name** to `assets/banners/` (desktop `banner-1.jpg` … 1920×480, optional mobile `banner-1-mobile.jpg` … 1080×675). Links, alt text, number of banners and autoplay speed are set in `banners` / `bannerInterval`.
- **Color templates:** `teal`, `crimson`, `navy`, `violet`, `orange`, `forest` (defined in `assets/js/theme.js`; every shade is derived from three brand colors). The palette button in the page corner previews them live. When one is chosen, set `defaultTheme` to its id and `showThemeSwitcher: false`.

## Languages: فارسی / English

- The site runs in **Persian (right-to-left)** and **English (left-to-right)**. Persian is the default.
- Switch with the language button in the header (or the mobile menu). The choice is remembered, and a `?lang=en` / `?lang=fa` link forces one.
- Everything is translated: interface text, book titles and descriptions, authors, reviews and articles. Persian also uses Persian digits and the Solar Hijri calendar.
- The CSS uses logical properties (`margin-inline-start`, `inset-inline-end`, …), so the whole layout mirrors automatically in RTL.
- `assets/js/i18n.js` holds the language setup and UI strings, `assets/js/i18n-static.js` holds the Persian text for static page copy, and the Persian catalog lives at the end of `assets/js/data.js`.
- To translate a static element, add `data-i18n="key"` to it (or `data-i18n-attr="placeholder:key"` for an attribute) and add the Persian string to `i18n-static.js`.

## Design system

- **Colors:** white page background, text `#263238`, and a switchable template of primary / secondary / accent colors (default: teal `#0F7C82`, green `#68A936`, yellow `#F4B323`).
- **Type:** in English, Fraunces for display headings and Inter for body and UI text; in Persian, Vazirmatn for both (self-hosted in `assets/fonts`, SIL Open Font License). Heading sizes are fluid via `clamp()`.
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
