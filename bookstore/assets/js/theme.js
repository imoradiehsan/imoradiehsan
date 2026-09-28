/* Folio & Co. — color templates.
   Each template gives three brand colors; every shade the UI uses (buttons, tints, dark surfaces…)
   is derived from them and written as CSS custom properties on <html>. Loaded in <head> so there is no flash.
   The visitor's pick is remembered in localStorage; everyone else sees SITE_CONFIG.defaultTheme. */

const THEMES = {
  teal:    { fa: 'سبزآبی',  en: 'Teal',        primary: '#0F7C82', secondary: '#68A936', accent: '#F4B323', surface: '#F7F8F2' },
  crimson: { fa: 'قرمز',    en: 'Crimson',     primary: '#D6293E', secondary: '#0E9AA7', accent: '#FFB400' },
  navy:    { fa: 'سرمه‌ای', en: 'Navy & Gold', primary: '#1C2F5E', secondary: '#2F8A5B', accent: '#D99A2B' },
  violet:  { fa: 'بنفش',    en: 'Violet',      primary: '#5B3FC4', secondary: '#D6457B', accent: '#FFC247' },
  orange:  { fa: 'نارنجی',  en: 'Orange',      primary: '#C2410C', secondary: '#2F9E44', accent: '#FAB005' },
  forest:  { fa: 'جنگلی',   en: 'Forest',      primary: '#2D6A4F', secondary: '#BC6C25', accent: '#E9C46A' }
};

const Theme = (() => {
  const hex = h => h.replace('#', '').match(/../g).map(x => parseInt(x, 16));
  const toHex = rgb => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const W = '#ffffff', K = '#000000';

  function vars(th) {
    const p = th.primary, s = th.secondary, a = th.accent;
    return {
      '--primary-950': mix(p, K, .55), '--primary-900': mix(p, K, .35), '--primary-800': mix(p, K, .18),
      '--primary-700': p, '--primary-600': mix(p, W, .15), '--primary-100': mix(p, W, .82), '--primary-50': mix(p, W, .92),
      '--secondary-800': mix(s, K, .38), '--secondary-700': mix(s, K, .22), '--secondary-500': s,
      '--secondary-100': mix(s, W, .82), '--secondary-50': mix(s, W, .92),
      '--gold-300': mix(a, W, .45), '--gold-400': mix(a, W, .2), '--gold-500': a, '--gold-600': mix(a, K, .12),
      '--on-accent': lum(a) > .4 ? '#1f2328' : '#ffffff',
      '--bg-alt': th.surface || mix(p, W, .955),
      '--focus': p
    };
  }

  function stored() { try { return localStorage.getItem('folio.theme'); } catch { return null; } }
  const current = () => { const s = SITE_CONFIG.showThemeSwitcher ? stored() : null; return THEMES[s] ? s : (THEMES[SITE_CONFIG.defaultTheme] ? SITE_CONFIG.defaultTheme : 'teal'); };

  function apply(id, save) {
    const th = THEMES[id]; if (!th) return;
    const root = document.documentElement;
    Object.entries(vars(th)).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.theme = id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', th.primary);
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.href = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${th.primary}"/><path d="M16 10c-2-2-5-2.5-9-2.5v15c4 0 7 .5 9 2.5 2-2 5-2.5 9-2.5v-15c-4 0-7 .5-9 2.5Zm0 0v15" fill="none" stroke="${th.accent}" stroke-width="2" stroke-linejoin="round"/></svg>`);
    if (save) { try { localStorage.setItem('folio.theme', id); } catch { } }
    document.dispatchEvent(new CustomEvent('theme:change', { detail: id }));
  }

  apply(current(), false);
  return { apply, current, vars };
})();
