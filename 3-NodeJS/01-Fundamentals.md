# Module 1: Node.js Fundamentals

Node.js is a JavaScript runtime built on Chrome's V8 engine that enables server-side JavaScript execution. This module covers the architecture, global objects, and key differences from browser JavaScript.

---

## 1.1 Node.js Architecture

### What It Is

Node.js is an open-source, cross-platform runtime environment that executes JavaScript outside of a web browser. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    Node.js Application                   │
├─────────────────────────────────────────────────────────┤
│                    Node.js Bindings                      │
│                 (C++ bindings to V8 & libuv)             │
├──────────────────────┬──────────────────────────────────┤
│         V8           │              libuv                │
│   (JavaScript        │      (Async I/O, Event Loop,     │
│    Engine)           │       Thread Pool, Networking)    │
├──────────────────────┴──────────────────────────────────┤
│                   Operating System                       │
└─────────────────────────────────────────────────────────┘
```

### V8 Engine

V8 is Google's open-source JavaScript engine written in C++:

```javascript
// V8 compiles JavaScript directly to native machine code
// No interpreter needed — JIT (Just-In-Time) compilation

// V8 optimizations you should know about:
// 1. Hidden classes — objects with same properties share structure
// 2. Inline caching — speeds up repeated property access
// 3. Garbage collection — generational, incremental GC

// Example: Hidden classes work best with consistent object shapes
// ✅ Good: Same property order
function createUser(name, age) {
  return { name, age };  // Always same shape
}

// ❌ Bad: Dynamic property addition breaks optimization
function createUserBad(name) {
  const user = { name };
  user.age = 25;  // Different shape than { name, age }
  return user;
}
```

### libuv

libuv is a multi-platform C library providing:

- **Event loop** — the core of Node.js async behavior
- **Thread pool** — for file I/O and DNS operations (default 4 threads)
- **Async I/O** — non-blocking operations
- **Timers** — setTimeout, setInterval, setImmediate

```javascript
// The event loop processes callbacks in phases:
// 1. Timers — setTimeout, setInterval
// 2. Pending callbacks — I/O callbacks deferred from previous loop
// 3. Idle, prepare — internal use
// 4. Poll — retrieve new I/O events, execute I/O callbacks
// 5. Check — setImmediate callbacks
// 6. Close callbacks — socket.on('close')

// Demonstrating event loop phases
console.log('1. Synchronous');

setTimeout(() => console.log('2. Timer (setTimeout)'), 0);

setImmediate(() => console.log('3. Check (setImmediate)'));

process.nextTick(() => console.log('4. nextTick (microtask)'));

Promise.resolve().then(() => console.log('5. Promise (microtask)'));

console.log('6. Synchronous');

// Output order:
// 1. Synchronous
// 6. Synchronous
// 4. nextTick (microtask)
// 5. Promise (microtask)
// 2. Timer (setTimeout) — may vary with setImmediate
// 3. Check (setImmediate)
```

### Single-Threaded Event Loop

```javascript
// Node.js is single-threaded for JavaScript execution
// But uses worker threads for I/O operations

const fs = require('fs');

// This doesn't block the main thread
fs.readFile('large-file.txt', (err, data) => {
  // Callback runs when file is read (on thread pool)
  console.log('File read complete');
});

// This runs immediately while file is being read
console.log('Reading file in background...');

// ❌ Wrong: CPU-intensive work blocks event loop
function badFibonacci(n) {
  if (n <= 1) return n;
  return badFibonacci(n - 1) + badFibonacci(n - 2);
}
// badFibonacci(45);  // Blocks everything!

// ✅ Correct: Offload to worker thread or break into chunks
const { Worker } = require('worker_threads');
// Use workers for CPU-intensive tasks
```

### Non-Blocking I/O

```javascript
const fs = require('fs');
const https = require('https');

// All these operations run concurrently
// None of them block the main thread

// File read
fs.readFile('config.json', 'utf8', (err, data) => {
  console.log('Config loaded');
});

// HTTP request
https.get('https://api.example.com/data', (res) => {
  console.log('API response received');
});

// Database query (hypothetical)
// db.query('SELECT * FROM users', (err, results) => {
//   console.log('Query complete');
// });

console.log('All operations started');

// Output:
// All operations started
// (then callbacks fire as operations complete)
```

---

## 1.2 Global Objects

### The `global` Object

In Node.js, `global` is the global namespace object (equivalent to `window` in browsers):

```javascript
// global is the top-level object
console.log(global);

// Variables declared without var/let/const become global properties
// ❌ Bad practice
myGlobal = 'I am global';
console.log(global.myGlobal);  // 'I am global'

// ✅ Variables declared with let/const are NOT on global
let myLocal = 'I am local';
console.log(global.myLocal);  // undefined

