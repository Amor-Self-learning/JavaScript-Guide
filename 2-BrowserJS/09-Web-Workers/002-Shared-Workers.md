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
