/* Home page behaviour: hero slider, dashboard mockup, service tabs, live data, calculator */
(function () {
  "use strict";
  const { C, $, $$, fa, appUrl, track, hydrate } = window.Ghesta;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= Hero slider ================= */
  (function heroSlider() {
    const hero = $("#hero"), track_ = $("#heroTrack");
    const banners = C.heroBanners || [];

    banners.forEach((b) => {
      const s = document.createElement("div");
      const tone = b.tone || "blue";
      s.className = `slide slide--${tone}${b.fullImage ? " slide--full" : ""}`;
      s.setAttribute("role", "group");
      s.setAttribute("aria-roledescription", "slide");
      const href = b.cta && b.cta.href ? (b.cta.href.startsWith("app:") ? appUrl(b.cta.href.slice(4)) : b.cta.href) : "";
      const pic = `<picture>
          ${b.mobileImage ? `<source media="(max-width: 768px)" srcset="${b.mobileImage}">` : ""}
          <img src="${b.image}" alt="${b.alt || ""}" loading="lazy" decoding="async">
        </picture>`;
      if (b.fullImage) {
        s.innerHTML = `<a class="slide__full" href="${href || "#"}" ${b.cta && b.cta.track ? `data-track="${b.cta.track}" data-loc="hero"` : ""}>${pic}</a>`;
      } else {
        const btnCls = tone === "gold" ? "btn--gold" : "btn--primary";
        s.innerHTML = `
          <div class="slide__grid">
            <div class="slide__text">
              ${b.eyebrow ? `<span class="eyebrow eyebrow--${tone}">${b.eyebrow}</span>` : ""}
              ${b.title ? `<h2 class="slide__title">${b.title}</h2>` : ""}
              ${b.text ? `<p class="hero__lead">${b.text}</p>` : ""}
              <div class="hero__ctas">
                ${href ? `<a class="btn ${btnCls} btn--lg" href="${href}" ${b.cta.track ? `data-track="${b.cta.track}" data-loc="hero"` : ""}>${b.cta.label}</a>` : ""}
                <a class="btn btn--soft btn--lg" data-app="login" href="#" data-track="cta_login_click" data-loc="hero">ورود به قسطا</a>
              </div>
            </div>
            <div class="slide__art">${pic}</div>
          </div>`;
      }
      track_.appendChild(s);
    });
    hydrate(track_);

    const slides = Array.from(track_.children);
    const total = slides.length;
    if (total < 2) return;

    const dotsWrap = $("#heroDots"), toggle = $("#heroToggle");
    $("#heroControls").hidden = false;
    const interval = C.heroInterval || 7000;
    hero.style.setProperty("--interval", interval + "ms");
    let i = 0, timer = null, userPaused = reduceMotion, hoverPaused = false;

    slides.forEach((s, n) => {
      s.setAttribute("aria-label", `${fa(n + 1)} از ${fa(total)}`);
      const d = document.createElement("button");
      d.className = "hero__dot";
      d.setAttribute("aria-label", `اسلاید ${fa(n + 1)}`);
      d.innerHTML = "<i></i>";
      d.addEventListener("click", () => go(n));
      dotsWrap.appendChild(d);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      slides.forEach((s, n) => {
        const on = n === i;
        s.classList.toggle("is-active", on);
        s.toggleAttribute("inert", !on);
        s.setAttribute("aria-hidden", String(!on));
      });
      dots.forEach((d, n) => {
        d.classList.remove("is-active");
        d.removeAttribute("aria-current");
        if (n === i) { void d.offsetWidth; d.classList.add("is-active"); d.setAttribute("aria-current", "true"); }
        d.classList.toggle("no-anim", userPaused);
      });
    }
    function schedule() {
      clearTimeout(timer);
      const paused = userPaused || hoverPaused;
      hero.classList.toggle("is-paused", paused);
      if (!paused) timer = setTimeout(() => go(i + 1), interval);
    }
    function go(n) { i = (n + total) % total; render(); schedule(); }
    function setUserPaused(p) {
      userPaused = p;
      toggle.setAttribute("aria-label", p ? "پخش نمایش خودکار" : "توقف نمایش خودکار");
      toggle.querySelector("use").setAttribute("href", p ? "#i-play" : "#i-pause");
      render(); schedule();
    }

    $("#heroNext").addEventListener("click", () => go(i + 1));
    $("#heroPrev").addEventListener("click", () => go(i - 1));
    toggle.addEventListener("click", () => setUserPaused(!userPaused));
    // pause while the user interacts with the hero (mouse or keyboard focus)
    hero.addEventListener("mouseenter", () => { hoverPaused = true; schedule(); });
    hero.addEventListener("mouseleave", () => { hoverPaused = false; schedule(); });
    hero.addEventListener("focusin", () => { hoverPaused = true; schedule(); });
    hero.addEventListener("focusout", (e) => { if (!hero.contains(e.relatedTarget)) { hoverPaused = false; schedule(); } });
    document.addEventListener("visibilitychange", () => { hoverPaused = document.hidden; schedule(); });

    // swipe (RTL: swipe right → next)
    let sx = 0, sy = 0;
    track_.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; hoverPaused = true; schedule(); }, { passive: true });
    track_.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      hoverPaused = false;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx > 0 ? i + 1 : i - 1); else schedule();
    });

    if (reduceMotion) setUserPaused(true); else go(0);
  })();

  /* ================= Dashboard mockup ================= */
  (function mockup() {
    const box = $("#balance"); if (!box) return;
    const data = {
      wallet: { label: "موجودی کیف پول", value: 12450000, unit: "تومان" },
      credit: { label: "اعتبار خرید باقی‌مانده", value: 35000000, unit: "تومان" },
      gold:   { label: "موجودی طلا", value: 4.215, unit: "گرم", digits: 3 }
    };
    const amount = $("#balanceAmount"), label = $("#balanceLabel"), eye = $("#balanceEye");
    let kind = "wallet", hidden = false;
    function render() {
      const d = data[kind];
      label.textContent = d.label;
      const txt = hidden ? "••••••" : fa(d.value, { minimumFractionDigits: d.digits || 0, maximumFractionDigits: d.digits || 0 });
      amount.innerHTML = `${txt}<small>${d.unit}</small>`;
      box.dataset.kind = kind;
    }
    $$(".balance__tab", box).forEach((t) => t.addEventListener("click", () => {
      kind = t.dataset.kind;
      $$(".balance__tab", box).forEach((x) => x.setAttribute("aria-selected", String(x === t)));
      render();
    }));
    eye.addEventListener("click", () => {
      hidden = !hidden;
      eye.setAttribute("aria-pressed", String(hidden));
      eye.setAttribute("aria-label", hidden ? "نمایش مبلغ" : "مخفی کردن مبلغ");
      eye.querySelector("use").setAttribute("href", hidden ? "#i-eye-off" : "#i-eye");
      render();
    });
    render();
  })();

  /* ================= Service tabs ================= */
  (function tabs() {
    const list = $("#svcTabs"); if (!list) return;
    const tabs = $$('[role="tab"]', list);
    function select(name, focus) {
      tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        if (on) { panel.classList.remove("is-in"); void panel.offsetWidth; panel.classList.add("is-in"); }
        if (on && focus) t.focus();
        if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
      track("tab_view", { tab: name });
    }
    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.tab)));
    list.addEventListener("keydown", (e) => {
      const idx = tabs.indexOf(document.activeElement);
      if (idx < 0) return;
      let n = null;
      if (e.key === "ArrowLeft") n = idx + 1;          // RTL
      if (e.key === "ArrowRight") n = idx - 1;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(tabs[(n + tabs.length) % tabs.length].dataset.tab, true);
    });
    $$("[data-open-tab]").forEach((a) => a.addEventListener("click", () => select(a.dataset.openTab)));
  })();

  /* ================= Live data (only shown when the API answers) ================= */
  async function getJSON(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw 0; return await r.json(); }
    finally { clearTimeout(t); }
  }
  if (C.api && C.api.goldPrice) {
    getJSON(C.api.goldPrice).then((d) => {
      if (!d || !d.price) return;
      $("#goldPrice").innerHTML = `${fa(d.price)} <small style="display:inline;font-size:13px">تومان</small>`;
      if (typeof d.change === "number") {
        const ch = $("#goldChange");
        ch.hidden = false;
        ch.className = "tag " + (d.change >= 0 ? "tag--green" : "tag--sample");
        ch.textContent = `${d.change >= 0 ? "+" : "−"}${fa(Math.abs(d.change), { maximumFractionDigits: 2 })}٪ امروز`;
      }
    }).catch(() => {});
  }
  if (C.api && C.api.cashback) {
    getJSON(C.api.cashback).then((list) => {
      if (!Array.isArray(list)) return;
      const rows = $$("#merchantList .merchant");
      list.slice(0, rows.length).forEach((m, n) => {
        const row = rows[n];
        if (m.name) row.querySelector("b").textContent = m.name;
        if (m.category) row.querySelector("small").textContent = m.category;
        if (typeof m.percent === "number") row.querySelector("[data-cb]").innerHTML = `<span class="tag tag--green">${fa(m.percent)}٪ بازگشت وجه</span>`;
      });
    }).catch(() => {});
  }

  /* ================= Calculator ================= */
  (function calculator() {
    const cfg = C.calculator; if (!cfg) return;
    const range = $("#calcAmount"), out = $("#calcAmountOut"), chips = $("#calcMonths");
    range.min = cfg.minAmount; range.max = cfg.maxAmount; range.step = cfg.step; range.value = cfg.defaultAmount;
    range.setAttribute("aria-valuetext", "");
    $("#calcMin").textContent = fa(cfg.minAmount / 1e6) + " میلیون";
    $("#calcMax").textContent = fa(cfg.maxAmount / 1e6) + " میلیون";
    let months = cfg.defaultMonths;

    chips.innerHTML = cfg.months.map((m) =>
      `<button class="chip num" role="radio" aria-checked="${m === months}" tabindex="${m === months ? 0 : -1}" data-m="${m}">${fa(m)} ماه</button>`).join("");
    const chipEls = $$(".chip", chips);
    function pick(m, focus) {
      months = m;
      chipEls.forEach((c) => { const on = +c.dataset.m === m; c.setAttribute("aria-checked", String(on)); c.tabIndex = on ? 0 : -1; if (on && focus) c.focus(); });
      update(true);
    }
    chipEls.forEach((c) => c.addEventListener("click", () => pick(+c.dataset.m)));
    chips.addEventListener("keydown", (e) => {
      const idx = chipEls.indexOf(document.activeElement); if (idx < 0) return;
      let n = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = idx + 1;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") n = idx - 1;
      if (n === null) return;
      e.preventDefault();
      pick(+chipEls[(n + chipEls.length) % chipEls.length].dataset.m, true);
    });

    let debounce;
    function update(user) {
      const P = +range.value, r = cfg.monthlyRate, n = months;
      const monthly = r > 0 ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
      const m = Math.round(monthly / 1000) * 1000;
      out.innerHTML = `${fa(P)} <small>تومان</small>`;
      range.setAttribute("aria-valuetext", `${fa(P)} تومان`);
      range.style.setProperty("--p", ((P - cfg.minAmount) / (cfg.maxAmount - cfg.minAmount)) * 100 + "%");
      $("#calcMonthly").textContent = fa(m);
      $("#calcTotal").textContent = fa(m * n);
      $("#calcCount").textContent = `${fa(n)} قسط`;
      $("#calcCta").href = appUrl(cfg.calcPath, { amount: P, months: n });
      if (user) {
        clearTimeout(debounce);
        debounce = setTimeout(() => track("calculator_change", { amount: P, months: n }), 600);
      }
    }
    range.addEventListener("input", () => update(true));
    update(false);
  })();
})();
