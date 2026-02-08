# Async Patterns

## Table of Contents
1. [Introduction](#introduction)
2. [Promisification](#promisification)
3. [Throttling](#throttling)
4. [Debouncing](#debouncing)
5. [Retry Logic](#retry-logic)
6. [Timeout Patterns](#timeout-patterns)
7. [Concurrency Control](#concurrency-control)
8. [Queue Management](#queue-management)
9. [Race Conditions and Solutions](#race-conditions-and-solutions)
10. [Advanced Patterns](#advanced-patterns)
11. [Best Practices](#best-practices)
12. [Summary](#summary)

---

## Introduction

Async patterns solve common problems in JavaScript asynchronous programming:
- Converting callbacks to promises
- Controlling function call frequency
- Managing concurrent operations
- Handling timeouts and retries
- Preventing race conditions

---

## Promisification

### Converting Callbacks to Promises

```javascript
// ❌ Callback-based (Node.js style)
function readFile(filename, callback) {
  // Simulated async operation
  setTimeout(() => {
    if (filename) {
      callback(null, `Contents of ${filename}`);
    } else {
      callback(new Error('No filename'));
    }
  }, 100);
}

// ✅ Convert to promise
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

// Now usable with async/await
async function loadFiles() {
  try {
    const file1 = await readFilePromise('file1.txt');
    const file2 = await readFilePromise('file2.txt');
    console.log(file1, file2);
  } catch (error) {
    console.error('Error:', error);
  }
}

loadFiles();
```

### Generic Promisification Helper

```javascript
// ✅ Convert any callback-based function
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Usage
const readFileAsync = promisify(readFile);
const data = await readFileAsync('file.txt');

// ✅ Multiple arguments
function add(a, b, callback) {
  setTimeout(() => {
    callback(null, a + b);
  }, 100);
}

const addAsync = promisify(add);
const result = await addAsync(5, 3);  // 8
```

### Built-in Promisification

```javascript
// ✅ Node.js util.promisify
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

// Now it returns a promise
async function loadFile() {
  const content = await readFile('data.txt', 'utf-8');
  console.log(content);
}

loadFile();
```

---

## Throttling

### What is Throttling?

**Throttling** ensures a function is called at most once per specified time interval, even if events fire repeatedly.

```javascript
// ✅ Basic throttle implementation
function throttle(fn, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
}

// Usage: Window resize
window.addEventListener(
  'resize',
  throttle(() => {
    console.log('Window resized');
  }, 1000)  // Max once per second
);
```

### Advanced Throttle with Trailing Call

```javascript
// ✅ Throttle with leading and trailing calls
function throttle(fn, delay, { leading = true, trailing = false } = {}) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    
    if (!lastCall && !leading) {
      lastCall = now;
    }
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = leading ? Date.now() : 0;
        timeoutId = null;
        fn(...args);
      }, delay - (now - lastCall));
    }
  };
}

// Usage
const onMouseMove = throttle(
  (event) => console.log('Mouse moved'),
  300,
  { leading: true, trailing: true }
);

document.addEventListener('mousemove', onMouseMove);
```

### Use Cases

```javascript
// ✅ Scroll event throttling
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 500);

window.addEventListener('scroll', handleScroll);

// ✅ API call throttling
const apiCall = throttle(() => {
  fetch('/api/search?q=' + query);
}, 1000);

// User types, but API called at most once per second
input.addEventListener('input', apiCall);
```

---

## Debouncing

### What is Debouncing?

**Debouncing** ensures a function is only called after it stops being invoked for a specified time interval.

```javascript
// ✅ Basic debounce implementation
function debounce(fn, delay) {
  let timeoutId = null;
  
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Usage: Search input
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
  fetch(`/api/search?q=${query}`);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

### Advanced Debounce with Immediate Option

```javascript
// ✅ Debounce with immediate execution
function debounce(fn, delay, { immediate = false } = {}) {
  let timeoutId = null;
  
  return function(...args) {
    const shouldCallNow = immediate && !timeoutId;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (shouldCallNow) {
      fn(...args);
    }
    
    timeoutId = setTimeout(() => {
      if (!immediate) {
        fn(...args);
      }
      timeoutId = null;
    }, delay);
  };
}

// Usage: Button click (immediate)
const onClick = debounce(
  () => console.log('Clicked'),
  300,
  { immediate: true }
);

button.addEventListener('click', onClick);
```

### Debounce vs Throttle

```javascript
// ✅ Debounce: Wait until activity stops
const debouncedSearch = debounce((query) => {
  fetch(`/api/search?q=${query}`);
}, 500);

// Fire once 500ms after user stops typing
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// ✅ Throttle: Fire regularly
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

// Fire at most every 100ms while scrolling
window.addEventListener('scroll', throttledScroll);
```

---

## Retry Logic

### Simple Retry

```javascript
// ✅ Retry N times
async function retryAsync(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;  // All retries failed
      }
      console.log(`Attempt ${i + 1} failed, retrying...`);
    }
  }
}

// Usage
const data = await retryAsync(
  () => fetch('/api/data').then(r => r.json()),
  3
);
```

### Retry with Exponential Backoff

```javascript
// ✅ Exponential backoff: increases delay between retries
async function retryWithBackoff(
  fn,
  maxRetries = 3,
  baseDelay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, i);  // 1s, 2s, 4s...
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage: API call with backoff
const response = await retryWithBackoff(
  () => fetch('/api/data'),
  4,
  500
);
```

### Conditional Retry

```javascript
// ✅ Only retry on specific errors
async function retryOnError(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Retry on server errors (5xx) or network errors
      console.log('Retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

---

## Timeout Patterns

### Promise with Timeout

```javascript
// ✅ Race promise against timeout
async function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// Usage
try {
  const data = await withTimeout(
    fetch('/api/slow-endpoint').then(r => r.json()),
    5000
  );
} catch (error) {
  console.error(error.message);  // Operation timed out...
}
```

### AbortController for Native Timeouts

```javascript
// ✅ Modern approach using AbortController
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage
try {
  const response = await fetchWithTimeout('/api/data', 5000);
  const data = await response.json();
} catch (error) {
  console.error(error.message);
}
```

---

## Concurrency Control

### Limit Concurrent Promises

```javascript
// ✅ Execute N promises concurrently
async function concurrentLimit(promises, limit) {
  const results = [];
  const executing = [];
  
  for (const [index, promise] of promises.entries()) {
    const p = Promise.resolve(promise)
      .then(result => {
        results[index] = result;
      });
    
    results[index] = p;
    
    if (promises.length >= limit) {
      executing.push(p);
      
      p.then(() => {
        executing.splice(executing.indexOf(p), 1);
      });
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  await Promise.all(results);
  return results;
}

// Usage: Download max 3 files concurrently
const files = ['file1', 'file2', 'file3', 'file4', 'file5'];
await concurrentLimit(
  files.map(file => downloadFile(file)),
  3  // Max 3 concurrent downloads
);
```

### Worker Pool Pattern

```javascript
// ✅ Manage pool of workers
class WorkerPool {
  constructor(size) {
    this.size = size;
    this.queue = [];
    this.active = 0;
  }
  
  async run(fn) {
    while (this.active >= this.size) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.active++;
    
    try {
      return await fn();
    } finally {
      this.active--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// Usage
const pool = new WorkerPool(3);  // Max 3 concurrent

const tasks = [...].map(task => 
  pool.run(() => processTask(task))
);

await Promise.all(tasks);
```

---

## Queue Management

### Simple Task Queue

```javascript
// ✅ Process tasks one at a time
class Queue {
  constructor() {
    this.tasks = [];
    this.processing = false;
  }
  
  add(task) {
    this.tasks.push(task);
    this.process();
  }
  
  async process() {
    if (this.processing || this.tasks.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new Queue();

queue.add(() => console.log('Task 1'));
queue.add(() => console.log('Task 2'));
queue.add(() => console.log('Task 3'));

// Output: Task 1, Task 2, Task 3 (sequentially)
```

### Priority Queue

```javascript
// ✅ Process tasks by priority
class PriorityQueue {
  constructor() {
    this.tasks = [];
    this.processing = false;
  }
  
  add(task, priority = 0) {
    this.tasks.push({ task, priority });
    this.tasks.sort((a, b) => b.priority - a.priority);
    this.process();
  }
  
  async process() {
    if (this.processing || this.tasks.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.tasks.length > 0) {
      const { task } = this.tasks.shift();
      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new PriorityQueue();

queue.add(() => console.log('Low priority'), 1);
queue.add(() => console.log('High priority'), 10);
queue.add(() => console.log('Medium priority'), 5);

// Executes: High priority, Medium priority, Low priority
```

---

## Race Conditions and Solutions

### Identifying Race Conditions

```javascript
// ❌ Race condition: Multiple parallel requests
let cachedData = null;

async function fetchData() {
  if (cachedData) return cachedData;
  
  // If called twice before first completes,
  // both will fetch (both see null cache)
  const data = await fetch('/api/data').then(r => r.json());
  cachedData = data;
  return data;
}

// Race: fetchData() called twice
Promise.all([fetchData(), fetchData()]);
// Makes 2 requests instead of 1
```

### Solution 1: Deduplication

```javascript
// ✅ Cache the promise itself
let cachedPromise = null;

async function fetchData() {
  if (!cachedPromise) {
    cachedPromise = fetch('/api/data').then(r => r.json());
  }
  
  return cachedPromise;
}

// No matter how many times called, only 1 request
Promise.all([fetchData(), fetchData(), fetchData()]);
// Only 1 request made
```

### Solution 2: Request Deduplication Map

```javascript
// ✅ Deduplicate by key
const pendingRequests = new Map();

async function fetchDataByKey(key) {
  // Return existing promise if already requested
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create and cache the promise
  const promise = fetch(`/api/data/${key}`)
    .then(r => r.json())
    .finally(() => {
      pendingRequests.delete(key);  // Clean up
    });
  
  pendingRequests.set(key, promise);
  return promise;
}

// Multiple calls with same key use same request
fetchDataByKey('user-1');
fetchDataByKey('user-1');  // Reuses first request
fetchDataByKey('user-2');  // New request
```

### Solution 3: Abort Stale Requests

```javascript
// ✅ Cancel stale requests
class AbortableRequest {
  constructor() {
    this.controller = null;
    this.result = null;
  }
  
  async fetch(url) {
    // Abort previous request
    if (this.controller) {
      this.controller.abort();
    }
    
    this.controller = new AbortController();
    
    try {
      const response = await fetch(url, {
        signal: this.controller.signal
      });
      this.result = await response.json();
      return this.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Previous request cancelled');
      }
      throw error;
    }
  }
}

// Usage: Search that cancels previous searches
const search = new AbortableRequest();

search.fetch('/api/search?q=a');  // Request 1
search.fetch('/api/search?q=ab'); // Cancels request 1
search.fetch('/api/search?q=abc');// Cancels request 2
// Only last request completes
```

---

## Advanced Patterns

### Pattern: Timeout with Fallback

```javascript
// ✅ Try primary with timeout, fall back to secondary
async function withFallback(primary, fallback, timeoutMs) {
  try {
    return await withTimeout(primary, timeoutMs);
  } catch (error) {
    console.warn('Primary failed, trying fallback:', error.message);
    return await fallback();
  }
}

// Usage
const data = await withFallback(
  fetch('/api/primary'),
  () => fetch('/api/cache'),
  3000
);
```

### Pattern: Circuit Breaker

```javascript
// ✅ Stop making requests after repeated failures
class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, resetTimeout = 60000 } = {}) {
    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failures = 0;
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker(() => fetch('/api/unreliable'));

try {
  const data = await breaker.call();
} catch (error) {
  console.error(error.message);
}
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use Promise.all for parallel operations
const results = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]);

// ✅ Debounce frequent events
const handleSearch = debounce((query) => {
  search(query);
}, 300);

// ✅ Implement timeout for external calls
const data = await withTimeout(fetch(url), 5000);

// ✅ Deduplicate concurrent requests
const request = pendingRequests.get(key) || fetch(url);

// ✅ Use exponential backoff for retries
await retryWithBackoff(operation, 3, 1000);
```

### ❌ DON'T

```javascript
// ❌ Don't make multiple identical concurrent requests
fetch('/api/data');
fetch('/api/data');  // Duplicate request

// ❌ Don't forget to debounce high-frequency events
input.addEventListener('input', expensiveOperation);

// ❌ Don't await in loops when you can parallelize
for (const item of items) {
  await process(item);  // Too slow!
}

// ❌ Don't ignore timeout scenarios
const data = await fetch(url).then(r => r.json());  // No timeout

// ❌ Don't retry without backoff
for (let i = 0; i < 5; i++) {
  try {
    return await operation();
  } catch (e) {
    // Immediate retry (hammers server)
  }
}
```

---

## Summary

### Async Patterns Overview

| Pattern | Purpose | Key Benefit |
|---------|---------|------------|
| **Promisification** | Convert callbacks to promises | Use async/await |
| **Throttling** | Limit call frequency | Reduce overhead |
| **Debouncing** | Wait until activity stops | Save bandwidth |
| **Retry** | Repeat failed operations | Handle transients |
| **Timeout** | Limit operation duration | Prevent hangs |
| **Concurrency Control** | Limit parallel operations | Manage resources |
| **Queue** | Process sequentially | Order matters |
| **Deduplication** | Avoid duplicate requests | Save bandwidth |
| **Circuit Breaker** | Stop calling failing service | Fail fast |

### Quick Reference

```javascript
// Debounce frequent events
const debounced = debounce(fn, 300);

// Throttle repeated events
const throttled = throttle(fn, 300);

// Retry with backoff
await retryWithBackoff(fn, 3, 1000);

// Timeout protection
await withTimeout(promise, 5000);

// Parallel execution
await Promise.all([p1, p2, p3]);

// Limited concurrency
await concurrentLimit(promises, 3);

// Sequential queue
const queue = new Queue();
queue.add(task);
```

### Next Steps

- Combine patterns for complex scenarios
- Build robust error handling
- Optimize performance with caching
- Monitor and debug async operations