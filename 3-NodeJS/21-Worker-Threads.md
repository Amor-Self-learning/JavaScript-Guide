# Module 21: Worker Threads

Worker threads enable true parallel JavaScript execution in Node.js. Unlike the cluster module (which creates processes), worker threads share memory and are ideal for CPU-intensive tasks.

---

## 21.1 Module Import

```javascript
// CommonJS
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// ES Modules
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
```

---

## 21.2 Basic Usage

### Main Thread

```javascript
const { Worker } = require('worker_threads');

// Create worker from file
const worker = new Worker('./worker.js', {
  workerData: { value: 100 }
});

// Receive messages
worker.on('message', result => {
  console.log('Result:', result);
});

// Handle errors
worker.on('error', err => {
  console.error('Worker error:', err);
});

// Worker exited
worker.on('exit', code => {
  if (code !== 0) {
    console.error(`Worker stopped with exit code ${code}`);
  }
});
```

### Worker Thread

```javascript
// worker.js
const { parentPort, workerData } = require('worker_threads');

// Access data passed from main thread
const { value } = workerData;

// Do computation
let result = 0;
for (let i = 0; i < value * 1e6; i++) {
  result += i;
}

// Send result back
parentPort.postMessage(result);
```

---

## 21.3 Inline Workers

Create workers without separate files:

```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // Main thread
  const worker = new Worker(`
    const { parentPort } = require('worker_threads');
    parentPort.postMessage('Hello from worker!');
  `, { eval: true });
  
  worker.on('message', msg => console.log(msg));
  
} else {
  // This code won't run for inline workers
}
```

### With Function

```javascript
function runWorker(fn, ...args) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData } = require('worker_threads');
      const fn = ${fn.toString()};
      const result = fn(...workerData.args);
      parentPort.postMessage(result);
    `, {
      eval: true,
      workerData: { args }
    });
    
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// Usage
const result = await runWorker((a, b) => a + b, 10, 20);
console.log(result);  // 30
```

---

## 21.4 Communication

### postMessage / on('message')

```javascript
// Main thread
const worker = new Worker('./worker.js');

// Send to worker
worker.postMessage({ type: 'task', data: [1, 2, 3] });

// Receive from worker
worker.on('message', msg => {
  console.log('From worker:', msg);
});

// Worker thread
parentPort.on('message', msg => {
  if (msg.type === 'task') {
    const result = msg.data.map(x => x * 2);
    parentPort.postMessage({ type: 'result', data: result });
  }
});
```

### MessageChannel

```javascript
const { Worker, MessageChannel } = require('worker_threads');

const worker = new Worker('./worker.js');
const { port1, port2 } = new MessageChannel();

// Send port to worker
worker.postMessage({ port: port2 }, [port2]);

// Communicate via channel
port1.on('message', msg => console.log('Channel message:', msg));
port1.postMessage('Hello via channel');
```

### BroadcastChannel

```javascript
const { BroadcastChannel, Worker } = require('worker_threads');

// Main thread
const channel = new BroadcastChannel('my-channel');

channel.onmessage = event => {
  console.log('Broadcast received:', event.data);
};

// Any worker or main thread can send
channel.postMessage('Hello everyone!');
```

---

## 21.5 Shared Memory

### SharedArrayBuffer

```javascript
// Main thread
const { Worker } = require('worker_threads');

// Create shared buffer
const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);
sharedArray[0] = 100;

const worker = new Worker('./worker.js', {
  workerData: { sharedBuffer }
});

worker.on('exit', () => {
  console.log('Value after worker:', sharedArray[0]);  // 200
});
```

```javascript
// worker.js
const { workerData } = require('worker_threads');

const sharedArray = new Int32Array(workerData.sharedBuffer);

// Modify shared memory
sharedArray[0] = 200;
```

### Atomics (Thread-Safe Operations)

```javascript
const { Worker } = require('worker_threads');

const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

// Atomic operations
Atomics.store(sharedArray, 0, 0);

