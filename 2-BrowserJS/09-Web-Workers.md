# 9.1 Dedicated Workers

Dedicated Workers run scripts in background threads, enabling parallel computation without blocking the main thread. This chapter covers worker creation, communication, and best practices.

---

## 9.1.1 Web Workers Overview

### What Are Web Workers?

```javascript
// Web Workers run JavaScript in background threads
// - Don't block the UI
// - No access to DOM
// - Communicate via messages
// - Separate global scope (WorkerGlobalScope)

// Use cases:
// - Heavy computation
// - Data processing
// - Image manipulation
// - Parsing large files
// - Cryptographic operations
```

### Browser Support

```javascript
if (typeof Worker !== 'undefined') {
  console.log('Web Workers supported');
} else {
  console.log('Web Workers not supported');
}
```

---

## 9.1.2 Creating Workers

### From Separate File

```javascript
// main.js
const worker = new Worker('worker.js');
```

```javascript
// worker.js
console.log('Worker started');
```

### Inline Worker (Blob URL)

```javascript
// Create worker from inline code
const workerCode = `
  self.onmessage = (e) => {
    const result = e.data * 2;
    self.postMessage(result);
  };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

### Module Workers

```javascript
// ES modules in workers (modern browsers)
const worker = new Worker('worker.js', { type: 'module' });
```

```javascript
// worker.js (module)
import { processData } from './utils.js';

self.onmessage = (e) => {
  const result = processData(e.data);
  self.postMessage(result);
};
```

---

## 9.1.3 Communication

### postMessage and onmessage

```javascript
// main.js
const worker = new Worker('worker.js');

// Send data to worker
worker.postMessage({ task: 'process', data: [1, 2, 3, 4, 5] });

// Receive messages from worker
worker.onmessage = (event) => {
  console.log('Result:', event.data);
};

// Handle errors
worker.onerror = (error) => {
  console.error('Worker error:', error.message);
};
```

```javascript
// worker.js
self.onmessage = (event) => {
  const { task, data } = event.data;
  
  if (task === 'process') {
    const result = data.map(x => x * 2);
    self.postMessage(result);
  }
};
```

### Message Events

```javascript
// Using addEventListener
worker.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

worker.addEventListener('error', (event) => {
  console.error('Error:', event.message);
  console.error('File:', event.filename);
  console.error('Line:', event.lineno);
});

worker.addEventListener('messageerror', (event) => {
  console.error('Message deserialization failed');
});
```

### Structured Clone

```javascript
// Data is copied via structured clone algorithm
// Supported types:
// - Primitives (strings, numbers, booleans)
// - Arrays and objects
// - ArrayBuffer, TypedArrays
// - Map, Set
// - Date, RegExp
// - Blob, File, FileList
// - ImageData

// NOT supported:
// - Functions
// - DOM elements
// - Error objects (in some browsers)
// - Symbols

// Example
worker.postMessage({
  name: 'Task 1',
  data: new Float32Array([1.0, 2.0, 3.0]),
  timestamp: new Date(),
  metadata: new Map([['key', 'value']])
});
```

---

## 9.1.4 Transferable Objects

### Transfer vs Copy

```javascript
// Create large buffer
const buffer = new ArrayBuffer(1024 * 1024 * 100);  // 100MB

// COPY (slow, doubles memory)
worker.postMessage({ buffer });

// TRANSFER (instant, moves ownership)
worker.postMessage({ buffer }, [buffer]);
// buffer.byteLength is now 0 in main thread
```

### Transferable Types

```javascript
// ArrayBuffer
const arrayBuffer = new ArrayBuffer(1024);
worker.postMessage(arrayBuffer, [arrayBuffer]);

// MessagePort
const channel = new MessageChannel();
worker.postMessage({ port: channel.port2 }, [channel.port2]);

// ImageBitmap
const imageBitmap = await createImageBitmap(imageElement);
worker.postMessage(imageBitmap, [imageBitmap]);

// OffscreenCanvas
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);

// ReadableStream / WritableStream (some browsers)
const stream = new ReadableStream({ /* ... */ });
worker.postMessage(stream, [stream]);
```

### Transfer Example

