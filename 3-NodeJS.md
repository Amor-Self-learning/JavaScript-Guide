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
# Module 2: Module Systems

Node.js supports two module systems: CommonJS (traditional) and ES Modules (modern standard). This module covers both systems, their interoperability, and the module resolution algorithm.

---

## 2.1 CommonJS

### What It Is

CommonJS is Node.js's original module system. Every file is treated as a separate module with its own scope.

### Basic Syntax

```javascript
// --- Exporting ---

// file: math.js

// Named exports using exports object
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// Or using module.exports (preferred for multiple exports)
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

// Single/default export
module.exports = function greet(name) {
  return `Hello, ${name}!`;
};

// Export a class
module.exports = class Calculator {
  add(a, b) { return a + b; }
};
```

```javascript
// --- Importing ---

// file: app.js

// Import entire module
const math = require('./math');
console.log(math.add(2, 3));  // 5

// Destructuring import
const { add, subtract } = require('./math');
console.log(add(2, 3));  // 5

// Import single export
const greet = require('./greet');
console.log(greet('World'));  // Hello, World!

// Import core modules (no path needed)
const fs = require('fs');
const path = require('path');
const http = require('http');

// Import from node_modules
const express = require('express');
const lodash = require('lodash');
```

### Module Wrapper

Every CommonJS module is wrapped in a function:

```javascript
// What Node.js actually sees:
(function(exports, require, module, __filename, __dirname) {
  // Your module code here
  
  const secret = 'not accessible outside';
  
  module.exports = {
    public: 'accessible'
  };
  
});

// This is why:
// - Variables are scoped to the module
// - exports, require, module, __filename, __dirname are available
// - Top-level code runs when module is first required
```

### exports vs module.exports

```javascript
// exports is a shorthand reference to module.exports
console.log(exports === module.exports);  // true (initially)

// ✅ These work
exports.method = () => {};
module.exports.method = () => {};
module.exports = { method: () => {} };

// ❌ This DOESN'T work
exports = { method: () => {} };  // Breaks the reference!

// Why? Because require() returns module.exports, not exports
// When you reassign exports, you lose the connection

// Rule: Use module.exports for object/function/class exports
// Use exports.x for adding properties
```

### Module Caching

```javascript
// Modules are cached after first load

// file: counter.js
let count = 0;
module.exports = {
  increment: () => ++count,
  getCount: () => count
};

// file: app.js
const counter1 = require('./counter');
const counter2 = require('./counter');

console.log(counter1 === counter2);  // true (same instance!)

counter1.increment();
console.log(counter2.getCount());  // 1 (shared state)

// To check cache
console.log(require.cache);

// To clear cache (rarely needed)
delete require.cache[require.resolve('./counter')];
const counter3 = require('./counter');
console.log(counter3.getCount());  // 0 (fresh instance)
```

### Circular Dependencies

```javascript
// file: a.js
console.log('a.js starting');
exports.done = false;
const b = require('./b');
console.log('in a.js, b.done =', b.done);
exports.done = true;
console.log('a.js done');

// file: b.js
console.log('b.js starting');
exports.done = false;
const a = require('./a');
console.log('in b.js, a.done =', a.done);
exports.done = true;
console.log('b.js done');

// file: main.js
const a = require('./a');
const b = require('./b');

// Output:
// a.js starting
// b.js starting
// in b.js, a.done = false  (a.js not finished yet!)
// b.js done
// in a.js, b.done = true
// a.js done

// Node.js handles circular deps by returning incomplete exports
// ❌ Avoid circular dependencies when possible
// ✅ Restructure code or use dependency injection
```

### Core vs User Modules

```javascript
// Core modules (built into Node.js)
const fs = require('fs');           // No path, no node_modules
const path = require('path');
const http = require('http');
const crypto = require('crypto');

// User modules (your files)
const myModule = require('./myModule');        // Relative path
const config = require('../config/settings');  // Parent directory
const utils = require('/absolute/path/utils'); // Absolute path

// Third-party modules (from node_modules)
const express = require('express');
const lodash = require('lodash');
const chalk = require('chalk');

// Resolution priority:
// 1. Core modules
// 2. File modules (if path starts with ./ ../ or /)
// 3. node_modules (walks up directory tree)
```

---

## 2.2 ES Modules in Node

### Enabling ES Modules

```javascript
// Method 1: Use .mjs extension
// file: module.mjs

// Method 2: Add "type": "module" to package.json
{
  "name": "my-package",
  "type": "module"  // All .js files are ESM
}

// Method 3: Use --input-type=module flag
// node --input-type=module script.js
```

### Basic Syntax

```javascript
// --- Named Exports ---

// file: math.mjs
export const PI = 3.14159;
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

export function multiply(a, b) {
  return a * b;
}

export class Calculator {
  add(a, b) { return a + b; }
}

// --- Default Export ---

// file: greet.mjs
export default function greet(name) {
  return `Hello, ${name}!`;
}

// Or
const greet = (name) => `Hello, ${name}!`;
export default greet;

// --- Mixed Exports ---

// file: utils.mjs
export const VERSION = '1.0.0';
export function helper() {}
export default class Utils {}
```

```javascript
// --- Named Imports ---

// file: app.mjs
import { add, subtract, PI } from './math.mjs';
console.log(add(2, 3));
console.log(PI);

// Import with alias
import { add as sum, subtract as minus } from './math.mjs';
console.log(sum(2, 3));

// Import all as namespace
import * as math from './math.mjs';
console.log(math.add(2, 3));
console.log(math.PI);

// --- Default Imports ---
import greet from './greet.mjs';
console.log(greet('World'));

// Default with alias (any name works)
import sayHello from './greet.mjs';
console.log(sayHello('World'));

// --- Mixed Imports ---
import Utils, { VERSION, helper } from './utils.mjs';

// --- Core and npm modules ---
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import express from 'express';
```

### Dynamic Imports

```javascript
// Static imports must be at top level
// Dynamic imports work anywhere and return a Promise

// Conditional loading
if (condition) {
  const { feature } = await import('./feature.mjs');
  feature();
}

// Load based on runtime value
const moduleName = process.env.MODULE;
const module = await import(`./${moduleName}.mjs`);

// In async function
async function loadModule() {
  const { default: greet, helper } = await import('./utils.mjs');
  return greet('World');
}

// Works in CommonJS too (async import of ESM)
// file: app.cjs
async function main() {
  const { add } = await import('./math.mjs');
  console.log(add(2, 3));
}
main();
```

### import.meta

```javascript
// ESM equivalent of __filename and __dirname

// Get current file URL
console.log(import.meta.url);
// file:///home/user/project/src/app.mjs

// Convert to path
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__filename);  // /home/user/project/src/app.mjs
console.log(__dirname);   // /home/user/project/src

// Resolve relative paths
const configPath = new URL('./config.json', import.meta.url);
```

### Top-Level Await

```javascript
// ESM supports top-level await (no async wrapper needed)

// file: config.mjs
const response = await fetch('https://api.example.com/config');
export const config = await response.json();

// file: db.mjs
import { createConnection } from 'database';
export const db = await createConnection();

// file: app.mjs
import { config } from './config.mjs';
import { db } from './db.mjs';

// Both are fully initialized here
console.log(config);
console.log(db.isConnected);
```

### Differences from CommonJS

```javascript
// Feature                  | CommonJS          | ESM
// -------------------------|-------------------|------------------
// Syntax                   | require/exports   | import/export
// Loading                  | Synchronous       | Asynchronous
// Top-level await          | ❌ No             | ✅ Yes
// __filename/__dirname     | ✅ Yes            | ❌ Use import.meta
// require.cache            | ✅ Yes            | ❌ No equivalent
// Conditional exports      | ✅ Yes            | ❌ Static only*
// Live bindings            | ❌ No (copies)    | ✅ Yes (references)
// this at top level        | exports           | undefined
// .json import             | ✅ Built-in       | ❌ Needs flag**

// *Dynamic import() for conditional loading
// **Use: node --experimental-json-modules or import assertion

// Live bindings example
// file: counter.mjs
export let count = 0;
export const increment = () => count++;

// file: app.mjs
import { count, increment } from './counter.mjs';
console.log(count);  // 0
increment();
console.log(count);  // 1 (live binding updated!)

// In CommonJS, count would still be 0 (it's a copy)
```

---

## 2.3 Interoperability

### ESM Importing CommonJS

```javascript
// ESM can import CommonJS default export
import cjsModule from './commonjs-module.cjs';

// Named imports may not work depending on the export style
// ❌ May not work
import { named } from './commonjs-module.cjs';

// ✅ Always works
import cjs from './commonjs-module.cjs';
const { named } = cjs;

// Import core modules
import fs from 'fs';
import { readFileSync } from 'fs';  // Named exports work for core

// Import npm packages (most support ESM imports)
import express from 'express';
import _ from 'lodash';
```

### CommonJS Importing ESM

```javascript
// CommonJS cannot use require() with ESM
// ❌ This throws an error
const esm = require('./esm-module.mjs');

// ✅ Use dynamic import (returns Promise)
async function main() {
  const { default: greet, helper } = await import('./esm-module.mjs');
  console.log(greet('World'));
}
main();

// Or with .then()
import('./esm-module.mjs').then(({ default: greet }) => {
  console.log(greet('World'));
});
```

### Package.json Exports

```javascript
// Modern packages use "exports" field for ESM/CJS dual support

{
  "name": "my-package",
  "type": "module",
  "exports": {
    // Main entry
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    // Subpath exports
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  // Fallback for older Node versions
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs"
}

// Usage:
// import pkg from 'my-package';        // Gets .mjs
// const pkg = require('my-package');   // Gets .cjs
// import utils from 'my-package/utils';
```

---

## 2.4 Module Resolution

### Resolution Algorithm

```javascript
// When you require('module-name'):

// 1. Is it a core module? (fs, path, http, etc.)
//    → Return core module

// 2. Does it start with './' or '../' or '/'?
//    → Resolve as file or directory

// 3. Otherwise, search node_modules:
//    → Start at current directory
//    → Walk up to root, checking each node_modules

// File resolution order:
// require('./foo')
// 1. ./foo (exact match)
// 2. ./foo.js
// 3. ./foo.json
// 4. ./foo.node
// 5. ./foo/package.json → "main" field
// 6. ./foo/index.js
// 7. ./foo/index.json
// 8. ./foo/index.node
```

### node_modules Search

```javascript
// For require('express') from /home/user/project/src/app.js:

// Search path:
// /home/user/project/src/node_modules/express
// /home/user/project/node_modules/express
// /home/user/node_modules/express
// /home/node_modules/express
// /node_modules/express

// Check module.paths to see search paths
console.log(module.paths);
```

### Package Entry Points

```javascript
// package.json fields for entry points:

{
  // Legacy main entry (CommonJS)
  "main": "./lib/index.js",
  
  // ESM entry (used by bundlers)
  "module": "./lib/index.mjs",
  
  // Modern exports (Node.js 12+)
  "exports": {
    ".": {
      "import": "./lib/index.mjs",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    },
    "./utils": "./lib/utils.js",
    "./package.json": "./package.json"
  },
  
  // TypeScript entry
  "types": "./lib/index.d.ts"
}
```

### require.resolve

```javascript
// Find module path without loading it
const modulePath = require.resolve('express');
console.log(modulePath);
// /home/user/project/node_modules/express/index.js

// With options
require.resolve('./module', {
  paths: ['/custom/search/path']
});

// Check if module exists
function moduleExists(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}
```

---

## 2.5 Best Practices

### Module Organization

```javascript
// ✅ Good: Clear, single-purpose modules
// file: validators.js
export const isEmail = (str) => /.+@.+\..+/.test(str);
export const isPhone = (str) => /^\d{10}$/.test(str);

// file: formatters.js  
export const formatCurrency = (n) => `$${n.toFixed(2)}`;
export const formatDate = (d) => d.toISOString();

// ❌ Bad: God module with everything
// file: utils.js
export const isEmail = ...;
export const formatCurrency = ...;
export const fetchUser = ...;
export const calculateTax = ...;
// ...hundreds more
```

### Choosing ESM vs CommonJS

```javascript
// Use ESM when:
// - Starting new projects
// - Tree-shaking is important (bundlers)
// - Using top-level await
// - Following modern standards

// Use CommonJS when:
// - Maintaining legacy projects
// - Library needs to support old Node.js
// - Dynamic requires are essential
// - Simpler require.cache manipulation needed

// Dual package (both ESM and CommonJS)
// Build to both formats for maximum compatibility
```

### Avoiding Circular Dependencies

```javascript
// ❌ Circular dependency
// a.js requires b.js which requires a.js

// ✅ Solution 1: Dependency injection
// file: service.js
export function createService(dep) {
  return {
    method() { return dep.value; }
  };
}

// file: main.js
import { createService } from './service.js';
const dep = { value: 42 };
const service = createService(dep);

// ✅ Solution 2: Event-based communication
import { EventEmitter } from 'events';
export const bus = new EventEmitter();

// ✅ Solution 3: Lazy loading
export function getModuleA() {
  return require('./a');  // Load only when needed
}
```

---

## 2.6 Summary

| Concept | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | `require()`/`module.exports` | `import`/`export` |
| File extension | `.js`, `.cjs` | `.mjs`, `.js` (with type:module) |
| Loading | Synchronous | Asynchronous |
| Caching | `require.cache` | Implicit |
| Top-level await | ❌ No | ✅ Yes |
| Tree-shaking | ❌ Difficult | ✅ Static analysis |
| `__dirname` | ✅ Built-in | Use `import.meta.url` |
| Circular deps | Returns partial | Handled better |

### Key Points

| Topic | Details |
|-------|---------|
| **CommonJS** | `require()`, `module.exports`, synchronous, cached |
| **ES Modules** | `import`/`export`, async, static analysis, live bindings |
| **Interop** | ESM imports CJS easily; CJS needs dynamic `import()` for ESM |
| **Resolution** | Core → File → node_modules (walk up directory tree) |
| **package.json** | Use `exports` for modern entry points |

---

**End of Module 2: Module Systems**

Next: **Module 3 — File System (fs)** (Reading, writing, directories, promises API)
# Module 3: File System (fs)

The `fs` module provides APIs to interact with the file system. This module covers synchronous, callback-based, and Promise-based methods for reading, writing, and managing files and directories.

---

## 3.1 Module Overview

### Importing fs

```javascript
// CommonJS
const fs = require('fs');
const fsPromises = require('fs/promises');  // Promise-based API

// ES Modules
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
```

### Three API Styles

```javascript
// 1. Synchronous (blocks event loop)
const data = fs.readFileSync('file.txt', 'utf8');

// 2. Callback-based (traditional async)
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 3. Promise-based (modern async)
import { readFile } from 'fs/promises';
const data = await readFile('file.txt', 'utf8');
```

---

## 3.2 Reading Files

### readFile / readFileSync

```javascript
const fs = require('fs');

// Synchronous read
try {
  const data = fs.readFileSync('config.json', 'utf8');
  const config = JSON.parse(data);
  console.log(config);
} catch (err) {
  console.error('Error reading file:', err.message);
}

// Callback-based read
fs.readFile('config.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  const config = JSON.parse(data);
  console.log(config);
});

// Promise-based read
const { readFile } = require('fs/promises');

async function loadConfig() {
  try {
    const data = await readFile('config.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error:', err.message);
    throw err;
  }
}
```

### Encoding Options

```javascript
// Without encoding: returns Buffer
const buffer = fs.readFileSync('file.txt');
console.log(buffer);  // <Buffer 48 65 6c 6c 6f>

// With encoding: returns string
const text = fs.readFileSync('file.txt', 'utf8');
console.log(text);  // 'Hello'

// Common encodings
fs.readFileSync('file.txt', 'utf8');     // Most common
fs.readFileSync('file.txt', 'ascii');    // ASCII
fs.readFileSync('file.txt', 'base64');   // Base64
fs.readFileSync('file.txt', 'hex');      // Hexadecimal
fs.readFileSync('file.txt', 'latin1');   // ISO-8859-1
```

### Read Options Object

```javascript
const options = {
  encoding: 'utf8',
  flag: 'r'  // Read mode
};

const data = fs.readFileSync('file.txt', options);

// Flags:
// 'r'  - Read (default)
// 'r+' - Read and write
// 'w'  - Write (truncate or create)
// 'w+' - Read and write (truncate or create)
// 'a'  - Append (create if not exists)
// 'a+' - Read and append
// 'ax' - Append, fail if exists
```

### Reading Large Files with Streams

```javascript
// For large files, use streams instead of readFile
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 64KB chunks
});

readStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

readStream.on('end', () => {
  console.log('Finished reading');
});

readStream.on('error', (err) => {
  console.error('Error:', err.message);
});
```

---

## 3.3 Writing Files

### writeFile / writeFileSync

```javascript
const fs = require('fs');

// Synchronous write
try {
  fs.writeFileSync('output.txt', 'Hello, World!', 'utf8');
  console.log('File written');
} catch (err) {
  console.error('Error:', err.message);
}

// Callback-based write
fs.writeFile('output.txt', 'Hello, World!', 'utf8', (err) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('File written');
});

// Promise-based write
const { writeFile } = require('fs/promises');

async function saveData(filename, data) {
  try {
    await writeFile(filename, data, 'utf8');
    console.log('File saved');
  } catch (err) {
    console.error('Error:', err.message);
  }
}
```

### Write Options

```javascript
const options = {
  encoding: 'utf8',
  flag: 'w',      // Write mode (default)
  mode: 0o644     // File permissions (Unix)
};

fs.writeFileSync('file.txt', 'content', options);

// Useful flags:
// 'w'  - Overwrite (create if not exists)
// 'wx' - Overwrite, fail if exists (exclusive)
// 'a'  - Append
// 'ax' - Append, fail if exists
```

### appendFile

```javascript
// Append to file (creates if not exists)
fs.appendFileSync('log.txt', 'New log entry\n');

// Callback version
fs.appendFile('log.txt', 'Entry\n', (err) => {
  if (err) throw err;
});

// Promise version
const { appendFile } = require('fs/promises');
await appendFile('log.txt', 'Entry\n');

// Append with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('app.log', `[${timestamp}] ${message}\n`);
}
```

### Writing JSON

```javascript
const data = {
  name: 'John',
  age: 30,
  active: true
};

// Write JSON (pretty-printed)
fs.writeFileSync(
  'data.json',
  JSON.stringify(data, null, 2),
  'utf8'
);

// Read and update JSON
async function updateJson(file, updates) {
  const content = await readFile(file, 'utf8');
  const data = JSON.parse(content);
  Object.assign(data, updates);
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}
```

### Writing with Streams

```javascript
// For large data, use streams
const writeStream = fs.createWriteStream('large-output.txt');

writeStream.write('First chunk\n');
writeStream.write('Second chunk\n');
writeStream.end('Final chunk\n');

writeStream.on('finish', () => {
  console.log('All data written');
});

writeStream.on('error', (err) => {
  console.error('Error:', err.message);
});

// Pipe from readable to writable
const readStream = fs.createReadStream('input.txt');
readStream.pipe(writeStream);
```

---

## 3.4 Directory Operations

### Creating Directories

```javascript
// mkdir - create directory
fs.mkdirSync('new-folder');

// Create nested directories (recursive)
fs.mkdirSync('path/to/nested/folder', { recursive: true });

// Callback version
fs.mkdir('folder', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Directory created');
});

// Promise version
const { mkdir } = require('fs/promises');
await mkdir('folder', { recursive: true });
```

### Reading Directories

```javascript
// readdir - list directory contents
const files = fs.readdirSync('.');
console.log(files);  // ['file1.txt', 'folder', 'file2.js']

// With file types
const entries = fs.readdirSync('.', { withFileTypes: true });
entries.forEach(entry => {
  if (entry.isDirectory()) {
    console.log(`Directory: ${entry.name}`);
  } else if (entry.isFile()) {
    console.log(`File: ${entry.name}`);
  }
});

// Callback version
fs.readdir('.', (err, files) => {
  if (err) throw err;
  console.log(files);
});

// Promise version
const { readdir } = require('fs/promises');
const files = await readdir('.', { withFileTypes: true });
```

### Recursive Directory Reading

```javascript
const path = require('path');

// Get all files recursively (Node 18+)
const files = fs.readdirSync('.', { recursive: true });

// Manual recursive function
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log(getAllFiles('./src'));
```

### Removing Directories

```javascript
// rmdir - remove empty directory
fs.rmdirSync('empty-folder');

// rm - remove directory with contents (Node 14.14+)
fs.rmSync('folder-with-files', { recursive: true, force: true });

// Promise version
const { rm } = require('fs/promises');
await rm('folder', { recursive: true, force: true });

// Older alternative: rimraf pattern
function deleteFolderRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}
```

---

## 3.5 File Stats and Metadata

### stat / lstat

```javascript
// Get file/directory information
const stats = fs.statSync('file.txt');

console.log({
  size: stats.size,           // Size in bytes
  isFile: stats.isFile(),     // true if file
  isDirectory: stats.isDirectory(),  // true if directory
  isSymbolicLink: stats.isSymbolicLink(),
  created: stats.birthtime,   // Creation time
  modified: stats.mtime,      // Last modified
  accessed: stats.atime,      // Last accessed
  changed: stats.ctime,       // Last status change
  mode: stats.mode,           // Permissions
  uid: stats.uid,             // Owner user ID
  gid: stats.gid              // Owner group ID
});

// lstat - doesn't follow symlinks
const linkStats = fs.lstatSync('symlink');
console.log(linkStats.isSymbolicLink());  // true
```

### Check File Existence

```javascript
// Modern way: use access()
const { access, constants } = require('fs/promises');

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Check permissions
async function isReadable(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

// Sync version
function existsSync(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch {
    return false;
  }
}

// Or use fs.existsSync (deprecated but still works)
if (fs.existsSync('file.txt')) {
  console.log('File exists');
}
```

---

## 3.6 File Operations

### Copy Files

```javascript
// copyFile (Node 8.5+)
fs.copyFileSync('source.txt', 'destination.txt');

// With flags
const { COPYFILE_EXCL } = fs.constants;
fs.copyFileSync('source.txt', 'dest.txt', COPYFILE_EXCL);  // Fail if exists

// Promise version
const { copyFile } = require('fs/promises');
await copyFile('source.txt', 'destination.txt');

// Copy directory (Node 16.7+)
fs.cpSync('src-folder', 'dest-folder', { recursive: true });

// Promise version
const { cp } = require('fs/promises');
await cp('src', 'dest', { recursive: true });
```

### Rename / Move Files

```javascript
// rename works for both rename and move
fs.renameSync('old-name.txt', 'new-name.txt');
fs.renameSync('file.txt', 'subfolder/file.txt');  // Move

// Promise version
const { rename } = require('fs/promises');
await rename('old.txt', 'new.txt');
```

### Delete Files

```javascript
// unlink - delete file
fs.unlinkSync('file.txt');

// rm - delete file or directory
fs.rmSync('file.txt');
fs.rmSync('folder', { recursive: true });

// Promise versions
const { unlink, rm } = require('fs/promises');
await unlink('file.txt');
await rm('folder', { recursive: true, force: true });
```

### Symbolic Links

```javascript
// Create symbolic link
fs.symlinkSync('target.txt', 'link.txt');

// Read link target
const target = fs.readlinkSync('link.txt');
console.log(target);  // 'target.txt'

// Create hard link
fs.linkSync('target.txt', 'hardlink.txt');
```

---

## 3.7 Watching Files

### fs.watch

```javascript
// Watch file or directory for changes
const watcher = fs.watch('file.txt', (eventType, filename) => {
  console.log(`Event: ${eventType}, File: ${filename}`);
});

// Watch directory
fs.watch('./src', { recursive: true }, (event, filename) => {
  console.log(`${filename} changed`);
});

// Stop watching
watcher.close();

// With error handling
const watcher = fs.watch('file.txt');
watcher.on('change', (event, filename) => {
  console.log(`${event}: ${filename}`);
});
watcher.on('error', (err) => {
  console.error('Watch error:', err);
});
```

### fs.watchFile (Polling)

```javascript
// Uses polling (less efficient but more reliable)
fs.watchFile('file.txt', { interval: 1000 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log('File modified');
  }
});

// Stop watching
fs.unwatchFile('file.txt');
```

### Practical Watcher

```javascript
// Debounced file watcher
function watchFile(filepath, callback, debounceMs = 100) {
  let timeout;
  
  const watcher = fs.watch(filepath, (event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(event);
    }, debounceMs);
  });
  
  return () => watcher.close();
}

const stop = watchFile('config.json', (event) => {
  console.log('Config changed, reloading...');
  reloadConfig();
});

// Later: stop watching
stop();
```

---

## 3.8 fs.promises API

### Using Promises

```javascript
const fs = require('fs/promises');

// All methods return Promises
async function fileOperations() {
  // Read
  const content = await fs.readFile('input.txt', 'utf8');
  
  // Write
  await fs.writeFile('output.txt', content.toUpperCase());
  
  // Append
  await fs.appendFile('log.txt', 'Entry\n');
  
  // Stats
  const stats = await fs.stat('file.txt');
  
  // Directory operations
  await fs.mkdir('new-folder', { recursive: true });
  const files = await fs.readdir('.');
  await fs.rm('folder', { recursive: true });
  
  // File operations
  await fs.copyFile('src.txt', 'dest.txt');
  await fs.rename('old.txt', 'new.txt');
  await fs.unlink('file.txt');
}

// Error handling
async function safeRead(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;  // File doesn't exist
    }
    throw err;
  }
}
```

### FileHandle API

```javascript
const fs = require('fs/promises');

// Open file and get handle (like file descriptors)
async function useFileHandle() {
  const handle = await fs.open('file.txt', 'r+');
  
  try {
    // Read using handle
    const buffer = Buffer.alloc(1024);
    const { bytesRead } = await handle.read(buffer, 0, 1024, 0);
    
    // Write using handle
    await handle.write('New content', 0);
    
    // Get stats
    const stats = await handle.stat();
    
    // Truncate
    await handle.truncate(100);
    
    // Sync to disk
    await handle.sync();
    
  } finally {
    // Always close the handle
    await handle.close();
  }
}

// Shorter: read entire file
async function readWithHandle() {
  const handle = await fs.open('file.txt', 'r');
  try {
    return await handle.readFile('utf8');
  } finally {
    await handle.close();
  }
}
```

---

## 3.9 Common Patterns

### Read JSON File

```javascript
async function readJSON(filepath) {
  const content = await fs.readFile(filepath, 'utf8');
  return JSON.parse(content);
}

// With error handling
async function safeReadJSON(filepath, defaultValue = null) {
  try {
    const content = await fs.readFile(filepath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return defaultValue;
    }
    throw err;
  }
}
```

### Write JSON Atomically

```javascript
const path = require('path');

// Atomic write prevents corruption on crash
async function writeJSONAtomic(filepath, data) {
  const tempPath = `${filepath}.${process.pid}.tmp`;
  
  try {
    await fs.writeFile(
      tempPath,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    await fs.rename(tempPath, filepath);
  } catch (err) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw err;
  }
}
```

### Ensure Directory Exists

```javascript
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// Write file with directory creation
async function writeFileSafe(filepath, content) {
  await ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, content);
}
```

---

## 3.10 Gotchas

```javascript
// ❌ Using sync methods in server
app.get('/file', (req, res) => {
  const data = fs.readFileSync('file.txt');  // Blocks all requests!
  res.send(data);
});

// ✅ Use async methods
app.get('/file', async (req, res) => {
  const data = await fs.readFile('file.txt');
  res.send(data);
});

// ❌ Not handling errors
fs.readFile('file.txt', (err, data) => {
  console.log(data);  // May be undefined if error!
});

// ✅ Always handle errors
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});

// ❌ Race condition with exists + read
if (fs.existsSync('file.txt')) {
  const data = fs.readFileSync('file.txt');  // File may be deleted!
}

// ✅ Just try to read and handle error
try {
  const data = fs.readFileSync('file.txt');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('File not found');
  }
}
```

---

## 3.11 Summary

| Operation | Sync | Callback | Promise |
|-----------|------|----------|---------|
| Read file | `readFileSync` | `readFile` | `fs.promises.readFile` |
| Write file | `writeFileSync` | `writeFile` | `fs.promises.writeFile` |
| Append | `appendFileSync` | `appendFile` | `fs.promises.appendFile` |
| Delete file | `unlinkSync` | `unlink` | `fs.promises.unlink` |
| Copy | `copyFileSync` | `copyFile` | `fs.promises.copyFile` |
| Rename/Move | `renameSync` | `rename` | `fs.promises.rename` |
| Make dir | `mkdirSync` | `mkdir` | `fs.promises.mkdir` |
| Read dir | `readdirSync` | `readdir` | `fs.promises.readdir` |
| Remove dir | `rmSync` | `rm` | `fs.promises.rm` |
| File stats | `statSync` | `stat` | `fs.promises.stat` |

| Error Code | Meaning |
|------------|---------|
| `ENOENT` | File/directory not found |
| `EEXIST` | File/directory already exists |
| `EACCES` | Permission denied |
| `EISDIR` | Expected file, got directory |
| `ENOTDIR` | Expected directory, got file |
| `ENOTEMPTY` | Directory not empty |

---

**End of Module 3: File System (fs)**

Next: **Module 4 — Path** (Path manipulation and resolution)
# Module 4: Path

The `path` module provides utilities for working with file and directory paths. It handles platform-specific differences between Windows and POSIX systems.

---

## 4.1 Module Import

```javascript
// CommonJS
const path = require('path');

// ES Modules
import path from 'path';
import { join, resolve, basename } from 'path';
```

---

## 4.2 Path Joining and Resolving

### path.join()

Joins path segments using the platform-specific separator:

```javascript
// Basic joining
path.join('folder', 'subfolder', 'file.txt');
// POSIX: 'folder/subfolder/file.txt'
// Windows: 'folder\\subfolder\\file.txt'

// Handles .. and . correctly
path.join('folder', '..', 'other', 'file.txt');
// 'other/file.txt'

path.join('folder', '.', 'file.txt');
// 'folder/file.txt'

// Ignores empty strings
path.join('folder', '', 'file.txt');
// 'folder/file.txt'

// Common pattern with __dirname
const configPath = path.join(__dirname, 'config', 'settings.json');
const dataPath = path.join(__dirname, '..', 'data', 'users.json');
```

### path.resolve()

Resolves a sequence of paths to an absolute path:

```javascript
// Returns absolute path
path.resolve('folder', 'file.txt');
// '/current/working/directory/folder/file.txt'

// Absolute path resets resolution
path.resolve('/tmp', 'file.txt');
// '/tmp/file.txt'

path.resolve('/root', '/home', 'file.txt');
// '/home/file.txt' (last absolute wins)

// Common patterns
const projectRoot = path.resolve(__dirname, '..');
const configFile = path.resolve(__dirname, 'config.json');

// Get absolute path from relative
const absolute = path.resolve('./relative/path');
```

### join vs resolve

```javascript
// join: concatenates paths
path.join('/a', '/b', 'c');
// '/a/b/c'

// resolve: treats each as potential absolute
path.resolve('/a', '/b', 'c');
// '/b/c' (starts from /b)

// Use join for building relative paths
const relativePath = path.join('src', 'components', 'Button.js');

// Use resolve for getting absolute paths
const absolutePath = path.resolve(__dirname, 'src', 'index.js');
```

---

## 4.3 Path Components

### path.basename()

Returns the last portion of a path (filename):

```javascript
path.basename('/home/user/docs/file.txt');
// 'file.txt'

// Remove extension
path.basename('/home/user/docs/file.txt', '.txt');
// 'file'

// Works with directories too
path.basename('/home/user/docs');
// 'docs'

path.basename('/home/user/docs/');
// 'docs'
```

### path.dirname()

Returns the directory portion of a path:

```javascript
path.dirname('/home/user/docs/file.txt');
// '/home/user/docs'

path.dirname('/home/user/docs');
// '/home/user'

path.dirname('/home/user/docs/');
// '/home/user'

// Get parent directory
const parent = path.dirname(__dirname);
```

### path.extname()

Returns the file extension:

```javascript
path.extname('file.txt');
// '.txt'

path.extname('file.tar.gz');
// '.gz' (only last extension)

path.extname('file');
// '' (no extension)

path.extname('.gitignore');
// '' (dot files have no extension)

path.extname('path/to/file.js');
// '.js'

// Get extension without dot
const ext = path.extname('file.txt').slice(1);
// 'txt'
```

### path.parse()

Parses path into an object with all components:

```javascript
path.parse('/home/user/docs/file.txt');
// {
//   root: '/',
//   dir: '/home/user/docs',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Windows path
path.parse('C:\\Users\\docs\\file.txt');
// {
//   root: 'C:\\',
//   dir: 'C:\\Users\\docs',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Usage
const parsed = path.parse('/path/to/file.txt');
console.log(parsed.name);  // 'file'
console.log(parsed.ext);   // '.txt'
```

### path.format()

Builds a path from an object (opposite of parse):

