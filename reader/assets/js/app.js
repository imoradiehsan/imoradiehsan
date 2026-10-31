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
const KIND = { text: 'متن', image: 'تصویر', video: 'ویدئو', audio: 'روایت صوتی' };
function renderLibrary() {
  const grid = $('#lib-grid');
  // the book read most recently, with its progress, as a large card on top
  const last = store.get('last', null), lb = last && BOOKS.find(b => b.id === last);
  const lpr = lb && store.get('progress.' + lb.id, null), lpct = lpr && lpr.total ? Math.round(100 * (lpr.page + 1) / lpr.total) : 0;
  $('#lib-continue').innerHTML = lb ? `<a class="hero-card" href="#read/${lb.id}" style="--c1:${lb.color};--c2:${lb.color2}">
      <div class="hero-card__cover">${coverHTML(lb)}</div>
      <div class="hero-card__body"><span class="hero-card__eyebrow">ادامه مطالعه</span><h3>${esc(lb.title)}</h3><p>${esc(lb.author)}</p>
        <div class="hero-card__progress"><span style="width:${lpct}%"></span></div><span class="hero-card__pct">${faNum(lpct)}٪</span></div>
      <span class="hero-card__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z"/></svg></span></a>` : '';
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
        <div class="book-card__badges">${b.narration ? '<span class="badge-i badge-i--audio" title="روایت صوتی"><svg viewBox="0 0 24 24"><path d="M3 17v-5a9 9 0 0 1 18 0v5"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/></svg>صوتی</span>' : ''}${b.kind.includes('video') ? '<span class="badge-i badge-i--video" title="ویدئو"><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg>ویدئو</span>' : ''}</div>
        <div class="book-card__meta"><span>${faNum(b.minutes)} دقیقه مطالعه</span>${pct ? `<span>${faNum(pct)}٪ خوانده شده</span>` : '<span>شروع نشده</span>'}${(store.get('bm.' + b.id, []).length) ? `<span class="meta-bm">${faNum(store.get('bm.' + b.id, []).length)} نشان</span>` : ''}</div>
        <div class="progress" aria-hidden="true"><span style="width:${pct}%"></span></div>
      </div></a>`;
  }).join('');
}

/* ---------- Pagination ---------- */
function blockHTML(bl, book) {
  switch (bl.t) {
    case 'h': return `<h2 class="pg-h${bl.small ? ' pg-h--small' : ''}">${words(bl.text, bl.w0)}</h2>`;
    case 'p': return `<p class="pg-p${bl.cont ? ' pg-p--cont' : ''}">${words(bl.text, bl.w0)}</p>`;
    case 'quote': { let k = bl.w0; return `<blockquote class="pg-q">${bl.text.split('\n').map(l => { const h = `<span>${words(l, k)}</span>`; if (k != null) k += l.split(/\s+/).filter(Boolean).length; return h; }).join('')}</blockquote>`; }
    case 'sep': return `<div class="pg-sep" aria-hidden="true">❦</div>`;
    case 'img': return `<figure class="pg-fig"><div class="pg-media">${bl.svg || `<img src="${esc(bl.src)}" alt="${esc(bl.caption || '')}" loading="lazy">`}</div>${bl.caption ? `<figcaption>${esc(bl.caption)}</figcaption>` : ''}</figure>`;
    case 'video': return `<figure class="pg-fig pg-fig--video"><div class="pg-media"><video class="v-inline" muted loop playsinline preload="metadata" poster="${esc(bl.poster || '')}" src="${esc(bl.src)}"></video></div>${bl.caption ? `<figcaption>${esc(bl.caption)}</figcaption>` : ''}</figure>`;
  }
  return '';
}
/* each word in its own span so the narrator can light it up; w0 is the word's index in the whole book */
const words = (text, w0) => w0 == null ? esc(text) : text.split(/\s+/).filter(Boolean).map((w, i) => `<span class="w" data-w="${w0 + i}">${esc(w)}</span>`).join(' ');
function pageHTML(book, page, idx, total) {
  const dir = book.lang === 'fa' ? 'rtl' : 'ltr';
  if (!page || page.blank) return `<div class="page page--blank" dir="${dir}"></div>`;
  if (page.cover) return `<div class="page page--cover" dir="${dir}">${coverHTML(book, true)}</div>`;
  if (page.video) { const v = page.video; return `<div class="page page--video" dir="${dir}"><video playsinline muted preload="auto" poster="${esc(v.poster || '')}" src="${esc(v.src)}"></video>${v.caption ? `<div class="page__vcap">${esc(v.caption)}</div>` : ''}<div class="vend"><div class="vend__card"><div class="vend__title">ویدئو تمام شد</div><button class="vend__next">ورق بزنید <svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg></button><button class="vend__replay"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4"/></svg>دوباره ببینم</button></div></div><button class="vmute" aria-label="صدا" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path class="vmute__on" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="vmute__off" d="m17 9 4 6M21 9l-4 6"/></svg></button><div class="page__num">${book.lang === 'fa' ? faNum(idx) : idx}</div></div>`; }
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
  if (book.narration) { let n = 0; for (const b of queue) if (['h', 'p', 'quote'].includes(b.t)) { b.w0 = n; n += b.text.split(/\s+/).filter(Boolean).length; } }
  while (queue.length) {
    const bl = queue.shift();
    if (bl.t === 'video' && bl.full) { flush(); pages.push({ video: bl }); continue; } // a full-bleed video is a page of its own
    if (bl.t === 'break') { flush(); continue; } // start a new page (e.g. a picture or clip with its text)
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
        queue.unshift({ ...bl, text: words.slice(lo).join(' '), cont: true, w0: bl.w0 == null ? undefined : bl.w0 + lo });
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
    this.book = book; store.set('last', book.id);
    document.body.classList.add('is-reading');
    $('#library').hidden = true; $('#reader').hidden = false;
    $('#rd-title').textContent = book.title;
    $('#rd-voice').hidden = true; Narrator.load(book);
    $('#reader').classList.toggle('voice-mode', !!book.narration); $('#player').hidden = !book.narration; // audio books: the toolbar becomes a player
    this.applySettings();
    const pr = store.get('progress.' + book.id, null);
    this.index = pr ? pr.page : 0;
    this.layout(true);
  },
  close() {
    Narrator.stop();
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
      for (const pg of this.pages) { const m = pg.html && [...pg.html.matchAll(/data-w="(\d+)"/g)]; if (m && m.length) { pg.w0 = +m[0][1]; pg.w1 = +m[m.length - 1][1]; } }
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
    Narrator.onPage();
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
    $('#reader').classList.remove('cue-next');
    $$('#book .v-inline').forEach(v => v.play().catch(() => {})); // clips inside a text page play silently beside the words
    $$('#book .page--video video').forEach(v => {
      const page = v.closest('.page--video');
      v.addEventListener('ended', () => { page.classList.add('is-ended'); $('#reader').classList.add('cue-next'); });
      page.querySelector('.vend__next').addEventListener('click', e => { e.stopPropagation(); this.go(1); });
      page.querySelector('.vend__replay').addEventListener('click', e => { e.stopPropagation(); page.classList.remove('is-ended'); $('#reader').classList.remove('cue-next'); v.currentTime = 0; v.play().catch(() => {}); });
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
/* ---------- Narrator: read-along audio, the current word lights up and pages turn by themselves ---------- */
const Narrator = {
  book: null, audio: null, words: null, on: false, waiting: false, cur: -1, raf: null,
  load(book) {
    if (this.book === book) return; this.stop(); this.book = book; this.words = null; this.cur = -1;
    if (!book.narration) { this.audio = null; return; }
    this.audio = new Audio(book.narration + '.mp3'); this.audio.preload = 'auto';
    this.audio.addEventListener('ended', () => this.stop());
    ['timeupdate', 'loadedmetadata', 'durationchange'].forEach(ev => this.audio.addEventListener(ev, () => this.ui()));
    fetch(book.narration + '.json').then(r => r.json()).then(d => { this.words = d.words; this.ui(); }).catch(() => {});
  },
  at(t) { const w = this.words; let lo = 0, hi = w.length - 1, i = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (w[m][0] <= t) { i = m; lo = m + 1; } else hi = m - 1; } return i; },
  /* light up word i, and the line of text it belongs to; everything else on the page dims */
  mark(i) {
    $$('#book .w.is-on').forEach(el => el.classList.remove('is-on'));
    $$('#book .is-reading').forEach(el => el.classList.remove('is-reading'));
    const el = i >= 0 && $(`#book .pagebox .w[data-w="${i}"]`);
    if (el) { el.classList.add('is-on'); (el.closest('.pg-q > span') || el.closest('.pg-p, .pg-h, .pg-q')).classList.add('is-reading'); }
    $('#reader').classList.toggle('is-narrating', i >= 0 && !!el);
  },
  /* jump in time (±15 s or the seek bar), and bring the page that holds that moment */
  seek(t) {
    if (!this.audio || !this.words) return;
    t = Math.max(0, Math.min(t, (this.audio.duration || 1e9) - .05)); this.audio.currentTime = t;
    const i = Math.max(0, this.at(t)); this.cur = i;
    const k = Reader.pages.findIndex(p => p.w0 != null && i >= p.w0 && i <= p.w1);
    if (k >= 0 && k !== Reader.index) { if (this.waiting) { this.waiting = false; this.on = true; this.audio.play().catch(() => {}); this.loop(); } Reader.jump(k); }
    this.mark(i); this.ui();
  },
  loop() { cancelAnimationFrame(this.raf); const tick = () => { this.tick(); if (this.on) this.raf = requestAnimationFrame(tick); }; tick(); },
  ui() {
    if (!this.audio) return;
    const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return faNum(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')); };
    const d = this.audio.duration || 0, t = this.audio.currentTime || 0;
    $('#pl-cur').textContent = fmt(t); $('#pl-dur').textContent = fmt(d);
    if (!this.dragging) $('#pl-seek').value = d ? Math.round(1000 * t / d) : 0;
    $('#pl-fill').style.width = (d ? 100 * t / d : 0) + '%';
  },
  toggle() { this.on || this.waiting ? this.pause() : this.play(); },
  seekToPage(pg) { if (pg && pg.w0 != null) { this.audio.currentTime = this.words[pg.w0][0]; this.cur = pg.w0; return true; } return false; },
  play() {
    if (!this.audio || !this.words) { setTimeout(() => this.words && this.play(), 300); return; }
    const pg = Reader.pages[Reader.index];
    if (!pg || pg.w0 == null) { // cover, video: start with the first page that has words
      const nxt = Reader.pages.slice(Reader.index).find(p => p.w0 != null); if (nxt) this.seekToPage(nxt); else return;
    } else if (this.cur < pg.w0 || this.cur > pg.w1) this.seekToPage(pg);
    this.audio.play().catch(() => {}); this.on = true; this.waiting = false; this.button(); this.loop();
  },
  pause() { if (this.audio) this.audio.pause(); this.on = false; this.waiting = false; cancelAnimationFrame(this.raf); this.button(); },
  stop() { this.pause(); this.cur = -1; this.mark(-1); },
  button() {
    const b = $('#rd-voice'); b.setAttribute('aria-pressed', this.on); b.classList.toggle('is-waiting', this.waiting);
    const p = $('#pl-play'); p.setAttribute('aria-pressed', this.on); p.setAttribute('aria-label', this.on ? 'توقف' : 'پخش'); p.classList.toggle('is-waiting', this.waiting);
  },
  tick() {
    const i = this.at(this.audio.currentTime);
    if (i !== this.cur || !$('#book .w.is-on')) { this.cur = i; this.mark(i); }
    const pg = Reader.pages[Reader.index];
    if (pg && i >= 0 && pg.w1 != null && i > pg.w1 && !Reader.curl) Reader.go(1); // the voice has moved on: turn the page
  },
  /* after a page turn: a page without words (video) pauses the voice until the reader moves on; a text page resumes in place */
  onPage() {
    if (!this.audio || (!this.on && !this.waiting)) return;
    const pg = Reader.pages[Reader.index];
    if (!pg || pg.w0 == null) { if (this.on) { this.audio.pause(); this.on = false; this.waiting = true; cancelAnimationFrame(this.raf); this.button(); } return; }
    if (this.waiting || this.cur < pg.w0 || this.cur > pg.w1) { this.seekToPage(pg); this.play(); }
    else this.mark(this.cur);
  }
};

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
    $('#dt-info').innerHTML = [['نوع محتوا', b.kind.map(k => KIND[k]).join('، ')], ['زبان', b.lang === 'fa' ? 'فارسی' : 'انگلیسی'], b.subtitle ? ['مجموعه', b.subtitle] : null, ['پیشرفت', pct ? `${faNum(pct)}٪` : 'شروع نشده'], b.narration ? ['روایت صوتی', 'دارد — متن همراه صدا روشن می‌شود'] : null].filter(Boolean)
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
  $('#rd-voice').addEventListener('click', () => Narrator.toggle());
  $('#pl-play').addEventListener('click', () => Narrator.toggle());
  $('#pl-back').addEventListener('click', () => Narrator.seek(Narrator.audio.currentTime - 15));
  $('#pl-fwd').addEventListener('click', () => Narrator.seek(Narrator.audio.currentTime + 15));
  $('#pl-prev').addEventListener('click', () => Reader.go(-1));
  $('#pl-next').addEventListener('click', () => Reader.go(1));
  const seekBar = $('#pl-seek');
  seekBar.addEventListener('input', () => { Narrator.dragging = true; const d = Narrator.audio.duration || 0; $('#pl-fill').style.width = seekBar.value / 10 + '%'; $('#pl-cur').textContent = faNum((s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'))(d * seekBar.value / 1000)); });
  seekBar.addEventListener('change', () => { Narrator.dragging = false; Narrator.seek((Narrator.audio.duration || 0) * seekBar.value / 1000); });
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
