// Service Worker for PixCraftAI - Performance Optimization
const CACHE_NAME = 'pixcraftai-v1';
const STATIC_ASSETS = [
  '/',
  '/favicon-512x512.png',
  '/logo.png',
  '/new-logo.png',
  '/robots.txt',
  '/site.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses for static assets
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Only cache static assets and images
                  if (event.request.url.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff|woff2)$/)) {
                    cache.put(event.request, responseClone);
                  }
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Return offline fallback if available
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});