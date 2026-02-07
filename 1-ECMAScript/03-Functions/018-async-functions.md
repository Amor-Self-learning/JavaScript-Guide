# 3.8 Async Functions

## Introduction

Async functions simplify asynchronous code using `async` and `await` keywords. They return promises and allow writing asynchronous code that looks synchronous.

Understanding how `async`/`await` works, error handling, and top-level `await` is essential for modern JavaScript.

---

## 3.8.1 `async` Keyword

### Basic Syntax

```javascript
async function fetchUser() {
  return { id: 1, name: "Alice" };
}

const result = fetchUser();
console.log(result);  // Promise { <fulfilled>: { id: 1, name: "Alice" } }
```

**`async` function always returns a Promise:**

```javascript
async function getValue() {
  return 42;
}

// Equivalent to:
function getValue() {
  return Promise.resolve(42);
}

getValue().then(value => console.log(value));  // 42
```

---

### Async Function Expressions

```javascript
const fetchUser = async function() {
  return { id: 1, name: "Alice" };
};

const getData = async () => {
  return [1, 2, 3];
};
```

---

### Async Methods

```javascript
const obj = {
  async fetchData() {
    return "data";
  }
};

class MyClass {
  async fetchData() {
    return "data";
  }
  
  static async staticFetch() {
    return "static data";
  }
}
```

---

### Throwing Errors

**Throwing in async function creates rejected promise:**

```javascript
async function failingFunction() {
  throw new Error("oops");
}

failingFunction().catch(error => {
  console.log(error.message);  // "oops"
});

// Equivalent to:
function failingFunction() {
  return Promise.reject(new Error("oops"));
}
```

---

## 3.8.2 `await` Keyword

### Basic Usage

**`await` pauses execution until promise settles:**

```javascript
async function fetchUser() {
  const response = await fetch("https://api.example.com/user/1");
  const user = await response.json();
  return user;
}

fetchUser().then(user => console.log(user));
```

**Without `await` (for comparison):**

```javascript
function fetchUser() {
  return fetch("https://api.example.com/user/1")
    .then(response => response.json())
    .then(user => user);
}
```

---

### `await` Unwraps Promises

```javascript
async function example() {
  const promise = Promise.resolve(42);
  const value = await promise;
  console.log(value);  // 42 (not Promise)
}

example();
```

---

### Multiple `await` Statements

**Sequential (one after another):**

```javascript
async function fetchUsers() {
  const user1 = await fetch("/api/user/1").then(r => r.json());
  const user2 = await fetch("/api/user/2").then(r => r.json());
  const user3 = await fetch("/api/user/3").then(r => r.json());
  
  return [user1, user2, user3];
}

// Takes 3 * request_time (sequential)
```

**Parallel (concurrent):**

```javascript
async function fetchUsers() {
  const [user1, user2, user3] = await Promise.all([
    fetch("/api/user/1").then(r => r.json()),
    fetch("/api/user/2").then(r => r.json()),
    fetch("/api/user/3").then(r => r.json())
  ]);
  
  return [user1, user2, user3];
}

// Takes max(request_times) (parallel)
```

---

### `await` Only in Async Functions

```javascript
// Error: await outside async function
function regular() {
  const value = await Promise.resolve(42);  // SyntaxError
}

// Correct: await inside async function
async function asyncFunc() {
  const value = await Promise.resolve(42);  // OK
}
```

**Exception: Top-level await (see 3.8.4)**

---

### `await` with Non-Promises

**Works with any value (wraps in resolved promise):**

```javascript
async function example() {
  const value = await 42;  // Wrapped in Promise.resolve(42)
  console.log(value);  // 42
  
  const str = await "hello";
  console.log(str);  // "hello"
}
```

---

## 3.8.3 Error Handling

### `try...catch`

**Handle rejected promises:**

```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/user/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
    return null;
  }
}

fetchUser(1);
```

---

### Multiple Try-Catch Blocks

```javascript
async function complexOperation() {
  let user, posts;
  
  try {
    user = await fetchUser();
  } catch (error) {
    console.error("User fetch failed:", error);
    return;
  }
  
  try {
    posts = await fetchPosts(user.id);
  } catch (error) {
    console.error("Posts fetch failed:", error);
    posts = [];  // Use default
  }
  
  return { user, posts };
}
```

