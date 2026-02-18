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