// Built-in globals available everywhere
console.log(global.setTimeout);   // [Function: setTimeout]
console.log(global.setInterval);  // [Function: setInterval]
console.log(global.setImmediate); // [Function: setImmediate]
console.log(global.clearTimeout); // [Function: clearTimeout]

// globalThis — standard way to access global (ES2020+)
console.log(globalThis === global);  // true in Node.js
```

### The `process` Object

`process` provides information and control over the current Node.js process:

```javascript
// Process information
console.log(process.version);      // v18.17.0
console.log(process.versions);     // { node, v8, uv, ... }
console.log(process.platform);     // 'linux', 'darwin', 'win32'
console.log(process.arch);         // 'x64', 'arm64'
console.log(process.pid);          // Process ID
console.log(process.ppid);         // Parent process ID
console.log(process.title);        // Process title
console.log(process.uptime());     // Seconds since process started

// Command line arguments
// node script.js arg1 arg2 --flag
console.log(process.argv);
// [
//   '/usr/bin/node',     // Node.js executable path
//   '/path/to/script.js', // Script path
//   'arg1',
//   'arg2',
//   '--flag'
// ]

// Parse arguments
const args = process.argv.slice(2);
console.log(args);  // ['arg1', 'arg2', '--flag']

// Environment variables
console.log(process.env.NODE_ENV);  // 'production' or 'development'
console.log(process.env.PATH);      // System PATH
console.log(process.env.HOME);      // Home directory

// Set environment variable
process.env.MY_VAR = 'my-value';

// Current working directory
console.log(process.cwd());  // /path/to/current/directory

// Change directory
process.chdir('/tmp');

// Memory usage
const memory = process.memoryUsage();
console.log({
  rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,       // Resident Set Size
  heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
  external: `${Math.round(memory.external / 1024 / 1024)} MB`
});

// Exit process
process.exit(0);  // Success
process.exit(1);  // Error

// Exit event
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
  // Only synchronous operations work here
});

// Standard I/O streams
process.stdin;   // Readable stream
process.stdout;  // Writable stream
process.stderr;  // Writable stream

process.stdout.write('Hello without newline');
process.stderr.write('Error message\n');
```

### `__dirname` and `__filename`

```javascript
// __filename — absolute path to current file
console.log(__filename);
// /home/user/project/src/app.js

// __dirname — absolute path to directory containing current file
console.log(__dirname);
// /home/user/project/src

// Common use: resolve paths relative to current file
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const dataPath = path.join(__dirname, '..', 'data', 'file.txt');

// Note: __dirname and __filename are NOT available in ES modules
// Use import.meta.url instead:
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
```

### `console` Object

```javascript
// Standard output
console.log('Regular message');
console.info('Info message');

// Error output (to stderr)
console.error('Error message');
console.warn('Warning message');

// Object inspection
const obj = { name: 'Alice', nested: { deep: true } };
console.log(obj);  // May truncate deep objects
console.dir(obj, { depth: null });  // Full depth

// Formatted output
console.log('Name: %s, Age: %d', 'Bob', 25);
console.log('Object: %o', { key: 'value' });
console.log('JSON: %j', { key: 'value' });

// Timing
console.time('operation');
// ... some operation
console.timeEnd('operation');  // operation: 123.456ms
console.timeLog('operation');  // Log without ending

// Counting
console.count('myLabel');  // myLabel: 1
console.count('myLabel');  // myLabel: 2
console.countReset('myLabel');

// Grouping
console.group('Outer');
console.log('Inside group');
console.group('Inner');
console.log('Nested');
console.groupEnd();
console.groupEnd();

// Table
console.table([
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
]);

// Stack trace
console.trace('Trace message');

// Assertions
console.assert(1 === 1, 'This won\'t print');
console.assert(1 === 2, 'Assertion failed!');  // Prints with stack trace

// Clear (in supported terminals)
console.clear();
```

### Buffer

`Buffer` is a global class for handling binary data:

```javascript
// Create buffers
const buf1 = Buffer.alloc(10);              // 10 zero-filled bytes
const buf2 = Buffer.alloc(10, 1);           // 10 bytes filled with 1
const buf3 = Buffer.allocUnsafe(10);        // Uninitialized (faster, but contains old data)
const buf4 = Buffer.from([1, 2, 3, 4, 5]);  // From array
const buf5 = Buffer.from('Hello');          // From string (UTF-8)
const buf6 = Buffer.from('48656c6c6f', 'hex');  // From hex string

// Read buffer
console.log(buf5.toString());        // 'Hello'
console.log(buf5.toString('hex'));   // '48656c6c6f'
console.log(buf5.toString('base64')); // 'SGVsbG8='

