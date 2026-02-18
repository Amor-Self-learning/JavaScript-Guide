# JavaScript Deep Dive: Atomics and SharedArrayBuffer

## Table of Contents

- [19.1 SharedArrayBuffer](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#191-sharedarraybuffer)
- [19.2 Atomics](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#192-atomics)

---

## 19.1 SharedArrayBuffer

SharedArrayBuffer allows multiple workers to share the same memory, enabling true multi-threading in JavaScript.

### Creating Shared Memory

SharedArrayBuffer creates a fixed-length raw binary buffer that can be shared between workers.

**Basic Creation:**

```javascript
// Create a shared buffer of 1024 bytes
const sharedBuffer = new SharedArrayBuffer(1024);

console.log(sharedBuffer.byteLength); // 1024
console.log(sharedBuffer instanceof SharedArrayBuffer); // true

// Create a view on the shared buffer
const sharedArray = new Int32Array(sharedBuffer);

console.log(sharedArray.length); // 256 (1024 bytes / 4 bytes per Int32)
console.log(sharedArray.buffer === sharedBuffer); // true

// Write to shared memory
sharedArray[0] = 42;
sharedArray[1] = 100;

console.log(sharedArray[0]); // 42
```

**Different Typed Array Views:**

```javascript
// Create 1KB shared buffer
const sab = new SharedArrayBuffer(1024);

// Different views on the same memory
const int8View = new Int8Array(sab);      // 1024 elements (1 byte each)
const int16View = new Int16Array(sab);    // 512 elements (2 bytes each)
const int32View = new Int32Array(sab);    // 256 elements (4 bytes each)
const uint8View = new Uint8Array(sab);    // 1024 elements (1 byte each)
const float32View = new Float32Array(sab); // 256 elements (4 bytes each)
const float64View = new Float64Array(sab); // 128 elements (8 bytes each)

// Writing to one view affects others (same memory)
int32View[0] = 0x12345678;

console.log(int32View[0].toString(16)); // 12345678
console.log(int8View[0].toString(16));  // 78 (least significant byte)
console.log(int8View[1].toString(16));  // 56
console.log(int8View[2].toString(16));  // 34
console.log(int8View[3].toString(16));  // 12 (most significant byte)
```

**Memory Layout:**

```javascript
const sab = new SharedArrayBuffer(16);
const view = new Int32Array(sab);

// Memory layout visualization
// Byte offset: 0  1  2  3  | 4  5  6  7  | 8  9  10 11 | 12 13 14 15
// Int32[0]:   [  value 0  ] [  value 1  ] [  value 2  ] [  value 3  ]

view[0] = 100;  // Bytes 0-3
view[1] = 200;  // Bytes 4-7
view[2] = 300;  // Bytes 8-11
view[3] = 400;  // Bytes 12-15

// Accessing as bytes
const byteView = new Uint8Array(sab);
console.log('Bytes:', Array.from(byteView));
```

**Structured Data in Shared Memory:**

```javascript
// Define a structure layout
class SharedStruct {
  constructor(sab, offset = 0) {
    this.buffer = sab;
    this.offset = offset;
    
    // Layout: | id (4 bytes) | x (4 bytes) | y (4 bytes) | flags (4 bytes) |
    this.view = new Int32Array(sab, offset, 4);
  }
  
  get id() { return this.view[0]; }
  set id(value) { this.view[0] = value; }
  
  get x() { return this.view[1]; }
  set x(value) { this.view[1] = value; }
  
  get y() { return this.view[2]; }
  set y(value) { this.view[2] = value; }
  
  get flags() { return this.view[3]; }
  set flags(value) { this.view[3] = value; }
  
  static SIZE = 16; // 4 integers × 4 bytes
}

// Create shared buffer for multiple structs
const sab = new SharedArrayBuffer(SharedStruct.SIZE * 10);

// Create instances pointing to different offsets
const struct1 = new SharedStruct(sab, 0);
const struct2 = new SharedStruct(sab, SharedStruct.SIZE);

struct1.id = 1;
struct1.x = 100;
struct1.y = 200;

struct2.id = 2;
struct2.x = 300;
struct2.y = 400;

console.log('Struct 1:', struct1.id, struct1.x, struct1.y);
console.log('Struct 2:', struct2.id, struct2.x, struct2.y);
```

### Sharing Between Workers

SharedArrayBuffer can be passed between the main thread and workers, allowing them to share memory.

**Main Thread:**

```javascript
// main.js

// Create shared buffer
const sharedBuffer = new SharedArrayBuffer(1024);
const sharedArray = new Int32Array(sharedBuffer);

// Initialize some values
sharedArray[0] = 0; // Counter
sharedArray[1] = 0; // Flag

// Create worker
const worker = new Worker('worker.js');

// Send shared buffer to worker
worker.postMessage({
  type: 'init',
  sharedBuffer: sharedBuffer
});

// Listen for messages from worker
worker.addEventListener('message', (event) => {
  if (event.data.type === 'result') {
    console.log('Worker result:', event.data.value);
  }
});

// Main thread can also modify shared memory
setInterval(() => {
  const counter = sharedArray[0];
  console.log('Main thread sees counter:', counter);
}, 1000);
```

**Worker Thread:**

```javascript
// worker.js

let sharedArray;

self.addEventListener('message', (event) => {
  if (event.data.type === 'init') {
    // Receive shared buffer
    const sharedBuffer = event.data.sharedBuffer;
    sharedArray = new Int32Array(sharedBuffer);
    
    console.log('Worker received shared buffer');
    
    // Start incrementing counter
    setInterval(() => {
      // Atomically increment counter
      const oldValue = Atomics.add(sharedArray, 0, 1);
      
      console.log('Worker incremented counter from', oldValue, 'to', oldValue + 1);
    }, 500);
  }
});
```

**Producer-Consumer Pattern:**

```javascript
// main.js - Producer

const BUFFER_SIZE = 10;
const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * (BUFFER_SIZE + 2));
const sharedArray = new Int32Array(sab);

// Layout: [writeIndex, readIndex, ...buffer]
const WRITE_INDEX = 0;
const READ_INDEX = 1;
const BUFFER_START = 2;

// Initialize
sharedArray[WRITE_INDEX] = 0;
sharedArray[READ_INDEX] = 0;

const worker = new Worker('consumer-worker.js');
worker.postMessage({ sharedBuffer: sab });

// Producer: Write data to buffer
let produced = 0;
setInterval(() => {
  const writeIdx = Atomics.load(sharedArray, WRITE_INDEX);
  const readIdx = Atomics.load(sharedArray, READ_INDEX);
  
  // Check if buffer is full
  const nextWrite = (writeIdx + 1) % BUFFER_SIZE;
  if (nextWrite === readIdx) {
    console.log('Buffer full, waiting...');
    return;
  }
  
  // Write data
  const value = produced++;
  const bufferIndex = BUFFER_START + writeIdx;
  Atomics.store(sharedArray, bufferIndex, value);
  
  // Update write index
  Atomics.store(sharedArray, WRITE_INDEX, nextWrite);
  
  console.log('Produced:', value);
}, 100);
```

**Consumer Worker:**

```javascript
// consumer-worker.js

const WRITE_INDEX = 0;
const READ_INDEX = 1;
const BUFFER_START = 2;
const BUFFER_SIZE = 10;

let sharedArray;

self.addEventListener('message', (event) => {
  sharedArray = new Int32Array(event.data.sharedBuffer);
  
  // Consumer: Read from buffer
  setInterval(() => {
    const writeIdx = Atomics.load(sharedArray, WRITE_INDEX);
    const readIdx = Atomics.load(sharedArray, READ_INDEX);
    
    // Check if buffer is empty
    if (readIdx === writeIdx) {
      console.log('Buffer empty, waiting...');
      return;
    }
    
    // Read data
    const bufferIndex = BUFFER_START + readIdx;
    const value = Atomics.load(sharedArray, bufferIndex);
    
    // Update read index
    const nextRead = (readIdx + 1) % BUFFER_SIZE;
    Atomics.store(sharedArray, READ_INDEX, nextRead);
    
    console.log('Consumed:', value);
  }, 150);
});
```

### Security Considerations (COOP/COEP Headers)

SharedArrayBuffer requires specific HTTP headers due to security concerns (Spectre vulnerability).

**Required Headers:**

```javascript
// Server must send these headers:

// Cross-Origin-Opener-Policy (COOP)
// Isolates the browsing context
'Cross-Origin-Opener-Policy': 'same-origin'

// Cross-Origin-Embedder-Policy (COEP)
// Ensures all resources are loaded with CORS or from same origin
'Cross-Origin-Embedder-Policy': 'require-corp'

// Example in Node.js Express:
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.static('public'));

app.listen(3000);
```

**Checking if SharedArrayBuffer is Available:**

```javascript
function checkSharedArrayBufferSupport() {
  if (typeof SharedArrayBuffer === 'undefined') {
    console.error('SharedArrayBuffer is not available');
    console.error('This could be because:');
    console.error('1. The browser does not support it');
    console.error('2. The page is not cross-origin isolated (missing COOP/COEP headers)');
    console.error('3. The feature was disabled due to security concerns');
    return false;
  }
  
  try {
    const sab = new SharedArrayBuffer(4);
    const view = new Int32Array(sab);
    Atomics.add(view, 0, 1);
    return true;
  } catch (e) {
    console.error('SharedArrayBuffer is available but not functional:', e);
    return false;
  }
}

if (checkSharedArrayBufferSupport()) {
  console.log('SharedArrayBuffer is fully supported');
  // Proceed with shared memory code
} else {
  console.log('Falling back to non-shared memory approach');
  // Use MessageChannel or other alternatives
}
```

**Cross-Origin Resource Policy (CORP):**

```javascript
// For resources loaded from different origins,
// they must include CORP header

// Server sending resources:
'Cross-Origin-Resource-Policy': 'cross-origin'

// Or for same-site only:
'Cross-Origin-Resource-Policy': 'same-site'

// Or for same-origin only:
'Cross-Origin-Resource-Policy': 'same-origin'

// Example: Loading images or scripts
// <img src="https://example.com/image.jpg" crossorigin="anonymous">
// The server at example.com must send appropriate CORP header
```

**Feature Detection HTML:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SharedArrayBuffer Test</title>
</head>
<body>
  <h1>SharedArrayBuffer Support Check</h1>
  <div id="status"></div>
  
  <script>
    const statusDiv = document.getElementById('status');
    
    function checkSupport() {
      const results = [];
      
      // Check if SharedArrayBuffer exists
      if (typeof SharedArrayBuffer !== 'undefined') {
        results.push('✓ SharedArrayBuffer is defined');
        
        // Try to create one
        try {
          const sab = new SharedArrayBuffer(8);
          results.push('✓ Can create SharedArrayBuffer');
          
          // Try atomic operations
          try {
            const view = new Int32Array(sab);
            Atomics.add(view, 0, 1);
            results.push('✓ Atomics operations work');
            results.push('<strong>Full support available!</strong>');
          } catch (e) {
            results.push('✗ Atomics failed: ' + e.message);
          }
        } catch (e) {
          results.push('✗ Cannot create SharedArrayBuffer: ' + e.message);
        }
      } else {
        results.push('✗ SharedArrayBuffer is not defined');
        results.push('Page may not be cross-origin isolated');
        results.push('Check COOP and COEP headers');
      }
      
      // Check cross-origin isolation
      if (typeof crossOriginIsolated !== 'undefined') {
        results.push(
          crossOriginIsolated 
            ? '✓ Page is cross-origin isolated' 
            : '✗ Page is NOT cross-origin isolated'
        );
      }
      
      statusDiv.innerHTML = results.join('<br>');
    }
    
    checkSupport();
  </script>
</body>
</html>
```

---

## 19.2 Atomics

Atomics provides atomic operations on SharedArrayBuffer, ensuring thread-safe access to shared memory.

### Atomic Operations

Atomic operations are indivisible - they complete fully or not at all, preventing race conditions.

**Why Atomics are Needed:**

```javascript
// WITHOUT ATOMICS - Race Condition
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 0;

// In Worker 1:
function incrementNonAtomic() {
  const current = view[0];  // Read
  // >>> Context switch can happen here! <<<
  view[0] = current + 1;    // Write
}

// In Worker 2:
function incrementNonAtomic() {
  const current = view[0];  // Read
  // >>> Context switch can happen here! <<<
  view[0] = current + 1;    // Write
}

// Race condition example:
// Worker 1 reads: 0
// Worker 2 reads: 0
// Worker 1 writes: 1
// Worker 2 writes: 1
// Result: 1 (should be 2!)

// WITH ATOMICS - No Race Condition
function incrementAtomic() {
  Atomics.add(view, 0, 1); // Atomic read-modify-write
}

// Both workers increment atomically
// Result: 2 (correct!)
```

**Atomic Operations Overview:**

```javascript
const sab = new SharedArrayBuffer(16);
const view = new Int32Array(sab);

// Initialize
view[0] = 10;
view[1] = 5;
view[2] = 0xFF;

// Atomics provide atomic operations:
// - Add, subtract, and, or, xor
// - Compare and exchange
// - Load and store
// - Wait and notify

console.log('Initial values:', view[0], view[1], view[2]);
```

### `Atomics.add()`, `Atomics.sub()`, `Atomics.and()`, etc.

Atomic arithmetic and bitwise operations.

**`Atomics.add()` - Atomic Addition:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 10;

// Returns old value, stores new value
const oldValue = Atomics.add(view, 0, 5);

console.log('Old value:', oldValue);    // 10
console.log('New value:', view[0]);     // 15

// Multiple workers can safely increment
// main.js
const worker1 = new Worker('worker.js');
const worker2 = new Worker('worker.js');

worker1.postMessage({ sab, iterations: 1000 });
worker2.postMessage({ sab, iterations: 1000 });

// After both workers complete, view[0] will be 10 + 2000 = 2010
```

**`Atomics.sub()` - Atomic Subtraction:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 100;

const oldValue = Atomics.sub(view, 0, 30);

console.log('Old value:', oldValue);    // 100
console.log('New value:', view[0]);     // 70

// Useful for counters, resource tracking
function decrementResource(view, index) {
  const remaining = Atomics.sub(view, index, 1);
  
  if (remaining <= 0) {
    console.log('Resources depleted!');
    return false;
  }
  
  return true;
}
```

**`Atomics.and()` - Atomic Bitwise AND:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 0b11111111; // 255

// Clear specific bits atomically
const oldValue = Atomics.and(view, 0, 0b11110000);

console.log('Old value:', oldValue.toString(2));  // 11111111
console.log('New value:', view[0].toString(2));   // 11110000

// Use case: Clearing flags
const FLAGS = {
  READY: 1 << 0,      // 0001
  RUNNING: 1 << 1,    // 0010
  ERROR: 1 << 2,      // 0100
  DONE: 1 << 3        // 1000
};

view[0] = FLAGS.READY | FLAGS.RUNNING; // 0011

// Clear RUNNING flag
Atomics.and(view, 0, ~FLAGS.RUNNING);
console.log('Flags after clear:', view[0].toString(2)); // 0001
```

**`Atomics.or()` - Atomic Bitwise OR:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 0b00001111;

// Set specific bits atomically
const oldValue = Atomics.or(view, 0, 0b11110000);

console.log('Old value:', oldValue.toString(2));  // 00001111
console.log('New value:', view[0].toString(2));   // 11111111

// Use case: Setting flags
const FLAGS = {
  INITIALIZED: 1 << 0,
  CONNECTED: 1 << 1,
  AUTHENTICATED: 1 << 2,
  READY: 1 << 3
};

view[0] = 0;

// Worker 1 sets INITIALIZED
Atomics.or(view, 0, FLAGS.INITIALIZED);

// Worker 2 sets CONNECTED
Atomics.or(view, 0, FLAGS.CONNECTED);

console.log('Combined flags:', view[0].toString(2)); // 0011
```

**`Atomics.xor()` - Atomic Bitwise XOR:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 0b10101010;

// Toggle bits atomically
const oldValue = Atomics.xor(view, 0, 0b11110000);

console.log('Old value:', oldValue.toString(2));  // 10101010
console.log('New value:', view[0].toString(2));   // 01011010

// Use case: Toggle flags
function toggleFlag(view, index, flag) {
  return Atomics.xor(view, index, flag);
}

const PAUSE_FLAG = 1 << 0;
view[0] = 0;

// Toggle pause on
toggleFlag(view, 0, PAUSE_FLAG);
console.log('Paused:', (view[0] & PAUSE_FLAG) !== 0); // true

// Toggle pause off
toggleFlag(view, 0, PAUSE_FLAG);
console.log('Paused:', (view[0] & PAUSE_FLAG) !== 0); // false
```

**`Atomics.exchange()` - Atomic Exchange:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 100;

// Atomically replace value and return old value
const oldValue = Atomics.exchange(view, 0, 200);

console.log('Old value:', oldValue);  // 100
console.log('New value:', view[0]);   // 200

// Use case: Take ownership
function tryAcquireLock(view, lockIndex, workerID) {
  const UNLOCKED = 0;
  
  // Try to exchange UNLOCKED with our ID
  const oldValue = Atomics.exchange(view, lockIndex, workerID);
  
  if (oldValue === UNLOCKED) {
    console.log(`Worker ${workerID} acquired lock`);
    return true;
  } else {
    console.log(`Lock held by worker ${oldValue}`);
    return false;
  }
}
```

**`Atomics.compareExchange()` - Compare and Exchange:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 100;

// Only exchange if current value matches expected
// Atomics.compareExchange(view, index, expectedValue, newValue)
const oldValue = Atomics.compareExchange(view, 0, 100, 200);

console.log('Old value:', oldValue);  // 100
console.log('New value:', view[0]);   // 200 (exchange succeeded)

// Try again with wrong expected value
const oldValue2 = Atomics.compareExchange(view, 0, 100, 300);

console.log('Old value:', oldValue2); // 200 (exchange failed)
console.log('New value:', view[0]);   // 200 (unchanged)

// Use case: Lock-free algorithms
function incrementWithCAS(view, index) {
  let oldValue, newValue;
  do {
    oldValue = Atomics.load(view, index);
    newValue = oldValue + 1;
  } while (Atomics.compareExchange(view, index, oldValue, newValue) !== oldValue);
  
  return newValue;
}
```

### `Atomics.load()` / `Atomics.store()`

Atomic read and write operations.

**`Atomics.load()` - Atomic Read:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);
view[0] = 42;

// Atomic load ensures you read a complete value
const value = Atomics.load(view, 0);
console.log('Loaded:', value); // 42

// Without Atomics.load on some architectures,
// a non-atomic read might see a partial write
// (though JavaScript engines typically ensure this)

// Use case: Safely reading shared state
function getSharedState(sharedView, stateIndex) {
  return Atomics.load(sharedView, stateIndex);
}
```

**`Atomics.store()` - Atomic Write:**

```javascript
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Atomic store ensures the value is fully written
Atomics.store(view, 0, 42);

console.log('Stored:', view[0]); // 42

// Returns the value that was stored
const stored = Atomics.store(view, 0, 100);
console.log('Stored value:', stored); // 100

// Use case: Publishing shared state
function setSharedState(sharedView, stateIndex, newState) {
  Atomics.store(sharedView, stateIndex, newState);
}
```

**Memory Ordering Guarantees:**

```javascript
const sab = new SharedArrayBuffer(8);
const view = new Int32Array(sab);

// Atomics provide sequential consistency
// Operations appear to happen in program order

// Thread 1:
Atomics.store(view, 0, 1);  // A
Atomics.store(view, 1, 2);  // B

// Thread 2:
const b = Atomics.load(view, 1); // C
const a = Atomics.load(view, 0); // D

// If C sees value 2 (from B), then D must see value 1 (from A)
// This ordering is guaranteed

// Without atomics, reordering could occur
```

### `Atomics.wait()` / `Atomics.notify()`

Atomic waiting and notification for thread synchronization.

**`Atomics.wait()` - Wait for Value Change:**

```javascript
// Can only be used on Int32Array or BigInt64Array
// Cannot be used on main thread (would block UI)

// worker.js
const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Wait for value at index 0 to change from 0
// Atomics.wait(typedArray, index, expectedValue, timeout)
console.log('Waiting for signal...');

const result = Atomics.wait(view, 0, 0, 5000); // 5 second timeout

if (result === 'ok') {
  console.log('Woken up by notify');
} else if (result === 'not-equal') {
  console.log('Value already changed');
} else if (result === 'timed-out') {
  console.log('Wait timed out');
}

console.log('Value is now:', view[0]);
```

**`Atomics.notify()` - Wake Waiting Threads:**

```javascript
// main.js or another worker

const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Change value and notify waiters
Atomics.store(view, 0, 1);

// Atomics.notify(typedArray, index, count)
// count: number of waiters to wake (default: Infinity)
const wokenCount = Atomics.notify(view, 0, 1);

console.log('Woke up', wokenCount, 'waiter(s)');
```

**Producer-Consumer with Wait/Notify:**

```javascript
// shared-queue.js - Shared structure

class SharedQueue {
  constructor(capacity = 10) {
    // Layout: [readIndex, writeIndex, count, ...data]
    const bufferSize = 3 + capacity;
    this.sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * bufferSize);
    this.view = new Int32Array(this.sab);
    this.capacity = capacity;
    
    this.READ_INDEX = 0;
    this.WRITE_INDEX = 1;
    this.COUNT = 2;
    this.DATA_START = 3;
    
    Atomics.store(this.view, this.READ_INDEX, 0);
    Atomics.store(this.view, this.WRITE_INDEX, 0);
    Atomics.store(this.view, this.COUNT, 0);
  }
  
  getSharedBuffer() {
    return this.sab;
  }
}