```javascript
path.format({
  root: '/',
  dir: '/home/user/docs',
  base: 'file.txt'
});
// '/home/user/docs/file.txt'

// dir and base override root and name/ext
path.format({
  root: '/',
  dir: '/custom/dir',
  name: 'file',
  ext: '.txt'
});
// '/custom/dir/file.txt'

// Change extension
const parsed = path.parse('/path/to/file.txt');
parsed.base = '';  // Must clear base
parsed.ext = '.md';
path.format(parsed);
// '/path/to/file.md'
```

---

## 4.4 Path Manipulation

### path.normalize()

Normalizes a path, resolving `.` and `..`:

```javascript
path.normalize('/home/user/../admin/./docs');
// '/home/admin/docs'

path.normalize('folder//subfolder///file.txt');
// 'folder/subfolder/file.txt'

path.normalize('./current/./path/../other');
// 'current/other'

// Doesn't convert to absolute
path.normalize('relative/path');
// 'relative/path'
```

### path.relative()

Returns the relative path from one path to another:

```javascript
path.relative('/home/user/docs', '/home/user/images');
// '../images'

path.relative('/home/user', '/home/user/docs/file.txt');
// 'docs/file.txt'

path.relative('/a/b/c', '/a/b/c');
// ''

path.relative('/a/b', '/x/y');
// '../../x/y'

// Common usage: make paths relative to project root
const projectRoot = '/home/user/project';
const filePath = '/home/user/project/src/index.js';
path.relative(projectRoot, filePath);
// 'src/index.js'
```

### path.isAbsolute()

Checks if a path is absolute:

```javascript
// POSIX
path.isAbsolute('/home/user');    // true
path.isAbsolute('./relative');    // false
path.isAbsolute('relative');      // false
path.isAbsolute('../parent');     // false

// Windows
path.isAbsolute('C:\\Users');     // true
path.isAbsolute('\\\\server');    // true (UNC path)
path.isAbsolute('relative');      // false
```

---

## 4.5 Platform Specifics

### path.sep

Platform-specific path separator:

```javascript
path.sep;
// POSIX: '/'
// Windows: '\\'

// Split path into segments
const segments = filePath.split(path.sep);

// Build path with separator
const customPath = ['folder', 'file.txt'].join(path.sep);
```

### path.delimiter

Platform-specific path delimiter (for PATH env variable):

```javascript
path.delimiter;
// POSIX: ':'
// Windows: ';'

// Parse PATH environment variable
const paths = process.env.PATH.split(path.delimiter);
console.log(paths);
// ['/usr/bin', '/usr/local/bin', ...]
```

### path.posix and path.win32

Use specific platform's implementation:

```javascript
// Always use POSIX paths (URLs, etc.)
path.posix.join('folder', 'file.txt');
// 'folder/file.txt' (even on Windows)

// Always use Windows paths
path.win32.join('folder', 'file.txt');
// 'folder\\file.txt' (even on POSIX)

// Useful for cross-platform path handling
function toUrl(filePath) {
  // Convert to forward slashes for URLs
  return filePath.split(path.sep).join(path.posix.sep);
}
```

---

## 4.6 Common Patterns

### Get Filename Without Extension

```javascript
function getFileNameWithoutExt(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

getFileNameWithoutExt('/path/to/file.txt');
// 'file'

getFileNameWithoutExt('document.tar.gz');
// 'document.tar'
```

### Change File Extension

```javascript
function changeExtension(filePath, newExt) {
  const parsed = path.parse(filePath);
  return path.format({
    ...parsed,
    base: undefined,  // Must clear base
    ext: newExt.startsWith('.') ? newExt : '.' + newExt
  });
}

changeExtension('/path/to/file.txt', '.md');
// '/path/to/file.md'

changeExtension('script.js', 'ts');
// 'script.ts'
```

### Ensure Path Has Extension

```javascript
function ensureExtension(filePath, ext) {
  if (path.extname(filePath) === '') {
    return filePath + (ext.startsWith('.') ? ext : '.' + ext);
  }
  return filePath;
}

ensureExtension('config', '.json');
// 'config.json'

ensureExtension('config.json', '.json');
// 'config.json'
```

### Safe Path Joining (Prevent Path Traversal)

```javascript
function safePath(baseDir, userPath) {
  // Resolve the full path
  const fullPath = path.resolve(baseDir, userPath);
  
  // Ensure it's still within baseDir
  if (!fullPath.startsWith(path.resolve(baseDir) + path.sep)) {
    throw new Error('Path traversal attempt detected');
  }
  
  return fullPath;
}

// ✅ Safe
safePath('/uploads', 'user/file.txt');
// '/uploads/user/file.txt'

// ❌ Throws error (path traversal)
safePath('/uploads', '../etc/passwd');
// Error: Path traversal attempt detected
```

### Normalize URL Path

```javascript
function normalizeUrlPath(urlPath) {
  // Use posix for URLs
  return path.posix.normalize(urlPath);
}

normalizeUrlPath('/api//users/../posts');
// '/api/posts'
```

---

## 4.7 Summary

| Method | Description | Example |
|--------|-------------|---------|
| `join()` | Join path segments | `join('a', 'b')` → `'a/b'` |
| `resolve()` | Resolve to absolute path | `resolve('a')` → `'/cwd/a'` |
| `basename()` | Get filename | `basename('/a/b.txt')` → `'b.txt'` |
| `dirname()` | Get directory | `dirname('/a/b.txt')` → `'/a'` |
| `extname()` | Get extension | `extname('f.txt')` → `'.txt'` |
| `parse()` | Parse path to object | Returns `{root, dir, base, ext, name}` |
| `format()` | Object to path | Opposite of parse |
| `normalize()` | Clean up path | `normalize('a//b/../c')` → `'a/c'` |
| `relative()` | Get relative path | `relative('/a', '/a/b')` → `'b'` |
| `isAbsolute()` | Check if absolute | `isAbsolute('/a')` → `true` |

| Property | POSIX | Windows |
|----------|-------|---------|
| `sep` | `/` | `\\` |
| `delimiter` | `:` | `;` |

---

**End of Module 4: Path**

Next: **Module 5 — HTTP and HTTPS** (Creating servers, making requests)
# Module 5: HTTP and HTTPS

Node.js provides built-in modules for creating HTTP servers and making HTTP requests. The `http` and `https` modules form the foundation of all web servers and API clients in Node.js.

---

## 5.1 Module Import

```javascript
// CommonJS
const http = require('http');
const https = require('https');

// ES Modules
import http from 'http';
import https from 'https';
import { createServer, request, get } from 'http';
```

---

## 5.2 Creating HTTP Servers

### Basic Server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

### Request Object (IncomingMessage)

```javascript
http.createServer((req, res) => {
  // Request properties
  console.log(req.method);       // 'GET', 'POST', etc.
  console.log(req.url);          // '/path?query=value'
  console.log(req.headers);      // { host: '...', 'user-agent': '...' }
  console.log(req.httpVersion);  // '1.1'
  
  // Get specific header (lowercase)
  const contentType = req.headers['content-type'];
  const userAgent = req.headers['user-agent'];
  
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(url.pathname);     // '/path'
  console.log(url.searchParams.get('query'));  // 'value'
  
  res.end('Request received');
}).listen(3000);
```

### Response Object (ServerResponse)

```javascript
http.createServer((req, res) => {
  // Set status code
  res.statusCode = 200;
  
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Custom-Header', 'value');
  
  // Or use writeHead for status + headers together
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  });
  
  // Write body (can call multiple times)
  res.write('{"message":');
  res.write('"Hello"}');
  
  // End response (required!)
  res.end();
  
  // Or write and end in one call
  // res.end('{"message":"Hello"}');
}).listen(3000);
```

### Handling POST Data

```javascript
http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    // Collect data chunks
    req.on('data', chunk => {
      body += chunk.toString();
      
      // Limit body size (prevent DoS)
      if (body.length > 1e6) {
        res.writeHead(413);
        res.end('Payload Too Large');
        req.destroy();
      }
    });
    
    // Process complete body
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: data }));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
}).listen(3000);
```

### Using Promises for Body

```javascript
function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

// Usage
http.createServer(async (req, res) => {
  try {
    const body = await getBody(req);
    const data = JSON.parse(body);
    res.end(JSON.stringify({ success: true, data }));
  } catch (err) {
    res.writeHead(400);
    res.end('Bad Request');
  }
}).listen(3000);
```

---

## 5.3 Routing

### Basic Router

```javascript
http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;
  
  // Route handling
  if (method === 'GET' && path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Home</h1>');
  }
  else if (method === 'GET' && path === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  }
  else if (method === 'POST' && path === '/api/users') {
    // Handle POST
    getBody(req).then(body => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ created: JSON.parse(body) }));
    });
  }
  else if (path.startsWith('/users/')) {
    // Dynamic route
    const userId = path.split('/')[2];
    res.end(`User ID: ${userId}`);
  }
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3000);
```

### Pattern-Based Router

```javascript
const routes = [];

function addRoute(method, pattern, handler) {
  routes.push({
    method,
    pattern: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
    handler
  });
}

function matchRoute(method, path) {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = path.match(route.pattern);
    if (match) {
      return { handler: route.handler, params: match.groups || {} };
    }
  }
  return null;
}

// Define routes
addRoute('GET', '/', (req, res) => res.end('Home'));
addRoute('GET', '/users/:id', (req, res, params) => {
  res.end(`User: ${params.id}`);
});
addRoute('GET', '/posts/:postId/comments/:commentId', (req, res, params) => {
  res.end(`Post ${params.postId}, Comment ${params.commentId}`);
});

// Server
http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = matchRoute(req.method, url.pathname);
  
  if (match) {
    match.handler(req, res, match.params);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3000);
```

---

## 5.4 Serving Static Files

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(staticDir) {
  return (req, res) => {
    // Only handle GET
    if (req.method !== 'GET') {
      res.writeHead(405);
      return res.end('Method Not Allowed');
    }
    
    // Parse and sanitize path
    let filePath = new URL(req.url, 'http://localhost').pathname;
    if (filePath === '/') filePath = '/index.html';
    
    // Prevent path traversal
    const fullPath = path.join(staticDir, filePath);
    if (!fullPath.startsWith(path.resolve(staticDir))) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    
    // Get MIME type
    const ext = path.extname(fullPath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Stream file
    const stream = fs.createReadStream(fullPath);
    
    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': mimeType });
      stream.pipe(res);
    });
    
    stream.on('error', err => {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
  };
}

http.createServer(serveStatic('./public')).listen(3000);
```

---

## 5.5 Making HTTP Requests

### http.request()

```javascript
const http = require('http');

const options = {
  hostname: 'jsonplaceholder.typicode.com',
  port: 80,
  path: '/posts/1',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Body:', JSON.parse(data));
  });
});

req.on('error', err => {
  console.error('Request error:', err.message);
});

req.end();
```

### http.get() (Convenience Method)

```javascript
http.get('http://jsonplaceholder.typicode.com/posts/1', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
}).on('error', err => {
  console.error('Error:', err.message);
});
```

### POST Request

```javascript
const postData = JSON.stringify({
  title: 'foo',
  body: 'bar',
  userId: 1
});

const options = {
  hostname: 'jsonplaceholder.typicode.com',
  port: 80,
  path: '/posts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', err => console.error(err));

// Write body and end
req.write(postData);
req.end();
```

### Promise Wrapper

```javascript
function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) req.write(body);
    req.end();
  });
}

// Usage
async function fetchPost() {
  try {
    const res = await httpRequest({
      hostname: 'jsonplaceholder.typicode.com',
      path: '/posts/1',
      method: 'GET'
    });
    console.log(JSON.parse(res.body));
  } catch (err) {
    console.error(err);
  }
}
```

---

## 5.6 HTTPS Server

### Creating HTTPS Server

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  // Optional: CA certificate for client verification
  // ca: fs.readFileSync('ca-cert.pem'),
  // requestCert: true,
  // rejectUnauthorized: true
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Secure Hello!\n');
});

server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});
```

### Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Answer prompts (use localhost for Common Name)
```

### HTTP to HTTPS Redirect

```javascript
const http = require('http');
const https = require('https');
const fs = require('fs');

// HTTPS Server
const httpsServer = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, (req, res) => {
  res.end('Secure Content');
});

// HTTP Redirect Server
const httpServer = http.createServer((req, res) => {
  const host = req.headers.host.replace(/:\d+$/, '');
  res.writeHead(301, {
    Location: `https://${host}${req.url}`
  });
  res.end();
});

httpsServer.listen(443);
httpServer.listen(80);
```

---

## 5.7 Server Events

```javascript
const server = http.createServer();

// Request handler (alternative to passing to createServer)
server.on('request', (req, res) => {
  res.end('Hello');
});

// Connection established
server.on('connection', socket => {
  console.log('New connection from', socket.remoteAddress);
});

// Server is listening
server.on('listening', () => {
  const addr = server.address();
  console.log(`Server listening on ${addr.address}:${addr.port}`);
});

// Server error
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use');
  } else {
    console.error('Server error:', err);
  }
});

// Server closed
server.on('close', () => {
  console.log('Server closed');
});

// Client error (malformed request, etc.)
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) return;
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(3000);
```

---

## 5.8 Keep-Alive and Connection Pooling

### Server Keep-Alive

```javascript
const server = http.createServer((req, res) => {
  res.end('Hello');
});

// Configure timeouts
server.keepAliveTimeout = 5000;  // How long to keep idle connection open
server.headersTimeout = 60000;   // Max time for client to send headers
server.timeout = 120000;         // Max time for entire request

server.listen(3000);
```

### Client Keep-Alive (Agent)

```javascript
// Create custom agent with keep-alive
const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 25,
  maxFreeSockets: 10
});

// Use agent for requests
const options = {
  hostname: 'api.example.com',
  path: '/data',
  agent: agent  // Reuses connections
};

http.get(options, res => {
  // Handle response
});

// Destroy agent when done
// agent.destroy();
```

---

## 5.9 Request Timeouts

```javascript
const req = http.request(options, res => {
  // Handle response
});

// Set timeout
req.setTimeout(5000, () => {
  req.destroy();
  console.error('Request timed out');
});

// Or using AbortController (Node 15+)
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

const req = http.request(url, { signal: controller.signal }, res => {
  clearTimeout(timeout);
  // Handle response
});

req.on('error', err => {
  if (err.name === 'AbortError') {
    console.error('Request aborted');
  }
});
```

---

## 5.10 Streaming Responses

### Chunked Transfer

```javascript
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });
  
  // Stream data over time
  let count = 0;
  const interval = setInterval(() => {
    res.write(`Chunk ${++count}\n`);
    if (count >= 5) {
      clearInterval(interval);
      res.end('Done!\n');
    }
  }, 1000);
}).listen(3000);
```

### Server-Sent Events

```javascript
http.createServer((req, res) => {
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    // Send events
    let id = 0;
    const interval = setInterval(() => {
      res.write(`id: ${++id}\n`);
      res.write(`event: message\n`);
      res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
    }, 1000);
    
    // Cleanup on close
    req.on('close', () => {
      clearInterval(interval);
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <script>
        const es = new EventSource('/events');
        es.onmessage = e => console.log(JSON.parse(e.data));
      </script>
    `);
  }
}).listen(3000);
```

---

## 5.11 Common Gotchas

### Missing res.end()

```javascript
// ❌ Request hangs forever
http.createServer((req, res) => {
  res.write('Hello');
  // Forgot res.end()!
});

// ✅ Always end response
http.createServer((req, res) => {
  res.write('Hello');
  res.end();
});
```

### Headers After Body

```javascript
// ❌ Throws error
http.createServer((req, res) => {
  res.write('Hello');
  res.setHeader('X-Custom', 'value');  // Error!
  res.end();
});

// ✅ Set headers before body
http.createServer((req, res) => {
  res.setHeader('X-Custom', 'value');
  res.write('Hello');
  res.end();
});
```

### Handling Both Success and Error

```javascript
// ❌ Missing error handler
http.get(url, res => {
  // Only handles success
});

// ✅ Always handle errors
http.get(url, res => {
  // Handle response
}).on('error', err => {
  console.error('Request failed:', err.message);
});
```

### Not Consuming Response Body

```javascript
// ❌ Connection not freed
http.get(url, res => {
  console.log(res.statusCode);
  // Not reading body - connection stays open
});

// ✅ Consume or discard body
http.get(url, res => {
  console.log(res.statusCode);
  res.resume();  // Discard body, free connection
});
```

---

## 5.12 Summary

| Component | Purpose |
|-----------|---------|
| `http.createServer()` | Create HTTP server |
| `https.createServer()` | Create HTTPS server |
| `http.request()` | Make HTTP request |
| `http.get()` | Shortcut for GET requests |
| `req` (IncomingMessage) | Request data (method, url, headers) |
| `res` (ServerResponse) | Response methods (writeHead, write, end) |
| `http.Agent` | Connection pooling and keep-alive |

| Event | Description |
|-------|-------------|
| `request` | New incoming request |
| `connection` | New TCP connection |
| `close` | Server closed |
| `error` | Server error |
| `clientError` | Client request error |

---

**End of Module 5: HTTP and HTTPS**

Next: **Module 6 — Events** (EventEmitter, custom events, patterns)
# Module 6: Events

The `events` module is the foundation of Node.js's event-driven architecture. The `EventEmitter` class provides a way to emit and listen for named events, enabling loose coupling between components.

---

## 6.1 Module Import

```javascript
// CommonJS
const EventEmitter = require('events');
const { EventEmitter } = require('events');

// ES Modules
import EventEmitter from 'events';
import { EventEmitter, on, once } from 'events';
```

---

## 6.2 EventEmitter Basics

### Creating an EventEmitter

```javascript
const EventEmitter = require('events');

// Create instance
const emitter = new EventEmitter();

// Register listener
emitter.on('event', () => {
  console.log('Event fired!');
});

// Emit event
emitter.emit('event');
// Output: Event fired!
```

### Passing Data with Events

```javascript
const emitter = new EventEmitter();

// Listener receives arguments
emitter.on('data', (value, timestamp) => {
  console.log(`Received ${value} at ${timestamp}`);
});

// Emit with arguments
emitter.emit('data', 'hello', Date.now());
// Output: Received hello at 1699876543210
```

### The `this` Context

```javascript
const emitter = new EventEmitter();

// Regular function: `this` is the emitter
emitter.on('event', function() {
  console.log(this === emitter);  // true
});

// Arrow function: `this` is lexical scope
emitter.on('event', () => {
  console.log(this === emitter);  // false
});

emitter.emit('event');
```

---

## 6.3 Registration Methods

### on() — Persistent Listener

```javascript
const emitter = new EventEmitter();

emitter.on('data', data => {
  console.log('Received:', data);
});

emitter.emit('data', 1);  // Received: 1
emitter.emit('data', 2);  // Received: 2
emitter.emit('data', 3);  // Received: 3
```

### once() — One-Time Listener

```javascript
const emitter = new EventEmitter();

emitter.once('connect', () => {
  console.log('Connected!');
});

emitter.emit('connect');  // Connected!
emitter.emit('connect');  // (nothing)
emitter.emit('connect');  // (nothing)
```

### prependListener() — Add to Beginning

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => console.log('A'));
emitter.on('event', () => console.log('B'));
emitter.prependListener('event', () => console.log('First'));

emitter.emit('event');
// Output:
// First
// A
// B
```

### prependOnceListener()

```javascript
emitter.prependOnceListener('event', () => {
  console.log('First and only once');
});
```

### addListener() — Alias for on()

```javascript
// These are identical
emitter.on('event', handler);
emitter.addListener('event', handler);
```

---

## 6.4 Removing Listeners

### off() / removeListener()

```javascript
const emitter = new EventEmitter();

function handler(data) {
  console.log(data);
}

emitter.on('event', handler);
emitter.emit('event', 'Hello');  // Hello

// Remove listener (must be same function reference)
emitter.off('event', handler);
// Or: emitter.removeListener('event', handler);

emitter.emit('event', 'World');  // (nothing)
```

### removeAllListeners()

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => console.log('A'));
emitter.on('event', () => console.log('B'));
emitter.on('other', () => console.log('C'));

// Remove all listeners for 'event'
emitter.removeAllListeners('event');

// Remove ALL listeners on ALL events
emitter.removeAllListeners();
```

### Listener Reference Gotcha

```javascript
const emitter = new EventEmitter();

// ❌ Cannot remove - different function references
emitter.on('event', data => console.log(data));
emitter.off('event', data => console.log(data));  // Doesn't work!

// ✅ Store reference
const handler = data => console.log(data);
emitter.on('event', handler);
emitter.off('event', handler);  // Works!
```

---

## 6.5 Introspection Methods

### eventNames()

```javascript
const emitter = new EventEmitter();

emitter.on('connect', () => {});
emitter.on('data', () => {});
emitter.on('error', () => {});

console.log(emitter.eventNames());
// ['connect', 'data', 'error']
```

### listenerCount()

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => {});
emitter.on('event', () => {});
emitter.once('event', () => {});

console.log(emitter.listenerCount('event'));  // 3
```

### listeners()

```javascript
const emitter = new EventEmitter();

function handlerA() {}
function handlerB() {}

emitter.on('event', handlerA);
emitter.on('event', handlerB);

const listeners = emitter.listeners('event');
console.log(listeners);  // [handlerA, handlerB]
console.log(listeners[0] === handlerA);  // true
```

### rawListeners()

```javascript
// Returns wrapper for once() listeners
const emitter = new EventEmitter();

emitter.once('event', () => console.log('Once'));

const raw = emitter.rawListeners('event');
raw[0]();  // Once (manually invoke)
// Now the listener is consumed

emitter.emit('event');  // (nothing)
```

---

## 6.6 Configuration

### maxListeners

```javascript
const emitter = new EventEmitter();

// Default is 10 - warning if exceeded
emitter.on('event', () => {});
// ... add 11 listeners
// Warning: MaxListenersExceededWarning

// Increase limit
emitter.setMaxListeners(20);

// Get current limit
console.log(emitter.getMaxListeners());  // 20

// Remove limit entirely
emitter.setMaxListeners(0);  // No limit
emitter.setMaxListeners(Infinity);  // No limit
```

### Default Max Listeners

```javascript
// Change default for all new emitters
EventEmitter.defaultMaxListeners = 20;

const emitter = new EventEmitter();
console.log(emitter.getMaxListeners());  // 20
```

### captureRejections

```javascript
// Enable automatic error handling for async listeners
const emitter = new EventEmitter({ captureRejections: true });

emitter.on('event', async () => {
  throw new Error('Async error');
});

emitter.on('error', err => {
  console.log('Caught:', err.message);
});

emitter.emit('event');
// Output: Caught: Async error
```

---

## 6.7 Error Handling

### The 'error' Event

```javascript
const emitter = new EventEmitter();

// ❌ Without error handler - crashes!
emitter.emit('error', new Error('Something went wrong'));
// Throws: Error: Something went wrong

// ✅ With error handler
emitter.on('error', err => {
  console.error('Error handled:', err.message);
});

emitter.emit('error', new Error('Something went wrong'));
// Output: Error handled: Something went wrong
```

### Error Handling Pattern

```javascript
class SafeEmitter extends EventEmitter {
  constructor() {
    super();
    // Always have error handler
    this.on('error', err => {
      console.error('SafeEmitter error:', err.message);
    });
  }
  
  safeEmit(event, ...args) {
    try {
      this.emit(event, ...args);
    } catch (err) {
      this.emit('error', err);
    }
  }
}
```

### errorMonitor Symbol

```javascript
const { errorMonitor } = require('events');

const emitter = new EventEmitter();

// Listen to errors without consuming them
emitter.on(errorMonitor, err => {
  console.log('Error observed:', err.message);
  // Error still propagates to 'error' listener
});

emitter.on('error', err => {
  console.log('Error handled:', err.message);
});

emitter.emit('error', new Error('Test'));
// Output:
// Error observed: Test
// Error handled: Test
```

---

## 6.8 Static Methods

### events.once() — Promise-based

```javascript
const { once } = require('events');

const emitter = new EventEmitter();

async function waitForEvent() {
  // Returns array of arguments
  const [data] = await once(emitter, 'data');
  console.log('Got data:', data);
}

waitForEvent();
emitter.emit('data', 'Hello');
// Output: Got data: Hello
```

### events.on() — Async Iterator

```javascript
const { on } = require('events');

const emitter = new EventEmitter();

async function processEvents() {
  for await (const [value] of on(emitter, 'data')) {
    console.log('Value:', value);
    if (value === 'stop') break;
  }
  console.log('Done');
}

processEvents();

emitter.emit('data', 1);     // Value: 1
emitter.emit('data', 2);     // Value: 2
emitter.emit('data', 'stop');// Value: stop
                             // Done
```

### with AbortSignal

```javascript
const { on, once } = require('events');

async function waitWithTimeout() {
  const ac = new AbortController();
  
  // Timeout after 5 seconds
  const timeout = setTimeout(() => ac.abort(), 5000);
  
  try {
    const [data] = await once(emitter, 'data', { signal: ac.signal });
    clearTimeout(timeout);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Timeout waiting for data');
    }
    throw err;
  }
}
```

### events.getEventListeners()

```javascript
const { getEventListeners } = require('events');

// Works with EventEmitter and EventTarget
const emitter = new EventEmitter();
emitter.on('event', () => {});
emitter.on('event', () => {});

console.log(getEventListeners(emitter, 'event').length);  // 2
```

---

## 6.9 Extending EventEmitter

### Class-Based Extension

```javascript
const EventEmitter = require('events');

class User extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
  }
  
  login() {
    // Perform login
    this.emit('login', { user: this.name, timestamp: Date.now() });
  }
  
  logout() {
    this.emit('logout', { user: this.name });
  }
}

const user = new User('Alice');

user.on('login', data => {
  console.log(`${data.user} logged in at ${data.timestamp}`);
});

user.on('logout', data => {
  console.log(`${data.user} logged out`);
});

user.login();   // Alice logged in at 1699876543210
user.logout();  // Alice logged out
```

### Composition Pattern

```javascript
class Database {
  constructor() {
    this.events = new EventEmitter();
    this.connected = false;
  }
  
  connect() {
    // Simulate connection
    setTimeout(() => {
      this.connected = true;
      this.events.emit('connected');
    }, 100);
  }
  
  query(sql) {
    if (!this.connected) {
      this.events.emit('error', new Error('Not connected'));
      return;
    }
    // Execute query
    this.events.emit('query', { sql, timestamp: Date.now() });
  }
  
  // Delegate event methods
  on(event, listener) {
    this.events.on(event, listener);
    return this;
  }
  
  off(event, listener) {
    this.events.off(event, listener);
    return this;
  }
}

const db = new Database();
db.on('connected', () => console.log('Connected!'));
db.on('error', err => console.error('Error:', err.message));

db.connect();
```

---

## 6.10 Real-World Patterns

### Observable Data

```javascript
class ObservableValue extends EventEmitter {
  constructor(value) {
    super();
    this._value = value;
  }
  
  get value() {
    return this._value;
  }
  
  set value(newValue) {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.emit('change', newValue, oldValue);
    }
  }
}

const count = new ObservableValue(0);

count.on('change', (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});

count.value = 1;  // Changed from 0 to 1
count.value = 5;  // Changed from 1 to 5
count.value = 5;  // (nothing - same value)
```

### Request Queue

```javascript
class RequestQueue extends EventEmitter {
  constructor(concurrency = 5) {
    super();
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { request, resolve, reject } = this.queue.shift();
      this.running++;
      
      this.emit('start', request);
      
      try {
        const result = await request();
        this.emit('complete', result);
        resolve(result);
      } catch (err) {
        this.emit('error', err);
        reject(err);
      } finally {
        this.running--;
        this.process();
      }
    }
    
    if (this.running === 0 && this.queue.length === 0) {
      this.emit('drain');
    }
  }
}
```

### Pub/Sub System

```javascript
class PubSub extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
  }
  
  subscribe(channel, callback) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.channels.get(channel).delete(callback);
      if (this.channels.get(channel).size === 0) {
        this.channels.delete(channel);
      }
    };
  }
  
  publish(channel, message) {
    if (this.channels.has(channel)) {
      for (const callback of this.channels.get(channel)) {
        try {
          callback(message);
        } catch (err) {
          this.emit('error', err);
        }
      }
    }
    this.emit('publish', { channel, message });
  }
}

const pubsub = new PubSub();

const unsubscribe = pubsub.subscribe('news', msg => {
  console.log('News:', msg);
});

pubsub.publish('news', 'Hello World');
// News: Hello World

unsubscribe();
pubsub.publish('news', 'Another');
// (nothing)
```

---

## 6.11 Common Gotchas

### Memory Leaks

```javascript
// ❌ Listener never removed
function setupConnection(conn) {
  conn.on('data', data => process(data));
  // Connection closes but listener remains
}

// ✅ Remove listener on cleanup
function setupConnection(conn) {
  function handler(data) {
    process(data);
  }
  
  conn.on('data', handler);
  conn.on('close', () => {
    conn.off('data', handler);
  });
}
```

### Forgetting await with once()

```javascript
const { once } = require('events');

// ❌ Missing await
function waitForData(emitter) {
  once(emitter, 'data');  // Promise ignored!
  console.log('Continuing...');
}

// ✅ Await the promise
async function waitForData(emitter) {
  const [data] = await once(emitter, 'data');
  console.log('Got data:', data);
}
```

### Error Event Without Handler

```javascript
// ❌ Crashes the process
emitter.emit('error', new Error('Oops'));

// ✅ Always have error handler
emitter.on('error', err => {
  console.error('Error:', err.message);
});
```

### Synchronous Emission Before Listener

```javascript
const emitter = new EventEmitter();

// ❌ Event emitted before listener attached
emitter.emit('ready');
emitter.on('ready', () => console.log('Ready'));
// (nothing happens)

// ✅ Emit after listener is attached
emitter.on('ready', () => console.log('Ready'));
emitter.emit('ready');
// Ready

// ✅ Or use setImmediate for async emission
class Component extends EventEmitter {
  constructor() {
    super();
    setImmediate(() => this.emit('ready'));
  }
}

const comp = new Component();
comp.on('ready', () => console.log('Ready'));
// Ready
```

---

## 6.12 Summary

| Method | Description |
|--------|-------------|
| `on(event, fn)` | Add persistent listener |
| `once(event, fn)` | Add one-time listener |
| `off(event, fn)` | Remove specific listener |
| `removeAllListeners()` | Remove all listeners |
| `emit(event, ...args)` | Trigger event with data |
| `eventNames()` | Get array of event names |
| `listenerCount(event)` | Count listeners for event |
| `listeners(event)` | Get array of listeners |
| `setMaxListeners(n)` | Set listener limit |

| Static Method | Description |
|---------------|-------------|
| `once(emitter, event)` | Promise for single event |
| `on(emitter, event)` | Async iterator for events |
| `getEventListeners()` | Get listeners array |

| Special Event | Description |
|---------------|-------------|
| `error` | Must be handled or crashes |
| `newListener` | Before listener is added |
| `removeListener` | After listener is removed |

---

**End of Module 6: Events**

Next: **Module 7 — Streams** (Readable, Writable, Transform, piping)
# Module 7: Streams

Streams are one of Node.js's most powerful features. They allow you to process data piece by piece, without loading everything into memory. This is essential for handling large files, network data, and real-time processing.

---

## 7.1 Module Import

```javascript
// CommonJS
const stream = require('stream');
const { Readable, Writable, Transform, Duplex, pipeline, finished } = require('stream');

// ES Modules
import stream from 'stream';
import { Readable, Writable, Transform, pipeline } from 'stream';

// Promisified versions
const { pipeline, finished } = require('stream/promises');
```

---

## 7.2 Stream Types

Node.js has four types of streams:

| Type | Description | Examples |
|------|-------------|----------|
| Readable | Source of data | `fs.createReadStream`, `http.IncomingMessage`, `process.stdin` |
| Writable | Destination for data | `fs.createWriteStream`, `http.ServerResponse`, `process.stdout` |
| Duplex | Both readable and writable | `net.Socket`, TCP connections |
| Transform | Duplex that modifies data | `zlib.createGzip`, `crypto.createCipher` |

---

## 7.3 Readable Streams

### Consuming Readable Streams

#### 'data' Event (Flowing Mode)

```javascript
const fs = require('fs');

const readable = fs.createReadStream('large-file.txt');

readable.on('data', chunk => {
  console.log(`Received ${chunk.length} bytes`);
});

readable.on('end', () => {
  console.log('No more data');
});

readable.on('error', err => {
  console.error('Error:', err.message);
});
```

#### read() Method (Paused Mode)

```javascript
const readable = fs.createReadStream('file.txt');

readable.on('readable', () => {
  let chunk;
  while ((chunk = readable.read()) !== null) {
    console.log(`Read ${chunk.length} bytes`);
  }
});
```

#### Async Iteration (Modern Approach)

```javascript
const fs = require('fs');