```javascript
// main.js
const buffer = new ArrayBuffer(1024 * 1024);
const view = new Uint8Array(buffer);

// Fill with data
for (let i = 0; i < view.length; i++) {
  view[i] = i % 256;
}

console.log('Before transfer:', buffer.byteLength);  // 1048576

worker.postMessage(buffer, [buffer]);

console.log('After transfer:', buffer.byteLength);   // 0 (neutered)
```

```javascript
// worker.js
self.onmessage = (event) => {
  const buffer = event.data;
  console.log('Received:', buffer.byteLength);  // 1048576
  
  // Process and transfer back
  const result = processBuffer(buffer);
  self.postMessage(result, [result]);
};
```

---

## 9.1.5 Worker Scope

### Available APIs in Workers

```javascript
// Available in workers
self                    // Worker global scope
postMessage()           // Send to main thread
close()                 // Terminate worker
importScripts()         // Load external scripts
fetch()                 // Network requests
setTimeout/setInterval  // Timers
IndexedDB              // Database
WebSockets             // Real-time communication
XMLHttpRequest         // HTTP requests
console                // Debugging
navigator              // Browser info (partial)
location               // URL info

// NOT available
document               // No DOM access
window                 // No window object
localStorage           // Use IndexedDB instead
alert/confirm/prompt   // No UI dialogs
```

### importScripts

```javascript
// worker.js
// Synchronous script loading
importScripts('helper.js');
importScripts('lib1.js', 'lib2.js');

// All scripts loaded before continuing
console.log('Scripts loaded');
```

### Worker Self Reference

```javascript
// worker.js
// 'self' is the global scope
self.onmessage = (e) => { /* ... */ };

// Or use global directly
onmessage = (e) => { /* ... */ };

// They're the same
console.log(self === this);  // true (at top level)
```

---

## 9.1.6 Terminating Workers

### From Main Thread

```javascript
const worker = new Worker('worker.js');

// Terminate immediately
worker.terminate();

// Worker is stopped, cannot be restarted
```

### From Worker

```javascript
// worker.js
self.onmessage = (event) => {
  if (event.data === 'shutdown') {
    // Clean up
    cleanup();
    
    // Terminate self
    self.close();
  }
};
```

### Cleanup Pattern

```javascript
// main.js
class WorkerManager {
  constructor(scriptUrl) {
    this.worker = new Worker(scriptUrl);
    this.pending = new Map();
    this.nextId = 0;
    
    this.worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const { resolve, reject } = this.pending.get(id);
      this.pending.delete(id);
      
      if (error) reject(new Error(error));
      else resolve(result);
    };
  }
  
  execute(task, data) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, task, data });
    });
  }
  
  terminate() {
    this.worker.terminate();
    // Reject pending promises
    for (const [id, { reject }] of this.pending) {
      reject(new Error('Worker terminated'));
    }
    this.pending.clear();
  }
}
```

---

## 9.1.7 Error Handling

### Worker Errors

```javascript
// main.js
worker.onerror = (event) => {
  console.error('Error in worker:');
  console.error('Message:', event.message);
  console.error('Filename:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
  
  // Prevent default error handling
  event.preventDefault();
};
```

### Error from Worker

```javascript
// worker.js
self.onmessage = (event) => {
  try {
    const result = riskyOperation(event.data);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error.message 
    });
  }
};
```

### Unhandled Rejection

```javascript
// worker.js
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
  self.postMessage({ 
    type: 'error', 
    error: event.reason.message 
  });
});
```

---

## 9.1.8 Practical Example

### CPU-Intensive Task

```javascript
// main.js
const worker = new Worker('fibonacci-worker.js');

document.getElementById('calculate').onclick = () => {
  const n = parseInt(document.getElementById('input').value);
  
  // Won't block UI
  worker.postMessage(n);
  document.getElementById('status').textContent = 'Calculating...';
};

worker.onmessage = (event) => {
  document.getElementById('result').textContent = event.data;
  document.getElementById('status').textContent = 'Done!';
};
```

```javascript
// fibonacci-worker.js
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

self.onmessage = (event) => {
  const n = event.data;
  const result = fibonacci(n);
  self.postMessage(result);
};
```

### Image Processing

