# 9.3 Service Workers

Service Workers act as proxy servers between the browser and network, enabling offline functionality, background sync, and push notifications. This chapter covers registration, lifecycle, caching strategies, and advanced features.

---

## 9.3.1 Service Worker Overview

### What Are Service Workers?

```javascript
// Service Workers:
// - Run in background, separate from pages
// - Act as network proxy
// - Enable offline functionality
// - Support push notifications
// - Enable background sync
// - Cannot access DOM directly
// - Require HTTPS (except localhost)

// Use cases:
// - Offline-first applications
// - Caching and performance
// - Push notifications
// - Background data sync
// - Periodic background sync
```

### Check Support

```javascript
if ('serviceWorker' in navigator) {
  console.log('Service Workers supported');
}
```

---

## 9.3.2 Registration

### Basic Registration

```javascript
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration.scope);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}
```

### Registration Options

```javascript
navigator.serviceWorker.register('/sw.js', {
  scope: '/app/',           // Limit to /app/ path
  updateViaCache: 'none'    // Always fetch fresh SW
});
```

### Registration Object

```javascript
const registration = await navigator.serviceWorker.register('/sw.js');

// Properties
console.log(registration.scope);
console.log(registration.active);     // Active SW
console.log(registration.waiting);    // Waiting SW
console.log(registration.installing); // Installing SW

// Update manually
await registration.update();

// Unregister
await registration.unregister();
```

---

## 9.3.3 Lifecycle

### Lifecycle Events

```javascript
// sw.js
// 1. Install - first time or new version
self.addEventListener('install', (event) => {
  console.log('Installing...');
  
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

// 2. Activate - when taking control
self.addEventListener('activate', (event) => {
  console.log('Activating...');
  
  event.waitUntil(
    // Clean old caches
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'v1')
            .map(key => caches.delete(key))
      );
    })
  );
});

// 3. Fetch - intercept requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Skip Waiting

```javascript
// sw.js
self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(clients.claim());
});
```

### Update Flow

```javascript
// main.js
navigator.serviceWorker.register('/sw.js').then(registration => {
  // Check for updates
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New version available
          showUpdateNotification();
        }
      }
    });
  });
});

// Listen for controller change
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // Page now controlled by new SW
  window.location.reload();
});
```

---

## 9.3.4 Fetch Interception

### Basic Fetch Handler

```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    handleFetch(event.request)
  );
});

async function handleFetch(request) {
  // Try cache first
  const cached = await caches.match(request);
  if (cached) return cached;
  
  // Then network
  return fetch(request);
}
```

### Request Information

```javascript
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  console.log('URL:', request.url);
  console.log('Method:', request.method);
  console.log('Mode:', request.mode);        // navigate, cors, no-cors
  console.log('Destination:', request.destination);  // document, image, script
  
  // Handle based on request type
  if (request.destination === 'image') {
    event.respondWith(handleImage(request));
  }
});
```

---

## 9.3.5 Caching Strategies

### Cache First (Cache Falling Back to Network)

```javascript
// Best for: static assets
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

### Network First (Network Falling Back to Cache)

```javascript
// Best for: frequently updated content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

### Stale While Revalidate

```javascript
// Best for: balance of freshness and speed
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('dynamic').then(cache => {
      return cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
        
        return cached || fetchPromise;
      });
    })
  );
});
```

### Cache Only

```javascript
// Best for: offline-only resources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
  );
});
```

### Network Only

```javascript
// Best for: non-cacheable requests
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

---

## 9.3.6 Cache API

### Opening and Adding

```javascript
// Open cache
const cache = await caches.open('my-cache-v1');

// Add single item
await cache.add('/styles.css');

// Add multiple items
await cache.addAll([
  '/',
  '/app.js',
  '/styles.css',
  '/offline.html'
]);

// Put custom response
await cache.put('/api/data', new Response(JSON.stringify(data)));
```

### Matching and Retrieving

```javascript
// Match from specific cache
const cache = await caches.open('my-cache');
const response = await cache.match(request);

// Match from any cache
const response = await caches.match(request);

// Match options
const response = await cache.match(request, {
  ignoreSearch: true,    // Ignore query string
  ignoreMethod: true,    // Match any method
  ignoreVary: true       // Ignore Vary header
});
```

### Deleting

```javascript
// Delete item from cache
await cache.delete('/old-resource');

// Delete entire cache
await caches.delete('old-cache-v1');

// Delete old caches
const keys = await caches.keys();
await Promise.all(
  keys.filter(key => key !== 'current-cache')
      .map(key => caches.delete(key))
);
```

---

## 9.3.7 Clients API

### Get Connected Clients

```javascript
// sw.js
self.addEventListener('fetch', async (event) => {
  // Get all clients
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: false
  });
  
  clients.forEach(client => {
    client.postMessage('Hello from SW!');
  });
});
```

### Open Window

```javascript
// sw.js (e.g., in notification click)
self.addEventListener('notificationclick', (event) => {
  event.waitUntil(
    clients.openWindow('/notifications')
  );
});
```

### Focus Window

```javascript
self.addEventListener('notificationclick', (event) => {
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Focus existing window or open new
      for (const client of windowClients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});
```

---

## 9.3.8 Push Notifications

### Subscribe to Push

```javascript
// main.js
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  // Send subscription to server
  await fetch('/api/push-subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}
```

### Handle Push Event

```javascript
// sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Notification' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png',
      data: data.url
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
```

---

## 9.3.9 Background Sync

### Register Sync

```javascript
// main.js
async function syncData() {
  const registration = await navigator.serviceWorker.ready;
  
  try {
    await registration.sync.register('sync-data');
    console.log('Sync registered');
  } catch (error) {
    console.error('Sync registration failed');
  }
}
```

### Handle Sync Event

```javascript
// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get queued data from IndexedDB
  const pendingRequests = await getPendingRequests();
  
  for (const request of pendingRequests) {
    await fetch(request.url, request.options);
    await removePendingRequest(request.id);
  }
}
```

### Periodic Background Sync

```javascript
// main.js
const registration = await navigator.serviceWorker.ready;
await registration.periodicSync.register('update-content', {
  minInterval: 24 * 60 * 60 * 1000  // Once per day
});
```

```javascript
// sw.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});
```

---

## 9.3.10 Complete Example

### Offline-First App

```javascript
// sw.js
const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        
        return fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});
```

---

## 9.3.11 Summary

### Lifecycle Events

| Event | When |
|-------|------|
| `install` | First install or update |
| `activate` | Taking control |
| `fetch` | Network request |

### Caching Strategies

| Strategy | Best For |
|----------|----------|
| Cache First | Static assets |
| Network First | Dynamic content |
| Stale While Revalidate | Balanced freshness |
| Cache Only | Offline resources |
| Network Only | Real-time data |

### Key Methods

| Method | Purpose |
|--------|---------|
| `skipWaiting()` | Activate immediately |
| `clients.claim()` | Control all pages |
| `event.waitUntil()` | Extend event lifetime |
| `event.respondWith()` | Provide response |

### Best Practices

1. **Version your caches** for clean updates
2. **Use skipWaiting carefully** — may break pages
3. **Handle offline gracefully** with fallback pages
4. **Clean old caches** on activate
5. **Test offline thoroughly**
6. **Use Workbox** for complex caching

---

**End of Chapter 9.3: Service Workers**

Next chapter: **9.4 Worklets** — covers specialized worker types.
