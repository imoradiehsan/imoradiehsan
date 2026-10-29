/* ورق — کتابخانه، صفحه‌بندی و صفحه مطالعه */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const faNum = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('varagh.' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('varagh.' + k, JSON.stringify(v)); } catch { } }
};
const settings = Object.assign({ font: 1, night: false, layout: 'auto' }, store.get('settings', {}));
const saveSettings = () => store.set('settings', settings);

/* ---------- Covers ---------- */
function coverHTML(b, big = false) {
  const pat = `<svg class="cover__pattern" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 67) % 200}" cy="${(i * 113) % 300}" r="${8 + (i % 4) * 9}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1.5"/>`).join('')}</svg>`;
  if (b.cover) return `<div class="cover cover--img${big ? ' cover--big' : ''}" style="--c1:${b.color};--c2:${b.color2}"><img src="${esc(b.cover)}" alt="${esc(b.title)}"><div class="cover__spine"></div></div>`;
  return `<div class="cover${big ? ' cover--big' : ''}" style="--c1:${b.color};--c2:${b.color2}" dir="${b.lang === 'fa' ? 'rtl' : 'ltr'}">${pat}
    <div class="cover__spine"></div>
    <div class="cover__text"><div class="cover__title">${esc(b.title)}</div>${b.subtitle ? `<div class="cover__sub">${esc(b.subtitle)}</div>` : ''}<div class="cover__author">${esc(b.author)}</div></div>
    <div class="cover__brand">ورق</div></div>`;
}

/* ---------- Library ---------- */
const KIND = { text: 'متن', image: 'تصویر', video: 'ویدئو' };
function renderLibrary() {
  const grid = $('#lib-grid');
  grid.innerHTML = BOOKS.map(b => {
    const pr = store.get('progress.' + b.id, null);
    const pct = pr && pr.total ? Math.round(100 * (pr.page + 1) / pr.total) : 0;
    return `<a class="book-card" href="#book/${b.id}" aria-label="${esc(b.title)} — ${esc(b.author)}">
      <div class="book-card__cover">${coverHTML(b)}</div>
      <div class="book-card__body">
        <div class="book-card__kinds">${b.kind.map(k => `<span class="pill pill--${k}">${KIND[k]}</span>`).join('')}</div>
        <h3 class="book-card__title">${esc(b.title)}</h3>
        <div class="book-card__author">${esc(b.author)}</div>
        <p class="book-card__blurb">${esc(b.blurb)}</p>
        <div class="book-card__meta"><span>${faNum(b.minutes)} دقیقه مطالعه</span>${pct ? `<span>${faNum(pct)}٪ خوانده شده</span>` : '<span>شروع نشده</span>'}${(store.get('bm.' + b.id, []).length) ? `<span class="meta-bm">${faNum(store.get('bm.' + b.id, []).length)} نشان</span>` : ''}</div>
        <div class="progress" aria-hidden="true"><span style="width:${pct}%"></span></div>
      </div></a>`;
  }).join('');
}

/* ---------- Pagination ---------- */
function blockHTML(bl, book) {
  switch (bl.t) {
    case 'h': return `<h2 class="pg-h${bl.small ? ' pg-h--small' : ''}">${esc(bl.text)}</h2>`;
    case 'p': return `<p class="pg-p${bl.cont ? ' pg-p--cont' : ''}">${esc(bl.text)}</p>`;
    case 'quote': return `<blockquote class="pg-q">${bl.text.split('\n').map(l => `<span>${esc(l)}</span>`).join('')}</blockquote>`;
    case 'sep': return `<div class="pg-sep" aria-hidden="true">❦</div>`;
    case 'img': return `<figure class="pg-fig"><div class="pg-media">${bl.svg || `<img src="${esc(bl.src)}" alt="${esc(bl.caption || '')}" loading="lazy">`}</div>${bl.caption ? `<figcaption>${esc(bl.caption)}</figcaption>` : ''}</figure>`;
    case 'video': return `<figure class="pg-fig pg-fig--video"><div class="pg-media"><video controls playsinline preload="none" poster="${esc(bl.poster || '')}" src="${esc(bl.src)}"></video></div>${bl.caption ? `<figcaption>${esc(bl.caption)}</figcaption>` : ''}</figure>`;
  }
  return '';
}
function pageHTML(book, page, idx, total) {
  const dir = book.lang === 'fa' ? 'rtl' : 'ltr';
  if (!page || page.blank) return `<div class="page page--blank" dir="${dir}"></div>`;
  if (page.cover) return `<div class="page page--cover" dir="${dir}">${coverHTML(book, true)}</div>`;
  if (page.video) { const v = page.video; return `<div class="page page--video" dir="${dir}"><video playsinline loop muted preload="auto" poster="${esc(v.poster || '')}" src="${esc(v.src)}"></video>${v.caption ? `<div class="page__vcap">${esc(v.caption)}</div>` : ''}<button class="vmute" aria-label="صدا" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path class="vmute__on" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="vmute__off" d="m17 9 4 6M21 9l-4 6"/></svg></button><div class="page__num">${book.lang === 'fa' ? faNum(idx) : idx}</div></div>`; }
  if (page.end) return `<div class="page page--end" dir="${dir}"><div class="page__inner"><div class="end"><div class="end__mark">❦</div><div class="end__title">${book.lang === 'fa' ? 'پایان' : 'The End'}</div><div class="end__sub">${esc(book.title)} — ${esc(book.author)}</div><a class="btn" href="#book/${book.id}">${book.lang === 'fa' ? 'بازگشت' : 'Back'}</a></div></div></div>`;
  const num = book.lang === 'fa' ? faNum(idx) : idx;
  const ribbon = Reader.isBookmarked(idx) ? '<div class="page__ribbon" aria-label="نشان‌شده"></div>' : '';
  return `<div class="page" dir="${dir}"><div class="page__inner">${page.html}</div><div class="page__num">${num}</div><div class="page__run">${esc(book.title)}</div>${ribbon}</div>`;
}
/* Fill a hidden page of the real size with blocks until it overflows; long paragraphs split on word boundaries. */
function paginate(book, W, H) {
  const meas = $('#measure');
  meas.innerHTML = `<div class="page" dir="${book.lang === 'fa' ? 'rtl' : 'ltr'}"><div class="page__inner"></div></div>`;
  meas.style.width = W + 'px'; meas.style.height = H + 'px';
  const inner = $('.page__inner', meas);
  const fits = () => inner.scrollHeight <= inner.clientHeight + 1;
  const pages = [{ cover: true }];
  let cur = [];
  const flush = () => { if (cur.length) pages.push({ html: cur.join('') }); cur = []; inner.innerHTML = ''; };
  const queue = book.blocks.map(b => ({ ...b }));
  while (queue.length) {
    const bl = queue.shift();
    if (bl.t === 'video' && bl.full) { flush(); pages.push({ video: bl }); continue; } // a full-bleed video is a page of its own
    const html = blockHTML(bl, book);
    inner.insertAdjacentHTML('beforeend', html);
    if (fits()) { cur.push(html); continue; }
    inner.lastElementChild.remove();
    if (bl.t === 'p') {
      const words = bl.text.split(' ');
      let lo = 0, hi = words.length; // largest n that fits
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        inner.insertAdjacentHTML('beforeend', blockHTML({ ...bl, text: words.slice(0, mid).join(' ') }, book));
        const ok = fits(); inner.lastElementChild.remove();
        if (ok) lo = mid; else hi = mid - 1;
      }
      if (lo >= 6 && words.length - lo >= 3) {
        const h = blockHTML({ ...bl, text: words.slice(0, lo).join(' ') }, book);
        inner.insertAdjacentHTML('beforeend', h); cur.push(h);
        queue.unshift({ ...bl, text: words.slice(lo).join(' '), cont: true });
        flush(); continue;
      }
    }
    if (!cur.length) { cur.push(html); flush(); continue; } // too big for an empty page: let CSS cap it
    flush(); queue.unshift(bl);
  }
  flush();
  pages.push({ end: true });
  return pages;
}

/* ---------- Reader ---------- */
const Reader = {
  book: null, pages: [], index: 0, mode: 'single', W: 0, H: 0, curl: null,
  /* ---- bookmarks: a list of page indices per book, kept in localStorage ---- */
  get bms() { return this.book ? store.get('bm.' + this.book.id, []) : []; },
  isBookmarked(i) { return this.bms.includes(i); },
  toggleBookmark() {
    const i = this.index, list = this.bms.filter(x => x !== i);
    if (!this.isBookmarked(i)) list.push(i);
    store.set('bm.' + this.book.id, list.sort((a, b) => a - b));
    this.renderStatic();
  },
  bookmarkList() {
    const pop = $('#bm-pop'), fa = this.rtl;
    const items = this.bms.filter(i => i < this.pages.length).map(i => {
      const p = this.pages[i], label = p.cover ? (fa ? 'جلد' : 'Cover') : p.end ? (fa ? 'پایان' : 'End') : (p.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) + '…';
      return `<button class="bm-pop__item" data-go="${i}"><span class="bm-pop__num">${fa ? faNum(i + 1) : i + 1}</span><span class="bm-pop__text">${esc(label)}</span><span class="bm-pop__del" data-del="${i}" role="button" aria-label="حذف نشان">×</span></button>`;
    });
    pop.innerHTML = items.length ? items.join('') : `<div class="bm-pop__empty">${fa ? 'هنوز نشانی نگذاشته‌اید. با دکمه نشان، این صفحه را ذخیره کنید.' : 'No bookmarks yet.'}</div>`;
  },
  showBookmarks(on) { const pop = $('#bm-pop'); if (on) this.bookmarkList(); pop.hidden = !on; $('#rd-bm-list').setAttribute('aria-expanded', !!on); },
  open(book) {
    this.book = book;
    document.body.classList.add('is-reading');
    $('#library').hidden = true; $('#reader').hidden = false;
    $('#rd-title').textContent = book.title;
    this.applySettings();
    const pr = store.get('progress.' + book.id, null);
    this.index = pr ? pr.page : 0;
    this.layout(true);
  },
  close() {
    this.killCurl();
    document.body.classList.remove('is-reading');
    $('#reader').hidden = true; $('#library').hidden = false;
    $('#book').innerHTML = '';
    this.book = null;
    renderLibrary();
  },
  applySettings() {
    document.documentElement.style.setProperty('--font-scale', settings.font);
    document.body.classList.toggle('night', !!settings.night);
    $('#rd-night').setAttribute('aria-pressed', !!settings.night);
    $('#rd-layout').dataset.layout = settings.layout;
  },
  /* page size + mode from the viewport; re-paginate keeping the reader's place */
  layout(first = false) {
    const stage = $('#stage');
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const auto = sw > 760 && sw > sh * 1.05;
    this.mode = settings.layout === 'auto' ? (auto ? 'spread' : 'single') : settings.layout;
    if (this.mode === 'spread' && sw < 560) this.mode = 'single';
    $('#reader').dataset.mode = this.mode; // single mode drops the stage padding: the page fills the stage edge to edge
    const cs = getComputedStyle(stage);
    const aw = sw - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = sh - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    let W, H;
    if (this.mode === 'spread') { W = Math.min((aw - 48) / 2, (ah - 32) / 1.42); H = Math.min(ah - 32, W * 1.42); }
    else if (aw <= 700) { W = aw; H = ah; } // phone: edge to edge, toolbar sits below the page
    else { W = Math.min(640, ah / 1.3); H = ah - 24; }
    W = Math.floor(W); H = Math.floor(H);
    const book = $('#book');
    book.style.width = (this.mode === 'spread' ? W * 2 : W) + 'px'; book.style.height = H + 'px';
    book.style.setProperty('--page-h', H + 'px'); book.style.setProperty('--page-w', W + 'px');
    book.dataset.mode = this.mode; book.dataset.dir = this.rtl ? 'rtl' : 'ltr';
    document.documentElement.style.setProperty('--page-h', H + 'px');
    if (W !== this.W || H !== this.H || first || this._font !== settings.font || this._mode !== this.mode) {
      // remember which block starts the current page so the place survives re-pagination
      const anchor = this.pages[this.index]?.html ?? null;
      this.W = W; this.H = H; this._font = settings.font; this._mode = this.mode;
      this.pages = paginate(this.book, W, H);
      if (this.mode === 'spread' && this.pages.length % 2) this.pages.push({ blank: true }); // spreads need pairs
      if (anchor && !first) {
        const head = anchor.slice(0, 120);
        const j = this.pages.findIndex(p => p.html && p.html.startsWith(head));
        if (j >= 0) this.index = j;
      }
      this.index = Math.min(this.index, this.pages.length - 1);
    }
    if (this.mode === 'spread' && this.index % 2) this.index--; // spreads start on an even index (cover alone)
    this.renderStatic();
  },
  get rtl() { return this.book.lang === 'fa'; },
  /* spread: front page = index (the one you flip forward), other side = index - 1 */
  renderStatic() {
    this.killCurl();
    const book = $('#book'), p = this.pages, i = this.index, b = this.book, n = p.length;
    if (this.mode === 'single') {
      book.innerHTML = `<div class="pagebox pagebox--single" data-side="front">${pageHTML(b, p[i], i, n)}</div>`;
    } else {
      const front = `<div class="pagebox" data-side="front">${pageHTML(b, p[i], i, n)}</div>`;
      const other = `<div class="pagebox" data-side="other">${pageHTML(b, p[i - 1], i - 1, n)}</div>`;
      book.innerHTML = this.rtl ? front + other : other + front; // RTL: front page on the left
    }
    this.pauseMedia();
    this.playVisibleVideo();
    this.updateHud();
    store.set('progress.' + b.id, { page: i, total: n });
    $('#rd-bm').setAttribute('aria-pressed', this.isBookmarked(i));
    this.showBookmarks(false);
    // first-time hint on the cover: a glow and a finger tracing the swipe, until the reader has turned a page in this book
    const hint = $('#swipe-hint'); hint.hidden = !(i === 0 && !store.get('hinted.' + b.id, false));
    hint.style.setProperty('--hs', Math.min(1, (this.W - 40) / 300).toFixed(3));
  },
  updateHud() {
    const n = this.pages.length, i = this.index, fa = this.rtl;
    $('#rd-count').textContent = fa ? `${faNum(i + 1)} / ${faNum(n)}` : `${i + 1} / ${n}`;
    const sl = $('#rd-slider'); sl.max = n - 1; sl.value = i;
    $('#rd-slider').setAttribute('aria-valuetext', `${i + 1} / ${n}`);
    $('#rd-pct').style.width = (100 * i / (n - 1)) + '%';
  },
  pauseMedia() { $$('#book video').forEach(v => v.pause()); },
  /* a full-page video starts as soon as its page is turned to; with sound when the browser allows it, else muted with an unmute button */
  playVisibleVideo() {
    $$('#book .page--video video').forEach(v => {
      v.muted = !!settings.muted;
      const p = v.play(); if (p) p.catch(() => { v.muted = true; v.play().catch(() => {}); });
      const btn = v.parentElement.querySelector('.vmute');
      const sync = () => btn.setAttribute('aria-pressed', !v.muted); sync();
      v.addEventListener('volumechange', sync);
      btn.addEventListener('click', e => { e.stopPropagation(); v.muted = !v.muted; settings.muted = v.muted; saveSettings(); if (v.paused) v.play().catch(() => {}); });
    });
  },
  canFlip(dirn) { // +1 forward, -1 back
    const n = this.pages.length, i = this.index;
    return dirn > 0 ? i + 1 < n : i > 0;
  },
  /* Build a PageCurl for the requested direction. Returns null when there is nothing to flip. */
  makeCurl(dirn, corner, startFlipped) {
    if (!this.canFlip(dirn) || this.curl) return null;
    const p = this.pages, i = this.index, b = this.book, n = p.length, book = $('#book');
    let sheetFront, sheetBack, base, box, spineRight;
    if (this.mode === 'single') {
      box = $('.pagebox', book); spineRight = this.rtl; sheetBack = null;
      if (dirn > 0) { sheetFront = i; base = i + 1; } else { sheetFront = i - 1; base = i; }
    } else {
      if (dirn > 0) { sheetFront = i; sheetBack = i + 1; base = i + 2; box = $('.pagebox[data-side="front"]', book); spineRight = this.rtl; }
      else { sheetFront = i - 1; sheetBack = i - 2; base = i - 3; box = $('.pagebox[data-side="other"]', book); spineRight = !this.rtl; }
    }
    this.pauseMedia();
    box.innerHTML = pageHTML(b, p[base], base, n); // what lies beneath
    box.style.zIndex = 3; // the lifted part flies over the other page
    const curl = new PageCurl({
      host: box, W: this.W, H: this.H, spineRight, corner, startFlipped,
      frontHTML: pageHTML(b, p[sheetFront], sheetFront, n),
      backHTML: this.mode === 'single' ? null : pageHTML(b, p[sheetBack], sheetBack, n),
      onEnd: flipped => {
        const moved = dirn > 0 ? flipped : !flipped;
        if (moved) { this.index += dirn * (this.mode === 'single' ? 1 : 2); store.set('hinted.' + b.id, true); }
        this.curl = null;
        this.renderStatic();
      }
    });
    this.curl = curl; this.curlDir = dirn; this.curlBox = box;
    return curl;
  },
  killCurl() { if (this.curl) { this.curl.destroy(); this.curl = null; } },
  go(dirn) { // tap / keyboard: animated flip, grab the bottom corner
    const c = this.makeCurl(dirn, 'bottom', dirn < 0);
    if (c) c.flipTo(dirn > 0, 850);
  },
  jump(i) { this.killCurl(); this.index = Math.max(0, Math.min(this.pages.length - 1, i)); if (this.mode === 'spread' && this.index % 2) this.index--; this.renderStatic(); },

  /* ---- pointer gestures on the stage ---- */
  bindGestures() {
    const stage = $('#stage');
    let drag = null;
    const boxPoint = (box, e) => { const r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    stage.addEventListener('dragstart', e => e.preventDefault()); // images must not start a native drag
    stage.addEventListener('pointerdown', e => {
      if (e.button || !this.book) return;
      $('#swipe-hint').hidden = true;
      if (e.target.closest('a, button, input, .end')) return; // (a full-page video itself can still be swiped)
      const book = $('#book'), r = book.getBoundingClientRect();
      const x = e.clientX - r.left, inside = e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10 && x >= -10 && x <= r.width + 10;
      if (!inside) return;
      // which way? the half of the book you grab decides, in reading direction
      const rightHalf = x > r.width / 2;
      const dirn = this.rtl ? (rightHalf ? -1 : 1) : (rightHalf ? 1 : -1);
      drag = { x0: e.clientX, y0: e.clientY, t0: performance.now(), dirn, started: false, box: null, corner: (e.clientY - r.top) < r.height / 2 ? 'top' : 'bottom' };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.started) {
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.6) { drag = null; return; } // vertical: not a page turn
        const c = this.makeCurl(drag.dirn, drag.corner, drag.dirn < 0);
        if (!c) { drag = null; return; }
        drag.started = true; drag.box = this.curlBox;
        c.beginDrag(boxPoint(drag.box, { clientX: drag.x0, clientY: drag.y0 }));
      }
      this.curl && this.curl.drag(boxPoint(drag.box, e));
    });
    const up = e => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.started) { this.curl && this.curl.release(); return; }
      // a tap near either edge turns the page
      const book = $('#book'), r = book.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width;
      if (performance.now() - d.t0 > 500) return;
      if (fx < 0.3 || fx > 0.7) this.go(d.dirn);
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', () => { if (drag && drag.started && this.curl) this.curl.release(); drag = null; });
    addEventListener('keydown', e => {
      if (!this.book || e.target.matches('input')) return;
      const fwd = this.rtl ? 'ArrowLeft' : 'ArrowRight', back = this.rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); this.go(1); }
      else if (e.key === back || e.key === 'PageUp') { e.preventDefault(); this.go(-1); }
      else if (e.key === 'Escape') location.hash = '';
    });
  }
};

/* ---------- Wiring ---------- */
/* ---------- Book page ---------- */
const Detail = {
  book: null,
  open(b) {
    this.book = b;
    $('#library').hidden = true; $('#detail').hidden = false; scrollTo(0, 0);
    $('#dt-cover').innerHTML = coverHTML(b, true);
    $('#dt-title').textContent = b.title; $('#dt-blurb').textContent = b.blurb;
    $('#dt-author').textContent = b.author; $('#dt-minutes').textContent = `${faNum(b.minutes)} دقیقه`;
    const pr = store.get('progress.' + b.id, null), pct = pr && pr.total ? Math.round(100 * (pr.page + 1) / pr.total) : 0;
    $('#dt-info').innerHTML = [['نوع محتوا', b.kind.map(k => KIND[k]).join('، ')], ['زبان', b.lang === 'fa' ? 'فارسی' : 'انگلیسی'], b.subtitle ? ['مجموعه', b.subtitle] : null, ['پیشرفت', pct ? `${faNum(pct)}٪` : 'شروع نشده']].filter(Boolean)
      .map(([k, v]) => `<div class="kv__row"><span class="kv__k">${k}</span><span class="kv__v">${esc(v)}</span></div>`).join('');
    const bms = store.get('bm.' + b.id, []);
    $('#dt-bms').innerHTML = bms.length ? bms.map(i => `<button class="list__row" data-page="${i}"><span class="list__icon">${icon('bookOpen')}</span><span class="list__text">صفحه ${faNum(i + 1)}</span><span class="list__go">${icon('chevLeft')}</span></button>`).join('')
      : '<div class="list__empty">هنوز نشانی نگذاشته‌اید؛ داخل کتاب از دکمه نشان استفاده کنید.</div>';
    $('#dt-read').textContent = pct ? 'ادامه مطالعه' : 'شروع مطالعه';
  },
  close() { $('#detail').hidden = true; $('#library').hidden = false; this.book = null; renderLibrary(); }
};
const icon = n => ({ bookOpen: '<svg viewBox="0 0 24 24"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2V5ZM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7V5Z"/></svg>', chevLeft: '<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>' })[n];

function route() {
  const m = location.hash.match(/^#(book|read)\/([\w-]+)/);
  const b = m && BOOKS.find(x => x.id === m[2]);
  if (b && m[1] === 'read') { if (Detail.book) Detail.close(); if (Reader.book !== b) Reader.open(b); return; }
  if (Reader.book) Reader.close();
  if (b) Detail.open(b); else { if (Detail.book) Detail.close(); renderLibrary(); }
}
addEventListener('hashchange', route);
addEventListener('resize', () => { if (Reader.book) Reader.layout(); });
document.addEventListener('DOMContentLoaded', () => {
  const sat = new URLSearchParams(location.search).get('sat') || (window.self !== window.top ? '48' : '');
  if (sat) document.documentElement.style.setProperty('--sat', sat + 'px');
  Reader.bindGestures();
  $('#rd-back').addEventListener('click', () => { location.hash = Reader.book ? 'book/' + Reader.book.id : ''; });
  $('#dt-back').addEventListener('click', () => { location.hash = ''; });
  $('#dt-read').addEventListener('click', () => { location.hash = 'read/' + Detail.book.id; });
  $('#dt-bm').addEventListener('click', () => $('#dt-bms').scrollIntoView({ behavior: 'smooth', block: 'center' }));
  $('#dt-share').addEventListener('click', () => { const b = Detail.book, url = location.href; if (navigator.share) navigator.share({ title: b.title, text: `${b.title} — ${b.author}`, url }).catch(() => {}); else navigator.clipboard && navigator.clipboard.writeText(url); });
  $('#dt-bms').addEventListener('click', e => { const r = e.target.closest('[data-page]'); if (!r) return; store.set('progress.' + Detail.book.id, { page: +r.dataset.page, total: 0 }); location.hash = 'read/' + Detail.book.id; });
  $('#rd-bm').addEventListener('click', () => Reader.toggleBookmark());
  $('#rd-bm-list').addEventListener('click', () => Reader.showBookmarks($('#bm-pop').hidden));
  $('#bm-pop').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del) { e.stopPropagation(); store.set('bm.' + Reader.book.id, Reader.bms.filter(x => x !== +del.dataset.del)); Reader.bookmarkList(); Reader.renderStatic(); Reader.showBookmarks(true); return; }
    const go = e.target.closest('[data-go]'); if (go) Reader.jump(+go.dataset.go);
  });
  $('#stage').addEventListener('pointerdown', () => Reader.showBookmarks(false), true);
  $('#rd-prev').addEventListener('click', () => Reader.go(-1));
  $('#rd-next').addEventListener('click', () => Reader.go(1));
  $('#rd-slider').addEventListener('input', e => Reader.jump(+e.target.value));
  $('#rd-font-up').addEventListener('click', () => { settings.font = Math.min(1.5, +(settings.font + 0.1).toFixed(2)); saveSettings(); Reader.applySettings(); Reader.layout(); });
  $('#rd-font-down').addEventListener('click', () => { settings.font = Math.max(0.8, +(settings.font - 0.1).toFixed(2)); saveSettings(); Reader.applySettings(); Reader.layout(); });
  $('#rd-night').addEventListener('click', () => { settings.night = !settings.night; saveSettings(); Reader.applySettings(); });
  $('#rd-layout').addEventListener('click', () => { settings.layout = { auto: 'single', single: 'spread', spread: 'auto' }[settings.layout]; saveSettings(); Reader.applySettings(); Reader.layout(); });
  route();
});
