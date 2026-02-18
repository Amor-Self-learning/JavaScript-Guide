# 10.1 Web App Manifest

The Web App Manifest is a JSON file that defines how a Progressive Web App (PWA) appears when installed on a user's device. This chapter covers manifest structure, icons, display modes, and installation configuration.

---

## 10.1.1 Manifest Overview

### What Is a Web App Manifest?

```javascript
// The manifest.json file:
// - Defines app name, icons, colors
// - Controls how app appears when installed
// - Enables "Add to Home Screen"
// - Makes app installable
// - Provides native-like experience
```

### Basic Manifest

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3f51b5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Linking Manifest

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Link manifest in HTML head -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Also set theme color for browsers -->
  <meta name="theme-color" content="#3f51b5">
</head>
</html>
```

---

## 10.1.2 Core Properties

### Name Properties

```json
{
  "name": "My Progressive Web Application",
  "short_name": "MyPWA"
}
```

```javascript
// name: Full application name
// - Used on install prompts
// - Used on splash screens
// - Maximum ~45 characters recommended

// short_name: Abbreviated name
// - Used on home screen
// - Used where space is limited
// - Maximum ~12 characters recommended
```

### Start URL

```json
{
  "start_url": "/",
  "scope": "/"
}
```

```javascript
// start_url: URL opened when app launches
// - Can include query parameters for analytics
// - Example: "/?utm_source=homescreen"

// scope: Defines navigation scope
// - URLs outside scope open in browser
// - Defaults to start_url directory
```

### Description

```json
{
  "description": "A progressive web app for managing tasks efficiently.",
  "categories": ["productivity", "utilities"]
}
```

---

## 10.1.3 Icons

### Required Icons

```json
{
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Maskable Icons

```json
{
  "icons": [
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-any.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-both.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

```javascript
// purpose values:
// - "any": Default, used anywhere
// - "maskable": Safe zone icon for adaptive icons
// - "monochrome": Single-color icon

// Maskable icons should have important content
// within the center 80% (safe zone)
```

### SVG Icons

```json
{
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

---

## 10.1.4 Display Modes

### Available Modes

```json
{
  "display": "standalone"
}
```

| Mode | Description |
|------|-------------|
| `fullscreen` | No browser UI, fills entire screen |
| `standalone` | App-like window, no browser chrome |
| `minimal-ui` | Minimal navigation controls |
| `browser` | Standard browser tab |

### Display Mode Detection

```css
/* CSS media queries for display mode */
@media (display-mode: standalone) {
  /* Styles for installed PWA */
  .browser-only {
    display: none;
  }
}

@media (display-mode: browser) {
  /* Styles for browser tab */
  .install-prompt {
    display: block;
  }
}
```

```javascript
// JavaScript detection
function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;  // iOS Safari
}
```

### Display Override

```json
{
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"]
}
```

---

## 10.1.5 Colors

### Theme and Background

```json
{
  "theme_color": "#3f51b5",
  "background_color": "#ffffff"
}
```

```javascript
// theme_color:
// - Browser toolbar color
// - Task switcher color
// - Status bar color

// background_color:
// - Splash screen background
// - Loading screen before CSS loads
// - Should match app background
```

### Dynamic Theme Color

```html
<!-- Can be changed per page -->
<meta name="theme-color" content="#3f51b5">

<!-- With media queries -->
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
```

---

## 10.1.6 Orientation

### Screen Orientation

```json
{
  "orientation": "portrait"
}
```

| Value | Description |
|-------|-------------|
| `any` | Any orientation |
| `natural` | Natural for device |
| `portrait` | Portrait only |
| `portrait-primary` | Primary portrait |
| `portrait-secondary` | Upside-down portrait |
| `landscape` | Landscape only |
| `landscape-primary` | Primary landscape |
| `landscape-secondary` | Secondary landscape |

---

## 10.1.7 Shortcuts

### App Shortcuts

```json
{
  "shortcuts": [
    {
      "name": "New Task",
      "short_name": "New",
      "description": "Create a new task",
      "url": "/tasks/new",
      "icons": [
        {
          "src": "/icons/new-task.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Today's Tasks",
      "short_name": "Today",
      "description": "View today's tasks",
      "url": "/tasks/today",
      "icons": [
        {
          "src": "/icons/today.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

```javascript
// Shortcuts appear on:
// - Long press on Android
// - Right-click on desktop
// - Jump lists on Windows
```

---

## 10.1.8 Screenshots

### App Screenshots

```json
{
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Home screen showing task list"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile view of tasks"
    }
  ]
}
```

---

## 10.1.9 Related Applications

### Native App Links

```json
{
  "prefer_related_applications": false,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    },
    {
      "platform": "itunes",
      "url": "https://apps.apple.com/app/example-app/id123456789"
    }
  ]
}
```

---

## 10.1.10 Advanced Features

### Share Target

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

### Protocol Handlers

```json
{
  "protocol_handlers": [
    {
      "protocol": "web+myapp",
      "url": "/open?url=%s"
    }
  ]
}
```

### File Handlers

```json
{
  "file_handlers": [
    {
      "action": "/open-file",
      "accept": {
        "text/plain": [".txt"],
        "application/json": [".json"]
      }
    }
  ]
}
```

---

## 10.1.11 Complete Example

### Full Manifest

```json
{
  "name": "Task Manager PWA",
  "short_name": "Tasks",
  "description": "A progressive web app for managing tasks",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#6200ee",
  "background_color": "#ffffff",
  "lang": "en",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "New Task",
      "url": "/new",
      "icons": [{ "src": "/icons/new.png", "sizes": "192x192" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/wide.png",
      "sizes": "1280x720",
      "form_factor": "wide"
    }
  ],
  "categories": ["productivity"]
}
```

---

## 10.1.12 Summary

### Required Fields

| Field | Purpose |
|-------|---------|
| `name` | App name |
| `icons` | App icons (192x192, 512x512 minimum) |
| `start_url` | Launch URL |
| `display` | Display mode |

### Recommended Fields

| Field | Purpose |
|-------|---------|
| `short_name` | Abbreviated name |
| `theme_color` | Browser chrome color |
| `background_color` | Splash screen background |
| `description` | App description |

### Best Practices

1. **Provide multiple icon sizes** for all devices
2. **Include maskable icons** for adaptive icon shapes
3. **Set theme_color** matching your app's brand
4. **Test on multiple devices** and browsers
5. **Validate manifest** using Chrome DevTools
6. **Use absolute URLs** when possible

---

**End of Chapter 10.1: Web App Manifest**

Next chapter: **10.2 Service Worker Strategies** — covers caching strategies for PWAs.
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
# 10.3 App Installation

Progressive Web Apps can be installed on user devices for a native-like experience. This chapter covers the beforeinstallprompt event, custom install prompts, and installation detection.

---

## 10.3.1 Installation Overview

### PWA Installation Requirements

```javascript
// For a PWA to be installable, it needs:
// 1. Valid Web App Manifest with required fields
// 2. HTTPS (or localhost for development)
// 3. Registered Service Worker
// 4. (Chrome) User engagement heuristic met

