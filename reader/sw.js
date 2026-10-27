/* ورق — service worker: app shell cached for offline reading (videos stream from the network) */
const CACHE = 'varagh-v2';
const SHELL = ['./', 'index.html', 'app.html', 'manifest.webmanifest', 'assets/css/reader.css', 'assets/js/books.js', 'assets/js/flip.js', 'assets/js/app.js', 'assets/fonts/Vazirmatn-Variable.woff2', 'assets/icon-192.png', 'assets/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* network first so updates show up right away; the cache is the offline fallback */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
