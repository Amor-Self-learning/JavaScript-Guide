# 14.1 WebSocket API

The WebSocket API provides full-duplex communication channels over a single TCP connection. This chapter covers WebSocket creation, messaging, and connection management.

---

## 14.1.1 Creating a WebSocket

### Basic Connection

```javascript
const socket = new WebSocket('wss://example.com/socket');

socket.addEventListener('open', () => {
  console.log('Connected');
});

socket.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

socket.addEventListener('close', (event) => {
  console.log('Closed:', event.code, event.reason);
});

socket.addEventListener('error', (event) => {
  console.error('Error occurred');
});
```

### With Protocols

```javascript
// Specify sub-protocol(s)
const socket = new WebSocket('wss://example.com/socket', ['graphql-ws', 'json']);

socket.addEventListener('open', () => {
  console.log('Protocol:', socket.protocol);  // Server-selected protocol
});
```

---

## 14.1.2 Connection States

### ReadyState

```javascript
const socket = new WebSocket('wss://example.com/socket');

// Check state
console.log(socket.readyState);

// States:
// WebSocket.CONNECTING (0) - Connection not yet open
// WebSocket.OPEN (1) - Connection is open
// WebSocket.CLOSING (2) - Connection is closing
// WebSocket.CLOSED (3) - Connection is closed
```

### Check Before Sending

```javascript
function send(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(data);
    return true;
  }
  return false;
}
```

---

## 14.1.3 Sending Data

### Send Text

```javascript
socket.send('Hello, server!');
```

### Send JSON

```javascript
const data = { type: 'message', content: 'Hello' };
socket.send(JSON.stringify(data));
```

### Send Binary

```javascript
// ArrayBuffer
const buffer = new ArrayBuffer(8);
socket.send(buffer);

// Blob
const blob = new Blob(['data'], { type: 'application/octet-stream' });
socket.send(blob);

// TypedArray
const array = new Uint8Array([1, 2, 3, 4]);
socket.send(array.buffer);
```

### Set Binary Type

```javascript
// For receiving binary data
socket.binaryType = 'arraybuffer';  // Default
// or
socket.binaryType = 'blob';
```

---

## 14.1.4 Receiving Messages

### Handle Messages

```javascript
socket.addEventListener('message', (event) => {
  if (typeof event.data === 'string') {
    // Text message
    try {
      const json = JSON.parse(event.data);
      handleJSON(json);
    } catch {
      handleText(event.data);
    }
  } else if (event.data instanceof ArrayBuffer) {
    // Binary data
    handleBinary(event.data);
  } else if (event.data instanceof Blob) {
    // Blob data
    handleBlob(event.data);
  }
});
```

### Read Blob Data

```javascript
socket.binaryType = 'blob';

socket.addEventListener('message', async (event) => {
  if (event.data instanceof Blob) {
    const text = await event.data.text();
    console.log('Blob as text:', text);
    
    // Or as ArrayBuffer
    const buffer = await event.data.arrayBuffer();
  }
});
```

---

## 14.1.5 Closing Connection

### Close Gracefully

```javascript
// Close with optional code and reason
socket.close(1000, 'Done');

// Codes:
// 1000 - Normal closure
// 1001 - Going away
// 1002 - Protocol error
// 1003 - Unsupported data
// 1008 - Policy violation
// 1011 - Server error
```

### Handle Close

```javascript
socket.addEventListener('close', (event) => {
  console.log('Code:', event.code);
  console.log('Reason:', event.reason);
  console.log('Clean:', event.wasClean);
  
  if (!event.wasClean) {
    console.log('Connection lost unexpectedly');
  }
});
```

---

## 14.1.6 Reconnection Logic

### Auto-Reconnect

```javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.maxRetries = options.maxRetries ?? 10;
    this.retryDelay = options.retryDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    
    this.retries = 0;
    this.listeners = { open: [], message: [], close: [], error: [] };
    
    this.connect();
  }
  
  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.addEventListener('open', (e) => {
      this.retries = 0;
      this.emit('open', e);
    });
    
    this.socket.addEventListener('message', (e) => {
      this.emit('message', e);
    });
    
    this.socket.addEventListener('close', (e) => {
      this.emit('close', e);
      this.reconnect();
    });
    
    this.socket.addEventListener('error', (e) => {
      this.emit('error', e);
    });
  }
  
  reconnect() {
    if (this.retries >= this.maxRetries) {
      console.log('Max retries reached');
      return;
    }
    
    const delay = Math.min(
      this.retryDelay * Math.pow(2, this.retries),
      this.maxDelay
    );
    
    this.retries++;
    console.log(`Reconnecting in ${delay}ms (attempt ${this.retries})`);
    
    setTimeout(() => this.connect(), delay);
  }
  
  send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }
  
  close() {
    this.maxRetries = 0;  // Prevent reconnection
    this.socket.close();
  }
  
  on(event, callback) {
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    this.listeners[event].forEach(cb => cb(data));
  }
}
```

---

## 14.1.7 Message Queue

### Queue Messages When Disconnected

```javascript
class QueuedWebSocket {
  constructor(url) {
    this.url = url;
    this.queue = [];
    this.connect();
  }
  
  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.addEventListener('open', () => {
      this.flushQueue();
    });
    
    this.socket.addEventListener('close', () => {
      setTimeout(() => this.connect(), 1000);
    });
  }
  
  send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      this.queue.push(data);
    }
  }
  
  flushQueue() {
    while (this.queue.length > 0) {
      const data = this.queue.shift();
      this.socket.send(data);
    }
  }
}
```

---

## 14.1.8 Heartbeat / Ping-Pong

### Keep Connection Alive

```javascript
class HeartbeatWebSocket {
  constructor(url, interval = 30000) {
    this.interval = interval;
    this.socket = new WebSocket(url);
    
    this.socket.addEventListener('open', () => {
      this.startHeartbeat();
    });
    
    this.socket.addEventListener('message', (event) => {
      if (event.data === 'pong') {
        this.lastPong = Date.now();
      }
    });
    
    this.socket.addEventListener('close', () => {
      this.stopHeartbeat();
    });
  }
  
  startHeartbeat() {
    this.lastPong = Date.now();
    
    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastPong > this.interval * 2) {
        console.log('No pong received, reconnecting...');
        this.socket.close();
        return;
      }
      
      this.socket.send('ping');
    }, this.interval);
  }
  
  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
  }
}
```

---

## 14.1.9 Summary

### Constructor

```javascript
new WebSocket(url)
new WebSocket(url, protocols)
```

### Properties

| Property | Description |
|----------|-------------|
| `readyState` | Connection state |
| `bufferedAmount` | Bytes queued |
| `protocol` | Selected protocol |
| `url` | WebSocket URL |
| `binaryType` | Binary data type |

### Methods

| Method | Description |
|--------|-------------|
| `send(data)` | Send data |
| `close(code, reason)` | Close connection |

### Events

| Event | When |
|-------|------|
| `open` | Connection opened |
| `message` | Message received |
| `close` | Connection closed |
| `error` | Error occurred |

### Best Practices

1. **Use WSS** (secure WebSocket) in production
2. **Implement reconnection** with exponential backoff
3. **Queue messages** when disconnected
4. **Add heartbeat** to detect dead connections
5. **Handle errors** gracefully
6. **Close properly** on page unload

---

**End of Chapter 14.1: WebSocket API**

Next chapter: **14.2 Server-Sent Events** — one-way server-to-client streaming.
# 14.2 Server-Sent Events

Server-Sent Events (SSE) enables servers to push updates to clients over HTTP. This chapter covers EventSource, handling events, and reconnection.

---

## 14.2.1 Basic Usage

### Create EventSource

