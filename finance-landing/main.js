(function () {
  "use strict";

  /* ================= Hero slider ================= */
  const banners = window.HERO_BANNERS || [];
  const interval = window.HERO_INTERVAL || 6000;
  const hero = document.querySelector(".hero");
  const track = document.getElementById("heroTrack");
  const dotsWrap = document.getElementById("heroDots");
  let current = 0;
  let timer = null;
  let paused = false;

  hero.style.setProperty("--interval", interval + "ms");

  const btn = (b, cls) =>
    b && b.label ? `<a href="${b.href || "#"}" class="btn ${cls} btn--lg">${b.label}</a>` : "";

  banners.forEach((b, i) => {
    const slide = document.createElement("div");
    slide.className = "slide" + (b.textOnly ? " slide--image-only" : "");
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${i + 1} از ${banners.length}`);

    const img = `
      <picture>
        ${b.mobileImage ? `<source media="(max-width: 620px)" srcset="${b.mobileImage}">` : ""}
        <img class="slide__bg" src="${b.image}" alt="${(b.title || "").replace(/<[^>]+>/g, "")}"
             ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
      </picture>`;

    const content = b.textOnly
      ? (b.cta && b.cta.href ? `<a class="slide__link" href="${b.cta.href}" aria-label="مشاهده"></a>` : "")
      : `<div class="container slide__content">
           ${b.badge ? `<span class="slide__badge">${b.badge}</span>` : ""}
           ${b.title ? `<h1 class="slide__title">${b.title}</h1>` : ""}
           ${b.text ? `<p class="slide__text">${b.text}</p>` : ""}
           <div class="slide__btns">${btn(b.cta, "btn--primary")}${btn(b.cta2, "btn--ghost")}</div>
         </div>`;

    slide.innerHTML = img + content;
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "hero__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `بنر ${i + 1}`);
    dot.innerHTML = "<i></i>";
    dot.addEventListener("click", () => go(i));
    dotsWrap.appendChild(dot);
  });

  const slides = track.children;
  const dots = dotsWrap.children;

  function go(i) {
    if (!slides.length) return;
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    // restart the dot progress animation
    void dots[current].offsetWidth;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    restart();
  }
  function restart() {
    clearTimeout(timer);
    if (!paused && slides.length > 1) timer = setTimeout(() => go(current + 1), interval);
  }
  function setPaused(p) {
    paused = p;
    hero.classList.toggle("is-paused", p);
    if (p) clearTimeout(timer); else restart();
  }

  if (slides.length) go(0);
  if (slides.length < 2) {
    document.getElementById("heroPrev").hidden = true;
    document.getElementById("heroNext").hidden = true;
    dotsWrap.hidden = true;
  }

  document.getElementById("heroNext").addEventListener("click", () => go(current + 1));
  document.getElementById("heroPrev").addEventListener("click", () => go(current - 1));
  hero.addEventListener("mouseenter", () => setPaused(true));
  hero.addEventListener("mouseleave", () => setPaused(false));
  document.addEventListener("visibilitychange", () => setPaused(document.hidden));
  hero.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(current + 1);   // RTL: left = next
    if (e.key === "ArrowRight") go(current - 1);
  });

  // swipe on touch devices
  let sx = 0, sy = 0;
  hero.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx > 0 ? current + 1 : current - 1);
  });

  /* ================= Ticker (demo prices) ================= */
  const symbols = [
    ["EURUSD", 1.0862, 4], ["GBPUSD", 1.2714, 4], ["USDJPY", 151.42, 2], ["XAUUSD", 2384.2, 2],
    ["BTCUSD", 67410, 0], ["ETHUSD", 3512, 1], ["US30", 39120, 0], ["NAS100", 18340, 0],
    ["USOIL", 78.35, 2], ["AUDUSD", 0.6612, 4]
  ];
  const tickerEl = document.getElementById("ticker");
  const state = symbols.map(([name, price, dp]) => ({ name, price, open: price, dp }));
  const fmt = (n, dp) => n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

  function renderTicker() {
    const html = state.map((s) => {
      const chg = ((s.price - s.open) / s.open) * 100;
      const cls = chg >= 0 ? "up" : "down";
      return `<div class="tick"><span>${s.name}</span><b class="${cls}">${fmt(s.price, s.dp)}</b>
              <span class="chg ${cls}">${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%</span></div>`;
    }).join("");
    tickerEl.innerHTML = html + html; // duplicated for seamless loop
  }
  state.forEach((s) => (s.price = s.open * (1 + (Math.random() - 0.5) * 0.01)));
  renderTicker();
  setInterval(() => {
    state.forEach((s) => (s.price *= 1 + (Math.random() - 0.5) * 0.0008));
    renderTicker();
  }, 2500);

  /* ================= Platform chart ================= */
  const svg = document.getElementById("chartSvg");
  if (svg) {
    const W = 400, H = 220, n = 32;
    let pts = [];
    for (let i = 0; i < n; i++) pts.push(190 - (i / n) * 130 + Math.sin(i * 0.7) * 16 + (Math.random() - 0.5) * 12);
    const candles = pts.map((c, i) => {
      const o = i ? pts[i - 1] : c + 6;
      const x = (i + 0.5) * (W / n);
      const hi = Math.min(o, c) - Math.random() * 10, lo = Math.max(o, c) + Math.random() * 10;
      const up = c < o; // y axis inverted
      const color = up ? "#22c55e" : "#f43f5e";
      return `<line x1="${x}" x2="${x}" y1="${hi}" y2="${lo}" stroke="${color}" stroke-width="1.2"/>
              <rect x="${x - 4}" y="${Math.min(o, c)}" width="8" height="${Math.max(2, Math.abs(o - c))}" fill="${color}" rx="1"/>`;
    }).join("");
    const line = pts.map((p, i) => `${i ? "L" : "M"}${(i + 0.5) * (W / n)} ${p - 14}`).join(" ");
    svg.innerHTML = `
      <defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7bff" stop-opacity=".35"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></linearGradient></defs>
      ${[40, 90, 140, 190].map((y) => `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.05)"/>`).join("")}
      <path d="${line} L${W} ${H} L0 ${H}Z" fill="url(#ar)" stroke="none"/>
      <path d="${line}" stroke="#4fd1c5" stroke-width="1.5" fill="none" stroke-dasharray="4 4" opacity=".6"/>
      ${candles}`;

    const buy = document.getElementById("buyPrice"), sell = document.getElementById("sellPrice");
    let gold = 2384.2;
    setInterval(() => {
      gold += (Math.random() - 0.5) * 1.6;
      buy.textContent = fmt(gold, 2);
      sell.textContent = fmt(gold - 0.15, 2);
    }, 1500);
  }

  /* ================= Tabs ================= */
  document.querySelectorAll(".tab").forEach((t) =>
    t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("is-active", x === t));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === t.dataset.tab));
    })
  );

  /* ================= Counters + reveal ================= */
  const faNum = (n) => n.toLocaleString("fa-IR");
  function count(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    const start = performance.now(), dur = 1600;
    (function step(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = faNum(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.dataset.count) count(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal, [data-count]").forEach((el, i) => {
    if (el.classList.contains("reveal")) el.style.transitionDelay = (i % 4) * 0.08 + "s";
    io.observe(el);
  });

  /* ================= Header / menu / to-top ================= */
  const header = document.querySelector(".header");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", scrollY > 20);
    toTop.classList.toggle("is-visible", scrollY > 700);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toggleMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  document.getElementById("year").textContent = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());
})();
