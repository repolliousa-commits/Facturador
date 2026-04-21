self.addEventListener('install', (e) => {
  console.log('SW instalado');
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Pass-through para evitar bloqueos durante desarrollo
  e.respondWith(fetch(e.request));
});
