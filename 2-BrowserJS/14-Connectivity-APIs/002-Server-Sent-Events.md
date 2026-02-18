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