const workers = [];
for (let i = 0; i < 4; i++) {
  workers.push(new Worker(`
    const { workerData } = require('worker_threads');
    const arr = new Int32Array(workerData.buffer);
    
    // Atomically increment 1000 times
    for (let i = 0; i < 1000; i++) {
      Atomics.add(arr, 0, 1);
    }
  `, {
    eval: true,
    workerData: { buffer: sharedBuffer }
  }));
}

// Wait for all workers
await Promise.all(workers.map(w => new Promise(r => w.on('exit', r))));

console.log('Final value:', Atomics.load(sharedArray, 0));  // 4000
```

### Atomics.wait / notify

```javascript
// Worker waiting
const arr = new Int32Array(sharedBuffer);

// Wait until value is not 0
Atomics.wait(arr, 0, 0);  // Blocks until notified
console.log('Woke up! Value:', arr[0]);

// Main thread notifying
Atomics.store(arr, 0, 42);
Atomics.notify(arr, 0, 1);  // Wake one waiting thread
Atomics.notify(arr, 0, Infinity);  // Wake all waiting threads
```

---

## 21.6 Transferable Objects

Transfer ownership instead of copying:

```javascript
const { Worker } = require('worker_threads');

// Create large buffer
const buffer = new ArrayBuffer(1e8);  // 100 MB

console.log('Before transfer:', buffer.byteLength);  // 100000000

const worker = new Worker('./worker.js');

// Transfer (not copy) the buffer
worker.postMessage({ buffer }, [buffer]);

console.log('After transfer:', buffer.byteLength);  // 0 (transferred!)
```

### Transferable Types

```javascript
// ArrayBuffer
worker.postMessage({ buffer }, [buffer]);

// MessagePort
const { port1, port2 } = new MessageChannel();
worker.postMessage({ port: port2 }, [port2]);

// Typed Arrays (transfer underlying buffer)
const arr = new Uint8Array(1024);
worker.postMessage({ arr }, [arr.buffer]);
```

---

## 21.7 Worker Pool

```javascript
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
  constructor(workerScript, numWorkers = os.cpus().length) {
    this.workerScript = workerScript;
    this.numWorkers = numWorkers;
    this.workers = [];
    this.freeWorkers = [];
    this.queue = [];
    
    this.init();
  }
  
  init() {
    for (let i = 0; i < this.numWorkers; i++) {
      this.addWorker();
    }
  }
  
  addWorker() {
    const worker = new Worker(this.workerScript);
    
    worker.on('message', result => {
      worker.resolve(result);
      worker.resolve = null;
      this.freeWorkers.push(worker);
      this.processQueue();
    });
    
    worker.on('error', err => {
      if (worker.reject) {
        worker.reject(err);
      }
      this.workers = this.workers.filter(w => w !== worker);
      this.addWorker();
    });
    
    this.workers.push(worker);
    this.freeWorkers.push(worker);
  }
  
  processQueue() {
    if (this.queue.length === 0 || this.freeWorkers.length === 0) return;
    
    const { task, resolve, reject } = this.queue.shift();
    const worker = this.freeWorkers.pop();
    
    worker.resolve = resolve;
    worker.reject = reject;
    worker.postMessage(task);
  }
  
  execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}

// Usage
const pool = new WorkerPool('./compute-worker.js', 4);

const results = await Promise.all([
  pool.execute({ value: 1000 }),
  pool.execute({ value: 2000 }),
  pool.execute({ value: 3000 }),
  pool.execute({ value: 4000 })
]);

console.log(results);
pool.terminate();
```

---

## 21.8 Worker Options

```javascript
const worker = new Worker('./worker.js', {
  workerData: { config: 'data' },  // Initial data
  
  env: process.env,                // Environment variables
  // env: SHARE_ENV               // Share parent's env
  
  execArgv: ['--max-old-space-size=2048'],  // Node.js flags
  
  argv: ['--mode', 'production'],  // Worker arguments
  
  stdin: false,                    // Readable stdin
  stdout: true,                    // Pipe stdout
  stderr: true,                    // Pipe stderr
  
  resourceLimits: {
    maxOldGenerationSizeMb: 128,
    maxYoungGenerationSizeMb: 32,
    codeRangeSizeMb: 32,
    stackSizeMb: 4
  },
  
  name: 'my-worker',               // Worker name for debugging
  
  trackUnmanagedFds: true          // Track file descriptors
});