async function processFile() {
  const readable = fs.createReadStream('file.txt', { encoding: 'utf8' });
  
  for await (const chunk of readable) {
    console.log(chunk);
  }
}
```

### Creating Custom Readable

```javascript
const { Readable } = require('stream');

// Simple implementation
const readable = new Readable({
  read(size) {
    this.push('Hello ');
    this.push('World!');
    this.push(null);  // Signal end
  }
});

readable.on('data', chunk => console.log(chunk.toString()));
// Hello World!
```

### Readable from Array

```javascript
const { Readable } = require('stream');

function readableFromArray(array) {
  let index = 0;
  return new Readable({
    objectMode: true,
    read() {
      if (index < array.length) {
        this.push(array[index++]);
      } else {
        this.push(null);
      }
    }
  });
}

const stream = readableFromArray([1, 2, 3, 4, 5]);
stream.on('data', num => console.log(num));
// 1, 2, 3, 4, 5
```

### Readable from Async Generator

```javascript
const { Readable } = require('stream');

async function* generateNumbers() {
  for (let i = 1; i <= 5; i++) {
    await new Promise(r => setTimeout(r, 100));
    yield i;
  }
}

const stream = Readable.from(generateNumbers());

for await (const num of stream) {
  console.log(num);
}
```

---

## 7.4 Writable Streams

### Writing to Writable Streams

```javascript
const fs = require('fs');

const writable = fs.createWriteStream('output.txt');

writable.write('Hello\n');
writable.write('World\n');
writable.end('Goodbye\n');  // Final write and close

writable.on('finish', () => {
  console.log('All data written');
});

writable.on('error', err => {
  console.error('Write error:', err.message);
});
```

### Handling Backpressure

```javascript
const writable = fs.createWriteStream('output.txt');

function writeData(data) {
  // write() returns false if internal buffer is full
  const canContinue = writable.write(data);
  
  if (!canContinue) {
    console.log('Backpressure! Waiting for drain...');
    writable.once('drain', () => {
      console.log('Drained, continuing...');
    });
  }
}

// Properly handle backpressure
async function writeAll(dataArray) {
  for (const data of dataArray) {
    const ok = writable.write(data);
    if (!ok) {
      await new Promise(resolve => writable.once('drain', resolve));
    }
  }
  writable.end();
}
```

### Creating Custom Writable

```javascript
const { Writable } = require('stream');

const writable = new Writable({
  write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString());
    // Call callback when done (with error if any)
    callback();
  }
});

writable.write('Hello');
writable.write('World');
writable.end();
```

### Object Mode Writable

```javascript
const { Writable } = require('stream');

const writable = new Writable({
  objectMode: true,
  write(object, encoding, callback) {
    console.log('Object:', JSON.stringify(object));
    callback();
  }
});

writable.write({ name: 'Alice' });
writable.write({ name: 'Bob' });
writable.end();
```

---

## 7.5 Transform Streams

Transform streams modify data as it passes through.

### Creating Transform Stream

```javascript
const { Transform } = require('stream');

const uppercase = new Transform({
  transform(chunk, encoding, callback) {
    // Push transformed data
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

process.stdin.pipe(uppercase).pipe(process.stdout);
// Input: hello
// Output: HELLO
```

### JSON Line Parser

```javascript
const { Transform } = require('stream');

const jsonParser = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        try {
          this.push(JSON.parse(line));
        } catch (e) {
          return callback(new Error(`Invalid JSON: ${line}`));
        }
      }
    }
    callback();
  }
});
```

### Chunked Data Aggregator

```javascript
const { Transform } = require('stream');

function createLineStream() {
  let buffer = '';
  
  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();  // Keep incomplete line
      
      for (const line of lines) {
        this.push(line + '\n');
      }
      callback();
    },
    flush(callback) {
      // Handle remaining data
      if (buffer) {
        this.push(buffer);
      }
      callback();
    }
  });
}
```

---

## 7.6 Duplex Streams

Duplex streams are both readable and writable (independently).

```javascript
const { Duplex } = require('stream');

const duplex = new Duplex({
  read(size) {
    this.push('data from read\n');
    this.push(null);
  },
  write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString());
    callback();
  }
});

duplex.on('data', chunk => console.log('Read:', chunk.toString()));
duplex.write('Hello');
duplex.end();
```

### PassThrough Stream

A special Transform that passes data through unchanged:

```javascript
const { PassThrough } = require('stream');

const pass = new PassThrough();

// Useful for monitoring or tapping streams
let bytes = 0;
pass.on('data', chunk => {
  bytes += chunk.length;
});
pass.on('end', () => {
  console.log(`Total bytes: ${bytes}`);
});

fs.createReadStream('file.txt').pipe(pass).pipe(fs.createWriteStream('copy.txt'));
```

---

## 7.7 Piping Streams

### Basic pipe()

```javascript
const fs = require('fs');

// Copy file
fs.createReadStream('source.txt')
  .pipe(fs.createWriteStream('dest.txt'));
```

### Chain of Pipes

```javascript
const zlib = require('zlib');

// Compress file
fs.createReadStream('file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('file.txt.gz'));

// Decompress file
fs.createReadStream('file.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('file.txt'));
```

### pipe() with Error Handling

```javascript
const source = fs.createReadStream('source.txt');
const dest = fs.createWriteStream('dest.txt');

source.pipe(dest);

// ❌ Error in source doesn't close dest
source.on('error', err => {
  console.error('Read error:', err);
  dest.close();
});

dest.on('error', err => {
  console.error('Write error:', err);
});
```

---

## 7.8 stream.pipeline()

Modern approach with proper error handling and cleanup:

```javascript
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// Callback version
pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz'),
  err => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);

// Promise version
const { pipeline } = require('stream/promises');

async function compressFile(input, output) {
  try {
    await pipeline(
      fs.createReadStream(input),
      zlib.createGzip(),
      fs.createWriteStream(output)
    );
    console.log('Compression complete');
  } catch (err) {
    console.error('Compression failed:', err);
  }
}
```

### Pipeline with Abort

```javascript
const { pipeline } = require('stream/promises');

const controller = new AbortController();

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await pipeline(
    fs.createReadStream('large-file.txt'),
    transform,
    fs.createWriteStream('output.txt'),
    { signal: controller.signal }
  );
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Pipeline aborted');
  }
}
```

---

## 7.9 stream.finished()

Wait for stream to finish or error:

```javascript
const { finished } = require('stream/promises');

const readable = fs.createReadStream('file.txt');

readable.on('data', chunk => {
  console.log(chunk);
});

try {
  await finished(readable);
  console.log('Stream finished');
} catch (err) {
  console.error('Stream error:', err);
}
```

---

## 7.10 Readable.toWeb() / from()

Convert between Node.js streams and Web Streams:

```javascript
const { Readable } = require('stream');

// Node stream to Web ReadableStream
const nodeStream = fs.createReadStream('file.txt');
const webStream = Readable.toWeb(nodeStream);

// Web ReadableStream to Node stream
const nodeStream2 = Readable.fromWeb(webStream);
```

---

## 7.11 Common Patterns

### Process Large File Line by Line

```javascript
const readline = require('readline');

async function processLines(filePath) {
  const fileStream = fs.createReadStream(filePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    console.log(`Line: ${line}`);
  }
}
```

### Stream to String

```javascript
async function streamToString(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

const content = await streamToString(fs.createReadStream('file.txt'));
```

### Stream to Buffer

```javascript
async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
```

### Progress Tracking

```javascript
const { Transform } = require('stream');

function createProgressStream(totalSize) {
  let transferred = 0;
  
  return new Transform({
    transform(chunk, encoding, callback) {
      transferred += chunk.length;
      const percent = ((transferred / totalSize) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${percent}%`);
      this.push(chunk);
      callback();
    },
    flush(callback) {
      console.log('\nComplete!');
      callback();
    }
  });
}

const stat = fs.statSync('large-file.txt');
fs.createReadStream('large-file.txt')
  .pipe(createProgressStream(stat.size))
  .pipe(fs.createWriteStream('copy.txt'));
```

### Rate Limiting Stream

```javascript
const { Transform } = require('stream');

function createThrottle(bytesPerSecond) {
  let lastTime = Date.now();
  let bytesSent = 0;
  
  return new Transform({
    async transform(chunk, encoding, callback) {
      bytesSent += chunk.length;
      const elapsed = (Date.now() - lastTime) / 1000;
      const rate = bytesSent / elapsed;
      
      if (rate > bytesPerSecond) {
        const delay = (bytesSent / bytesPerSecond - elapsed) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
      
      this.push(chunk);
      callback();
    }
  });
}

// Limit to 1MB/s
fs.createReadStream('file.txt')
  .pipe(createThrottle(1024 * 1024))
  .pipe(fs.createWriteStream('output.txt'));
```

---

## 7.12 HTTP Streaming

### Stream Response

```javascript
http.createServer((req, res) => {
  const filePath = './large-video.mp4';
  const stat = fs.statSync(filePath);
  
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': stat.size
  });
  
  fs.createReadStream(filePath).pipe(res);
}).listen(3000);
```

### Range Requests (Video Seeking)

```javascript
http.createServer((req, res) => {
  const filePath = './video.mp4';
  const stat = fs.statSync(filePath);
  const range = req.headers.range;
  
  if (range) {
    const [start, end] = range.replace(/bytes=/, '').split('-');
    const startByte = parseInt(start, 10);
    const endByte = end ? parseInt(end, 10) : stat.size - 1;
    const chunkSize = endByte - startByte + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${startByte}-${endByte}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    });
    
    fs.createReadStream(filePath, { start: startByte, end: endByte }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4'
    });
    fs.createReadStream(filePath).pipe(res);
  }
}).listen(3000);
```

---

## 7.13 Common Gotchas

### Not Handling Errors in Pipe Chain

```javascript
// ❌ Errors in middle streams not caught
source.pipe(transform).pipe(dest);

// ✅ Use pipeline
const { pipeline } = require('stream/promises');
await pipeline(source, transform, dest);
```

### Ignoring Backpressure

```javascript
// ❌ Can cause memory issues
for (const item of largeArray) {
  writable.write(JSON.stringify(item));
}

// ✅ Respect backpressure
for (const item of largeArray) {
  const ok = writable.write(JSON.stringify(item));
  if (!ok) {
    await new Promise(r => writable.once('drain', r));
  }
}
```

### Destroying Streams Properly

```javascript
// ❌ Just setting to null
stream = null;

// ✅ Destroy the stream
stream.destroy();

// With error
stream.destroy(new Error('Connection lost'));
```

### Forgetting Object Mode

```javascript
// ❌ Trying to push object without objectMode
const readable = new Readable({
  read() {
    this.push({ id: 1 });  // Error: Invalid data type
  }
});

// ✅ Enable object mode
const readable = new Readable({
  objectMode: true,
  read() {
    this.push({ id: 1 });  // Works!
  }
});
```

---

## 7.14 Summary

| Stream Type | Direction | Methods |
|-------------|-----------|---------|
| Readable | Data source | `read()`, `pipe()`, `on('data')` |
| Writable | Data destination | `write()`, `end()` |
| Transform | Modify passing data | `transform()`, `flush()` |
| Duplex | Both directions | All of the above |

| Utility | Purpose |
|---------|---------|
| `pipeline()` | Chain streams with error handling |
| `finished()` | Wait for stream completion |
| `Readable.from()` | Create stream from iterable |

| Event | Description |
|-------|-------------|
| `data` | Chunk available |
| `end` | No more data |
| `drain` | Writable buffer empty |
| `finish` | Writable completed |
| `error` | Error occurred |

---

**End of Module 7: Streams**

Next: **Module 8 — Buffer** (Binary data handling)
# Module 8: Buffer

The `Buffer` class provides a way to work with binary data directly in Node.js. Buffers are fixed-size chunks of memory allocated outside the V8 heap, essential for handling file I/O, network protocols, and binary data.

---

## 8.1 Creating Buffers

### Buffer.alloc() — Safe Allocation

```javascript
// Create zero-filled buffer
const buf = Buffer.alloc(10);
console.log(buf);
// <Buffer 00 00 00 00 00 00 00 00 00 00>

// Create buffer filled with specific value
const filled = Buffer.alloc(5, 'a');
console.log(filled);
// <Buffer 61 61 61 61 61>

// Fill with byte value
const bytes = Buffer.alloc(4, 0xFF);
console.log(bytes);
// <Buffer ff ff ff ff>
```

### Buffer.allocUnsafe() — Fast Allocation

```javascript
// Fast but may contain old data (security risk!)
const unsafe = Buffer.allocUnsafe(10);
console.log(unsafe);
// <Buffer (random old memory content)>

// Always zero-fill for sensitive data
const safe = Buffer.allocUnsafe(10).fill(0);
```

### Buffer.from() — From Existing Data

```javascript
// From string
const fromString = Buffer.from('Hello');
console.log(fromString);
// <Buffer 48 65 6c 6c 6f>

// From string with encoding
const utf8 = Buffer.from('Hello', 'utf8');
const base64 = Buffer.from('SGVsbG8=', 'base64');
const hex = Buffer.from('48656c6c6f', 'hex');

// From array
const fromArray = Buffer.from([72, 101, 108, 108, 111]);
console.log(fromArray.toString());
// 'Hello'

// From another buffer (copy)
const original = Buffer.from('Hello');
const copy = Buffer.from(original);

// From ArrayBuffer
const arrayBuffer = new ArrayBuffer(10);
const fromArrayBuffer = Buffer.from(arrayBuffer);
```

---

## 8.2 Encodings

Node.js supports these character encodings:

| Encoding | Description |
|----------|-------------|
| `utf8` | Multi-byte Unicode (default) |
| `ascii` | 7-bit ASCII |
| `utf16le` | Little-endian 16-bit Unicode |
| `ucs2` | Alias for utf16le |
| `base64` | Base64 encoding |
| `base64url` | URL-safe Base64 |
| `latin1` | ISO-8859-1 |
| `binary` | Alias for latin1 |
| `hex` | Hexadecimal |

```javascript
const buf = Buffer.from('Hello World');

// Convert to different encodings
console.log(buf.toString('utf8'));     // 'Hello World'
console.log(buf.toString('hex'));      // '48656c6c6f20576f726c64'
console.log(buf.toString('base64'));   // 'SGVsbG8gV29ybGQ='
console.log(buf.toString('base64url')); // 'SGVsbG8gV29ybGQ'

// Partial conversion
console.log(buf.toString('utf8', 0, 5)); // 'Hello'
```

---

## 8.3 Buffer Properties and Methods

### Properties

```javascript
const buf = Buffer.from('Hello');

// Length in bytes
console.log(buf.length);     // 5
console.log(buf.byteLength); // 5

// Get underlying ArrayBuffer
console.log(buf.buffer);  // ArrayBuffer

// Offset in ArrayBuffer (for slices)
console.log(buf.byteOffset);  // 0
```

### Reading Data

```javascript
const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

// Read integers
console.log(buf.readUInt8(0));         // 1
console.log(buf.readUInt16BE(0));      // 258 (0x0102)
console.log(buf.readUInt16LE(0));      // 513 (0x0201)
console.log(buf.readUInt32BE(0));      // 16909060 (0x01020304)
console.log(buf.readInt8(0));          // 1 (signed)

// Read floating point
const floatBuf = Buffer.alloc(4);
floatBuf.writeFloatBE(3.14);
console.log(floatBuf.readFloatBE(0));  // 3.140000104904175

// Big integers (64-bit)
const bigBuf = Buffer.alloc(8);
bigBuf.writeBigInt64BE(9007199254740993n);
console.log(bigBuf.readBigInt64BE(0)); // 9007199254740993n

// Index access
console.log(buf[0]);  // 1
console.log(buf[1]);  // 2
```

### Writing Data

```javascript
const buf = Buffer.alloc(16);

// Write integers
buf.writeUInt8(255, 0);
buf.writeUInt16BE(65535, 1);
buf.writeUInt16LE(65535, 3);
buf.writeUInt32BE(4294967295, 5);
buf.writeInt8(-128, 9);

// Write floating point
buf.writeFloatBE(3.14, 10);
buf.writeDoubleBE(3.14159, 0);

// Index assignment
buf[0] = 72;
buf[1] = 105;

// Write string
const strBuf = Buffer.alloc(20);
const bytesWritten = strBuf.write('Hello World', 0, 'utf8');
console.log(bytesWritten);  // 11
```

---

## 8.4 Buffer Manipulation

### Slicing

```javascript
const buf = Buffer.from('Hello World');

// slice() returns a view (shares memory!)
const slice = buf.slice(0, 5);
console.log(slice.toString());  // 'Hello'

// Modifying slice affects original
slice[0] = 74;  // 'J'
console.log(buf.toString());  // 'Jello World'

// subarray() is the same as slice()
const sub = buf.subarray(6);
console.log(sub.toString());  // 'World'
```

### Copying

```javascript
const source = Buffer.from('Hello');
const target = Buffer.alloc(10);

// Copy entire source to target
source.copy(target);
console.log(target.toString());  // 'Hello\x00\x00\x00\x00\x00'

// Copy with offsets
const buf = Buffer.alloc(26);
for (let i = 0; i < 26; i++) {
  buf[i] = i + 65;  // A-Z
}

const copy = Buffer.alloc(10);
buf.copy(copy, 0, 0, 10);  // (target, targetStart, sourceStart, sourceEnd)
console.log(copy.toString());  // 'ABCDEFGHIJ'
```

### Concatenating

```javascript
const buf1 = Buffer.from('Hello ');
const buf2 = Buffer.from('World');
const buf3 = Buffer.from('!');

const combined = Buffer.concat([buf1, buf2, buf3]);
console.log(combined.toString());  // 'Hello World!'

// With total length (truncates or pads)
const limited = Buffer.concat([buf1, buf2], 8);
console.log(limited.toString());  // 'Hello Wo'
```

### Comparing

```javascript
const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('ABD');
const buf3 = Buffer.from('ABC');

// compare() returns -1, 0, or 1
console.log(buf1.compare(buf2));  // -1 (buf1 < buf2)
console.log(buf1.compare(buf3));  // 0 (equal)
console.log(buf2.compare(buf1));  // 1 (buf2 > buf1)

// equals() for equality check
console.log(buf1.equals(buf3));  // true
console.log(buf1.equals(buf2));  // false

// Sort array of buffers
const sorted = [buf2, buf1, buf3].sort(Buffer.compare);
```

### Filling

```javascript
const buf = Buffer.alloc(10);

// Fill with string
buf.fill('abc');
console.log(buf.toString());  // 'abcabcabca'

// Fill with number
buf.fill(0);
console.log(buf);  // <Buffer 00 00 00 00 00 00 00 00 00 00>

// Fill range
buf.fill('X', 2, 5);
console.log(buf.toString());  // '\x00\x00XXX\x00\x00\x00\x00\x00'
```

---

## 8.5 Searching

### includes()

```javascript
const buf = Buffer.from('Hello World');

console.log(buf.includes('World'));     // true
console.log(buf.includes('world'));     // false (case-sensitive)
console.log(buf.includes(Buffer.from('lo'))); // true
console.log(buf.includes(111));          // true (ASCII 'o')
```

### indexOf() / lastIndexOf()

```javascript
const buf = Buffer.from('Hello World');

console.log(buf.indexOf('o'));          // 4
console.log(buf.indexOf('o', 5));       // 7 (start from offset)
console.log(buf.lastIndexOf('o'));      // 7
console.log(buf.indexOf('xyz'));        // -1 (not found)
```

---

## 8.6 Iteration

```javascript
const buf = Buffer.from('Hello');

// entries()
for (const [index, byte] of buf.entries()) {
  console.log(index, byte);
}
// 0 72
// 1 101
// 2 108
// 3 108
// 4 111

// keys()
for (const index of buf.keys()) {
  console.log(index);
}
// 0, 1, 2, 3, 4

// values()
for (const byte of buf.values()) {
  console.log(byte);
}
// 72, 101, 108, 108, 111

// forEach
buf.forEach((byte, index) => {
  console.log(`${index}: ${byte}`);
});
```

---

## 8.7 Buffer and TypedArrays

Buffers are Uint8Arrays under the hood:

```javascript
const buf = Buffer.from([1, 2, 3, 4]);

// Buffer is a Uint8Array
console.log(buf instanceof Uint8Array);  // true

// Create typed array views
const int16View = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2);
console.log(int16View);  // Int16Array [ 513, 1027 ]

// Create buffer from typed array
const uint16 = new Uint16Array([256, 512]);
const bufFromTyped = Buffer.from(uint16.buffer);
console.log(bufFromTyped);  // <Buffer 00 01 00 02>
```

---

## 8.8 Common Patterns

### Reading Binary File Format

```javascript
// Simple BMP header parser
function parseBMPHeader(buffer) {
  return {
    signature: buffer.toString('ascii', 0, 2),
    fileSize: buffer.readUInt32LE(2),
    reserved: buffer.readUInt32LE(6),
    dataOffset: buffer.readUInt32LE(10),
    headerSize: buffer.readUInt32LE(14),
    width: buffer.readInt32LE(18),
    height: buffer.readInt32LE(22),
    planes: buffer.readUInt16LE(26),
    bitsPerPixel: buffer.readUInt16LE(28)
  };
}

const bmpBuffer = fs.readFileSync('image.bmp');
const header = parseBMPHeader(bmpBuffer);
console.log(header);
```

### Creating Binary Protocol Message

```javascript
function createMessage(type, payload) {
  const payloadBuffer = Buffer.from(JSON.stringify(payload));
  const message = Buffer.alloc(8 + payloadBuffer.length);
  
  // Write header
  message.writeUInt32BE(0xDEADBEEF, 0);  // Magic number
  message.writeUInt8(type, 4);            // Message type
  message.writeUInt8(0, 5);               // Reserved
  message.writeUInt16BE(payloadBuffer.length, 6);  // Payload length
  
  // Write payload
  payloadBuffer.copy(message, 8);
  
  return message;
}

function parseMessage(buffer) {
  const magic = buffer.readUInt32BE(0);
  if (magic !== 0xDEADBEEF) {
    throw new Error('Invalid message');
  }
  
  return {
    type: buffer.readUInt8(4),
    payload: JSON.parse(buffer.slice(8).toString())
  };
}
```

### Base64 Image Handling

```javascript
// Image to base64
function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${buffer.toString('base64')}`;
}

// Base64 to image
function base64ToImage(dataUrl, outputPath) {
  const matches = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');
  
  const buffer = Buffer.from(matches[1], 'base64');
  fs.writeFileSync(outputPath, buffer);
}
```

### Hex Dump

```javascript
function hexDump(buffer, bytesPerLine = 16) {
  const lines = [];
  
  for (let i = 0; i < buffer.length; i += bytesPerLine) {
    const slice = buffer.slice(i, i + bytesPerLine);
    
    // Offset
    const offset = i.toString(16).padStart(8, '0');
    
    // Hex bytes
    const hex = [...slice]
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
      .padEnd(bytesPerLine * 3 - 1);
    
    // ASCII representation
    const ascii = [...slice]
      .map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')
      .join('');
    
    lines.push(`${offset}  ${hex}  |${ascii}|`);
  }
  
  return lines.join('\n');
}

console.log(hexDump(Buffer.from('Hello, World! This is a test.')));
// 00000000  48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 20 54 68  |Hello, World! Th|
// 00000010  69 73 20 69 73 20 61 20 74 65 73 74 2e           |is is a test.|
```

---

## 8.9 Blob (Node.js 18+)

```javascript
// Create Blob from buffer
const buffer = Buffer.from('Hello World');
const blob = new Blob([buffer], { type: 'text/plain' });

console.log(blob.size);  // 11
console.log(blob.type);  // 'text/plain'

// Read blob
const text = await blob.text();
console.log(text);  // 'Hello World'

// Blob to ArrayBuffer
const arrayBuffer = await blob.arrayBuffer();
const buf = Buffer.from(arrayBuffer);
```

---

## 8.10 Memory Considerations

### Buffer Pool

```javascript
// Small buffers (< 8KB) use pooled memory
const small = Buffer.alloc(100);       // From pool
const large = Buffer.alloc(10000);     // Direct allocation

// allocUnsafe uses pool (faster but may leak data)
const pooled = Buffer.allocUnsafe(100);  // From pool

// allocUnsafeSlow bypasses pool
const direct = Buffer.allocUnsafeSlow(100);  // Direct allocation
```

### Controlling Pool Size

```javascript
// Default pool size is 8KB
console.log(Buffer.poolSize);  // 8192

// Modify pool size (before any allocations)
Buffer.poolSize = 16384;  // 16KB
```

---

## 8.11 Common Gotchas

### Slice Shares Memory

```javascript
// ❌ Slice modifies original
const original = Buffer.from('Hello');
const slice = original.slice(0, 3);
slice[0] = 74;  // Changes original too!
console.log(original.toString());  // 'Jello'

// ✅ Use copy for independent buffer
const original = Buffer.from('Hello');
const copy = Buffer.from(original.slice(0, 3));
copy[0] = 74;
console.log(original.toString());  // 'Hello'
```

### String Length vs Buffer Length

```javascript
// ❌ String length !== byte length for Unicode
const emoji = '👋';
console.log(emoji.length);  // 2 (surrogate pair)
console.log(Buffer.from(emoji).length);  // 4 (UTF-8 bytes)

const chinese = '中文';
console.log(chinese.length);  // 2
console.log(Buffer.from(chinese).length);  // 6
```

### allocUnsafe Security

```javascript
// ❌ May contain sensitive old data
const buf = Buffer.allocUnsafe(1000);
console.log(buf.toString());  // Could contain passwords, keys, etc.

// ✅ Always fill for security-sensitive code
const safeBuf = Buffer.allocUnsafe(1000).fill(0);

// ✅ Or use alloc
const safeBuf2 = Buffer.alloc(1000);
```

### Buffer.from() with Numbers

```javascript
// ❌ Number creates buffer of that size (deprecated)
// Buffer.from(10);  // Don't do this

// ✅ Use array for bytes
Buffer.from([10]);  // Single byte buffer with value 10
```

---

## 8.12 Summary

| Creation Method | Description |
|-----------------|-------------|
| `Buffer.alloc(size)` | Zero-filled buffer (safe) |
| `Buffer.allocUnsafe(size)` | Uninitialized buffer (fast) |
| `Buffer.from(data)` | From string, array, or buffer |

| Read Methods | Write Methods |
|--------------|---------------|
| `readUInt8()` | `writeUInt8()` |
| `readUInt16BE/LE()` | `writeUInt16BE/LE()` |
| `readUInt32BE/LE()` | `writeUInt32BE/LE()` |
| `readFloatBE/LE()` | `writeFloatBE/LE()` |
| `readDoubleBE/LE()` | `writeDoubleBE/LE()` |

| Manipulation | Description |
|--------------|-------------|
| `slice()` / `subarray()` | Create view (shares memory) |
| `copy()` | Copy bytes to target buffer |
| `concat()` | Combine multiple buffers |
| `fill()` | Fill with value |
| `compare()` / `equals()` | Compare buffers |

---

**End of Module 8: Buffer**

Next: **Module 9 — URL and Query String** (URL parsing and manipulation)
# Module 9: URL and Query String

Node.js provides built-in modules for parsing, constructing, and manipulating URLs and query strings. The modern `URL` and `URLSearchParams` classes are recommended over the legacy `url` and `querystring` modules.

---

## 9.1 The URL Class (WHATWG Standard)

### Creating URLs

```javascript
// From string
const url = new URL('https://user:pass@example.com:8080/path/file.html?query=value#hash');

// From relative URL with base
const relative = new URL('/api/users', 'https://example.com');
console.log(relative.href);  // 'https://example.com/api/users'

// From existing URL
const copy = new URL(url);
```

### URL Components

```javascript
const url = new URL('https://user:pass@example.com:8080/path/file.html?query=value#hash');

console.log(url.href);        // Full URL string
console.log(url.protocol);    // 'https:'
console.log(url.username);    // 'user'
console.log(url.password);    // 'pass'
console.log(url.host);        // 'example.com:8080'
console.log(url.hostname);    // 'example.com'
console.log(url.port);        // '8080'
console.log(url.pathname);    // '/path/file.html'
console.log(url.search);      // '?query=value'
console.log(url.searchParams); // URLSearchParams object
console.log(url.hash);        // '#hash'
console.log(url.origin);      // 'https://example.com:8080'
```

### Modifying URLs

```javascript
const url = new URL('https://example.com');

// All properties are settable
url.pathname = '/api/users';
url.port = '3000';
url.searchParams.set('page', '1');
url.hash = 'section1';

console.log(url.href);
// 'https://example.com:3000/api/users?page=1#section1'
```

### URL Validation

```javascript
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

console.log(isValidUrl('https://example.com'));  // true
console.log(isValidUrl('not-a-url'));            // false
console.log(isValidUrl('ftp://files.com'));      // true
```

---

## 9.2 URLSearchParams

### Creating URLSearchParams

```javascript
// From string
const params1 = new URLSearchParams('foo=bar&baz=qux');

// From object
const params2 = new URLSearchParams({
  name: 'John',
  age: '30'
});

// From array of pairs
const params3 = new URLSearchParams([
  ['color', 'red'],
  ['color', 'blue'],  // Duplicate keys allowed
  ['size', 'large']
]);

// From URL
const url = new URL('https://example.com?foo=bar');
const params4 = url.searchParams;
```

### Getting Values

```javascript
const params = new URLSearchParams('name=John&colors=red&colors=blue');

// Get first value
console.log(params.get('name'));    // 'John'
console.log(params.get('colors'));  // 'red' (first only)
console.log(params.get('missing')); // null

// Get all values
console.log(params.getAll('colors')); // ['red', 'blue']

// Check existence
console.log(params.has('name'));    // true
console.log(params.has('missing')); // false
```

### Setting Values

```javascript
const params = new URLSearchParams();

// Set (replaces all with same key)
params.set('name', 'John');
params.set('name', 'Jane');  // Replaces
console.log(params.toString());  // 'name=Jane'

// Append (adds another)
params.append('color', 'red');
params.append('color', 'blue');
console.log(params.toString());  // 'name=Jane&color=red&color=blue'

// Delete
params.delete('color');
console.log(params.toString());  // 'name=Jane'

// Delete with value (Node.js 20+)
params.append('fruit', 'apple');
params.append('fruit', 'banana');
params.delete('fruit', 'apple');  // Only removes 'apple'
```

### Iterating

```javascript
const params = new URLSearchParams('a=1&b=2&c=3');

// entries()
for (const [key, value] of params.entries()) {
  console.log(`${key}: ${value}`);
}

// keys()
for (const key of params.keys()) {
  console.log(key);  // 'a', 'b', 'c'
}

// values()
for (const value of params.values()) {
  console.log(value);  // '1', '2', '3'
}

// forEach
params.forEach((value, key) => {
  console.log(`${key}=${value}`);
});

// Direct iteration (same as entries())
for (const [key, value] of params) {
  console.log(key, value);
}
```

### Sorting and Stringifying

```javascript
const params = new URLSearchParams('z=1&a=2&m=3');

// Sort alphabetically
params.sort();
console.log(params.toString());  // 'a=2&m=3&z=1'

// Size
console.log(params.size);  // 3

// To string
console.log(params.toString());  // 'a=2&m=3&z=1'
console.log(String(params));     // Same
```

---

## 9.3 URL Encoding

### Automatic Encoding

```javascript
const params = new URLSearchParams();

// Special characters are encoded automatically
params.set('query', 'hello world');
params.set('special', 'a=b&c=d');
console.log(params.toString());
// 'query=hello+world&special=a%3Db%26c%3Dd'
```

### Manual Encoding/Decoding

```javascript
// encodeURIComponent - encode special chars
const encoded = encodeURIComponent('hello world');
console.log(encoded);  // 'hello%20world'

// decodeURIComponent - decode
const decoded = decodeURIComponent('hello%20world');
console.log(decoded);  // 'hello world'

// encodeURI - encode full URL (preserves :, /, ?)
const url = 'https://example.com/path with spaces?q=hello world';
console.log(encodeURI(url));
// 'https://example.com/path%20with%20spaces?q=hello%20world'

// decodeURI
console.log(decodeURI('https://example.com/path%20name'));
// 'https://example.com/path name'
```

### Encoding Differences

```javascript
const text = 'Hello World! @#$%';

// encodeURIComponent: encodes everything except A-Z a-z 0-9 - _ . ~ 
console.log(encodeURIComponent(text));
// 'Hello%20World!%20%40%23%24%25'

// encodeURI: preserves URL-safe characters
console.log(encodeURI(text));
// 'Hello%20World!%20@#$%25'
```

---

## 9.4 Legacy url Module

The `url` module provides additional utilities and legacy parsing:

```javascript
const url = require('url');

// Parse URL (legacy)
const parsed = url.parse('https://user:pass@example.com/path?query=value', true);
console.log(parsed.protocol);  // 'https:'
console.log(parsed.query);     // { query: 'value' } (object when true)

// Format URL from object
const formatted = url.format({
  protocol: 'https',
  hostname: 'example.com',
  pathname: '/path',
  query: { key: 'value' }
});
console.log(formatted);  // 'https://example.com/path?key=value'

// Resolve relative URLs
console.log(url.resolve('https://example.com/a/b', '../c'));
// 'https://example.com/c'

console.log(url.resolve('https://example.com/a/b', '/c'));
// 'https://example.com/c'
```

### pathToFileURL / fileURLToPath

```javascript
const { pathToFileURL, fileURLToPath } = require('url');

// Path to file URL
const fileUrl = pathToFileURL('/home/user/file.txt');
console.log(fileUrl.href);
// 'file:///home/user/file.txt'

// File URL to path
const filePath = fileURLToPath('file:///home/user/file.txt');
console.log(filePath);
// '/home/user/file.txt'

// Useful for ES module import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

## 9.5 Legacy querystring Module

```javascript
const querystring = require('querystring');

// Parse query string
const parsed = querystring.parse('name=John&age=30&colors=red&colors=blue');
console.log(parsed);
// { name: 'John', age: '30', colors: ['red', 'blue'] }

// Stringify object
const str = querystring.stringify({
  name: 'John',
  colors: ['red', 'blue']
});
console.log(str);
// 'name=John&colors=red&colors=blue'

// Custom separator and equals
const custom = querystring.parse('name:John;age:30', ';', ':');
console.log(custom);
// { name: 'John', age: '30' }

// Escape/unescape
console.log(querystring.escape('hello world'));  // 'hello%20world'
console.log(querystring.unescape('hello%20world'));  // 'hello world'
```

---

## 9.6 Common Patterns

### Build URL with Query Parameters

```javascript
function buildUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

const url = buildUrl('https://api.example.com/search', {
  q: 'hello world',
  page: 1,
  tags: ['javascript', 'nodejs'],
  empty: null  // Ignored
});
// 'https://api.example.com/search?q=hello+world&page=1&tags=javascript&tags=nodejs'
```

### Parse Query String to Object

```javascript
function parseQuery(url) {
  const params = new URL(url).searchParams;
  const result = {};
  
  for (const [key, value] of params) {
    if (result[key] !== undefined) {
      // Convert to array for duplicate keys
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

console.log(parseQuery('https://example.com?a=1&b=2&a=3'));
// { a: ['1', '3'], b: '2' }
```

### Merge Query Parameters

```javascript
function mergeQueryParams(url, newParams) {
  const urlObj = new URL(url);
  
  Object.entries(newParams).forEach(([key, value]) => {
    if (value === null) {
      urlObj.searchParams.delete(key);
    } else {
      urlObj.searchParams.set(key, value);
    }
  });
  
  return urlObj.toString();
}

const url = 'https://example.com?page=1&sort=date';
console.log(mergeQueryParams(url, { page: '2', filter: 'active', sort: null }));
// 'https://example.com/?page=2&filter=active'
```

### Extract Path Parameters

```javascript
function matchPath(pattern, path) {
  const paramNames = [];
  const regexPattern = pattern.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  
  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);
  
  if (!match) return null;
  
  const params = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });
  
  return params;
}

console.log(matchPath('/users/:id/posts/:postId', '/users/123/posts/456'));
// { id: '123', postId: '456' }

console.log(matchPath('/users/:id', '/posts/123'));
// null
```

### URL Normalization

```javascript
function normalizeUrl(urlString) {
  const url = new URL(urlString);
  
  // Lowercase hostname
  url.hostname = url.hostname.toLowerCase();
  
  // Remove default ports
  if ((url.protocol === 'https:' && url.port === '443') ||
      (url.protocol === 'http:' && url.port === '80')) {
    url.port = '';
  }
  
  // Remove trailing slash (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  
  // Sort query parameters
  url.searchParams.sort();
  
  // Remove hash
  url.hash = '';
  
  return url.toString();
}

console.log(normalizeUrl('HTTPS://EXAMPLE.COM:443/Path/?b=2&a=1#hash'));
// 'https://example.com/Path?a=1&b=2'
```

---

## 9.7 Security Considerations

### URL Validation

```javascript
function isHttpUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ❌ Dangerous - allows any protocol
function dangerousRedirect(userUrl) {
  return userUrl;  // Could be javascript:, data:, file:
}

// ✅ Safe - validate protocol
function safeRedirect(userUrl) {
  if (!isHttpUrl(userUrl)) {
    throw new Error('Invalid URL');
  }
  return userUrl;
}
```

### Prevent Open Redirect

```javascript
function isSameOrigin(urlString, baseUrl) {
  try {
    const url = new URL(urlString, baseUrl);
    const base = new URL(baseUrl);
    return url.origin === base.origin;
  } catch {
    return false;
  }
}

// ❌ Vulnerable to open redirect
app.get('/redirect', (req, res) => {
  res.redirect(req.query.url);
});

// ✅ Safe - validate origin
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  if (isSameOrigin(url, 'https://myapp.com')) {
    res.redirect(url);
  } else {
    res.status(400).send('Invalid redirect URL');
  }
});
```

### Sanitize User Input in URLs

```javascript
function buildSafeUrl(base, userInput) {
  const url = new URL(base);
  
  // User input in path - encode it
  url.pathname = `/search/${encodeURIComponent(userInput)}`;
  
  // User input in query - URLSearchParams handles encoding
  url.searchParams.set('q', userInput);
  
  return url.toString();
}

buildSafeUrl('https://example.com', 'test/../../../etc/passwd');
// 'https://example.com/search/test%2F..%2F..%2F..%2Fetc%2Fpasswd?q=test%2F..%2F..%2F..%2Fetc%2Fpasswd'
```

---

## 9.8 Common Gotchas

### Relative URL Without Base

```javascript
// ❌ Throws error
new URL('/path/to/page');
// TypeError: Invalid URL

// ✅ Provide base URL
new URL('/path/to/page', 'https://example.com');
```

### URLSearchParams Order Not Preserved

```javascript
const params = new URLSearchParams();
params.set('z', '1');
params.set('a', '2');

// Order is preserved
console.log(params.toString());  // 'z=1&a=2'

// But creating from object may not preserve order
const fromObj = new URLSearchParams({ z: '1', a: '2' });
// Order depends on object property order
```

### Plus Signs in Query Strings

```javascript
// Plus sign means space in query strings
const params = new URLSearchParams('name=John+Doe');
console.log(params.get('name'));  // 'John Doe'

// To preserve plus sign, encode it
const encoded = new URLSearchParams({ email: 'test+alias@example.com' });
console.log(encoded.toString());  // 'email=test%2Balias%40example.com'
```

### Empty vs Missing Parameters

```javascript
const url1 = new URL('https://example.com?key=');
const url2 = new URL('https://example.com?key');
const url3 = new URL('https://example.com');

console.log(url1.searchParams.get('key'));  // '' (empty string)
console.log(url2.searchParams.get('key'));  // '' (empty string)
console.log(url3.searchParams.get('key'));  // null
```

---

## 9.9 Summary

| Class/Method | Description |
|--------------|-------------|
| `new URL(url)` | Parse URL string |
| `url.searchParams` | Get URLSearchParams object |
| `url.href` | Full URL string |
| `url.origin` | Protocol + host + port |
| `new URLSearchParams()` | Create query string builder |
| `params.get(key)` | Get first value |
| `params.getAll(key)` | Get all values |
| `params.set(key, value)` | Set (replace) value |
| `params.append(key, value)` | Add value |
| `params.delete(key)` | Remove parameter |

| Utility Function | Description |
|------------------|-------------|
| `encodeURIComponent()` | Encode for query/path segment |
| `decodeURIComponent()` | Decode encoded string |
| `encodeURI()` | Encode full URL (preserves special chars) |
| `pathToFileURL()` | Convert file path to file:// URL |
| `fileURLToPath()` | Convert file:// URL to path |

---

**End of Module 9: URL and Query String**

Next: **Module 10 — OS** (Operating system information)
# Module 10: OS

The `os` module provides operating system-related utility methods and properties. It's essential for writing cross-platform code and system monitoring applications.

---

## 10.1 Module Import

```javascript
// CommonJS
const os = require('os');

// ES Modules
import os from 'os';
import { cpus, freemem, totalmem } from 'os';
```

---

## 10.2 System Information

### Platform and Architecture

```javascript
// Operating system platform
console.log(os.platform());
// 'linux', 'darwin' (macOS), 'win32', 'freebsd', etc.

// CPU architecture
console.log(os.arch());
// 'x64', 'arm', 'arm64', 'ia32', etc.

// Operating system name
console.log(os.type());
// 'Linux', 'Darwin', 'Windows_NT'

// OS version
console.log(os.version());
// 'Darwin Kernel Version 23.0.0...'

// OS release
console.log(os.release());
// '23.0.0' on macOS, '5.15.0-generic' on Linux

// Machine type (Node.js 18+)
console.log(os.machine());
// 'x86_64', 'arm64', etc.
```

### Endianness

```javascript
// Byte order
console.log(os.endianness());
// 'LE' (little-endian) or 'BE' (big-endian)
```

---

## 10.3 Memory Information

```javascript
// Total system memory in bytes
const totalMem = os.totalmem();
console.log(`Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
// Total: 16.00 GB

// Free memory in bytes
const freeMem = os.freemem();
console.log(`Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
// Free: 4.50 GB

// Memory usage percentage
const usedPercent = ((totalMem - freeMem) / totalMem * 100).toFixed(1);
console.log(`Used: ${usedPercent}%`);
// Used: 71.9%
```

### Memory Helper Functions

```javascript
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

console.log(formatBytes(os.totalmem()));  // '16 GB'
console.log(formatBytes(os.freemem()));   // '4.5 GB'
```

---

## 10.4 CPU Information

### cpu() Array

```javascript
const cpus = os.cpus();

console.log(`CPU Cores: ${cpus.length}`);

// Each CPU entry
cpus.forEach((cpu, index) => {
  console.log(`CPU ${index}:`);
  console.log(`  Model: ${cpu.model}`);
  console.log(`  Speed: ${cpu.speed} MHz`);
  console.log(`  Times:`, cpu.times);
});

// Output:
// CPU 0:
//   Model: Apple M1 Pro
//   Speed: 3220
//   Times: { user: 12345, nice: 0, sys: 5432, idle: 98765, irq: 0 }
```

### CPU Usage Calculation

```javascript
function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  
  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length,
    usage: ((1 - totalIdle / totalTick) * 100).toFixed(1)
  };
}

console.log(`CPU Usage: ${getCPUUsage().usage}%`);
```

### CPU Usage Over Time

```javascript
function measureCPU(interval = 1000) {
  const startMeasure = getCPUInfo();
  
  return new Promise(resolve => {
    setTimeout(() => {
      const endMeasure = getCPUInfo();
      
      const idleDiff = endMeasure.idle - startMeasure.idle;
      const totalDiff = endMeasure.total - startMeasure.total;
      const usage = 100 - (idleDiff / totalDiff * 100);
      
      resolve(usage.toFixed(1));
    }, interval);
  });
}

function getCPUInfo() {
  const cpus = os.cpus();
  let idle = 0, total = 0;
  
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  
  return { idle, total };
}

// Usage
const usage = await measureCPU(1000);
console.log(`CPU Usage (1s): ${usage}%`);
```

---

## 10.5 Load Average

```javascript
// 1, 5, and 15 minute load averages
const [load1, load5, load15] = os.loadavg();

console.log(`Load Average: ${load1.toFixed(2)}, ${load5.toFixed(2)}, ${load15.toFixed(2)}`);
// Load Average: 2.45, 2.12, 1.98

// Note: Returns [0, 0, 0] on Windows
```

---

## 10.6 User Information

```javascript
// Current user info
const userInfo = os.userInfo();

console.log(userInfo);
// {
//   uid: 501,
//   gid: 20,
//   username: 'john',
//   homedir: '/Users/john',
//   shell: '/bin/zsh'
// }

// On Windows, uid and gid are -1, shell is null

// Home directory (alternative)
console.log(os.homedir());
// '/Users/john' or 'C:\\Users\\john'

// Temp directory
console.log(os.tmpdir());
// '/tmp' or 'C:\\Users\\john\\AppData\\Local\\Temp'
```

---

## 10.7 Network Interfaces

```javascript
const interfaces = os.networkInterfaces();

console.log(interfaces);
// {
//   lo: [
//     { address: '127.0.0.1', netmask: '255.0.0.0', family: 'IPv4', ... }
//   ],
//   eth0: [
//     { address: '192.168.1.100', netmask: '255.255.255.0', family: 'IPv4', ... },
//     { address: 'fe80::1', netmask: 'ffff:ffff:ffff:ffff::', family: 'IPv6', ... }
//   ]
// }
```

### Get Local IP Address

```javascript
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

console.log(`Local IP: ${getLocalIP()}`);
// Local IP: 192.168.1.100
```

### Get All IP Addresses

```javascript
function getAllIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const [name, ifaces] of Object.entries(interfaces)) {
    for (const iface of ifaces) {
      if (!iface.internal) {
        ips.push({
          interface: name,
          address: iface.address,
          family: iface.family,
          mac: iface.mac
        });
      }
    }
  }
  
  return ips;
}

console.log(getAllIPs());
```

---

## 10.8 System Uptime

```javascript
// System uptime in seconds
const uptime = os.uptime();

console.log(`Uptime: ${uptime} seconds`);

// Format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

console.log(`Uptime: ${formatUptime(os.uptime())}`);
// Uptime: 5d 12h 34m 56s
```

---

## 10.9 Hostname

```javascript
console.log(os.hostname());
// 'my-macbook.local'
```

---

## 10.10 End-of-Line Character

```javascript
// Platform-specific newline
console.log(os.EOL);
// '\n' on POSIX (Linux, macOS)
// '\r\n' on Windows

// Use for cross-platform text files
const lines = ['Line 1', 'Line 2', 'Line 3'];
const content = lines.join(os.EOL);
```

---

## 10.11 Process Priority

```javascript
// Get current process priority
console.log(os.getPriority());
// 0 (normal priority)

// Get priority of specific process
console.log(os.getPriority(process.pid));

// Set priority (requires permissions)
try {
  os.setPriority(process.pid, 10);  // Lower priority
  os.setPriority(process.pid, -10); // Higher priority (may need root)
} catch (err) {
  console.error('Cannot set priority:', err.message);
}

// Priority constants
// -20: Highest priority
// 0: Normal priority
// 19: Lowest priority (Linux)
```

---

## 10.12 Available Parallelism

```javascript
// Recommended number of parallel operations (Node.js 19+)
console.log(os.availableParallelism());
// 8 (number of logical cores)

// Fallback for older Node.js
const parallelism = os.availableParallelism?.() ?? os.cpus().length;
```

---

## 10.13 Constants

```javascript
// Signal constants
console.log(os.constants.signals.SIGINT);   // 2
console.log(os.constants.signals.SIGTERM);  // 15
console.log(os.constants.signals.SIGKILL);  // 9

// Error constants
console.log(os.constants.errno.ENOENT);     // 2 (No such file)
console.log(os.constants.errno.EACCES);     // 13 (Permission denied)
console.log(os.constants.errno.ECONNREFUSED); // 111

// Priority constants
console.log(os.constants.priority.PRIORITY_LOW);      // 19
console.log(os.constants.priority.PRIORITY_NORMAL);   // 0
console.log(os.constants.priority.PRIORITY_HIGH);     // -7
```

---

## 10.14 Common Patterns

### System Monitor

```javascript
function getSystemInfo() {
  const cpus = os.cpus();
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: formatUptime(os.uptime()),
    memory: {
      total: formatBytes(os.totalmem()),
      free: formatBytes(os.freemem()),
      used: formatBytes(os.totalmem() - os.freemem()),
      usedPercent: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1) + '%'
    },
    cpu: {
      model: cpus[0].model,
      cores: cpus.length,
      speed: cpus[0].speed + ' MHz'
    },
    loadAvg: os.loadavg().map(n => n.toFixed(2)).join(', '),
    user: os.userInfo().username
  };
}

console.log(getSystemInfo());
```

### Environment Detection

```javascript
const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

const is64bit = os.arch() === 'x64' || os.arch() === 'arm64';
const isARM = os.arch().startsWith('arm');

console.log({ isWindows, isMac, isLinux, is64bit, isARM });
```

### Resource Monitoring

```javascript
class ResourceMonitor {
  constructor(interval = 5000) {
    this.interval = interval;
    this.timer = null;
    this.history = [];
  }
  
  start() {
    this.timer = setInterval(() => {
      const snapshot = {
        timestamp: Date.now(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        loadAvg: os.loadavg(),
        uptime: os.uptime()
      };
      
      this.history.push(snapshot);
      
      // Keep last 100 entries
      if (this.history.length > 100) {
        this.history.shift();
      }
      
      this.emit('snapshot', snapshot);
    }, this.interval);
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  getAverage() {
    if (this.history.length === 0) return null;
    
    const sum = this.history.reduce((acc, s) => ({
      memoryUsed: acc.memoryUsed + s.memory.used,
      load: acc.load + s.loadAvg[0]
    }), { memoryUsed: 0, load: 0 });
    
    return {
      avgMemoryUsed: sum.memoryUsed / this.history.length,
      avgLoad: sum.load / this.history.length
    };
  }
}
```

### Cross-Platform Paths

```javascript
function getCachePath(appName) {
  const home = os.homedir();
  
  switch (os.platform()) {
    case 'win32':
      return path.join(home, 'AppData', 'Local', appName, 'Cache');
    case 'darwin':
      return path.join(home, 'Library', 'Caches', appName);
    default:
      return path.join(home, '.cache', appName);
  }
}

function getConfigPath(appName) {
  const home = os.homedir();
  
  switch (os.platform()) {
    case 'win32':
      return path.join(home, 'AppData', 'Roaming', appName);
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', appName);
    default:
      return path.join(home, '.config', appName);
  }
}
```

---

## 10.15 Summary

| Method | Description |
|--------|-------------|
| `platform()` | OS platform (linux, darwin, win32) |
| `arch()` | CPU architecture (x64, arm64) |
| `type()` | OS name (Linux, Darwin, Windows_NT) |
| `release()` | OS release version |
| `version()` | OS version string |
| `hostname()` | Machine hostname |
| `uptime()` | System uptime in seconds |

| Memory | Description |
|--------|-------------|
| `totalmem()` | Total memory in bytes |
| `freemem()` | Free memory in bytes |

| CPU | Description |
|-----|-------------|
| `cpus()` | Array of CPU info |
| `loadavg()` | 1, 5, 15 minute load averages |
| `availableParallelism()` | Recommended parallelism |

| User/System | Description |
|-------------|-------------|
| `userInfo()` | Current user info |
| `homedir()` | User home directory |
| `tmpdir()` | Temp directory |
| `networkInterfaces()` | Network interfaces |
| `EOL` | Platform line ending |

---

**End of Module 10: OS**

Next: **Module 11 — Crypto** (Cryptographic operations)
# Module 11: Crypto

The `crypto` module provides cryptographic functionality including hashing, encryption, decryption, signing, and random number generation. It wraps OpenSSL for high-performance, secure operations.

---

## 11.1 Module Import

```javascript
// CommonJS
const crypto = require('crypto');

// ES Modules
import crypto from 'crypto';
import { createHash, createCipheriv, randomBytes } from 'crypto';
```

---

## 11.2 Random Data Generation

### randomBytes()

```javascript
// Synchronous
const bytes = crypto.randomBytes(32);
console.log(bytes.toString('hex'));
// 'a1b2c3d4e5f6...' (64 hex characters)

// Asynchronous
crypto.randomBytes(32, (err, buf) => {
  if (err) throw err;
  console.log(buf.toString('hex'));
});

// Promise wrapper
const { promisify } = require('util');
const randomBytesAsync = promisify(crypto.randomBytes);
const bytes = await randomBytesAsync(32);
```

### randomInt()

```javascript
// Random integer in range [min, max)
const num = crypto.randomInt(100);        // 0-99
const num2 = crypto.randomInt(10, 100);   // 10-99

// Asynchronous
crypto.randomInt(100, (err, n) => {
  console.log(n);
});

// Promise-based
const n = await new Promise((resolve, reject) => {
  crypto.randomInt(100, (err, n) => {
    if (err) reject(err);
    else resolve(n);
  });
});
```

### randomUUID()

```javascript
const uuid = crypto.randomUUID();
console.log(uuid);
// 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
```

### randomFillSync()

```javascript
// Fill buffer with random bytes
const buf = Buffer.alloc(16);
crypto.randomFillSync(buf);
console.log(buf.toString('hex'));

// Fill typed array
const arr = new Uint32Array(4);
crypto.randomFillSync(arr);
console.log(arr);
// Uint32Array(4) [ 3847382910, 1029384756, ... ]
```

---

## 11.3 Hashing

### createHash()

```javascript
// Create hash
const hash = crypto.createHash('sha256');
hash.update('Hello World');
const digest = hash.digest('hex');
console.log(digest);
// 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// One-liner
const hash = crypto.createHash('sha256').update('Hello World').digest('hex');

// Multiple updates
const hash = crypto.createHash('sha256');
hash.update('Hello ');
hash.update('World');
console.log(hash.digest('hex'));
// Same result as above
```

### Available Algorithms

```javascript
console.log(crypto.getHashes());
// ['sha1', 'sha256', 'sha384', 'sha512', 'md5', ...]

// Common algorithms
// md5 - 128 bits (not secure, legacy only)
// sha1 - 160 bits (not secure for signatures)
// sha256 - 256 bits (recommended)
// sha384 - 384 bits
// sha512 - 512 bits
```

### File Hashing

```javascript
const fs = require('fs');

// Stream-based (memory efficient)
function hashFile(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

const fileHash = await hashFile('large-file.zip');
console.log(fileHash);
```

### HMAC (Keyed Hash)

```javascript
const secret = 'my-secret-key';

// Create HMAC
const hmac = crypto.createHmac('sha256', secret);
hmac.update('message');
const signature = hmac.digest('hex');
console.log(signature);

// One-liner
const sig = crypto.createHmac('sha256', secret)
  .update('message')
  .digest('hex');

// Verify HMAC (timing-safe)
function verifyHmac(message, signature, secret) {
  const expected = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
```

---

## 11.4 Symmetric Encryption (AES)

### Encryption with AES-256-GCM (Recommended)

```javascript
function encrypt(plaintext, key) {
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.randomBytes(12);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag (16 bytes)
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + ciphertext
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

function decrypt(ciphertext, key) {
  // Extract IV, auth tag, and encrypted data
  const iv = Buffer.from(ciphertext.slice(0, 24), 'hex');
  const authTag = Buffer.from(ciphertext.slice(24, 56), 'hex');
  const encrypted = ciphertext.slice(56);
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage
const key = crypto.randomBytes(32);  // 256 bits
const encrypted = encrypt('Secret message', key);
const decrypted = decrypt(encrypted, key);
console.log(decrypted);  // 'Secret message'
```

### AES-256-CBC (Legacy)

```javascript
function encryptCBC(plaintext, key) {
  const iv = crypto.randomBytes(16);  // 16 bytes for CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + encrypted;
}

function decryptCBC(ciphertext, key) {
  const iv = Buffer.from(ciphertext.slice(0, 32), 'hex');
  const encrypted = ciphertext.slice(32);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Key Derivation (PBKDF2)

```javascript
// Derive key from password
function deriveKey(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve({ key, salt });
    });
  });
}

// Synchronous version
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
```

### Scrypt (More Secure Key Derivation)

```javascript
function deriveKeyScrypt(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, key) => {
      if (err) reject(err);
      else resolve({ key, salt });
    });
  });
}