// producer-worker.js
let view, capacity, DATA_START, WRITE_INDEX, COUNT;

self.addEventListener('message', (event) => {
  const sab = event.data.sharedBuffer;
  capacity = event.data.capacity;
  view = new Int32Array(sab);
  
  DATA_START = 3;
  WRITE_INDEX = 1;
  COUNT = 2;
  
  startProducing();
});

function startProducing() {
  let produced = 0;
  
  setInterval(() => {
    // Wait if queue is full
    while (Atomics.load(view, COUNT) >= capacity) {
      console.log('Queue full, waiting...');
      Atomics.wait(view, COUNT, capacity, 1000);
    }
    
    // Produce item
    const writeIdx = Atomics.load(view, WRITE_INDEX);
    const dataIndex = DATA_START + writeIdx;
    
    Atomics.store(view, dataIndex, produced);
    
    // Update write index
    const nextWrite = (writeIdx + 1) % capacity;
    Atomics.store(view, WRITE_INDEX, nextWrite);
    
    // Increment count
    Atomics.add(view, COUNT, 1);
    
    // Notify consumers
    Atomics.notify(view, COUNT, 1);
    
    console.log('Produced:', produced);
    produced++;
  }, 100);
}

// consumer-worker.js
let view, capacity, DATA_START, READ_INDEX, COUNT;