```javascript
const source = new EventSource('/events');

source.addEventListener('open', () => {
  console.log('Connection opened');
});

source.addEventListener('message', (event) => {
  console.log('Data:', event.data);
});

source.addEventListener('error', (event) => {
  console.log('Error or closed');
});
```

### Close Connection

```javascript
source.close();
```

---

## 14.2.2 Named Events

### Custom Event Types

```javascript
// Server sends:
// event: notification
// data: {"message": "Hello"}

source.addEventListener('notification', (event) => {
  const data = JSON.parse(event.data);
  console.log('Notification:', data.message);
});

// Multiple event types
source.addEventListener('update', handleUpdate);
source.addEventListener('delete', handleDelete);
```

### Default Message Event

```javascript
// Server sends without event type:
// data: Hello

source.addEventListener('message', (event) => {
  console.log('Message:', event.data);
});
```

---

## 14.2.3 Event Properties

### Event Data

```javascript
source.addEventListener('message', (event) => {
  event.data;         // String data
  event.lastEventId;  // Event ID (for reconnection)
  event.origin;       // Server origin
  event.type;         // Event type ('message', 'notification', etc.)
});
```

---

## 14.2.4 Connection State

### ReadyState

```javascript
// States:
// EventSource.CONNECTING (0) - Connecting
// EventSource.OPEN (1) - Connected
// EventSource.CLOSED (2) - Closed

console.log(source.readyState);

// Check if open
if (source.readyState === EventSource.OPEN) {
  console.log('Connected');
}
```

---

## 14.2.5 Reconnection

### Auto-Reconnect

```javascript
// SSE automatically reconnects on disconnect
// Server can control retry interval:
// retry: 5000  (milliseconds)

source.addEventListener('error', (event) => {
  if (source.readyState === EventSource.CONNECTING) {
    console.log('Reconnecting...');
  } else if (source.readyState === EventSource.CLOSED) {
    console.log('Connection closed');
  }
});
```

### Last Event ID

```javascript
// Browser sends Last-Event-ID header on reconnect
// Server can resume from that point

source.addEventListener('message', (event) => {
  console.log('Last ID:', event.lastEventId);
});
```

---

## 14.2.6 With Credentials

### Send Cookies

```javascript
const source = new EventSource('/events', {
  withCredentials: true
});
```

---

## 14.2.7 Server Implementation

### Node.js Example

```javascript
// Express server
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send event
  function send(data, event) {
    if (event) res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  
  // Send initial data
  send({ connected: true });
  
  // Send updates
  const interval = setInterval(() => {
    send({ time: Date.now() }, 'tick');
  }, 1000);
  
  // Cleanup
  req.on('close', () => {
    clearInterval(interval);
  });
});
```

### Event Format

```
event: notification
id: 123
retry: 5000
data: {"message": "Hello"}
data: {"more": "data"}

```

---

## 14.2.8 SSE vs WebSocket

| Feature | SSE | WebSocket |
|---------|-----|-----------|
| Direction | Server → Client | Bidirectional |
| Protocol | HTTP | WS/WSS |
| Reconnection | Automatic | Manual |
| Binary data | No | Yes |
| Browser support | Wide | Wide |
| Simplicity | Simple | Complex |

### When to Use SSE

- Live feeds (news, stocks)
- Notifications
- Progress updates
- Any one-way streaming

---

## 14.2.9 Wrapper Class

### Enhanced EventSource

```javascript
class SSEClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.handlers = {};
    this.connect();
  }
  
  connect() {
    this.source = new EventSource(this.url, this.options);
    
    this.source.addEventListener('open', () => {
      console.log('SSE connected');
    });
    
    this.source.addEventListener('error', () => {
      if (this.source.readyState === EventSource.CLOSED) {
        console.log('SSE closed, not reconnecting');
      }
    });
    
    // Reattach handlers
    Object.keys(this.handlers).forEach(event => {
      this.source.addEventListener(event, this.handlers[event]);
    });
  }
  
  on(event, handler) {
    this.handlers[event] = handler;
    this.source.addEventListener(event, handler);
    return this;
  }
  
  close() {
    this.source.close();
  }
}

// Usage
const sse = new SSEClient('/events')
  .on('message', (e) => console.log(e.data))
  .on('update', (e) => handleUpdate(JSON.parse(e.data)));
```

