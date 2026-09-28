/* Folio & Co. — page controllers. Each key matches <body data-page="…">. */

/* ---------- Shared order math (cart + checkout) ---------- */
const PROMOS = {
  READ10: { label: '10% off your order', calc: sub => sub * 0.10 },
  SUMMER30: { label: '30% off Summer Festival titles', calc: () => Store.cart.reduce((s, l) => { const b = bookById(l.id); return s + (b.tags.includes('offer') ? priceFor(b, l.fmt).price * l.qty * 0.3 : 0); }, 0) },
  FREESHIP: { label: 'Free express shipping', calc: () => 0, freeShip: true }
};
function orderTotals(shipMethod = 'standard') {
  const sub = Store.cartSubtotal(); const code = Store.read('promo', null); const promo = PROMOS[code];
  const discount = promo ? +promo.calc(sub).toFixed(2) : 0;
  const physical = Store.cart.some(l => ['Hardcover', 'Paperback'].includes(l.fmt));
  let ship = 0;
  if (physical) ship = shipMethod === 'express' ? 9.99 : (sub - discount >= 35 ? 0 : 4.99);
  if (promo?.freeShip) ship = 0;
  const tax = +((sub - discount) * 0.08).toFixed(2);
  return { sub, discount, ship, tax, total: Math.max(0, sub - discount + ship + tax), code, promo, physical };
}
function summaryRows(t) {
  return `<div class="summary__row"><span>Subtotal (${Store.cartCount()} items)</span><strong>${money(t.sub)}</strong></div>
    ${t.discount ? `<div class="summary__row summary__row--discount"><span>Discount (${t.code})</span><strong>−${money(t.discount)}</strong></div>` : ''}
    <div class="summary__row"><span>Shipping</span><strong>${!t.physical ? 'Digital — free' : t.ship ? money(t.ship) : 'Free'}</strong></div>
    <div class="summary__row"><span>Estimated tax</span><strong>${money(t.tax)}</strong></div>
    <div class="summary__total"><span>Total</span><strong>${money(t.total)}</strong></div>`;
}
const emptyState = (ic, title, text, cta) => `<div class="empty"><div class="empty__icon">${icon(ic)}</div><h2 style="font-size:1.6rem">${title}</h2><p>${text}</p>${cta}</div>`;