// Buffer properties
console.log(buf5.length);  // 5
console.log(buf5[0]);      // 72 (ASCII 'H')

// Write to buffer
buf1.write('Hi');
buf1[0] = 65;  // 'A'

// Concatenate buffers
const combined = Buffer.concat([buf4, buf5]);

// Compare buffers
console.log(buf5.equals(Buffer.from('Hello')));  // true
console.log(Buffer.compare(buf4, buf5));  // -1, 0, or 1

// Copy buffer
const target = Buffer.alloc(10);
buf5.copy(target, 0, 0, 3);  // Copy 'Hel' to target

// Slice (creates a view, not a copy!)
const slice = buf5.slice(0, 3);  // 'Hel'
slice[0] = 74;  // Modifies buf5 too!

// subarray (same as slice, preferred in newer code)
const sub = buf5.subarray(0, 3);
```

### Timers

```javascript
// setTimeout — run once after delay
const timeoutId = setTimeout(() => {
  console.log('Executed after 1 second');
}, 1000);

// Clear timeout
clearTimeout(timeoutId);

// setInterval — run repeatedly
const intervalId = setInterval(() => {
  console.log('Executed every 2 seconds');
}, 2000);

// Clear interval
clearInterval(intervalId);

// setImmediate — run after current poll phase
const immediateId = setImmediate(() => {
  console.log('Executed immediately after I/O');
});

clearImmediate(immediateId);

// process.nextTick — run before any I/O
process.nextTick(() => {
  console.log('Executed before any I/O or timers');
});

// Order of execution
setImmediate(() => console.log('1. setImmediate'));
setTimeout(() => console.log('2. setTimeout 0'), 0);
process.nextTick(() => console.log('3. nextTick'));
Promise.resolve().then(() => console.log('4. Promise'));
console.log('5. Synchronous');

// Output:
// 5. Synchronous
// 3. nextTick
// 4. Promise
// 2. setTimeout 0  (or 1. setImmediate — order varies)
// 1. setImmediate  (or 2. setTimeout 0)
```

### queueMicrotask

```javascript
// queueMicrotask — standard way to queue microtasks
queueMicrotask(() => {
  console.log('Microtask');
});

// Equivalent to Promise.resolve().then()
// But cleaner and more intentional

// Use case: defer work without setTimeout overhead
function processData(data) {
  queueMicrotask(() => {
    // Heavy processing after current sync code completes
    // But before any I/O
  });
}
```

---

## 1.3 Node.js vs Browser

### Key Differences

| Feature | Node.js | Browser |
|---------|---------|---------|
| Global object | `global` / `globalThis` | `window` / `globalThis` |
| Module system | CommonJS / ESM | ESM (native) |
| DOM APIs | ❌ Not available | ✅ Full access |
| File system | ✅ `fs` module | ❌ Limited (File API) |
| Network | ✅ `http`, `net`, `dgram` | ✅ `fetch`, `WebSocket` |
| `require()` | ✅ Native | ❌ Not available |
| `__dirname` | ✅ Available (CJS) | ❌ Not available |
| `process` | ✅ Full access | ❌ Not available |
| `Buffer` | ✅ Native | ❌ Use `ArrayBuffer` |
| Threading | Worker Threads | Web Workers |

### Code That Works Differently

```javascript
// --- Global Object ---
// Node.js
console.log(global);
console.log(globalThis === global);  // true

// Browser
// console.log(window);
// console.log(globalThis === window);  // true

// --- Module Loading ---
// Node.js CommonJS
const fs = require('fs');
module.exports = { myFunction };

// Node.js ESM / Browser ESM
// import fs from 'fs';
// export { myFunction };

// --- Path Handling ---
// Node.js
const path = require('path');
const filePath = path.join(__dirname, 'data.txt');

// Browser (no file paths, use URLs)
// const url = new URL('data.txt', import.meta.url);

// --- Timers ---
// Both have setTimeout/setInterval/clearTimeout/clearInterval
setTimeout(() => {}, 1000);

// Node.js only
setImmediate(() => {});     // Browser: use setTimeout(fn, 0)
process.nextTick(() => {}); // Browser: use queueMicrotask()

// --- Console ---
// Both have console, but Node.js writes to stdout/stderr
console.log('Works in both');
console.error('Works in both');

// Node.js specific
console.dir(obj, { depth: null });
```

### Environment Detection

```javascript
// Detect runtime environment
function isNode() {
  return typeof process !== 'undefined' 
    && process.versions != null 
    && process.versions.node != null;
}

function isBrowser() {
  return typeof window !== 'undefined' 
    && typeof window.document !== 'undefined';
}