```javascript
// main.js
const worker = new Worker('image-worker.js');

async function processImage(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  worker.postMessage({
    imageData: imageData.data.buffer,
    width: canvas.width,
    height: canvas.height
  }, [imageData.data.buffer]);
}

worker.onmessage = (event) => {
  const { processedData, width, height } = event.data;
  const imageData = new ImageData(
    new Uint8ClampedArray(processedData),
    width,
    height
  );
  ctx.putImageData(imageData, 0, 0);
};
```

```javascript
// image-worker.js
self.onmessage = (event) => {
  const { imageData, width, height } = event.data;
  const data = new Uint8ClampedArray(imageData);
  
  // Apply grayscale filter
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // Red
    data[i + 1] = avg; // Green
    data[i + 2] = avg; // Blue
    // Alpha unchanged
  }
  
  self.postMessage({
    processedData: data.buffer,
    width,
    height
  }, [data.buffer]);
};
```

---

## 9.1.9 Summary

### Worker Creation

| Method | Use Case |
|--------|----------|
| `new Worker('file.js')` | Separate file |
| `new Worker(blobUrl)` | Inline code |
| `{ type: 'module' }` | ES modules |

### Communication

| Method | Direction |
|--------|-----------|
| `worker.postMessage()` | Main → Worker |
| `self.postMessage()` | Worker → Main |
| `worker.onmessage` | Receive in main |
| `self.onmessage` | Receive in worker |

### Transferable Objects

| Type | Purpose |
|------|---------|
| `ArrayBuffer` | Binary data |
| `MessagePort` | Communication channels |
| `ImageBitmap` | Processed images |
| `OffscreenCanvas` | Graphics rendering |

### Best Practices

1. **Transfer large data** instead of copying
2. **Use message pooling** for frequent communication
3. **Handle errors** in both threads
4. **Terminate unused workers** to free resources
5. **Use worker pools** for multiple tasks
6. **Keep messages small** and serializable

---

**End of Chapter 9.1: Dedicated Workers**

Next chapter: **9.2 Shared Workers** — covers workers shared between multiple windows.
# 9.2 Shared Workers

Shared Workers are background threads shared across multiple browsing contexts (tabs, windows, iframes). This chapter covers creating shared workers, port-based communication, and connection management.

---

## 9.2.1 Shared Workers Overview

### What Are Shared Workers?

```javascript
// Shared Workers:
// - Single worker shared by multiple pages
// - Same-origin tabs/windows can connect
// - Communication via MessagePorts
// - Persist until all connections close
// - Useful for shared state and coordination

// Use cases:
// - Shared WebSocket connection
// - Coordinated data caching
// - Cross-tab communication
// - Shared authentication state
```

### Browser Support

```javascript
if (typeof SharedWorker !== 'undefined') {
  console.log('Shared Workers supported');
} else {
  console.log('Shared Workers not supported');
}
```

---

## 9.2.2 Creating Shared Workers

### Basic Creation

```javascript
// main.js (multiple pages can use this)
const worker = new SharedWorker('shared-worker.js');

// Access the port for communication
const port = worker.port;

// Start the port
port.start();
```

```javascript
// shared-worker.js
self.onconnect = (event) => {
  const port = event.ports[0];
  
  port.onmessage = (e) => {
    port.postMessage('Received: ' + e.data);
  };
  
  port.start();
};
```

### Named Shared Workers

```javascript
// Different names = different workers
const worker1 = new SharedWorker('worker.js', 'worker-a');
const worker2 = new SharedWorker('worker.js', 'worker-b');

// Same name and URL = same worker
const worker3 = new SharedWorker('worker.js', 'worker-a');
// worker1 and worker3 share the same worker
```

---

## 9.2.3 Port Communication

### Basic Port Usage

```javascript
// main.js
const worker = new SharedWorker('shared-worker.js');
const port = worker.port;

// Send message
port.postMessage({ type: 'greeting', text: 'Hello' });

// Receive messages
port.onmessage = (event) => {
  console.log('Received:', event.data);
};

// Or with addEventListener
port.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

// Must call start() when using addEventListener
port.start();
```

### Worker Side

