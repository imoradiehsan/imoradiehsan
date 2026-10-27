/* ورق — موتور ورق‌خوردن واقعی صفحه (page curl)
   Pure DOM: the lifted part of the sheet is a reflection of the page across the fold line,
   rendered with CSS clip-path polygons + an affine transform, plus three gradient shadows
   (on the exposed page beneath, on the bending front, and on the lifted back).

   Geometry works in a "local" frame where the spine is at x = 0 and the free edge at x = W.
   Pages whose spine is on the right are handled by mirroring (M) on the way in and out.

   Usage:
     const curl = new PageCurl({ host, W, H, spineRight, frontHTML, backHTML, corner, startFlipped })
     curl.drag(fingerElPoint)   // during a pointer drag (element coords of the sheet box)
     curl.release(velocityX)    // animates to the nearest end state, then calls onEnd(flipped)
     curl.flipTo(flipped, dur)  // animated flip without a finger (tap / keyboard)
*/
class PageCurl {
  constructor(o) {
    this.W = o.W; this.H = o.H; this.D = Math.hypot(o.W, o.H);
    this.spineRight = !!o.spineRight;
    this.ghost = o.backHTML == null;           // single-page mode: back of the sheet is translucent paper
    this.corner = o.corner === 'top' ? 0 : this.H; // y of the grabbed free corner (local frame)
    this.onEnd = o.onEnd || (() => {});
    this.onProgress = o.onProgress || (() => {});
    // a sheet pulled back in starts off-screen, so the crease (not the corner) follows the finger: 2× gain
    this.gain = o.startFlipped ? 2 : 1;
    this.raf = null; this.done = false;

    const el = document.createElement('div');
    el.className = 'sheet' + (this.ghost ? ' sheet--ghost' : '');
    el.innerHTML = `
      <div class="sheet__front">${o.frontHTML}</div>
      <div class="sheet__shade sheet__shade--under"><div class="shade"></div></div>
      <div class="sheet__shade sheet__shade--front"><div class="shade"></div></div>
      <div class="sheet__back">${this.ghost ? o.frontHTML : o.backHTML}</div>
      <div class="sheet__shade sheet__shade--back"><div class="shade"></div></div>`;
    this.el = el;
    this.front = el.querySelector('.sheet__front');
    this.back = el.querySelector('.sheet__back');
    this.shUnder = el.querySelector('.sheet__shade--under');
    this.shFront = el.querySelector('.sheet__shade--front');
    this.shBack = el.querySelector('.sheet__shade--back');
    // media inside the lifted copy must not play or load twice
    this.back.querySelectorAll('video, audio').forEach(v => { const d = document.createElement('div'); d.className = 'pg-media-ghost'; if (v.poster) d.style.backgroundImage = `url("${v.poster}")`; v.replaceWith(d); });
    el.querySelectorAll('.shade').forEach(s => { const S = this.D * 2.2; s.style.width = S + 'px'; s.style.height = S + 'px'; });
    o.host.appendChild(el);

    this.C = { x: this.W, y: this.corner };                  // free corner (local)
    this.F = o.startFlipped ? { x: -this.W, y: this.corner } : { ...this.C };
    this.render();
  }

