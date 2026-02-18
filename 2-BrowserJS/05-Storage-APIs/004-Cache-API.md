# 5.4 Cache API

The Cache API provides a mechanism for storing HTTP request/response pairs, designed primarily for Service Workers but also available in the main thread. This chapter covers cache operations, caching strategies, and integration with Service Workers.

---

## 5.4.1 Cache API Overview

### What Is the Cache API?

```javascript
// The Cache API:
// - Stores Request/Response pairs
// - Designed for offline-first applications
// - Works in main thread and Service Workers
// - Part of the Service Worker spec
// - Promise-based asynchronous API

// Primary use cases:
// - Caching static assets (HTML, CSS, JS, images)
// - Offline support for web apps
// - Performance optimization
// - Network fallback strategies
```

### Cache API vs Other Storage

| Feature | Cache API | IndexedDB | localStorage |
|---------|-----------|-----------|--------------|
| Data type | Request/Response | Any cloneable | Strings |
| Size limit | Large | Large | ~5MB |
| Use case | HTTP caching | Structured data | Simple data |
| Async | Yes | Yes | No |

---

## 5.4.2 Opening Caches

### caches.open()

```javascript
// Open (or create) a named cache
const cache = await caches.open('my-cache-v1');

// Returns a Cache object
console.log(cache);  // Cache {}
```

### caches.keys()

```javascript
// List all cache names
const cacheNames = await caches.keys();
console.log(cacheNames);  // ['my-cache-v1', 'my-cache-v2']
```

### caches.has()

```javascript
// Check if cache exists
const exists = await caches.has('my-cache-v1');
console.log(exists);  // true or false
```

### caches.delete()

```javascript
// Delete a cache
const deleted = await caches.delete('my-cache-v1');
console.log(deleted);  // true if existed and deleted
```

---

## 5.4.3 Cache Operations

### cache.add()

```javascript
// Fetch and cache a single request
const cache = await caches.open('static-v1');

// Add by URL
await cache.add('/styles/main.css');

// Add by Request object
await cache.add(new Request('/api/data'));

// Fails if fetch fails or non-2xx response
```

### cache.addAll()

```javascript
// Cache multiple resources at once
const cache = await caches.open('static-v1');

await cache.addAll([
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png'
]);

// ⚠️ Fails entirely if any request fails
// All-or-nothing operation
```

### cache.put()

```javascript
// Manually add request/response pair
const cache = await caches.open('dynamic-v1');

// Fetch then put
const response = await fetch('/api/data');
await cache.put('/api/data', response);

// ⚠️ Response can only be used once!
// Clone if you need to use it elsewhere
const response = await fetch('/api/data');
await cache.put('/api/data', response.clone());
return response;

// Create custom response
const customResponse = new Response(
  JSON.stringify({ cached: true }),
  { headers: { 'Content-Type': 'application/json' } }
);
await cache.put('/api/cached', customResponse);
```

### cache.match()

```javascript
// Find matching response
const cache = await caches.open('static-v1');

// Match by URL
const response = await cache.match('/styles/main.css');

if (response) {
  console.log('Cache hit!');
  return response;
} else {
  console.log('Cache miss');
}

// Match by Request
const request = new Request('/api/data');
const response = await cache.match(request);
```

### caches.match()

```javascript
// Search ALL caches for match
const response = await caches.match('/styles/main.css');

// Returns first match found
// More convenient but less explicit
```

### cache.matchAll()

```javascript
// Get all matching responses
const responses = await cache.matchAll('/api/data');

// Useful when multiple versions might exist
console.log(responses.length);
```

### cache.keys()

```javascript
// List all cached requests
const cache = await caches.open('static-v1');
const requests = await cache.keys();

requests.forEach(request => {
  console.log(request.url);
});
```

### cache.delete()

```javascript
// Remove item from cache
const cache = await caches.open('static-v1');

// Delete by URL
const deleted = await cache.delete('/old-file.js');
console.log(deleted);  // true if existed

// Delete by Request
await cache.delete(new Request('/api/data'));
```

---

## 5.4.4 Match Options

### ignoreSearch

```javascript
// Ignore query string when matching
const cache = await caches.open('pages-v1');
await cache.put('/page?v=1', response1);

// Default: won't match different query
const miss = await cache.match('/page?v=2');  // undefined

// With ignoreSearch: matches
const hit = await cache.match('/page?v=2', { ignoreSearch: true });
```

### ignoreMethod

```javascript
// Ignore HTTP method
// Default: GET requests match GET cached responses

// Match POST with cached GET
const response = await cache.match(
  new Request('/api/data', { method: 'POST' }),
  { ignoreMethod: true }
);
```

### ignoreVary

```javascript
// Ignore Vary header
// Default: respects Vary header for cache matching

const response = await cache.match('/api/data', { ignoreVary: true });
```

---

