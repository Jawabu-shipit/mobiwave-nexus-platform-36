// Mobiwave Nexus Platform Service Worker
const CACHE_NAME = 'mobiwave-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/mobiwave-og-image.jpg',
  '/src/main.tsx',
  '/src/App.tsx'
];

// Install event - precache key resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service worker pre-caching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force waiting service worker to become active
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('Service worker removing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Claim clients so the SW is in control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network with caching strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML pages - network-first strategy
  if (event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              // Return cached response or offline page
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // For images, scripts, styles - cache-first strategy
  if (
    event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico)$/) ||
    event.request.headers.get('Accept')?.includes('image') ||
    event.request.url.includes('/assets/')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached response or fetch from network and cache
          return cachedResponse || fetch(event.request)
            .then((response) => {
              // Cache the new response
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
              return response;
            })
            .catch((error) => {
              console.error('Fetch failed for asset:', error);
              // For images, return a fallback
              if (event.request.headers.get('Accept')?.includes('image')) {
                return new Response(
                  '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">' +
                  '<rect width="400" height="300" fill="#eee" />' +
                  '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14px" fill="#999">Image not available</text>' +
                  '</svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
              throw error;
            });
        })
    );
    return;
  }

  // For API requests - network-only strategy with timeout
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });

    event.respondWith(
      Promise.race([
        fetch(event.request.clone()),
        timeoutPromise
      ])
      .catch(() => {
        // Return a custom response for API failures
        return new Response(
          JSON.stringify({ error: 'Network error', offline: true }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Default strategy - stale-while-revalidate
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response immediately
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update cache with fresh response
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch((error) => {
            console.warn('Fetch failed:', error);
            // If there's a cached response, we already returned it
            // If not, this will propagate the error
            if (!cachedResponse) {
              throw error;
            }
          });

        return cachedResponse || fetchPromise;
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      data: {
        url: data.url || '/'
      },
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Mobiwave Notification', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        const url = event.notification.data?.url || '/';
        
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new window
        return clients.openWindow(url);
      })
  );
});

// Periodic background sync for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(
      // Update cached content
      fetch('/')
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            return cache.put('/', response);
          });
        })
        .catch(error => {
          console.error('Periodic sync failed:', error);
        })
    );
  }
});