```javascript
// shared-worker.js
const connections = [];

self.onconnect = (event) => {
  const port = event.ports[0];
  connections.push(port);
  
  port.onmessage = (e) => {
    handleMessage(port, e.data);
  };
  
  port.start();
  
  // Send welcome message
  port.postMessage({ type: 'connected', count: connections.length });
};

function handleMessage(senderPort, message) {
  switch (message.type) {
    case 'broadcast':
      // Send to all connected ports
      connections.forEach(port => {
        port.postMessage(message.data);
      });
      break;
      
    case 'request':
      // Reply to sender only
      senderPort.postMessage({ type: 'response', data: 'result' });
      break;
  }
}
```

---

## 9.2.4 Managing Connections

### Track Connected Ports

```javascript
// shared-worker.js
const ports = new Set();

self.onconnect = (event) => {
  const port = event.ports[0];
  ports.add(port);
  
  console.log(`New connection. Total: ${ports.size}`);
  
  port.onmessage = (e) => {
    handleMessage(port, e.data);
  };
  
  // Handle disconnection (close detection is tricky)
  port.onmessageerror = () => {
    ports.delete(port);
  };
  
  port.start();
};

// Broadcast to all
function broadcast(message) {
  ports.forEach(port => {
    try {
      port.postMessage(message);
    } catch (e) {
      // Port might be closed
      ports.delete(port);
    }
  });
}
```

### Connection ID Pattern

```javascript
// shared-worker.js
let nextId = 1;
const connections = new Map();

self.onconnect = (event) => {
  const port = event.ports[0];
  const id = nextId++;
  
  connections.set(id, { port, data: {} });
  
  port.onmessage = (e) => {
    handleMessage(id, e.data);
  };
  
  port.postMessage({ type: 'welcome', id });
  port.start();
};

function handleMessage(id, message) {
  const connection = connections.get(id);
  
  if (message.type === 'setName') {
    connection.data.name = message.name;
  }
  
  if (message.type === 'getUsers') {
    const users = Array.from(connections.values())
      .map(c => c.data.name)
      .filter(Boolean);
    connection.port.postMessage({ type: 'users', users });
  }
}
```

---

## 9.2.5 Cross-Tab Communication

### Broadcasting Messages

```javascript
// main.js
const worker = new SharedWorker('broadcast-worker.js');
const port = worker.port;

// Send message to all tabs
function broadcastMessage(message) {
  port.postMessage({ type: 'broadcast', message });
}

// Receive broadcasts
port.onmessage = (event) => {
  if (event.data.type === 'broadcast') {
    displayMessage(event.data.message);
  }
};

port.start();
```

```javascript
// broadcast-worker.js
const ports = [];

self.onconnect = (event) => {
  const port = event.ports[0];
  ports.push(port);
  
  port.onmessage = (e) => {
    if (e.data.type === 'broadcast') {
      // Send to all ports including sender
      ports.forEach(p => {
        p.postMessage({ type: 'broadcast', message: e.data.message });
      });
    }
  };
  
  port.start();
};
```

### Tab Synchronization

```javascript
// shared-worker.js
let sharedState = {
  user: null,
  theme: 'light',
  notifications: []
};

self.onconnect = (event) => {
  const port = event.ports[0];
  
  // Send current state to new connection
  port.postMessage({ type: 'sync', state: sharedState });
  
  port.onmessage = (e) => {
    if (e.data.type === 'update') {
      // Update shared state
      sharedState = { ...sharedState, ...e.data.changes };
      
      // Notify all connections
      broadcast({ type: 'sync', state: sharedState });
    }
  };
  
  port.start();
};
```

---

## 9.2.6 Shared WebSocket

### Single WebSocket Connection

```javascript
// shared-worker.js
let socket = null;
const ports = [];

function initWebSocket() {
  socket = new WebSocket('wss://example.com/ws');
  
  socket.onmessage = (event) => {
    // Broadcast to all connected pages
    const data = JSON.parse(event.data);
    ports.forEach(port => {
      port.postMessage({ type: 'ws-message', data });
    });
  };
  
  socket.onclose = () => {
    socket = null;
    // Attempt reconnect
    setTimeout(initWebSocket, 5000);
  };
}

self.onconnect = (event) => {
  const port = event.ports[0];
  ports.push(port);
  
  // Initialize WebSocket on first connection
  if (!socket) {
    initWebSocket();
  }
  
  port.onmessage = (e) => {
    if (e.data.type === 'ws-send' && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(e.data.data));
    }
  };
  
  port.start();
};
```

