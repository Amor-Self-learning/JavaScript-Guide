# Async/Await 

## Table of Contents
1. [Introduction to Async/Await](#introduction-to-asyncawait)
2. [async Functions](#async-functions)
3. [await Expression](#await-expression)
4. [Error Handling with try/catch](#error-handling-with-trycatch)
5. [Parallel Execution](#parallel-execution)
6. [Sequential vs Concurrent Patterns](#sequential-vs-concurrent-patterns)
7. [Top-Level await](#top-level-await)
8. [Async Function Return Values](#async-function-return-values)
9. [Common Patterns](#common-patterns)
10. [Best Practices](#best-practices)
11. [Summary](#summary)

---

## Introduction to Async/Await

### What is Async/Await?

**Async/await** is syntactic sugar built on Promises that allows writing asynchronous code that looks and behaves like synchronous code.

```javascript
// ❌ Promise-based
function getUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/users/${userId}/posts`)
        .then(response => response.json())
        .then(posts => ({ user, posts }));
    })
    .catch(error => console.error(error));
}

// ✅ Async/await (much cleaner!)
async function getUserData(userId) {
  try {
    const userResponse = await fetch(`/api/users/${userId}`);
    const user = await userResponse.json();
    
    const postsResponse = await fetch(`/api/users/${userId}/posts`);
    const posts = await postsResponse.json();
    
    return { user, posts };
  } catch (error) {
    console.error(error);
  }
}
```

### Benefits of Async/Await

1. **Readability** - Looks like synchronous code
2. **Debuggability** - Stack traces are cleaner
3. **Error Handling** - Single try-catch for multiple awaits
4. **Control Flow** - Easier to understand execution order

---

## async Functions

### Declaring async Functions

```javascript
// ✅ Function declaration
async function fetchData() {
  return 'data';
}

// ✅ Function expression
const fetchData = async function() {
  return 'data';
};

// ✅ Arrow function
const fetchData = async () => {
  return 'data';
};

// ✅ Method in class
class DataFetcher {
  async getData() {
    return 'data';
  }
}

// ✅ Method in object
const fetcher = {
  async getData() {
    return 'data';
  }
};
```

### What async Does

```javascript
// ✅ async function always returns a promise
async function example() {
  return 'value';
}

const result = example();
console.log(result instanceof Promise);  // true

result.then(value => {
  console.log(value);  // 'value'
});

// ✅ Even if you return synchronously
async function immediate() {
  return 42;
}

immediate().then(value => {
  console.log(value);  // 42 (wrapped in promise)
});

// ✅ Thrown errors become rejections
async function error() {
  throw new Error('Oops');
}

error().catch(err => {
  console.error(err.message);  // Oops
});
```

### Async Function Scope

```javascript
// ✅ async function creates its own scope
async function outer() {
  const outerVar = 'outer';
  
  async function inner() {
    console.log(outerVar);  // Can access outer scope
  }
  
  await inner();
}

// ✅ Variables are isolated
async function isolatedScope() {
  const data = 'local';
}

// console.log(data);  // ReferenceError: data is not defined
```

---

## await Expression

### Basic await

```javascript
// ✅ await pauses execution until promise settles
async function example() {
  console.log('1. Start');
  
  const result = await Promise.resolve('2. Middle');
  console.log(result);
  
  console.log('3. End');
}

example();

// Output:
// 1. Start
// 2. Middle
// 3. End
```

### await with Different Promise States

```javascript
// ✅ await with fulfilled promise
async function withSuccess() {
  const value = await Promise.resolve('Success');
  console.log(value);  // Success
}

// ✅ await with rejected promise (throws error)
async function withError() {
  try {
    const value = await Promise.reject(new Error('Oops'));
  } catch (error) {
    console.error(error.message);  // Oops
  }
}

// ✅ await with delayed promise
async function withDelay() {
  console.log('Waiting...');
  const result = await new Promise(resolve => {
    setTimeout(() => resolve('Done'), 1000);
  });
  console.log(result);  // Done (after 1 second)
}
```

### await with Non-Promise Values

```javascript
// ✅ await works with non-promise values (wraps them)
async function withValue() {
  const num = await 42;
  console.log(num);  // 42
  
  const str = await 'hello';
  console.log(str);  // hello
}

// ✅ await with thenable
const thenable = {
  then(resolve) {
    resolve('Thenable value');
  }
};

async function withThenable() {
  const value = await thenable;
  console.log(value);  // Thenable value
}
```

### Multiple Awaits

```javascript
// ✅ Sequential awaits
async function sequential() {
  console.log('1');
  await delay(100);
  console.log('2');
  await delay(100);
  console.log('3');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Takes 200ms total
sequential();
```

---

## Error Handling with try/catch

### Basic try/catch

```javascript
// ✅ Catch errors from await
async function withErrorHandling() {
  try {
    const result = await Promise.reject(new Error('Failed'));
  } catch (error) {
    console.error('Caught:', error.message);
  }
}

// ✅ Multiple awaits with shared error handling
async function multipleAwaits() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('Operation failed:', error.message);
    throw error;  // Re-throw if needed
  }
}
```

### Error Propagation

```javascript
// ✅ Error in await stops execution
async function errorStops() {
  console.log('1');
  
  try {
    await Promise.reject(new Error('Error'));
    console.log('2');  // Never executes
  } catch (error) {
    console.log('3');  // Executes
  }
  
  console.log('4');  // Continues after catch
}

// ✅ Specific error handling
async function specificHandling() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
    } else if (error instanceof SyntaxError) {
      console.error('Invalid JSON:', error);
    } else {
      console.error('Unknown error:', error);
    }
  }
}
```

### finally Block

```javascript
// ✅ finally runs regardless of outcome
async function withFinally() {
  const resource = await acquireResource();
  
  try {
    console.log('Using resource');
    await doWork(resource);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Cleaning up');
    releaseResource(resource);
  }
}

// ✅ finally for logging/metrics
async function withMetrics() {
  const start = Date.now();
  
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed');
    throw error;
  } finally {
    console.log(`Operation took ${Date.now() - start}ms`);
  }
}
```

---

## Parallel Execution

### Running Awaits in Parallel

```javascript
// ❌ WRONG: Sequential (takes longer)
async function sequential() {
  const user = await fetchUser(1);     // 100ms
  const posts = await fetchPosts(1);   // 100ms
  const comments = await fetchComments(1);  // 100ms
  
  // Total: 300ms
  return { user, posts, comments };
}

// ✅ CORRECT: Parallel (faster!)
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),       // Starts immediately
    fetchPosts(1),      // Starts immediately
    fetchComments(1)    // Starts immediately
  ]);
  
  // Total: 100ms (all run in parallel)
  return { user, posts, comments };
}