---

### `.catch()` on Promises

**Mix await with promise methods:**

```javascript
async function fetchUser(id) {
  const user = await fetch(`/api/user/${id}`)
    .then(r => r.json())
    .catch(error => {
      console.error("Fetch failed:", error);
      return null;
    });
  
  return user;
}
```

---

### Uncaught Errors

**Errors propagate to returned promise:**

```javascript
async function failing() {
  throw new Error("oops");
}

failing();  // Unhandled promise rejection

// Handle with .catch()
failing().catch(error => console.error(error));

// Or with await in async context
async function caller() {
  try {
    await failing();
  } catch (error) {
    console.error("Caught:", error.message);
  }
}
```

---

### `finally` Block

```javascript
async function fetchWithCleanup() {
  let connection;
  
  try {
    connection = await openConnection();
    const data = await connection.query("SELECT * FROM users");
    return data;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();  // Always runs
    }
  }
}
```

---

## 3.8.4 Top-Level `await`

### ES2022 Feature

**Use `await` at module top level:**

```javascript
// config.js (ES module)
const response = await fetch("/api/config");
const config = await response.json();

export default config;

// main.js
import config from "./config.js";
console.log(config);  // Available immediately
```

---

### Dynamic Imports

```javascript
const { default: module } = await import("./module.js");

// Conditional loading
if (condition) {
  const module = await import("./conditional-module.js");
  module.doSomething();
}
```

---

### Module Initialization

```javascript
// database.js
const connection = await connectToDatabase();
await connection.migrate();

export default connection;

// Using module
import db from "./database.js";
// db is already initialized and migrated
```

---

### Limitations

**Only in ES modules:**

```html
<!-- Works: type="module" -->
<script type="module">
  const data = await fetch("/api/data").then(r => r.json());
  console.log(data);
</script>

<!-- Doesn't work: regular script -->
<script>
  const data = await fetch("/api/data");  // SyntaxError
</script>
```

**Not in CommonJS:**

```javascript
// module.cjs (CommonJS)
const data = await fetch("/api/data");  // SyntaxError

// Use IIFE instead
(async () => {
  const data = await fetch("/api/data");
})();
```

---

### Load Order Dependencies

**Modules with top-level await block importing modules:**

```javascript
// slow-module.js
await new Promise(resolve => setTimeout(resolve, 2000));
export const data = "slow data";

// fast-module.js
export const data = "fast data";

// main.js
import { data as slowData } from "./slow-module.js";
import { data as fastData } from "./fast-module.js";

console.log(slowData, fastData);
// Takes 2 seconds (waits for slow-module)
```

---

## 3.8.5 Async Generators

### `async function*` Syntax

**Combine async and generator:**

```javascript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

// Consume with for await...of
(async () => {
  for await (let value of asyncGenerator()) {
    console.log(value);
  }
})();
// 1 (after delay)
// 2 (after delay)
// 3 (after delay)
```

---

### Async Iteration

```javascript
async function* fetchPages() {
  let page = 1;
  
  while (page <= 3) {
    const response = await fetch(`/api/data?page=${page}`);
    const data = await response.json();
    yield data;
    page++;
  }
}

(async () => {
  for await (let pageData of fetchPages()) {
    console.log(pageData);
  }
})();
```

---

### Real-World Example: Streaming

```javascript
async function* readLines(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = "";
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      if (buffer.length > 0) {
        yield buffer;
      }
      break;
    }
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();  // Keep incomplete line
    
    for (let line of lines) {
      yield line;
    }
  }
}

// Usage
(async () => {
  for await (let line of readLines("/data.txt")) {
    console.log(line);
  }
})();
```

---

### Async Generator Methods

**Similar to regular generators:**

```javascript
async function* gen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

const g = gen();

// next()
g.next().then(result => console.log(result));
// { value: 1, done: false }

// return()
g.return(0).then(result => console.log(result));
// { value: 0, done: true }

// throw()
async function* errorGen() {
  try {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
  } catch (error) {
    console.log("Caught:", error.message);
  }
}

const eg = errorGen();
await eg.next();
await eg.throw(new Error("oops"));
// Logs "Caught: oops"
```