---

## 14.2.10 Summary

### Constructor

```javascript
new EventSource(url)
new EventSource(url, { withCredentials: true })
```

### Properties

| Property | Description |
|----------|-------------|
| `readyState` | Connection state |
| `url` | Event source URL |
| `withCredentials` | Send cookies |

### Methods

| Method | Description |
|--------|-------------|
| `close()` | Close connection |

### Events

| Event | When |
|-------|------|
| `open` | Connection opened |
| `message` | Default message |
| `error` | Error/close |
| Custom | Named events |

### Best Practices

1. **Handle reconnection** states properly
2. **Use named events** for different data types
3. **Parse JSON** carefully
4. **Set proper headers** on server
5. **Clean up** on component unmount

---

**End of Chapter 14.2: Server-Sent Events**

Next chapter: **14.3 Beacon API** — send data on page unload.
# 14.3 Beacon API

The Beacon API provides an asynchronous way to send small amounts of data to a server, guaranteed to be sent even when the page is unloading.

---

## 14.3.1 Basic Usage

### sendBeacon

```javascript
// Send data when page unloads
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/analytics', JSON.stringify({
    event: 'page_exit',
    timestamp: Date.now()
  }));
});
```

### Return Value

```javascript
const success = navigator.sendBeacon('/log', data);

if (success) {
  console.log('Beacon queued');
} else {
  console.log('Beacon failed to queue');
}
```

---

## 14.3.2 Data Types

### String Data

```javascript
navigator.sendBeacon('/log', 'user clicked button');
```

### JSON Data

```javascript
const data = { action: 'click', element: 'submit' };
navigator.sendBeacon('/log', JSON.stringify(data));
```

### FormData

```javascript
const formData = new FormData();
formData.append('event', 'pageview');
formData.append('url', location.href);

navigator.sendBeacon('/analytics', formData);
```

### Blob

```javascript
const blob = new Blob([JSON.stringify({ event: 'exit' })], {
  type: 'application/json'
});

navigator.sendBeacon('/log', blob);
```

### URLSearchParams

```javascript
const params = new URLSearchParams({
  event: 'click',
  target: 'button'
});

navigator.sendBeacon('/track', params);
```

---

## 14.3.3 Common Use Cases

### Analytics Tracking

```javascript
class Analytics {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.queue = [];
    
    window.addEventListener('beforeunload', () => this.flush());
  }
  
  track(event, data = {}) {
    this.queue.push({
      event,
      data,
      timestamp: Date.now()
    });
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    const blob = new Blob([JSON.stringify(this.queue)], {
      type: 'application/json'
    });
    
    navigator.sendBeacon(this.endpoint, blob);
    this.queue = [];
  }
}

const analytics = new Analytics('/analytics');
analytics.track('page_view', { path: location.pathname });
```

### Session Duration

```javascript
const sessionStart = Date.now();

window.addEventListener('beforeunload', () => {
  const duration = Date.now() - sessionStart;
  
  navigator.sendBeacon('/session', JSON.stringify({
    duration,
    pages: pageCount
  }));
});
```

### Error Reporting

```javascript
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  };
  
  // Queue error for reporting
  errorQueue.push(errorData);
});

window.addEventListener('beforeunload', () => {
  if (errorQueue.length > 0) {
    navigator.sendBeacon('/errors', JSON.stringify(errorQueue));
  }
});
```

---

## 14.3.4 Beacon vs Fetch

### Why Use Beacon?

```javascript
// ❌ Fetch might be cancelled on unload
window.addEventListener('beforeunload', () => {
  fetch('/log', {
    method: 'POST',
    body: JSON.stringify(data)
  });  // May not complete!
});

// ✅ Beacon is guaranteed to be sent
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/log', JSON.stringify(data));
});
```