## 5.4.5 Service Worker Integration

### Precaching on Install

```javascript
// In service-worker.js
const CACHE_NAME = 'static-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
```

### Cache-First Strategy

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cache if found
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise fetch from network
        return fetch(event.request);
      })
  );
});
```

### Network-First Strategy

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response before caching
        const responseClone = response.clone();
        
        caches.open('dynamic-v1')
          .then(cache => cache.put(event.request, responseClone));
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});
```

### Stale-While-Revalidate

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('dynamic-v1').then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Start network fetch regardless
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        
        // Return cached immediately, update in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});
```

---

## 5.4.6 Cache Versioning

### Managing Cache Versions

```javascript
const CACHE_VERSION = 'v2';
const CACHE_NAME = `static-${CACHE_VERSION}`;

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('static-'))
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
```

### Multiple Named Caches

```javascript
const CACHES = {
  static: 'static-v2',
  dynamic: 'dynamic-v1',
  images: 'images-v1'
};

// Use appropriate cache for each resource type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname.match(/\.(jpg|png|gif|svg)$/)) {
    event.respondWith(imageStrategy(event.request, CACHES.images));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiStrategy(event.request, CACHES.dynamic));
  } else {
    event.respondWith(staticStrategy(event.request, CACHES.static));
  }
});
```

---

## 5.4.7 Common Patterns

### Offline Fallback

```javascript
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-v1')
      .then(cache => cache.add(OFFLINE_URL))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});
```

### Cache with Size Limit

```javascript
async function cacheLimited(cacheName, request, response, maxItems = 50) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // Remove oldest if at limit
  if (keys.length >= maxItems) {
    await cache.delete(keys[0]);
  }
  
  await cache.put(request, response);
}
```

### Main Thread Usage

```javascript
// Cache API works in main thread too
async function preCacheResources() {
  const cache = await caches.open('prefetch-v1');
  
  // Prefetch resources user might need
  await cache.addAll([
    '/next-page.html',
    '/heavy-image.jpg'
  ]);
}

// Check cache before fetching
async function getFromCacheOrNetwork(url) {
  const cached = await caches.match(url);
  if (cached) return cached;
  
  const response = await fetch(url);
  const cache = await caches.open('dynamic-v1');
  cache.put(url, response.clone());
  
  return response;
}
```

---

## 5.4.8 Gotchas

```javascript
// ❌ Using response without cloning
const response = await fetch('/api/data');
cache.put('/api/data', response);
return response;  // Error: body already used!

// ✅ Clone before caching
const response = await fetch('/api/data');
cache.put('/api/data', response.clone());
return response;

// ❌ Caching opaque responses carelessly
// Cross-origin responses without CORS have opaque type
// They report status 0, can't read body, but CAN be cached
const response = await fetch('https://other-site.com/image.jpg', { mode: 'no-cors' });
// This caches even if response was an error!
cache.put('/fallback', response);

// ✅ Check response status for same-origin
if (response.ok) {
  cache.put(request, response.clone());
}

// ❌ Assuming cache.addAll is partial
await cache.addAll(['/a', '/b', '/c']);
// If /b fails, NOTHING is cached

// ✅ Cache individually if partial success needed
for (const url of urls) {
  try {
    await cache.add(url);
  } catch (e) {
    console.log(`Failed to cache ${url}`);
  }
}

// ❌ Not versioning caches
// Old cached content persists forever

// ✅ Use versioned cache names and cleanup
const CACHE_NAME = 'static-v2';
// Clean old versions on activate
```

---

## 5.4.9 Summary

### CacheStorage Methods

| Method | Description |
|--------|-------------|
| `caches.open(name)` | Open/create cache |
| `caches.match(request)` | Search all caches |
| `caches.has(name)` | Check if cache exists |
| `caches.keys()` | List cache names |
| `caches.delete(name)` | Delete cache |

### Cache Methods

| Method | Description |
|--------|-------------|
| `add(request)` | Fetch and cache |
| `addAll(requests)` | Fetch and cache multiple |
| `put(request, response)` | Store pair directly |
| `match(request)` | Find response |
| `matchAll(request)` | Find all responses |
| `keys()` | List cached requests |
| `delete(request)` | Remove from cache |

### Caching Strategies

| Strategy | Use Case |
|----------|----------|
| Cache-first | Static assets, offline-first |
| Network-first | API data, fresh content |
| Stale-while-revalidate | Balance freshness/speed |
| Network-only | Never cache |
| Cache-only | Pre-cached content only |

### Best Practices

1. **Version your caches** and clean old versions
2. **Clone responses** before caching
3. **Handle failures** in addAll
4. **Use appropriate strategies** for different resources
5. **Limit cache size** for dynamic content

---

**End of Chapter 5.4: Cache API**

Next chapter: **5.5 Storage Manager** — covers the Storage Manager API for checking and managing storage quota.
