// Simple Service Worker: precache core assets and enable offline-first navigation
const CACHE_NAME = 'dky-tools-v6';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/tools/index.js',
  '/tools/us-stocks.js',
  '/tools/ideabox.js',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }
  // Navigation requests: serve from cache first, fallback to network
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(request))
    );
    return;
  }
  // For same-origin requests, try cache first then network
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
});
