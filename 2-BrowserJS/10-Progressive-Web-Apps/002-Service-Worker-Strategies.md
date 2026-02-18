# 10.2 Service Worker Strategies

Service Worker caching strategies determine how your PWA handles network requests. This chapter covers various caching strategies, their implementation, and when to use each.

---

## 10.2.1 Caching Strategies Overview

### Available Strategies

```javascript
// Primary caching strategies:
// 1. Cache First (Cache Falling Back to Network)
// 2. Network First (Network Falling Back to Cache)
// 3. Stale While Revalidate
// 4. Cache Only
// 5. Network Only

// Strategy selection depends on:
// - Content type (static vs dynamic)
// - Freshness requirements
// - Offline support needs
// - Performance priorities
```

---

## 10.2.2 Cache First

### Implementation

```javascript
// sw.js
// Best for: static assets (CSS, JS, images, fonts)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached response if available
      if (cached) {
        return cached;
      }
      
      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Clone and cache new response
        if (response.ok) {
          const clone = response.clone();
          caches.open('cache-v1').then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
```

### When to Use

```javascript
// ✅ Good for:
// - Versioned static assets
// - Fonts
// - Images that don't change
// - Third-party libraries

// ❌ Avoid for:
// - API responses
// - User-specific content
// - Time-sensitive data
```

---

## 10.2.3 Network First

### Implementation

```javascript
// sw.js
// Best for: frequently updated content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful response
        if (response.ok) {
          const clone = response.clone();
          caches.open('dynamic-cache').then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(event.request);
      })
  );
});
```

### With Timeout

```javascript
// Network first with timeout
async function networkFirstWithTimeout(request, timeout = 3000) {
  const cache = await caches.open('dynamic-cache');
  
  try {
    // Race between network and timeout
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), timeout)
      )
    ]);
    
    // Cache successful response
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
```

### When to Use

```javascript
// ✅ Good for:
// - Articles and blog posts
// - Social media feeds
// - News content
// - Non-critical API data

// ❌ Avoid for:
// - Large static assets
// - Rarely changing content
```

---

## 10.2.4 Stale While Revalidate

### Implementation

```javascript
// sw.js
// Best for: balance of speed and freshness
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('swr-cache').then((cache) => {
      return cache.match(event.request).then((cached) => {
        // Fetch from network (in background)
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
        
        // Return cached immediately, or wait for network
        return cached || fetchPromise;
      });
    })
  );
});
```

### With Notification

```javascript
// SWR with update notification
async function staleWhileRevalidate(request) {
  const cache = await caches.open('swr-cache');
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const oldResponse = await cache.match(request);
      await cache.put(request, response.clone());
      
      // Check if content changed
      if (oldResponse) {
        const oldData = await oldResponse.text();
        const newData = await response.clone().text();
        
        if (oldData !== newData) {
          // Notify clients of update
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'content-updated',
              url: request.url
            });
          });
        }
      }
    }
    return response;
  });
  
  return cached || fetchPromise;
}
```

### When to Use

```javascript
// ✅ Good for:
// - User profiles
// - Settings
// - Frequently accessed data
// - Avatar images

// ❌ Avoid for:
// - Real-time data
// - Transaction data
```

---

## 10.2.5 Cache Only

### Implementation

```javascript
// sw.js
// Best for: offline-only resources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
  );
});
```

### Precached Resources

```javascript
// Cache during install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('static-v1').then((cache) => {
      return cache.addAll([
        '/offline.html',
        '/app-shell.html',
        '/styles/main.css',
        '/scripts/app.js'
      ]);
    })
  );
});

// Serve only from cache
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/app-shell.html')
    );
  }
});
```

---

## 10.2.6 Network Only

### Implementation

```javascript
// sw.js
// Best for: non-cacheable requests
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

### Use Cases

```javascript
// Network only for specific requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Always fetch from network
  if (
    url.pathname.startsWith('/api/transactions') ||
    url.pathname.startsWith('/api/auth') ||
    event.request.method !== 'GET'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Other strategies for other requests...
});
```

---

## 10.2.7 Combined Strategies

### Strategy Router

```javascript
// sw.js
const CACHE_NAME = 'app-v1';

// Route requests to different strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Static assets - Cache First
  if (url.pathname.match(/\.(css|js|png|jpg|svg|woff2)$/)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  
  // API calls - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // HTML pages - Stale While Revalidate
  if (event.request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
  
  // Default - Network with cache fallback
  event.respondWith(networkFirst(event.request));
});

// Strategy implementations
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request).then(response => {
    caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  });
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}
```

---

## 10.2.8 Offline Fallbacks

### Offline Page

```javascript
// Install offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-v1').then((cache) => {
      return cache.addAll([
        '/offline.html',
        '/offline.css',
        '/offline.js'
      ]);
    })
  );
});

// Serve offline page for navigation failures
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});
```

### Fallback Images

```javascript
const FALLBACK_IMAGE = '/images/offline-placeholder.png';

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).catch(() => {
          return caches.match(FALLBACK_IMAGE);
        });
      })
    );
  }
});
```

---

## 10.2.9 Cache Management

### Cache Versioning

```javascript
const CACHE_VERSION = 'v2';
const CACHES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`
};

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => !Object.values(CACHES).includes(key))
            .map((key) => caches.delete(key))
      );
    })
  );
});
```

### Cache Size Limits

```javascript
// Limit cache entries
async function limitCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    // Remove oldest entries (FIFO)
    await Promise.all(
      keys.slice(0, keys.length - maxEntries)
          .map(key => cache.delete(key))
    );
  }
}

// Limit cache age
async function expireOldEntries(cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const now = Date.now();
  
  for (const request of keys) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();
      if (now - responseDate > maxAgeSeconds * 1000) {
        await cache.delete(request);
      }
    }
  }
}
```

---

## 10.2.10 Summary

### Strategy Comparison

| Strategy | Speed | Freshness | Offline |
|----------|-------|-----------|---------|
| Cache First | ⚡⚡⚡ | ⭐ | ✅ |
| Network First | ⚡ | ⭐⭐⭐ | ✅ |
| Stale While Revalidate | ⚡⚡⚡ | ⭐⭐ | ✅ |
| Cache Only | ⚡⚡⚡ | ⭐ | ✅ |
| Network Only | ⚡ | ⭐⭐⭐ | ❌ |

### Strategy Selection

| Content Type | Recommended Strategy |
|--------------|---------------------|
| Static assets | Cache First |
| API data | Network First |
| User content | Stale While Revalidate |
| Auth tokens | Network Only |
| App shell | Cache Only |

### Best Practices

1. **Match strategy to content** type and freshness needs
2. **Provide offline fallbacks** for critical pages
3. **Version your caches** for clean updates
4. **Limit cache size** to prevent storage issues
5. **Test offline thoroughly**
6. **Consider using Workbox** for complex strategies

---

**End of Chapter 10.2: Service Worker Strategies**

Next chapter: **10.3 App Installation** — covers PWA installation prompts and events.