// Access stdout/stderr when piped
worker.stdout.on('data', data => console.log('Worker stdout:', data.toString()));
worker.stderr.on('data', data => console.log('Worker stderr:', data.toString()));
```

---

## 21.9 Thread Info

```javascript
const {
  threadId,
  isMainThread,
  resourceLimits
} = require('worker_threads');

console.log('Thread ID:', threadId);
console.log('Is main thread:', isMainThread);

if (!isMainThread) {
  console.log('Resource limits:', resourceLimits);
  // { maxOldGenerationSizeMb: 128, ... }
}
```

---

## 21.10 Common Patterns

### CPU-Intensive Task

```javascript
// main.js
const { Worker } = require('worker_threads');

function fibonacci(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData } = require('worker_threads');
      
      function fib(n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
      }
      
      parentPort.postMessage(fib(workerData.n));
    `, {
      eval: true,
      workerData: { n }
    });
    
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// Compute in parallel
const results = await Promise.all([
  fibonacci(40),
  fibonacci(41),
  fibonacci(42)
]);
```

### Image Processing

```javascript
// worker.js
const { parentPort, workerData } = require('worker_threads');
const sharp = require('sharp');  // npm install sharp

const { imageBuffer, options } = workerData;

sharp(imageBuffer)
  .resize(options.width, options.height)
  .toBuffer()
  .then(outputBuffer => {
    parentPort.postMessage(outputBuffer, [outputBuffer.buffer]);
  });
```

### Parallel Array Processing

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

if (isMainThread) {
  async function parallelMap(array, fn, numWorkers = os.cpus().length) {
    const chunkSize = Math.ceil(array.length / numWorkers);
    const chunks = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    
    const results = await Promise.all(
      chunks.map(chunk => 
        new Promise((resolve, reject) => {
          const worker = new Worker(__filename, {
            workerData: { chunk, fn: fn.toString() }
          });
          worker.on('message', resolve);
          worker.on('error', reject);
        })
      )
    );
    
    return results.flat();
  }
  
  // Usage
  const data = Array.from({ length: 1000000 }, (_, i) => i);
  const result = await parallelMap(data, x => x * 2);
  
} else {
  const { chunk, fn } = workerData;
  const mapFn = eval(`(${fn})`);
  const result = chunk.map(mapFn);
  parentPort.postMessage(result);
}
```

---

## 21.11 Worker Threads vs Cluster vs Child Process

| Feature | Worker Threads | Cluster | Child Process |
|---------|---------------|---------|---------------|
| Memory | Shared (SharedArrayBuffer) | Isolated | Isolated |
| Overhead | Low | High | High |
| Port sharing | No | Yes | No |
| Use case | CPU tasks | HTTP scaling | External programs |
| Communication | postMessage | IPC | stdin/stdout/IPC |

---

## 21.12 Summary

| Export | Description |
|--------|-------------|
| `Worker` | Create worker thread |
| `isMainThread` | Is this main thread? |
| `parentPort` | Port to communicate with parent |
| `workerData` | Initial data from parent |
| `threadId` | Current thread ID |
| `MessageChannel` | Create message channel |
| `MessagePort` | Port for messaging |
| `BroadcastChannel` | Broadcast to all threads |

| Worker Events | Description |
|---------------|-------------|
| `message` | Message received |
| `error` | Error occurred |
| `exit` | Worker exited |
| `online` | Worker started |
| `messageerror` | Deserialization error |

| Worker Methods | Description |
|----------------|-------------|
| `postMessage(data, transfer)` | Send message |
| `terminate()` | Kill worker |
| `ref()` / `unref()` | Keep/don't keep process alive |
| `getHeapSnapshot()` | Heap snapshot |

| Atomics | Description |
|---------|-------------|
| `Atomics.add()` | Atomic add |
| `Atomics.sub()` | Atomic subtract |
| `Atomics.load()` | Atomic read |
| `Atomics.store()` | Atomic write |
| `Atomics.wait()` | Wait for value change |
| `Atomics.notify()` | Wake waiting threads |

---

**End of Module 21: Worker Threads**

Next: **Module 22 — Test Runner** (Built-in testing)
