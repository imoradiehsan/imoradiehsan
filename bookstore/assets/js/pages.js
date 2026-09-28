/* Saba & Bahar Publishing — page controllers. Each key matches <body data-page="…">. All copy goes through t() (i18n.js). */

const FORMAT_ICON = { Hardcover: 'book', Paperback: 'bookOpen', eBook: 'tablet', Audiobook: 'headphones' };
const listJoin = arr => arr.join(LANG === 'fa' ? '، ' : ', ');

/* ---------- Shared order math (cart + checkout) ---------- */
const PROMOS = {
  READ10: { calc: sub => sub * 0.10 },
  SUMMER30: { calc: () => Store.cart.reduce((s, l) => { const b = bookById(l.id); return s + (b.tags.includes('offer') ? priceFor(b, l.fmt).price * l.qty * 0.3 : 0); }, 0) },
  FREESHIP: { calc: () => 0, freeShip: true }
};
function orderTotals(shipMethod = 'standard') {
  const sub = Store.cartSubtotal(); const code = Store.read('promo', null); const promo = PROMOS[code];
  const discount = promo ? Math.round(promo.calc(sub) / 1000) * 1000 : 0;
  const physical = Store.cart.some(l => ['Hardcover', 'Paperback'].includes(l.fmt));
  let ship = 0;
  const C = SITE_CONFIG;
  if (physical) ship = shipMethod === 'express' ? C.shippingExpress : (sub - discount >= C.freeShippingThreshold ? 0 : C.shippingStandard);
  if (promo?.freeShip) ship = 0;
  const tax = 0; // books are VAT-exempt in Iran
  return { sub, discount, ship, tax, total: Math.max(0, sub - discount + ship + tax), code, promo, physical };
}
function summaryRows(o) {
  return `<div class="summary__row"><span>${t('sum.subtotal', { n: Store.cartCount() })}</span><strong>${money(o.sub)}</strong></div>
    ${o.discount ? `<div class="summary__row summary__row--discount"><span>${t('sum.discount', { c: o.code })}</span><strong>−${money(o.discount)}</strong></div>` : ''}
    <div class="summary__row"><span>${t('sum.shipping')}</span><strong>${!o.physical ? t('sum.digital') : o.ship ? money(o.ship) : t('sum.free')}</strong></div>
    ${o.tax ? `<div class="summary__row"><span>${t('sum.tax')}</span><strong>${money(o.tax)}</strong></div>` : ''}
    <div class="summary__total"><span>${t('sum.total')}</span><strong>${money(o.total)}</strong></div>`;
}
const emptyState = (ic, title, text, cta) => `<div class="empty"><div class="empty__icon">${icon(ic)}</div><h2 style="font-size:1.6rem">${title}</h2><p>${text}</p>${cta}</div>`;

/* ======================= HOME ======================= */
function initBanner() {
  const root = $('#banner'); const list = SITE_CONFIG.banners || [];
  if (!root || !list.length) { root?.remove(); return; }
  const track = $('#banner-track'), dots = $('#banner-dots');
  track.innerHTML = list.map((b, i) => `<a class="banner__slide" href="${esc(b.link || '#')}" aria-roledescription="slide" aria-label="${fmtNum(i + 1)} / ${fmtNum(list.length)}">
    <picture>${b.mobileImage ? `<source media="(max-width: 760px)" srcset="${esc(b.mobileImage)}">` : ''}
    <img src="${esc(b.image)}" alt="${esc((b.alt && (b.alt[LANG] || b.alt.en)) || '')}" class="${b.mobileImage ? 'has-mobile' : ''}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1920" height="480"></picture></a>`).join('');
  dots.innerHTML = list.length > 1 ? list.map((_, i) => `<button class="banner__dot" data-dot="${i}" aria-label="${t('banner.go', { n: i + 1 })}"></button>`).join('') : '';
  if (list.length < 2) $$('.banner__btn', root).forEach(b => b.remove());
  const dir = IS_RTL ? -1 : 1;
  const index = () => Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
  const go = i => { const n = (i + list.length) % list.length; track.scrollTo({ left: dir * n * track.clientWidth, behavior: 'smooth' }); };
  const mark = () => { const i = index(); $$('.banner__dot', dots).forEach((d, k) => d.setAttribute('aria-current', k === i)); };
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-banner]'), d = e.target.closest('[data-dot]');
    if (b) go(index() + (b.dataset.banner === 'next' ? 1 : -1)); else if (d) go(Number(d.dataset.dot)); else return;
    restart();
  });
  track.addEventListener('scroll', mark, { passive: true }); mark();
  // Autoplay: pauses on hover/focus/touch and for reduced-motion users
  let timer = null; const ms = SITE_CONFIG.bannerInterval;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stop = () => { clearInterval(timer); timer = null; };
  const restart = () => { stop(); if (ms > 0 && !reduce && list.length > 1) timer = setInterval(() => go(index() + 1), ms); };
  ['mouseenter', 'focusin', 'touchstart'].forEach(ev => root.addEventListener(ev, stop, { passive: true }));
  ['mouseleave', 'focusout'].forEach(ev => root.addEventListener(ev, restart));
  addEventListener('resize', () => track.scrollTo({ left: dir * index() * track.clientWidth }));
  restart();
}

