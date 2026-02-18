# 6.4 Request Cancellation

Request cancellation allows you to abort in-flight HTTP requests. This chapter covers the AbortController API, timeout implementation, and patterns for managing cancellable requests in various scenarios.

---

## 6.4.1 AbortController Overview

### What Is AbortController?

```javascript
// AbortController provides a way to abort:
// - Fetch requests
// - DOM operations
// - Any async operation that accepts an AbortSignal

// Basic structure
const controller = new AbortController();
const signal = controller.signal;

// Later... abort!
controller.abort();
```

### Basic Usage

```javascript
const controller = new AbortController();

// Pass signal to fetch
const fetchPromise = fetch('/api/data', {
  signal: controller.signal
});

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetchPromise;
  const data = await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was aborted');
  } else {
    throw error;
  }
}
```

---

## 6.4.2 Timeout Implementation

### Simple Timeout

```javascript
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  
  // Set timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage
try {
  const response = await fetchWithTimeout('/api/data', {}, 3000);
} catch (error) {
  console.error(error.message);
}
```

### AbortSignal.timeout() (Modern)

```javascript
// Built-in timeout (Chrome 103+, Firefox 100+)
try {
  const response = await fetch('/api/data', {
    signal: AbortSignal.timeout(5000)  // 5 second timeout
  });
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out');
  } else if (error.name === 'AbortError') {
    console.log('Request aborted');
  }
}
```

### Combining Timeout and Manual Abort

```javascript
function fetchWithTimeoutAndAbort(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  
  // Combine with timeout signal
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  
  // Use AbortSignal.any() to combine signals (if supported)
  const combinedSignal = AbortSignal.any([
    controller.signal,
    timeoutSignal
  ]);
  
  const promise = fetch(url, {
    ...options,
    signal: combinedSignal
  });
  
  // Return both the promise and the abort function
  return {
    promise,
    abort: () => controller.abort()
  };
}

// Usage
const { promise, abort } = fetchWithTimeoutAndAbort('/api/data', {}, 5000);

// Can abort manually
cancelButton.onclick = () => abort();

const response = await promise;
```

---

## 6.4.3 User-Initiated Cancellation

### Cancel Button Pattern

```javascript
let currentController = null;

async function search(query) {
  // Abort previous request
  if (currentController) {
    currentController.abort();
  }
  
  currentController = new AbortController();
  
  try {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: currentController.signal
    });
    
    return await response.json();
    
  } catch (error) {
    if (error.name === 'AbortError') {
      // Ignore - request was intentionally cancelled
      return null;
    }
    throw error;
  }
}

// Input handler - cancels previous search on new input
searchInput.addEventListener('input', async (e) => {
  const results = await search(e.target.value);
  if (results) {
    displayResults(results);
  }
});
```

### Cancel on Component Unmount (React Pattern)

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load user:', error);
        }
      }
    }
    
    loadUser();
    
    // Cleanup: abort on unmount or userId change
    return () => controller.abort();
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

---

## 6.4.4 AbortSignal Methods

### signal.aborted

```javascript
const controller = new AbortController();

console.log(controller.signal.aborted);  // false

controller.abort();

console.log(controller.signal.aborted);  // true

// Check before starting work
if (signal.aborted) {
  return;  // Don't start if already aborted
}
```

### signal.reason

```javascript
const controller = new AbortController();

// Abort with reason
controller.abort('User cancelled');

console.log(controller.signal.reason);  // 'User cancelled'

// Or with error
controller.abort(new Error('Custom error'));
```

### signal.throwIfAborted()

```javascript
const controller = new AbortController();

async function longOperation(signal) {
  for (let i = 0; i < 100; i++) {
    // Check if aborted at each step
    signal.throwIfAborted();
    
    await doSomeWork(i);
  }
}

try {
  await longOperation(controller.signal);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Operation aborted');
  }
}
```

### abort Event

```javascript
const controller = new AbortController();

controller.signal.addEventListener('abort', () => {
  console.log('Abort signal received');
  console.log('Reason:', controller.signal.reason);
});

controller.abort('Cleanup');
// Logs: "Abort signal received"
// Logs: "Reason: Cleanup"
```

---

## 6.4.5 Multiple Request Cancellation

### Abort Multiple Requests

```javascript
const controller = new AbortController();

// Multiple parallel requests sharing same signal
const results = await Promise.all([
  fetch('/api/users', { signal: controller.signal }),
  fetch('/api/posts', { signal: controller.signal }),
  fetch('/api/comments', { signal: controller.signal })
]);

// Abort all at once
controller.abort();
```

### Race Pattern

```javascript
async function fetchWithRace(urls, timeout = 5000) {
  const controller = new AbortController();
  
  const fetchPromises = urls.map(url =>
    fetch(url, { signal: controller.signal })
  );
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error('Timeout'));
    }, timeout);
  });
  
  try {
    // Race all fetches against timeout
    const response = await Promise.race([
      Promise.any(fetchPromises),
      timeoutPromise
    ]);
    
    // Abort remaining requests
    controller.abort();
    
    return response;
    
  } catch (error) {
    controller.abort();
    throw error;
  }
}
```