// Universal/Isomorphic code pattern
const fetch = globalThis.fetch || (await import('node-fetch')).default;

// Conditional loading
if (isNode()) {
  // Node.js specific code
  const fs = require('fs');
} else {
  // Browser specific code
  // Use localStorage, DOM, etc.
}
```

### Module System Differences

```javascript
// --- CommonJS (Node.js traditional) ---
// file: math.js
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = { add, subtract };
// or: exports.add = add;

// file: app.js
const { add, subtract } = require('./math');

// --- ES Modules (Both platforms) ---
// file: math.mjs (or .js with "type": "module" in package.json)
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export default { add, subtract };

// file: app.mjs
import { add, subtract } from './math.mjs';
import math from './math.mjs';

// --- Interop ---
// ESM can import CommonJS
import cjsModule from './commonjs-module.cjs';

// CommonJS can import ESM (async only)
async function loadESM() {
  const { add } = await import('./esm-module.mjs');
}
```

---

## 1.4 Event Loop Deep Dive

### Event Loop Phases

```
   ┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks (deferred)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← Internal use only
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← Retrieve new I/O events
│  └─────────────┬─────────────┘     Execute I/O callbacks
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close')
   └───────────────────────────┘

Between each phase: process.nextTick and Promise microtasks
```

### Microtasks vs Macrotasks

```javascript
// Microtasks (highest priority, run between each phase)
// - process.nextTick()
// - Promise callbacks
// - queueMicrotask()

// Macrotasks (each phase of event loop)
// - setTimeout/setInterval
// - setImmediate
// - I/O callbacks
// - Close callbacks

// Example demonstrating order
console.log('1. Script start');

setTimeout(() => {
  console.log('2. setTimeout');
  
  Promise.resolve().then(() => {
    console.log('3. Promise inside setTimeout');
  });
  
  process.nextTick(() => {
    console.log('4. nextTick inside setTimeout');
  });
}, 0);

setImmediate(() => {
  console.log('5. setImmediate');
});

Promise.resolve().then(() => {
  console.log('6. Promise');
});

process.nextTick(() => {
  console.log('7. nextTick');
});

console.log('8. Script end');

// Output:
// 1. Script start
// 8. Script end
// 7. nextTick
// 6. Promise
// 2. setTimeout (may swap with 5)
// 4. nextTick inside setTimeout
// 3. Promise inside setTimeout
// 5. setImmediate (may swap with 2)
```

### Gotchas

```javascript
// ❌ Blocking the event loop
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // CPU-bound work blocks everything for 5 seconds
  }
}

// ✅ Use setImmediate to yield to event loop
function nonBlockingOperation(data, callback) {
  let index = 0;
  
  function processChunk() {
    const chunkEnd = Math.min(index + 1000, data.length);
    
    while (index < chunkEnd) {
      // Process item
      index++;
    }
    
    if (index < data.length) {
      setImmediate(processChunk);  // Yield to event loop
    } else {
      callback();
    }
  }
  
  processChunk();
}

// ❌ Starving the event loop with nextTick
function badRecursion() {
  process.nextTick(badRecursion);  // I/O never gets a chance!
}

// ✅ Use setImmediate for recursive async work
function goodRecursion() {
  setImmediate(goodRecursion);  // Allows I/O between calls
}
```

---

## 1.5 Best Practices

### Error Handling

```javascript
// Always handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log error, notify monitoring
  process.exit(1);  // Exit — state may be corrupted
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // In Node 15+, this crashes by default
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  process.exit(0);
});
```

### Performance

```javascript
// 1. Don't block the event loop
// 2. Use streams for large data
// 3. Offload CPU-intensive work to worker threads
// 4. Use connection pooling for databases
// 5. Cache when possible

// Monitor event loop lag
const start = Date.now();
setImmediate(() => {
  const lag = Date.now() - start;
  if (lag > 100) {
    console.warn(`Event loop lag: ${lag}ms`);
  }
});
```

---

## 1.6 Summary

| Concept | Key Points |
|---------|------------|
| **Architecture** | V8 + libuv, event-driven, non-blocking I/O |
| **Event Loop** | Single-threaded JS, phases: timers → poll → check → close |
| **Microtasks** | `process.nextTick()` → Promises, run between phases |
| **global** | Global namespace object, use `globalThis` for portability |
| **process** | Process info, env vars, argv, stdin/stdout, exit |
| **Buffer** | Binary data handling, encodings, memory-efficient |
| **Timers** | setTimeout, setInterval, setImmediate, nextTick |
| **vs Browser** | No DOM, has fs/net/process, CommonJS + ESM |

---

**End of Module 1: Node.js Fundamentals**

Next: **Module 2 — Module Systems** (CommonJS, ES Modules, Resolution)