// Synchronous
const key = crypto.scryptSync(password, salt, 32);
```

---

## 11.5 Asymmetric Encryption (RSA)

### Generate Key Pair

```javascript
const { generateKeyPairSync, generateKeyPair } = crypto;

// Synchronous
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Asynchronous
generateKeyPair('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
}, (err, publicKey, privateKey) => {
  console.log(publicKey);
  console.log(privateKey);
});
```

### Encrypt/Decrypt with RSA

```javascript
// Encrypt with public key
function rsaEncrypt(plaintext, publicKey) {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(plaintext)
  ).toString('base64');
}

// Decrypt with private key
function rsaDecrypt(ciphertext, privateKey) {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(ciphertext, 'base64')
  ).toString('utf8');
}

// Usage
const encrypted = rsaEncrypt('Secret message', publicKey);
const decrypted = rsaDecrypt(encrypted, privateKey);
```

---

## 11.6 Digital Signatures

### Sign and Verify

```javascript
const { createSign, createVerify } = crypto;

// Sign data
function sign(data, privateKey) {
  const signer = createSign('sha256');
  signer.update(data);
  return signer.sign(privateKey, 'hex');
}

// Verify signature
function verify(data, signature, publicKey) {
  const verifier = createVerify('sha256');
  verifier.update(data);
  return verifier.verify(publicKey, signature, 'hex');
}

// Usage
const signature = sign('Hello World', privateKey);
const isValid = verify('Hello World', signature, publicKey);
console.log(isValid);  // true
```

### Ed25519 Signatures (Faster)

```javascript
// Generate Ed25519 key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

// Sign
const signature = crypto.sign(null, Buffer.from('data'), privateKey);

// Verify
const isValid = crypto.verify(null, Buffer.from('data'), publicKey, signature);
```

---

## 11.7 Diffie-Hellman Key Exchange

```javascript
const { createDiffieHellman, createECDH } = crypto;

// Classic DH
const alice = createDiffieHellman(2048);
alice.generateKeys();

const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());
bob.generateKeys();

// Exchange public keys and compute shared secret
const aliceSecret = alice.computeSecret(bob.getPublicKey());
const bobSecret = bob.computeSecret(alice.getPublicKey());

console.log(aliceSecret.equals(bobSecret));  // true
```

### ECDH (Elliptic Curve DH)

```javascript
// Create ECDH instances
const alice = createECDH('secp256k1');
alice.generateKeys();

const bob = createECDH('secp256k1');
bob.generateKeys();

// Exchange and compute
const aliceSecret = alice.computeSecret(bob.getPublicKey());
const bobSecret = bob.computeSecret(alice.getPublicKey());

console.log(aliceSecret.equals(bobSecret));  // true

// Use shared secret as encryption key
const key = crypto.createHash('sha256').update(aliceSecret).digest();
```

---

## 11.8 Password Hashing

### Using scrypt (Recommended)

```javascript
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return salt.toString('hex') + ':' + hash.toString('hex');
}

async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(hashHex, 'hex');
  
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  
  return crypto.timingSafeEqual(derivedKey, storedKey);
}

// Usage
const hash = await hashPassword('mypassword123');
const isValid = await verifyPassword('mypassword123', hash);
console.log(isValid);  // true
```

---

## 11.9 Timing-Safe Comparison

```javascript
// ❌ Vulnerable to timing attacks
function unsafeCompare(a, b) {
  return a === b;
}

// ✅ Timing-safe comparison
function safeCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Always use for comparing secrets, signatures, tokens
```

---

## 11.10 X509 Certificates

```javascript
const { X509Certificate } = crypto;

// Parse certificate
const cert = new X509Certificate(fs.readFileSync('cert.pem'));

console.log(cert.subject);            // Subject DN
console.log(cert.issuer);             // Issuer DN
console.log(cert.validFrom);          // Valid from date
console.log(cert.validTo);            // Valid to date
console.log(cert.serialNumber);       // Serial number
console.log(cert.fingerprint256);     // SHA-256 fingerprint

// Check validity
console.log(cert.checkHost('example.com'));  // Returns subject if valid
console.log(cert.checkEmail('test@example.com'));
console.log(cert.checkIP('192.168.1.1'));

// Verify certificate
console.log(cert.verify(caCert.publicKey));  // true/false
```

---

## 11.11 Common Patterns

### Generate Secure Token

```javascript
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// URL-safe token
function generateUrlSafeToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

const apiKey = generateToken(24);
const resetToken = generateUrlSafeToken(32);
```

### Hash Verification

```javascript
function createFileChecksum(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function verifyFileChecksum(filePath, expectedChecksum, algorithm = 'sha256') {
  const actualChecksum = await createFileChecksum(filePath, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(actualChecksum, 'hex'),
    Buffer.from(expectedChecksum, 'hex')
  );
}
```

### Secure Session ID

```javascript
function generateSessionId() {
  const bytes = crypto.randomBytes(32);
  const timestamp = Date.now().toString(16);
  const random = bytes.toString('base64url');
  return `${timestamp}.${random}`;
}

// Output: '18d5a7b3c00.Ks8Hj_9xMnO3pQ2rS...'
```

---

## 11.12 Security Best Practices

### Do's

```javascript
// ✅ Use authenticated encryption (GCM)
crypto.createCipheriv('aes-256-gcm', key, iv);

// ✅ Use strong key derivation for passwords
crypto.scrypt(password, salt, 64, callback);

// ✅ Use timing-safe comparison
crypto.timingSafeEqual(a, b);

// ✅ Generate cryptographically secure random values
crypto.randomBytes(32);
crypto.randomUUID();

// ✅ Use modern algorithms
crypto.createHash('sha256');  // Not MD5 or SHA1
```

### Don'ts

```javascript
// ❌ Don't use weak algorithms
crypto.createHash('md5');    // Weak
crypto.createHash('sha1');   // Weak for signatures

// ❌ Don't use ECB mode
crypto.createCipheriv('aes-256-ecb', key);  // No IV, patterns visible

// ❌ Don't use hardcoded keys/IVs
const key = Buffer.from('mysecretkey12345');  // Bad!

// ❌ Don't use Math.random() for crypto
Math.random().toString(36);  // Not secure!

// ❌ Don't compare secrets with ===
if (token === expectedToken) { }  // Timing attack vulnerable!
```

---

## 11.13 Summary

| Random | Description |
|--------|-------------|
| `randomBytes(n)` | Cryptographically secure random bytes |
| `randomInt(min, max)` | Secure random integer |
| `randomUUID()` | Generate UUID v4 |

| Hashing | Description |
|---------|-------------|
| `createHash(alg)` | Create hash (sha256, sha512) |
| `createHmac(alg, key)` | Create keyed hash |

| Encryption | Description |
|------------|-------------|
| `createCipheriv()` | Symmetric encryption |
| `createDecipheriv()` | Symmetric decryption |
| `publicEncrypt()` | RSA encryption |
| `privateDecrypt()` | RSA decryption |

| Key Derivation | Description |
|----------------|-------------|
| `scrypt()` | Password-based (recommended) |
| `pbkdf2()` | Password-based (legacy) |

| Signatures | Description |
|------------|-------------|
| `createSign()` | Create signature |
| `createVerify()` | Verify signature |
| `sign()` / `verify()` | One-shot signing |

| Utilities | Description |
|-----------|-------------|
| `timingSafeEqual()` | Constant-time comparison |
| `getHashes()` | List available hash algorithms |
| `getCiphers()` | List available ciphers |

---

**End of Module 11: Crypto**

Next: **Module 12 — Child Process** (Spawning and managing child processes)
# Module 12: Child Process

The `child_process` module allows you to spawn child processes, execute shell commands, and communicate with other programs. Essential for running system commands, parallel processing, and integrating with external tools.

---

## 12.1 Module Import

```javascript
// CommonJS
const { spawn, exec, execFile, fork } = require('child_process');

// ES Modules
import { spawn, exec, execFile, fork } from 'child_process';

// Promisified versions
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);
const execFileAsync = promisify(require('child_process').execFile);
```

---

## 12.2 spawn() — Stream-Based Execution

Best for long-running processes or large output.

### Basic Usage

```javascript
const { spawn } = require('child_process');

const ls = spawn('ls', ['-la', '/home']);

ls.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', data => {
  console.error(`stderr: ${data}`);
});

ls.on('close', code => {
  console.log(`Process exited with code ${code}`);
});

ls.on('error', err => {
  console.error('Failed to start:', err.message);
});
```

### With Options

```javascript
const child = spawn('node', ['script.js'], {
  cwd: '/path/to/directory',      // Working directory
  env: { ...process.env, NODE_ENV: 'production' },  // Environment
  shell: true,                     // Use shell
  detached: true,                  // Detach from parent
  stdio: 'inherit'                 // Inherit stdio from parent
});

// Detach child completely
child.unref();
```

### stdio Options

```javascript
// 'pipe' - create pipe (default)
// 'inherit' - inherit from parent
// 'ignore' - don't create fd
// stream - use existing stream

const child = spawn('grep', ['pattern'], {
  stdio: ['pipe', 'pipe', 'inherit']  // [stdin, stdout, stderr]
});

// Write to child stdin
child.stdin.write('data to search\n');
child.stdin.end();

// Inherit all (good for interactive commands)
spawn('vim', ['file.txt'], { stdio: 'inherit' });
```

### Pipeline with Streams

```javascript
const fs = require('fs');

// cat file | grep pattern | wc -l
const cat = spawn('cat', ['large-file.txt']);
const grep = spawn('grep', ['error']);
const wc = spawn('wc', ['-l']);

cat.stdout.pipe(grep.stdin);
grep.stdout.pipe(wc.stdin);

