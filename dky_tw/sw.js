// Simple Service Worker: precache core assets and enable offline-first navigation
const CACHE_NAME = 'dky-tools-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.js',
  '/app.js',
  '/styles.css',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Navigation requests: serve from cache first, fallback to network
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(request))
    );
    return;
  }
  // For same-origin requests, try cache first then network
  if (new URL(request.url).origin === location.origin) {
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