/* ======================= HOME ======================= */
Pages.home = () => {
  $('#hero-stack').innerHTML = [5, 6, 1].map(id => coverHTML(bookById(id))).join('');
  $('#float-a').innerHTML = `${miniCover(bookById(2))}<div><small>Bestseller of the week</small><strong>Atomic Rituals</strong><div class="rating">${starsHTML(4.9)}</div></div>`;

  // Categories
  $('#cat-grid').innerHTML = CATEGORIES.map((c, i) => `
    <a class="cat-card ${i === 0 ? 'cat-card--feature' : ''}" href="books.html?cat=${c.slug}" style="--tint:${c.tint};--ink-tint:${c.ink}">
      <span class="cat-card__icon">${icon(c.icon)}</span>
      <div><h3>${c.name}</h3><span>${fmtNum(c.count)} books</span></div>
      <span class="cat-card__arrow">${icon('arrowRight')}</span>
    </a>`).join('');

  // Featured with category tabs
  const featured = BOOKS.filter(b => b.tags.includes('featured'));
  const tabs = [['all', 'All'], ...[...new Set(featured.map(b => b.cat))].slice(0, 5).map(s => [s, catBySlug(s).name])];
  $('#featured-tabs').innerHTML = tabs.map(([k, l], i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-ftab="${k}">${l}</button>`).join('');
  const renderFeatured = k => { $('#featured-grid').innerHTML = featured.filter(b => k === 'all' || b.cat === k).slice(0, 8).map(b => bookCard(b)).join(''); updateCounts(); };
  $('#featured-tabs').addEventListener('click', e => { const t = e.target.closest('[data-ftab]'); if (!t) return; $$('[data-ftab]').forEach(x => x.setAttribute('aria-selected', x === t)); renderFeatured(t.dataset.ftab); });
  renderFeatured('all');

  // Best sellers carousel
  const best = BOOKS.filter(b => b.tags.includes('bestseller')).sort((a, b) => b.reviews - a.reviews).slice(0, 10);
  $('#best-track').innerHTML = best.map((b, i) => `
    <article class="rank-card">
      <div class="rank-card__media"><span class="rank-card__num">${i + 1}</span>${coverHTML(b)}</div>
      <div><h3><a href="book.html?id=${b.id}">${esc(b.title)}</a></h3><p class="book-card__author">${esc(authorOf(b).name)}</p></div>
      ${ratingHTML(b)}
      <div class="rank-card__foot">${priceHTML(b)}<button class="book-card__add" data-add="${b.id}" aria-label="Add ${esc(b.title)} to cart">${icon('bag')}</button></div>
    </article>`).join('');

  // New arrivals
  const fresh = BOOKS.filter(b => b.tags.includes('new')).sort((a, b) => b.id - a.id);
  const [lead, ...rest] = fresh;
  $('#arrival-hero').innerHTML = `${coverHTML(lead)}<div>
    <span class="badge badge--new">New this week</span>
    <h3>${esc(lead.title)}</h3><p class="book-card__author">by ${esc(authorOf(lead).name)}</p>
    <p>${esc(lead.blurb)}</p>
    <div class="row">${priceHTML(lead)}</div>
    <div class="row mt-4"><button class="btn btn--accent" data-add="${lead.id}">${icon('bag')} Buy now</button><a class="btn btn--ghost" href="book.html?id=${lead.id}">Preview</a></div></div>`;
  $('#arrival-list').innerHTML = rest.slice(0, 4).map(b => `
    <article class="arrival-row">
      ${miniCover(b).replace('mini-cover', 'mini-cover" style="width:72px')}
      <div><span class="badge badge--new" style="height:20px;font-size:10px">New</span>
        <h4 style="margin-top:6px"><a href="book.html?id=${b.id}">${esc(b.title)}</a></h4>
        <div class="meta"><span>${esc(authorOf(b).name)}</span>·<span>${catBySlug(b.cat).name}</span>·${starsHTML(b.rating)}</div></div>
      <div class="arrival-row__buy">${priceHTML(b)}<button class="btn btn--sm" data-add="${b.id}">${icon('plus')} Add</button></div>
    </article>`).join('');

  // Offer banner covers
  $('#offer-books').innerHTML = [3, 5, 11].map(id => coverHTML(bookById(id))).join('');

  // Personalised recommendations
  const recos = {
    purchases: { because: 1, text: 'Because you bought', ids: [10, 23, 8, 19], match: [98, 96, 93, 91] },
    interests: { because: 4, text: 'Because you love psychology & science —', ids: [13, 6, 15, 20], match: [97, 95, 92, 90] },
    categories: { because: 2, text: 'From your favourite categories, like', ids: [11, 22, 3, 12], match: [96, 94, 91, 88] }
  };
  const renderReco = k => {
    const r = recos[k]; const src = bookById(r.because);
    $('#reco-because').innerHTML = `${miniCover(src)}<span>${r.text} <strong>${esc(src.title)}</strong></span>`;
    $('#reco-grid').innerHTML = r.ids.map((id, i) => bookCard(bookById(id), { match: r.match[i] })).join('');
    updateCounts();
  };
  $('#reco-signals').addEventListener('click', e => { const t = e.target.closest('[data-reco]'); if (!t) return; $$('[data-reco]').forEach(x => x.setAttribute('aria-pressed', x === t)); renderReco(t.dataset.reco); });
  renderReco('purchases');

  // Authors
  $('#author-grid').innerHTML = ['elena-marsh', 'james-calder', 'priya-raman', 'samuel-okafor'].map(k => {
    const a = AUTHORS[k];
    return `<article class="author-card">
      <div class="author-photo">${authorPortrait(k)}</div>
      <h3>${a.name}</h3><span class="genre">${a.genre}</span>
      <p>${a.bio}</p>
      <div class="author-card__stats"><div><strong>${a.books}</strong><span>Books</span></div><div><strong>${a.followers}</strong><span>Readers</span></div></div>
      <a class="btn btn--outline btn--sm mt-4" href="books.html?author=${k}">View books</a>
    </article>`;
  }).join('');

  // Testimonials
  $('#testi-grid').innerHTML = TESTIMONIALS.map(t => `
    <figure class="testi" style="margin:0">
      ${icon('quote', 'class="testi__quote"')}
      ${starsHTML(t.rating)}
      <blockquote>“${esc(t.text)}”</blockquote>
      <figcaption class="testi__who">${avatarHTML(t.name, t.color)}<div><strong>${t.name}</strong><span>${icon('verified')} Verified buyer · ${t.role}</span></div></figcaption>
    </figure>`).join('');

  // Blog
  $('#blog-grid').innerHTML = POSTS.map((p, i) => `
    <article class="post">
      <div class="post__media">${postArt(p, i)}<span class="badge badge--cream">${p.cat}</span></div>
      <div class="post__body">
        <div class="post__meta"><span>${icon('calendar')} ${p.date}</span><span>${icon('clock')} ${p.mins} min read</span></div>
        <h3><a href="#">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p>
        <span class="link mt-2">Read article ${icon('arrowRight')}</span>
      </div>
    </article>`).join('');
};

/* ======================= LISTING ======================= */
Pages.books = () => {
  const PER_PAGE = 9;
  const COLLECTIONS = { bestseller: ['Best Sellers', 'The books everyone is talking about, updated daily.'], new: ['New Arrivals', 'Fresh from the press — the newest additions to our shelves.'], offer: ['Special Offers', 'Summer Reading Festival — up to 30% off selected titles.'] };
  const priceMax = Math.ceil(Math.max(...BOOKS.map(b => b.price)));
  const S = {
    q: params.get('q') || '', collection: params.get('collection') || '',
    cats: params.get('cat') ? [params.get('cat')] : [], authors: params.get('author') ? [params.get('author')] : [],
    min: 0, max: priceMax, rating: 0, langs: [], formats: [], sort: 'featured', page: 1, view: Store.read('view', 'grid')
  };

  // Page heading
  const [title, sub] = COLLECTIONS[S.collection] || (S.cats.length === 1 ? [catBySlug(S.cats[0]).name, `Explore ${fmtNum(catBySlug(S.cats[0]).count)} titles in ${catBySlug(S.cats[0]).name}.`] : S.q ? [`Results for “${S.q}”`, 'Refine with filters to find exactly what you want.'] : ['All Books', 'Browse our full catalogue of physical books, eBooks and audiobooks.']);
  $('#listing-title').textContent = title; $('#listing-sub').textContent = sub; $('#crumb-current').textContent = title;
  document.title = `${title} — Folio & Co.`;
  if (S.collection === 'offer') $('#promo-strip').hidden = false;

  // Build filter UI
  const countBy = fn => BOOKS.reduce((m, b) => { [].concat(fn(b)).forEach(k => m[k] = (m[k] || 0) + 1); return m; }, {});
  const catCounts = countBy(b => b.cat), authCounts = countBy(b => b.author), langCounts = countBy(b => b.lang);
  const checkList = (name, items, sel) => items.map(([val, label, n]) => `<label class="check"><input type="checkbox" name="${name}" value="${val}" ${sel.includes(val) ? 'checked' : ''}>${label}<span class="count">${n}</span></label>`).join('');
  $('#f-cat').innerHTML = checkList('cat', CATEGORIES.map(c => [c.slug, c.name, catCounts[c.slug] || 0]), S.cats);
  $('#f-author').innerHTML = checkList('author', Object.entries(AUTHORS).map(([k, a]) => [k, a.name, authCounts[k] || 0]), S.authors);
  $('#f-lang').innerHTML = checkList('lang', Object.entries(langCounts).map(([l, n]) => [l, l, n]), S.langs);
  $('#f-rating').innerHTML = [4.5, 4, 3.5, 0].map(r => `<label class="check"><input type="radio" name="rating" value="${r}" ${S.rating === r ? 'checked' : ''}><span class="rating-opt">${r ? starsHTML(r) + ` <span class="small">&amp; up</span>` : 'Any rating'}</span></label>`).join('');
  $('#f-format').innerHTML = ['Hardcover', 'Paperback', 'eBook', 'Audiobook'].map(f => `<button type="button" class="chip" data-format="${f}" aria-pressed="false">${icon({ Hardcover: 'book', Paperback: 'bookOpen', eBook: 'tablet', Audiobook: 'headphones' }[f])}${f}</button>`).join('');
  const rMin = $('#r-min'), rMax = $('#r-max');
  rMin.max = rMax.max = priceMax; rMax.value = priceMax;

  $('#f-author-search').addEventListener('input', e => { const q = e.target.value.toLowerCase(); $$('#f-author .check').forEach(l => l.hidden = !l.textContent.toLowerCase().includes(q)); });
  $$('.acc__head').forEach(h => h.addEventListener('click', () => { const a = h.closest('.acc'); const open = a.dataset.open !== 'false'; a.dataset.open = !open; h.setAttribute('aria-expanded', !open); }));

  const sync = () => {
    S.cats = $$('input[name=cat]:checked').map(i => i.value);
    S.authors = $$('input[name=author]:checked').map(i => i.value);
    S.langs = $$('input[name=lang]:checked').map(i => i.value);
    S.rating = Number($('input[name=rating]:checked')?.value || 0);
    S.formats = $$('[data-format][aria-pressed=true]').map(c => c.dataset.format);
    let lo = Number(rMin.value), hi = Number(rMax.value); if (lo > hi - 2) [lo, hi] = [Math.min(lo, hi - 2), Math.max(hi, lo + 2)];
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
    let list = BOOKS.filter(b =>
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
    $('#result-count').innerHTML = `Showing <strong>${list.length ? (S.page - 1) * PER_PAGE + 1 : 0}–${(S.page - 1) * PER_PAGE + slice.length}</strong> of <strong>${list.length}</strong> books`;
    const grid = $('#book-grid'); grid.classList.toggle('is-list', S.view === 'list');
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === S.view));
    grid.innerHTML = slice.length ? slice.map(b => bookCard(b)).join('') : `<div style="grid-column:1/-1">${emptyState('search', 'No books match those filters', 'Try removing a filter or widening the price range — there is a great read in here somewhere.', '<button class="btn" onclick="document.getElementById(\'clear-filters\').click()">Clear all filters</button>')}</div>`;

    // Active filter chips
    const chips = [];
    if (S.q) chips.push(['q', '', `“${S.q}”`]);
    if (S.collection) chips.push(['collection', '', COLLECTIONS[S.collection][0]]);
    S.cats.forEach(c => chips.push(['cat', c, catBySlug(c).name])); S.authors.forEach(a => chips.push(['author', a, AUTHORS[a].name]));
    S.langs.forEach(l => chips.push(['lang', l, l])); S.formats.forEach(f => chips.push(['format', f, f]));
    if (S.rating) chips.push(['rating', '', `${S.rating}★ & up`]);
    if (S.min > 0 || S.max < priceMax) chips.push(['price', '', `${money(S.min)} – ${money(S.max)}`]);
    $('#active-filters').innerHTML = chips.map(([k, v, l]) => `<button class="chip" data-rm="${k}" data-val="${esc(v)}">${esc(l)} ${icon('close')}</button>`).join('') + (chips.length > 1 ? `<button class="link" data-rm="all">Clear all</button>` : '');
    $('#filter-badge').textContent = chips.length ? `(${chips.length})` : '';

    // Range UI
    $('#r-fill').style.left = (S.min / priceMax * 100) + '%'; $('#r-fill').style.right = (100 - S.max / priceMax * 100) + '%';
    $('#r-vals').innerHTML = `<span>${money(S.min)}</span><span>${money(S.max)}</span>`;

    // Pagination
    const pg = $('#pagination');
    pg.innerHTML = pages < 2 ? '' : `<button data-pg="${S.page - 1}" ${S.page === 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chevLeft')}</button>` +
      Array.from({ length: pages }, (_, i) => `<button data-pg="${i + 1}" ${i + 1 === S.page ? 'aria-current="page"' : ''}>${i + 1}</button>`).join('') +
      `<button data-pg="${S.page + 1}" ${S.page === pages ? 'disabled' : ''} aria-label="Next page">${icon('chevRight')}</button>`;
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
  document.title = `${b.title} by ${a.name} — Folio & Co.`;
  $('#crumbs').innerHTML = `<a href="index.html">Home</a>${icon('chevRight')}<a href="books.html">Books</a>${icon('chevRight')}<a href="books.html?cat=${cat.slug}">${cat.name}</a>${icon('chevRight')}<span aria-current="page">${esc(b.title)}</span>`;

  // Gallery: front, back, first page, contents
  const views = [
    ['Front cover', coverHTML(b)],
    ['Back cover', `<div class="page-art back-art" style="--c-bg:${b.pal[0]};color:${b.pal[1]}"><h5 style="color:${b.pal[2]}">“Unforgettable.”</h5><p>${esc(b.blurb)}</p><p style="margin-top:auto;opacity:.7">${esc(b.pub)} · ${money(b.price)}</p></div>`],
    ['First page', `<div class="page-art"><h5>Chapter One</h5><p class="dropcap">${esc(b.blurb)} The morning it began, the light came in sideways, the way it only does at the edge of the sea, and every object in the room seemed to be waiting for someone to name it.</p><p>She had not meant to stay. Nobody ever does.</p></div>`],
    ['Contents', `<div class="page-art"><h5>Contents</h5>${['Prologue', 'The First Map', 'Tidelines', 'A Borrowed Compass', 'North of Nowhere', 'The Last Page'].map((c, i) => `<p style="display:flex;justify-content:space-between;text-align:left"><span>${i ? i + '. ' : ''}${c}</span><span>${1 + i * 47}</span></p>`).join('')}</div>`]
  ];
  $('#gallery-main').innerHTML = `<div class="badges">${badgesHTML(b)}</div><div id="gallery-view" style="width:100%;max-width:340px">${views[0][1]}</div><button class="icon-btn gallery__zoom" aria-label="Zoom cover" data-quick="${b.id}">${icon('zoom')}</button>`;
  $('#gallery-thumbs').innerHTML = views.map(([l, h], i) => `<button class="gallery__thumb" role="tab" aria-selected="${i === 0}" aria-label="${l}" data-view-i="${i}">${h}</button>`).join('');
  $('#gallery-thumbs').addEventListener('click', e => { const t = e.target.closest('[data-view-i]'); if (!t) return; $$('[data-view-i]').forEach(x => x.setAttribute('aria-selected', x === t)); $('#gallery-view').innerHTML = views[t.dataset.viewI][1]; });

  // Info column
  const renderPrice = () => {
    const p = priceFor(b, fmt);
    $('#pdp-price').innerHTML = `<span class="price"><span class="price__now">${money(p.price)}</span>${p.old ? `<span class="price__old">${money(p.old)}</span>` : ''}</span>${p.old ? `<span class="badge badge--sale">-${discountPct(b)}%</span><span class="pdp__save">You save ${money(p.old - p.price)}</span>` : ''}`;
    $('#sticky-price').innerHTML = `<span class="price"><span class="price__now">${money(p.price)}</span></span>`;
    $('#pdp-stock').textContent = ['eBook', 'Audiobook'].includes(fmt) ? `${FORMAT_NOTE[fmt]} after purchase` : 'In stock — ships within 24 hours';
  };
  $('#pdp-info').innerHTML = `
    <div class="pdp__cat"><span class="badge badge--soft">${cat.name}</span>${b.tags.includes('bestseller') ? '<span class="badge badge--gold">#1 Bestseller</span>' : ''}</div>
    <h1 class="pdp__title">${esc(b.title)}</h1>
    <p class="pdp__author">by <a href="#tab-author" data-goto-tab="author">${esc(a.name)}</a> · ${b.year}</p>
    <div class="pdp__rating">${starsHTML(b.rating)}<strong style="color:var(--navy-900)">${b.rating.toFixed(1)}</strong><a href="#tab-reviews" data-goto-tab="reviews" class="link">${fmtNum(b.reviews)} reviews</a><span>·</span><span>${fmtNum(b.reviews * 7)} readers</span></div>
    <div class="pdp__price" id="pdp-price"></div>
    <p class="pdp__desc">${esc(b.blurb)}</p>
    <div><p class="label" id="fmt-label" style="margin-bottom:10px">Format</p>
      <div class="format-opts" role="radiogroup" aria-labelledby="fmt-label">${b.formats.map((f, i) => `<button class="format-opt" role="radio" aria-checked="${i === 0}" data-fmt-opt="${f}"><strong>${f}</strong><span>${money(priceFor(b, f).price)}</span></button>`).join('')}</div></div>
    <span class="pdp__stock" id="pdp-stock"></span>
    <div class="pdp__buy">
      <div class="qty" aria-label="Quantity"><button data-q="-1" aria-label="Decrease quantity">${icon('minus')}</button><input id="qty" type="number" min="1" max="99" value="1" aria-label="Quantity"><button data-q="1" aria-label="Increase quantity">${icon('plus')}</button></div>
      <button class="btn btn--lg" id="add-btn">${icon('bag')} Add to cart</button>
      <button class="btn btn--accent btn--lg" id="buy-btn">${icon('bolt')} Buy now</button>
      <button class="icon-btn" style="border:1.5px solid var(--border);width:54px;height:54px" data-wish="${b.id}" aria-label="Add to wishlist">${icon('heart')}</button>
    </div>
    <div class="pdp__assure">
      <div>${icon('truck')} Free shipping over $35</div><div>${icon('refresh')} 30-day easy returns</div>
      <div>${icon('shield')} Secure checkout</div><div>${icon('gift')} Free gift wrapping</div>
    </div>`;
  renderPrice();
  $('#pdp-info').addEventListener('click', e => {
    const f = e.target.closest('[data-fmt-opt]'); if (f) { fmt = f.dataset.fmtOpt; $$('[data-fmt-opt]').forEach(x => x.setAttribute('aria-checked', x === f)); renderPrice(); }
    const q = e.target.closest('[data-q]'); if (q) { qty = Math.min(99, Math.max(1, qty + Number(q.dataset.q))); $('#qty').value = qty; }
    const g = e.target.closest('[data-goto-tab]'); if (g) { e.preventDefault(); selectTab(g.dataset.gotoTab); $('#pdp-tabs').scrollIntoView({ behavior: 'smooth' }); }
  });
  $('#qty').addEventListener('change', e => { qty = Math.min(99, Math.max(1, Number(e.target.value) || 1)); e.target.value = qty; });
  const add = () => { Store.addToCart(b.id, fmt, qty); flyToCart($('#add-btn')); toast(`${qty} × <strong>${esc(b.title)}</strong> (${fmt}) added`, { href: 'cart.html', label: 'View cart' }); };
  $('#add-btn').addEventListener('click', add); $('#sticky-add').addEventListener('click', add);
  $('#buy-btn').addEventListener('click', () => { Store.addToCart(b.id, fmt, qty); location.href = 'checkout.html'; });
  const io = new IntersectionObserver(([en]) => $('#sticky-buy').classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0));
  io.observe($('#add-btn'));
  $('#sticky-title').textContent = b.title;

  // Tabs
  const dist = [0.72, 0.18, 0.06, 0.03, 0.01];
  const panels = {
    details: `<div class="pdp-grid-2"><div><h3 style="margin-bottom:14px">About this book</h3><p class="pdp__desc">${esc(b.blurb)}</p><p class="pdp__desc mt-4">Praised by critics and readers alike, <em>${esc(b.title)}</em> is the kind of book that stays with you long after the final page — perfect for book clubs, gifting, and quiet evenings.</p></div>
      <table class="spec-table"><tbody>${[['Author', a.name], ['Publisher', b.pub], ['Published', b.year], ['Pages', b.pages], ['Language', b.lang], ['Formats', b.formats.join(', ')], ['ISBN-13', '978-1-' + String(40000 + b.id * 373).padStart(5, '0') + '-' + (b.id % 9) + '-' + (b.id * 7 % 10)], ['Dimensions', '6.1 × 9.2 × 1.2 in']].map(([k, v]) => `<tr><th scope="row">${k}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div>`,
    author: `<div class="author-box"><div class="author-photo">${authorPortrait(b.author)}</div><div><h3>${a.name}</h3><span class="book-card__cat">${a.genre} · ${a.books} books · ${a.followers} readers</span><p>${a.bio} Their work has been translated into more than twenty languages and featured on bestseller lists worldwide.</p><div class="row mt-4"><a class="btn btn--sm" href="books.html?author=${b.author}">All books by ${a.name.split(' ').slice(-2).join(' ')}</a><button class="btn btn--sm btn--outline">${icon('plus')} Follow author</button></div></div></div>`,
    reviews: `<div class="review-summary"><div class="review-summary__score"><strong>${b.rating.toFixed(1)}</strong>${starsHTML(b.rating)}<p>Based on ${fmtNum(b.reviews)} reviews</p></div>
      <div class="bars">${dist.map((d, i) => `<div class="bar"><span>${5 - i} ★</span><div class="bar__track"><div class="bar__fill" style="width:${d * 100}%"></div></div><span>${Math.round(d * 100)}%</span></div>`).join('')}</div></div>
      <div class="row between"><h3>Top reviews</h3><button class="btn btn--outline btn--sm">Write a review</button></div>
      ${REVIEWS.map(r => `<article class="review"><div class="review__head">${avatarHTML(r.name, r.color)}<div><strong>${r.name}</strong><span>${icon('verified', 'width="12" height="12" style="display:inline;color:var(--success);vertical-align:-1px"')} Verified purchase · ${r.date}</span></div></div>${starsHTML(r.rating)}<h4>${r.title}</h4><p>${r.text}</p><div class="review__helpful">Helpful? <button class="chip" style="min-height:30px">${icon('thumb')} ${r.helpful}</button></div></article>`).join('')}`
  };
  const selectTab = k => { $$('[data-ptab]').forEach(t => t.setAttribute('aria-selected', t.dataset.ptab === k)); $('#tab-panel').innerHTML = panels[k]; $('#tab-panel').setAttribute('aria-labelledby', 'ptab-' + k); };
  $('#pdp-tabs-list').addEventListener('click', e => { const t = e.target.closest('[data-ptab]'); if (t) selectTab(t.dataset.ptab); });
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
      $('#cart-root').innerHTML = emptyState('bag', 'Your cart is empty', 'Looks like you haven’t added anything yet. Let’s find your next favourite book.', '<a class="btn btn--lg" href="books.html">Browse books</a>');
      return;
    }
    const t = orderTotals(); const need = Math.max(0, 35 - (t.sub - t.discount));
    $('#cart-root').innerHTML = `<div class="cart-layout">
      <section aria-label="Cart items">
        <div class="cart-list">
          <div class="cart-list__head"><span>Product</span><span>Quantity</span><span style="text-align:right">Total</span></div>
          ${cart.map((l, i) => { const b = bookById(l.id); const p = priceFor(b, l.fmt); return `
            <div class="cart-item">
              <div class="cart-item__prod">
                <a class="cart-item__media" href="book.html?id=${b.id}">${coverHTML(b)}</a>
                <div><h3><a href="book.html?id=${b.id}">${esc(b.title)}</a></h3>
                  <p class="cart-item__meta">${esc(authorOf(b).name)}</p>
                  <div class="cart-item__fmt"><span class="badge badge--soft">${icon({ Hardcover: 'book', Paperback: 'bookOpen', eBook: 'tablet', Audiobook: 'headphones' }[l.fmt], 'width="12" height="12"')} ${l.fmt}</span><span class="small muted">${FORMAT_NOTE[l.fmt]}</span></div>
                  <div class="cart-item__actions"><button class="save" data-save="${i}">${icon('heart')} Save for later</button><button data-remove="${i}">${icon('trash')} Remove</button></div>
                </div>
              </div>
              <div class="qty qty--sm" aria-label="Quantity for ${esc(b.title)}"><button data-inc="${i}" data-d="-1" aria-label="Decrease">${icon('minus')}</button><input value="${l.qty}" data-qty="${i}" type="number" min="1" max="99" aria-label="Quantity"><button data-inc="${i}" data-d="1" aria-label="Increase">${icon('plus')}</button></div>
              <div class="cart-item__total">${money(p.price * l.qty)}<small>${money(p.price)} each</small></div>
            </div>`; }).join('')}
        </div>
        <div class="row between mt-6"><a class="link" href="books.html">${icon('chevLeft')} Continue shopping</a><button class="btn btn--ghost btn--sm" data-clear>${icon('trash')} Clear cart</button></div>
      </section>
      <aside class="summary" aria-label="Order summary">
        <h2>Order summary</h2>
        ${t.physical ? `<div class="ship-progress">${need ? `You're <strong>${money(need)}</strong> away from free shipping` : `${icon('check', 'width="16" height="16" style="display:inline;color:var(--success);vertical-align:-3px"')} You've unlocked <strong>free shipping!</strong>`}<div class="ship-progress__bar"><span style="width:${Math.min(100, (t.sub - t.discount) / 35 * 100)}%"></span></div></div>` : ''}
        ${summaryRows(t)}
        <form class="promo" data-promo><label for="promo" class="sr-only">Discount code</label><input id="promo" class="input" placeholder="Discount code" value="${t.code || ''}" autocomplete="off"><button class="btn btn--outline" type="submit">${t.code ? 'Remove' : 'Apply'}</button></form>
        <p class="promo-msg ${t.code ? 'ok' : ''}" id="promo-msg">${t.promo ? `✓ ${t.promo.label}` : 'Try <strong>READ10</strong>, <strong>SUMMER30</strong> or <strong>FREESHIP</strong>'}</p>
        <a class="btn btn--accent btn--lg btn--block mt-4" href="checkout.html">${icon('lock')} Proceed to checkout</a>
        <p class="summary__secure">${icon('shield')} Secure SSL checkout · 30-day returns</p>
        ${paymentsHTML(['visa', 'mc', 'amex', 'paypal', 'apple'])}
      </aside></div>`;
  };
  $('#cart-root').addEventListener('click', e => {
    const c = [...Store.cart]; const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.inc) { const l = c[t.dataset.inc]; l.qty = Math.min(99, Math.max(1, l.qty + Number(t.dataset.d))); Store.setCart(c); }
    else if (t.dataset.remove) { const [l] = c.splice(t.dataset.remove, 1); Store.setCart(c); toast(`Removed <strong>${esc(bookById(l.id).title)}</strong>`); }
    else if (t.dataset.save) { const [l] = c.splice(t.dataset.save, 1); Store.setCart(c); if (!Store.wish.includes(l.id)) Store.toggleWish(l.id); toast('Saved for later', { href: 'wishlist.html', label: 'Wishlist' }); }
    else if (t.hasAttribute('data-clear')) Store.setCart([]);
    else return;
    render();
  });
  $('#cart-root').addEventListener('change', e => { const i = e.target.dataset.qty; if (i === undefined) return; const c = [...Store.cart]; c[i].qty = Math.min(99, Math.max(1, Number(e.target.value) || 1)); Store.setCart(c); render(); });
  $('#cart-root').addEventListener('submit', e => {
    if (!e.target.matches('[data-promo]')) return; e.preventDefault();
    if (Store.read('promo', null)) { Store.write('promo', null); return render(); }
    const code = $('#promo').value.trim().toUpperCase();
    if (PROMOS[code]) { Store.write('promo', code); render(); toast(`Code <strong>${code}</strong> applied`); }
    else { $('#promo-msg').className = 'promo-msg err'; $('#promo-msg').textContent = 'That code isn’t valid. Check spelling and try again.'; $('#promo').classList.add('is-invalid'); }
  });
  document.addEventListener('store:change', render);
  render();
  $('#upsell-track').innerHTML = BOOKS.filter(b => !Store.cart.some(l => l.id === b.id)).sort((a, b) => b.rating - a.rating).slice(0, 8).map(b => bookCard(b)).join('');
};

/* ======================= CHECKOUT ======================= */
Pages.checkout = () => {
  let step = 1; let ship = 'standard';
  if (!Store.cart.length) {
    $('#checkout-root').innerHTML = emptyState('bag', 'Nothing to check out', 'Your cart is empty — add a book or two and come back.', '<a class="btn btn--lg" href="books.html">Browse books</a>');
    return;
  }
  const renderSummary = () => {
    const t = orderTotals(ship);
    $('#co-summary').innerHTML = `<h2>Your order</h2><div class="mini-items">${Store.cart.map(l => { const b = bookById(l.id); return `<div class="mini-item"><div class="mini-cover">${coverHTML(b)}<span class="qty-dot">${l.qty}</span></div><div><strong>${esc(b.title)}</strong><span>${l.fmt}</span></div><strong>${money(priceFor(b, l.fmt).price * l.qty)}</strong></div>`; }).join('')}</div>${summaryRows(t)}<p class="summary__secure">${icon('lock')} Payments are encrypted and secure</p>`;
    return t;
  };
  const goto = n => {
    step = n;
    $$('.stepper__item').forEach((s, i) => { s.classList.toggle('is-current', i + 1 === n); s.classList.toggle('is-done', i + 1 < n); $('.stepper__dot', s).innerHTML = i + 1 < n ? icon('check') : i + 1; });
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
  const t0 = orderTotals();
  if (!t0.physical) { $('#ship-physical').hidden = true; $('#digital-note').hidden = false; $$('#ship-physical [required]').forEach(i => i.required = false); }
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
    const payLabel = { card: `Card ending in ${v('card-num').slice(-4) || '4242'}`, paypal: 'PayPal', wallet: 'Apple Pay / Google Pay' }[pay];
    $('#review-blocks').innerHTML = `
      <div class="review-block"><div><h4>Contact</h4>${v('co-email')}<br>${v('co-phone')}</div><button class="link" data-edit="1">Edit</button></div>
      ${orderTotals().physical ? `<div class="review-block"><div><h4>Ship to</h4>${v('co-first')} ${v('co-last')}<br>${v('co-address')}<br>${v('co-city')}, ${v('co-zip')} · ${v('co-country')}<br><span class="muted">${ship === 'express' ? 'Express (1–2 days)' : 'Standard (3–5 days)'}</span></div><button class="link" data-edit="1">Edit</button></div>` : ''}
      <div class="review-block"><div><h4>Payment</h4>${payLabel}</div><button class="link" data-edit="2">Edit</button></div>`;
    $$('[data-edit]').forEach(b => b.addEventListener('click', () => goto(Number(b.dataset.edit))));
  }
  $('#place-order').addEventListener('click', () => {
    if (!$('#terms').checked) { $('#terms').closest('.check').style.color = 'var(--danger)'; $('#terms').focus(); return; }
    const t = orderTotals(ship); const no = 'FC-' + Math.floor(100000 + Math.random() * 899999);
    const digital = Store.cart.some(l => ['eBook', 'Audiobook'].includes(l.fmt));
    Store.setCart([]); Store.write('promo', null);
    $('.stepper').hidden = true; $('#co-summary').hidden = true;
    $('#checkout-main').innerHTML = `<div class="success card"><div class="success__icon">${icon('check')}</div><h2>Thank you — your order is confirmed!</h2>
      <span class="order-no">${no}</span><p>We've emailed a receipt for <strong>${money(t.total)}</strong> to ${esc($('#co-email').value)}. ${digital ? 'Your eBooks and audiobooks are ready in your library now.' : ''} ${t.physical ? 'We\'ll send tracking as soon as your parcel ships.' : ''}</p>
      <div class="row" style="justify-content:center">${digital ? `<a class="btn btn--accent" href="account.html#orders">${icon('bookOpen')} Open my library</a>` : ''}<a class="btn btn--outline" href="index.html">Continue shopping</a></div></div>`;
  });
  renderSummary(); goto(1);
};

/* ======================= ACCOUNT ======================= */
Pages.account = () => {
  const ORDERS = [
    { no: 'FC-482913', date: 'Sep 24, 2026', total: 58.47, status: 'processing', label: 'Processing', ids: [1, 6, 11] },
    { no: 'FC-471208', date: 'Sep 08, 2026', total: 34.99, status: 'transit', label: 'In transit', ids: [2, 20] },
    { no: 'FC-455630', date: 'Aug 17, 2026', total: 72.10, status: 'delivered', label: 'Delivered', ids: [5, 14, 3, 9] },
    { no: 'FC-439011', date: 'Jul 29, 2026', total: 18.00, status: 'delivered', label: 'Delivered', ids: [13] }
  ];
  const panels = {
    profile: () => `<div class="acc-panel__head"><h2>Hello, Jane 👋</h2><span class="badge badge--gold">${icon('sparkle', 'width="12" height="12"')} Gold member</span></div>
      <div class="stat-row">
        <div class="stat"><span>Orders</span><strong>${ORDERS.length}</strong></div>
        <div class="stat"><span>Books read in 2026</span><strong>27</strong></div>
        <div class="stat"><span>Reward points</span><strong>1,240</strong></div>
        <div class="stat stat--dark"><span>Reading goal</span><strong>27 / 40</strong><div class="goal"><span style="width:67%"></span></div></div>
      </div>
      <div class="card card--pad"><h3 class="card__title">Profile information</h3>
        <form class="form-grid" data-save-form>
          <div class="field"><label class="label" for="p-first">First name</label><input class="input" id="p-first" value="Jane" autocomplete="given-name"></div>
          <div class="field"><label class="label" for="p-last">Last name</label><input class="input" id="p-last" value="Reader" autocomplete="family-name"></div>
          <div class="field"><label class="label" for="p-email">Email</label><input class="input" id="p-email" type="email" value="jane.reader@example.com" autocomplete="email"></div>
          <div class="field"><label class="label" for="p-phone">Phone</label><input class="input" id="p-phone" type="tel" value="+1 555 010 2233" autocomplete="tel"></div>
          <div class="field"><label class="label" for="p-bday">Birthday <span class="muted">(for a birthday treat)</span></label><input class="input" id="p-bday" type="date" value="1994-05-12"></div>
          <div class="field"><label class="label" for="p-lang">Preferred language</label><select class="select" id="p-lang"><option>English</option><option>Spanish</option><option>French</option><option>German</option></select></div>
          <div class="span-2 row"><button class="btn" type="submit">Save changes</button><button class="btn btn--ghost" type="button">Change password</button></div>
        </form></div>`,
    orders: () => `<div class="acc-panel__head"><h2>Order history</h2><select class="select" style="width:auto;min-height:42px" aria-label="Filter orders"><option>Last 6 months</option><option>2026</option><option>2025</option></select></div>
      ${ORDERS.map(o => `<article class="order"><div class="order__head"><div><span>Order</span><strong>${o.no}</strong></div><div><span>Placed</span><strong>${o.date}</strong></div><div><span>Total</span><strong>${money(o.total)}</strong></div><span class="status status--${o.status}">${o.label}</span><a class="btn btn--outline btn--sm" href="#">View details</a></div>
        <div class="order__body"><div class="order__covers">${o.ids.map(id => miniCover(bookById(id))).join('')}</div><div class="small muted" style="flex:1;min-width:200px">${o.ids.map(id => esc(bookById(id).title)).join(', ')}</div>
        ${o.status === 'delivered' ? '<button class="btn btn--sm">Buy again</button>' : `<button class="btn btn--sm btn--outline">${icon('truck')} Track package</button>`}</div></article>`).join('')}`,
    wishlist: () => `<div class="acc-panel__head"><h2>Wishlist</h2><a class="link" href="wishlist.html">Open full wishlist ${icon('arrowRight')}</a></div>
      ${Store.wish.length ? `<div class="grid grid--books">${Store.wish.map(id => bookCard(bookById(id))).join('')}</div>` : emptyState('heart', 'No saved books yet', 'Tap the heart on any book to save it here.', '<a class="btn" href="books.html">Discover books</a>')}`,
    addresses: () => `<div class="acc-panel__head"><h2>Saved addresses</h2></div>
      <div class="tile-grid">
        <div class="tile"><span class="badge badge--soft">Default</span><strong>Home</strong>Jane Reader<br>21 Paper Lane, Apt 4B<br>Boston, MA 02116<br>United States<div class="tile__actions"><button>Edit</button><button>Remove</button></div></div>
        <div class="tile"><strong>Office</strong>Jane Reader<br>100 Summer Street, Floor 12<br>Boston, MA 02110<br>United States<div class="tile__actions"><button>Edit</button><button>Set as default</button><button>Remove</button></div></div>
        <button class="tile tile--add">${icon('plus')} Add new address</button>
      </div>`,
    payments: () => `<div class="acc-panel__head"><h2>Payment methods</h2></div>
      <div class="tile-grid">
        <div><div class="pay-card" style="background:linear-gradient(135deg,var(--navy-800),var(--navy-950))"><div class="row between"><span class="pay-card__chip"></span><span class="pay" style="height:26px">${PAY_ICONS.visa}</span></div><div class="pay-card__num">•••• •••• •••• 4242</div><div class="pay-card__row"><div><span>Card holder</span>JANE READER</div><div><span>Expires</span>08/29</div></div></div><div class="tile__actions"><span class="badge badge--soft">Default</span><button>Edit</button><button>Remove</button></div></div>
        <div><div class="pay-card" style="background:linear-gradient(135deg,#b87d17,#7a4a0e)"><div class="row between"><span class="pay-card__chip" style="background:linear-gradient(135deg,#fff,#ccc)"></span><span class="pay" style="height:26px">${PAY_ICONS.mc}</span></div><div class="pay-card__num">•••• •••• •••• 5510</div><div class="pay-card__row"><div><span>Card holder</span>JANE READER</div><div><span>Expires</span>02/28</div></div></div><div class="tile__actions"><button>Set as default</button><button>Remove</button></div></div>
        <button class="tile tile--add">${icon('card')} Add payment method</button>
      </div>
      <div class="card card--pad"><h3 class="card__title">Digital wallets</h3><div class="toggle"><div><strong>PayPal</strong><span>jane.reader@example.com</span></div><button class="btn btn--sm btn--outline">Disconnect</button></div><div class="toggle"><div><strong>Apple Pay / Google Pay</strong><span>Available at checkout on supported devices</span></div><label class="switch"><input type="checkbox" checked aria-label="Enable wallets"></label></div></div>`,
    preferences: () => {
      const fav = Store.read('favCats', ['fiction', 'psychology', 'science']);
      return `<div class="acc-panel__head"><h2>Reading preferences</h2><span class="muted small">${icon('ai', 'width="14" height="14" style="display:inline;vertical-align:-2px"')} Powers your “Books You May Like” picks</span></div>
      <div class="card card--pad stack" style="gap:28px">
        <div class="pref-group"><h3>Favourite categories</h3><p>Choose as many as you like.</p><div class="chip-set" data-pref="favCats">${CATEGORIES.map(c => `<button class="chip" aria-pressed="${fav.includes(c.slug)}" data-val="${c.slug}">${icon(c.icon)} ${c.name}</button>`).join('')}</div></div>
        <div class="pref-group"><h3>Preferred formats</h3><div class="chip-set">${['Hardcover', 'Paperback', 'eBook', 'Audiobook'].map((f, i) => `<button class="chip" aria-pressed="${i !== 1}">${f}</button>`).join('')}</div></div>
        <div class="pref-group"><h3>Reading languages</h3><div class="chip-set">${['English', 'Spanish', 'French', 'German'].map((f, i) => `<button class="chip" aria-pressed="${i === 0}">${f}</button>`).join('')}</div></div>
        <div class="pref-group"><h3>Yearly reading goal</h3><div class="row"><div class="qty"><button aria-label="Decrease" data-goal="-1">${icon('minus')}</button><input id="goal" value="40" aria-label="Books per year" type="number"><button aria-label="Increase" data-goal="1">${icon('plus')}</button></div><span class="muted small">books in 2026</span></div></div>
        <div class="pref-group"><h3>Notifications</h3><div>
          ${[['New releases from followed authors', 'Be first to know', true], ['Price drops on wishlist items', 'We’ll email when a saved book goes on sale', true], ['Weekly personalised picks', 'Curated every Friday', false]].map(([a, b, on]) => `<div class="toggle"><div><strong>${a}</strong><span>${b}</span></div><label class="switch"><input type="checkbox" ${on ? 'checked' : ''} aria-label="${a}"></label></div>`).join('')}
        </div></div>
      </div>`;
    }
  };
  const show = key => {
    if (!panels[key]) key = 'profile';
    $$('[data-acc]').forEach(b => b.setAttribute('aria-selected', b.dataset.acc === key));
    $('#acc-panel').innerHTML = panels[key](); $('#acc-panel').classList.add('is-active');
    history.replaceState(null, '', '#' + key); updateCounts();
  };
  $('#acc-nav').addEventListener('click', e => { const b = e.target.closest('[data-acc]'); if (b) show(b.dataset.acc); });
  $('#acc-panel').addEventListener('click', e => {
    const c = e.target.closest('.chip-set .chip');
    if (c) { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); const set = c.closest('[data-pref]'); if (set) Store.write(set.dataset.pref, $$('.chip[aria-pressed=true]', set).map(x => x.dataset.val)); }
    const g = e.target.closest('[data-goal]'); if (g) $('#goal').value = Math.max(1, Number($('#goal').value) + Number(g.dataset.goal));
  });
  $('#acc-panel').addEventListener('submit', e => { e.preventDefault(); toast('Profile saved'); });
  $('#acc-wish-n').textContent = Store.wish.length;
  document.addEventListener('store:change', () => { $('#acc-wish-n').textContent = Store.wish.length; if (location.hash === '#wishlist') show('wishlist'); });
  addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || 'profile');
};

/* ======================= WISHLIST ======================= */
Pages.wishlist = () => {
  const render = () => {
    const ids = Store.wish;
    $('#wish-count').textContent = `${ids.length} saved ${ids.length === 1 ? 'book' : 'books'}`;
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
          <div class="row" style="gap:10px;margin-top:4px">${priceHTML(b)}${b.old ? `<span class="price-drop">${icon('trendDown')} Price dropped ${discountPct(b)}%</span>` : ''}</div>
          <span class="small muted">${fmt} · ${['eBook', 'Audiobook'].includes(fmt) ? 'Instant delivery' : 'In stock'}</span>
          <div class="wish-item__actions">
            <button class="btn btn--sm" data-move="${b.id}">${icon('bag')} Move to cart</button>
            <button class="btn btn--sm btn--danger" data-unwish="${b.id}" aria-label="Remove ${esc(b.title)} from wishlist">${icon('trash')} Remove</button>
          </div>
        </div></article>`; }).join('')}</div>`
      : emptyState('heart', 'Your wishlist is empty', 'Save books you love by tapping the heart icon. They’ll wait for you here — and we’ll tell you when prices drop.', '<a class="btn btn--lg" href="books.html">Discover books</a>');
  };
  $('#wish-root').addEventListener('click', e => {
    const m = e.target.closest('[data-move]'), r = e.target.closest('[data-unwish]');
    if (m) { const id = Number(m.dataset.move); Store.addToCart(id); Store.setWish(Store.wish.filter(x => x !== id)); flyToCart(m); toast(`Moved <strong>${esc(bookById(id).title)}</strong> to cart`, { href: 'cart.html', label: 'View cart' }); render(); }
    if (r) { const id = Number(r.dataset.unwish); Store.setWish(Store.wish.filter(x => x !== id)); toast('Removed from wishlist'); render(); }
  });
  $('#wish-all').addEventListener('click', () => { const n = Store.wish.length; Store.wish.forEach(id => Store.addToCart(id)); Store.setWish([]); flyToCart($('#wish-all')); toast(`Moved ${n} books to cart`, { href: 'cart.html', label: 'View cart' }); render(); });
  $('#wish-share').addEventListener('click', () => { try { navigator.clipboard?.writeText(location.href); } catch { } toast('Wishlist link copied'); });
  document.addEventListener('store:change', render);
  render();
  $('#wish-reco').innerHTML = BOOKS.filter(b => !Store.wish.includes(b.id)).sort((a, b) => b.reviews - a.reviews).slice(0, 8).map(b => bookCard(b)).join('');
};

/* ======================= DESIGN SYSTEM ======================= */
Pages.ds = () => {
  const sw = (name, v) => `<div class="swatch"><div class="swatch__color" style="background:var(${v})"></div><div class="swatch__meta"><strong>${name}</strong><code>${getComputedStyle(document.documentElement).getPropertyValue(v).trim()}</code></div></div>`;
  $('#ds-colors').innerHTML = [
    ['Primary — Navy', [['Navy 950', '--navy-950'], ['Navy 900', '--navy-900'], ['Navy 800', '--navy-800'], ['Navy 700', '--navy-700'], ['Navy 600', '--navy-600'], ['Navy 100', '--navy-100'], ['Navy 50', '--navy-50']]],
    ['Secondary — Cream', [['Cream 50', '--cream-50'], ['Cream 100', '--cream-100'], ['Cream 200', '--cream-200'], ['Cream 300', '--cream-300'], ['Cream 500', '--cream-500']]],
    ['Accent — Gold & Orange', [['Gold 300', '--gold-300'], ['Gold 400', '--gold-400'], ['Gold 500', '--gold-500'], ['Gold 600', '--gold-600'], ['Orange 500', '--orange-500']]],
    ['Neutrals & Semantic', [['White', '--white'], ['Gray 50', '--gray-50'], ['Gray 200', '--gray-200'], ['Gray 500', '--gray-500'], ['Ink', '--ink'], ['Success', '--success'], ['Danger', '--danger']]]
  ].map(([g, list]) => `<div class="swatch-group"><h3>${g}</h3><div class="swatches">${list.map(([n, v]) => sw(n, v)).join('')}</div></div>`).join('');
  $('#ds-cards').innerHTML = [2, 5, 7].map(id => bookCard(bookById(id))).join('');
  $('#ds-covers').innerHTML = BOOKS.slice(0, 10).map(b => `<div style="width:92px">${coverHTML(b)}</div>`).join('');
  $('#ds-modal').addEventListener('click', () => quickView(1));
  $('#ds-toast').addEventListener('click', () => toast('This is a toast notification', { href: '#', label: 'Action' }));
  $$('#ds-chips .chip').forEach(c => c.addEventListener('click', () => c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true')));
  $$('#ds-tabs .tab').forEach(t => t.addEventListener('click', () => $$('#ds-tabs .tab').forEach(x => x.setAttribute('aria-selected', x === t))));
};