---

### Delegating with `yield*`

```javascript
async function* inner() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

async function* outer() {
  yield await Promise.resolve("start");
  yield* inner();
  yield await Promise.resolve("end");
}

(async () => {
  for await (let value of outer()) {
    console.log(value);
  }
})();
// "start", 1, 2, "end"
```

---

## 3.8.6 Async Patterns

### Sequential Execution

```javascript
async function sequential() {
  const result1 = await operation1();
  const result2 = await operation2(result1);
  const result3 = await operation3(result2);
  return result3;
}
```

---

### Parallel Execution

```javascript
async function parallel() {
  const [result1, result2, result3] = await Promise.all([
    operation1(),
    operation2(),
    operation3()
  ]);
  
  return { result1, result2, result3 };
}
```

---

### Race Conditions

```javascript
async function fastest() {
  const result = await Promise.race([
    fetchFromServer1(),
    fetchFromServer2(),
    fetchFromServer3()
  ]);
  
  return result;  // First to complete
}
```

---

### Retry Logic

```javascript
async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const data = await retry(() => fetch("/api/data").then(r => r.json()));
```

---

### Timeout

```javascript
function timeout(ms, promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

async function fetchWithTimeout() {
  try {
    const data = await timeout(5000, fetch("/api/data"));
    return data;
  } catch (error) {
    console.error("Request timed out");
  }
}
```

---

### Cancellation

```javascript
async function cancellable(signal) {
  if (signal.aborted) {
    throw new Error("Aborted");
  }
  
  const response = await fetch("/api/data", { signal });
  return response.json();
}

// Usage
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);  // Cancel after 5s

try {
  const data = await cancellable(controller.signal);
} catch (error) {
  console.log("Request cancelled");
}
```

---

## 3.8.7 Best Practices

1. **Use `async`/`await` over promise chains** (more readable)
2. **Handle errors with `try...catch`** (don't let them go unhandled)
3. **Run independent operations in parallel** (use `Promise.all`)
4. **Don't `await` in loops unnecessarily** (leads to sequential execution)
5. **Use `Promise.allSettled`** when you want all results (even failures)
6. **Be careful with top-level `await`** (blocks module loading)
7. **Clean up resources in `finally`**
8. **Consider cancellation** for long-running operations

---

## 3.8.8 Common Pitfalls

### Forgetting `await`

```javascript
// Bug: forgot await
async function fetchUser() {
  const user = fetch("/api/user/1");  // Returns Promise, not user!
  console.log(user.name);  // undefined
}

// Correct
async function fetchUser() {
  const response = await fetch("/api/user/1");
  const user = await response.json();
  console.log(user.name);
}
```

---

### Sequential Instead of Parallel

```javascript
// Slow: sequential (3 seconds total)
async function slow() {
  const user1 = await fetchUser(1);  // 1 second
  const user2 = await fetchUser(2);  // 1 second
  const user3 = await fetchUser(3);  // 1 second
  return [user1, user2, user3];
}

// Fast: parallel (1 second total)
async function fast() {
  const [user1, user2, user3] = await Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ]);
  return [user1, user2, user3];
}
```

---

### Not Handling Rejections

```javascript
// Bug: unhandled rejection
async function bad() {
  const data = await fetch("/api/data");  // Might fail
  return data;
}

bad();  // If fetch fails, unhandled promise rejection

// Good: handle errors
async function good() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error("Fetch failed");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
```

---

## Summary

### Generators

- **`function*` syntax** creates generator functions
- **`yield`** pauses execution and produces value
- **`yield*`** delegates to another iterable
- **Methods**: `next()`, `return()`, `throw()`
- **Use cases**: lazy evaluation, infinite sequences, custom iterables
- **Iteration**: `for...of`, spread, destructuring

### Async Functions

- **`async`** makes function return Promise
- **`await`** pauses until Promise settles
- **Error handling**: `try...catch` or `.catch()`
- **Top-level `await`** in ES modules
- **Async generators** combine async and generators
- **Patterns**: sequential, parallel, race, retry, timeout
- **Common pitfalls**: forgetting `await`, sequential instead of parallel, unhandled rejections

---