```javascript
// main.js
const worker = new SharedWorker('ws-worker.js');
const port = worker.port;

// Send via shared WebSocket
function send(data) {
  port.postMessage({ type: 'ws-send', data });
}

// Receive WebSocket messages
port.onmessage = (event) => {
  if (event.data.type === 'ws-message') {
    handleWebSocketMessage(event.data.data);
  }
};

port.start();
```

---

## 9.2.7 Debugging Shared Workers

### Chrome DevTools

```javascript
// Navigate to: chrome://inspect/#workers
// Click "inspect" on your shared worker

// In worker, add debugging
console.log('Shared worker started');
console.log('Connections:', ports.length);
```

### Logging Pattern

```javascript
// shared-worker.js
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[SharedWorker]', ...args);
  }
}

self.onconnect = (event) => {
  log('New connection');
  const port = event.ports[0];
  
  port.onmessage = (e) => {
    log('Received:', e.data);
    // ...
  };
  
  port.start();
};
```

---

## 9.2.8 Error Handling

### Worker Errors

```javascript
// main.js
const worker = new SharedWorker('shared-worker.js');

worker.onerror = (error) => {
  console.error('Shared worker error:', error);
};

worker.port.onmessageerror = (error) => {
  console.error('Message error:', error);
};
```

### Error Broadcasting

```javascript
// shared-worker.js
self.onerror = (message, filename, lineno) => {
  // Notify all connections
  ports.forEach(port => {
    port.postMessage({
      type: 'error',
      message,
      filename,
      lineno
    });
  });
};
```

---

## 9.2.9 Summary

### Creating Shared Workers

| Syntax | Description |
|--------|-------------|
| `new SharedWorker(url)` | Create/connect to worker |
| `new SharedWorker(url, name)` | Named worker |
| `worker.port` | Communication port |

### Port Methods

| Method | Description |
|--------|-------------|
| `port.postMessage()` | Send message |
| `port.start()` | Start receiving |
| `port.close()` | Close port |

### Worker Events

| Event | Handler |
|-------|---------|
| `connect` | New connection |
| `message` | Message received |
| `error` | Error occurred |

### Best Practices

1. **Always call port.start()** when using addEventListener
2. **Track connections** for broadcasting
3. **Handle disconnections** gracefully
4. **Use named workers** to avoid conflicts
5. **Debug via chrome://inspect** for shared workers
6. **Consider fallback** for browsers without support

---

**End of Chapter 9.2: Shared Workers**

Next chapter: **9.3 Service Workers** — covers offline capability and caching.
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
# 9.4 Worklets

Worklets are lightweight, specialized workers for specific rendering and audio tasks. This chapter covers Audio Worklets, Paint Worklets, Animation Worklets, and Layout Worklets.

---

## 9.4.1 Worklets Overview

### What Are Worklets?

```javascript
// Worklets are specialized workers for:
// - Audio processing (Audio Worklet)
// - Custom CSS painting (Paint Worklet)
// - Custom animations (Animation Worklet)
// - Custom layout algorithms (Layout Worklet)

// Differences from Web Workers:
// - Render-thread access (most)
// - Specialized APIs
// - Lifecycle tied to rendering
// - Cannot use postMessage
// - Use class-based registration
```

### Worklet Types

| Worklet | Purpose | Thread |
|---------|---------|--------|
| AudioWorklet | Audio processing | Audio thread |
| PaintWorklet | Custom CSS painting | Main thread |
| AnimationWorklet | Scroll-linked animations | Compositor thread |
| LayoutWorklet | Custom layouts | Main thread |

---

## 9.4.2 Audio Worklet

### Overview

```javascript
// Audio Worklet replaces deprecated ScriptProcessorNode
// - Runs on dedicated audio thread
// - Low-latency audio processing
// - 128-sample block processing
```

### Registering Audio Worklet

```javascript
// main.js
const audioContext = new AudioContext();

// Load worklet module
await audioContext.audioWorklet.addModule('audio-processor.js');

// Create node
const processorNode = new AudioWorkletNode(audioContext, 'my-processor');

// Connect to audio graph
source.connect(processorNode);
processorNode.connect(audioContext.destination);
```

### Audio Processor