wc.stdout.on('data', data => {
  console.log(`Count: ${data.toString().trim()}`);
});
```

---

## 12.3 exec() — Buffer-Based Execution

Best for short commands with small output.

### Basic Usage

```javascript
const { exec } = require('child_process');

exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
```

### With Options

```javascript
exec('npm install', {
  cwd: '/project/path',
  env: { ...process.env, NODE_ENV: 'development' },
  timeout: 60000,          // Kill after 60s
  maxBuffer: 1024 * 1024,  // 1MB stdout/stderr buffer
  encoding: 'utf8',
  shell: '/bin/bash'       // Specific shell
}, (error, stdout, stderr) => {
  // Handle result
});
```

### Promise Version

```javascript
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return stdout.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

const files = await runCommand('ls -la');
const nodeVersion = await runCommand('node --version');
```

### Using exec with util/promisify (Node.js 16+)

```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const { stdout } = await execPromise('echo "Hello"');
console.log(stdout);  // 'Hello\n'
```

---

## 12.4 execFile() — Execute File Directly

More secure than exec() - no shell involved.

```javascript
const { execFile } = require('child_process');

execFile('node', ['--version'], (error, stdout, stderr) => {
  console.log(stdout);  // 'v20.0.0\n'
});

// With options
execFile('/path/to/script.sh', ['arg1', 'arg2'], {
  cwd: '/working/dir',
  timeout: 5000
}, (error, stdout, stderr) => {
  // Handle result
});

// Promise version
const { promisify } = require('util');
const execFileAsync = promisify(require('child_process').execFile);

const { stdout } = await execFileAsync('git', ['status']);
```

---

## 12.5 fork() — Node.js Child Processes

Creates a new Node.js process with IPC channel.

### Basic Usage

```javascript
// parent.js
const { fork } = require('child_process');

const child = fork('./child.js');

// Send message to child
child.send({ type: 'task', data: [1, 2, 3, 4, 5] });

// Receive message from child
child.on('message', message => {
  console.log('Result from child:', message);
});

child.on('exit', code => {
  console.log(`Child exited with code ${code}`);
});
```

```javascript
// child.js
process.on('message', message => {
  if (message.type === 'task') {
    const result = message.data.reduce((a, b) => a + b, 0);
    process.send({ type: 'result', data: result });
  }
});
```

### Fork Options

```javascript
const child = fork('./worker.js', ['arg1', 'arg2'], {
  cwd: __dirname,
  env: { ...process.env, WORKER_ID: '1' },
  execArgv: ['--inspect'],  // Node.js flags
  silent: true              // Separate stdout/stderr
});

if (child.stdout) {
  child.stdout.on('data', data => console.log(data.toString()));
}
```

---

## 12.6 execSync, spawnSync, execFileSync

Synchronous versions (block event loop).

```javascript
const { execSync, spawnSync, execFileSync } = require('child_process');

// execSync
try {
  const output = execSync('ls -la', { encoding: 'utf8' });
  console.log(output);
} catch (error) {
  console.error('Command failed:', error.message);
}

// spawnSync
const result = spawnSync('ls', ['-la'], { encoding: 'utf8' });
console.log(result.stdout);
console.log(result.status);  // Exit code

// execFileSync
const version = execFileSync('node', ['--version'], { encoding: 'utf8' });
console.log(version.trim());
```

---

## 12.7 Handling Process Events

### Exit and Close

```javascript
const child = spawn('long-running-command');

// 'exit' fires when process exits
child.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`Exited with code: ${code}`);
  } else {
    console.log(`Killed by signal: ${signal}`);
  }
});

// 'close' fires when stdio streams close
child.on('close', (code, signal) => {
  console.log('All stdio closed');
});

// 'error' fires on spawn failure
child.on('error', err => {
  console.error('Spawn error:', err.message);
});
```

### Killing Child Processes

```javascript
const child = spawn('sleep', ['100']);

// Send SIGTERM
child.kill();
// or
child.kill('SIGTERM');

// Force kill
child.kill('SIGKILL');

// Check if killed
console.log(child.killed);  // true

// Check if running
console.log(child.exitCode);  // null if still running
```

---

## 12.8 Cross-Platform Commands

```javascript
const isWindows = process.platform === 'win32';

// Cross-platform spawn
function crossSpawn(command, args, options = {}) {
  if (isWindows) {
    return spawn('cmd', ['/c', command, ...args], options);
  }
  return spawn(command, args, options);
}

// Or use shell option
spawn('npm', ['install'], {
  shell: true,  // Works cross-platform
  stdio: 'inherit'
});
```

---

## 12.9 Common Patterns

### Run Command and Get Output

```javascript
async function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

const version = await run('node --version');
const gitBranch = await run('git branch --show-current');
```

### Run with Timeout

```javascript
function runWithTimeout(command, timeout) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          reject(new Error(`Command timed out after ${timeout}ms`));
        } else {
          reject(error);
        }
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

try {
  const result = await runWithTimeout('sleep 10', 5000);
} catch (err) {
  console.error(err.message);  // 'Command timed out after 5000ms'
}
```

### Worker Pool

```javascript
class WorkerPool {
  constructor(workerScript, numWorkers) {
    this.workers = [];
    this.queue = [];
    this.workerScript = workerScript;
    
    for (let i = 0; i < numWorkers; i++) {
      this.createWorker();
    }
  }
  
  createWorker() {
    const worker = fork(this.workerScript);
    worker.busy = false;
    
    worker.on('message', result => {
      worker.busy = false;
      worker.currentResolve(result);
      this.processQueue();
    });
    
    worker.on('exit', () => {
      const index = this.workers.indexOf(worker);
      if (index > -1) {
        this.workers.splice(index, 1);
        this.createWorker();  // Replace dead worker
      }
    });
    
    this.workers.push(worker);
  }
  
  processQueue() {
    const freeWorker = this.workers.find(w => !w.busy);
    if (freeWorker && this.queue.length > 0) {
      const { task, resolve } = this.queue.shift();
      freeWorker.busy = true;
      freeWorker.currentResolve = resolve;
      freeWorker.send(task);
    }
  }
  
  run(task) {
    return new Promise(resolve => {
      this.queue.push({ task, resolve });
      this.processQueue();
    });
  }
  
  terminate() {
    this.workers.forEach(w => w.kill());
  }
}

// Usage
const pool = new WorkerPool('./worker.js', 4);
const results = await Promise.all([
  pool.run({ type: 'compute', data: 1 }),
  pool.run({ type: 'compute', data: 2 }),
  pool.run({ type: 'compute', data: 3 })
]);
pool.terminate();
```

### Interactive CLI

```javascript
const child = spawn('node', [], { stdio: ['pipe', 'pipe', 'inherit'] });

// Send input
child.stdin.write('console.log("Hello");\n');
child.stdin.write('process.exit(0);\n');

// Read output
child.stdout.on('data', data => {
  console.log('Output:', data.toString());
});
```

### Run Shell Script

```javascript
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [scriptPath, ...args], {
      stdio: 'inherit'
    });
    
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

await runScript('./deploy.sh', ['production']);
```

---

## 12.10 Security Considerations

### Command Injection

```javascript
// ❌ Vulnerable to injection
const userInput = 'file.txt; rm -rf /';
exec(`cat ${userInput}`, callback);
// Executes: cat file.txt; rm -rf /

// ✅ Use spawn with arguments array
const userInput = 'file.txt';
spawn('cat', [userInput]);  // Arguments are escaped

// ✅ Or use execFile
execFile('cat', [userInput], callback);

// ✅ If you must use exec, validate input
function safeFilename(input) {
  return /^[a-zA-Z0-9._-]+$/.test(input);
}

if (safeFilename(userInput)) {
  exec(`cat ${userInput}`, callback);
}
```

### Environment Variables

```javascript
// ❌ Exposing sensitive env vars
spawn('malicious-script', [], {
  env: process.env  // Includes all env vars including secrets
});

// ✅ Only pass needed vars
spawn('script', [], {
  env: {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    // Explicitly list what's needed
  }
});
```

---

## 12.11 Summary

| Method | Use Case | Output | Shell |
|--------|----------|--------|-------|
| `spawn()` | Long-running, streaming | Streams | Optional |
| `exec()` | Short commands | Buffer | Yes |
| `execFile()` | Execute file directly | Buffer | No |
| `fork()` | Node.js child process | IPC | N/A |

| Event | Description |
|-------|-------------|
| `exit` | Process exited |
| `close` | All stdio streams closed |
| `error` | Spawn failed |
| `message` | IPC message (fork only) |

| Options | Description |
|---------|-------------|
| `cwd` | Working directory |
| `env` | Environment variables |
| `shell` | Use shell |
| `stdio` | Configure stdio streams |
| `timeout` | Kill after milliseconds |
| `detached` | Run independently |

---

**End of Module 12: Child Process**

Next: **Module 13 — Cluster** (Multi-process scaling)
# Module 13: Cluster

The `cluster` module enables you to create child processes that share server ports. This allows Node.js applications to take advantage of multi-core systems for improved performance and reliability.

---

## 13.1 Module Import

```javascript
// CommonJS
const cluster = require('cluster');

// ES Modules
import cluster from 'cluster';
import { isPrimary, fork, workers } from 'cluster';
```

---

## 13.2 Cluster Basics

### Primary and Worker

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  // Primary process: fork workers
  const numCPUs = os.cpus().length;
  
  console.log(`Primary ${process.pid} is running`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
  
} else {
  // Worker process: run server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  }).listen(8000);
  
  console.log(`Worker ${process.pid} started`);
}
```

### isMaster vs isPrimary

```javascript
// Node.js 16+: Use isPrimary (isMaster is deprecated)
if (cluster.isPrimary) {
  // Main process
}

// For backward compatibility
const isPrimary = cluster.isPrimary ?? cluster.isMaster;
```

---

## 13.3 Worker Properties

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork();
  
  // Worker properties
  console.log(worker.id);            // Worker ID (1, 2, 3, ...)
  console.log(worker.process.pid);   // Process ID
  console.log(worker.isConnected()); // IPC connection status
  console.log(worker.isDead());      // Process ended?
  
  // All workers
  console.log(cluster.workers);      // { '1': Worker, '2': Worker, ... }
  
  // Get worker by ID
  const worker1 = cluster.workers[1];
}

// In worker
if (cluster.isWorker) {
  console.log(cluster.worker.id);    // This worker's ID
  console.log(process.pid);          // This process's PID
}
```

---

## 13.4 Worker Communication

### Primary to Worker

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork();
  
  // Send message to worker
  worker.send({ type: 'config', data: { port: 3000 } });
  
  // Receive from worker
  worker.on('message', message => {
    console.log('From worker:', message);
  });
}

if (cluster.isWorker) {
  // Receive from primary
  process.on('message', message => {
    console.log('From primary:', message);
    
    // Send response
    process.send({ type: 'ready', pid: process.pid });
  });
}
```

### Broadcast to All Workers

```javascript
function broadcast(message) {
  for (const id in cluster.workers) {
    cluster.workers[id].send(message);
  }
}

// Usage
broadcast({ type: 'shutdown' });
```

### Worker to Worker (via Primary)

```javascript
// Primary acts as message broker
if (cluster.isPrimary) {
  cluster.on('message', (worker, message) => {
    if (message.type === 'broadcast') {
      // Send to all other workers
      for (const id in cluster.workers) {
        if (Number(id) !== worker.id) {
          cluster.workers[id].send(message.data);
        }
      }
    }
  });
}

// Worker sends broadcast request
process.send({ type: 'broadcast', data: { event: 'update' } });
```

---

## 13.5 Graceful Shutdown

### Disconnect Workers

```javascript
if (cluster.isPrimary) {
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Primary received SIGTERM');
    
    for (const id in cluster.workers) {
      cluster.workers[id].disconnect();
    }
  });
  
  cluster.on('disconnect', worker => {
    console.log(`Worker ${worker.id} disconnected`);
  });
  
  cluster.on('exit', worker => {
    console.log(`Worker ${worker.id} exited`);
  });
}

if (cluster.isWorker) {
  const server = http.createServer(handler).listen(8000);
  
  cluster.worker.on('disconnect', () => {
    console.log('Worker disconnecting...');
    
    // Stop accepting new connections
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force exit after timeout
    setTimeout(() => {
      console.log('Force exit');
      process.exit(1);
    }, 5000);
  });
}
```

### Kill Workers

```javascript
// Immediate kill
worker.kill('SIGTERM');

// Or
worker.process.kill('SIGKILL');
```

---

## 13.6 Auto-Restart Workers

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Restart dead workers
  cluster.on('exit', (worker, code, signal) => {
    if (!worker.exitedAfterDisconnect) {
      console.log(`Worker ${worker.id} died unexpectedly. Restarting...`);
      cluster.fork();
    }
  });
}
```

---

## 13.7 Zero-Downtime Restart

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Handle restart signal
  process.on('SIGUSR2', () => {
    console.log('Received SIGUSR2. Restarting workers...');
    restartWorkers();
  });
  
  function restartWorkers() {
    const workers = Object.values(cluster.workers);
    
    const restartWorker = (index) => {
      if (index >= workers.length) return;
      
      const worker = workers[index];
      console.log(`Restarting worker ${worker.id}`);
      
      // Fork new worker first
      const newWorker = cluster.fork();
      
      newWorker.on('listening', () => {
        // New worker is ready, kill old one
        worker.disconnect();
        
        worker.on('exit', () => {
          if (!worker.exitedAfterDisconnect) return;
          restartWorker(index + 1);
        });
      });
    };
    
    restartWorker(0);
  }
}
```

---

## 13.8 Scheduling Policy

```javascript
// Round-robin (default on non-Windows)
cluster.schedulingPolicy = cluster.SCHED_RR;

// OS-based (default on Windows)
cluster.schedulingPolicy = cluster.SCHED_NONE;

// Or via environment variable
// NODE_CLUSTER_SCHED_POLICY=rr
// NODE_CLUSTER_SCHED_POLICY=none
```

---

## 13.9 Cluster Events

### Primary Events

```javascript
if (cluster.isPrimary) {
  // Worker forked
  cluster.on('fork', worker => {
    console.log(`Worker ${worker.id} forked`);
  });
  
  // Worker is online (IPC ready)
  cluster.on('online', worker => {
    console.log(`Worker ${worker.id} is online`);
  });
  
  // Worker is listening
  cluster.on('listening', (worker, address) => {
    console.log(`Worker ${worker.id} listening on ${address.port}`);
  });
  
  // Worker disconnected
  cluster.on('disconnect', worker => {
    console.log(`Worker ${worker.id} disconnected`);
  });
  
  // Worker exited
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} exited with code ${code}`);
  });
  
  // Message from any worker
  cluster.on('message', (worker, message) => {
    console.log(`Message from ${worker.id}:`, message);
  });
}
```

### Worker Events

```javascript
if (cluster.isWorker) {
  cluster.worker.on('disconnect', () => {
    console.log('Disconnected from primary');
  });
  
  cluster.worker.on('error', err => {
    console.error('Worker error:', err);
  });
  
  process.on('message', message => {
    console.log('Received:', message);
  });
}
```

---

## 13.10 Cluster Settings

```javascript
// Configure before forking
cluster.setupPrimary({
  exec: 'worker.js',           // Worker file
  args: ['--worker'],          // Arguments
  silent: false,               // Output to primary
  stdio: 'inherit'             // stdio config
});

// Get settings
console.log(cluster.settings);
// { exec: 'worker.js', args: [...], ... }
```

---

## 13.11 Sticky Sessions

For WebSocket or session-based applications:

```javascript
const cluster = require('cluster');
const http = require('http');
const net = require('net');
const os = require('os');

if (cluster.isPrimary) {
  const workers = [];
  const numCPUs = os.cpus().length;
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    workers.push(cluster.fork());
  }
  
  // Create TCP server
  const server = net.createServer({ pauseOnConnect: true }, connection => {
    // Get client IP for sticky sessions
    const ip = connection.remoteAddress;
    const hash = hashIP(ip);
    const worker = workers[hash % workers.length];
    
    // Pass connection to worker
    worker.send('sticky-session:connection', connection);
  });
  
  server.listen(8000);
  
  function hashIP(ip) {
    let hash = 0;
    for (const char of ip) {
      hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return Math.abs(hash);
  }
  
} else {
  const server = http.createServer((req, res) => {
    res.end(`Worker ${cluster.worker.id}`);
  });
  
  // Don't listen directly, receive connections from primary
  process.on('message', (message, connection) => {
    if (message === 'sticky-session:connection') {
      server.emit('connection', connection);
      connection.resume();
    }
  });
}
```

---

## 13.12 Load Balancing Example

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const workers = new Map();
  
  console.log(`Primary ${process.pid} starting ${numCPUs} workers`);
  
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.set(worker.id, { requests: 0 });
  }
  
  // Track requests per worker
  cluster.on('message', (worker, message) => {
    if (message.type === 'request') {
      const stats = workers.get(worker.id);
      stats.requests++;
    }
  });
  
  // Report stats every 10 seconds
  setInterval(() => {
    console.log('\nWorker Stats:');
    for (const [id, stats] of workers) {
      console.log(`  Worker ${id}: ${stats.requests} requests`);
    }
  }, 10000);
  
  // Handle worker death
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died`);
    workers.delete(worker.id);
    
    // Restart
    const newWorker = cluster.fork();
    workers.set(newWorker.id, { requests: 0 });
  });
  
} else {
  http.createServer((req, res) => {
    // Notify primary of request
    process.send({ type: 'request' });
    
    // Simulate work
    let sum = 0;
    for (let i = 0; i < 1e6; i++) sum += i;
    
    res.writeHead(200);
    res.end(`Worker ${cluster.worker.id}: ${sum}\n`);
  }).listen(8000);
  
  console.log(`Worker ${cluster.worker.id} started`);
}
```

---

## 13.13 Cluster vs Worker Threads

| Feature | Cluster | Worker Threads |
|---------|---------|----------------|
| Process | Separate processes | Same process |
| Memory | Isolated | Can share (SharedArrayBuffer) |
| Use Case | HTTP servers, scaling | CPU-intensive tasks |
| Port Sharing | Yes | No |
| Overhead | Higher | Lower |
| Crash Isolation | Full | Partial |

```javascript
// Use cluster for HTTP servers
if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  http.createServer(handler).listen(8000);
}

// Use worker threads for CPU tasks
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-computation.js');
```

---

## 13.14 Summary

| Property/Method | Description |
|-----------------|-------------|
| `isPrimary` | Is this the primary process? |
| `isWorker` | Is this a worker process? |
| `fork()` | Create new worker |
| `workers` | Object of all workers |
| `worker` | Current worker (in worker) |

| Primary Events | Description |
|----------------|-------------|
| `fork` | Worker forked |
| `online` | Worker IPC ready |
| `listening` | Worker listening |
| `disconnect` | Worker disconnected |
| `exit` | Worker exited |
| `message` | Message from worker |

| Worker Methods | Description |
|----------------|-------------|
| `send(msg)` | Send to worker |
| `disconnect()` | Graceful disconnect |
| `kill()` | Kill worker |
| `isConnected()` | IPC connected? |
| `isDead()` | Process ended? |

---

**End of Module 13: Cluster**

Next: **Module 14 — Process** (Process information and control)
# Module 14: Process

The global `process` object provides information about the current Node.js process and methods to control it. No import is required—it's available everywhere.

---

## 14.1 Process Information

### Basic Info

```javascript
// Process ID
console.log(process.pid);
// 12345

// Parent process ID
console.log(process.ppid);
// 12340

// Node.js version
console.log(process.version);
// 'v20.0.0'

// V8, libuv, OpenSSL versions
console.log(process.versions);
// { node: '20.0.0', v8: '11.3...', uv: '1.44...', ... }

// Platform
console.log(process.platform);
// 'linux', 'darwin', 'win32'

// Architecture
console.log(process.arch);
// 'x64', 'arm64'

// Executable path
console.log(process.execPath);
// '/usr/local/bin/node'

// Current working directory
console.log(process.cwd());
// '/home/user/project'

// Title (shows in ps)
console.log(process.title);
process.title = 'my-app';
```

---

## 14.2 Command Line Arguments

### process.argv

```javascript
// node script.js --port 3000 --env production

console.log(process.argv);
// [
//   '/usr/local/bin/node',
//   '/path/to/script.js',
//   '--port',
//   '3000',
//   '--env',
//   'production'
// ]

// Skip node and script path
const args = process.argv.slice(2);
// ['--port', '3000', '--env', 'production']
```

### Simple Argument Parser

```javascript
function parseArgs(args) {
  const result = { _: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      
      if (next && !next.startsWith('-')) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    } else if (arg.startsWith('-')) {
      result[arg.slice(1)] = true;
    } else {
      result._.push(arg);
    }
  }
  
  return result;
}

const options = parseArgs(process.argv.slice(2));
// { _: [], port: '3000', env: 'production' }
```

### process.execArgv

```javascript
// node --inspect --max-old-space-size=4096 script.js --port 3000

console.log(process.execArgv);
// ['--inspect', '--max-old-space-size=4096']

// These are Node.js flags, not passed to script
```

---

## 14.3 Environment Variables

### Reading Environment

```javascript
// All environment variables
console.log(process.env);
// { PATH: '...', HOME: '...', NODE_ENV: 'development', ... }

// Specific variable
console.log(process.env.NODE_ENV);
// 'development'

// With default
const port = process.env.PORT || 3000;
const debug = process.env.DEBUG === 'true';
```

### Setting Environment

```javascript
// Set (affects current process only)
process.env.MY_VAR = 'value';

// Delete
delete process.env.MY_VAR;

// Note: values are always strings
process.env.PORT = 3000;
console.log(typeof process.env.PORT);  // 'string'
console.log(process.env.PORT);         // '3000'
```

---

## 14.4 Standard I/O

### stdin, stdout, stderr

```javascript
// stdout (writable stream)
process.stdout.write('Hello\n');

// stderr (writable stream)
process.stderr.write('Error message\n');

// console uses these
console.log('...');   // stdout
console.error('...');  // stderr

// stdin (readable stream)
process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
  console.log('Received:', data.trim());
});

// Read all stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  console.log('Input:', input);
});
```

### TTY Detection

```javascript
// Is stdin a terminal?
console.log(process.stdin.isTTY);   // true or undefined

// Is stdout a terminal?
console.log(process.stdout.isTTY);  // true or undefined

// Terminal size
if (process.stdout.isTTY) {
  console.log(process.stdout.columns);  // Width
  console.log(process.stdout.rows);     // Height
}

// Detect piped input
if (!process.stdin.isTTY) {
  // Reading from pipe or file
}
```

---

## 14.5 Process Exit

### exit()

```javascript
// Exit with success
process.exit(0);

// Exit with error
process.exit(1);

// Exit codes convention:
// 0 - Success
// 1 - General error
// 2 - Misuse of command
// 126 - Command not executable
// 127 - Command not found
// 128+n - Fatal error signal n
```

### exitCode

```javascript
// Set exit code without immediate exit
process.exitCode = 1;

// Will exit with this code when event loop empties
```

### 'exit' Event

```javascript
process.on('exit', code => {
  console.log(`Exiting with code ${code}`);
  
  // Only synchronous code works here!
  // Async operations won't complete
});
```

### 'beforeExit' Event

```javascript
// Fires when event loop is empty but before exit
// Async operations ARE possible here

process.on('beforeExit', code => {
  console.log('Before exit');
  
  // Can schedule more work
  setTimeout(() => {
    console.log('Scheduled work');
  }, 100);
});

// Note: Does NOT fire on explicit exit() or uncaught exception
```

---

## 14.6 Signals

### Handling Signals

```javascript
// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT');
  process.exit(0);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('Received SIGTERM');
  // Cleanup...
  process.exit(0);
});

// Handle SIGHUP (terminal closed)
process.on('SIGHUP', () => {
  console.log('Terminal closed');
});
```

### Graceful Shutdown

```javascript
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  try {
    // Close server
    await new Promise(resolve => server.close(resolve));
    
    // Close database connections
    await db.close();
    
    // Cleanup
    await cleanup();
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### Sending Signals

```javascript
// Send signal to process
process.kill(pid, 'SIGTERM');

// Kill current process
process.kill(process.pid, 'SIGKILL');

// Note: kill() doesn't always kill - it sends a signal
process.kill(pid, 0);  // Check if process exists (no signal sent)
```

---

## 14.7 Error Handling

### Uncaught Exceptions

```javascript
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err);
  console.error('Origin:', origin);
  
  // Log, notify, then exit
  process.exit(1);
});

// Example trigger
setTimeout(() => {
  throw new Error('Uncaught!');
}, 100);
```

### Unhandled Promise Rejections

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Example trigger
Promise.reject(new Error('Unhandled!'));

// Make unhandled rejections throw
process.on('unhandledRejection', err => {
  throw err;  // Will trigger uncaughtException
});
```

### Warning Event

```javascript
process.on('warning', warning => {
  console.warn('Warning:', warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// Emit warning
process.emitWarning('Something deprecated', 'DeprecationWarning');

// Emit with code
process.emitWarning('Resource leak', {
  code: 'MY_WARNING',
  detail: 'Additional info'
});
```

---

## 14.8 Memory Usage

```javascript
// Memory usage in bytes
const usage = process.memoryUsage();

console.log(usage);
// {
//   rss: 50331648,        // Resident Set Size (total allocated)
//   heapTotal: 12345678,  // V8 heap total
//   heapUsed: 8765432,    // V8 heap used
//   external: 123456,     // C++ objects bound to JS
//   arrayBuffers: 654321  // ArrayBuffers and SharedArrayBuffers
// }

// Human-readable
function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

console.log('Heap used:', formatBytes(usage.heapUsed));
```

### Memory Monitoring

```javascript
function monitorMemory(interval = 5000) {
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log({
      rss: formatBytes(usage.rss),
      heapUsed: formatBytes(usage.heapUsed),
      heapTotal: formatBytes(usage.heapTotal)
    });
  }, interval);
}
```

---

## 14.9 CPU Usage

```javascript
// CPU usage since process start
const startUsage = process.cpuUsage();

// Do some work
for (let i = 0; i < 1e8; i++) {}

// Get difference
const diff = process.cpuUsage(startUsage);

console.log(diff);
// { user: 123456, system: 12345 }  // microseconds

console.log(`User: ${diff.user / 1000}ms`);
console.log(`System: ${diff.system / 1000}ms`);
```

---

## 14.10 Uptime and Time

```javascript
// Process uptime in seconds
console.log(process.uptime());
// 123.456

// High-resolution time
const start = process.hrtime.bigint();
// ... work ...
const end = process.hrtime.bigint();
console.log(`Took ${end - start} nanoseconds`);

// Or with hrtime()
const [seconds, nanoseconds] = process.hrtime();
const [diffS, diffNs] = process.hrtime([seconds, nanoseconds]);
```

---

## 14.11 Working Directory

```javascript
// Get current directory
console.log(process.cwd());
// '/home/user/project'

// Change directory
process.chdir('/tmp');
console.log(process.cwd());
// '/tmp'

// Note: Affects file operations
const fs = require('fs');
fs.readFileSync('file.txt');  // Reads /tmp/file.txt
```

---

## 14.12 User Info

```javascript
// User and group IDs (Unix only)
console.log(process.getuid());  // User ID
console.log(process.getgid());  // Group ID
console.log(process.geteuid()); // Effective user ID
console.log(process.getegid()); // Effective group ID

// Get/set groups
console.log(process.getgroups());

// Set user (requires root)
process.setuid(1000);
process.setgid(1000);

// umask
const oldMask = process.umask(0o022);
console.log(`Old mask: ${oldMask.toString(8)}`);
```

---

## 14.13 Resource Limits

```javascript
// Get resource usage (Unix only)
const usage = process.resourceUsage();

console.log(usage);
// {
//   userCPUTime: 12345,
//   systemCPUTime: 1234,
//   maxRSS: 50000,
//   ...
// }
```

---

## 14.14 Next Tick

```javascript
// Execute after current operation, before I/O
process.nextTick(() => {
  console.log('Next tick');
});

// Higher priority than setImmediate
setImmediate(() => console.log('Immediate'));
process.nextTick(() => console.log('Next tick'));

// Output:
// Next tick
// Immediate

// Passing arguments
process.nextTick((a, b) => {
  console.log(a, b);
}, 'arg1', 'arg2');
```

### nextTick vs setImmediate

```javascript
// nextTick: Before I/O callbacks
// setImmediate: After I/O callbacks

fs.readFile('file.txt', () => {
  process.nextTick(() => console.log('nextTick in I/O'));
  setImmediate(() => console.log('setImmediate in I/O'));
});

// Output:
// nextTick in I/O
// setImmediate in I/O
```

---

## 14.15 Common Patterns

### Config from Environment

```javascript
const config = {
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  debug: process.env.DEBUG === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DATABASE_URL || 'localhost/db'
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const apiKey = requireEnv('API_KEY');
```

### Health Check

```javascript
function getHealthStatus() {
  const mem = process.memoryUsage();
  
  return {
    status: 'ok',
    uptime: process.uptime(),
    memory: {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss
    },
    pid: process.pid,
    version: process.version
  };
}
```

### Crash Handler

```javascript
function setupCrashHandlers() {
  process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
    // Log to external service
    logToService(err).finally(() => {
      process.exit(1);
    });
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Log and continue, or exit
  });
}
```

---

## 14.16 Summary

| Property | Description |
|----------|-------------|
| `pid` | Process ID |
| `ppid` | Parent process ID |
| `platform` | OS platform |
| `arch` | CPU architecture |
| `version` | Node.js version |
| `argv` | Command line arguments |
| `execArgv` | Node.js flags |
| `env` | Environment variables |
| `cwd()` | Current directory |

| Method | Description |
|--------|-------------|
| `exit(code)` | Exit immediately |
| `chdir(dir)` | Change directory |
| `kill(pid, signal)` | Send signal |
| `nextTick(fn)` | Schedule micro task |
| `memoryUsage()` | Get memory stats |
| `cpuUsage()` | Get CPU usage |
| `uptime()` | Process uptime |

| Event | Description |
|-------|-------------|
| `exit` | Before exit (sync only) |
| `beforeExit` | Event loop empty |
| `uncaughtException` | Uncaught error |
| `unhandledRejection` | Unhandled promise |
| `warning` | Process warning |
| `SIGINT`, `SIGTERM` | OS signals |

---

**End of Module 14: Process**

Next: **Module 15 — Timers** (setTimeout, setInterval, setImmediate)
# Module 15: Timers

Node.js provides timer functions similar to browsers but with some Node-specific additions. Timers schedule callbacks to execute at a later time.

---

## 15.1 setTimeout

Execute code after a delay.

### Basic Usage

```javascript
// Execute after 1 second
setTimeout(() => {
  console.log('Delayed message');
}, 1000);

// With arguments
setTimeout((name, greeting) => {
  console.log(`${greeting}, ${name}!`);
}, 1000, 'Alice', 'Hello');
// Output after 1s: Hello, Alice!
```

### Clearing Timeout

```javascript
const timeoutId = setTimeout(() => {
  console.log('This will not run');
}, 5000);

// Cancel before it fires
clearTimeout(timeoutId);
```

### Timeout Reference

```javascript
const timeout = setTimeout(() => {}, 5000);

// Prevent timeout from keeping process alive
timeout.unref();

// Re-enable
timeout.ref();

// Check if active
timeout.hasRef();  // true or false

// Refresh timer (reset countdown)
timeout.refresh();
```

---

## 15.2 setInterval

Execute code repeatedly.

### Basic Usage

```javascript
let count = 0;

const intervalId = setInterval(() => {
  count++;
  console.log(`Tick ${count}`);
  
  if (count >= 5) {
    clearInterval(intervalId);
    console.log('Done');
  }
}, 1000);
```

### Interval with Arguments

```javascript
setInterval((prefix) => {
  console.log(`${prefix} ${Date.now()}`);
}, 1000, 'Time:');
```

### Interval Reference

```javascript
const interval = setInterval(() => {
  console.log('tick');
}, 1000);

// Prevent keeping process alive
interval.unref();

// Re-enable
interval.ref();
```

---

## 15.3 setImmediate

Execute code after current event loop phase completes.

```javascript
setImmediate(() => {
  console.log('Immediate');
});

console.log('Sync');

// Output:
// Sync
// Immediate
```

### setImmediate vs setTimeout(0)

```javascript
// Both execute "as soon as possible" but differently

setImmediate(() => console.log('Immediate'));
setTimeout(() => console.log('Timeout'), 0);

// Order is non-deterministic in main module!
// But inside I/O callback, setImmediate always first:

const fs = require('fs');

fs.readFile('file.txt', () => {
  setImmediate(() => console.log('Immediate'));
  setTimeout(() => console.log('Timeout'), 0);
});

// Output (inside I/O):
// Immediate
// Timeout
```

### Clearing Immediate

```javascript
const immediate = setImmediate(() => {
  console.log('This will not run');
});

clearImmediate(immediate);
```

---

## 15.4 process.nextTick

Execute code at the end of current operation, before I/O.

```javascript
process.nextTick(() => {
  console.log('Next tick');
});

console.log('Sync');

// Output:
// Sync
// Next tick
```

### Priority Order

```javascript
setTimeout(() => console.log('1. timeout'), 0);
setImmediate(() => console.log('2. immediate'));
process.nextTick(() => console.log('3. nextTick'));
Promise.resolve().then(() => console.log('4. promise'));

console.log('5. sync');

// Output:
// 5. sync
// 3. nextTick
// 4. promise
// 1. timeout (or 2, order not guaranteed)
// 2. immediate (or 1)
```

### Inside I/O Callback

```javascript
const fs = require('fs');

fs.readFile('file.txt', () => {
  setTimeout(() => console.log('1. timeout'), 0);
  setImmediate(() => console.log('2. immediate'));
  process.nextTick(() => console.log('3. nextTick'));
  Promise.resolve().then(() => console.log('4. promise'));
  
  console.log('5. sync');
});

// Output:
// 5. sync
// 3. nextTick
// 4. promise
// 2. immediate
// 1. timeout
```

---

## 15.5 Timer Promises

### Promisified Timers

```javascript
const { setTimeout, setInterval, setImmediate } = require('timers/promises');

// Async setTimeout
await setTimeout(1000);
console.log('After 1 second');

// With value
const result = await setTimeout(1000, 'done');
console.log(result);  // 'done'
```

### Abortable Timers

```javascript
const { setTimeout } = require('timers/promises');

const controller = new AbortController();

// Cancel after 500ms
setTimeout(500).then(() => controller.abort());

try {
  await setTimeout(1000, 'value', { signal: controller.signal });
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Timer aborted');
  }
}
```

### Async setInterval

```javascript
const { setInterval } = require('timers/promises');