self.addEventListener('message', (event) => {
  const sab = event.data.sharedBuffer;
  capacity = event.data.capacity;
  view = new Int32Array(sab);
  
  DATA_START = 3;
  READ_INDEX = 0;
  COUNT = 2;
  
  startConsuming();
});

function startConsuming() {
  setInterval(() => {
    // Wait if queue is empty
    while (Atomics.load(view, COUNT) === 0) {
      console.log('Queue empty, waiting...');
      Atomics.wait(view, COUNT, 0, 1000);
    }
    
    // Consume item
    const readIdx = Atomics.load(view, READ_INDEX);
    const dataIndex = DATA_START + readIdx;
    
    const value = Atomics.load(view, dataIndex);
    
    // Update read index
    const nextRead = (readIdx + 1) % capacity;
    Atomics.store(view, READ_INDEX, nextRead);
    
    // Decrement count
    Atomics.sub(view, COUNT, 1);
    
    // Notify producers
    Atomics.notify(view, COUNT, 1);
    
    console.log('Consumed:', value);
  }, 150);
}
```

**Barrier Synchronization:**

```javascript
// Barrier: Wait for all workers to reach a point

class Barrier {
  constructor(numWorkers) {
    // Layout: [count, generation]
    this.sab = new SharedArrayBuffer(8);
    this.view = new Int32Array(this.sab);
    this.numWorkers = numWorkers;
    
    this.COUNT = 0;
    this.GENERATION = 1;
    
    Atomics.store(this.view, this.COUNT, 0);
    Atomics.store(this.view, this.GENERATION, 0);
  }
  
