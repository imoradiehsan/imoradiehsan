/* Shared behaviour for every Ghesta landing page:
 * - builds web-app links (keeps UTM params), analytics events, header/menu, trust badges, reveal-on-scroll */
(function () {
  "use strict";
  const C = window.GHESTA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fa = (n, opts) => Number(n).toLocaleString("fa-IR", opts);

  /* ---------- UTM persistence ---------- */
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"];
  let utm = {};
  try { utm = JSON.parse(sessionStorage.getItem("ghesta_utm") || "{}"); } catch (e) { /* storage blocked */ }
  const qs = new URLSearchParams(location.search);
  UTM_KEYS.forEach((k) => { if (qs.get(k)) utm[k] = qs.get(k); });
  try { sessionStorage.setItem("ghesta_utm", JSON.stringify(utm)); } catch (e) { /* ignore */ }

  /** Build a web-app URL for a path, keeping UTM params + extra params. */
  function appUrl(path, extra) {
    const u = new URL((C.webappUrl || "").replace(/\/$/, "") + (path || "/"));
    Object.entries(utm).forEach(([k, v]) => u.searchParams.set(k, v));
    Object.entries(extra || {}).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  }
  function withUtm(href) {
    try {
      const u = new URL(href, location.href);
      Object.entries(utm).forEach(([k, v]) => u.searchParams.set(k, v));
      return u.toString();
    } catch (e) { return href; }
  }

  /* ---------- Analytics ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, params) {
    const payload = Object.assign({ event }, params || {});
    window.dataLayer.push(payload);
    if (qs.has("debug_analytics")) console.info("[analytics]", payload);
  }

  /* ---------- Hydrate links ---------- */
  function hydrate(root) {
    $$("[data-app]", root).forEach((a) => {
      const key = a.dataset.app;
      a.href = appUrl(key === "login" ? C.loginPath || "/login" : key);
    });
    $$("[data-svc]", root).forEach((a) => {
      const p = (C.services || {})[a.dataset.svc];
      if (p) a.href = appUrl(p);
    });
    $$("[data-merchant]", root).forEach((a) => { if (C.merchantSignupUrl) a.href = withUtm(C.merchantSignupUrl); });
    $$("[data-war]", root).forEach((a) => { if (C.warAdvisoryUrl) a.href = withUtm(C.warAdvisoryUrl); });
  }
  hydrate(document);

  // generic click tracking
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track], [data-svc]");
    if (!el) return;
    if (el.dataset.track) track(el.dataset.track, { location: el.dataset.loc || "" });
    if (el.dataset.svc && el.closest("#daily, .mock__grid")) track("service_card_click", { service: el.dataset.svc });
  });

  /* ---------- Trust badges ---------- */
  function renderTrust(target) {
    if (!target) return;
    const items = C.trustBadges || [];
    if (!items.length) { target.closest("section, div").hidden = true; return; }
    target.innerHTML = items.map((b) => `
      <a class="trust__item" href="${b.href || "#"}" target="_blank" rel="noopener" referrerpolicy="origin">
        ${b.logo ? `<img src="${b.logo}" alt="" loading="lazy" width="36" height="36">`
                 : `<span class="trust__logo"><svg class="ico"><use href="#i-shield"/></svg></span>`}
        <span><b>${b.name}</b><small>${b.sub || ""}</small></span>
      </a>`).join("");
  }
  renderTrust($("#trustList"));
  renderTrust($("#footerTrust"));

  /* ---------- Header / menu ---------- */
  const header = $(".header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger"), nav = $("#nav");
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
    burger.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) {
    burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
    $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    matchMedia("(min-width: 1241px)").addEventListener("change", () => setMenu(false));
  }

  /* ---------- Mobile bar ---------- */
  const mbar = $("#mbar");
  if (mbar) mbar.classList.add("is-visible");

  /* ---------- Reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("is-in"));

  /* ---------- FAQ tracking ---------- */
  $$(".faq details").forEach((d, i) => d.addEventListener("toggle", () => { if (d.open) track("faq_open", { question: i + 1 }); }));

  /* ---------- Year (Persian calendar) ---------- */
  const y = $("#year");
  if (y) y.textContent = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date()).replace(/[^۰-۹]/g, "");

  window.Ghesta = { C, $, $$, fa, appUrl, track, hydrate };
})();