// Async iterator
let count = 0;
for await (const _ of setInterval(1000)) {
  console.log(`Tick ${++count}`);
  if (count >= 5) break;
}
```

### Async setImmediate

```javascript
const { setImmediate } = require('timers/promises');

await setImmediate();
console.log('After immediate');

const value = await setImmediate('result');
console.log(value);  // 'result'
```

---

## 15.6 Common Patterns

### Delay Function

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function example() {
  console.log('Start');
  await delay(1000);
  console.log('After 1 second');
}
```

### Timeout with Cancellation

```javascript
function cancellableDelay(ms) {
  let timeoutId;
  let reject_;
  
  const promise = new Promise((resolve, reject) => {
    reject_ = reject;
    timeoutId = setTimeout(resolve, ms);
  });
  
  promise.cancel = () => {
    clearTimeout(timeoutId);
    reject_(new Error('Cancelled'));
  };
  
  return promise;
}

const timer = cancellableDelay(5000);
timer.catch(err => console.log(err.message));
timer.cancel();  // 'Cancelled'
```

### Polling

```javascript
async function poll(fn, interval, maxAttempts = Infinity) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    
    if (result.done) {
      return result.value;
    }
    
    await delay(interval);
  }
  
  throw new Error('Max attempts reached');
}

// Usage
const result = await poll(
  async () => {
    const status = await checkStatus();
    return { done: status === 'complete', value: status };
  },
  1000,
  30
);
```

### Debounce

```javascript
function debounce(fn, delay) {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSearch = debounce(query => {
  console.log('Searching:', query);
}, 300);

debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc');
// Only logs: Searching: abc
```

### Throttle

```javascript
function throttle(fn, limit) {
  let inThrottle;
  
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const throttledLog = throttle(() => {
  console.log('Throttled', Date.now());
}, 1000);

// Call many times, only executes once per second
```

### Retry with Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1;
      
      console.log(`Retry ${attempt + 1} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay + jitter));
    }
  }
}

// Usage
const result = await retryWithBackoff(
  () => fetch('https://api.example.com/data'),
  3,
  1000
);
```

### Timeout Wrapper

```javascript
function withTimeout(promise, ms, message = 'Operation timed out') {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });
  
  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}

// Usage
try {
  const result = await withTimeout(
    fetch('https://api.example.com/slow'),
    5000,
    'API request timed out'
  );
} catch (err) {
  console.error(err.message);
}
```

### Scheduler

```javascript
class Scheduler {
  constructor() {
    this.tasks = [];
    this.running = false;
  }
  
  schedule(fn, delay) {
    const task = {
      fn,
      time: Date.now() + delay,
      id: Math.random().toString(36)
    };
    
    this.tasks.push(task);
    this.tasks.sort((a, b) => a.time - b.time);
    
    if (!this.running) {
      this.run();
    }
    
    return task.id;
  }
  
  cancel(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }
  
  async run() {
    this.running = true;
    
    while (this.tasks.length > 0) {
      const task = this.tasks[0];
      const delay = task.time - Date.now();
      
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }
      
      if (this.tasks[0] === task) {
        this.tasks.shift();
        task.fn();
      }
    }
    
    this.running = false;
  }
}

// Usage
const scheduler = new Scheduler();
scheduler.schedule(() => console.log('First'), 2000);
scheduler.schedule(() => console.log('Second'), 1000);
// Output: Second, then First
```

---

## 15.7 Event Loop Phases

Understanding where timers execute:

```
   ┌───────────────────────────┐
┌─>│           timers          │ ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ ← I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ ← Incoming connections, data
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
   
Between each phase: process.nextTick and Promises
```

---

## 15.8 Summary

| Timer | Description | Phase |
|-------|-------------|-------|
| `setTimeout(fn, ms)` | Execute once after delay | timers |
| `setInterval(fn, ms)` | Execute repeatedly | timers |
| `setImmediate(fn)` | Execute after I/O | check |
| `process.nextTick(fn)` | Execute before I/O | microtask |

| Method | Description |
|--------|-------------|
| `clearTimeout(id)` | Cancel setTimeout |
| `clearInterval(id)` | Cancel setInterval |
| `clearImmediate(id)` | Cancel setImmediate |
| `timer.ref()` | Keep process alive |
| `timer.unref()` | Don't keep process alive |
| `timer.refresh()` | Reset timer countdown |

| Promise API | Description |
|-------------|-------------|
| `timers/promises.setTimeout(ms)` | Promise-based setTimeout |
| `timers/promises.setInterval(ms)` | Async iterator interval |
| `timers/promises.setImmediate()` | Promise-based immediate |

---

**End of Module 15: Timers**

Next: **Module 16 — Utilities** (util module helpers)
# Module 16: Utilities

The `util` module provides utility functions for debugging, type checking, formatting, and converting callback-based APIs to promises.

---

## 16.1 Module Import

```javascript
// CommonJS
const util = require('util');

// ES Modules
import util from 'util';
import { promisify, format, inspect } from 'util';
```

---

## 16.2 promisify

Convert callback-based functions to Promise-based.

### Basic Usage

```javascript
const fs = require('fs');
const util = require('util');

// Callback style
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promisified
const readFile = util.promisify(fs.readFile);

const data = await readFile('file.txt', 'utf8');
console.log(data);
```

### Custom Symbol

```javascript
// Make custom function promisify-able
function customAsync(callback) {
  setTimeout(() => callback(null, 'result'), 100);
}

customAsync[util.promisify.custom] = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve('custom result'), 100);
  });
};

const promisified = util.promisify(customAsync);
const result = await promisified();
console.log(result);  // 'custom result'
```

### Common Promisifications

```javascript
const { promisify } = require('util');
const { exec } = require('child_process');
const dns = require('dns');
const crypto = require('crypto');

const execAsync = promisify(exec);
const lookupAsync = promisify(dns.lookup);
const randomBytesAsync = promisify(crypto.randomBytes);

// Usage
const { stdout } = await execAsync('ls -la');
const { address } = await lookupAsync('google.com');
const bytes = await randomBytesAsync(32);
```

---

## 16.3 callbackify

Convert Promise-based functions to callback style.

```javascript
const util = require('util');

async function asyncFunction() {
  return 'result';
}

const callbackFunction = util.callbackify(asyncFunction);

callbackFunction((err, result) => {
  if (err) throw err;
  console.log(result);  // 'result'
});
```

### With Rejection

```javascript
async function failingAsync() {
  throw new Error('Async error');
}

const failing = util.callbackify(failingAsync);

failing((err, result) => {
  console.log(err.message);  // 'Async error'
});
```

---

## 16.4 inspect

Convert objects to string representation for debugging.

### Basic Usage

```javascript
const obj = {
  name: 'Alice',
  nested: {
    deep: {
      value: 42
    }
  },
  arr: [1, 2, 3]
};

console.log(util.inspect(obj));
// { name: 'Alice', nested: { deep: { value: 42 } }, arr: [ 1, 2, 3 ] }
```

### Options

```javascript
util.inspect(obj, {
  depth: 2,              // How deep to recurse (null = infinite)
  colors: true,          // Colorize output
  showHidden: true,      // Show non-enumerable properties
  showProxy: true,       // Show proxy details
  maxArrayLength: 100,   // Max array elements
  maxStringLength: 100,  // Max string length
  breakLength: 80,       // Line wrap width
  compact: false,        // Multi-line formatting
  sorted: true,          // Sort object keys
  getters: true,         // Invoke getters
  numericSeparator: true // 1_000_000 format
});
```

### Shorthand

```javascript
// Second arg can be boolean (showHidden) or number (depth)
util.inspect(obj, false, 4);  // depth=4, no hidden
util.inspect(obj, true, 2);   // depth=2, show hidden
```

### Custom inspect

```javascript
const util = require('util');

class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }
  
  // Custom inspect symbol
  [util.inspect.custom](depth, opts) {
    return `User { name: ${this.name}, password: [HIDDEN] }`;
  }
}

const user = new User('Alice', 'secret123');
console.log(util.inspect(user));
// User { name: Alice, password: [HIDDEN] }
```

### Default inspect options

```javascript
// Change defaults globally
util.inspect.defaultOptions.depth = 4;
util.inspect.defaultOptions.colors = true;
util.inspect.defaultOptions.maxArrayLength = 200;
```

---

## 16.5 format

Printf-style string formatting.

```javascript
// %s - String
util.format('Hello %s', 'World');
// 'Hello World'

// %d - Number
util.format('Count: %d', 42);
// 'Count: 42'

// %i - Integer
util.format('Int: %i', 42.5);
// 'Int: 42'

// %f - Float
util.format('Float: %f', 3.14159);
// 'Float: 3.14159'

// %j - JSON
util.format('Data: %j', { a: 1 });
// 'Data: {"a":1}'

// %o - Object with options
util.format('Obj: %o', { a: 1 });
// 'Obj: { a: 1 }'

// %O - Object without options
util.format('Obj: %O', { a: 1 });
// 'Obj: { a: 1 }'

// %% - Literal percent
util.format('100%% complete');
// '100% complete'

// Multiple args without placeholders
util.format('a', 'b', 'c');
// 'a b c'
```

### formatWithOptions

```javascript
// Format with inspect options
util.formatWithOptions(
  { colors: true, depth: 4 },
  'Object: %o',
  { nested: { deep: { value: 1 } } }
);
```

---

## 16.6 Type Checking

### util.types

```javascript
const { types } = require('util');

// ArrayBuffer
types.isArrayBuffer(new ArrayBuffer(8));  // true

// TypedArray
types.isTypedArray(new Uint8Array());     // true
types.isUint8Array(new Uint8Array());     // true
types.isFloat64Array(new Float64Array()); // true

// DataView
types.isDataView(new DataView(new ArrayBuffer(8)));  // true

// Map/Set
types.isMap(new Map());         // true
types.isSet(new Set());         // true
types.isWeakMap(new WeakMap()); // true
types.isWeakSet(new WeakSet()); // true

// Promise
types.isPromise(Promise.resolve()); // true

// Proxy
types.isProxy(new Proxy({}, {}));   // true

// Date
types.isDate(new Date());           // true

// RegExp
types.isRegExp(/pattern/);          // true

// Generator
function* gen() {}
types.isGeneratorFunction(gen);     // true
types.isGeneratorObject(gen());     // true

// Async
async function async() {}
types.isAsyncFunction(async);       // true

// Error types
types.isNativeError(new Error());   // true
types.isNativeError(new TypeError()); // true

// SharedArrayBuffer
types.isSharedArrayBuffer(new SharedArrayBuffer(8)); // true

// BigInt
types.isBigInt64Array(new BigInt64Array()); // true

// Module namespace
import * as mod from 'fs';
types.isModuleNamespaceObject(mod); // true
```

---

## 16.7 Deprecation

### deprecate

```javascript
const util = require('util');

const oldFunction = util.deprecate(
  function(x) { return x * 2; },
  'oldFunction() is deprecated. Use newFunction() instead.',
  'DEP0001'  // Optional deprecation code
);

oldFunction(5);  // Works but prints warning

// Suppress warnings
process.noDeprecation = true;

// Throw on deprecation (for testing)
process.throwDeprecation = true;

// Trace deprecation
process.traceDeprecation = true;
```

---

## 16.8 Debug Logging

### debuglog

```javascript
const util = require('util');

// Create debug logger
const debug = util.debuglog('myapp');

debug('Starting application');
debug('Processing %d items', 100);

// Only prints if NODE_DEBUG=myapp or NODE_DEBUG=myapp*
// $ NODE_DEBUG=myapp node app.js
// MYAPP 12345: Starting application
// MYAPP 12345: Processing 100 items
```

### Multiple debug sections

```javascript
const dbDebug = util.debuglog('myapp-db');
const httpDebug = util.debuglog('myapp-http');
const cacheDebug = util.debuglog('myapp-cache');

// Enable all: NODE_DEBUG=myapp-*
// Enable specific: NODE_DEBUG=myapp-db,myapp-http
```

---

## 16.9 Text Encoding

### TextEncoder / TextDecoder

```javascript
// These are globals, not from util module
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Encode string to Uint8Array
const encoded = encoder.encode('Hello');
console.log(encoded);  // Uint8Array [72, 101, 108, 108, 111]

// Decode Uint8Array to string
const decoded = decoder.decode(encoded);
console.log(decoded);  // 'Hello'

// With encoding options
const utf16Decoder = new TextDecoder('utf-16le');
const decoded16 = utf16Decoder.decode(buffer);
```

---

## 16.10 Parse Args

```javascript
const { parseArgs } = require('util');

// Define expected options
const options = {
  name: { type: 'string', short: 'n' },
  verbose: { type: 'boolean', short: 'v', default: false },
  count: { type: 'string', multiple: true }
};

// Parse
const { values, positionals } = parseArgs({
  args: ['--name', 'Alice', '-v', '--count', '1', '--count', '2', 'file.txt'],
  options,
  allowPositionals: true
});

console.log(values);
// { name: 'Alice', verbose: true, count: ['1', '2'] }

console.log(positionals);
// ['file.txt']
```

### Strict Mode

```javascript
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: { type: 'boolean', short: 'h' },
    config: { type: 'string', short: 'c' }
  },
  strict: true  // Throw on unknown options
});
```

---

## 16.11 Misc Utilities

### inherits (Legacy)

```javascript
// Deprecated: Use class extends instead
const util = require('util');

function Parent() {
  this.name = 'parent';
}
Parent.prototype.sayHello = function() {
  console.log('Hello from', this.name);
};

function Child() {
  Parent.call(this);
  this.name = 'child';
}
util.inherits(Child, Parent);

// Modern equivalent
class ModernChild extends Parent {
  constructor() {
    super();
    this.name = 'child';
  }
}
```

### getSystemErrorName

```javascript
const util = require('util');

console.log(util.getSystemErrorName(-2));   // 'ENOENT'
console.log(util.getSystemErrorName(-13));  // 'EACCES'
console.log(util.getSystemErrorName(-22));  // 'EINVAL'
```

### getSystemErrorMap

```javascript
const errorMap = util.getSystemErrorMap();
// Map { -2 => ['ENOENT', 'no such file or directory'], ... }

for (const [code, [name, desc]] of errorMap) {
  console.log(`${code}: ${name} - ${desc}`);
}
```

### isDeepStrictEqual

```javascript
const util = require('util');

util.isDeepStrictEqual({ a: 1 }, { a: 1 });     // true
util.isDeepStrictEqual([1, 2], [1, 2]);         // true
util.isDeepStrictEqual(NaN, NaN);               // true
util.isDeepStrictEqual({ a: 1 }, { a: '1' });   // false (type differs)
```

### MIMEType (Node.js 19+)

```javascript
const { MIMEType } = require('util');

const mime = new MIMEType('text/html; charset=utf-8');
console.log(mime.type);       // 'text'
console.log(mime.subtype);    // 'html'
console.log(mime.essence);    // 'text/html'
console.log(mime.params.get('charset'));  // 'utf-8'
```

---

## 16.12 Summary

| Method | Description |
|--------|-------------|
| `promisify(fn)` | Convert callback to Promise |
| `callbackify(fn)` | Convert Promise to callback |
| `inspect(obj)` | Object to string for debugging |
| `format(str, ...)` | Printf-style formatting |
| `formatWithOptions()` | format with inspect options |
| `deprecate(fn, msg)` | Mark function as deprecated |
| `debuglog(section)` | Create debug logger |
| `parseArgs(config)` | Parse command line args |

| util.types | Description |
|------------|-------------|
| `isPromise()` | Check if Promise |
| `isDate()` | Check if Date |
| `isRegExp()` | Check if RegExp |
| `isMap()` / `isSet()` | Check Map/Set |
| `isTypedArray()` | Check TypedArray |
| `isAsyncFunction()` | Check async function |
| `isProxy()` | Check Proxy |
| `isNativeError()` | Check Error instance |

| Inspect Option | Description |
|----------------|-------------|
| `depth` | Recursion depth |
| `colors` | Colorize output |
| `showHidden` | Show non-enumerable |
| `maxArrayLength` | Max array items |
| `breakLength` | Line wrap width |
| `compact` | Multi-line format |

---

**End of Module 16: Utilities**

Next: **Module 17 — Net and DNS** (Low-level networking)
# Module 17: Net and DNS

The `net` module provides low-level TCP/IPC networking, while `dns` handles DNS resolution. These modules are the foundation for higher-level networking in Node.js.

---

## 17.1 Module Import

```javascript
// CommonJS
const net = require('net');
const dns = require('dns');

// ES Modules
import net from 'net';
import dns from 'dns';
import { createServer, createConnection } from 'net';
import { lookup, resolve } from 'dns';
```

---

## 17.2 TCP Server

### Creating a Server

```javascript
const net = require('net');

const server = net.createServer(socket => {
  console.log('Client connected:', socket.remoteAddress);
  
  socket.on('data', data => {
    console.log('Received:', data.toString());
    socket.write('Echo: ' + data);
  });
  
  socket.on('end', () => {
    console.log('Client disconnected');
  });
  
  socket.on('error', err => {
    console.error('Socket error:', err.message);
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

### Server Events

```javascript
const server = net.createServer();

server.on('connection', socket => {
  console.log('New connection');
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`Listening on ${addr.address}:${addr.port}`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use');
  }
});

server.on('close', () => {
  console.log('Server closed');
});

server.listen(3000);
```

### Server Methods

```javascript
// Get server address
const addr = server.address();
// { address: '::', family: 'IPv6', port: 3000 }

// Number of connections
server.getConnections((err, count) => {
  console.log('Active connections:', count);
});

// Maximum connections
server.maxConnections = 100;

// Close server
server.close(err => {
  if (err) console.error(err);
  console.log('Server closed');
});

// Check if listening
console.log(server.listening);  // true/false
```

---

## 17.3 TCP Client

### Creating Connection

```javascript
const net = require('net');

const client = net.createConnection({ port: 3000 }, () => {
  console.log('Connected to server');
  client.write('Hello, server!');
});

client.on('data', data => {
  console.log('Received:', data.toString());
  client.end();
});

client.on('end', () => {
  console.log('Disconnected');
});

client.on('error', err => {
  console.error('Connection error:', err.message);
});
```

### Connection Options

```javascript
const client = net.createConnection({
  port: 3000,
  host: 'localhost',
  localAddress: '192.168.1.100',  // Local interface
  localPort: 12345,               // Local port
  family: 4,                      // IPv4 (4 or 6)
  timeout: 5000,                  // Connection timeout
  keepAlive: true,                // Enable keep-alive
  keepAliveInitialDelay: 1000     // Delay before first probe
});

// Alternative: host:port string
const client = net.createConnection(3000, 'localhost', () => {
  console.log('Connected');
});
```

### net.connect() Alias

```javascript
// Shorthand for createConnection
const client = net.connect(3000, 'localhost');
const client = net.connect({ port: 3000 });
```

---

## 17.4 Socket Properties and Methods

### Properties

```javascript
socket.remoteAddress;    // Client IP
socket.remotePort;       // Client port
socket.remoteFamily;     // 'IPv4' or 'IPv6'
socket.localAddress;     // Server interface IP
socket.localPort;        // Server port

socket.bytesRead;        // Total bytes received
socket.bytesWritten;     // Total bytes sent

socket.connecting;       // Still connecting?
socket.pending;          // Not yet connected?
socket.readyState;       // 'opening', 'open', 'readOnly', 'writeOnly', 'closed'
```

### Methods

```javascript
// Write data
socket.write('Hello');
socket.write(Buffer.from([0x01, 0x02, 0x03]));
socket.write('text', 'utf8', callback);

// End connection (half-close)
socket.end();
socket.end('Goodbye');

// Destroy immediately
socket.destroy();
socket.destroy(new Error('Force close'));

// Pause/resume
socket.pause();
socket.resume();

// Set encoding
socket.setEncoding('utf8');

// Timeouts
socket.setTimeout(30000);
socket.setKeepAlive(true, 60000);
socket.setNoDelay(true);  // Disable Nagle's algorithm
```

### Socket Events

```javascript
socket.on('connect', () => {});     // Connection established
socket.on('ready', () => {});       // Socket ready to use
socket.on('data', data => {});      // Data received
socket.on('drain', () => {});       // Write buffer emptied
socket.on('end', () => {});         // FIN received
socket.on('close', hadError => {}); // Fully closed
socket.on('error', err => {});      // Error occurred
socket.on('timeout', () => {});     // Inactivity timeout
socket.on('lookup', (err, address, family, host) => {});  // DNS resolved
```

---

## 17.5 IPC (Unix Sockets / Named Pipes)

### Unix Socket Server

```javascript
const net = require('net');
const fs = require('fs');

const SOCKET_PATH = '/tmp/app.sock';

// Remove stale socket
if (fs.existsSync(SOCKET_PATH)) {
  fs.unlinkSync(SOCKET_PATH);
}

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log('IPC data:', data.toString());
    socket.write('ACK');
  });
});

server.listen(SOCKET_PATH, () => {
  console.log('IPC server listening');
});

// Cleanup on exit
process.on('exit', () => {
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }
});
```

### Unix Socket Client

```javascript
const client = net.createConnection(SOCKET_PATH, () => {
  client.write('Hello via IPC');
});

client.on('data', data => {
  console.log('Response:', data.toString());
  client.end();
});
```

### Windows Named Pipes

```javascript
// Server
const PIPE_PATH = '\\\\.\\pipe\\myapp';

const server = net.createServer(socket => {
  // Handle connection
});

server.listen(PIPE_PATH);

// Client
const client = net.createConnection(PIPE_PATH);
```

---

## 17.6 Chat Server Example

```javascript
const net = require('net');

const clients = new Set();

const server = net.createServer(socket => {
  socket.name = `${socket.remoteAddress}:${socket.remotePort}`;
  clients.add(socket);
  
  broadcast(`${socket.name} joined\n`, socket);
  socket.write('Welcome to the chat!\n');
  
  socket.on('data', data => {
    broadcast(`${socket.name}: ${data}`, socket);
  });
  
  socket.on('end', () => {
    clients.delete(socket);
    broadcast(`${socket.name} left\n`);
  });
  
  socket.on('error', err => {
    console.error(`${socket.name} error:`, err.message);
    clients.delete(socket);
  });
});

function broadcast(message, sender) {
  for (const client of clients) {
    if (client !== sender) {
      client.write(message);
    }
  }
}

server.listen(3000, () => {
  console.log('Chat server on port 3000');
});
```

---

## 17.7 DNS Resolution

### dns.lookup() — OS Resolution

```javascript
const dns = require('dns');

// Uses OS resolver (hosts file, system DNS)
dns.lookup('google.com', (err, address, family) => {
  console.log('Address:', address);  // '142.250.80.46'
  console.log('Family:', family);    // 4 (IPv4) or 6 (IPv6)
});

// Options
dns.lookup('google.com', {
  family: 4,       // Force IPv4
  hints: dns.ADDRCONFIG,
  all: true        // Return all addresses
}, (err, addresses) => {
  console.log(addresses);
  // [{ address: '142.250.80.46', family: 4 }, ...]
});
```

### dns.resolve() — DNS Protocol

```javascript
// Direct DNS query (bypasses OS cache)
dns.resolve('google.com', (err, addresses) => {
  console.log(addresses);  // ['142.250.80.46', ...]
});

// Specific record types
dns.resolve4('google.com', (err, addresses) => {
  console.log('A records:', addresses);
});

dns.resolve6('google.com', (err, addresses) => {
  console.log('AAAA records:', addresses);
});

dns.resolveMx('gmail.com', (err, records) => {
  console.log('MX records:', records);
  // [{ exchange: 'alt1.gmail-smtp-in.l.google.com', priority: 5 }, ...]
});

dns.resolveTxt('google.com', (err, records) => {
  console.log('TXT records:', records);
});

dns.resolveNs('google.com', (err, servers) => {
  console.log('NS records:', servers);
});

dns.resolveCname('www.google.com', (err, addresses) => {
  console.log('CNAME:', addresses);
});

dns.resolveSoa('google.com', (err, record) => {
  console.log('SOA:', record);
});

dns.resolveSrv('_http._tcp.example.com', (err, records) => {
  console.log('SRV:', records);
});

dns.resolvePtr('46.80.250.142.in-addr.arpa', (err, hostnames) => {
  console.log('PTR:', hostnames);
});

dns.resolveCaa('google.com', (err, records) => {
  console.log('CAA:', records);
});
```

### dns.reverse()

```javascript
dns.reverse('8.8.8.8', (err, hostnames) => {
  console.log('Reverse DNS:', hostnames);
  // ['dns.google']
});
```

### Promise API

```javascript
const dns = require('dns/promises');
// or
const { promises: dnsPromises } = require('dns');

const address = await dns.lookup('google.com');
console.log(address);

const addresses = await dns.resolve4('google.com');
console.log(addresses);

const mx = await dns.resolveMx('gmail.com');
console.log(mx);
```

---

## 17.8 DNS Resolver Class

```javascript
const { Resolver } = require('dns');

const resolver = new Resolver();

// Use custom DNS servers
resolver.setServers(['8.8.8.8', '8.8.4.4']);

// Get current servers
console.log(resolver.getServers());

// Resolve using custom server
resolver.resolve4('google.com', (err, addresses) => {
  console.log(addresses);
});

// Cancel pending queries
resolver.cancel();
```

---

## 17.9 net.isIP()

```javascript
net.isIP('192.168.1.1');    // 4 (IPv4)
net.isIP('::1');            // 6 (IPv6)
net.isIP('invalid');        // 0 (not IP)

net.isIPv4('192.168.1.1');  // true
net.isIPv6('::1');          // true
```

---

## 17.10 Common Patterns

### Simple Request-Response Protocol

```javascript
// Server
const server = net.createServer(socket => {
  let buffer = '';
  
  socket.on('data', data => {
    buffer += data.toString();
    
    // Process complete messages (newline-delimited)
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
      const message = buffer.slice(0, index);
      buffer = buffer.slice(index + 1);
      
      try {
        const request = JSON.parse(message);
        const response = processRequest(request);
        socket.write(JSON.stringify(response) + '\n');
      } catch (err) {
        socket.write(JSON.stringify({ error: err.message }) + '\n');
      }
    }
  });
});

function processRequest(req) {
  switch (req.type) {
    case 'ping': return { type: 'pong' };
    case 'echo': return { type: 'echo', data: req.data };
    default: return { error: 'Unknown type' };
  }
}
```

### Connection Pool

```javascript
class ConnectionPool {
  constructor(options) {
    this.options = options;
    this.pool = [];
    this.waiting = [];
    this.maxSize = options.maxSize || 10;
  }
  
  async getConnection() {
    // Return available connection
    const available = this.pool.find(c => !c.inUse);
    if (available) {
      available.inUse = true;
      return available;
    }
    
    // Create new if under limit
    if (this.pool.length < this.maxSize) {
      const conn = await this.createConnection();
      this.pool.push(conn);
      return conn;
    }
    
    // Wait for available
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }
  
  release(conn) {
    conn.inUse = false;
    
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      conn.inUse = true;
      resolve(conn);
    }
  }
  
  createConnection() {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(this.options, () => {
        resolve({ socket, inUse: true });
      });
      socket.on('error', reject);
    });
  }
}
```

### Health Check

```javascript
function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('Timeout'));
    }, timeout);
    
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
    
    socket.connect(port, host);
  });
}

// Usage
const isUp = await checkPort('localhost', 3000);
```

---

## 17.11 Summary

| net Method | Description |
|------------|-------------|
| `createServer()` | Create TCP/IPC server |
| `createConnection()` | Create TCP/IPC client |
| `connect()` | Alias for createConnection |
| `isIP()` | Check if valid IP (returns 4, 6, or 0) |
| `isIPv4()` / `isIPv6()` | Check specific IP version |

| Socket Events | Description |
|---------------|-------------|
| `connect` | Connection established |
| `data` | Data received |
| `drain` | Write buffer empty |
| `end` | Other side sent FIN |
| `close` | Fully closed |
| `error` | Error occurred |
| `timeout` | Inactivity timeout |

| dns Method | Description |
|------------|-------------|
| `lookup()` | OS-based resolution |
| `resolve()` | DNS protocol query |
| `resolve4()` | Query A records |
| `resolve6()` | Query AAAA records |
| `resolveMx()` | Query MX records |
| `resolveTxt()` | Query TXT records |
| `resolveNs()` | Query NS records |
| `reverse()` | Reverse DNS lookup |

---

**End of Module 17: Net and DNS**

Next: **Module 18 — Readline** (Interactive input)
# Module 18: Readline

The `readline` module provides an interface for reading input line-by-line from readable streams. It's essential for building interactive CLI applications.

---

## 18.1 Module Import

```javascript
// CommonJS
const readline = require('readline');
const { createInterface } = require('readline');

// ES Modules
import readline from 'readline';
import { createInterface } from 'readline';

// Promise-based (Node.js 17+)
import * as readline from 'readline/promises';
```

---

## 18.2 Creating Interface

### Basic Setup

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is your name? ', answer => {
  console.log(`Hello, ${answer}!`);
  rl.close();
});
```

### Interface Options

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',              // Default prompt
  terminal: true,            // Is TTY terminal
  history: [],               // Initial history
  historySize: 100,          // Max history entries
  removeHistoryDuplicates: true,
  completer: tabCompleter,   // Tab completion function
  crlfDelay: Infinity        // Treat \r\n as single line break
});
```

---

## 18.3 Basic Methods

### question()

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask single question
rl.question('Enter your name: ', name => {
  rl.question('Enter your age: ', age => {
    console.log(`${name} is ${age} years old`);
    rl.close();
  });
});
```

### prompt()

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'app> '
});

rl.prompt();

rl.on('line', line => {
  const input = line.trim();
  
  switch (input) {
    case 'hello':
      console.log('Hello!');
      break;
    case 'exit':
      rl.close();
      return;
    default:
      console.log(`Unknown: ${input}`);
  }
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
```

### write()

```javascript
// Write to output without waiting for input
rl.write('Initial text');

// Simulate keystrokes
rl.write(null, { ctrl: true, name: 'u' });  // Clear line
rl.write(null, { ctrl: true, name: 'c' });  // Simulate Ctrl+C
```

---

## 18.4 Promise-Based API

```javascript
const readline = require('readline/promises');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const name = await rl.question('Name: ');
  const age = await rl.question('Age: ');
  
  console.log(`${name} is ${age}`);
  rl.close();
}

main();
```

### With AbortController

```javascript
const readline = require('readline/promises');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const controller = new AbortController();

// Timeout after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const answer = await rl.question('Quick! Enter something: ', {
    signal: controller.signal
  });
  console.log(`You entered: ${answer}`);
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Too slow!');
  }
} finally {
  rl.close();
}
```

---

## 18.5 Events

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Line entered
rl.on('line', line => {
  console.log(`Received: ${line}`);
});

// Interface closed
rl.on('close', () => {
  console.log('Interface closed');
});

// History event (when history changes)
rl.on('history', history => {
  console.log('History:', history);
});

// SIGINT (Ctrl+C)
rl.on('SIGINT', () => {
  rl.question('Really quit? (y/n) ', answer => {
    if (answer.toLowerCase() === 'y') {
      process.exit(0);
    } else {
      rl.prompt();
    }
  });
});

// SIGTSTP (Ctrl+Z)
rl.on('SIGTSTP', () => {
  console.log('Caught SIGTSTP');
});

// SIGCONT (resume from background)
rl.on('SIGCONT', () => {
  rl.prompt();
});

// Pause/resume
rl.on('pause', () => console.log('Paused'));
rl.on('resume', () => console.log('Resumed'));
```

