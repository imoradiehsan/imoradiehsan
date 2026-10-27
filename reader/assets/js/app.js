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
        <div class="book-card__meta"><span>${faNum(b.minutes)} دقیقه مطالعه</span>${pct ? `<span>${faNum(pct)}٪ خوانده شده</span>` : '<span>شروع نشده</span>'}</div>
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
  if (page.end) return `<div class="page page--end" dir="${dir}"><div class="page__inner"><div class="end"><div class="end__mark">❦</div><div class="end__title">${book.lang === 'fa' ? 'پایان' : 'The End'}</div><div class="end__sub">${esc(book.title)} — ${esc(book.author)}</div><a class="btn" href="#">${book.lang === 'fa' ? 'بازگشت به کتابخانه' : 'Back to library'}</a></div></div></div>`;
  const num = book.lang === 'fa' ? faNum(idx) : idx;
  return `<div class="page" dir="${dir}"><div class="page__inner">${page.html}</div><div class="page__num">${num}</div><div class="page__run">${esc(book.title)}</div></div>`;
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
    this.updateHud();
    store.set('progress.' + b.id, { page: i, total: n });
  },
  updateHud() {
    const n = this.pages.length, i = this.index, fa = this.rtl;
    $('#rd-count').textContent = fa ? `${faNum(i + 1)} / ${faNum(n)}` : `${i + 1} / ${n}`;
    const sl = $('#rd-slider'); sl.max = n - 1; sl.value = i;
    $('#rd-slider').setAttribute('aria-valuetext', `${i + 1} / ${n}`);
    $('#rd-pct').style.width = (100 * i / (n - 1)) + '%';
  },
  pauseMedia() { $$('#book video').forEach(v => v.pause()); },
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
        if (moved) this.index += dirn * (this.mode === 'single' ? 1 : 2);
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
      if (e.target.closest('video, a, button, input, .end')) return;
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
function route() {
  const m = location.hash.match(/^#book\/([\w-]+)/);
  const b = m && BOOKS.find(x => x.id === m[1]);
  if (b) { if (Reader.book !== b) Reader.open(b); }
  else if (Reader.book) Reader.close();
  else renderLibrary();
}
addEventListener('hashchange', route);
addEventListener('resize', () => { if (Reader.book) Reader.layout(); });
document.addEventListener('DOMContentLoaded', () => {
  const sat = new URLSearchParams(location.search).get('sat') || (window.self !== window.top ? '48' : '');
  if (sat) document.documentElement.style.setProperty('--sat', sat + 'px');
  Reader.bindGestures();
  $('#rd-back').addEventListener('click', () => { location.hash = ''; });
  $('#rd-prev').addEventListener('click', () => Reader.go(-1));
  $('#rd-next').addEventListener('click', () => Reader.go(1));
  $('#rd-slider').addEventListener('input', e => Reader.jump(+e.target.value));
  $('#rd-font-up').addEventListener('click', () => { settings.font = Math.min(1.5, +(settings.font + 0.1).toFixed(2)); saveSettings(); Reader.applySettings(); Reader.layout(); });
  $('#rd-font-down').addEventListener('click', () => { settings.font = Math.max(0.8, +(settings.font - 0.1).toFixed(2)); saveSettings(); Reader.applySettings(); Reader.layout(); });
  $('#rd-night').addEventListener('click', () => { settings.night = !settings.night; saveSettings(); Reader.applySettings(); });
  $('#rd-layout').addEventListener('click', () => { settings.layout = { auto: 'single', single: 'spread', spread: 'auto' }[settings.layout]; saveSettings(); Reader.applySettings(); Reader.layout(); });
  route();
});