```javascript
// audio-processor.js
class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
  }
  
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const frequency = 440;
    const sampleRate = globalThis.sampleRate;
    
    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];
      
      for (let i = 0; i < outputChannel.length; i++) {
        // Generate sine wave
        outputChannel[i] = Math.sin(this.phase);
        this.phase += (2 * Math.PI * frequency) / sampleRate;
      }
    }
    
    // Return true to keep processor alive
    return true;
  }
}

registerProcessor('my-processor', MyProcessor);
```

### Parameters

```javascript
// audio-processor.js
class GainProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: 'gain',
      defaultValue: 1,
      minValue: 0,
      maxValue: 1,
      automationRate: 'a-rate'  // or 'k-rate'
    }];
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const gain = parameters.gain;
    
    for (let channel = 0; channel < input.length; channel++) {
      for (let i = 0; i < input[channel].length; i++) {
        // Use per-sample gain if available
        const g = gain.length > 1 ? gain[i] : gain[0];
        output[channel][i] = input[channel][i] * g;
      }
    }
    
    return true;
  }
}

registerProcessor('gain-processor', GainProcessor);
```

### Communication

```javascript
// main.js
const node = new AudioWorkletNode(audioContext, 'my-processor');

// Send message to worklet
node.port.postMessage({ type: 'config', value: 42 });

// Receive from worklet
node.port.onmessage = (event) => {
  console.log('From worklet:', event.data);
};
```

```javascript
// audio-processor.js
class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    this.port.onmessage = (event) => {
      console.log('From main:', event.data);
      // Handle configuration
    };
  }
  
  process(inputs, outputs, parameters) {
    // Send data back
    this.port.postMessage({ level: this.calculateLevel(inputs) });
    return true;
  }
}
```

---

## 9.4.3 Paint Worklet

### Overview

```javascript
// Paint Worklet enables custom CSS painting
// - Used with CSS paint() function
// - Runs on main thread
// - Access to canvas-like API
// - Triggered on paint
```

### Registering Paint Worklet

```javascript
// main.js
CSS.paintWorklet.addModule('paint-worklet.js');
```

### Paint Worklet Definition

```javascript
// paint-worklet.js
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checker-size', '--checker-color'];
  }
  
  paint(ctx, size, properties) {
    const checkerSize = parseInt(properties.get('--checker-size')) || 16;
    const color = properties.get('--checker-color').toString() || 'black';
    
    ctx.fillStyle = color;
    
    for (let y = 0; y < size.height; y += checkerSize * 2) {
      for (let x = 0; x < size.width; x += checkerSize * 2) {
        ctx.fillRect(x, y, checkerSize, checkerSize);
        ctx.fillRect(x + checkerSize, y + checkerSize, checkerSize, checkerSize);
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);
```

### Using in CSS

```css
.element {
  --checker-size: 20;
  --checker-color: blue;
  background-image: paint(checkerboard);
}
```

### Paint Context

```javascript
class MyPainter {
  paint(ctx, size, properties) {
    // ctx is similar to CanvasRenderingContext2D
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size.width, size.height);
    
    ctx.beginPath();
    ctx.arc(size.width / 2, size.height / 2, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // size.width and size.height are element dimensions
  }
}
```

### Complex Example

```javascript
// ripple-worklet.js
class RipplePainter {
  static get inputProperties() {
    return ['--ripple-x', '--ripple-y', '--ripple-progress'];
  }
  
  paint(ctx, size, properties) {
    const x = parseFloat(properties.get('--ripple-x')) || 0;
    const y = parseFloat(properties.get('--ripple-y')) || 0;
    const progress = parseFloat(properties.get('--ripple-progress')) || 0;
    
    const maxRadius = Math.hypot(
      Math.max(x, size.width - x),
      Math.max(y, size.height - y)
    );
    
    const radius = maxRadius * progress;
    const alpha = 1 - progress;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

registerPaint('ripple', RipplePainter);
```

---

## 9.4.4 Animation Worklet

### Overview

```javascript
// Animation Worklet enables scroll-linked and
// high-performance animations
// - Runs on compositor thread
// - Avoids main thread jank
// - Scroll-driven animations
```

### Registering Animation Worklet

```javascript
// main.js
await CSS.animationWorklet.addModule('animation-worklet.js');
```

### Animation Definition

