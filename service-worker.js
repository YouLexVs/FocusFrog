const CACHE_NAME = 'focusfrog-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/history.html',
  '/shop.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/frog.png',
  '/assets/logo-trans.png',
  '/assets/logo.png',
  '/assets/gaming.png',
  '/assets/series.png',
  '/assets/sweets.png',
  '/assets/tiktok.png',
  '/assets/house-solid.svg',
  '/assets/cart-shopping-solid.svg',
  '/assets/calendar-days-solid.svg',
  '/assets/chevron-left-solid.svg',
  '/script/app.js',
  '/script/db.js',
  '/style/style.css',
  '/style/shop.css',
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