  getSharedBuffer() {
    return this.sab;
  }
}

// worker.js
let barrierView, numWorkers;

self.addEventListener('message', (event) => {
  barrierView = new Int32Array(event.data.barrier);
  numWorkers = event.data.numWorkers;
  
  doWork();
});

function doWork() {
  // Phase 1
  console.log('Phase 1 work...');
  // ... do work ...
  
  // Wait at barrier
  waitAtBarrier();
  
  // Phase 2 (all workers synchronized)
  console.log('Phase 2 work...');
  // ... do work ...
}

function waitAtBarrier() {
  const COUNT = 0;
  const GENERATION = 1;
  
  const gen = Atomics.load(barrierView, GENERATION);
  
  // Increment count
  const arrived = Atomics.add(barrierView, COUNT, 1) + 1;
  
  if (arrived === numWorkers) {
    // Last worker to arrive
    // Reset count and advance generation
    Atomics.store(barrierView, COUNT, 0);
    Atomics.add(barrierView, GENERATION, 1);
    
    // Wake all waiting workers
    Atomics.notify(barrierView, GENERATION, numWorkers - 1);
  } else {
    // Wait for all workers to arrive
    Atomics.wait(barrierView, GENERATION, gen);
  }
}
```

### `Atomics.isLockFree()`

Checks if atomic operations on a given size are lock-free (faster).

**Basic Usage:**

```javascript
// Check if operations on different sizes are lock-free
console.log('1 byte:', Atomics.isLockFree(1));  // Usually true
console.log('2 bytes:', Atomics.isLockFree(2)); // Usually true
console.log('4 bytes:', Atomics.isLockFree(4)); // Usually true (Int32)
console.log('8 bytes:', Atomics.isLockFree(8)); // Platform-dependent (BigInt64)

