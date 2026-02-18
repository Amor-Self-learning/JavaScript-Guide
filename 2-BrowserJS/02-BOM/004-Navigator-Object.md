# 2.4 Navigator Object

The `navigator` object provides information about the browser and device, as well as access to various Web APIs. It includes browser detection, online status, geolocation, clipboard access, permissions, service workers, and more. This chapter covers the most important navigator properties and APIs.

---

## 2.4.1 Browser Information

### userAgent

The user agent string identifies the browser. However, it's notoriously unreliable for browser detection.

```javascript
// Get the user agent string
console.log(navigator.userAgent);
// Chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 
//          (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
// Firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) 
//           Gecko/20100101 Firefox/121.0"

// ⚠️ User agent parsing is unreliable
// Many browsers include "Mozilla", "Safari", etc. for compatibility
```

### Modern Alternative: User Agent Client Hints

```javascript
// More reliable browser detection (Chromium-based only)
if (navigator.userAgentData) {
  // Available in Chrome, Edge, Opera
  console.log(navigator.userAgentData.brands);
  // [{brand: "Chromium", version: "120"}, {brand: "Google Chrome", version: "120"}]
  
  console.log(navigator.userAgentData.mobile);  // false
  console.log(navigator.userAgentData.platform);  // "Windows"
  
  // Get full details (requires promise)
  navigator.userAgentData.getHighEntropyValues([
    'architecture',
    'bitness',
    'fullVersionList',
    'model',
    'platformVersion'
  ]).then(data => {
    console.log(data);
    // { architecture: "x86", bitness: "64", ... }
  });
}
```

### Feature Detection (Preferred Approach)

```javascript
// ✅ Instead of browser detection, test for features
if ('IntersectionObserver' in window) {
  // Use Intersection Observer
} else {
  // Fall back
}

if ('serviceWorker' in navigator) {
  // Service Workers supported
}

if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
  // Modern clipboard API available
}

// ❌ Avoid this pattern
if (navigator.userAgent.includes('Chrome')) {
  // This is fragile
}
```

### Other Browser Info Properties

```javascript
// Browser language preferences
console.log(navigator.language);    // "en-US" (primary)
console.log(navigator.languages);   // ["en-US", "en", "es"]

// Platform info
console.log(navigator.platform);    // "Win32", "MacIntel", "Linux x86_64"
// ⚠️ Deprecated but still works

// Number of CPU cores (approximate)
console.log(navigator.hardwareConcurrency);  // 8

// Max touch points
console.log(navigator.maxTouchPoints);  // 0 (no touch), 10, etc.

// Browser engine
console.log(navigator.product);     // "Gecko" (always)
console.log(navigator.vendor);      // "Google Inc.", "Apple Computer, Inc."
```

---

## 2.4.2 Online/Offline Status

### Checking Connection Status

```javascript
// Current status
console.log(navigator.onLine);  // true or false

// ⚠️ onLine only indicates network connection
// Does NOT guarantee internet access
// A connected router without internet shows as online
```

### Listening for Changes

```javascript
// Online event
window.addEventListener('online', () => {
  console.log('Back online');
  showNotification('Connection restored');
  syncPendingData();
});

// Offline event
window.addEventListener('offline', () => {
  console.log('Gone offline');
  showNotification('You are offline. Changes will sync when back online.');
  enableOfflineMode();
});

// Practical implementation
class ConnectionMonitor {
  constructor() {
    this.listeners = new Set();
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }
  
  setOnline(status) {
    const wasOnline = this.isOnline;
    this.isOnline = status;
    
    if (wasOnline !== status) {
      this.notifyListeners(status);
    }
  }
  
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notifyListeners(isOnline) {
    this.listeners.forEach(fn => fn(isOnline));
  }
}

const connection = new ConnectionMonitor();
connection.subscribe((online) => {
  document.body.classList.toggle('offline-mode', !online);
});
```

### Better Connection Detection

```javascript
// More reliable check: actually test connectivity
async function checkConnectivity() {
  try {
    const response = await fetch('/api/ping', {
      method: 'HEAD',
      cache: 'no-store'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Network Information API (experimental)
if ('connection' in navigator) {
  const connection = navigator.connection;
  
  console.log(connection.type);          // 'wifi', 'cellular', etc.
  console.log(connection.effectiveType); // '4g', '3g', '2g', 'slow-2g'
  console.log(connection.downlink);      // Mbps
  console.log(connection.rtt);           // Round-trip time in ms
  console.log(connection.saveData);      // User prefers reduced data
  
  connection.addEventListener('change', () => {
    console.log('Connection type changed:', connection.effectiveType);
    if (connection.effectiveType === 'slow-2g') {
      enableLowBandwidthMode();
    }
  });
}
```

---

## 2.4.3 Cookies and Storage

### cookieEnabled

