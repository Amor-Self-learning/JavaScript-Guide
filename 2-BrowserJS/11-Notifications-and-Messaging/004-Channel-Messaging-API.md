# 11.4 Channel Messaging API

The Channel Messaging API provides a way to create direct communication channels between browsing contexts. Unlike Broadcast Channel, it enables targeted one-to-one messaging via MessageChannel and MessagePort.

---

## 11.4.1 Channel Messaging Overview

### What Is Channel Messaging?

```javascript
// Channel Messaging provides:
// - Direct communication between two contexts
// - Two linked MessagePorts
// - One-to-one messaging (not broadcast)
// - Can be transferred to workers, iframes
// - Bidirectional communication
```

### Components

```javascript
// MessageChannel - creates port pair
const channel = new MessageChannel();

// MessagePort - communication endpoint
channel.port1  // One end
channel.port2  // Other end

// Messages sent on port1 arrive at port2 and vice versa
```

---

## 11.4.2 MessageChannel

### Creating a Channel

```javascript
// Create channel
const channel = new MessageChannel();

// Send port2 somewhere else (iframe, worker)
iframe.contentWindow.postMessage('init', '*', [channel.port2]);

// Use port1 locally
channel.port1.onmessage = (event) => {
  console.log('Received:', event.data);
};

channel.port1.start();
channel.port1.postMessage('Hello from main!');
```

### Port Properties

```javascript
const channel = new MessageChannel();

// port1 and port2 are MessagePort objects
// Messages sent on one arrive at the other
channel.port1.postMessage('Hello');  // Arrives at port2
channel.port2.postMessage('Hi');     // Arrives at port1
```

---

## 11.4.3 MessagePort

### Basic Usage

```javascript
const channel = new MessageChannel();
const port = channel.port1;

// Send message
port.postMessage('Hello');
port.postMessage({ type: 'data', value: 42 });
port.postMessage([1, 2, 3]);

// Receive messages
port.onmessage = (event) => {
  console.log('Received:', event.data);
};

// Or with addEventListener (requires start())
port.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});
port.start();  // Required when using addEventListener
```

### Port Methods

```javascript
// postMessage - send data
port.postMessage(data);
port.postMessage(data, [transferable]);

// start - begin receiving (only needed with addEventListener)
port.start();

// close - close the port
port.close();
```

### Message Error

```javascript
port.onmessageerror = (event) => {
  console.error('Failed to deserialize message');
};
```

---

## 11.4.4 Transferring Ports

### To Iframe

```javascript
// Parent page
const iframe = document.querySelector('iframe');
const channel = new MessageChannel();

// Send port2 to iframe
iframe.contentWindow.postMessage('port', '*', [channel.port2]);

// Use port1 locally
channel.port1.onmessage = (e) => console.log('From iframe:', e.data);
channel.port1.start();
```

```javascript
// Iframe
window.onmessage = (event) => {
  if (event.data === 'port') {
    const port = event.ports[0];
    
    port.onmessage = (e) => console.log('From parent:', e.data);
    port.start();
    
    port.postMessage('Hello from iframe!');
  }
};
```

### To Worker

```javascript
// Main thread
const worker = new Worker('worker.js');
const channel = new MessageChannel();

// Send port2 to worker
worker.postMessage({ type: 'port' }, [channel.port2]);

// Use port1
channel.port1.onmessage = (e) => console.log('From worker:', e.data);
channel.port1.start();
```

```javascript
// worker.js
self.onmessage = (event) => {
  if (event.data.type === 'port') {
    const port = event.ports[0];
    
    port.onmessage = (e) => {
      console.log('From main:', e.data);
      port.postMessage('Response from worker');
    };
    port.start();
  }
};
```

---

## 11.4.5 Transferable Objects

### Transferring Data

```javascript
const channel = new MessageChannel();

// Transfer ArrayBuffer (moves, not copies)
const buffer = new ArrayBuffer(1024 * 1024);
channel.port1.postMessage(buffer, [buffer]);
// buffer.byteLength is now 0

// Transfer multiple objects
const buffer1 = new ArrayBuffer(1024);
const buffer2 = new ArrayBuffer(1024);
channel.port1.postMessage(
  { a: buffer1, b: buffer2 },
  [buffer1, buffer2]
);
```

### Transferable Types

```javascript
// Types that can be transferred:
// - ArrayBuffer
// - MessagePort
// - ImageBitmap
// - OffscreenCanvas
// - ReadableStream
// - WritableStream
// - TransformStream

// Transfer port to another context
const newChannel = new MessageChannel();
someOtherPort.postMessage({ port: newChannel.port2 }, [newChannel.port2]);
```