### Comparison

| Feature | Beacon | Fetch |
|---------|--------|-------|
| Unload safe | ✅ | ❌ |
| Response access | ❌ | ✅ |
| Custom headers | ❌ | ✅ |
| Max size | ~64KB | Unlimited |
| Method | POST only | Any |
| Async | Always | Configurable |

---

## 14.3.5 Limitations

### No Custom Headers

```javascript
// Cannot set Authorization or custom headers
// Use FormData or Blob with appropriate type
```

### POST Only

```javascript
// Always sends POST request
// Cannot use GET, PUT, DELETE, etc.
```

### No Response

```javascript
// Cannot read response
const result = navigator.sendBeacon('/log', data);
// result is just true/false for queue success
```

### Size Limit

```javascript
// Typically 64KB limit
// For larger data, use Fetch with keepalive
```

---

## 14.3.6 Fetch with keepalive

### Alternative for More Control

```javascript
// For larger payloads or custom headers
window.addEventListener('beforeunload', () => {
  fetch('/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(largeData),
    keepalive: true  // Survive page unload
  });
});
```

---

## 14.3.7 Summary

### Syntax

```javascript
navigator.sendBeacon(url)
navigator.sendBeacon(url, data)
```

### Data Types

| Type | Content-Type |
|------|--------------|
| String | text/plain |
| Blob | Blob's type |
| FormData | multipart/form-data |
| URLSearchParams | application/x-www-form-urlencoded |

### Best Practices

1. **Use for analytics** and logging
2. **Queue events** and flush on unload
3. **Keep payload small** (<64KB)
4. **Use Blob** for JSON with proper Content-Type
5. **Use keepalive fetch** for custom headers
6. **Don't rely on response**

---

**End of Chapter 14.3: Beacon API**

Next chapter: **14.4 Network Information API** — detect connection type and quality.
# 14.4 Network Information API

The Network Information API provides information about the system's connection type and quality. This enables adaptive content delivery based on network conditions.

---

## 14.4.1 Basic Usage

### Access Connection Info

```javascript
const connection = navigator.connection || 
                   navigator.mozConnection || 
                   navigator.webkitConnection;

if (connection) {
  console.log('Type:', connection.effectiveType);
  console.log('Downlink:', connection.downlink, 'Mbps');
  console.log('RTT:', connection.rtt, 'ms');
}
```

---

## 14.4.2 Connection Properties

### effectiveType

```javascript
// Effective connection type based on measured performance
// Values: 'slow-2g', '2g', '3g', '4g'

const connection = navigator.connection;

switch (connection.effectiveType) {
  case 'slow-2g':
  case '2g':
    loadLowQualityImages();
    break;
  case '3g':
    loadMediumQualityImages();
    break;
  case '4g':
    loadHighQualityImages();
    break;
}
```

### downlink

```javascript
// Estimated download speed in Mbps
const speed = connection.downlink;

if (speed < 1) {
  console.log('Slow connection');
} else if (speed < 5) {
  console.log('Moderate connection');
} else {
  console.log('Fast connection');
}
```

### rtt (Round-Trip Time)

```javascript
// Network round-trip time in milliseconds
const latency = connection.rtt;

if (latency > 500) {
  console.log('High latency connection');
}
```

### saveData

```javascript
// User has requested reduced data usage
if (connection.saveData) {
  disableAutoplay();
  loadCompressedAssets();
}
```

### type (Physical Connection)

```javascript
// Physical network type (limited support)
// Values: 'bluetooth', 'cellular', 'ethernet', 'wifi', 'wimax', 'none', 'other', 'unknown'

if (connection.type) {
  console.log('Connection type:', connection.type);
  
  if (connection.type === 'cellular') {
    warnAboutDataUsage();
  }
}
```

---

## 14.4.3 Change Events

### Monitor Connection Changes