// Required manifest fields:
// - name or short_name
// - icons (192px and 512px minimum)
// - start_url
// - display (standalone, fullscreen, or minimal-ui)
// - prefer_related_applications not true
```

### Check Installability

```javascript
// Check if app can be installed
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('App is installable!');
});

// Check if already installed
function isInstalled() {
  // Check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // iOS Safari
  if (window.navigator.standalone === true) {
    return true;
  }
  
  return false;
}
```

---

## 10.3.2 beforeinstallprompt Event

### Capturing the Event

```javascript
// Store the event for later use
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent automatic prompt
  event.preventDefault();
  
  // Store for later
  deferredPrompt = event;
  
  // Show your custom install button
  showInstallButton();
});

function showInstallButton() {
  const installButton = document.getElementById('install-btn');
  installButton.style.display = 'block';
}
```

### Using the Deferred Prompt

```javascript
const installButton = document.getElementById('install-btn');

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  // Show the browser's install prompt
  deferredPrompt.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User choice: ${outcome}`);
  // 'accepted' or 'dismissed'
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  // Hide install button
  installButton.style.display = 'none';
});
```

### Event Properties

```javascript
window.addEventListener('beforeinstallprompt', (event) => {
  // Available platforms
  console.log('Platforms:', event.platforms);
  // e.g., ['web', 'play'] for Android
  
  // User choice promise
  event.userChoice.then((result) => {
    console.log('Outcome:', result.outcome);
    console.log('Platform:', result.platform);
  });
});
```

---

## 10.3.3 appinstalled Event

### Detecting Installation

```javascript
window.addEventListener('appinstalled', (event) => {
  console.log('App was installed!');
  
  // Track installation
  analytics.track('pwa_installed');
  
  // Hide install UI
  hideInstallPromotion();
  
  // Show welcome message
  showWelcomeMessage();
});
```

### Complete Installation Flow

```javascript
class InstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = this.checkInstalled();
    
    this.setupEventListeners();
  }
  
  checkInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
  
  setupEventListeners() {
    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallUI();
    });
    
    // Handle installation
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallUI();
      this.onInstalled();
    });
    
    // Handle display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        this.isInstalled = true;
        this.hideInstallUI();
      }
    });
  }
  
  showInstallUI() {
    const banner = document.getElementById('install-banner');
    if (banner && !this.isInstalled) {
      banner.classList.add('visible');
    }
  }
  
  hideInstallUI() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  }
  
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }
  
  onInstalled() {
    console.log('PWA installed successfully');
    // Analytics, welcome message, etc.
  }
}

const installManager = new InstallManager();
```

---

## 10.3.4 Custom Install UI

### Install Banner

```html
<div id="install-banner" class="install-banner">
  <div class="install-content">
    <img src="/icons/icon-48.png" alt="App icon">
    <div class="install-text">
      <h3>Install Our App</h3>
      <p>Get quick access from your home screen</p>
    </div>
  </div>
  <div class="install-actions">
    <button id="install-dismiss">Not now</button>
    <button id="install-accept">Install</button>
  </div>
</div>
```