// ✅ Alternative with Promise.all
async function parallelAlternative() {
  const promises = [
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
  ];
  
  const results = await Promise.all(promises);
  return results;
}
```

### Partial Parallelization

```javascript
// ✅ Some operations depend on others
async function partialParallel() {
  // Get user first (needed for other fetches)
  const user = await fetchUser(1);
  
  // These can run in parallel
  const [posts, settings, recommendations] = await Promise.all([
    fetchPosts(user.id),
    fetchSettings(user.id),
    fetchRecommendations(user.id)
  ]);
  
  return { user, posts, settings, recommendations };
}
```

---

## Sequential vs Concurrent Patterns

### Sequential Pattern (Dependent Operations)

```javascript
// ✅ Each operation depends on the previous
async function sequential() {
  const user = await getUser(userId);
  
  const userPosts = await getPosts(user.id);
  
  const firstPostComments = await getComments(userPosts[0].id);
  
  return { user, posts: userPosts, comments: firstPostComments };
}

// Don't do this in parallel:
// ❌ const [user, posts] = await Promise.all([getUser(userId), getPosts(userId)]);
// Because getPosts needs user.id which we get from getUser
```

### Concurrent Pattern (Independent Operations)

```javascript
// ✅ Operations don't depend on each other
async function concurrent() {
  // All can start immediately
  const [weather, news, stocks] = await Promise.all([
    fetchWeather(),
    fetchNews(),
    fetchStocks()
  ]);
  
  return { weather, news, stocks };
}
```

### Mixed Pattern (Some Dependent, Some Independent)

```javascript
// ✅ Smart combination
async function mixed() {
  // Step 1: Get independent data in parallel
  const [weather, news] = await Promise.all([
    fetchWeather(),
    fetchNews()
  ]);
  
  // Step 2: Get data that depends on Step 1
  const [forecast, headlines] = await Promise.all([
    getForecast(weather.location),
    getHeadlines(news.category)
  ]);
  
  return { weather, news, forecast, headlines };
}
```

---

## Top-Level await

### Using await Outside async Function

```javascript
// ✅ Top-level await (ES2022, modules only)
// In a .mjs file or type: module in package.json

const response = await fetch('/api/data');
const data = await response.json();

console.log('Data loaded:', data);

// Must be in module context, not global scope
```

### Use Cases

```javascript
// ✅ Initialize module
const config = await loadConfig();
const db = await connectDatabase(config);

export { db, config };

// ✅ Conditional imports
const API_URL = await getApiUrl();

const client = API_URL.includes('localhost')
  ? await import('./mockClient.js')
  : await import('./realClient.js');

export { client };

// ✅ Running code at module load
await migrateDatabase();
console.log('Database ready');
```

### Browser Support

```javascript
// ✅ Top-level await in module script
// <script type="module">
//   const data = await fetch('/api/data').then(r => r.json());
//   console.log(data);
// </script>