```javascript
// Check if cookies are enabled
console.log(navigator.cookieEnabled);  // true or false

if (!navigator.cookieEnabled) {
  showMessage('Cookies are required for this site to work properly.');
}

// ⚠️ This checks if cookies can be set
// Not whether they are actually working (3rd party blocks, etc.)
```

---

## 2.4.4 Geolocation

Access the user's geographic location (requires permission).

### Getting Current Position

```javascript
// Check if supported
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      console.log('Latitude:', position.coords.latitude);
      console.log('Longitude:', position.coords.longitude);
      console.log('Accuracy:', position.coords.accuracy, 'meters');
      console.log('Altitude:', position.coords.altitude);  // May be null
      console.log('Speed:', position.coords.speed);        // May be null
      console.log('Heading:', position.coords.heading);    // May be null
      console.log('Timestamp:', position.timestamp);
    },
    // Error callback
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log('User denied location access');
          break;
        case error.POSITION_UNAVAILABLE:
          console.log('Location unavailable');
          break;
        case error.TIMEOUT:
          console.log('Request timed out');
          break;
      }
    },
    // Options
    {
      enableHighAccuracy: true,  // GPS vs network location
      timeout: 10000,            // Max wait time (ms)
      maximumAge: 60000          // Accept cached position this old (ms)
    }
  );
}
```

### Watching Position (Continuous)

```javascript
// Start watching
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    updateMap(position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error('Watch error:', error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 1000  // Frequent updates
  }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

### Promise Wrapper

```javascript
function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Usage
async function getLocation() {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
}
```

---

## 2.4.5 Clipboard API

Modern async clipboard access (requires permission for read).

### Writing to Clipboard

```javascript
// Write text (no permission needed)
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard');
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}

// Usage
copyBtn.addEventListener('click', async () => {
  const success = await copyText('Hello, clipboard!');
  if (success) {
    showToast('Copied!');
  }
});
```

### Reading from Clipboard

```javascript
// Read text (requires permission)
async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('Pasted:', text);
    return text;
  } catch (error) {
    console.error('Paste failed:', error);
    // User denied permission or no clipboard access
    return null;
  }
}

// Read with permission check
pasteBtn.addEventListener('click', async () => {
  const result = await navigator.permissions.query({ name: 'clipboard-read' });
  
  if (result.state === 'denied') {
    showMessage('Clipboard access denied');
    return;
  }
  
  const text = await navigator.clipboard.readText();
  inputField.value = text;
});
```

### Writing Rich Content

```javascript
// Write HTML, images, or other formats
async function copyRichContent() {
  const blob = new Blob(['<b>Bold text</b>'], { type: 'text/html' });
  const textBlob = new Blob(['Bold text'], { type: 'text/plain' });
  
  const item = new ClipboardItem({
    'text/html': blob,
    'text/plain': textBlob
  });
  
  await navigator.clipboard.write([item]);
}

// Copy an image
async function copyImage(canvas) {
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
  
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
}
```

### Reading Rich Content

```javascript
async function pasteContent() {
  const items = await navigator.clipboard.read();
  
  for (const item of items) {
    for (const type of item.types) {
      if (type === 'image/png') {
        const blob = await item.getType(type);
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        document.body.appendChild(img);
      } else if (type === 'text/plain') {
        const blob = await item.getType(type);
        const text = await blob.text();
        console.log('Text:', text);
      }
    }
  }
}
```

### Fallback for Older Browsers

```javascript
async function copyWithFallback(text) {
  // Try modern API first
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback: execCommand (deprecated but works)
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
```

---

## 2.4.6 Permissions API

Query and request permissions for various features.

### Querying Permission Status

```javascript
// Check a permission
const result = await navigator.permissions.query({ name: 'geolocation' });

console.log(result.state);  // 'granted', 'denied', or 'prompt'

// Listen for changes
result.addEventListener('change', () => {
  console.log('Permission changed to:', result.state);
  updateUI(result.state);
});
```

### Available Permissions

```javascript
// Commonly supported permissions:
const permissions = [
  'geolocation',
  'notifications',
  'camera',
  'microphone',
  'clipboard-read',
  'clipboard-write',
  'persistent-storage'
];

// Check multiple permissions
async function checkPermissions() {
  const results = {};
  
  for (const name of permissions) {
    try {
      const result = await navigator.permissions.query({ name });
      results[name] = result.state;
    } catch {
      results[name] = 'unsupported';
    }
  }
  
  return results;
}
```

### Permission Patterns

```javascript
// Request permission gracefully
async function requestGeolocation() {
  const status = await navigator.permissions.query({ name: 'geolocation' });
  
  if (status.state === 'granted') {
    return getPosition();
  }
  
  if (status.state === 'prompt') {
    // Show explanation before prompting
    const userConsent = await showExplanationDialog(
      'We need your location to show nearby stores.'
    );
    
    if (userConsent) {
      return getPosition();  // This triggers the browser prompt
    }
  }
  
  if (status.state === 'denied') {
    showMessage('Location access is blocked. Please enable in browser settings.');
    return null;
  }
}
```

---

## 2.4.7 Service Worker

Register and manage service workers for offline capability.

### Checking Support

```javascript
if ('serviceWorker' in navigator) {
  console.log('Service Workers supported');
}
```

### Registration

```javascript
// Register a service worker
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('SW registered:', registration.scope);
    
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
    
    return registration;
  } catch (error) {
    console.error('SW registration failed:', error);
  }
}
```

### Communicating with Service Worker

```javascript
// Send message to SW
navigator.serviceWorker.controller?.postMessage({
  type: 'CACHE_URLS',
  payload: ['/images/logo.png', '/api/config']
});

