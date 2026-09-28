/* Folio & Co. — shared UI: store, generated art, header/footer, components, interactions. */

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const DIR_ICONS = ['arrowRight', 'chevRight', 'chevLeft']; // mirrored in RTL via .dir-icon
const icon = (name, extra = '') => {
  const cls = DIR_ICONS.includes(name) ? 'dir-icon' : '';
  if (cls) extra = /class="/.test(extra) ? extra.replace('class="', `class="${cls} `) : `${extra} class="${cls}"`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[name] || ''}</svg>`;
};
const shortName = n => n.replace(/^(Dr\. |دکتر )/, '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const params = new URLSearchParams(location.search);
const bookById = id => BOOKS.find(b => b.id === Number(id));
const catBySlug = slug => CATEGORIES.find(c => c.slug === slug);
const authorOf = b => AUTHORS[b.author];
function seeded(seed) { let t = seed * 9973 + 7; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
function hash(str) { let h = 0; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }

/* ---------- Pricing by format ---------- */
const FORMAT_MULT = { Hardcover: 1, Paperback: 0.78, eBook: 0.55, Audiobook: 0.85 };
const FORMAT_NOTE = { Hardcover: t('fmtnote.ship'), Paperback: t('fmtnote.ship'), eBook: t('fmtnote.ebook'), Audiobook: t('fmtnote.audio') };
const fmtName = f => t('fmt.' + f);
function priceFor(b, fmt = b.formats[0]) {
  const ratio = FORMAT_MULT[fmt] / FORMAT_MULT[b.formats[0]];
  const p = +(b.price * ratio).toFixed(2);
  const o = b.old ? +(b.old * ratio).toFixed(2) : null;
  return { price: p, old: o };
}
const discountPct = b => b.old ? Math.round((1 - b.price / b.old) * 100) : 0;

/* ---------- Store (localStorage, fails soft) ---------- */
const Store = {
  read(key, fallback) { try { const v = localStorage.getItem('folio.' + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  write(key, val) { try { localStorage.setItem('folio.' + key, JSON.stringify(val)); } catch { /* private mode */ } this._mem[key] = val; },
  _mem: {},
  get cart() { return this._mem.cart ?? (this._mem.cart = this.read('cart', null)) ?? this.seed().cart; },
  get wish() { return this._mem.wish ?? (this._mem.wish = this.read('wish', null)) ?? this.seed().wish; },
  seed() { // demo content so cart / wishlist pages are populated on first visit
    const cart = [{ id: 1, fmt: 'Hardcover', qty: 1 }, { id: 6, fmt: 'eBook', qty: 1 }];
    const wish = [4, 9, 13, 19, 22];
    this.write('cart', cart); this.write('wish', wish);
    return { cart, wish };
  },
  setCart(c) { this.write('cart', c); updateCounts(); },
  setWish(w) { this.write('wish', w); updateCounts(); },
  addToCart(id, fmt, qty = 1) {
    const b = bookById(id); fmt = fmt || b.formats[0];
    const cart = [...this.cart]; const line = cart.find(l => l.id === b.id && l.fmt === fmt);
    if (line) line.qty = Math.min(line.qty + qty, 99); else cart.push({ id: b.id, fmt, qty });
    this.setCart(cart);
  },
  toggleWish(id) {
    id = Number(id); const w = this.wish.includes(id) ? this.wish.filter(x => x !== id) : [...this.wish, id];
    this.setWish(w); return w.includes(id);
  },
  cartCount() { return this.cart.reduce((s, l) => s + l.qty, 0); },
  cartSubtotal() { return this.cart.reduce((s, l) => s + priceFor(bookById(l.id), l.fmt).price * l.qty, 0); }
};

function updateCounts() {
  $$('[data-count="cart"]').forEach(el => { const n = Store.cartCount(); el.textContent = fmtNum(n); el.dataset.n = n; });
  $$('[data-count="wish"]').forEach(el => { const n = Store.wish.length; el.textContent = fmtNum(n); el.dataset.n = n; });
  $$('[data-wish]').forEach(el => {
    const on = Store.wish.includes(Number(el.dataset.wish));
    el.classList.toggle('is-active', on); el.setAttribute('aria-pressed', on);
    el.setAttribute('aria-label', on ? t('card.wishRemove') : t('card.wishAdd'));
  });
}

/* ---------- Generated art ---------- */
function coverArt(b) {
  const [bg, fg, ac] = b.pal; const r = seeded(b.id); let s = '';
  switch (b.style) {
    case 'orb': s = `<circle cx="150" cy="200" r="98" fill="${ac}" opacity=".95"/><circle cx="150" cy="200" r="70" fill="none" stroke="${bg}" stroke-width="1.5" opacity=".5"/><circle cx="46" cy="118" r="12" fill="${fg}" opacity=".25"/>`; break;
    case 'grid': for (let x = 0; x < 10; x++) for (let y = 0; y < 15; y++) s += `<circle cx="${10 + x * 20}" cy="${10 + y * 20}" r="1.4" fill="${fg}" opacity=".18"/>`;
      s += `<rect x="96" y="150" width="84" height="84" rx="4" fill="${ac}"/><rect x="118" y="172" width="84" height="84" rx="4" fill="none" stroke="${fg}" stroke-width="2"/>`; break;
    case 'stripes': for (let i = -8; i < 20; i++) s += `<path d="M${i * 22} 300 L${i * 22 + 200} 0" stroke="${fg}" stroke-width="7" opacity="${i % 3 ? .06 : .16}"/>`;
      s += `<rect x="0" y="206" width="200" height="10" fill="${ac}" opacity=".9"/>`; break;
    case 'wave': for (let i = 0; i < 7; i++) s += `<path d="M-10 ${150 + i * 18} C 40 ${120 + i * 18}, 90 ${190 + i * 18}, 210 ${140 + i * 18}" fill="none" stroke="${i === 3 ? ac : fg}" stroke-width="${i === 3 ? 5 : 1.6}" opacity="${i === 3 ? 1 : .35}"/>`; break;
    case 'arch': s = `<path d="M30 300 V200 a70 70 0 0 1 140 0 V300Z" fill="${ac}" opacity=".95"/><path d="M52 300 V206 a48 48 0 0 1 96 0 V300Z" fill="${bg}" opacity=".35"/><circle cx="100" cy="190" r="10" fill="${fg}" opacity=".8"/>`; break;
    case 'stars': for (let i = 0; i < 70; i++) s += `<circle cx="${r() * 200}" cy="${r() * 300}" r="${r() * 1.3 + .3}" fill="${fg}" opacity="${r() * .7 + .2}"/>`;
      s += `<circle cx="140" cy="210" r="46" fill="${ac}"/><ellipse cx="140" cy="210" rx="76" ry="14" fill="none" stroke="${fg}" stroke-width="2" opacity=".7" transform="rotate(-18 140 210)"/>`; break;
    case 'moon': for (let i = 0; i < 30; i++) s += `<circle cx="${r() * 200}" cy="${r() * 170}" r="${r() + .4}" fill="${fg}" opacity=".6"/>`;
      s += `<circle cx="146" cy="130" r="30" fill="${ac}"/><circle cx="158" cy="122" r="26" fill="${bg}"/><path d="M0 250 Q60 205 120 240 T200 228 V300 H0Z" fill="${fg}" opacity=".16"/><path d="M0 272 Q70 238 140 266 T200 262 V300 H0Z" fill="${fg}" opacity=".24"/>`; break;
    case 'frame': s = `<rect x="14" y="14" width="172" height="272" fill="none" stroke="${fg}" stroke-width="1" opacity=".5"/><rect x="20" y="20" width="160" height="260" fill="none" stroke="${ac}" stroke-width="2"/><path d="M80 214 h40 M100 204 v20" stroke="${ac}" stroke-width="2"/><circle cx="100" cy="214" r="18" fill="none" stroke="${ac}" stroke-width="1.5"/>`; break;
    case 'circuit': for (let i = 0; i < 9; i++) { const y = 130 + i * 18, x = 20 + r() * 80; s += `<path d="M-5 ${y} H${x} l12 -12 H210" fill="none" stroke="${i === 4 ? ac : fg}" stroke-width="${i === 4 ? 2.5 : 1.2}" opacity="${i === 4 ? 1 : .3}"/><circle cx="${x}" cy="${y}" r="3" fill="${i === 4 ? ac : fg}" opacity="${i === 4 ? 1 : .5}"/>`; } break;
    case 'mountain': s = `<circle cx="150" cy="140" r="22" fill="${ac}"/><path d="M-10 300 L60 170 L100 220 L150 150 L220 300Z" fill="${fg}" opacity=".22"/><path d="M-10 300 L40 220 L90 260 L140 200 L220 300Z" fill="${fg}" opacity=".35"/>`; break;
  }
  return `<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}
function coverHTML(b, cls = '') {
  const layout = ['frame'].includes(b.style) ? 'cover--center' : '';
  return `<div class="cover ${layout} ${cls}" style="--c-bg:${b.pal[0]};--c-fg:${b.pal[1]};--c-ac:${b.pal[2]}" role="img" aria-label="${esc(t('cover.aria', { t: b.title, a: authorOf(b).name }))}">
    <div class="cover__art">${coverArt(b)}</div>
    <span class="cover__kicker">${esc(b.kicker)}</span>
    <span class="cover__title">${esc(b.title)}</span>
    <span class="cover__author">${esc(shortName(authorOf(b).name))}</span>
  </div>`;
}
const miniCover = b => `<div class="mini-cover">${coverHTML(b)}</div>`;

function avatarHTML(name, color) {
  const initials = shortName(name).split(' ').map(p => p[0]).join('').slice(0, 2);
  return `<span class="avatar" style="background:${color}" aria-hidden="true">${initials}</span>`;
}
function authorPortrait(key) { // illustrated, abstract portrait
  const a = AUTHORS[key]; const [bg, ink, alt] = a.palette; const skins = ['#f1c9a5', '#d9a07a', '#a86b48', '#7a4a2e', '#e8b996']; const skin = skins[hash(key) % skins.length];
  const hair = hash(key) % 3;
  const hairPath = [
    `<path d="M34 50c0-16 10-26 26-26s26 10 26 26c0 4-2 6-4 6 0-12-8-18-22-18s-22 6-22 18c-2 0-4-2-4-6Z" fill="${alt}"/>`,
    `<path d="M32 58c-2-22 10-36 28-36s30 14 28 36c-4 10-6 28-6 28l-4-30c-8-2-16-8-18-14-4 8-14 12-22 14l-2 30s-2-18-4-28Z" fill="${alt}"/>`,
    `<path d="M36 46c2-14 12-22 24-22 14 0 24 8 24 22-6-6-14-8-24-8s-18 2-24 8Z" fill="${alt}"/><circle cx="60" cy="22" r="8" fill="${alt}"/>`
  ][hair];
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="${bg}"/><circle cx="96" cy="24" r="14" fill="${ink}" opacity=".15"/>
    <path d="M18 120c2-24 20-36 42-36s40 12 42 36Z" fill="${ink}"/><path d="M50 84h20v10a10 10 0 0 1-20 0Z" fill="${skin}"/>
    <ellipse cx="60" cy="56" rx="22" ry="25" fill="${skin}"/>${hairPath}</svg>`;
}
function postArt(p, i) {
  const [a, b, c] = p.art;
  const shapes = [
    `<rect width="400" height="250" fill="${a}"/><circle cx="310" cy="70" r="120" fill="${b}" opacity=".9"/><path d="M60 190 q70 -40 140 0 q70 -40 140 0 v20 q-70 -40 -140 0 q-70 -40 -140 0Z" fill="${c}"/><path d="M200 190 v20" stroke="${a}" stroke-width="3"/>`,
    `<rect width="400" height="250" fill="${a}"/>${[0, 1, 2, 3, 4].map(k => `<rect x="${70 + k * 54}" y="${60 + (k % 2) * 20}" width="40" height="${150 - (k % 2) * 20}" rx="4" fill="${k === 2 ? b : c}" opacity="${k === 2 ? 1 : .85 - k * .1}"/>`).join('')}<rect x="50" y="210" width="300" height="8" rx="4" fill="${c}"/>`,
    `<rect width="400" height="250" fill="${a}"/><circle cx="130" cy="125" r="70" fill="${b}"/><circle cx="130" cy="110" r="26" fill="${c}"/><path d="M84 180 a46 46 0 0 1 92 0Z" fill="${c}"/><path d="M230 90h110M230 120h90M230 150h100M230 180h70" stroke="${b}" stroke-width="8" stroke-linecap="round"/>`
  ];
  return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${shapes[i % shapes.length]}</svg>`;
}

/* ---------- Reusable fragments ---------- */
function starsHTML(rating) {
  let out = '<span class="stars" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i - 0.25) out += icon('star');
    else if (rating >= i - 0.75) out += `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="h${i}"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="var(--gray-300)"/></linearGradient></defs><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" fill="url(#h${i})"/></svg>`;
    else out += `<span class="empty">${icon('star')}</span>`;
  }
  return out + '</span>';
}
const ratingHTML = b => `<span class="rating">${starsHTML(b.rating)}<strong>${fmtRating(b.rating)}</strong><span>(${fmtNum(b.reviews)})</span><span class="sr-only">${t('rating.sr', { r: fmtRating(b.rating), n: b.reviews })}</span></span>`;
const priceHTML = (b, fmt) => { const p = priceFor(b, fmt); return `<span class="price"><span class="price__now">${money(p.price)}</span>${p.old ? `<span class="price__old">${money(p.old)}</span>` : ''}</span>`; };

function badgesHTML(b) {
  const out = [];
  if (b.old) out.push(`<span class="badge badge--sale">${(-discountPct(b)).toLocaleString(LOC)}%</span>`);
  if (b.tags.includes('new')) out.push(`<span class="badge badge--new">${t('badge.new')}</span>`);
  else if (b.tags.includes('bestseller')) out.push(`<span class="badge badge--gold">${t('badge.best')}</span>`);
  return out.join('');
}

function bookCard(b, opts = {}) {
  const cat = catBySlug(b.cat);
  return `<article class="book-card">
    <div class="book-card__media">
      <div class="book-card__badges">${badgesHTML(b)}</div>
      <button class="book-card__wish" data-wish="${b.id}" aria-label="${t('card.wishAdd')}">${icon('heart')}</button>
      ${coverHTML(b)}
      <div class="book-card__quick"><button class="btn btn--sm" data-quick="${b.id}">${icon('eye')} ${t('card.quick')}</button></div>
    </div>
    <div class="book-card__body">
      <span class="book-card__cat">${opts.match ? `<span class="match">${t('card.match', { p: opts.match })}</span>` : esc(cat.name)}</span>
      <h3 class="book-card__title"><a href="book.html?id=${b.id}">${esc(b.title)}</a></h3>
      <span class="book-card__author">${esc(authorOf(b).name)}</span>
      ${ratingHTML(b)}
      <p class="book-card__desc">${esc(b.blurb)}</p>
      <div class="book-card__foot">
        ${priceHTML(b)}
        <button class="book-card__add" data-add="${b.id}" aria-label="${esc(t('card.addAria', { t: b.title }))}">${icon('bag')}</button>
      </div>
    </div>
  </article>`;
}

const PAY_ICONS = {
  visa: '<svg viewBox="0 0 48 16"><text x="24" y="13" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-style="italic" font-size="14" fill="#1a1f71">VISA</text></svg>',
  mc: '<svg viewBox="0 0 40 24"><circle cx="15" cy="12" r="9" fill="#eb001b"/><circle cx="25" cy="12" r="9" fill="#f79e1b" fill-opacity=".9"/></svg>',
  amex: '<svg viewBox="0 0 48 16"><rect width="48" height="16" rx="3" fill="#1f72cd"/><text x="24" y="11.5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="8.5" fill="#fff">AMEX</text></svg>',
  paypal: '<svg viewBox="0 0 56 16"><text x="2" y="12.5" font-family="Arial,sans-serif" font-weight="700" font-style="italic" font-size="12.5" fill="#003087">Pay<tspan fill="#009cde">Pal</tspan></text></svg>',
  apple: '<svg viewBox="0 0 48 16"><text x="24" y="12.5" text-anchor="middle" font-family="-apple-system,Arial,sans-serif" font-weight="600" font-size="12" fill="#000">● Pay</text></svg>',
  gpay: '<svg viewBox="0 0 48 16"><text x="24" y="12.5" text-anchor="middle" font-family="Arial,sans-serif" font-weight="600" font-size="12"><tspan fill="#4285f4">G</tspan><tspan fill="#5f6368"> Pay</tspan></text></svg>'
};
const paymentsHTML = (keys = ['visa', 'mc', 'amex', 'paypal', 'apple', 'gpay']) =>
  `<div class="payments" aria-label="${t('pay.aria')}">${keys.map(k => `<span class="pay" title="${k}">${PAY_ICONS[k]}</span>`).join('')}</div>`;

/* ---------- Header / footer / global chrome ---------- */
const NAV = [
  [t('nav.home'), 'index.html', 'home'], [t('nav.books'), 'books.html', 'books'], [t('nav.categories'), 'index.html#categories', 'categories'],
  [t('nav.best'), 'books.html?collection=bestseller', 'bestseller'], [t('nav.new'), 'books.html?collection=new', 'new'],
  [t('nav.offers'), 'books.html?collection=offer', 'offer'], [t('nav.blog'), 'index.html#blog', 'blog']
];
const LOGO = `<a href="index.html" class="logo" aria-label="${t('brand.aria')}">
  <span class="logo__mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z"/><path d="M12 6.5v13"/></svg></span>
  <span><span class="logo__text">${LANG === 'fa' ? 'کتاب‌سرای <em>فولیو</em>' : 'Folio <em>&amp;</em> Co.'}</span><span class="logo__tag">${t('brand.tag')}</span></span></a>`;
const otherLang = LANG === 'fa' ? 'en' : 'fa';
const langBtn = (cls = '') => `<button class="lang-btn ${cls}" data-set-lang="${otherLang}" lang="${otherLang}" aria-label="${t('lang.switch')}: ${LANGS[otherLang].label}">${icon('globe')}<span>${LANGS[otherLang].short}</span></button>`;

function activeNavKey() {
  const page = document.body.dataset.page; const col = params.get('collection');
  if (page === 'books') return col || 'books';
  return page === 'home' ? 'home' : '';
}
function searchHTML(id) {
  return `<form class="search" role="search" action="books.html" data-search>
    <label for="${id}" class="sr-only">${t('search.label')}</label>
    ${icon('search', 'class="search__icon"')}
    <input id="${id}" class="search__input" name="q" type="search"  placeholder="${t('search.ph')}" autocomplete="off" aria-autocomplete="list" aria-controls="${id}-panel" value="${esc(params.get('q') || '')}">
    <button class="search__submit" type="submit" aria-label="${t('hdr.search')}">${icon('arrowRight')}</button>
    <div class="search__panel" id="${id}-panel" role="listbox"></div>
  </form>`;
}

function renderHeader() {
  const key = activeNavKey();
  const navLinks = NAV.map(([label, href, k]) => `<a href="${href}" ${k === key ? 'aria-current="page"' : ''} class="${k === 'offer' ? 'nav__offer' : ''}">${k === 'offer' ? icon('tag', 'width="15" height="15"') : ''}${label}</a>`).join('');
  $('#site-header').outerHTML = `
  <a href="#main" class="skip-link">${t('skip')}</a>
  <div class="announce"><div class="container">
    <span>${icon('truck', 'width="15" height="15" style="display:inline;vertical-align:-3px;margin-inline-end:6px"')}${t('announce.ship', { amt: moneyInt(35) })}<span class="hide-mobile">${t('announce.ebooks')}</span></span>
    <div class="announce__links"><a href="account.html#orders">${t('announce.track')}</a><a href="#">${t('announce.help')}</a><a href="#">${t('announce.gift')}</a></div>
  </div></div>
  <header class="header" id="header">
    <div class="container header__main">
      <button class="icon-btn header__menu-btn" data-open-drawer aria-label="${t('hdr.menu')}" aria-controls="nav-drawer" aria-expanded="false">${icon('menu')}</button>
      ${LOGO}
      ${searchHTML('search-desktop')}
      <div class="header__actions">
        <button class="icon-btn header__search-btn" data-toggle-search aria-label="${t('hdr.search')}" aria-expanded="false">${icon('search')}</button>
        <div class="dropdown header__user">
          <button class="icon-btn" data-dropdown aria-haspopup="menu" aria-expanded="false" aria-label="${t('hdr.account')}">${icon('user')}</button>
          <div class="dropdown__menu" role="menu">
            <a class="dropdown__item" role="menuitem" href="account.html#profile">${icon('user')} ${t('menu.profile')}</a>
            <a class="dropdown__item" role="menuitem" href="account.html#orders">${icon('package')} ${t('menu.orders')}</a>
            <a class="dropdown__item" role="menuitem" href="wishlist.html">${icon('heart')} ${t('menu.wishlist')}</a>
            <a class="dropdown__item" role="menuitem" href="account.html#preferences">${icon('settings')} ${t('menu.prefs')}</a>
            <div class="dropdown__sep"></div>
            <button class="dropdown__item" role="menuitem" data-auth="login">${icon('logout')} ${t('menu.signin')}</button>
          </div>
        </div>
        <a class="icon-btn header__wish" href="wishlist.html" aria-label="${t('hdr.wishlist')}">${icon('heart')}<span class="count" data-count="wish"></span></a>
        <a class="icon-btn" href="cart.html" aria-label="${t('hdr.cart')}" data-cart-btn>${icon('bag')}<span class="count" data-count="cart"></span></a>
        ${langBtn('header__lang')}
        <button class="btn btn--sm header__login" data-auth="login">${t('hdr.login')}</button>
      </div>
    </div>
    <div class="container header__mobile-search">${searchHTML('search-mobile')}</div>
    <div class="header__nav"><nav class="container nav" aria-label="${t('nav.primary')}">${navLinks}
      <div class="nav__aside"><span>${icon('bolt')} ${t('nav.instant')}</span><span>${icon('refresh')} ${t('nav.returns')}</span></div>
    </nav></div>
  </header>
  <div class="drawer" id="nav-drawer" aria-hidden="true">
    <div class="drawer__backdrop" data-close-drawer></div>
    <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="${t('drawer.title')}">
      <div class="drawer__head">${LOGO}<button class="icon-btn" data-close-drawer aria-label="${t('hdr.closeMenu')}">${icon('close')}</button></div>
      <div class="drawer__quick" style="padding-top:16px">
        <a href="account.html">${icon('user')}${t('drawer.account')}</a><a href="wishlist.html">${icon('heart')}${t('hdr.wishlist')}</a><a href="cart.html">${icon('bag')}${t('drawer.cart')}</a>
      </div>
      <nav class="drawer__nav" aria-label="${t('drawer.title')}">${NAV.map(([l, h, k]) => `<a href="${h}" ${k === key ? 'aria-current="page"' : ''}>${l}${icon('chevRight')}</a>`).join('')}
        <a href="design-system.html">${t('nav.ds')}${icon('chevRight')}</a></nav>
      <div class="drawer__foot">
        <button class="btn btn--ghost btn--block" data-set-lang="${otherLang}" lang="${otherLang}">${icon('globe')} ${LANGS[otherLang].label}</button>
        <button class="btn btn--block" data-auth="login">${t('drawer.login')}</button>
        <button class="btn btn--outline btn--block" data-auth="register">${t('drawer.register')}</button>
      </div>
    </div>
  </div>`;
}

function renderFooter() {
  const col = (title, links) => `<div><h4>${title}</h4><ul>${links.map(([l, h]) => `<li><a href="${h || '#'}">${l}</a></li>`).join('')}</ul></div>`;
  $('#site-footer').outerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__about">
          ${LOGO}
          <p>${t('foot.about')}</p>
          <div class="social" aria-label="${t('foot.social')}">
            <a href="#" aria-label="Photos">${icon('socialA')}</a><a href="#" aria-label="Microblog">${icon('socialB')}</a>
            <a href="#" aria-label="Community">${icon('socialC')}</a><a href="#" aria-label="Video">${icon('socialD')}</a><a href="#" aria-label="Pins">${icon('socialE')}</a>
          </div>
        </div>
        ${col(t('foot.service'), [[t('foot.contactUs')], [t('foot.faq')], [t('foot.shipping')], [t('foot.returns')], [t('foot.track'), 'account.html#orders']])}
        ${col(t('foot.info'), [[t('foot.aboutUs')], [t('foot.privacy')], [t('foot.terms')], [t('foot.a11y')], [t('foot.ds'), 'design-system.html']])}
        ${col(t('foot.cats'), [[catBySlug('fiction').name, 'books.html?cat=fiction'], [catBySlug('business').name, 'books.html?cat=business'], [catBySlug('psychology').name, 'books.html?cat=psychology'], [t('foot.kids'), 'books.html?cat=children'], [t('foot.allCats'), 'index.html#categories']])}
        <div><h4>${t('foot.contact')}</h4><div class="footer__contact">
          <span>${icon('phone')} <span class="ltr" dir="ltr">+1 (555) 012-3456</span></span><span>${icon('mail')} hello@folio.example</span><span>${icon('pin')} ${t('foot.address')}</span>
        </div></div>
      </div>
      <div class="footer__bottom">
        <span>${t('foot.copy')}</span>
        ${paymentsHTML()}
      </div>
    </div>
  </footer>
  <div class="toast-wrap" aria-live="polite" id="toasts"></div>
  <div class="modal" id="quickview" aria-hidden="true"><div class="modal__backdrop" data-close-modal></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="qv-title"><button class="icon-btn modal__close" data-close-modal aria-label="${t('close')}">${icon('close')}</button><div id="qv-body"></div></div></div>
  <div class="modal" id="auth" aria-hidden="true"><div class="modal__backdrop" data-close-modal></div>
    <div class="modal__dialog modal__dialog--sm" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button class="icon-btn modal__close" data-close-modal aria-label="${t('close')}">${icon('close')}</button>
      <div style="padding:36px 32px 32px">
        <div class="logo__mark" style="margin-bottom:18px">${icon('bookOpen')}</div>
        <h2 id="auth-title" style="font-size:1.75rem">${t('auth.welcome')}</h2>
        <p class="muted small mt-2">${t('auth.desc')}</p>
        <div class="tabs mt-6" role="tablist" style="width:100%"><button class="tab" role="tab" data-auth-tab="login" style="flex:1">${t('auth.login')}</button><button class="tab" role="tab" data-auth-tab="register" style="flex:1">${t('auth.register')}</button></div>
        <form class="stack mt-6" data-auth-form>
          <div class="field" data-register-only hidden><label class="label" for="a-name">${t('auth.name')}</label><input class="input" id="a-name" autocomplete="name" placeholder="${t('auth.namePh')}"></div>
          <div class="field"><label class="label" for="a-email">${t('auth.email')}</label><input class="input" id="a-email" type="email" autocomplete="email" placeholder="you@example.com" required></div>
          <div class="field"><label class="label" for="a-pass">${t('auth.pass')}</label><input class="input" id="a-pass" type="password" autocomplete="current-password" placeholder="••••••••" required minlength="6"></div>
          <button class="btn btn--lg btn--block" type="submit" data-auth-submit>${t('auth.signin')}</button>
          <p class="center small muted">${t('auth.or')}</p>
          <div class="row" style="flex-wrap:nowrap"><button type="button" class="btn btn--outline btn--block">${icon('globe')} ${t('auth.google')}</button><button type="button" class="btn btn--outline btn--block">${icon('lock')} ${t('auth.passkey')}</button></div>
        </form>
      </div>
    </div></div>`;
}

/* ---------- Toast ---------- */
function toast(msg, action) {
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `${icon('check')}<span>${msg}</span>${action ? `<a href="${action.href}">${action.label}</a>` : ''}`;
  $('#toasts').append(el);
  setTimeout(() => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---------- Modals ---------- */
let lastFocus = null;
function openModal(id) {
  const m = document.getElementById(id); lastFocus = document.activeElement;
  m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  setTimeout(() => (m.querySelector('input, [data-close-modal].icon-btn') || m).focus(), 50);
}
function closeModal(m) {
  m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
  lastFocus?.focus();
}
function quickView(id) {
  const b = bookById(id); const a = authorOf(b);
  $('#qv-body').innerHTML = `<div class="quickview">
    <div class="quickview__media">${coverHTML(b)}</div>
    <div class="quickview__body">
      <div class="row">${badgesHTML(b)}<span class="badge badge--soft">${catBySlug(b.cat).name}</span></div>
      <h3 id="qv-title">${esc(b.title)}</h3>
      <p class="muted">${t('qv.by')} <a class="link" href="books.html?author=${b.author}">${esc(a.name)}</a></p>
      ${ratingHTML(b)}
      <div class="row">${priceHTML(b)}${b.old ? `<span class="pdp__save">${t('qv.save', { x: money(b.old - b.price) })}</span>` : ''}</div>
      <p class="quickview__desc">${esc(b.blurb)}</p>
      <div class="row small muted">${icon('bookOpen', 'width="16" height="16"')} ${t('qv.meta', { p: b.pages, l: t('lang.' + b.lang), f: b.formats.map(fmtName).join(LANG === 'fa' ? '، ' : ', ') })}</div>
      <div class="row mt-2">
        <button class="btn btn--accent btn--lg" data-add="${b.id}" style="flex:1">${icon('bag')} ${t('qv.add')}</button>
        <button class="icon-btn" style="border:1.5px solid var(--border);width:54px;height:54px" data-wish="${b.id}" aria-label="${t('card.wishAdd')}">${icon('heart')}</button>
      </div>
      <a class="link" href="book.html?id=${b.id}">${t('qv.details')} ${icon('arrowRight')}</a>
    </div></div>`;
  updateCounts(); openModal('quickview');
}
function openAuth(mode = 'login') {
  const m = $('#auth'); const reg = mode === 'register';
  $$('[data-auth-tab]', m).forEach(x => x.setAttribute('aria-selected', x.dataset.authTab === mode));
  $('[data-register-only]', m).hidden = !reg;
  $('#auth-title').textContent = reg ? t('auth.create') : t('auth.welcome');
  $('[data-auth-submit]', m).textContent = reg ? t('auth.createBtn') : t('auth.signin');
  if (!m.classList.contains('is-open')) openModal('auth');
}

/* ---------- Search suggestions ---------- */
function highlight(text, q) { const i = text.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length)); }
function initSearch(form) {
  const input = $('input', form), panel = $('.search__panel', form); let idx = -1;
  const render = () => {
    const q = input.value.trim(); idx = -1;
    if (q.length < 1) {
      panel.innerHTML = `<div class="search__group">${t('search.trending')}</div>${t('search.trend').split('|').map(q => `<a class="search__item" role="option" href="books.html?q=${encodeURIComponent(q)}">${icon('search', 'width="16" height="16" style="color:var(--gray-500)"')}${esc(q)}</a>`).join('')}`;
      return;
    }
    const ql = q.toLowerCase();
    const books = BOOKS.filter(b => (b.title + ' ' + authorOf(b).name + ' ' + catBySlug(b.cat).name).toLowerCase().includes(ql)).slice(0, 5);
    const cats = CATEGORIES.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 3);
    const auths = Object.entries(AUTHORS).filter(([, a]) => a.name.toLowerCase().includes(ql)).slice(0, 3);
    let html = '';
    if (books.length) html += `<div class="search__group">${t('search.books')}</div>` + books.map(b => `<a class="search__item" role="option" href="book.html?id=${b.id}">${miniCover(b)}<span><strong>${highlight(b.title, q)}</strong><small>${esc(authorOf(b).name)} · ${money(b.price)}</small></span></a>`).join('');
    if (auths.length) html += `<div class="search__group">${t('search.authors')}</div>` + auths.map(([k, a]) => `<a class="search__item" role="option" href="books.html?author=${k}">${avatarHTML(a.name, a.palette[1])}<span><strong>${highlight(a.name, q)}</strong><small>${t('search.authorMeta', { n: a.books, g: a.genre })}</small></span></a>`).join('');
    if (cats.length) html += `<div class="search__group">${t('search.cats')}</div>` + cats.map(c => `<a class="search__item" role="option" href="books.html?cat=${c.slug}"><span class="cat-card__icon" style="width:34px;height:34px;border-radius:10px;--tint:${c.tint};--ink-tint:${c.ink}">${icon(c.icon)}</span><span><strong>${highlight(c.name, q)}</strong><small>${t('search.nBooks', { n: c.count })}</small></span></a>`).join('');
    panel.innerHTML = html || `<div class="search__empty">${t('search.none', { q: esc(q) })}</div>`;
  };
  input.addEventListener('focus', () => { render(); form.classList.add('is-open'); });
  input.addEventListener('input', () => { render(); form.classList.add('is-open'); });
  input.addEventListener('keydown', e => {
    const items = $$('.search__item', panel);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle('is-active', i === idx));
    } else if (e.key === 'Enter' && idx >= 0 && items[idx]) { e.preventDefault(); location.href = items[idx].href; }
    else if (e.key === 'Escape') { form.classList.remove('is-open'); input.blur(); }
  });
  document.addEventListener('click', e => { if (!form.contains(e.target)) form.classList.remove('is-open'); });
}

/* ---------- Carousels ---------- */
function initCarousel(root) {
  const track = $('.carousel__track', root); const prev = $('[data-prev]', root), next = $('[data-next]', root); const bar = $('.carousel__progress span', root);
  const dir = IS_RTL ? -1 : 1;
  const step = () => (track.firstElementChild?.getBoundingClientRect().width || 240) + 24;
  prev?.addEventListener('click', () => track.scrollBy({ left: -dir * step() * 2, behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: dir * step() * 2, behavior: 'smooth' }));
  const update = () => {
    const max = track.scrollWidth - track.clientWidth; const pos = Math.abs(track.scrollLeft);
    if (prev) prev.disabled = pos < 4; if (next) next.disabled = pos > max - 4;
    if (bar) { const vis = track.clientWidth / track.scrollWidth; bar.style.width = vis * 100 + '%'; bar.style.transform = `translateX(${dir * (max ? (pos / max) * (1 / vis - 1) * 100 : 0)}%)`; }
  };
  track.addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
}

/* ---------- Countdown ---------- */
function initCountdown(el) {
  let end = Number(Store.read('offerEnd', 0));
  if (!end || end < Date.now()) { end = Date.now() + ((3 * 24 + 14) * 3600 + 27 * 60) * 1000; Store.write('offerEnd', end); }
  const units = $$('[data-unit]', el);
  const tick = () => {
    let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    units.forEach(u => u.textContent = pad2(v[u.dataset.unit]));
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  if (!('IntersectionObserver' in window)) return $$('.reveal').forEach(el => el.classList.add('is-in'));
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -60px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- Global event delegation ---------- */
function flyToCart(fromEl) {
  const cartBtn = $('[data-cart-btn]'); if (!cartBtn || !fromEl) return;
  cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-add],[data-wish],[data-quick],[data-auth],[data-auth-tab],[data-close-modal],[data-open-drawer],[data-close-drawer],[data-dropdown],[data-toggle-search],[data-set-lang]');
  if (!el) { $$('.dropdown.is-open').forEach(d => { if (!d.contains(e.target)) { d.classList.remove('is-open'); $('[data-dropdown]', d).setAttribute('aria-expanded', 'false'); } }); return; }
  if (el.dataset.add) {
    e.preventDefault(); const b = bookById(el.dataset.add); Store.addToCart(b.id, el.dataset.fmt);
    flyToCart(el); toast(t('toast.added', { t: esc(b.title) }), { href: 'cart.html', label: t('toast.viewCart') });
    if (el.classList.contains('book-card__add')) { el.classList.add('is-added'); el.innerHTML = icon('check'); setTimeout(() => { el.classList.remove('is-added'); el.innerHTML = icon('bag'); }, 1600); }
    document.dispatchEvent(new CustomEvent('store:change'));
  } else if (el.dataset.wish) {
    e.preventDefault(); const on = Store.toggleWish(el.dataset.wish); const b = bookById(el.dataset.wish);
    toast(on ? t('toast.saved', { t: esc(b.title) }) : t('toast.unsaved'), on ? { href: 'wishlist.html', label: t('toast.wishlist') } : null);
    document.dispatchEvent(new CustomEvent('store:change'));
  } else if (el.dataset.quick) { e.preventDefault(); quickView(el.dataset.quick); }
  else if (el.dataset.auth) { e.preventDefault(); closeDrawer(); openAuth(el.dataset.auth); }
  else if (el.dataset.authTab) openAuth(el.dataset.authTab);
  else if (el.hasAttribute('data-close-modal')) closeModal(el.closest('.modal'));
  else if (el.hasAttribute('data-open-drawer')) openDrawer();
  else if (el.hasAttribute('data-close-drawer')) closeDrawer();
  else if (el.hasAttribute('data-dropdown')) { const d = el.closest('.dropdown'); const open = d.classList.toggle('is-open'); el.setAttribute('aria-expanded', open); }
  else if (el.dataset.setLang) setLang(el.dataset.setLang);
  else if (el.hasAttribute('data-toggle-search')) { const h = $('#header'); const open = h.classList.toggle('search-open'); el.setAttribute('aria-expanded', open); if (open) $('#search-mobile').focus(); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  $$('.modal.is-open').forEach(closeModal); closeDrawer();
  $$('.dropdown.is-open').forEach(d => d.classList.remove('is-open'));
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.matches('[data-auth-form]')) { e.preventDefault(); closeModal($('#auth')); toast(t('auth.done')); }
  if (f.matches('[data-newsletter]')) {
    e.preventDefault(); const inp = $('input', f);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) { inp.classList.add('is-invalid'); inp.focus(); return; }
    inp.classList.remove('is-invalid'); f.innerHTML = `<div class="row" style="padding:12px 18px;color:var(--success);font-weight:600">${icon('check', 'width="20" height="20"')} ${t('nl.ok')}</div>`;
  }
});
function openDrawer() { const d = $('#nav-drawer'); d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); $('[data-open-drawer]').setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $('.drawer__head .icon-btn', d).focus(); }
function closeDrawer() { const d = $('#nav-drawer'); if (!d?.classList.contains('is-open')) return; d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); $('[data-open-drawer]').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }

/* ---------- Boot ---------- */
function boot() {
  applyI18n(); renderHeader(); renderFooter();
  $$('[data-search]').forEach(initSearch);
  const header = $('#header'); const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const page = document.body.dataset.page;
  if (window.Pages && Pages[page]) Pages[page]();
  $$('.carousel').forEach(initCarousel);
  $$('[data-countdown]').forEach(initCountdown);
  updateCounts(); initReveal();
}
window.Pages = window.Pages || {};
document.addEventListener('DOMContentLoaded', boot);
