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