```javascript
// animation-worklet.js
class ScrollProgressAnimator {
  constructor(options) {
    this.rate = options.rate || 1;
  }
  
  animate(currentTime, effect) {
    // currentTime is scroll position (0-100%)
    effect.localTime = currentTime * this.rate;
  }
}

registerAnimator('scroll-progress', ScrollProgressAnimator);
```

### Using Animation Worklet

```javascript
// main.js
const element = document.querySelector('.animated');

// Create scroll timeline
const scrollTimeline = new ScrollTimeline({
  source: document.documentElement,
  orientation: 'vertical'
});

// Create animation
const animation = new WorkletAnimation(
  'scroll-progress',
  new KeyframeEffect(
    element,
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(500px)' }
    ],
    { duration: 1, fill: 'both' }
  ),
  scrollTimeline,
  { rate: 1 }
);

animation.play();
```

---

## 9.4.5 Layout Worklet

### Overview

```javascript
// Layout Worklet enables custom CSS layouts
// - Define your own display algorithms
// - Like creating a new display type
// - Experimental feature
```

### Registering Layout Worklet

```javascript
// main.js
CSS.layoutWorklet.addModule('layout-worklet.js');
```

### Layout Definition

```javascript
// layout-worklet.js
class MasonryLayout {
  static get inputProperties() {
    return ['--columns', '--gap'];
  }
  
  static get childInputProperties() {
    return [];
  }
  
  async intrinsicSizes(children, edges, styleMap) {
    // Return min/max content sizes
  }
  
  async layout(children, edges, constraints, styleMap) {
    const columns = parseInt(styleMap.get('--columns')) || 3;
    const gap = parseInt(styleMap.get('--gap')) || 10;
    
    const columnWidth = (constraints.fixedInlineSize - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);
    
    const childFragments = await Promise.all(children.map(async (child) => {
      const fragment = await child.layoutNextFragment({
        fixedInlineSize: columnWidth
      });
      
      // Find shortest column
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      
      fragment.inlineOffset = column * (columnWidth + gap);
      fragment.blockOffset = columnHeights[column];
      
      columnHeights[column] += fragment.blockSize + gap;
      
      return fragment;
    }));
    
    return {
      childFragments,
      autoBlockSize: Math.max(...columnHeights)
    };
  }
}

registerLayout('masonry', MasonryLayout);
```

### Using in CSS

```css
.container {
  display: layout(masonry);
  --columns: 3;
  --gap: 16;
}
```

---

## 9.4.6 Comparison

### Feature Matrix

| Feature | Audio | Paint | Animation | Layout |
|---------|-------|-------|-----------|--------|
| Thread | Audio | Main | Compositor | Main |
| Canvas API | No | Yes | No | No |
| CSS Properties | No | Yes | No | Yes |
| Streaming | Yes | No | No | No |
| Browser Support | Good | Good | Limited | Limited |

### When to Use

```javascript
// Audio Worklet
// - Real-time audio effects
// - Audio synthesis
// - Audio analysis

// Paint Worklet
// - Custom backgrounds
// - Dynamic patterns
// - Animated backgrounds via CSS vars

// Animation Worklet
// - Scroll-linked animations
// - Parallax effects
// - Frame-perfect animations

// Layout Worklet
// - Custom layout algorithms
// - Masonry layouts
// - Complex grid systems
```

---

## 9.4.7 Summary

### Worklet Registration

| Type | Registration |
|------|--------------|
| Audio | `audioContext.audioWorklet.addModule()` |
| Paint | `CSS.paintWorklet.addModule()` |
| Animation | `CSS.animationWorklet.addModule()` |
| Layout | `CSS.layoutWorklet.addModule()` |

### Class Registration

| Type | Function |
|------|----------|
| Audio | `registerProcessor()` |
| Paint | `registerPaint()` |
| Animation | `registerAnimator()` |
| Layout | `registerLayout()` |

### Best Practices

1. **Check browser support** before using
2. **Keep worklet code lightweight**
3. **Use for performance-critical tasks**
4. **Provide fallbacks** for unsupported browsers
5. **Test across browsers**
6. **Consider polyfills** for Paint Worklet

---

**End of Chapter 9.4: Worklets**

This completes the Web Workers group. Next section: **Group 10 — Progressive Web Apps** — covers PWA features.