// Lock-free means the operation doesn't require locks
// and is implemented with CPU atomic instructions
// This is faster and more efficient

// Use this to choose optimal data types
function chooseOptimalType() {
  if (Atomics.isLockFree(8)) {
    console.log('Use BigInt64Array for best performance');
    return BigInt64Array;
  } else if (Atomics.isLockFree(4)) {
    console.log('Use Int32Array for best performance');
    return Int32Array;
  } else {
    console.log('Fall back to Int32Array');
    return Int32Array;
  }
}

const OptimalArray = chooseOptimalType();
```

**Performance Implications:**

```javascript
// Lock-free operations are faster
const sab = new SharedArrayBuffer(8);

// Int32Array (4 bytes) - usually lock-free
const int32View = new Int32Array(sab);
console.log('Int32 lock-free:', Atomics.isLockFree(4));

// BigInt64Array (8 bytes) - may not be lock-free on all platforms
const bigInt64View = new BigInt64Array(sab, 0, 1);
console.log('BigInt64 lock-free:', Atomics.isLockFree(8));

// Benchmark
function benchmark(view, operations) {
  const start = performance.now();
  
  for (let i = 0; i < operations; i++) {
    Atomics.add(view, 0, 1);
  }
  
  const end = performance.now();
  return end - start;
}

