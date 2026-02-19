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
