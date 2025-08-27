const CACHE_NAME = 'mediastacks-gp-v2';
const CORE_ASSETS = [
  'index.html','styles.css','manifest.webmanifest','offline.html',
  'src/app.js','src/router.js','src/store.js','src/config.js',
  'src/views/home.js','src/views/catalogue.js','src/views/profil.js','src/views/communaute.js','src/views/detail.js',
  'src/api/anilist.js','src/api/tmdb.js',
  'icons/icon-192.png','icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(request); } catch (e) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('offline.html')) || new Response('Offline');
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      cache.put(request, fresh.clone());
      return fresh;
    } catch (e) {
      return cached || Response.error();
    }
  })());
});