// Note: Only in modules (type="module")
// NOT in regular scripts or IIFE
```

---

## Async Function Return Values

### Return Types

```javascript
// ✅ Explicit return
async function withReturn() {
  return { data: 'value' };
}

withReturn().then(result => {
  console.log(result);  // { data: 'value' }
});

// ✅ No explicit return (returns undefined)
async function noReturn() {
  console.log('doing work');
}

noReturn().then(result => {
  console.log(result);  // undefined
});

// ✅ Conditional returns
async function conditional(success) {
  if (success) {
    return 'Success value';
  } else {
    throw new Error('Failed');
  }
}

// ✅ Returning another promise
async function chainedPromises() {
  return await new Promise(resolve => {
    setTimeout(() => resolve('value'), 100);
  });
}
```

### Type Inference

```javascript
// ✅ Return type is Promise<T>
async function returns(): Promise<string> {
  return 'value';
}

// ✅ Can't return Promise<Promise<T>>
// (gets flattened automatically)
async function flat() {
  return Promise.resolve(Promise.resolve('value'));
  // Returns Promise<string>, not Promise<Promise<string>>
}
```

---

## Common Patterns

### Pattern 1: Retry with Exponential Backoff

```javascript
// ✅ Automatic retry
async function retryWithBackoff(
  fn,
  maxRetries = 3,
  delay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      console.log(`Retry ${i + 1}...`);
    }
  }
}

// Usage
const data = await retryWithBackoff(
  () => fetch('/api/data').then(r => r.json()),
  3,
  1000
);
```

### Pattern 2: Timeout

```javascript
// ✅ Promise with timeout
async function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// Usage
try {
  const result = await withTimeout(
    fetch('/api/slow-endpoint'),
    5000
  );
} catch (error) {
  console.error(error.message);  // Operation timed out
}
```

### Pattern 3: Batch Processing

```javascript
// ✅ Process items in batches
async function processBatch(items, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// Usage
const allResults = await processBatch(hugeArray, 10);
```

### Pattern 4: Sequential Operations

```javascript
// ✅ Array of async operations
async function sequentialOperations(items) {
  const results = [];
  
  for (const item of items) {
    const result = await process(item);
    results.push(result);
  }
  
  return results;
}

// Usage
const results = await sequentialOperations([1, 2, 3, 4, 5]);
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use async for functions that need to await
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ Use try-catch for error handling
async function safeOperation() {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;  // Or handle appropriately
  }
}

// ✅ Use Promise.all for parallel operations
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC()
  ]);
  return { a, b, c };
}

// ✅ Return promises from async functions
async function returnsPromise() {
  return await somePromise;
  // Or: return somePromise;
}

// ✅ Use finally for cleanup
async function withCleanup() {
  try {
    return await operation();
  } finally {
    cleanup();
  }
}
```

### ❌ DON'T

```javascript
// ❌ Don't use async if you don't need await
// Use regular function instead
async function unnecessary() {
  return { data: 'value' };
}

// ✅ Should be:
function unnecessary() {
  return { data: 'value' };
}

// ❌ Don't await non-promises unnecessarily
async function pointless() {
  const x = await 42;  // Unnecessary await
  return x;
}

// ❌ Don't use await in loops when parallel is possible
async function slowLoop() {
  const results = [];
  for (const item of items) {
    results.push(await process(item));  // Sequential!
  }
  return results;
}

// ✅ Should be:
async function fastParallel() {
  return Promise.all(items.map(item => process(item)));
}

// ❌ Don't swallow errors silently
async function swallowErrors() {
  try {
    await operation();
    // Error silently ignored!
  } catch (error) {
    // Should at least log
  }
}

// ❌ Don't forget to return from async
async function forgetsReturn() {
  await operation();
  // Forgot return!
}

// ✅ Should be:
async function properReturn() {
  return await operation();
}
```

---

## Summary

### Async/Await Key Points

| Concept | Details |
|---------|---------|
| **async** | Declares async function, returns Promise |
| **await** | Pauses execution, waits for promise |
| **Try/catch** | Error handling for await |
| **Finally** | Cleanup code |
| **Parallel** | Use Promise.all for independent operations |
| **Sequential** | Use await in sequence for dependent operations |
| **Top-level await** | ES2022, modules only |

### Execution Flow

```javascript
async function example() {
  console.log('1');           // Executes immediately
  
  await delay(100);           // Pauses here
  
  console.log('2');           // Resumes after delay
}

example();
console.log('3');             // Executes before '2'

// Output: 1, 3, 2
```

### Quick Comparison

```javascript
// Promise-based
promise
  .then(handleSuccess)
  .catch(handleError)
  .finally(cleanup);

// Async/await
try {
  const result = await promise;
  handleSuccess(result);
} catch (error) {
  handleError(error);
} finally {
  cleanup();
}
```

### Next Steps

- Master async patterns
- Learn concurrent patterns
- Understand error handling strategies
- Apply to production code