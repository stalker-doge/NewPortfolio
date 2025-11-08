// Service Worker for Lucian Matan Portfolio
// Provides offline functionality and performance optimization

const CACHE_NAME = 'portfolio-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/admin/css/admin.css',
  '/js/script.js',
  '/js/github-api.js',
  '/admin/js/admin-main.js',
  '/data/projects.json',
  '/robots.txt',
  '/sitemap.xml',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests except for fonts and GitHub API
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('fonts.googleapis.com') && 
      !url.hostname.includes('fonts.gstatic.com') &&
      !url.hostname.includes('api.github.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          // For static assets, always serve from cache
          if (isStaticAsset(request.url)) {
            return cachedResponse;
          }
          
          // For HTML, serve cached version but update in background
          if (request.destination === 'document') {
            updateCache(request);
            return cachedResponse;
          }
        }
        
        // For GitHub API requests, handle network failures gracefully
        if (url.hostname.includes('api.github.com')) {
          return fetch(request)
            .then((response) => {
              // Cache successful API responses for 5 minutes
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return cached version if network fails
              return caches.match(request);
            });
        }
        
        // For other requests, try network first
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              
              // Cache strategy based on content type
              if (shouldCache(request.url)) {
                const cacheName = isStaticAsset(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
                
                caches.open(cacheName)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
            }
            
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return caches.match(request);
          });
      })
  );
});

// Helper functions
function isStaticAsset(url) {
  return url.includes('/css/') || 
         url.includes('/js/') || 
         url.includes('/assets/') || 
         url.includes('/data/') ||
         url.includes('.woff') ||
         url.includes('.woff2') ||
         url.includes('.ttf') ||
         url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.png') ||
         url.includes('.gif') ||
         url.includes('.svg') ||
         url.includes('.ico');
}

function shouldCache(url) {
  // Don't cache admin-related requests
  if (url.includes('/admin/')) {
    return false;
  }
  
  // Cache static assets
  if (isStaticAsset(url)) {
    return true;
  }
  
  // Cache pages
  if (url.includes('.html') || url.endsWith('/')) {
    return true;
  }
  
  // Cache Google Fonts
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    return true;
  }
  
  return false;
}

function updateCache(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch((error) => {
      console.log('Service Worker: Background update failed:', error);
    });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any background sync tasks here
  // For example, syncing cached form submissions when back online
  return Promise.resolve();
}

// Push notification handling (if needed later)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push received:', data);
    
    const options = {
      body: data.body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Portfolio Update', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Cache cleanup on periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    console.log('Service Worker: Periodic cache cleanup');
    event.waitUntil(cleanupCache());
  }
});

function cleanupCache() {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();
  
  return caches.open(DYNAMIC_CACHE)
    .then((cache) => {
      return cache.keys()
        .then((requests) => {
          return Promise.all(
            requests.map((request) => {
              return cache.match(request)
                .then((response) => {
                  if (response) {
                    const dateHeader = response.headers.get('date');
                    if (dateHeader) {
                      const responseDate = new Date(dateHeader).getTime();
                      if (now - responseDate > maxAge) {
                        return cache.delete(request);
                      }
                    }
                  }
                });
            })
          );
        });
    });
}

console.log('Service Worker: Loaded successfully');
