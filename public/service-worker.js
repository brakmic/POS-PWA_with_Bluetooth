// This is a development service worker with image caching capabilities

console.log('Custom service worker loaded in development mode');

self.addEventListener('install', (event) => {
  console.log('Installing development service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Development service worker activated');
  return self.clients.claim();
});

// Basic fetch handler with caching for product images
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Only cache product images
  if (event.request.destination === 'image' && url.pathname.includes('/images/products/')) {
    event.respondWith(
      caches.open('product-images').then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log('Serving cached product image:', url.pathname);
            return response;
          }
          
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              console.log('Caching new product image:', url.pathname);
              cache.put(event.request, networkResponse.clone());
            } else {
              console.warn(`Error fetching image: ${url.pathname}, status: ${networkResponse.status}`);
            }
            return networkResponse;
          }).catch(error => {
            console.error(`Failed to fetch: ${url.pathname}`, error);
            throw error;
          });
        });
      }).catch((error) => {
        console.error('Cache error:', error);
        return fetch(event.request);
      })
    );
  }
});