  /* ---- frame helpers ---- */
  L(p) { return this.spineRight ? { x: this.W - p.x, y: p.y } : { x: p.x, y: p.y }; } // local <-> element (involution)
  static mul(A, B) { // CSS matrix(a,b,c,d,e,f) composition A∘B
    return { a: A.a * B.a + A.c * B.b, b: A.b * B.a + A.d * B.b, c: A.a * B.c + A.c * B.d, d: A.b * B.c + A.d * B.d,
      e: A.a * B.e + A.c * B.f + A.e, f: A.b * B.e + A.d * B.f + A.f };
  }
  static apply(T, p) { return { x: T.a * p.x + T.c * p.y + T.e, y: T.b * p.x + T.d * p.y + T.f }; }
  static css(T) { return `matrix(${[T.a, T.b, T.c, T.d, T.e, T.f].map(v => +v.toFixed(5)).join(',')})`; }
  static poly(pts) { return pts.length < 3 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + pts.map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(',') + ')'; }
  static clip(poly, f) { // keep the part where f(P) >= 0 (Sutherland–Hodgman against one half-plane)
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
    }
    return out;
  }

  /* The paper cannot stretch: the corner stays within reach of both spine corners. */
  clamp(F) {
    const W = this.W, H = this.H, cy = this.corner;
    const h1 = { x: 0, y: cy }, h2 = { x: 0, y: H - cy };
    let P = { x: Math.min(F.x, W), y: F.y };
    for (let i = 0; i < 4; i++) {
      for (const [h, r] of [[h1, W], [h2, this.D]]) {
        const dx = P.x - h.x, dy = P.y - h.y, d = Math.hypot(dx, dy);
        if (d > r) P = { x: h.x + dx * r / d, y: h.y + dy * r / d };
      }
    }
    return P;
  }

  get progress() { return Math.min(1, Math.max(0, (this.W - this.F.x) / (2 * this.W))); }

  render() {
    const W = this.W, H = this.H, C = this.C, F = this.F;
    const dx = F.x - C.x, dy = F.y - C.y, len = Math.hypot(dx, dy);
    const Lm = { a: -1, b: 0, c: 0, d: 1, e: W, f: 0 }, I = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    const Lmat = this.spineRight ? Lm : I;              // local -> element
    const Cmat = (this.ghost === this.spineRight) ? Lm : I; // content -> local (see derivation in README)

    if (len < 0.5) { // sheet lies flat
      this.front.style.clipPath = 'none';
      this.back.style.display = 'none';
      [this.shUnder, this.shFront, this.shBack].forEach(s => s.style.display = 'none');
      this.el.style.setProperty('--shade', 0);
      this.onProgress(0);
      return;
    }
    const n = { x: dx / len, y: dy / len }, Mid = { x: (C.x + F.x) / 2, y: (C.y + F.y) / 2 };
    const k = Mid.x * n.x + Mid.y * n.y;
    const side = p => (p.x - Mid.x) * n.x + (p.y - Mid.y) * n.y;
    const rect = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }];
    const frontPoly = PageCurl.clip(rect, p => side(p));        // still flat
    const liftPoly = PageCurl.clip(rect, p => -side(p));        // lifted (original position)
    const R = { a: 1 - 2 * n.x * n.x, b: -2 * n.x * n.y, c: -2 * n.x * n.y, d: 1 - 2 * n.y * n.y, e: 2 * k * n.x, f: 2 * k * n.y };

    const T = PageCurl.mul(Lmat, PageCurl.mul(R, Cmat));
    this.front.style.clipPath = PageCurl.poly(frontPoly.map(p => PageCurl.apply(Lmat, p)));
    this.back.style.display = '';
    this.back.style.transform = PageCurl.css(T);
    this.back.style.clipPath = PageCurl.poly(liftPoly.map(p => PageCurl.apply(Cmat, p)));

    // shadows (element frame)
    const MidE = PageCurl.apply(Lmat, Mid), nE = { x: this.spineRight ? -n.x : n.x, y: n.y };
    const ang = Math.atan2(nE.y, nE.x) * 180 / Math.PI;
    const place = (wrap, poly) => {
      wrap.style.display = '';
      wrap.style.clipPath = PageCurl.poly(poly);
      const s = wrap.firstElementChild, S = this.D * 2.2;
      s.style.transform = `translate(${(MidE.x - S / 2).toFixed(2)}px,${(MidE.y - S / 2).toFixed(2)}px) rotate(${ang.toFixed(3)}deg)`;
    };
    place(this.shUnder, liftPoly.map(p => PageCurl.apply(Lmat, p)));
    place(this.shFront, frontPoly.map(p => PageCurl.apply(Lmat, p)));
    place(this.shBack, liftPoly.map(p => PageCurl.apply(Lmat, PageCurl.apply(R, p))));

    const pr = this.progress, amt = Math.sin(Math.PI * pr);
    this.el.style.setProperty('--shade', amt.toFixed(3));
    this.el.style.setProperty('--sw', (20 + 90 * amt).toFixed(1) + 'px');
    this.onProgress(pr);
  }

  /* ---- interaction ---- */
  beginDrag(elPt) { this.cancelAnim(); this.F0 = { ...this.F }; this.P0 = this.L(elPt); this.lastT = performance.now(); this.vx = 0; }
  drag(elPt) {
    const p = this.L(elPt), now = performance.now();
    const F = this.clamp({ x: this.F0.x + (p.x - this.P0.x) * this.gain, y: this.F0.y + (p.y - this.P0.y) * this.gain });
    const dt = Math.max(1, now - this.lastT); this.vx = 0.7 * this.vx + 0.3 * ((F.x - this.F.x) / dt); this.lastT = now;
    this.F = F; this.render();
  }
  release() {
    const flick = Math.abs(this.vx) > 0.35;
    const flipped = flick ? this.vx < 0 : this.progress > 0.5;
    this.flipTo(flipped, 420 + 300 * (flipped ? 1 - this.progress : this.progress));
  }
  flipTo(flipped, dur = 900) {
    this.cancelAnim();
    const from = { ...this.F }, to = { x: flipped ? -this.W : this.W, y: this.corner };
    const dist = Math.abs(to.x - from.x) / (2 * this.W), lift = (this.corner === 0 ? 1 : -1) * this.H * 0.32 * dist;
    const t0 = performance.now(), ease = t => 1 - Math.pow(1 - t, 3);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) dur = Math.min(dur, 160);
    const step = now => {
      const t = Math.min(1, (now - t0) / dur), e = ease(t);
      this.F = this.clamp({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e + Math.sin(Math.PI * t) * lift });
      this.render();
      if (t < 1) this.raf = requestAnimationFrame(step);
      else { this.raf = null; this.done = true; this.onEnd(flipped); }
    };
    this.raf = requestAnimationFrame(step);
  }
  cancelAnim() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = null; }
  destroy() { this.cancelAnim(); this.el.remove(); }
}
