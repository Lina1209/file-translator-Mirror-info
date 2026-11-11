/* Mirror-info PWA service worker */
const CACHE = 'mirror-info-v1';
const ASSETS = [
  './',
  './index.html',
  './book.html',
  './account.html',
  './admin.html',
  './style.css',
  './api.js',
  './app.js',
  './calculator.js',
  './order.js',
  './translate-core.js',
  './admin.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          // cache successful same-origin responses
          try {
            const url = new URL(req.url);
            if (res.ok && url.origin === self.location.origin) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
          } catch (e) {}
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