---

## 11.4.6 Common Patterns

### Request-Response

```javascript
// Request-response pattern
class PortRPC {
  constructor(port) {
    this.port = port;
    this.pending = new Map();
    this.nextId = 0;
    
    this.port.onmessage = (e) => this.handleMessage(e);
    this.port.start();
  }
  
  handleMessage(event) {
    const { id, type, result, error } = event.data;
    
    if (type === 'response') {
      const { resolve, reject } = this.pending.get(id);
      this.pending.delete(id);
      
      if (error) reject(new Error(error));
      else resolve(result);
    }
  }
  
  call(method, args) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      
      this.port.postMessage({
        id,
        type: 'request',
        method,
        args
      });
    });
  }
}

// Server side (worker or iframe)
class PortRPCServer {
  constructor(port, handlers) {
    this.port = port;
    this.handlers = handlers;
    
    this.port.onmessage = (e) => this.handleMessage(e);
    this.port.start();
  }
  
  async handleMessage(event) {
    const { id, type, method, args } = event.data;
    
    if (type === 'request') {
      try {
        const handler = this.handlers[method];
        if (!handler) throw new Error(`Unknown method: ${method}`);
        
        const result = await handler(...args);
        this.port.postMessage({ id, type: 'response', result });
      } catch (error) {
        this.port.postMessage({ id, type: 'response', error: error.message });
      }
    }
  }
}
```

### Iframe Communication

```javascript
// Parent page - iframe manager
class IframeBridge {
  constructor(iframe) {
    this.iframe = iframe;
    this.ready = this.init();
  }
  
  async init() {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      this.port = channel.port1;
      
      this.port.onmessage = (e) => this.handleMessage(e);
      this.port.start();
      
      // Wait for iframe to load
      this.iframe.onload = () => {
        this.iframe.contentWindow.postMessage(
          { type: 'connect' },
          '*',
          [channel.port2]
        );
      };
      
      // Wait for ready message
      const originalHandler = this.handleMessage.bind(this);
      this.handleMessage = (e) => {
        if (e.data.type === 'ready') {
          this.handleMessage = originalHandler;
          resolve();
        }
      };
    });
  }
  
  handleMessage(event) {
    console.log('From iframe:', event.data);
  }
  
  send(message) {
    this.port.postMessage(message);
  }
}

// Iframe side
window.addEventListener('message', (event) => {
  if (event.data.type === 'connect' && event.ports[0]) {
    const port = event.ports[0];
    
    port.onmessage = (e) => {
      console.log('From parent:', e.data);
    };
    port.start();
    
    // Signal ready
    port.postMessage({ type: 'ready' });
    
    // Store for later use
    window.parentPort = port;
  }
});
```

### Worker Pool

```javascript
// Worker pool using MessageChannels
class WorkerPool {
  constructor(workerScript, size = 4) {
    this.workers = [];
    this.available = [];
    this.queue = [];
    
    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerScript);
      this.workers.push(worker);
      this.available.push(worker);
    }
  }
  
  execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  processQueue() {
    if (this.queue.length === 0 || this.available.length === 0) {
      return;
    }
    
    const worker = this.available.pop();
    const { task, resolve, reject } = this.queue.shift();
    
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (e) => {
      this.available.push(worker);
      
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
      
      this.processQueue();
    };
    
    channel.port1.start();
    worker.postMessage({ task }, [channel.port2]);
  }
  
  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}
```

---

## 11.4.7 Summary

### Key Classes

| Class | Description |
|-------|-------------|
| `MessageChannel` | Creates linked port pair |
| `MessagePort` | Communication endpoint |

### MessagePort Methods

| Method | Description |
|--------|-------------|
| `postMessage(data, [transfers])` | Send message |
| `start()` | Begin receiving |
| `close()` | Close port |

### Events

| Event | When |
|-------|------|
| `message` | Message received |
| `messageerror` | Deserialization failed |

### Use Cases

| Scenario | Description |
|----------|-------------|
| Iframe communication | Direct parent-child messaging |
| Worker communication | Dedicated channel to worker |
| RPC patterns | Request-response messaging |
| Port transfer | Moving channels between contexts |

### Best Practices

1. **Use start()** when using addEventListener
2. **Close ports** when done
3. **Transfer large data** instead of copying
4. **Handle messageerror** for robustness
5. **Use RPC patterns** for request-response
6. **Consider Broadcast Channel** for one-to-many

---

**End of Chapter 11.4: Channel Messaging API**

This completes the Notifications and Messaging group. Next section: **Group 12 — Device APIs** — covers device hardware access.