// If lock-free, atomic operations are very fast
// If not lock-free, operations may use locks (slower)
```

### Use Cases (Multi-threaded Coordination)

Practical applications of Atomics and SharedArrayBuffer.

**1. Parallel Image Processing:**

```javascript
// main.js
async function processImageParallel(imageData, numWorkers = 4) {
  const width = imageData.width;
  const height = imageData.height;
  
  // Create shared buffer for image data
  const sab = new SharedArrayBuffer(imageData.data.length);
  const sharedArray = new Uint8ClampedArray(sab);
  
  // Copy image data to shared buffer
  sharedArray.set(imageData.data);
  
  // Create workers
  const workers = [];
  const rowsPerWorker = Math.ceil(height / numWorkers);
  
  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('image-worker.js');
    workers.push(worker);
    
    const startRow = i * rowsPerWorker;
    const endRow = Math.min((i + 1) * rowsPerWorker, height);
    
    worker.postMessage({
      sharedBuffer: sab,
      width,
      height,
      startRow,
      endRow
    });
  }
  
  // Wait for all workers to complete
  await Promise.all(workers.map(worker => 
    new Promise(resolve => worker.addEventListener('message', resolve))
  ));
  
  // Copy processed data back
  imageData.data.set(sharedArray);
  
  // Terminate workers
  workers.forEach(w => w.terminate());
  
  return imageData;
}