```javascript
const connection = navigator.connection;

connection.addEventListener('change', () => {
  console.log('Connection changed');
  console.log('New type:', connection.effectiveType);
  console.log('New speed:', connection.downlink);
  
  updateContentQuality();
});
```

---

## 14.4.4 Adaptive Loading

### Image Quality

```javascript
function getImageQuality() {
  const connection = navigator.connection;
  
  if (!connection) return 'high';
  
  if (connection.saveData) return 'low';
  
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return 'medium';
    default:
      return 'high';
  }
}

function loadImage(baseSrc) {
  const quality = getImageQuality();
  const img = new Image();
  
  img.src = `${baseSrc}?quality=${quality}`;
  return img;
}
```

### Video Quality

```javascript
function getVideoSource(sources) {
  const connection = navigator.connection;
  
  if (!connection) return sources.high;
  
  if (connection.effectiveType === '4g' && connection.downlink > 5) {
    return sources.high;
  } else if (connection.effectiveType === '3g') {
    return sources.medium;
  } else {
    return sources.low;
  }
}
```

### Prefetch Strategy

```javascript
function setupPrefetch() {
  const connection = navigator.connection;
  
  if (!connection) return;
  
  // Only prefetch on fast connections
  if (connection.effectiveType === '4g' && !connection.saveData) {
    prefetchNextPage();
    preloadImages();
  }
}
```

---

## 14.4.5 Complete Example

### Adaptive Media Loader

```javascript
class AdaptiveLoader {
  constructor() {
    this.connection = navigator.connection;
    this.quality = this.determineQuality();
    
    if (this.connection) {
      this.connection.addEventListener('change', () => {
        this.quality = this.determineQuality();
        this.onQualityChange?.(this.quality);
      });
    }
  }
  
  determineQuality() {
    if (!this.connection) return 'high';
    
    const { effectiveType, saveData, downlink } = this.connection;
    
    if (saveData) return 'low';
    
    if (effectiveType === '4g' && downlink > 5) return 'high';
    if (effectiveType === '3g' || downlink > 1) return 'medium';
    return 'low';
  }
  
  getImageSrc(baseSrc) {
    const sizes = { low: 480, medium: 720, high: 1080 };
    return `${baseSrc}?w=${sizes[this.quality]}`;
  }
  
  shouldAutoplay() {
    if (!this.connection) return true;
    return this.connection.effectiveType === '4g' && 
           !this.connection.saveData;
  }
  
  shouldPreload() {
    return this.quality === 'high';
  }
}

const loader = new AdaptiveLoader();
loader.onQualityChange = (quality) => {
  console.log('Quality changed to:', quality);
};
```

---

## 14.4.6 Browser Support

### Feature Detection

```javascript
function isNetworkInfoSupported() {
  return 'connection' in navigator || 
         'mozConnection' in navigator || 
         'webkitConnection' in navigator;
}

function getConnection() {
  return navigator.connection || 
         navigator.mozConnection || 
         navigator.webkitConnection;
}
```

### Polyfill Strategy

```javascript
function getNetworkInfo() {
  const connection = getConnection();
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 50,
      saveData: connection.saveData || false
    };
  }
  
  // Default fallback
  return {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  };
}
```

---

## 14.4.7 Summary

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `effectiveType` | String | '2g', '3g', '4g' |
| `downlink` | Number | Speed in Mbps |
| `rtt` | Number | Latency in ms |
| `saveData` | Boolean | Data saver enabled |
| `type` | String | Physical type |

### Events

| Event | When |
|-------|------|
| `change` | Connection changes |

### Best Practices

1. **Feature detect** before using
2. **Provide fallbacks** for unsupported browsers
3. **Respect saveData** preference
4. **Adapt content** based on connection
5. **Listen for changes** to update dynamically
6. **Don't block** on slow connections

---

**End of Chapter 14.4: Network Information API**

This completes Group 14 — Connectivity APIs. Next section: **Group 15 — Security and Authentication**.