// Receive messages from SW
navigator.serviceWorker.addEventListener('message', (event) => {
  console.log('Message from SW:', event.data);
});
```

---

## 2.4.8 Other Navigator APIs

### share() — Web Share API

```javascript
// Share content using native share dialog
async function shareContent(data) {
  if (!navigator.share) {
    // Fallback to custom share dialog
    showCustomShareDialog(data);
    return;
  }
  
  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    });
    console.log('Shared successfully');
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
  }
}

// Share with files
async function shareWithFiles(files) {
  if (!navigator.canShare?.({ files })) {
    console.log('File sharing not supported');
    return;
  }
  
  await navigator.share({
    files,
    title: 'Shared files'
  });
}
```

### vibrate() — Vibration API

```javascript
// Vibrate for duration (mobile devices)
navigator.vibrate(200);  // Vibrate for 200ms

// Pattern: vibrate, pause, vibrate
navigator.vibrate([100, 50, 100]);  // vibrate 100ms, pause 50ms, vibrate 100ms

// Stop vibration
navigator.vibrate(0);

// Check support
if ('vibrate' in navigator) {
  hapticFeedback();
}
```

### getBattery() — Battery API

```javascript
// Get battery status (Chrome/Firefox)
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery();
  
  console.log('Level:', battery.level * 100 + '%');
  console.log('Charging:', battery.charging);
  console.log('Charging time:', battery.chargingTime);
  console.log('Discharging time:', battery.dischargingTime);
  
  // Listen for changes
  battery.addEventListener('levelchange', () => {
    console.log('Battery level:', battery.level);
  });
  
  battery.addEventListener('chargingchange', () => {
    console.log('Charging:', battery.charging);
  });
}
```

### mediaDevices — Camera/Microphone Access

```javascript
// Access camera and microphone
async function getMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true
    });
    
    videoElement.srcObject = stream;
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.log('Permission denied');
    } else if (error.name === 'NotFoundError') {
      console.log('No camera/microphone found');
    }
    throw error;
  }
}

// List available devices
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter(d => d.kind === 'videoinput');
const mics = devices.filter(d => d.kind === 'audioinput');
```

### credentials — Credential Management

```javascript
// Store credentials
if ('credentials' in navigator) {
  const credential = new PasswordCredential({
    id: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  });
  
  await navigator.credentials.store(credential);
}

// Retrieve credentials
const credential = await navigator.credentials.get({
  password: true
});

if (credential) {
  // Auto-fill login form
  loginForm.email.value = credential.id;
  loginForm.password.value = credential.password;
}
```

---

## 2.4.9 Summary

| Property/Method | Purpose | Permission Required |
|-----------------|---------|---------------------|
| `userAgent` | Browser identification | No |
| `language`/`languages` | User language preferences | No |
| `onLine` | Network connection status | No |
| `cookieEnabled` | Cookie support check | No |
| `geolocation` | Geographic position | Yes |
| `clipboard` | Read/write clipboard | Read: Yes, Write: No* |
| `permissions` | Check/request permissions | No |
| `serviceWorker` | Offline/background features | No |
| `share()` | Native share dialog | No |
| `vibrate()` | Haptic feedback | No |
| `getBattery()` | Battery status | No |
| `mediaDevices` | Camera/microphone access | Yes |
| `credentials` | Password management | No |

### Best Practices

1. **Use feature detection** instead of browser detection
2. **Check permissions** before requesting sensitive APIs
3. **Provide fallbacks** for unsupported features
4. **Handle errors gracefully** — permissions can be denied
5. **Use secure contexts** (HTTPS) for sensitive APIs
6. **Respect user preferences** (`saveData`, reduced motion, etc.)

### Security Requirements

```javascript
// Many APIs require secure context (HTTPS)
if (window.isSecureContext) {
  // Safe to use: clipboard, geolocation, serviceWorker, etc.
} else {
  // These APIs will fail or not exist
}
```

---

**End of Chapter 2.4: Navigator Object**

Next chapter: **2.5 Screen Object** — covers screen dimensions, orientation, color depth, and multi-monitor detection.
