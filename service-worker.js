const CACHE_NAME = 'focusfrog-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/history.html',
  '/shop.html',
  '/assets/frog.png',
  '/assets/logo-trans.png',
  '/assets/logo/png',
  '/script/app.js',
  '/script/db.js',
  '/style/style.css',
  '/style/shop.css',
  '/style/history.css'
];

self.addEventListener('install', (event) => {
  console.log('[Service worker] Instalacja...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});


self.addEventListener('activate', (event) => {
  console.log('[Service worker] Aktywowany!');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('/api/decompose')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});
