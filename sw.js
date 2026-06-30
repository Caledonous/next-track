const CACHE_NAME = 'next-track-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(ASSETS).catch(err => console.warn('cache err', err))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => 
      resp || fetch(e.request).then(r => {
        // Cache à la volée pour offline
        if (r.ok && e.request.method === 'GET') {
          const cl = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cl));
        }
        return r;
      }).catch(() => resp)
    )
  );
});