---

## 18.6 Tab Completion

```javascript
const commands = ['help', 'quit', 'list', 'load', 'save'];

function completer(line) {
  const hits = commands.filter(c => c.startsWith(line));
  return [hits.length ? hits : commands, line];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer
});

rl.prompt();

rl.on('line', line => {
  console.log(`Command: ${line}`);
  rl.prompt();
});
```

### Async Completer

```javascript
async function asyncCompleter(line) {
  // Simulate async lookup
  await new Promise(r => setTimeout(r, 100));
  
  const hits = commands.filter(c => c.startsWith(line));
  return [hits, line];
}

// Must wrap for callback style
function completer(line, callback) {
  asyncCompleter(line)
    .then(result => callback(null, result))
    .catch(err => callback(err));
}
```

---

## 18.7 Reading Files Line by Line

```javascript
const fs = require('fs');
const readline = require('readline');

async function processFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity  // Treat \r\n as single newline
  });
  
  let lineNumber = 0;
  
  for await (const line of rl) {
    lineNumber++;
    console.log(`Line ${lineNumber}: ${line}`);
  }
  
  console.log(`Total lines: ${lineNumber}`);
}

processFile('data.txt');
```

### With Line Event

```javascript
const rl = readline.createInterface({
  input: fs.createReadStream('file.txt'),
  crlfDelay: Infinity
});

rl.on('line', line => {
  console.log(line);
});

rl.on('close', () => {
  console.log('Done reading');
});
```

---

## 18.8 Cursor and Screen Control

### Cursor Movement

```javascript
const readline = require('readline');

// Move cursor up n lines
readline.moveCursor(process.stdout, 0, -1);

// Move cursor to specific column
readline.cursorTo(process.stdout, 10);

// Move cursor to absolute position
readline.cursorTo(process.stdout, 0, 5);  // x=0, y=5

// Clear from cursor to end of line
readline.clearLine(process.stdout, 0);

// Clear line direction: -1 left, 0 entire, 1 right
readline.clearLine(process.stdout, 1);  // Clear right of cursor

// Clear screen from cursor down
readline.clearScreenDown(process.stdout);
```

### Progress Bar Example

```javascript
function progressBar(current, total, width = 40) {
  const percent = current / total;
  const filled = Math.round(width * percent);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percentage = (percent * 100).toFixed(1);
  
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`Progress: [${bar}] ${percentage}%`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}

// Usage
for (let i = 0; i <= 100; i++) {
  progressBar(i, 100);
  await new Promise(r => setTimeout(r, 50));
}
```

---

## 18.9 Common Patterns

### Password Input (Hidden)

```javascript
async function readPassword(prompt = 'Password: ') {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Hide input
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    
    let password = '';
    
    process.stdin.on('data', char => {
      const c = char.toString();
      
      switch (c) {
        case '\n':
        case '\r':
        case '\u0004':  // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
          break;
        case '\u0003':  // Ctrl+C
          process.exit();
          break;
        case '\u007F':  // Backspace
          password = password.slice(0, -1);
          break;
        default:
          password += c;
          process.stdout.write('*');
      }
    });
  });
}

const password = await readPassword();
console.log(`Password length: ${password.length}`);
```

### Menu Selection

```javascript
async function selectFromMenu(options, prompt = 'Select an option:') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log(prompt);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt}`);
  });
  
  return new Promise(resolve => {
    rl.question('Enter number: ', answer => {
      rl.close();
      const index = parseInt(answer) - 1;
      
      if (index >= 0 && index < options.length) {
        resolve({ index, value: options[index] });
      } else {
        resolve(null);
      }
    });
  });
}

const choice = await selectFromMenu(['Option A', 'Option B', 'Option C']);
console.log('Selected:', choice);
```

### Confirmation Prompt

```javascript
async function confirm(question, defaultYes = true) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  
  return new Promise(resolve => {
    rl.question(`${question} ${hint} `, answer => {
      rl.close();
      
      const response = answer.toLowerCase().trim();
      
      if (response === '') {
        resolve(defaultYes);
      } else {
        resolve(response === 'y' || response === 'yes');
      }
    });
  });
}

if (await confirm('Continue?')) {
  console.log('Continuing...');
} else {
  console.log('Cancelled');
}
```

### REPL-Style Interface

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>>> '
});

const context = {};

console.log('JavaScript REPL (type .exit to quit)');
rl.prompt();

rl.on('line', line => {
  const input = line.trim();
  
  if (input === '.exit') {
    rl.close();
    return;
  }
  
  if (input === '.clear') {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    rl.prompt();
    return;
  }
  
  try {
    const result = eval(input);
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
```

---

## 18.10 Async Iterator

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Use as async iterator
async function processInput() {
  for await (const line of rl) {
    if (line === 'exit') break;
    console.log(`You typed: ${line}`);
  }
  
  rl.close();
}

processInput();
```

---

## 18.11 Summary

| Method | Description |
|--------|-------------|
| `createInterface()` | Create readline interface |
| `question(q, cb)` | Ask question, get answer |
| `prompt()` | Display prompt, wait for input |
| `write(data)` | Write to output |
| `close()` | Close interface |
| `pause()` / `resume()` | Pause/resume input |

| Cursor Functions | Description |
|------------------|-------------|
| `moveCursor(stream, dx, dy)` | Move cursor relative |
| `cursorTo(stream, x, y)` | Move cursor absolute |
| `clearLine(stream, dir)` | Clear current line |
| `clearScreenDown(stream)` | Clear screen below cursor |

| Events | Description |
|--------|-------------|
| `line` | Line entered |
| `close` | Interface closed |
| `pause` / `resume` | Input paused/resumed |
| `SIGINT` | Ctrl+C pressed |
| `history` | History updated |

---

**End of Module 18: Readline**

Next: **Module 19 — Compression (zlib)** (Gzip, Deflate, Brotli)
# Module 19: Compression (zlib)

The `zlib` module provides compression and decompression functionality using Gzip, Deflate, and Brotli algorithms. Essential for reducing data size in storage and network transfers.

---

## 19.1 Module Import

```javascript
// CommonJS
const zlib = require('zlib');

// ES Modules
import zlib from 'zlib';
import { gzip, gunzip, createGzip, createGunzip } from 'zlib';

// Promisified versions
const { promisify } = require('util');
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);
```

---

## 19.2 Compression Methods

### Gzip (Most Common)

```javascript
const zlib = require('zlib');

// Callback style
zlib.gzip('Hello World', (err, buffer) => {
  if (err) throw err;
  console.log('Compressed:', buffer);
  
  zlib.gunzip(buffer, (err, result) => {
    if (err) throw err;
    console.log('Decompressed:', result.toString());
  });
});

// Promise style
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const compressed = await gzip('Hello World');
const decompressed = await gunzip(compressed);
console.log(decompressed.toString());

// Sync (blocks event loop)
const compressed = zlib.gzipSync('Hello World');
const decompressed = zlib.gunzipSync(compressed);
```

### Deflate

```javascript
// With zlib header (RFC 1950)
const compressed = zlib.deflateSync('data');
const decompressed = zlib.inflateSync(compressed);

// Raw deflate, no header (RFC 1951)
const rawCompressed = zlib.deflateRawSync('data');
const rawDecompressed = zlib.inflateRawSync(rawCompressed);
```

### Brotli (Better Compression)

```javascript
// Brotli compression (Node.js 11.7+)
const compressed = zlib.brotliCompressSync('Hello World');
const decompressed = zlib.brotliDecompressSync(compressed);

// Async
zlib.brotliCompress('data', (err, result) => {
  console.log('Brotli compressed:', result);
});
```

---

## 19.3 Stream-Based Compression

### Gzip Streams

```javascript
const fs = require('fs');
const zlib = require('zlib');

// Compress file
const input = fs.createReadStream('file.txt');
const output = fs.createWriteStream('file.txt.gz');
const gzip = zlib.createGzip();

input.pipe(gzip).pipe(output);

// Decompress file
const compressedInput = fs.createReadStream('file.txt.gz');
const decompressedOutput = fs.createWriteStream('file.txt');
const gunzip = zlib.createGunzip();

compressedInput.pipe(gunzip).pipe(decompressedOutput);
```

### Using pipeline()

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

// Compress with proper error handling
await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz')
);
console.log('Compression complete');

// Decompress
await pipeline(
  fs.createReadStream('input.txt.gz'),
  zlib.createGunzip(),
  fs.createWriteStream('output.txt')
);
console.log('Decompression complete');
```

### Transform Classes

```javascript
// Available transform streams
zlib.createGzip()           // Gzip compression
zlib.createGunzip()         // Gzip decompression
zlib.createDeflate()        // Deflate compression
zlib.createInflate()        // Deflate decompression
zlib.createDeflateRaw()     // Raw deflate
zlib.createInflateRaw()     // Raw inflate
zlib.createBrotliCompress() // Brotli compression
zlib.createBrotliDecompress() // Brotli decompression
```

---

## 19.4 Compression Options

### Gzip/Deflate Options

```javascript
const options = {
  level: zlib.constants.Z_BEST_COMPRESSION,  // 0-9, default 6
  memLevel: 8,        // 1-9, memory usage
  strategy: zlib.constants.Z_DEFAULT_STRATEGY,
  windowBits: 15,     // 8-15, or negative for raw
  chunkSize: 16 * 1024,  // Internal buffer size
  dictionary: buffer  // Preset dictionary
};

const gzip = zlib.createGzip(options);
const compressed = zlib.gzipSync(data, options);
```

### Compression Levels

```javascript
zlib.constants.Z_NO_COMPRESSION      // 0
zlib.constants.Z_BEST_SPEED          // 1
zlib.constants.Z_BEST_COMPRESSION    // 9
zlib.constants.Z_DEFAULT_COMPRESSION // 6

// Trade-off: speed vs size
const fast = zlib.gzipSync(data, { level: 1 });
const small = zlib.gzipSync(data, { level: 9 });
```

### Brotli Options

```javascript
const options = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,  // 0-11
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 1024
  }
};

const compressed = zlib.brotliCompressSync(data, options);

// Quality levels
zlib.constants.BROTLI_MIN_QUALITY  // 0
zlib.constants.BROTLI_MAX_QUALITY  // 11
zlib.constants.BROTLI_DEFAULT_QUALITY  // 11
```

---

## 19.5 HTTP Compression

### Server with Compression

```javascript
const http = require('http');
const zlib = require('zlib');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const raw = fs.createReadStream('large-file.html');
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    // Brotli (best compression)
    res.writeHead(200, { 'Content-Encoding': 'br' });
    raw.pipe(zlib.createBrotliCompress()).pipe(res);
  } else if (acceptEncoding.includes('gzip')) {
    // Gzip
    res.writeHead(200, { 'Content-Encoding': 'gzip' });
    raw.pipe(zlib.createGzip()).pipe(res);
  } else if (acceptEncoding.includes('deflate')) {
    // Deflate
    res.writeHead(200, { 'Content-Encoding': 'deflate' });
    raw.pipe(zlib.createDeflate()).pipe(res);
  } else {
    // No compression
    res.writeHead(200);
    raw.pipe(res);
  }
});

server.listen(3000);
```

### Client with Decompression

```javascript
const http = require('http');
const zlib = require('zlib');

const options = {
  hostname: 'example.com',
  path: '/',
  headers: {
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

http.get(options, res => {
  let stream = res;
  
  const encoding = res.headers['content-encoding'];
  
  switch (encoding) {
    case 'gzip':
      stream = res.pipe(zlib.createGunzip());
      break;
    case 'br':
      stream = res.pipe(zlib.createBrotliDecompress());
      break;
    case 'deflate':
      stream = res.pipe(zlib.createInflate());
      break;
  }
  
  let data = '';
  stream.on('data', chunk => data += chunk);
  stream.on('end', () => console.log(data));
});
```

---

## 19.6 Common Patterns

### Compress Buffer

```javascript
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

async function compressBuffer(buffer) {
  return await gzip(buffer);
}

async function decompressBuffer(buffer) {
  return await gunzip(buffer);
}

// Usage
const data = Buffer.from('Hello World'.repeat(1000));
console.log('Original:', data.length);

const compressed = await compressBuffer(data);
console.log('Compressed:', compressed.length);

const decompressed = await decompressBuffer(compressed);
console.log('Decompressed:', decompressed.length);
```

### Compress JSON

```javascript
async function compressJSON(obj) {
  const json = JSON.stringify(obj);
  return await gzip(json);
}

async function decompressJSON(buffer) {
  const json = await gunzip(buffer);
  return JSON.parse(json.toString());
}

// Usage
const data = { users: Array(1000).fill({ name: 'User', active: true }) };
const compressed = await compressJSON(data);
const restored = await decompressJSON(compressed);
```

### Streaming Compression with Progress

```javascript
const fs = require('fs');
const zlib = require('zlib');

function compressWithProgress(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const stat = fs.statSync(inputPath);
    const totalSize = stat.size;
    let processedSize = 0;
    
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip();
    
    input.on('data', chunk => {
      processedSize += chunk.length;
      const percent = ((processedSize / totalSize) * 100).toFixed(1);
      process.stdout.write(`\rCompressing: ${percent}%`);
    });
    
    input.on('error', reject);
    output.on('error', reject);
    gzip.on('error', reject);
    
    output.on('close', () => {
      console.log('\nDone!');
      const compressed = fs.statSync(outputPath);
      const ratio = ((1 - compressed.size / totalSize) * 100).toFixed(1);
      console.log(`Compression ratio: ${ratio}%`);
      resolve();
    });
    
    input.pipe(gzip).pipe(output);
  });
}

await compressWithProgress('large-file.txt', 'large-file.txt.gz');
```

### Compress Directory (tar.gz)

```javascript
const tar = require('tar');  // npm install tar
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

// Create tar.gz
async function createTarGz(sourceDir, outputFile) {
  await pipeline(
    tar.create({ cwd: sourceDir }, ['.']),
    zlib.createGzip(),
    fs.createWriteStream(outputFile)
  );
}

// Extract tar.gz
async function extractTarGz(inputFile, destDir) {
  await pipeline(
    fs.createReadStream(inputFile),
    zlib.createGunzip(),
    tar.extract({ cwd: destDir })
  );
}
```

---

## 19.7 Comparison of Algorithms

| Algorithm | Compression | Speed | Compatibility |
|-----------|-------------|-------|---------------|
| Gzip | Good | Fast | Universal |
| Deflate | Good | Fast | Universal |
| Brotli | Excellent | Slower | Modern browsers |

### Benchmark

```javascript
async function benchmark(data) {
  console.log('Original size:', data.length);
  
  // Gzip
  let start = Date.now();
  const gzipped = zlib.gzipSync(data);
  console.log(`Gzip: ${gzipped.length} bytes, ${Date.now() - start}ms`);
  
  // Deflate
  start = Date.now();
  const deflated = zlib.deflateSync(data);
  console.log(`Deflate: ${deflated.length} bytes, ${Date.now() - start}ms`);
  
  // Brotli
  start = Date.now();
  const brotlied = zlib.brotliCompressSync(data);
  console.log(`Brotli: ${brotlied.length} bytes, ${Date.now() - start}ms`);
}

const testData = Buffer.from('Hello World! '.repeat(10000));
benchmark(testData);
```

---

## 19.8 Error Handling

```javascript
// Async error handling
zlib.gunzip(invalidData, (err, result) => {
  if (err) {
    console.error('Decompression failed:', err.message);
    return;
  }
  console.log(result);
});

// Stream error handling
const gunzip = zlib.createGunzip();

gunzip.on('error', err => {
  console.error('Stream error:', err.message);
});

// Try-catch for sync
try {
  const result = zlib.gunzipSync(invalidData);
} catch (err) {
  console.error('Sync error:', err.message);
}

// Common errors
// Z_DATA_ERROR - Invalid compressed data
// Z_MEM_ERROR - Not enough memory
// Z_BUF_ERROR - Buffer error
```

---

## 19.9 Memory Management

### Flushing

```javascript
const gzip = zlib.createGzip();

// Write some data
gzip.write('partial data');

// Flush to ensure data is written
gzip.flush(zlib.constants.Z_SYNC_FLUSH, () => {
  console.log('Flushed');
});

// Flush types
zlib.constants.Z_NO_FLUSH      // Default, buffer until full
zlib.constants.Z_PARTIAL_FLUSH // Flush some
zlib.constants.Z_SYNC_FLUSH    // Flush all buffered
zlib.constants.Z_FULL_FLUSH    // Flush and reset state
zlib.constants.Z_FINISH        // Final flush
```

### Resetting Stream

```javascript
const deflate = zlib.createDeflate();

// After finishing one compression
deflate.reset();

// Can now reuse for another compression
```

---

## 19.10 Summary

| Method | Description |
|--------|-------------|
| `gzip()` / `gzipSync()` | Gzip compress |
| `gunzip()` / `gunzipSync()` | Gzip decompress |
| `deflate()` / `deflateSync()` | Deflate compress |
| `inflate()` / `inflateSync()` | Deflate decompress |
| `deflateRaw()` / `inflateRaw()` | Raw deflate (no header) |
| `brotliCompress()` | Brotli compress |
| `brotliDecompress()` | Brotli decompress |

| Stream | Description |
|--------|-------------|
| `createGzip()` | Gzip transform stream |
| `createGunzip()` | Gunzip transform stream |
| `createDeflate()` | Deflate transform stream |
| `createInflate()` | Inflate transform stream |
| `createBrotliCompress()` | Brotli compress stream |
| `createBrotliDecompress()` | Brotli decompress stream |

| Constant | Description |
|----------|-------------|
| `Z_BEST_SPEED` | Level 1 (fastest) |
| `Z_BEST_COMPRESSION` | Level 9 (smallest) |
| `Z_DEFAULT_COMPRESSION` | Level 6 (balanced) |

---

**End of Module 19: Compression (zlib)**

Next: **Module 20 — Advanced Core Modules** (Assert, Performance, Diagnostics)
# Module 20: Advanced Core Modules

This module covers additional core modules for assertion testing, performance measurement, diagnostics, and more specialized utilities.

---

## 20.1 Assert Module

### Basic Assertions

```javascript
const assert = require('assert');

// Equal (uses ==)
assert.equal(1, '1');  // Passes (loose equality)

// Strict equal (uses ===)
assert.strictEqual(1, 1);  // Passes
// assert.strictEqual(1, '1');  // Throws!

// Not equal
assert.notEqual(1, 2);
assert.notStrictEqual(1, '1');

// Deep equal (objects/arrays)
assert.deepEqual({ a: 1 }, { a: 1 });      // Passes
assert.deepStrictEqual([1, 2], [1, 2]);    // Passes

// Not deep equal
assert.notDeepEqual({ a: 1 }, { a: 2 });
assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
```

### Truthiness

```javascript
// OK (truthy)
assert.ok(true);
assert.ok(1);
assert.ok('string');
// assert.ok(0);  // Throws

// Same as assert()
assert(true);
assert(1 === 1);
```

### Error Assertions

```javascript
// Throws error
assert.throws(
  () => { throw new Error('boom'); },
  Error
);

// Throws specific error
assert.throws(
  () => { throw new TypeError('type error'); },
  {
    name: 'TypeError',
    message: 'type error'
  }
);

// Throws with regex
assert.throws(
  () => { throw new Error('Connection failed'); },
  /Connection/
);

// Does not throw
assert.doesNotThrow(() => {
  return 42;
});

// Rejects (async)
await assert.rejects(
  async () => { throw new Error('async error'); },
  { name: 'Error' }
);

// Does not reject
await assert.doesNotReject(async () => {
  return 'success';
});
```

### assert.strict

```javascript
// Use strict mode by default
const assert = require('assert/strict');

// Now all assertions use strict equality
assert.equal(1, 1);      // Uses strictEqual
assert.deepEqual({}, {}); // Uses deepStrictEqual
```

### Match and Contains

```javascript
// Match against regex
assert.match('hello world', /world/);

// Does not match
assert.doesNotMatch('hello', /world/);

// Object contains keys (subset match)
const obj = { a: 1, b: 2, c: 3 };
assert.deepStrictEqual(
  { a: obj.a, b: obj.b },
  { a: 1, b: 2 }
);
```

### Fail

```javascript
// Always fails
assert.fail('This should not happen');

// Conditional fail
if (condition) {
  assert.fail('Unexpected condition');
}
```

---

## 20.2 Performance Hooks

### Measuring Duration

```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

// Simple timing
const start = performance.now();
// ... work ...
const duration = performance.now() - start;
console.log(`Took ${duration}ms`);

// Mark and measure
performance.mark('start');
// ... work ...
performance.mark('end');
performance.measure('my-operation', 'start', 'end');

// Get measurements
const measures = performance.getEntriesByName('my-operation');
console.log(measures[0].duration);

// Clear marks
performance.clearMarks();
performance.clearMeasures();
```

### Performance Observer

```javascript
const { PerformanceObserver, performance } = require('perf_hooks');

const obs = new PerformanceObserver(list => {
  const entries = list.getEntries();
  entries.forEach(entry => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  });
});

obs.observe({ entryTypes: ['measure'] });

performance.mark('A');
setTimeout(() => {
  performance.mark('B');
  performance.measure('A to B', 'A', 'B');
}, 100);
```

### timerify

```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

// Wrap function to measure timing
function slowFunction() {
  let sum = 0;
  for (let i = 0; i < 1e8; i++) sum += i;
  return sum;
}

const wrapped = performance.timerify(slowFunction);

const obs = new PerformanceObserver(list => {
  console.log(list.getEntries()[0].duration);
  obs.disconnect();
});
obs.observe({ entryTypes: ['function'] });

wrapped();  // Automatically measured
```

### monitorEventLoopDelay

```javascript
const { monitorEventLoopDelay } = require('perf_hooks');

const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setTimeout(() => {
  console.log('Event Loop Delay:');
  console.log(`  Min: ${histogram.min / 1e6}ms`);
  console.log(`  Max: ${histogram.max / 1e6}ms`);
  console.log(`  Mean: ${histogram.mean / 1e6}ms`);
  console.log(`  Stddev: ${histogram.stddev / 1e6}ms`);
  console.log(`  P50: ${histogram.percentile(50) / 1e6}ms`);
  console.log(`  P99: ${histogram.percentile(99) / 1e6}ms`);
  
  histogram.disable();
}, 5000);
```

---

## 20.3 Async Hooks

### Tracking Async Operations

```javascript
const async_hooks = require('async_hooks');
const fs = require('fs');

// Sync write for logging (console.log is async!)
function log(...args) {
  fs.writeSync(1, args.join(' ') + '\n');
}

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    log(`Init: ${type} (${asyncId}) triggered by ${triggerAsyncId}`);
  },
  before(asyncId) {
    log(`Before: ${asyncId}`);
  },
  after(asyncId) {
    log(`After: ${asyncId}`);
  },
  destroy(asyncId) {
    log(`Destroy: ${asyncId}`);
  },
  promiseResolve(asyncId) {
    log(`Promise resolved: ${asyncId}`);
  }
});

hook.enable();

// Track this timeout
setTimeout(() => {
  log('Timeout executed');
}, 100);
```

### AsyncLocalStorage (Request Context)

```javascript
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

// Express-style middleware
function requestContextMiddleware(req, res, next) {
  const context = {
    requestId: Math.random().toString(36).slice(2),
    userId: req.user?.id
  };
  
  asyncLocalStorage.run(context, () => {
    next();
  });
}

// Access context anywhere in async chain
function getRequestId() {
  const store = asyncLocalStorage.getStore();
  return store?.requestId || 'no-request';
}

// Logger that includes request ID
function log(message) {
  console.log(`[${getRequestId()}] ${message}`);
}

// Example usage
asyncLocalStorage.run({ requestId: 'req-123' }, async () => {
  log('Start processing');
  await someAsyncOperation();
  log('Done processing');  // Still has access to requestId
});
```

---

## 20.4 Diagnostics Channel

```javascript
const diagnostics_channel = require('diagnostics_channel');

// Create channel
const channel = diagnostics_channel.channel('my-app:requests');

// Subscribe to channel
channel.subscribe(message => {
  console.log('Request:', message);
});

// Publish messages
function handleRequest(req) {
  channel.publish({
    method: req.method,
    url: req.url,
    timestamp: Date.now()
  });
}

// Check if channel has subscribers
if (channel.hasSubscribers) {
  channel.publish({ event: 'important' });
}
```

---

## 20.5 String Decoder

```javascript
const { StringDecoder } = require('string_decoder');

// Handle multi-byte characters correctly
const decoder = new StringDecoder('utf8');

// Euro sign: €  (3 bytes in UTF-8: 0xE2 0x82 0xAC)
const buffer1 = Buffer.from([0xE2]);
const buffer2 = Buffer.from([0x82, 0xAC]);

// Buffer.toString() would fail on partial character
console.log(buffer1.toString());  // '' or garbage

// StringDecoder buffers until complete
console.log(decoder.write(buffer1));  // ''
console.log(decoder.write(buffer2));  // '€'

// Flush remaining
const remaining = decoder.end();
```

---

## 20.6 V8 Module

```javascript
const v8 = require('v8');

// Heap statistics
const stats = v8.getHeapStatistics();
console.log({
  totalHeapSize: `${(stats.total_heap_size / 1024 / 1024).toFixed(2)} MB`,
  usedHeapSize: `${(stats.used_heap_size / 1024 / 1024).toFixed(2)} MB`,
  heapSizeLimit: `${(stats.heap_size_limit / 1024 / 1024).toFixed(2)} MB`
});

// Heap space statistics
v8.getHeapSpaceStatistics().forEach(space => {
  console.log(`${space.space_name}: ${(space.space_used_size / 1024).toFixed(0)} KB`);
});

// Heap snapshot
const stream = v8.writeHeapSnapshot();
console.log(`Heap snapshot written to: ${stream}`);

// Serialization (structured clone)
const serialized = v8.serialize({ a: 1, b: [2, 3] });
const deserialized = v8.deserialize(serialized);
console.log(deserialized);  // { a: 1, b: [2, 3] }

// Set heap size limit flags
// v8.setFlagsFromString('--max-old-space-size=4096');
```

---

## 20.7 Inspector

```javascript
const inspector = require('inspector');

// Open inspector on port 9229
inspector.open(9229, 'localhost', true);

// Get URL for DevTools
console.log('DevTools URL:', inspector.url());

// Close inspector
// inspector.close();

// Programmatic debugging
const session = new inspector.Session();
session.connect();

session.post('Profiler.enable', () => {
  session.post('Profiler.start', () => {
    // Run code to profile
    
    session.post('Profiler.stop', (err, { profile }) => {
      // Write profile to file
      require('fs').writeFileSync(
        'profile.cpuprofile',
        JSON.stringify(profile)
      );
    });
  });
});
```

---

## 20.8 Trace Events

```javascript
const trace_events = require('trace_events');

// Create tracing
const tracing = trace_events.createTracing({
  categories: ['node.async_hooks', 'v8']
});

tracing.enable();

// Do work...

tracing.disable();

// Get categories
console.log(trace_events.getEnabledCategories());
```

---

## 20.9 VM Module

Execute code in isolated context:

```javascript
const vm = require('vm');

// Run in isolated context
const sandbox = { x: 10 };
vm.createContext(sandbox);

vm.runInContext('x *= 2', sandbox);
console.log(sandbox.x);  // 20

// Run in new context
const result = vm.runInNewContext('x + y', { x: 1, y: 2 });
console.log(result);  // 3

// Run in current context (dangerous!)
vm.runInThisContext('console.log("hello")');

// Compile script
const script = new vm.Script('x + y');
const context = vm.createContext({ x: 10, y: 20 });
console.log(script.runInContext(context));  // 30

// Timeout
try {
  vm.runInNewContext('while(true){}', {}, { timeout: 1000 });
} catch (err) {
  console.log('Timed out');
}

// ES Modules (experimental)
const module = new vm.SourceTextModule('export const x = 1;');
```

---

## 20.10 WASI (WebAssembly System Interface)

```javascript
const { WASI } = require('wasi');
const fs = require('fs');

const wasi = new WASI({
  version: 'preview1',
  args: process.argv,
  env: process.env,
  preopens: {
    '/sandbox': '/real/path'
  }
});

const importObject = { wasi_snapshot_preview1: wasi.wasiImport };

const wasm = await WebAssembly.compile(fs.readFileSync('program.wasm'));
const instance = await WebAssembly.instantiate(wasm, importObject);

wasi.start(instance);
```

---

## 20.11 Querystring (Legacy)

```javascript
const querystring = require('querystring');

// Parse
const parsed = querystring.parse('foo=bar&baz=qux');
// { foo: 'bar', baz: 'qux' }

// Stringify
const str = querystring.stringify({ foo: 'bar', baz: 'qux' });
// 'foo=bar&baz=qux'

// Escape/unescape
querystring.escape('hello world');    // 'hello%20world'
querystring.unescape('hello%20world'); // 'hello world'

// Note: Prefer URLSearchParams for new code
```

---

## 20.12 Summary

| Module | Purpose |
|--------|---------|
| `assert` | Testing assertions |
| `perf_hooks` | Performance measurement |
| `async_hooks` | Async operation tracking |
| `diagnostics_channel` | Diagnostic messaging |
| `string_decoder` | Multi-byte string handling |
| `v8` | V8 engine utilities |
| `inspector` | Debugging protocol |
| `trace_events` | Tracing |
| `vm` | Isolated code execution |
| `wasi` | WebAssembly System Interface |

| Assert Methods | Description |
|----------------|-------------|
| `strictEqual()` | Strict equality |
| `deepStrictEqual()` | Deep object equality |
| `throws()` | Error thrown |
| `rejects()` | Promise rejects |
| `ok()` | Truthy value |

| Perf Hooks | Description |
|------------|-------------|
| `performance.now()` | High-resolution timestamp |
| `performance.mark()` | Create marker |
| `performance.measure()` | Measure between marks |
| `timerify()` | Wrap function for timing |
| `monitorEventLoopDelay()` | Track event loop delay |

---

**End of Module 20: Advanced Core Modules**

Next: **Module 21 — Worker Threads** (Multi-threading in Node.js)
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
# Module 22: Test Runner

Node.js includes a built-in test runner (stable in Node.js 20+) for writing and running tests without external dependencies.

---

## 22.1 Module Import

```javascript
// CommonJS
const { test, describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// ES Modules
import { test, describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
```

---

## 22.2 Basic Tests

### Simple Test

```javascript
const test = require('node:test');
const assert = require('node:assert');

test('basic addition', () => {
  assert.strictEqual(1 + 1, 2);
});

test('string comparison', () => {
  assert.strictEqual('hello'.toUpperCase(), 'HELLO');
});
```

### Async Tests

```javascript
test('async operation', async () => {
  const result = await Promise.resolve(42);
  assert.strictEqual(result, 42);
});

test('async with timeout', async () => {
  const data = await fetchData();
  assert.ok(data.length > 0);
});
```

### Callback Tests

```javascript
test('callback style', (t, done) => {
  setTimeout(() => {
    assert.ok(true);
    done();
  }, 100);
});
```

---

## 22.3 Test Organization

### describe / it

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      assert.strictEqual(add(2, 3), 5);
    });
    
    it('should handle negative numbers', () => {
      assert.strictEqual(add(-1, 1), 0);
    });
  });
  
  describe('multiply', () => {
    it('should multiply numbers', () => {
      assert.strictEqual(multiply(3, 4), 12);
    });
  });
});
```

### Nested test()

```javascript
test('parent test', async t => {
  await t.test('child test 1', () => {
    assert.ok(true);
  });
  
  await t.test('child test 2', () => {
    assert.ok(true);
  });
});
```

---

## 22.4 Hooks

```javascript
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');

describe('Database tests', () => {
  let db;
  
  before(async () => {
    // Run once before all tests
    db = await connectToDatabase();
  });
  
  after(async () => {
    // Run once after all tests
    await db.close();
  });
  
  beforeEach(async () => {
    // Run before each test
    await db.clear();
  });
  
  afterEach(async () => {
    // Run after each test
    await db.rollback();
  });
  
  it('should insert data', async () => {
    await db.insert({ name: 'test' });
    const count = await db.count();
    assert.strictEqual(count, 1);
  });
});
```

---

## 22.5 Test Options

```javascript
test('test with options', { timeout: 5000 }, async () => {
  // Test must complete within 5 seconds
  await slowOperation();
});

test('skipped test', { skip: true }, () => {
  // This test won't run
});

test('conditionally skipped', { skip: process.env.CI ? 'Skipping in CI' : false }, () => {
  // Skip with reason
});

test('todo test', { todo: true }, () => {
  // Marked as TODO
});

test('todo with description', { todo: 'Need to implement' }, () => {
  // TODO with message
});