---

## 6.4.6 Custom Abortable Operations

### Making Your Functions Abortable

```javascript
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    // Check if already aborted
    if (signal?.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'));
    }
    
    const timeoutId = setTimeout(resolve, ms);
    
    // Listen for abort
    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

// Usage
const controller = new AbortController();

try {
  await delay(5000, controller.signal);
  console.log('Delay completed');
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Delay cancelled');
  }
}

// Cancel after 2 seconds
setTimeout(() => controller.abort(), 2000);
```

### Abortable Generator

```javascript
async function* fetchPaginated(baseUrl, signal) {
  let page = 1;
  
  while (true) {
    signal?.throwIfAborted();
    
    const response = await fetch(`${baseUrl}?page=${page}`, { signal });
    const data = await response.json();
    
    if (data.length === 0) break;
    
    yield data;
    page++;
  }
}

// Usage
const controller = new AbortController();

for await (const page of fetchPaginated('/api/items', controller.signal)) {
  console.log('Got page:', page);
  
  if (shouldStop()) {
    controller.abort();
    break;
  }
}
```

---

## 6.4.7 Common Patterns

### Debounced Search with Cancellation

```javascript
function createDebouncedSearch(delay = 300) {
  let timeoutId;
  let controller;
  
  return async function search(query) {
    // Clear previous timeout
    clearTimeout(timeoutId);
    
    // Abort previous request
    controller?.abort();
    controller = new AbortController();
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search?q=${query}`, {
            signal: controller.signal
          });
          resolve(await response.json());
        } catch (error) {
          if (error.name !== 'AbortError') {
            reject(error);
          }
        }
      }, delay);
    });
  };
}

const debouncedSearch = createDebouncedSearch();

// Automatically cancels previous requests
input.addEventListener('input', async (e) => {
  const results = await debouncedSearch(e.target.value);
  displayResults(results);
});
```

### Request Queue with Cancellation

```javascript
class RequestQueue {
  constructor() {
    this.queue = [];
    this.controller = null;
  }
  
  async add(url, options = {}) {
    // Store in queue with unique id
    const id = Date.now();
    const item = { id, url, options };
    this.queue.push(item);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: this.controller?.signal
      });
      return response;
    } finally {
      // Remove from queue
      this.queue = this.queue.filter(i => i.id !== id);
    }
  }
  
  cancelAll() {
    this.controller?.abort();
    this.controller = new AbortController();
    this.queue = [];
  }
  
  get pending() {
    return this.queue.length;
  }
}
```

---

## 6.4.8 Gotchas

```javascript
// ❌ Reusing aborted controller
const controller = new AbortController();
controller.abort();

// This will fail immediately!
await fetch('/api/data', { signal: controller.signal });

// ✅ Create new controller for each request
const newController = new AbortController();
await fetch('/api/data', { signal: newController.signal });

// ❌ Not catching AbortError
try {
  await fetch('/api/data', { signal: controller.signal });
} catch (error) {
  console.error(error);  // Logs AbortError even for intentional abort
}

// ✅ Handle AbortError separately
try {
  await fetch('/api/data', { signal: controller.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    // Intentional abort - ignore or handle gracefully
    return;
  }
  console.error(error);  // Real error
}

// ❌ Memory leak - not removing abort listener
signal.addEventListener('abort', handler);
// Handler stays in memory even after operation completes

// ✅ Clean up listener
const handler = () => { /* ... */ };
signal.addEventListener('abort', handler);
// Later...
signal.removeEventListener('abort', handler);

// Or use { once: true }
signal.addEventListener('abort', handler, { once: true });
```

---

## 6.4.9 Summary

### AbortController API

| Property/Method | Description |
|----------------|-------------|
| `new AbortController()` | Create controller |
| `controller.signal` | Get AbortSignal |
| `controller.abort(reason)` | Abort with optional reason |

### AbortSignal Properties

| Property | Description |
|----------|-------------|
| `signal.aborted` | Boolean - is aborted? |
| `signal.reason` | Abort reason |
| `signal.throwIfAborted()` | Throw if aborted |
| `'abort'` event | Fired on abort |

### Static Methods

| Method | Description |
|--------|-------------|
| `AbortSignal.timeout(ms)` | Auto-abort after timeout |
| `AbortSignal.any(signals)` | Abort when any signal aborts |
| `AbortSignal.abort(reason)` | Create pre-aborted signal |

### Best Practices

1. **Create new controller** for each request
2. **Handle AbortError** separately from other errors
3. **Clean up listeners** to prevent memory leaks
4. **Abort on unmount** in component-based frameworks
5. **Use timeout** for long-running requests
6. **Cancel previous** when starting new related request

---

**End of Chapter 6.4: Request Cancellation**

Next chapter: **6.5 CORS** — covers Cross-Origin Resource Sharing and how to handle cross-origin requests.