// image-worker.js
self.addEventListener('message', (event) => {
  const { sharedBuffer, width, height, startRow, endRow } = event.data;
  const pixels = new Uint8ClampedArray(sharedBuffer);
  
  // Process rows assigned to this worker
  for (let y = startRow; y < endRow; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      
      // Apply grayscale filter
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      pixels[index] = gray;
      pixels[index + 1] = gray;
      pixels[index + 2] = gray;
      // Alpha (index + 3) unchanged
    }
  }
  
  self.postMessage({ done: true });
});
```

**2. Lock-Free Queue:**

```javascript
class LockFreeQueue {
  constructor(capacity) {
    // Ring buffer: [head, tail, ...data]
    const bufferSize = 2 + capacity;
    this.sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * bufferSize);
    this.view = new Int32Array(this.sab);
    this.capacity = capacity;
    
    Atomics.store(this.view, 0, 0); // head
    Atomics.store(this.view, 1, 0); // tail
  }
  
  enqueue(value) {
    while (true) {
      const head = Atomics.load(this.view, 0);
      const tail = Atomics.load(this.view, 1);
      const next = (tail + 1) % this.capacity;
      
      // Queue full?
      if (next === head) {
        return false;
      }
      
      // Try to advance tail
      if (Atomics.compareExchange(this.view, 1, tail, next) === tail) {
        // Successfully claimed spot
        Atomics.store(this.view, 2 + tail, value);
        return true;
      }
      // CAS failed, retry
    }
  }
  
  dequeue() {
    while (true) {
      const head = Atomics.load(this.view, 0);
      const tail = Atomics.load(this.view, 1);
      
      // Queue empty?
      if (head === tail) {
        return null;
      }
      
      const value = Atomics.load(this.view, 2 + head);
      const next = (head + 1) % this.capacity;
      
      // Try to advance head
      if (Atomics.compareExchange(this.view, 0, head, next) === head) {
        return value;
      }
      // CAS failed, retry
    }
  }
}
```

**3. Spinlock Implementation:**

```javascript
class Spinlock {
  constructor() {
    this.sab = new SharedArrayBuffer(4);
    this.view = new Int32Array(this.sab);
    Atomics.store(this.view, 0, 0); // 0 = unlocked
  }
  