test('only this test', { only: true }, () => {
  // Run only this test (when using --test-only flag)
});

test('concurrent test', { concurrency: 4 }, async t => {
  // Run subtests with concurrency
  await t.test('sub1', async () => {});
  await t.test('sub2', async () => {});
});
```

---

## 22.6 Test Context

```javascript
test('using test context', async t => {
  // Diagnostic info
  t.diagnostic('Running important test');
  
  // Skip at runtime
  if (!featureEnabled) {
    t.skip('Feature not enabled');
    return;
  }
  
  // TODO at runtime
  if (notImplemented) {
    t.todo('Not implemented yet');
    return;
  }
  
  // Get test name
  console.log(t.name);
  
  // Abort signal
  const signal = t.signal;
  
  // Nested tests
  await t.test('nested', () => {
    assert.ok(true);
  });
});
```

---

## 22.7 Mocking

### Function Mocking

```javascript
const { test, mock } = require('node:test');
const assert = require('node:assert');

test('mock function', () => {
  const fn = mock.fn();
  
  fn('hello');
  fn('world');
  
  assert.strictEqual(fn.mock.callCount(), 2);
  assert.deepStrictEqual(fn.mock.calls[0].arguments, ['hello']);
  assert.deepStrictEqual(fn.mock.calls[1].arguments, ['world']);
});

test('mock with implementation', () => {
  const fn = mock.fn(x => x * 2);
  
  assert.strictEqual(fn(5), 10);
  assert.strictEqual(fn.mock.callCount(), 1);
});

test('mock return values', () => {
  const fn = mock.fn();
  
  fn.mock.mockImplementation(() => 42);
  assert.strictEqual(fn(), 42);
  
  fn.mock.mockImplementationOnce(() => 100);
  assert.strictEqual(fn(), 100);  // Once
  assert.strictEqual(fn(), 42);   // Back to default
});
```

### Spying on Methods

```javascript
const { test, mock } = require('node:test');

test('spy on method', () => {
  const obj = {
    method(x) { return x + 1; }
  };
  
  const spy = mock.method(obj, 'method');
  
  obj.method(5);
  
  assert.strictEqual(spy.mock.callCount(), 1);
  assert.deepStrictEqual(spy.mock.calls[0].arguments, [5]);
});

test('mock method implementation', () => {
  const obj = {
    getData() { return 'real data'; }
  };
  
  mock.method(obj, 'getData', () => 'mocked data');
  
  assert.strictEqual(obj.getData(), 'mocked data');
});
```

### Mocking Timers

```javascript
const { test, mock } = require('node:test');

test('mock timers', () => {
  mock.timers.enable(['setTimeout']);
  
  let called = false;
  setTimeout(() => { called = true; }, 1000);
  
  assert.strictEqual(called, false);
  
  mock.timers.tick(500);
  assert.strictEqual(called, false);
  
  mock.timers.tick(500);
  assert.strictEqual(called, true);
  
  mock.timers.reset();
});

test('mock Date', () => {
  mock.timers.enable({ apis: ['Date'], now: new Date('2024-01-01') });
  
  assert.strictEqual(new Date().getFullYear(), 2024);
  
  mock.timers.reset();
});
```

### Module Mocking

```javascript
const { test, mock } = require('node:test');

test('mock module', async t => {
  // Mock before importing
  mock.module('fs', {
    namedExports: {
      readFile: mock.fn(() => Promise.resolve('mocked content'))
    }
  });
  
  const fs = require('fs');
  const content = await fs.readFile('test.txt');
  
  assert.strictEqual(content, 'mocked content');
  
  mock.reset();
});
```

---

## 22.8 Snapshots

```javascript
const { test, snapshot } = require('node:test');

test('snapshot testing', t => {
  const data = {
    users: ['Alice', 'Bob'],
    count: 2
  };
  
  // First run: creates snapshot
  // Subsequent runs: compares against snapshot
  t.assert.snapshot(data);
});

// Update snapshots with --test-update-snapshots flag
```

---

## 22.9 Code Coverage

```bash
# Run tests with coverage
node --test --experimental-test-coverage

# Output coverage to file
node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=coverage.lcov
```

```javascript
// Access coverage in test
test('check coverage', async t => {
  // Coverage info available after tests complete
});
```

---

## 22.10 Running Tests

### CLI

```bash
# Run all tests
node --test

# Run specific file
node --test test/unit.test.js

# Run with glob pattern
node --test 'test/**/*.test.js'

# Watch mode
node --test --watch

# Concurrent tests
node --test --test-concurrency=4

# Run only tests marked with { only: true }
node --test --test-only

# Test sharding
node --test --test-shard=1/3   # Run 1st of 3 shards
node --test --test-shard=2/3   # Run 2nd of 3 shards

# Timeout
node --test --test-timeout=5000

# Reporter
node --test --test-reporter=spec
node --test --test-reporter=tap
node --test --test-reporter=dot
```

### File Naming

Test files are auto-discovered:
- `**/*.test.{js,mjs,cjs}`
- `**/*-test.{js,mjs,cjs}`
- `**/*_test.{js,mjs,cjs}`
- `**/test-*.{js,mjs,cjs}`
- `**/test/*.{js,mjs,cjs}`
- `**/tests/*.{js,mjs,cjs}`

---

## 22.11 Reporters

### Built-in Reporters

```bash
node --test --test-reporter=spec     # Hierarchical output
node --test --test-reporter=tap      # TAP format
node --test --test-reporter=dot      # Dot output
node --test --test-reporter=junit    # JUnit XML
node --test --test-reporter=lcov     # Coverage LCOV
```

### Custom Reporter

```javascript
// custom-reporter.js
module.exports = async function* customReporter(source) {
  for await (const event of source) {
    switch (event.type) {
      case 'test:start':
        yield `Starting: ${event.data.name}\n`;
        break;
      case 'test:pass':
        yield `✓ ${event.data.name}\n`;
        break;
      case 'test:fail':
        yield `✗ ${event.data.name}\n`;
        yield `  ${event.data.details.error.message}\n`;
        break;
    }
  }
};
```

```bash
node --test --test-reporter=./custom-reporter.js
```

---

## 22.12 Common Patterns

### Testing Async Functions

```javascript
test('async function success', async () => {
  const result = await asyncFunction();
  assert.strictEqual(result, 'expected');
});

test('async function throws', async () => {
  await assert.rejects(
    async () => await failingAsyncFunction(),
    { name: 'Error', message: 'Expected error' }
  );
});
```

### Testing Events

```javascript
const { test, mock } = require('node:test');
const EventEmitter = require('events');

test('event emission', () => {
  const emitter = new EventEmitter();
  const handler = mock.fn();
  
  emitter.on('data', handler);
  emitter.emit('data', { value: 42 });
  
  assert.strictEqual(handler.mock.callCount(), 1);
  assert.deepStrictEqual(handler.mock.calls[0].arguments, [{ value: 42 }]);
});
```

### Testing with Cleanup

```javascript
test('test with cleanup', async t => {
  const resource = await acquireResource();
  
  t.after(async () => {
    await resource.release();
  });
  
  // Test using resource
  assert.ok(resource.isActive);
});
```

### Testing HTTP Server

```javascript
const http = require('http');
const { test, describe, before, after } = require('node:test');

describe('HTTP Server', () => {
  let server;
  let baseUrl;
  
  before(async () => {
    server = http.createServer((req, res) => {
      res.end('OK');
    });
    
    await new Promise(resolve => {
      server.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });
  
  after(() => server.close());
  
  test('GET /', async () => {
    const response = await fetch(baseUrl);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(await response.text(), 'OK');
  });
});
```

---

## 22.13 Summary

| Function | Description |
|----------|-------------|
| `test(name, fn)` | Create test |
| `describe(name, fn)` | Group tests |
| `it(name, fn)` | Alias for test in describe |
| `before(fn)` | Run once before tests |
| `after(fn)` | Run once after tests |
| `beforeEach(fn)` | Run before each test |
| `afterEach(fn)` | Run after each test |

| Test Options | Description |
|--------------|-------------|
| `timeout` | Max test duration |
| `skip` | Skip test |
| `todo` | Mark as TODO |
| `only` | Run only this test |
| `concurrency` | Parallel subtests |

| Mock API | Description |
|----------|-------------|
| `mock.fn()` | Create mock function |
| `mock.method()` | Mock object method |
| `mock.module()` | Mock module |
| `mock.timers.enable()` | Mock timers |
| `mock.reset()` | Reset all mocks |

| CLI Flags | Description |
|-----------|-------------|
| `--test` | Run tests |
| `--test-only` | Run only { only: true } |
| `--test-watch` | Watch mode |
| `--test-reporter` | Output format |
| `--experimental-test-coverage` | Enable coverage |

---

**End of Module 22: Test Runner**

Next: **Module 23 — NPM and Package Management**
# Module 23: NPM and Package Management

NPM (Node Package Manager) is the world's largest software registry and the default package manager for Node.js. This module covers package management, publishing, and best practices.

---

## 23.1 NPM Basics

### Initialization

```bash
# Initialize new project
npm init

# Initialize with defaults
npm init -y

# Initialize with scope
npm init --scope=@myorg
```

### Installing Packages

```bash
# Install dependencies from package.json
npm install
npm i

# Install specific package
npm install express

# Install specific version
npm install express@4.18.2
npm install express@^4.0.0  # Compatible with 4.x
npm install express@~4.18.0 # Compatible with 4.18.x

# Install as dev dependency
npm install --save-dev jest
npm install -D jest

# Install globally
npm install -g typescript

# Install from GitHub
npm install github:user/repo
npm install github:user/repo#branch

# Install from URL
npm install https://github.com/user/repo/tarball/master
```

### Uninstalling Packages

```bash
npm uninstall express
npm uninstall -D jest
npm uninstall -g typescript
```

### Updating Packages

```bash
# Check outdated
npm outdated

# Update to latest compatible
npm update
npm update express

# Update to absolute latest (may break)
npm install express@latest

# Interactive update
npx npm-check-updates -i
```

---

## 23.2 package.json

### Essential Fields

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "A sample package",
  "main": "index.js",
  "module": "index.mjs",
  "types": "index.d.ts",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs",
      "types": "./index.d.ts"
    },
    "./utils": {
      "import": "./utils.mjs",
      "require": "./utils.cjs"
    }
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "build": "tsc",
    "lint": "eslint .",
    "prepare": "husky install"
  },
  "keywords": ["nodejs", "example"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },
  "bugs": {
    "url": "https://github.com/user/repo/issues"
  },
  "homepage": "https://github.com/user/repo#readme",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  }
}
```

### Version Ranges

```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exactly 1.2.3
    "caret": "^1.2.3",          // >=1.2.3 <2.0.0
    "tilde": "~1.2.3",          // >=1.2.3 <1.3.0
    "range": ">=1.0.0 <2.0.0",  // Range
    "or": "1.0.0 || 2.0.0",     // Either version
    "latest": "*",               // Latest (dangerous!)
    "tag": "latest",             // Dist tag
    "git": "github:user/repo",   // Git repo
    "file": "file:../local-pkg"  // Local path
  }
}
```

### Scripts

```json
{
  "scripts": {
    "preinstall": "echo 'Before install'",
    "install": "node-gyp rebuild",
    "postinstall": "echo 'After install'",
    
    "prepublishOnly": "npm test && npm run build",
    "prepare": "husky install",
    
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "npm run coverage",
    
    "start": "node server.js",
    "dev": "NODE_ENV=development nodemon server.js",
    "build": "npm run clean && tsc",
    "clean": "rm -rf dist",
    
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write ."
  }
}
```

---

## 23.3 NPM Scripts

### Running Scripts

```bash
# Run script
npm run test
npm run build

# Shortcuts
npm test       # npm run test
npm start      # npm run start

# With arguments
npm run build -- --watch

# Run multiple scripts
npm run lint && npm run test

# Silent mode
npm run test -s
npm run test --silent

# Show script output
npm run test --loglevel verbose
```

### Environment Variables

```javascript
// Access npm_package_* variables
console.log(process.env.npm_package_name);
console.log(process.env.npm_package_version);

// Custom env in scripts
// package.json
{
  "scripts": {
    "dev": "NODE_ENV=development node server.js"
  }
}

// Cross-platform (use cross-env package)
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development node server.js"
  }
}
```

---

## 23.4 package-lock.json

### Purpose

```json
// Locks exact versions for reproducible builds
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "accepts": "~1.3.8",
        "...": "..."
      }
    }
  }
}
```

### Commands

```bash
# Install from lock file (CI)
npm ci

# Update lock file without updating node_modules
npm install --package-lock-only

# Verify integrity
npm audit signatures
```

---

## 23.5 Workspaces (Monorepos)

### Configuration

```json
// root package.json
{
  "name": "monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### Workspace Commands

```bash
# Install all workspaces
npm install

# Run script in specific workspace
npm run build -w @myorg/package-a
npm run build --workspace=packages/core

# Run script in all workspaces
npm run test --workspaces
npm run test -ws

# Add dependency to workspace
npm install lodash -w @myorg/package-a

# List workspaces
npm query .workspace
```

---

## 23.6 Publishing Packages

### Prepare for Publishing

```json
{
  "name": "@myorg/my-package",
  "version": "1.0.0",
  "files": [
    "dist",
    "README.md"
  ],
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### Publishing Commands

```bash
# Login to npm
npm login

# Check what will be published
npm pack --dry-run

# Publish
npm publish

# Publish scoped package publicly
npm publish --access public

# Publish with tag
npm publish --tag beta

# Version bump
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Deprecate version
npm deprecate my-package@1.0.0 "Use v2 instead"

# Unpublish (within 72 hours)
npm unpublish my-package@1.0.0
```

---

## 23.7 Security

### Audit

```bash
# Check for vulnerabilities
npm audit

# Get JSON output
npm audit --json

# Fix automatically
npm audit fix

# Force fix (may break)
npm audit fix --force

# Audit with production only
npm audit --omit=dev
```

### Best Practices

```json
{
  "scripts": {
    "preinstall": "npx only-allow npm",
    "prepare": "husky install"
  },
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}
```

---

## 23.8 Private Registry

### .npmrc Configuration

```ini
# ~/.npmrc or project .npmrc

# Default registry
registry=https://registry.npmjs.org/

# Scoped registry
@myorg:registry=https://npm.pkg.github.com/

# Auth token
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}

# Always authenticate
always-auth=true

# Other settings
save-exact=true
package-lock=true
engine-strict=true
```

### GitHub Packages

```json
{
  "name": "@username/package",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  }
}
```

---

## 23.9 Useful Commands

```bash
# Info about package
npm info express
npm view express versions

# Search packages
npm search express

# List installed packages
npm list
npm list --depth=0
npm list -g --depth=0

# Why is package installed
npm explain express
npm why express

# Link local package
npm link ../my-local-package
npm link my-local-package

# Unlink
npm unlink my-local-package

# Clean cache
npm cache clean --force

# Check npm config
npm config list
npm config get registry

# Run package without installing
npx create-react-app my-app
npx cowsay "Hello"

# Open package page
npm home express
npm repo express
npm docs express
```

---

## 23.10 Alternative Package Managers

### Yarn

```bash
yarn init
yarn add express
yarn add -D jest
yarn remove express
yarn
yarn install --frozen-lockfile  # Like npm ci
```

### pnpm

```bash
pnpm init
pnpm add express
pnpm add -D jest
pnpm remove express
pnpm install
pnpm install --frozen-lockfile
```

### Comparison

| Feature | npm | Yarn | pnpm |
|---------|-----|------|------|
| Lock file | package-lock.json | yarn.lock | pnpm-lock.yaml |
| Speed | Moderate | Fast | Fastest |
| Disk usage | High | High | Low (links) |
| Workspaces | Yes | Yes | Yes |
| PnP | No | Yes | No |

---

## 23.11 Common Issues

### Peer Dependency Conflicts

```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# Force install
npm install --force

# Override in package.json
{
  "overrides": {
    "react": "^18.0.0"
  }
}
```

### Permission Errors

```bash
# Fix npm permissions (Linux/Mac)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use nvm for Node version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Cache Issues

```bash
# Clean cache
npm cache clean --force

# Verify cache
npm cache verify

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 23.12 Summary

| Command | Description |
|---------|-------------|
| `npm init` | Initialize project |
| `npm install` | Install dependencies |
| `npm install pkg` | Install package |
| `npm install -D pkg` | Install as devDependency |
| `npm install -g pkg` | Install globally |
| `npm uninstall pkg` | Remove package |
| `npm update` | Update packages |
| `npm outdated` | Check for updates |
| `npm run script` | Run script |
| `npm test` | Run test script |
| `npm start` | Run start script |
| `npm publish` | Publish package |
| `npm version` | Bump version |
| `npm audit` | Security audit |
| `npm ci` | Clean install (CI) |
| `npx` | Run package without install |

| package.json Field | Description |
|--------------------|-------------|
| `dependencies` | Production dependencies |
| `devDependencies` | Development only |
| `peerDependencies` | Required by consumer |
| `optionalDependencies` | Optional packages |
| `scripts` | NPM scripts |
| `engines` | Node version requirement |
| `workspaces` | Monorepo packages |
| `files` | Files to publish |

---

**End of Module 23: NPM and Package Management**

Next: **Module 24 — Advanced Concepts** (Error handling, debugging, security)
# Module 24: Advanced Concepts

This module covers essential advanced topics: error handling patterns, debugging techniques, security best practices, performance optimization, and deployment considerations.

---

## 24.1 Error Handling

### Error Types

```javascript
// Built-in error types
new Error('Generic error');
new TypeError('Type error');
new RangeError('Range error');
new ReferenceError('Reference error');
new SyntaxError('Syntax error');

// System errors (from libuv/OS)
// ENOENT, EACCES, ECONNREFUSED, etc.

// Custom errors
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Error.captureStackTrace(this, ValidationError);
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.resource = resource;
    this.id = id;
  }
}
```

### Sync Error Handling

```javascript
// Try-catch for synchronous code
try {
  const data = JSON.parse(invalidJson);
} catch (err) {
  console.error('Parse error:', err.message);
}

// Don't catch what you can't handle
function readConfig(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};  // Return default
    }
    throw err;  // Re-throw unexpected errors
  }
}
```

### Async Error Handling

```javascript
// Promises
fetchData()
  .then(data => process(data))
  .catch(err => {
    console.error('Error:', err.message);
  })
  .finally(() => {
    cleanup();
  });

// Async/await
async function processData() {
  try {
    const data = await fetchData();
    return await transform(data);
  } catch (err) {
    // Handle or rethrow
    if (err instanceof NetworkError) {
      return getCachedData();
    }
    throw err;
  }
}

// Error-first callbacks
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('Read error:', err);
    return;
  }
  console.log(data);
});
```

### Global Error Handlers

```javascript
// Uncaught exceptions (sync errors not caught)
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err);
  console.error('Origin:', origin);
  
  // Log error, notify monitoring
  logger.fatal(err);
  
  // Exit - state may be corrupted
  process.exit(1);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  
  // Log but don't exit by default (configurable)
  logger.error(reason);
});

// Make unhandled rejections exit
process.on('unhandledRejection', err => {
  throw err;  // Will trigger uncaughtException
});
```

### Express Error Handling

```javascript
// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Async wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }
  res.json(user);
}));
```

---

## 24.2 Debugging

### Console Methods

```javascript
console.log('Basic log');
console.error('Error');
console.warn('Warning');
console.info('Info');

// Timing
console.time('operation');
// ... do work
console.timeEnd('operation');  // operation: 123.456ms

// Count
for (let i = 0; i < 3; i++) {
  console.count('loop');
}
// loop: 1, loop: 2, loop: 3

// Table
console.table([{ a: 1, b: 2 }, { a: 3, b: 4 }]);

// Trace
console.trace('Stack trace');

// Group
console.group('Group');
console.log('Grouped content');
console.groupEnd();

// Assert
console.assert(1 === 2, 'This will print');
```

### Node Inspector

```bash
# Start with inspector
node --inspect server.js
node --inspect-brk server.js  # Break at start

# Connect via Chrome
# Open chrome://inspect
# Or visit: http://localhost:9229/json

# Specific port
node --inspect=9230 server.js
```

### debugger Statement

```javascript
function problematicFunction(data) {
  debugger;  // Breakpoint when inspector attached
  return processData(data);
}
```

### Debug Module

```javascript
const debug = require('debug');

const dbDebug = debug('app:db');
const httpDebug = debug('app:http');

dbDebug('Connecting to database...');
httpDebug('Request received: %s %s', req.method, req.url);

// Enable via environment variable
// DEBUG=app:* node server.js
// DEBUG=app:db,app:http node server.js
```

### Memory Debugging

```javascript
// Heap snapshot
const v8 = require('v8');
v8.writeHeapSnapshot();  // Creates .heapsnapshot file

// Memory usage
console.log(process.memoryUsage());
// {
//   rss: 50331648,
//   heapTotal: 10485760,
//   heapUsed: 5242880,
//   external: 262144,
//   arrayBuffers: 131072
// }

// Force garbage collection (requires --expose-gc flag)
if (global.gc) {
  global.gc();
}
```

### CPU Profiling

```javascript
const inspector = require('inspector');
const session = new inspector.Session();
session.connect();

// Start profiling
session.post('Profiler.enable', () => {
  session.post('Profiler.start', () => {
    // Run code to profile
    
    session.post('Profiler.stop', (err, { profile }) => {
      fs.writeFileSync('profile.cpuprofile', JSON.stringify(profile));
    });
  });
});
```

---

## 24.3 Security

### Input Validation

```javascript
// ❌ Never trust user input
const userId = req.params.id;
db.query(`SELECT * FROM users WHERE id = ${userId}`);  // SQL injection!

// ✅ Use parameterized queries
db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ✅ Validate and sanitize
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  age: Joi.number().integer().min(0).max(150)
});

const { error, value } = userSchema.validate(req.body);
if (error) {
  throw new ValidationError(error.message);
}
```

### Path Traversal Prevention

```javascript
const path = require('path');

// ❌ Vulnerable
app.get('/files/:name', (req, res) => {
  res.sendFile(req.params.name);  // Can access ../../../etc/passwd
});

// ✅ Safe
app.get('/files/:name', (req, res) => {
  const baseDir = path.resolve('./uploads');
  const filePath = path.resolve(baseDir, req.params.name);
  
  if (!filePath.startsWith(baseDir)) {
    return res.status(403).send('Forbidden');
  }
  
  res.sendFile(filePath);
});
```

### Command Injection Prevention

```javascript
const { execFile, spawn } = require('child_process');

// ❌ Vulnerable
exec(`convert ${userInput} output.png`);

// ✅ Use execFile or spawn with arguments
execFile('convert', [userInput, 'output.png']);
spawn('convert', [userInput, 'output.png']);
```

### Secure Headers

```javascript
const helmet = require('helmet');
app.use(helmet());

// Or manually
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

### Environment Variables

```javascript
// ❌ Never commit secrets
const password = 'supersecret123';

// ✅ Use environment variables
const password = process.env.DB_PASSWORD;

// ✅ Use .env files (not committed)
require('dotenv').config();

// ✅ Validate required env vars
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const dbPassword = requireEnv('DB_PASSWORD');
```

---

## 24.4 Performance

### Profiling and Monitoring

```javascript
// Performance hooks
const { performance, PerformanceObserver } = require('perf_hooks');

performance.mark('start');
// ... operation
performance.mark('end');
performance.measure('operation', 'start', 'end');

// Event loop monitoring
const { monitorEventLoopDelay } = require('perf_hooks');
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  console.log(`Event loop delay: min=${histogram.min}, max=${histogram.max}, mean=${histogram.mean}`);
}, 5000);
```

### Caching

```javascript
// In-memory cache
const cache = new Map();

async function getCachedData(key, fetcher, ttl = 60000) {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, expiry: Date.now() + ttl });
  return data;
}

// LRU Cache
const LRU = require('lru-cache');
const cache = new LRU({ max: 500, ttl: 1000 * 60 * 5 });
```

### Database Optimization

```javascript
// Connection pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb'
});

// Query optimization
// ❌ N+1 queries
for (const user of users) {
  const orders = await getOrders(user.id);
}

// ✅ Batch query
const orders = await getOrdersForUsers(users.map(u => u.id));
```

### Clustering

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  require('./server');
}
```

### Compression

```javascript
const compression = require('compression');
app.use(compression());
```

---

## 24.5 Testing

### Unit Testing

```javascript
const { test, describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

describe('Calculator', () => {
  let calc;
  
  beforeEach(() => {
    calc = new Calculator();
  });
  
  it('should add numbers', () => {
    assert.strictEqual(calc.add(2, 3), 5);
  });
  
  it('should throw on invalid input', () => {
    assert.throws(() => calc.add('a', 'b'), TypeError);
  });
});
```

### Integration Testing

```javascript
const request = require('supertest');
const app = require('./app');

describe('API', () => {
  it('GET /users returns users', async () => {
    const res = await request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200);
    
    assert(Array.isArray(res.body));
  });
  
  it('POST /users creates user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Test', email: 'test@test.com' })
      .expect(201);
    
    assert.strictEqual(res.body.name, 'Test');
  });
});
```

---

## 24.6 Logging

### Structured Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: 123, ip: req.ip });
logger.error('Database error', { error: err.message, stack: err.stack });
```

### Request Logging

```javascript
const morgan = require('morgan');

// Development
app.use(morgan('dev'));

// Production
app.use(morgan('combined'));

// Custom format
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
```

---

## 24.7 Summary

| Error Handling | Description |
|----------------|-------------|
| `try/catch` | Sync error handling |
| `.catch()` | Promise error handling |
| `async/await` + `try/catch` | Async error handling |
| `uncaughtException` | Global sync error handler |
| `unhandledRejection` | Global async error handler |

| Security Practice | Description |
|-------------------|-------------|
| Input validation | Validate all user input |
| Parameterized queries | Prevent SQL injection |
| Path validation | Prevent path traversal |
| Rate limiting | Prevent abuse |
| Secure headers | Use helmet middleware |
| Environment variables | Don't commit secrets |

| Debugging Tool | Usage |
|----------------|-------|
| `--inspect` | Enable inspector |
| `--inspect-brk` | Break at start |
| `debugger` | Breakpoint in code |
| `debug` module | Selective logging |
| Heap snapshot | Memory analysis |
| CPU profiling | Performance analysis |

| Performance | Technique |
|-------------|-----------|
| Clustering | Multi-core utilization |
| Caching | Reduce repeated work |
| Connection pooling | Efficient DB connections |
| Compression | Reduce transfer size |
| Streaming | Handle large data |

---

**End of Module 24: Advanced Concepts**

Next: **Module 25 — Ecosystem** (Frameworks, databases, and tools)
# Module 25: Ecosystem

The Node.js ecosystem is vast and mature. This module provides an overview of popular frameworks, databases, tools, and libraries commonly used in production applications.

---

## 25.1 Web Frameworks

### Express.js

The most popular Node.js web framework.

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000);
```

### Fastify

High-performance alternative to Express.

```javascript
const fastify = require('fastify')({ logger: true });

// Schema validation built-in
fastify.post('/api/users', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }
    }
  }
}, async (request, reply) => {
  const user = await createUser(request.body);
  return user;
});

await fastify.listen({ port: 3000 });
```

### NestJS

TypeScript-first framework with Angular-like architecture.

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  
  @Post()
  @HttpCode(201)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
```

### Koa

Minimalist framework by Express creators.

```javascript
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = await getUsers();
});

app.use(router.routes());
app.listen(3000);
```

---

## 25.2 Databases

### SQL - PostgreSQL with Prisma

```javascript
// schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

// Usage
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  include: { posts: true }
});

const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' }
});
```

### SQL - Sequelize

```javascript
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://user:pass@localhost:5432/db');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true }
});

await sequelize.sync();
const users = await User.findAll();
```

### MongoDB with Mongoose

```javascript
const mongoose = require('mongoose');

await mongoose.connect('mongodb://localhost/mydb');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const user = await User.create({ name: 'Alice', email: 'alice@example.com' });
const users = await User.find({ name: /alice/i });
```

### Redis

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');

// With expiration
await redis.set('session', 'data', 'EX', 3600);

// Pub/sub
const sub = new Redis();
sub.subscribe('channel');
sub.on('message', (channel, message) => {
  console.log(`${channel}: ${message}`);
});

const pub = new Redis();
await pub.publish('channel', 'Hello');
```

---

## 25.3 Authentication

### Passport.js

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;

// Local strategy
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user || !await user.verifyPassword(password)) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// JWT strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Usage
app.post('/login', passport.authenticate('local'), (req, res) => {
  const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET);
  res.json({ token });
});

app.get('/protected', passport.authenticate('jwt'), (req, res) => {
  res.json({ user: req.user });
});
```

### bcrypt

```javascript
const bcrypt = require('bcrypt');

// Hash password
const saltRounds = 10;
const hash = await bcrypt.hash('password123', saltRounds);

// Verify password
const match = await bcrypt.compare('password123', hash);
```

### JWT

```javascript
const jwt = require('jsonwebtoken');

// Create token
const token = jwt.sign(
  { userId: 123, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verify token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded.userId);  // 123
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    console.log('Token expired');
  }
}
```

---

## 25.4 Real-Time Communication

### Socket.IO

```javascript
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (room) => {
    socket.join(room);
  });
  
  socket.on('message', (data) => {
    io.to(data.room).emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Client
const socket = io();
socket.emit('join', 'room1');
socket.emit('message', { room: 'room1', text: 'Hello!' });
socket.on('message', (data) => console.log(data));
```

### WebSocket (ws)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
```

---

## 25.5 Task Queues

### Bull

```javascript
const Queue = require('bull');

const emailQueue = new Queue('email', 'redis://localhost:6379');

// Producer
await emailQueue.add({
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Hello!'
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
});

// Consumer
emailQueue.process(async (job) => {
  await sendEmail(job.data);
  return { sent: true };
});

emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

### Agenda

```javascript
const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: 'mongodb://localhost/agenda' } });

agenda.define('send email', async (job) => {
  await sendEmail(job.attrs.data);
});

await agenda.start();

// Schedule job
await agenda.schedule('in 5 minutes', 'send email', { to: 'user@example.com' });

// Recurring job
await agenda.every('1 hour', 'send report');
```

---

## 25.6 File Uploads

### Multer

```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ file: req.file });
});

app.post('/upload-multiple', upload.array('images', 5), (req, res) => {
  res.json({ files: req.files });
});
```

---

## 25.7 Email

### Nodemailer

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: '"App" <noreply@example.com>',
  to: 'user@example.com',
  subject: 'Welcome',
  text: 'Hello, welcome to our app!',
  html: '<h1>Hello</h1><p>Welcome to our app!</p>'
});
```

---

## 25.8 HTTP Clients

### Axios

```javascript
const axios = require('axios');

// GET
const response = await axios.get('https://api.example.com/users');
console.log(response.data);

// POST
const { data } = await axios.post('https://api.example.com/users', {
  name: 'Alice',
  email: 'alice@example.com'
});

// With config
const client = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: { 'Authorization': `Bearer ${token}` }
});

// Interceptors
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### node-fetch

```javascript
const fetch = require('node-fetch');

const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
});

const data = await response.json();
```

---

## 25.9 Validation

### Joi

```javascript
const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{8,30}$/).required(),
  age: Joi.number().integer().min(0).max(150)
});

const { error, value } = schema.validate(req.body);
if (error) {
  throw new ValidationError(error.details[0].message);
}
```

### Zod (TypeScript-first)

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional()
});

type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(req.body);  // Throws if invalid
const result = UserSchema.safeParse(req.body);  // Returns { success, data/error }
```

---

## 25.10 Process Management

### PM2

```bash
# Install
npm install -g pm2

# Start app
pm2 start app.js
pm2 start app.js --name "my-app" -i max  # Cluster mode

# Manage
pm2 list
pm2 logs
pm2 monit
pm2 restart all
pm2 stop all
pm2 delete all

# Config file (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 25.11 Summary

| Category | Popular Choices |
|----------|-----------------|
| **Web Frameworks** | Express, Fastify, NestJS, Koa |
| **ORM/ODM** | Prisma, Sequelize, TypeORM, Mongoose |
| **Databases** | PostgreSQL, MySQL, MongoDB, Redis |
| **Authentication** | Passport.js, JWT, bcrypt |
| **Real-Time** | Socket.IO, ws |
| **Task Queues** | Bull, Agenda, BullMQ |
| **File Upload** | Multer, Formidable |
| **Email** | Nodemailer |
| **HTTP Client** | Axios, node-fetch, got |
| **Validation** | Joi, Zod, Yup |
| **Logging** | Winston, Pino, Bunyan |
| **Testing** | Jest, Mocha, Vitest |
| **Process Manager** | PM2, Forever |
| **API Documentation** | Swagger, OpenAPI |
| **GraphQL** | Apollo, GraphQL Yoga |

---

**End of Module 25: Ecosystem**

This completes the Node.js section of the JavaScript Mastery Guide.
