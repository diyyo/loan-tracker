// (c) diyyo 2025 MIT License
const CACHE_NAME = 'diyyo-loan-v1.1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/auth.js',
  '/js/config.js',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Klaim kontrol segera
  return self.clients.claim();
});

// Listen for version check messages
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_VERSION') {
    fetch('/version.json')
      .then(response => response.json())
      .then(data => {
        if (data.version !== CACHE_NAME.split('-v')[1]) {
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'NEW_VERSION',
                version: data.version
              });
            });
          });
        }
      })
      .catch(error => console.error('Error checking version:', error));
  }
}); 