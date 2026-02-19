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