  lock() {
    // Spin until we acquire the lock
    while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {
      // Busy wait
      // In production, add yield or backoff
    }
  }
  
  unlock() {
    Atomics.store(this.view, 0, 0);
  }
  
  tryLock() {
    return Atomics.compareExchange(this.view, 0, 0, 1) === 0;
  }
  
  withLock(callback) {
    this.lock();
    try {
      return callback();
    } finally {
      this.unlock();
    }
  }
}

// Usage
const lock = new Spinlock();

// In worker:
lock.withLock(() => {
  // Critical section - only one worker at a time
  console.log('In critical section');
  // Modify shared state safely
});
```

**4. Parallel Array Sum:**

```javascript
// main.js
async function parallelSum(array, numWorkers = 4) {
  const chunkSize = Math.ceil(array.length / numWorkers);
  
  // Create shared buffer for results
  const resultBuffer = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT * numWorkers
  );
  const results = new Int32Array(resultBuffer);
  
  // Create shared buffer for input
  const dataBuffer = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT * array.length
  );
  const sharedData = new Int32Array(dataBuffer);
  sharedData.set(array);
  
  // Create workers
  const workers = [];
  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('sum-worker.js');
    workers.push(worker);
    
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, array.length);
    
    worker.postMessage({
      data: dataBuffer,
      results: resultBuffer,
      workerIndex: i,
      start,
      end
    });
  }
  
  // Wait for all workers
  await Promise.all(workers.map(w => 
    new Promise(resolve => w.addEventListener('message', resolve))
  ));
  
  // Sum partial results
  let total = 0;
  for (let i = 0; i < numWorkers; i++) {
    total += results[i];
  }
  
  workers.forEach(w => w.terminate());
  
  return total;
}

// sum-worker.js
self.addEventListener('message', (event) => {
  const { data, results, workerIndex, start, end } = event.data;
  
  const sharedData = new Int32Array(data);
  const sharedResults = new Int32Array(results);
  
  // Compute partial sum
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += sharedData[i];
  }
  
  // Store result atomically
  Atomics.store(sharedResults, workerIndex, sum);
  
  self.postMessage({ done: true });
});

// Usage
const largeArray = new Array(10000000).fill(1);
parallelSum(largeArray, 4).then(sum => {
  console.log('Sum:', sum); // 10000000
});
```

---

## Summary

This document covered Atomics and SharedArrayBuffer comprehensively:

- **SharedArrayBuffer**: Creating shared memory, typed array views, structured data in shared memory, sharing between workers, producer-consumer patterns, security considerations (COOP/COEP headers)
- **Atomics**: Atomic operations overview, arithmetic operations (add, sub), bitwise operations (and, or, xor), exchange operations, load/store for sequential consistency, wait/notify for synchronization, isLockFree for performance optimization, and multi-threaded coordination use cases

These features enable true parallel processing in JavaScript, allowing multiple workers to safely share and modify memory concurrently.

---

**Related Topics to Explore Next:**

- Web Workers and Worker threads
- Parallel algorithms and patterns
- Lock-free data structures
- Memory models and consistency
- WebAssembly with shared memory