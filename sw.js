const CACHE = 'kana-pwa-v5';
const POKE_CACHE = 'kana-pwa-poke-v1';

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
  './js/pokemon.js',
  './js/mode-flashcard.js',
  './js/mode-choice.js',
  './js/mode-typing.js',
  './js/mode-drawing.js',
  './js/mode-pokedex.js',
];

const POKE_HOSTS = new Set([
  'pokeapi.co',
  'raw.githubusercontent.com',
]);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE && k !== POKE_CACHE)
        .map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Cross-origin Pokémon assets: cache-first
  if (POKE_HOSTS.has(url.hostname)) {
    e.respondWith(
      caches.open(POKE_CACHE).then(cache =>
        cache.match(e.request).then(hit => {
          if (hit) return hit;
          return fetch(e.request).then(resp => {
            if (resp && resp.ok) cache.put(e.request, resp.clone());
            return resp;
          }).catch(() => hit);
        })
      )
    );
    return;
  }

  // HTML navigations and the root: network-first (so updates land quickly)
  const isHTML = e.request.mode === 'navigate'
    || url.pathname.endsWith('.html')
    || url.pathname === '/' || url.pathname.endsWith('/kana/');

  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Other same-origin assets: cache-first with network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok && url.origin === location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
