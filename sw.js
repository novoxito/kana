const CACHE = 'kana-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles.css',
  './icon.svg',
  './js/app.js',
  './js/data.js',
  './js/store.js',
  './js/srs.js',
  './js/ui.js',
  './js/mode-flashcard.js',
  './js/mode-choice.js',
  './js/mode-typing.js',
  './js/mode-drawing.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok && new URL(e.request.url).origin === location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