Pages.home = () => {
  initBanner();

  // Categories
  $('#cat-grid').innerHTML = CATEGORIES.map((c, i) => `
    <a class="cat-card ${i === 0 ? 'cat-card--feature' : ''}" href="books.html?cat=${c.slug}" style="--tint:${c.tint};--ink-tint:${c.ink}">
      <span class="cat-card__icon">${icon(c.icon)}</span>
      <div><h3>${c.name}</h3><span>${t('search.nBooks', { n: c.count })}</span></div>
      <span class="cat-card__arrow">${icon('arrowRight')}</span>
    </a>`).join('');

  // Featured with category tabs
  const featured = BOOKS.filter(b => b.tags.includes('featured'));
  const tabs = [['all', t('tabs.all')], ...[...new Set(featured.map(b => b.cat))].slice(0, 5).map(s => [s, catBySlug(s).name])];
  $('#featured-tabs').innerHTML = tabs.map(([k, l], i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-ftab="${k}">${l}</button>`).join('');
  const renderFeatured = k => { $('#featured-grid').innerHTML = featured.filter(b => k === 'all' || b.cat === k).slice(0, 8).map(b => bookCard(b)).join(''); updateCounts(); };
  $('#featured-tabs').addEventListener('click', e => { const el = e.target.closest('[data-ftab]'); if (!el) return; $$('[data-ftab]').forEach(x => x.setAttribute('aria-selected', x === el)); renderFeatured(el.dataset.ftab); });
  renderFeatured('all');

  // Best sellers carousel
  const best = BOOKS.filter(b => b.tags.includes('bestseller')).sort((a, b) => b.reviews - a.reviews).slice(0, 10);
  $('#best-track').innerHTML = best.map((b, i) => `
    <article class="rank-card">
      <div class="rank-card__media"><span class="rank-card__num">${fmtNum(i + 1)}</span>${coverHTML(b)}</div>
      <div><h3><a href="book.html?id=${b.id}">${esc(b.title)}</a></h3><p class="book-card__author">${esc(authorOf(b).name)}</p></div>
      ${ratingHTML(b)}
      <div class="rank-card__foot">${priceHTML(b)}<button class="book-card__add" data-add="${b.id}" aria-label="${esc(t('card.addAria', { t: b.title }))}">${icon('bag')}</button></div>
    </article>`).join('');

  // New arrivals
  const fresh = BOOKS.filter(b => b.tags.includes('new')).sort((a, b) => b.id - a.id);
  const [lead, ...rest] = fresh;
  $('#arrival-hero').innerHTML = `${coverHTML(lead)}<div>
    <span class="badge badge--new">${t('badge.newWeek')}</span>
    <h3>${esc(lead.title)}</h3><p class="book-card__author">${t('home.byAuthor', { a: esc(authorOf(lead).name) })}</p>
    <p>${esc(lead.blurb)}</p>
    <div class="row">${priceHTML(lead)}</div>
    <div class="row mt-4"><button class="btn btn--accent" data-add="${lead.id}">${icon('bag')} ${t('home.buyNow')}</button><a class="btn btn--ghost" href="book.html?id=${lead.id}">${t('home.preview')}</a></div></div>`;
  $('#arrival-list').innerHTML = rest.slice(0, 4).map(b => `
    <article class="arrival-row">
      ${miniCover(b).replace('mini-cover', 'mini-cover" style="width:72px')}
      <div><span class="badge badge--new" style="height:20px;font-size:10px">${t('badge.new')}</span>
        <h4 style="margin-top:6px"><a href="book.html?id=${b.id}">${esc(b.title)}</a></h4>
        <div class="meta"><span>${esc(authorOf(b).name)}</span>·<span>${catBySlug(b.cat).name}</span>·${starsHTML(b.rating)}</div></div>
      <div class="arrival-row__buy">${priceHTML(b)}<button class="btn btn--sm" data-add="${b.id}">${icon('plus')} ${t('home.add')}</button></div>
    </article>`).join('');

  // Offer banner covers
  $('#offer-books').innerHTML = [3, 5, 11].map(id => coverHTML(bookById(id))).join('');

  // Personalised recommendations
  const recos = {
    purchases: { because: 1, ids: [10, 23, 8, 19], match: [98, 96, 93, 91] },
    interests: { because: 4, ids: [13, 6, 15, 20], match: [97, 95, 92, 90] },
    categories: { because: 2, ids: [11, 22, 3, 12], match: [96, 94, 91, 88] }
  };
  const renderReco = k => {
    const r = recos[k]; const src = bookById(r.because);
    $('#reco-because').innerHTML = `${miniCover(src)}<span>${t('reco.' + k)} <strong>${esc(src.title)}</strong></span>`;
    $('#reco-grid').innerHTML = r.ids.map((id, i) => bookCard(bookById(id), { match: r.match[i] })).join('');
    updateCounts();
  };
  $('#reco-signals').addEventListener('click', e => { const el = e.target.closest('[data-reco]'); if (!el) return; $$('[data-reco]').forEach(x => x.setAttribute('aria-pressed', x === el)); renderReco(el.dataset.reco); });
  renderReco('purchases');

  // Authors
  $('#author-grid').innerHTML = ['elena-marsh', 'james-calder', 'priya-raman', 'samuel-okafor'].map(k => {
    const a = AUTHORS[k];
    return `<article class="author-card">
      <div class="author-photo">${authorPortrait(k)}</div>
      <h3>${a.name}</h3><span class="genre">${a.genre}</span>
      <p>${a.bio}</p>
      <div class="author-card__stats"><div><strong>${fmtNum(a.books)}</strong><span>${t('home.booksLbl')}</span></div><div><strong>${a.followers}</strong><span>${t('home.readers')}</span></div></div>
      <a class="btn btn--outline btn--sm mt-4" href="books.html?author=${k}">${t('home.viewBooks')}</a>
    </article>`;
  }).join('');

  // Testimonials
  $('#testi-grid').innerHTML = TESTIMONIALS.map(x => `
    <figure class="testi" style="margin:0">
      ${icon('quote', 'class="testi__quote"')}
      ${starsHTML(x.rating)}
      <blockquote>${LANG === 'fa' ? '«' + esc(x.text) + '»' : '“' + esc(x.text) + '”'}</blockquote>
      <figcaption class="testi__who">${avatarHTML(x.name, x.color)}<div><strong>${x.name}</strong><span>${icon('verified')} ${t('home.verified', { r: x.role })}</span></div></figcaption>
    </figure>`).join('');

  // Blog
  $('#blog-grid').innerHTML = POSTS.map((p, i) => `
    <article class="post">
      <div class="post__media">${postArt(p, i)}<span class="badge badge--cream">${p.cat}</span></div>
      <div class="post__body">
        <div class="post__meta"><span>${icon('calendar')} ${fmtDate(p.date)}</span><span>${icon('clock')} ${t('home.readMin', { n: p.mins })}</span></div>
        <h3><a href="#">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p>
        <span class="link mt-2">${t('home.readArticle')} ${icon('arrowRight')}</span>
      </div>
    </article>`).join('');
};

/* ======================= LISTING ======================= */
Pages.books = () => {
  const PER_PAGE = 9;
  const COLLECTIONS = { bestseller: [t('list.bestT'), t('list.bestS')], new: [t('list.newT'), t('list.newS')], offer: [t('list.offerT'), t('list.offerS')] };
  const PRICE_STEP = 10000;
  const priceMax = Math.ceil(Math.max(...BOOKS.map(b => b.price)) / 50000) * 50000;
  const S = {
    q: params.get('q') || '', collection: params.get('collection') || '',
    cats: params.get('cat') ? [params.get('cat')] : [], authors: params.get('author') ? [params.get('author')] : [],
    min: 0, max: priceMax, rating: 0, langs: [], formats: [], sort: 'featured', page: 1, view: Store.read('view', 'grid')
  };

  // Page heading
  const oneCat = S.cats.length === 1 && catBySlug(S.cats[0]);
  const [title, sub] = COLLECTIONS[S.collection] || (oneCat ? [oneCat.name, t('list.catS', { n: oneCat.count, c: oneCat.name })] : S.q ? [t('list.qT', { q: S.q }), t('list.qS')] : [t('list.allT'), t('list.allS')]);
  $('#listing-title').textContent = title; $('#listing-sub').textContent = sub; $('#crumb-current').textContent = title;
  document.title = title + t('title.suffix');
  if (S.collection === 'offer') $('#promo-strip').hidden = false;

  // Build filter UI
  const countBy = fn => BOOKS.reduce((m, b) => { [].concat(fn(b)).forEach(k => m[k] = (m[k] || 0) + 1); return m; }, {});
  const catCounts = countBy(b => b.cat), authCounts = countBy(b => b.author), langCounts = countBy(b => b.lang);
  const checkList = (name, items, sel) => items.map(([val, label, n]) => `<label class="check"><input type="checkbox" name="${name}" value="${val}" ${sel.includes(val) ? 'checked' : ''}>${label}<span class="count">${fmtNum(n)}</span></label>`).join('');
  $('#f-cat').innerHTML = checkList('cat', CATEGORIES.map(c => [c.slug, c.name, catCounts[c.slug] || 0]), S.cats);
  $('#f-author').innerHTML = checkList('author', Object.entries(AUTHORS).map(([k, a]) => [k, a.name, authCounts[k] || 0]), S.authors);
  $('#f-lang').innerHTML = checkList('lang', Object.entries(langCounts).map(([l, n]) => [l, t('lang.' + l), n]), S.langs);
  $('#f-rating').innerHTML = [4.5, 4, 3.5, 0].map(r => `<label class="check"><input type="radio" name="rating" value="${r}" ${S.rating === r ? 'checked' : ''}><span class="rating-opt">${r ? starsHTML(r) + ` <span class="small">${t('list.andUp')}</span>` : t('list.any')}</span></label>`).join('');
  $('#f-format').innerHTML = ['Hardcover', 'Paperback', 'eBook', 'Audiobook'].map(f => `<button type="button" class="chip" data-format="${f}" aria-pressed="false">${icon(FORMAT_ICON[f])}${fmtName(f)}</button>`).join('');
  const rMin = $('#r-min'), rMax = $('#r-max');
  rMin.max = rMax.max = priceMax; rMin.step = rMax.step = PRICE_STEP; rMax.value = priceMax;

  $('#f-author-search').addEventListener('input', e => { const q = e.target.value.toLowerCase(); $$('#f-author .check').forEach(l => l.hidden = !l.textContent.toLowerCase().includes(q)); });
  $$('.acc__head').forEach(h => h.addEventListener('click', () => { const a = h.closest('.acc'); const open = a.dataset.open !== 'false'; a.dataset.open = !open; h.setAttribute('aria-expanded', !open); }));

  const sync = () => {
    S.cats = $$('input[name=cat]:checked').map(i => i.value);
    S.authors = $$('input[name=author]:checked').map(i => i.value);
    S.langs = $$('input[name=lang]:checked').map(i => i.value);
    S.rating = Number($('input[name=rating]:checked')?.value || 0);
    S.formats = $$('[data-format][aria-pressed=true]').map(c => c.dataset.format);
    let lo = Number(rMin.value), hi = Number(rMax.value); if (lo > hi - 2 * PRICE_STEP) [lo, hi] = [Math.min(lo, hi - 2 * PRICE_STEP), Math.max(hi, lo + 2 * PRICE_STEP)];
    S.min = lo; S.max = hi; S.page = 1; render();
  };
  $('#filters').addEventListener('change', sync);
  $('#filters').addEventListener('input', e => { if (e.target.type === 'range') sync(); });
  $('#f-format').addEventListener('click', e => { const c = e.target.closest('[data-format]'); if (!c) return; c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); sync(); });
  $('#sort').addEventListener('change', e => { S.sort = e.target.value; S.page = 1; render(); });
  $$('[data-view]').forEach(b => b.addEventListener('click', () => { S.view = b.dataset.view; Store.write('view', S.view); render(); }));
  $('#clear-filters').addEventListener('click', () => {
    $$('#filters input[type=checkbox]').forEach(i => i.checked = false); $$('[data-format]').forEach(c => c.setAttribute('aria-pressed', 'false'));
    $('input[name=rating][value="0"]').checked = true; rMin.value = 0; rMax.value = priceMax; S.q = ''; S.collection = ''; sync();
  });

  // Mobile filter drawer
  const openF = open => { $('#filters').classList.toggle('is-open', open); $('#scrim').classList.toggle('is-open', open); document.body.style.overflow = open ? 'hidden' : ''; };
  $('#filters-btn').addEventListener('click', () => openF(true));
  $$('[data-close-filters]').forEach(b => b.addEventListener('click', () => openF(false)));

  function results() {
    const q = S.q.toLowerCase();
    const list = BOOKS.filter(b =>
      (!q || (b.title + ' ' + authorOf(b).name + ' ' + catBySlug(b.cat).name).toLowerCase().includes(q)) &&
      (!S.collection || b.tags.includes(S.collection)) &&
      (!S.cats.length || S.cats.includes(b.cat)) && (!S.authors.length || S.authors.includes(b.author)) &&
      (!S.langs.length || S.langs.includes(b.lang)) && (!S.formats.length || S.formats.some(f => b.formats.includes(f))) &&
      b.rating >= S.rating && b.price >= S.min && b.price <= S.max);
    const sorters = { featured: (a, b) => (b.tags.length - a.tags.length) || b.rating - a.rating, bestselling: (a, b) => b.reviews - a.reviews, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, newest: (a, b) => b.year - a.year || b.id - a.id };
    return list.sort(sorters[S.sort]);
  }

  function render() {
    const list = results(); const pages = Math.max(1, Math.ceil(list.length / PER_PAGE)); S.page = Math.min(S.page, pages);
    const slice = list.slice((S.page - 1) * PER_PAGE, S.page * PER_PAGE);
    $('#result-count').innerHTML = t('list.showing', { a: list.length ? (S.page - 1) * PER_PAGE + 1 : 0, b: (S.page - 1) * PER_PAGE + slice.length, n: list.length });
    const grid = $('#book-grid'); grid.classList.toggle('is-list', S.view === 'list');
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === S.view));
    grid.innerHTML = slice.length ? slice.map(b => bookCard(b)).join('') : `<div style="grid-column:1/-1">${emptyState('search', t('list.emptyT'), t('list.emptyP'), `<button class="btn" onclick="document.getElementById('clear-filters').click()">${t('list.clear')}</button>`)}</div>`;

    // Active filter chips
    const chips = [];
    if (S.q) chips.push(['q', '', LANG === 'fa' ? `«${S.q}»` : `“${S.q}”`]);
    if (S.collection) chips.push(['collection', '', COLLECTIONS[S.collection][0]]);
    S.cats.forEach(c => chips.push(['cat', c, catBySlug(c).name])); S.authors.forEach(a => chips.push(['author', a, AUTHORS[a].name]));
    S.langs.forEach(l => chips.push(['lang', l, t('lang.' + l)])); S.formats.forEach(f => chips.push(['format', f, fmtName(f)]));
    if (S.rating) chips.push(['rating', '', t('list.starsUp', { r: fmtRating(S.rating) })]);
    if (S.min > 0 || S.max < priceMax) chips.push(['price', '', `${money(S.min)} – ${money(S.max)}`]);
    $('#active-filters').innerHTML = chips.map(([k, v, l]) => `<button class="chip" data-rm="${k}" data-val="${esc(v)}">${esc(l)} ${icon('close')}</button>`).join('') + (chips.length > 1 ? `<button class="link" data-rm="all">${t('list.clearAll')}</button>` : '');
    $('#filter-badge').textContent = chips.length ? `(${fmtNum(chips.length)})` : '';

    // Range UI (the slider is always laid out left-to-right)
    $('#r-fill').style.left = (S.min / priceMax * 100) + '%'; $('#r-fill').style.right = (100 - S.max / priceMax * 100) + '%';
    $('#r-vals').innerHTML = `<span>${money(S.min)}</span><span>${money(S.max)}</span>`;

    // Pagination
    const pg = $('#pagination');
    pg.innerHTML = pages < 2 ? '' : `<button data-pg="${S.page - 1}" ${S.page === 1 ? 'disabled' : ''} aria-label="${t('list.prevPage')}">${icon('chevLeft')}</button>` +
      Array.from({ length: pages }, (_, i) => `<button data-pg="${i + 1}" ${i + 1 === S.page ? 'aria-current="page"' : ''}>${fmtNum(i + 1)}</button>`).join('') +
      `<button data-pg="${S.page + 1}" ${S.page === pages ? 'disabled' : ''} aria-label="${t('list.nextPage')}">${icon('chevRight')}</button>`;
    updateCounts();
  }
  $('#pagination').addEventListener('click', e => { const b = e.target.closest('[data-pg]'); if (!b) return; S.page = Number(b.dataset.pg); render(); $('#listing-top').scrollIntoView({ behavior: 'smooth' }); });
  $('#active-filters').addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return; const { rm, val } = b.dataset;
    if (rm === 'all') return $('#clear-filters').click();
    if (rm === 'q') S.q = ''; else if (rm === 'collection') S.collection = '';
    else if (rm === 'format') $(`[data-format="${val}"]`).setAttribute('aria-pressed', 'false');
    else if (rm === 'rating') $('input[name=rating][value="0"]').checked = true;
    else if (rm === 'price') { rMin.value = 0; rMax.value = priceMax; }
    else { const i = $(`input[name=${rm}][value="${val}"]`); if (i) i.checked = false; }
    sync();
  });
  render();
};

/* ======================= PRODUCT DETAIL ======================= */
Pages.book = () => {
  const b = bookById(params.get('id')) || BOOKS[0]; const a = authorOf(b); const cat = catBySlug(b.cat);
  let fmt = b.formats[0], qty = 1;
  document.title = `${b.title} — ${a.name}${t('title.suffix')}`;
  $('#crumbs').innerHTML = `<a href="index.html">${t('crumb.home')}</a>${icon('chevRight')}<a href="books.html">${t('crumb.books')}</a>${icon('chevRight')}<a href="books.html?cat=${cat.slug}">${cat.name}</a>${icon('chevRight')}<span aria-current="page">${esc(b.title)}</span>`;

  // Gallery: front, back, first page, contents
  const views = [
    [t('pdp.front'), coverHTML(b)],
    [t('pdp.back'), `<div class="page-art back-art" style="--c-bg:${b.pal[0]};color:${b.pal[1]}"><h5 style="color:${b.pal[2]}">${t('pdp.quote')}</h5><p>${esc(b.blurb)}</p><p style="margin-top:auto;opacity:.7">${esc(b.pub)} · ${money(b.price)}</p></div>`],
    [t('pdp.first'), `<div class="page-art"><h5>${t('pdp.chapter')}</h5><p class="dropcap">${esc(b.blurb)} ${t('pdp.sample')}</p><p>${t('pdp.sample2')}</p></div>`],
    [t('pdp.contents'), `<div class="page-art"><h5>${t('pdp.contents')}</h5>${t('pdp.toc').split('|').map((c, i) => `<p style="display:flex;justify-content:space-between;text-align:start"><span>${i ? fmtNum(i) + '. ' : ''}${c}</span><span>${fmtNum(1 + i * 47)}</span></p>`).join('')}</div>`]
  ];
  $('#gallery-main').innerHTML = `<div class="badges">${badgesHTML(b)}</div><div id="gallery-view" style="width:100%;max-width:340px">${views[0][1]}</div><button class="icon-btn gallery__zoom" aria-label="${t('pdp.zoom')}" data-quick="${b.id}">${icon('zoom')}</button>`;
  $('#gallery-thumbs').innerHTML = views.map(([l, h], i) => `<button class="gallery__thumb" role="tab" aria-selected="${i === 0}" aria-label="${l}" data-view-i="${i}">${h}</button>`).join('');
  $('#gallery-thumbs').addEventListener('click', e => { const el = e.target.closest('[data-view-i]'); if (!el) return; $$('[data-view-i]').forEach(x => x.setAttribute('aria-selected', x === el)); $('#gallery-view').innerHTML = views[el.dataset.viewI][1]; });

  // Info column
  const renderPrice = () => {
    const p = priceFor(b, fmt);
    $('#pdp-price').innerHTML = `<span class="price"><span class="price__now">${money(p.price)}</span>${p.old ? `<span class="price__old">${money(p.old)}</span>` : ''}</span>${p.old ? `<span class="badge badge--sale">${(-discountPct(b)).toLocaleString(LOC)}%</span><span class="pdp__save">${t('qv.save', { x: money(p.old - p.price) })}</span>` : ''}`;
    $('#sticky-price').innerHTML = `<span class="price"><span class="price__now">${money(p.price)}</span></span>`;
    $('#pdp-stock').textContent = ['eBook', 'Audiobook'].includes(fmt) ? t('pdp.digital', { n: FORMAT_NOTE[fmt] }) : t('pdp.instock');
  };
  $('#pdp-info').innerHTML = `
    <div class="pdp__cat"><span class="badge badge--soft">${cat.name}</span>${b.tags.includes('bestseller') ? `<span class="badge badge--gold">${t('badge.no1')}</span>` : ''}</div>
    <h1 class="pdp__title">${esc(b.title)}</h1>
    <p class="pdp__author">${t('qv.by')} <a href="#tab-author" data-goto-tab="author">${esc(a.name)}</a> · ${fmtNum(b.year).replace(/[,٬]/g, '')}</p>
    <div class="pdp__rating">${starsHTML(b.rating)}<strong style="color:var(--text)">${fmtRating(b.rating)}</strong><a href="#tab-reviews" data-goto-tab="reviews" class="link">${t('pdp.reviews', { n: b.reviews })}</a><span>·</span><span>${t('pdp.readers', { n: b.reviews * 7 })}</span></div>
    <div class="pdp__price" id="pdp-price"></div>
    <p class="pdp__desc">${esc(b.blurb)}</p>
    <div><p class="label" id="fmt-label" style="margin-bottom:10px">${t('pdp.format')}</p>
      <div class="format-opts" role="radiogroup" aria-labelledby="fmt-label">${b.formats.map((f, i) => `<button class="format-opt" role="radio" aria-checked="${i === 0}" data-fmt-opt="${f}"><strong>${fmtName(f)}</strong><span>${money(priceFor(b, f).price)}</span></button>`).join('')}</div></div>
    <span class="pdp__stock" id="pdp-stock"></span>
    <div class="pdp__buy">
      <div class="qty" aria-label="${t('pdp.qty')}"><button data-q="-1" aria-label="${t('pdp.dec')}">${icon('minus')}</button><input id="qty" type="number" min="1" max="99" value="1" aria-label="${t('pdp.qty')}"><button data-q="1" aria-label="${t('pdp.inc')}">${icon('plus')}</button></div>
      <button class="btn btn--lg" id="add-btn">${icon('bag')} ${t('pdp.add')}</button>
      <button class="btn btn--accent btn--lg" id="buy-btn">${icon('bolt')} ${t('pdp.buy')}</button>
      <button class="icon-btn" style="border:1.5px solid var(--border);width:54px;height:54px" data-wish="${b.id}" aria-label="${t('card.wishAdd')}">${icon('heart')}</button>
    </div>
    <div class="pdp__assure">
      <div>${icon('truck')} ${t('pdp.a1', { amt: money(SITE_CONFIG.freeShippingThreshold) })}</div><div>${icon('refresh')} ${t('pdp.a2')}</div>
      <div>${icon('shield')} ${t('pdp.a3')}</div><div>${icon('gift')} ${t('pdp.a4')}</div>
    </div>`;
  renderPrice();
  $('#pdp-info').addEventListener('click', e => {
    const f = e.target.closest('[data-fmt-opt]'); if (f) { fmt = f.dataset.fmtOpt; $$('[data-fmt-opt]').forEach(x => x.setAttribute('aria-checked', x === f)); renderPrice(); }
    const q = e.target.closest('[data-q]'); if (q) { qty = Math.min(99, Math.max(1, qty + Number(q.dataset.q))); $('#qty').value = qty; }
    const g = e.target.closest('[data-goto-tab]'); if (g) { e.preventDefault(); selectTab(g.dataset.gotoTab); $('#pdp-tabs').scrollIntoView({ behavior: 'smooth' }); }
  });
  $('#qty').addEventListener('change', e => { qty = Math.min(99, Math.max(1, Number(e.target.value) || 1)); e.target.value = qty; });
  const add = () => { Store.addToCart(b.id, fmt, qty); flyToCart($('#add-btn')); toast(t('pdp.addedQty', { q: qty, t: esc(b.title), f: fmtName(fmt) }), { href: 'cart.html', label: t('toast.viewCart') }); };
  $('#add-btn').addEventListener('click', add); $('#sticky-add').addEventListener('click', add);
  $('#buy-btn').addEventListener('click', () => { Store.addToCart(b.id, fmt, qty); location.href = 'checkout.html'; });
  const io = new IntersectionObserver(([en]) => $('#sticky-buy').classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0));
  io.observe($('#add-btn'));
  $('#sticky-title').textContent = b.title;

  // Tabs
  const dist = [0.72, 0.18, 0.06, 0.03, 0.01];
  const isbn = '978-1-' + String(40000 + b.id * 373).padStart(5, '0') + '-' + (b.id % 9) + '-' + (b.id * 7 % 10);
  const panels = {
    details: `<div class="pdp-grid-2"><div><h3 style="margin-bottom:14px">${t('pdp.about')}</h3><p class="pdp__desc">${esc(b.blurb)}</p><p class="pdp__desc mt-4">${t('pdp.praise', { t: esc(b.title) })}</p></div>
      <table class="spec-table"><tbody>${[[t('spec.author'), a.name], [t('spec.pub'), b.pub], [t('spec.year'), fmtNum(b.year).replace(/[,٬]/g, '')], [t('spec.pages'), fmtNum(b.pages)], [t('spec.lang'), t('lang.' + b.lang)], [t('spec.formats'), listJoin(b.formats.map(fmtName))], [t('spec.isbn'), `<span dir="ltr">${isbn}</span>`], [t('spec.dim'), t('spec.dimV')]].map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table></div>`,
    author: `<div class="author-box"><div class="author-photo">${authorPortrait(b.author)}</div><div><h3>${a.name}</h3><span class="book-card__cat">${t('pdp.authorMeta', { g: a.genre, b: a.books, f: a.followers })}</span><p>${a.bio} ${t('pdp.authorMore')}</p><div class="row mt-4"><a class="btn btn--sm" href="books.html?author=${b.author}">${t('pdp.allBy', { a: shortName(a.name) })}</a><button class="btn btn--sm btn--outline">${icon('plus')} ${t('pdp.follow')}</button></div></div></div>`,
    reviews: `<div class="review-summary"><div class="review-summary__score"><strong>${fmtRating(b.rating)}</strong>${starsHTML(b.rating)}<p>${t('pdp.basedOn', { n: b.reviews })}</p></div>
      <div class="bars">${dist.map((d, i) => `<div class="bar"><span>${t('pdp.stars', { n: 5 - i })}</span><div class="bar__track"><div class="bar__fill" style="width:${d * 100}%"></div></div><span>${Math.round(d * 100).toLocaleString(LOC)}%</span></div>`).join('')}</div></div>
      <div class="row between"><h3>${t('pdp.top')}</h3><button class="btn btn--outline btn--sm">${t('pdp.write')}</button></div>
      ${REVIEWS.map(r => `<article class="review"><div class="review__head">${avatarHTML(r.name, r.color)}<div><strong>${r.name}</strong><span>${icon('verified', 'width="12" height="12" style="display:inline;color:var(--success);vertical-align:-1px"')} ${t('pdp.verified', { d: fmtDate(r.date) })}</span></div></div>${starsHTML(r.rating)}<h4>${r.title}</h4><p>${r.text}</p><div class="review__helpful">${t('pdp.helpful')} <button class="chip" style="min-height:30px">${icon('thumb')} ${fmtNum(r.helpful)}</button></div></article>`).join('')}`
  };
  const selectTab = k => { $$('[data-ptab]').forEach(x => x.setAttribute('aria-selected', x.dataset.ptab === k)); $('#tab-panel').innerHTML = panels[k]; $('#tab-panel').setAttribute('aria-labelledby', 'ptab-' + k); };
  $('#pdp-tabs-list').addEventListener('click', e => { const el = e.target.closest('[data-ptab]'); if (el) selectTab(el.dataset.ptab); });
  selectTab('details');

  // Related
  const related = BOOKS.filter(x => x.id !== b.id && (x.cat === b.cat || x.author === b.author)).concat(BOOKS.filter(x => x.id !== b.id && x.cat !== b.cat && x.author !== b.author)).slice(0, 10);
  $('#related-track').innerHTML = related.map(x => bookCard(x)).join('');
};

/* ======================= CART ======================= */
Pages.cart = () => {
  const render = () => {
    const cart = Store.cart;
    if (!cart.length) {
      $('#cart-root').innerHTML = emptyState('bag', t('cart.emptyT'), t('cart.emptyP'), `<a class="btn btn--lg" href="books.html">${t('cart.browse')}</a>`);
      return;
    }
    const o = orderTotals(); const FREE = SITE_CONFIG.freeShippingThreshold; const need = Math.max(0, FREE - (o.sub - o.discount));
    $('#cart-root').innerHTML = `<div class="cart-layout">
      <section aria-label="${t('cart.items')}">
        <div class="cart-list">
          <div class="cart-list__head"><span>${t('cart.product')}</span><span>${t('cart.qty')}</span><span style="text-align:end">${t('cart.total')}</span></div>
          ${cart.map((l, i) => { const b = bookById(l.id); const p = priceFor(b, l.fmt); return `
            <div class="cart-item">
              <div class="cart-item__prod">
                <a class="cart-item__media" href="book.html?id=${b.id}">${coverHTML(b)}</a>
                <div><h3><a href="book.html?id=${b.id}">${esc(b.title)}</a></h3>
                  <p class="cart-item__meta">${esc(authorOf(b).name)}</p>
                  <div class="cart-item__fmt"><span class="badge badge--soft">${icon(FORMAT_ICON[l.fmt], 'width="12" height="12"')} ${fmtName(l.fmt)}</span><span class="small muted">${FORMAT_NOTE[l.fmt]}</span></div>
                  <div class="cart-item__actions"><button class="save" data-save="${i}">${icon('heart')} ${t('cart.save')}</button><button data-remove="${i}">${icon('trash')} ${t('cart.remove')}</button></div>
                </div>
              </div>
              <div class="qty qty--sm" aria-label="${esc(t('cart.qtyFor', { t: b.title }))}"><button data-inc="${i}" data-d="-1" aria-label="${t('cart.dec')}">${icon('minus')}</button><input value="${l.qty}" data-qty="${i}" type="number" min="1" max="99" aria-label="${t('cart.qty')}"><button data-inc="${i}" data-d="1" aria-label="${t('cart.inc')}">${icon('plus')}</button></div>
              <div class="cart-item__total">${money(p.price * l.qty)}<small>${t('cart.each', { p: money(p.price) })}</small></div>
            </div>`; }).join('')}
        </div>
        <div class="row between mt-6"><a class="link" href="books.html">${icon('chevLeft')} ${t('cart.continue')}</a><button class="btn btn--ghost btn--sm" data-clear>${icon('trash')} ${t('cart.clear')}</button></div>
      </section>
      <aside class="summary" aria-label="${t('cart.summary')}">
        <h2>${t('cart.summary')}</h2>
        ${o.physical ? `<div class="ship-progress">${need ? t('cart.away', { x: money(need) }) : `${icon('check', 'width="16" height="16" style="display:inline;color:var(--success);vertical-align:-3px"')} ${t('cart.unlocked')}`}<div class="ship-progress__bar"><span style="width:${Math.min(100, (o.sub - o.discount) / FREE * 100)}%"></span></div></div>` : ''}
        ${summaryRows(o)}
        <form class="promo" data-promo><label for="promo" class="sr-only">${t('cart.promoPh')}</label><input id="promo" class="input" placeholder="${t('cart.promoPh')}" value="${o.code || ''}" autocomplete="off" dir="ltr"><button class="btn btn--outline" type="submit">${o.code ? t('cart.removeCode') : t('cart.apply')}</button></form>
        <p class="promo-msg ${o.code ? 'ok' : ''}" id="promo-msg">${o.promo ? `✓ ${t('promo.' + o.code)}` : t('cart.try')}</p>
        <a class="btn btn--accent btn--lg btn--block mt-4" href="checkout.html">${icon('lock')} ${t('cart.checkout')}</a>
        <p class="summary__secure">${icon('shield')} ${t('cart.secure')}</p>
        ${paymentsHTML(['visa', 'mc', 'amex', 'paypal', 'apple'])}
      </aside></div>`;
  };
  $('#cart-root').addEventListener('click', e => {
    const c = [...Store.cart]; const el = e.target.closest('button'); if (!el) return;
    if (el.dataset.inc) { const l = c[el.dataset.inc]; l.qty = Math.min(99, Math.max(1, l.qty + Number(el.dataset.d))); Store.setCart(c); }
    else if (el.dataset.remove) { const [l] = c.splice(el.dataset.remove, 1); Store.setCart(c); toast(t('cart.removed', { t: esc(bookById(l.id).title) })); }
    else if (el.dataset.save) { const [l] = c.splice(el.dataset.save, 1); Store.setCart(c); if (!Store.wish.includes(l.id)) Store.toggleWish(l.id); toast(t('cart.savedLater'), { href: 'wishlist.html', label: t('toast.wishlist') }); }
    else if (el.hasAttribute('data-clear')) Store.setCart([]);
    else return;
    render();
  });
  $('#cart-root').addEventListener('change', e => { const i = e.target.dataset.qty; if (i === undefined) return; const c = [...Store.cart]; c[i].qty = Math.min(99, Math.max(1, Number(e.target.value) || 1)); Store.setCart(c); render(); });
  $('#cart-root').addEventListener('submit', e => {
    if (!e.target.matches('[data-promo]')) return; e.preventDefault();
    if (Store.read('promo', null)) { Store.write('promo', null); return render(); }
    const code = $('#promo').value.trim().toUpperCase();
    if (PROMOS[code]) { Store.write('promo', code); render(); toast(t('cart.codeOk', { c: code })); }
    else { $('#promo-msg').className = 'promo-msg err'; $('#promo-msg').textContent = t('cart.badCode'); $('#promo').classList.add('is-invalid'); }
  });
  document.addEventListener('store:change', render);
  render();
  $('#upsell-track').innerHTML = BOOKS.filter(b => !Store.cart.some(l => l.id === b.id)).sort((a, b) => b.rating - a.rating).slice(0, 8).map(b => bookCard(b)).join('');
};

/* ======================= CHECKOUT ======================= */
Pages.checkout = () => {
  let ship = 'standard';
  if (!Store.cart.length) {
    $('#checkout-root').innerHTML = emptyState('bag', t('co.emptyT'), t('co.emptyP'), `<a class="btn btn--lg" href="books.html">${t('cart.browse')}</a>`);
    return;
  }
  const renderSummary = () => {
    const o = orderTotals(ship);
    $('#co-summary').innerHTML = `<h2>${t('co.yourOrder')}</h2><div class="mini-items">${Store.cart.map(l => { const b = bookById(l.id); return `<div class="mini-item"><div class="mini-cover">${coverHTML(b)}<span class="qty-dot">${fmtNum(l.qty)}</span></div><div><strong>${esc(b.title)}</strong><span>${fmtName(l.fmt)}</span></div><strong>${money(priceFor(b, l.fmt).price * l.qty)}</strong></div>`; }).join('')}</div>${summaryRows(o)}<p class="summary__secure">${icon('lock')} ${t('co.secure')}</p>`;
    return o;
  };
  const goto = n => {
    $$('.stepper__item').forEach((s, i) => { s.classList.toggle('is-current', i + 1 === n); s.classList.toggle('is-done', i + 1 < n); $('.stepper__dot', s).innerHTML = i + 1 < n ? icon('check') : fmtNum(i + 1); });
    $$('.checkout__panel').forEach((p, i) => p.classList.toggle('is-active', i + 1 === n));
    if (n === 3) renderReview();
    $('#checkout-root').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const validate = panel => {
    let ok = true;
    $$('[required]', panel).forEach(inp => {
      if (inp.offsetParent === null) return; // hidden fields
      const valid = inp.checkValidity() && inp.value.trim() !== '';
      inp.closest('.field')?.classList.toggle('has-error', !valid); if (!valid && ok) { inp.focus(); ok = false; }
    });
    return ok;
  };
  if (!orderTotals().physical) { $('#ship-physical').hidden = true; $('#digital-note').hidden = false; $$('#ship-physical [required]').forEach(i => i.required = false); }
  $$('input[name=ship]').forEach(r => r.addEventListener('change', () => { ship = r.value; renderSummary(); }));
  $$('input[name=pay]').forEach(r => r.addEventListener('change', () => $('#card-fields').classList.toggle('is-open', r.value === 'card' && r.checked)));
  $('#card-num').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); });
  $('#card-exp').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2); e.target.value = v; });
  $('[data-next="1"]').addEventListener('click', () => validate($('#panel-1')) && goto(2));
  $('[data-next="2"]').addEventListener('click', () => { if ($('input[name=pay]:checked').value !== 'card' || validate($('#card-fields'))) goto(3); });
  $$('[data-back]').forEach(b => b.addEventListener('click', () => goto(Number(b.dataset.back))));
  $('#checkout-root').addEventListener('input', e => e.target.closest('.field')?.classList.remove('has-error'));

  function renderReview() {
    const v = id => esc($('#' + id)?.value || '');
    const pay = $('input[name=pay]:checked').value;
    const payLabel = { card: t('co.cardEnd', { n: `<span dir="ltr">${v('card-num').slice(-4) || '4242'}</span>` }), paypal: t('co.paypal'), wallet: t('co.wallet') }[pay];
    $('#review-blocks').innerHTML = `
      <div class="review-block"><div><h4>${t('co.contact')}</h4>${v('co-email')}<br><span dir="ltr">${v('co-phone')}</span></div><button class="link" data-edit="1">${t('co.edit')}</button></div>
      ${orderTotals().physical ? `<div class="review-block"><div><h4>${t('co.shipTo')}</h4>${v('co-first')} ${v('co-last')}<br>${v('co-address')}<br>${v('co-city')}${LANG === 'fa' ? '،' : ','} ${v('co-zip')} · ${esc($('#co-country').selectedOptions[0].text)}<br><span class="muted">${ship === 'express' ? t('co.express') : t('co.standard')}</span></div><button class="link" data-edit="1">${t('co.edit')}</button></div>` : ''}
      <div class="review-block"><div><h4>${t('co.payment')}</h4>${payLabel}</div><button class="link" data-edit="2">${t('co.edit')}</button></div>`;
    $$('[data-edit]').forEach(b => b.addEventListener('click', () => goto(Number(b.dataset.edit))));
  }
  $('#place-order').addEventListener('click', () => {
    if (!$('#terms').checked) { $('#terms').closest('.check').style.color = 'var(--danger)'; $('#terms').focus(); return; }
    const o = orderTotals(ship); const no = 'FC-' + Math.floor(100000 + Math.random() * 899999);
    const digital = Store.cart.some(l => ['eBook', 'Audiobook'].includes(l.fmt));
    Store.setCart([]); Store.write('promo', null);
    $('.stepper').hidden = true; $('#co-summary').hidden = true;
    $('#checkout-main').innerHTML = `<div class="success card"><div class="success__icon">${icon('check')}</div><h2>${t('co.thanks')}</h2>
      <span class="order-no" dir="ltr">${no}</span><p>${t('co.receipt', { x: money(o.total), e: esc($('#co-email').value) })} ${digital ? t('co.digitalReady') : ''} ${o.physical ? t('co.tracking') : ''}</p>
      <div class="row" style="justify-content:center">${digital ? `<a class="btn btn--accent" href="account.html#orders">${icon('bookOpen')} ${t('co.library')}</a>` : ''}<a class="btn btn--outline" href="index.html">${t('co.continue')}</a></div></div>`;
  });
  renderSummary(); goto(1);
};

/* ======================= ACCOUNT ======================= */
Pages.account = () => {
  const ORDERS = [
    { no: 'FC-482913', date: '2026-09-24', total: 1755000, status: 'processing', ids: [1, 6, 11] },
    { no: 'FC-471208', date: '2026-09-08', total: 1050000, status: 'transit', ids: [2, 20] },
    { no: 'FC-455630', date: '2026-08-17', total: 2165000, status: 'delivered', ids: [5, 14, 3, 9] },
    { no: 'FC-439011', date: '2026-07-29', total: 540000, status: 'delivered', ids: [13] }
  ];
  const payCard = (bg, chip, logo, num, exp, actions) => `<div><div class="pay-card" style="background:${bg}" dir="ltr"><div class="row between"><span class="pay-card__chip" ${chip}></span><span class="pay" style="height:26px">${logo}</span></div><div class="pay-card__num">•••• •••• •••• ${num}</div><div class="pay-card__row"><div><span>${t('acc.holder')}</span>${t('acc.holderV')}</div><div><span>${t('acc.expires')}</span>${exp}</div></div></div><div class="tile__actions">${actions}</div></div>`;
  const panels = {
    profile: () => `<div class="acc-panel__head"><h2>${t('acc.hello')}</h2><span class="badge badge--gold">${icon('sparkle', 'width="12" height="12"')} ${t('acc.gold')}</span></div>
      <div class="stat-row">
        <div class="stat"><span>${t('acc.orders')}</span><strong>${fmtNum(ORDERS.length)}</strong></div>
        <div class="stat"><span>${t('acc.read')}</span><strong>${fmtNum(27)}</strong></div>
        <div class="stat"><span>${t('acc.points')}</span><strong>${fmtNum(1240)}</strong></div>
        <div class="stat stat--dark"><span>${t('acc.goal')}</span><strong>${fmtNum(27)} / ${fmtNum(40)}</strong><div class="goal"><span style="width:67%"></span></div></div>
      </div>
      <div class="card card--pad"><h3 class="card__title">${t('acc.profileInfo')}</h3>
        <form class="form-grid" data-save-form>
          <div class="field"><label class="label" for="p-first">${t('acc.first')}</label><input class="input" id="p-first" value="${t('acc.firstV')}" autocomplete="given-name"></div>
          <div class="field"><label class="label" for="p-last">${t('acc.last')}</label><input class="input" id="p-last" value="${t('acc.lastV')}" autocomplete="family-name"></div>
          <div class="field"><label class="label" for="p-email">${t('acc.email')}</label><input class="input" id="p-email" type="email" value="jane.reader@example.com" autocomplete="email"></div>
          <div class="field"><label class="label" for="p-phone">${t('acc.phone')}</label><input class="input" id="p-phone" type="tel" value="+1 555 010 2233" autocomplete="tel"></div>
          <div class="field"><label class="label" for="p-bday">${t('acc.bday')}</label><input class="input" id="p-bday" type="date" value="1994-05-12"></div>
          <div class="field"><label class="label" for="p-lang">${t('acc.plang')}</label><select class="select" id="p-lang">${Object.entries(LANGS).map(([k, l]) => `<option value="${k}" ${k === LANG ? 'selected' : ''}>${l.label}</option>`).join('')}</select></div>
          <div class="span-2 row"><button class="btn" type="submit">${t('acc.saveBtn')}</button><button class="btn btn--ghost" type="button">${t('acc.pass')}</button></div>
        </form></div>`,
    orders: () => `<div class="acc-panel__head"><h2>${t('acc.history')}</h2><select class="select" style="width:auto;min-height:42px" aria-label="${t('acc.filterOrders')}"><option>${t('acc.last6')}</option><option>${fmtNum(2026).replace(/[,٬]/g, '')}</option><option>${fmtNum(2025).replace(/[,٬]/g, '')}</option></select></div>
      ${ORDERS.map(o => `<article class="order"><div class="order__head"><div><span>${t('acc.order')}</span><strong dir="ltr">${o.no}</strong></div><div><span>${t('acc.placed')}</span><strong>${fmtDate(o.date)}</strong></div><div><span>${t('acc.total')}</span><strong>${money(o.total)}</strong></div><span class="status status--${o.status}">${t('status.' + o.status)}</span><a class="btn btn--outline btn--sm" href="#">${t('acc.details')}</a></div>
        <div class="order__body"><div class="order__covers">${o.ids.map(id => miniCover(bookById(id))).join('')}</div><div class="small muted" style="flex:1;min-width:200px">${listJoin(o.ids.map(id => esc(bookById(id).title)))}</div>
        ${o.status === 'delivered' ? `<button class="btn btn--sm">${t('acc.again')}</button>` : `<button class="btn btn--sm btn--outline">${icon('truck')} ${t('acc.track')}</button>`}</div></article>`).join('')}`,
    wishlist: () => `<div class="acc-panel__head"><h2>${t('acc.wishlist')}</h2><a class="link" href="wishlist.html">${t('acc.openWish')} ${icon('arrowRight')}</a></div>
      ${Store.wish.length ? `<div class="grid grid--books">${Store.wish.map(id => bookCard(bookById(id))).join('')}</div>` : emptyState('heart', t('acc.noSavedT'), t('acc.noSavedP'), `<a class="btn" href="books.html">${t('acc.discover')}</a>`)}`,
    addresses: () => `<div class="acc-panel__head"><h2>${t('acc.addresses')}</h2></div>
      <div class="tile-grid">
        <div class="tile"><span class="badge badge--soft">${t('badge.default')}</span><strong>${t('acc.home')}</strong>${t('acc.addr1')}<div class="tile__actions"><button>${t('acc.edit')}</button><button>${t('acc.remove')}</button></div></div>
        <div class="tile"><strong>${t('acc.office')}</strong>${t('acc.addr2')}<div class="tile__actions"><button>${t('acc.edit')}</button><button>${t('acc.setDefault')}</button><button>${t('acc.remove')}</button></div></div>
        <button class="tile tile--add">${icon('plus')} ${t('acc.addAddr')}</button>
      </div>`,
    payments: () => `<div class="acc-panel__head"><h2>${t('acc.payments')}</h2></div>
      <div class="tile-grid">
        ${payCard('linear-gradient(135deg,var(--primary-700),var(--primary-950))', '', PAY_ICONS.visa, '4242', '08/29', `<span class="badge badge--soft">${t('badge.default')}</span><button>${t('acc.edit')}</button><button>${t('acc.remove')}</button>`)}
        ${payCard('linear-gradient(135deg,var(--secondary-500),var(--secondary-800))', 'style="background:linear-gradient(135deg,#fff,#ccc)"', PAY_ICONS.mc, '5510', '02/28', `<button>${t('acc.setDefault')}</button><button>${t('acc.remove')}</button>`)}
        <button class="tile tile--add">${icon('card')} ${t('acc.addPay')}</button>
      </div>
      <div class="card card--pad"><h3 class="card__title">${t('acc.wallets')}</h3><div class="toggle"><div><strong>${t('co.paypal')}</strong><span>jane.reader@example.com</span></div><button class="btn btn--sm btn--outline">${t('acc.disconnect')}</button></div><div class="toggle"><div><strong>${t('co.wallet')}</strong><span>${t('acc.walletsOn')}</span></div><label class="switch"><input type="checkbox" checked aria-label="${t('acc.enableW')}"></label></div></div>`,
    preferences: () => {
      const fav = Store.read('favCats', ['fiction', 'psychology', 'science']);
      return `<div class="acc-panel__head"><h2>${t('acc.prefs')}</h2><span class="muted small">${icon('ai', 'width="14" height="14" style="display:inline;vertical-align:-2px"')} ${t('acc.powers')}</span></div>
      <div class="card card--pad stack" style="gap:28px">
        <div class="pref-group"><h3>${t('acc.favCats')}</h3><p>${t('acc.favCatsP')}</p><div class="chip-set" data-pref="favCats">${CATEGORIES.map(c => `<button class="chip" aria-pressed="${fav.includes(c.slug)}" data-val="${c.slug}">${icon(c.icon)} ${c.name}</button>`).join('')}</div></div>
        <div class="pref-group"><h3>${t('acc.formats')}</h3><div class="chip-set">${['Hardcover', 'Paperback', 'eBook', 'Audiobook'].map((f, i) => `<button class="chip" aria-pressed="${i !== 1}">${fmtName(f)}</button>`).join('')}</div></div>
        <div class="pref-group"><h3>${t('acc.langs')}</h3><div class="chip-set">${['English', 'Spanish', 'French', 'German'].map((f, i) => `<button class="chip" aria-pressed="${i === 0}">${t('lang.' + f)}</button>`).join('')}</div></div>
        <div class="pref-group"><h3>${t('acc.goalT')}</h3><div class="row"><div class="qty"><button aria-label="${t('cart.dec')}" data-goal="-1">${icon('minus')}</button><input id="goal" value="40" aria-label="${t('acc.perYear')}" type="number"><button aria-label="${t('cart.inc')}" data-goal="1">${icon('plus')}</button></div><span class="muted small">${t('acc.goalUnit')}</span></div></div>
        <div class="pref-group"><h3>${t('acc.notif')}</h3><div>
          ${[['acc.n1', 'acc.n1d', true], ['acc.n2', 'acc.n2d', true], ['acc.n3', 'acc.n3d', false]].map(([a, b, on]) => `<div class="toggle"><div><strong>${t(a)}</strong><span>${t(b)}</span></div><label class="switch"><input type="checkbox" ${on ? 'checked' : ''} aria-label="${t(a)}"></label></div>`).join('')}
        </div></div>
      </div>`;
    }
  };
  const show = key => {
    if (!panels[key]) key = 'profile';
    $$('[data-acc]').forEach(b => b.setAttribute('aria-selected', b.dataset.acc === key));
    $('#acc-panel').innerHTML = panels[key](); $('#acc-panel').classList.add('is-active');
    history.replaceState(null, '', location.pathname + location.search + '#' + key); updateCounts();
  };
  $('#acc-nav').addEventListener('click', e => { const b = e.target.closest('[data-acc]'); if (b) show(b.dataset.acc); });
  $('#acc-panel').addEventListener('click', e => {
    const c = e.target.closest('.chip-set .chip');
    if (c) { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); const set = c.closest('[data-pref]'); if (set) Store.write(set.dataset.pref, $$('.chip[aria-pressed=true]', set).map(x => x.dataset.val)); }
    const g = e.target.closest('[data-goal]'); if (g) $('#goal').value = Math.max(1, Number($('#goal').value) + Number(g.dataset.goal));
  });
  $('#acc-panel').addEventListener('submit', e => {
    e.preventDefault(); const l = $('#p-lang')?.value;
    if (l && l !== LANG) return setLang(l);
    toast(t('acc.saved'));
  });
  $('#acc-wish-n').textContent = fmtNum(Store.wish.length);
  document.addEventListener('store:change', () => { $('#acc-wish-n').textContent = fmtNum(Store.wish.length); if (location.hash === '#wishlist') show('wishlist'); });
  addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || 'profile');
};

/* ======================= WISHLIST ======================= */
Pages.wishlist = () => {
  const render = () => {
    const ids = Store.wish;
    $('#wish-count').textContent = ids.length === 1 ? t('wish.count1') : t('wish.count', { n: ids.length });
    $('#wish-all').disabled = !ids.length;
    $('#wish-root').innerHTML = ids.length ? `<div class="wish-grid">${ids.map(id => {
      const b = bookById(id); const fmt = b.formats[0];
      return `<article class="wish-item">
        <a class="wish-item__media" href="book.html?id=${b.id}">${coverHTML(b)}</a>
        <div class="wish-item__body">
          <span class="book-card__cat">${catBySlug(b.cat).name}</span>
          <h3 class="book-card__title"><a href="book.html?id=${b.id}">${esc(b.title)}</a></h3>
          <span class="book-card__author">${esc(authorOf(b).name)}</span>
          ${ratingHTML(b)}
          <div class="row" style="gap:10px;margin-top:4px">${priceHTML(b)}${b.old ? `<span class="price-drop">${icon('trendDown')} ${t('wish.drop', { p: discountPct(b) })}</span>` : ''}</div>
          <span class="small muted">${fmtName(fmt)} · ${['eBook', 'Audiobook'].includes(fmt) ? t('wish.instant') : t('wish.stock')}</span>
          <div class="wish-item__actions">
            <button class="btn btn--sm" data-move="${b.id}">${icon('bag')} ${t('wish.move')}</button>
            <button class="btn btn--sm btn--danger" data-unwish="${b.id}" aria-label="${esc(t('wish.removeAria', { t: b.title }))}">${icon('trash')} ${t('wish.remove')}</button>
          </div>
        </div></article>`; }).join('')}</div>`
      : emptyState('heart', t('wish.emptyT'), t('wish.emptyP'), `<a class="btn btn--lg" href="books.html">${t('acc.discover')}</a>`);
  };
  $('#wish-root').addEventListener('click', e => {
    const m = e.target.closest('[data-move]'), r = e.target.closest('[data-unwish]');
    if (m) { const id = Number(m.dataset.move); Store.addToCart(id); Store.setWish(Store.wish.filter(x => x !== id)); flyToCart(m); toast(t('wish.moved', { t: esc(bookById(id).title) }), { href: 'cart.html', label: t('toast.viewCart') }); render(); }
    if (r) { const id = Number(r.dataset.unwish); Store.setWish(Store.wish.filter(x => x !== id)); toast(t('toast.unsaved')); render(); }
  });
  $('#wish-all').addEventListener('click', () => { const n = Store.wish.length; Store.wish.forEach(id => Store.addToCart(id)); Store.setWish([]); flyToCart($('#wish-all')); toast(t('wish.movedAll', { n }), { href: 'cart.html', label: t('toast.viewCart') }); render(); });
  $('#wish-share').addEventListener('click', () => { try { navigator.clipboard?.writeText(location.href); } catch { } toast(t('wish.copied')); });
  document.addEventListener('store:change', render);
  render();
  $('#wish-reco').innerHTML = BOOKS.filter(b => !Store.wish.includes(b.id)).sort((a, b) => b.reviews - a.reviews).slice(0, 8).map(b => bookCard(b)).join('');
};

/* ======================= DESIGN SYSTEM ======================= */
Pages.ds = () => {
  const sw = (name, v) => `<div class="swatch"><div class="swatch__color" style="background:var(${v})"></div><div class="swatch__meta"><strong>${name}</strong><code dir="ltr">${getComputedStyle(document.documentElement).getPropertyValue(v).trim()}</code></div></div>`;
  const renderSwatches = () => $('#ds-colors').innerHTML = [
    [t('ds.gPrimary'), [['Primary 950', '--primary-950'], ['Primary 900', '--primary-900'], ['Primary 800', '--primary-800'], ['Primary 700 ★', '--primary-700'], ['Primary 600', '--primary-600'], ['Primary 100', '--primary-100'], ['Primary 50', '--primary-50']]],
    [t('ds.gSecondary'), [['Secondary 800', '--secondary-800'], ['Secondary 700', '--secondary-700'], ['Secondary 500 ★', '--secondary-500'], ['Secondary 100', '--secondary-100'], ['Secondary 50', '--secondary-50']]],
    [t('ds.gAccent'), [['Accent 300', '--gold-300'], ['Accent 400', '--gold-400'], ['Accent 500 ★', '--gold-500'], ['Accent 600', '--gold-600'], ['Sale', '--orange-500']]],
    [t('ds.gSurface'), [['Background ★', '--background'], ['Section tint', '--bg-alt'], ['Sand 100', '--sand-100'], ['Sand 200', '--sand-200'], ['Sand 300', '--sand-300']]],
    [t('ds.gNeutral'), [['Text ★', '--ink'], ['Gray 700', '--gray-700'], ['Gray 600', '--gray-600'], ['Gray 500', '--gray-500'], ['Gray 200', '--gray-200'], ['Success', '--success'], ['Danger', '--danger']]]
  ].map(([g, list]) => `<div class="swatch-group"><h3>${g}</h3><div class="swatches">${list.map(([n, v]) => sw(n, v)).join('')}</div></div>`).join('');
  renderSwatches(); document.addEventListener('theme:change', renderSwatches);
  $('#ds-cards').innerHTML = [2, 5, 7].map(id => bookCard(bookById(id))).join('');
  $('#ds-covers').innerHTML = BOOKS.slice(0, 10).map(b => `<div style="width:92px">${coverHTML(b)}</div>`).join('');
  $('#ds-modal').addEventListener('click', () => quickView(1));
  $('#ds-toast').addEventListener('click', () => toast(t('ds.toast'), { href: '#', label: t('ds.action') }));
  $$('#ds-chips .chip').forEach(c => c.addEventListener('click', () => c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true')));
  $$('#ds-tabs .tab').forEach(x => x.addEventListener('click', () => $$('#ds-tabs .tab').forEach(y => y.setAttribute('aria-selected', y === x))));
};