```css
.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.install-banner.visible {
  transform: translateY(0);
}

.install-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.install-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

#install-accept {
  background: #6200ee;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
```

```javascript
document.getElementById('install-accept').addEventListener('click', async () => {
  const installed = await installManager.promptInstall();
  if (installed) {
    installManager.hideInstallUI();
  }
});

document.getElementById('install-dismiss').addEventListener('click', () => {
  installManager.hideInstallUI();
  // Remember dismissal
  localStorage.setItem('install-dismissed', Date.now());
});
```

### Smart Timing

```javascript
class InstallPromotion {
  constructor(options = {}) {
    this.minPageViews = options.minPageViews || 3;
    this.minVisitDuration = options.minVisitDuration || 30000;
    this.dismissCooldown = options.dismissCooldown || 7 * 24 * 60 * 60 * 1000;
    
    this.startTime = Date.now();
    this.incrementPageViews();
  }
  
  incrementPageViews() {
    const views = parseInt(localStorage.getItem('page-views') || '0');
    localStorage.setItem('page-views', views + 1);
  }
  
  shouldShowPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false;
    }
    
    // Check dismissal cooldown
    const dismissed = parseInt(localStorage.getItem('install-dismissed') || '0');
    if (Date.now() - dismissed < this.dismissCooldown) {
      return false;
    }
    
    // Check minimum page views
    const views = parseInt(localStorage.getItem('page-views') || '0');
    if (views < this.minPageViews) {
      return false;
    }
    
    // Check visit duration
    if (Date.now() - this.startTime < this.minVisitDuration) {
      return false;
    }
    
    return true;
  }
}
```

---

## 10.3.5 iOS Installation

### iOS Safari Limitations

```javascript
// iOS doesn't support beforeinstallprompt
// Must provide manual instructions

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.navigator.standalone === true;
}

function showIOSInstallPrompt() {
  if (isIOS() && !isInStandaloneMode()) {
    // Show custom iOS instructions
    const banner = document.getElementById('ios-install-banner');
    banner.style.display = 'block';
  }
}
```

### iOS Install Instructions

```html
<div id="ios-install-banner" class="ios-banner" style="display: none;">
  <button class="close-btn" onclick="this.parentElement.style.display='none'">&times;</button>
  <p>Install this app on your iPhone:</p>
  <ol>
    <li>Tap the Share button <span class="share-icon">⬆️</span></li>
    <li>Scroll down and tap "Add to Home Screen"</li>
    <li>Tap "Add" to confirm</li>
  </ol>
</div>
```

---

## 10.3.6 Installation Analytics

### Tracking Installation

```javascript
let deferredPrompt;
const installSource = new URLSearchParams(window.location.search).get('source');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Track that prompt was available
  analytics.track('pwa_install_available', {
    source: installSource || 'direct'
  });
});

async function triggerInstall(source) {
  if (!deferredPrompt) return;
  
  // Track prompt shown
  analytics.track('pwa_install_prompt_shown', { source });
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  // Track user choice
  analytics.track('pwa_install_choice', {
    outcome,
    source
  });
  
  deferredPrompt = null;
}

window.addEventListener('appinstalled', () => {
  analytics.track('pwa_installed', {
    source: installSource || 'unknown'
  });
});
```

### Launch Tracking

```javascript
// In manifest.json
// "start_url": "/?source=pwa"

// Track PWA launches
if (window.matchMedia('(display-mode: standalone)').matches) {
  analytics.track('pwa_launch');
}
```

---

## 10.3.7 Related Applications

### Prefer Native App

```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    }
  ]
}
```

### Check Native App

```javascript
// Check if related native app is installed
if ('getInstalledRelatedApps' in navigator) {
  const relatedApps = await navigator.getInstalledRelatedApps();
  
  if (relatedApps.length > 0) {
    console.log('Native app installed:', relatedApps[0].platform);
    // Hide PWA install prompt
  }
}
```

---

## 10.3.8 Mini Info Bar

### Chrome Mini Info Bar

```javascript
// Chrome shows a mini info bar automatically
// To customize, intercept beforeinstallprompt

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent mini info bar on mobile
  e.preventDefault();
  
  // Show your own UI at the right time
  showInstallPromotionAtRightTime(e);
});
```

---

## 10.3.9 Summary

### Installation Events

| Event | When |
|-------|------|
| `beforeinstallprompt` | App is installable |
| `appinstalled` | App was installed |

### Event Methods

| Method | Description |
|--------|-------------|
| `event.preventDefault()` | Prevent automatic prompt |
| `event.prompt()` | Show install dialog |
| `event.userChoice` | Promise with user decision |

### Best Practices

1. **Don't prompt immediately** — wait for engagement
2. **Provide custom UI** for better conversion
3. **Track installation funnel** with analytics
4. **Handle iOS separately** with manual instructions
5. **Respect user dismissals** — use cooldown period
6. **Test on multiple devices** and browsers

---

**End of Chapter 10.3: App Installation**

This completes the Progressive Web Apps group. Next section: **Group 11 — Notifications and Messaging** — covers browser notifications and cross-context communication.
