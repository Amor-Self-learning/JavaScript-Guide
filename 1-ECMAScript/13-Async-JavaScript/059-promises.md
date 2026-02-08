# Promises 

## Table of Contents
1. [Introduction to Promises](#introduction-to-promises)
2. [Promise States](#promise-states)
3. [Creating Promises](#creating-promises)
4. [then(), catch(), finally()](#then-catch-finally)
5. [Promise Chaining](#promise-chaining)
6. [Error Propagation](#error-propagation)
7. [Promise.resolve() and Promise.reject()](#promiseresolve-and-promisereject)
8. [Promise.all()](#promiseall)
9. [Promise.race()](#promiserace)
10. [Promise.allSettled()](#promiseallsettled)
11. [Promise.any()](#promiseany)
12. [Promise.try() (Proposal)](#promisetry-proposal)
13. [Practical Examples](#practical-examples)
14. [Best Practices](#best-practices)
15. [Summary](#summary)

---

## Introduction to Promises

### What is a Promise?

A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value.

```javascript
// ✅ A Promise will eventually be fulfilled or rejected
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
  }, 100);
});

promise.then((result) => {
  console.log(result);  // Success!
});
```

### Promise vs Callbacks

| Aspect | Callback | Promise |
|--------|----------|---------|
| **Flow** | Nested (pyramid) | Chained (flat) |
| **Error handling** | Try-catch per level | Centralized catch |
| **Readability** | Hard (deeply nested) | Better (left-to-right) |
| **Multiple operations** | Callback hell | Clean chains |
| **Inversion of Control** | Problem | Solved |

---

## Promise States

### The Three States

A Promise is always in one of three states:

1. **Pending** - Initial state, operation hasn't completed yet
2. **Fulfilled** - Operation completed successfully (resolved)
3. **Rejected** - Operation failed with an error

```javascript
// ✅ Promise states
const pending = new Promise(() => {
  // Does nothing, stays pending
});

const fulfilled = new Promise((resolve) => {
  resolve('Success');
  // State changes to fulfilled
});

const rejected = new Promise((resolve, reject) => {
  reject(new Error('Failure'));
  // State changes to rejected
});

// Once a promise settles (fulfilled or rejected), it cannot change
const settled = new Promise((resolve) => {
  resolve('First');
  resolve('Second');  // Ignored
  resolve('Third');   // Ignored
});

settled.then((value) => {
  console.log(value);  // Only logs 'First'
});
```

### State Transitions

```
┌─────────────┐
│   PENDING   │  ← Initial state
└─────────────┘
        │
        ├─ Called resolve(value)
        │  ↓
    ┌─────────────┐
    │ FULFILLED   │  ← Terminal state (immutable)
    └─────────────┘
        │
        ├─ Called reject(error)
        │  ↓
    ┌─────────────┐
    │  REJECTED   │  ← Terminal state (immutable)
    └─────────────┘
```

---

## Creating Promises

### Basic Promise Creation

```javascript
// ✅ Create and resolve immediately
const immediate = new Promise((resolve) => {
  resolve('Value');
});

// ✅ Create and reject immediately
const error = new Promise((resolve, reject) => {
  reject(new Error('Oops'));
});

// ✅ Asynchronous operation
const delayed = new Promise((resolve) => {
  setTimeout(() => {
    resolve('Done after 1 second');
  }, 1000);
});

// ✅ Conditional resolution/rejection
const conditional = new Promise((resolve, reject) => {
  const randomValue = Math.random();
  
  if (randomValue > 0.5) {
    resolve('Success');
  } else {
    reject(new Error('Unlucky'));
  }
});
```

### Promise Executor Function

```javascript
// ✅ Executor runs immediately
console.log('1');

const promise = new Promise((resolve, reject) => {
  console.log('2');  // Runs immediately
  resolve('3');
});

console.log('4');

// Output: 1, 2, 4
// Then: 3 (async handler)

promise.then((value) => {
  console.log(value);
});
```

### Common Promise Patterns

```javascript
// ✅ Timeout pattern
function timeoutPromise(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Timeout completed');
    }, ms);
  });
}

// ✅ Rejection pattern
function rejectAfter(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, ms);
  });
}

// ✅ Immediate resolution
function resolved(value) {
  return Promise.resolve(value);
}

// ✅ Immediate rejection
function rejected(error) {
  return Promise.reject(error);
}

// Usage
timeoutPromise(100).then((msg) => console.log(msg));
```

---

## then(), catch(), finally()

### then() - Handle Fulfilled State

```javascript
// ✅ Basic then()
const promise = Promise.resolve('Success');

promise.then((value) => {
  console.log('Fulfilled:', value);
});

// ✅ then() returns a new promise
const chain = promise
  .then((value) => {
    console.log('First then:', value);
    return value.toUpperCase();
  })
  .then((uppercased) => {
    console.log('Second then:', uppercased);
  });

// ✅ then() with transformation
Promise.resolve(5)
  .then((num) => num * 2)
  .then((doubled) => doubled + 10)
  .then((result) => console.log(result));  // 20
```

### catch() - Handle Rejected State

```javascript
// ✅ Basic catch()
const failed = Promise.reject(new Error('Oops'));

failed.catch((error) => {
  console.error('Caught error:', error.message);
});

// ✅ catch() returns a new promise
Promise.reject(new Error('First error'))
  .catch((error) => {
    console.error('Handling:', error.message);
    return 'Recovered';  // Returns resolved promise
  })
  .then((result) => {
    console.log('After recovery:', result);
  });

// ✅ Multiple catch handlers
Promise.reject(new Error('Error 1'))
  .catch((error) => {
    throw new Error('Error 2');  // Convert to different error
  })
  .catch((error) => {
    console.error('Final catch:', error.message);
  });
```

### finally() - Always Execute

```javascript
// ✅ finally() runs regardless of state
let cleanup = false;

Promise.resolve('Success')
  .finally(() => {
    cleanup = true;
    console.log('Cleaning up...');
  })
  .then(() => {
    console.log('Cleanup done:', cleanup);  // true
  });

// ✅ finally() with rejection
Promise.reject(new Error('Error'))
  .finally(() => {
    console.log('This runs even with error');
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

// ✅ Common pattern: resource management
function withResource(resourceId) {
  return acquireResource(resourceId)
    .then((resource) => {
      return doWork(resource);
    })
    .finally(() => {
      return releaseResource(resourceId);
    });
}
```

---

## Promise Chaining

### Method Chaining

```javascript
// ✅ Chain multiple operations
function step1() {
  return Promise.resolve('Step 1 complete');
}

function step2(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Step 2: ${input}`);
    }, 100);
  });
}

function step3(input) {
  return Promise.resolve(`Step 3: ${input}`);
}

step1()
  .then((result) => {
    console.log(result);
    return step2(result);
  })
  .then((result) => {
    console.log(result);
    return step3(result);
  })
  .then((result) => {
    console.log(result);
  });
```

### Returning Promises from Handlers

```javascript
// ✅ Return promises to continue chain
Promise.resolve(1)
  .then((value) => {
    console.log('Value:', value);
    
    // Return another promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(value * 2);
      }, 100);
    });
  })
  .then((doubled) => {
    console.log('Doubled:', doubled);
    return Promise.resolve(doubled + 10);
  })
  .then((final) => {
    console.log('Final:', final);
  });

// Output: Value: 1, Doubled: 2, Final: 12
```

### Flattening Chains

```javascript
// ✅ Promises automatically flatten nested promises
const nested = Promise.resolve(
  Promise.resolve(
    Promise.resolve('Deeply nested')
  )
);

nested.then((value) => {
  console.log(value);  // 'Deeply nested' (automatically unwrapped)
});
```

---

## Error Propagation

### Error Handling in Chains

```javascript
// ✅ Error propagates through chain
Promise.resolve(1)
  .then((value) => {
    throw new Error('Error in first then');
  })
  .then((value) => {
    // This is skipped due to error
    console.log('Never executes');
  })
  .catch((error) => {
    console.error('Caught:', error.message);
  });

// ✅ Recovery from error
Promise.reject(new Error('Initial error'))
  .catch((error) => {
    console.error('Caught:', error.message);
    return 'Recovered';  // Recovers from error
  })
  .then((value) => {
    console.log('After recovery:', value);
  });
```

### Re-throwing Errors

```javascript
// ✅ Re-throw to propagate error
Promise.reject(new Error('Original error'))
  .catch((error) => {
    console.error('Caught:', error.message);
    
    if (error.message.includes('Original')) {
      throw error;  // Re-throw
    }
    
    return 'Handled';
  })
  .catch((error) => {
    console.error('Final catch:', error.message);
  });

// ✅ Convert error type
Promise.reject(new Error('Network error'))
  .catch((error) => {
    throw new Error(`Wrapped: ${error.message}`);
  })
  .catch((error) => {
    console.error(error.message);  // Wrapped: Network error
  });
```

---

## Promise.resolve() and Promise.reject()

### Promise.resolve()

```javascript
// ✅ Resolve with value
Promise.resolve('Value')
  .then((value) => {
    console.log(value);  // Value
  });

// ✅ Resolve with another promise
const original = Promise.resolve('Original');
const wrapped = Promise.resolve(original);

wrapped.then((value) => {
  console.log(value);  // Original
});

// ✅ Resolve with thenable (object with .then())
const thenable = {
  then(onFulfill) {
    onFulfill('Thenable value');
  }
};

Promise.resolve(thenable)
  .then((value) => {
    console.log(value);  // Thenable value
  });

// ✅ Convert values to promises
const promises = [1, 2, 3]
  .map(num => Promise.resolve(num * 2));

// All are now promises
```

### Promise.reject()

```javascript
// ✅ Create rejected promise
Promise.reject(new Error('Rejected'))
  .catch((error) => {
    console.error(error.message);
  });

// ✅ Reject with any value
Promise.reject('Rejection reason')
  .catch((reason) => {
    console.error(reason);
  });
```

---

## Promise.all()

### Execute Multiple Promises in Parallel

```javascript
// ✅ Wait for all promises to resolve
const p1 = Promise.resolve(1);
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 100));
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then((results) => {
    console.log(results);  // [1, 2, 3]
  });

// ✅ Fails if any promise rejects
Promise.all([
  Promise.resolve('a'),
  Promise.reject(new Error('Error')),
  Promise.resolve('c')
])
  .catch((error) => {
    console.error('Error caught:', error.message);
    // Results b and c are ignored
  });
```

### Practical Promise.all() Examples

```javascript
// ✅ Fetch multiple resources
function fetchUsers() {
  return Promise.all([
    fetch('/api/user/1'),
    fetch('/api/user/2'),
    fetch('/api/user/3')
  ])
  .then((responses) => Promise.all(responses.map(r => r.json())))
  .then((users) => {
    console.log('All users:', users);
    return users;
  });
}

// ✅ Parallel image loading
const imageUrls = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
];

const loadImages = imageUrls.map(url => 
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed: ${url}`));
    img.src = url;
  })
);

Promise.all(loadImages)
  .then(() => {
    console.log('All images loaded');
  })
  .catch((error) => {
    console.error('Image loading failed:', error);
  });
```

---

## Promise.race()

### First Promise to Settle Wins

```javascript
// ✅ Promise.race returns first settled promise
const fast = Promise.resolve('Fast');
const slow = new Promise(resolve => setTimeout(() => resolve('Slow'), 1000));

Promise.race([fast, slow])
  .then((result) => {
    console.log(result);  // Fast
  });

// ✅ First rejection also wins
Promise.race([
  Promise.reject(new Error('First error')),
  Promise.resolve('Success'),
  new Promise(resolve => setTimeout(() => resolve('Slow'), 1000))
])
  .catch((error) => {
    console.error(error.message);  // First error
  });
```

### Practical Race Examples

```javascript
// ✅ Timeout pattern
function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// ✅ Usage
withTimeout(
  fetch('/api/data'),
  5000
)
  .then(response => response.json())
  .catch(error => console.error('Failed or timed out:', error));

// ✅ First successful fetch wins
const fetchFromMirrors = Promise.race([
  fetch('https://server1.com/data'),
  fetch('https://server2.com/data'),
  fetch('https://server3.com/data')
]);
```

---

## Promise.allSettled()

### Wait for All Promises Regardless of Outcome

```javascript
// ✅ Promise.allSettled waits for all, regardless of rejection
Promise.allSettled([
  Promise.resolve('a'),
  Promise.reject(new Error('b')),
  Promise.resolve('c')
])
  .then((results) => {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 'a' },
    //   { status: 'rejected', reason: Error('b') },
    //   { status: 'fulfilled', value: 'c' }
    // ]
  });

// ✅ Never rejects (always resolves)
Promise.allSettled([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2'))
])
  .then((results) => {
    // This executes (no error thrown)
    results.forEach(result => {
      if (result.status === 'rejected') {
        console.error('Failed:', result.reason);
      }
    });
  });
```

### Use Cases

```javascript
// ✅ Batch operations where partial failure is acceptable
function processItems(items) {
  const promises = items.map(item => processItem(item));
  
  return Promise.allSettled(promises)
    .then((results) => {
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      
      console.log(`Processed ${successes.length}/${results.length}`);
      
      return {
        successes: successes.map(r => r.value),
        failures: failures.map(r => r.reason)
      };
    });
}

// ✅ Don't fail entire operation if one resource fails
Promise.allSettled([
  fetchUserProfile(),
  fetchUserPosts(),
  fetchUserComments()
])
  .then((results) => {
    const profile = results[0].status === 'fulfilled' ? results[0].value : null;
    const posts = results[1].status === 'fulfilled' ? results[1].value : [];
    const comments = results[2].status === 'fulfilled' ? results[2].value : [];
    
    renderPage({ profile, posts, comments });
  });
```

---

## Promise.any()

### First Fulfilled Promise Wins

```javascript
// ✅ Promise.any returns first fulfilled (ignores rejections)
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.resolve('Success')
])
  .then((result) => {
    console.log(result);  // Success
  });

// ✅ Rejects only if ALL reject
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.reject(new Error('Error 3'))
])
  .catch((error) => {
    console.error(error.message);  // All promises were rejected
    console.error(error.errors);   // Array of all rejection reasons
  });
```

### Practical Examples

```javascript
// ✅ Try multiple sources, use first success
function fetchFromSources(url) {
  return Promise.any([
    fetch(`https://source1.com${url}`),
    fetch(`https://source2.com${url}`),
    fetch(`https://source3.com${url}`)
  ])
  .then(response => response.json())
  .catch(error => {
    console.error('All sources failed');
    throw error;
  });
}
```

---

## Promise.try() (Proposal)

### Wrapping Sync and Async Code

```javascript
// ✅ Promise.try() handles both sync and async errors
// (This is a Stage 3 proposal, not yet standard)

// Simulated implementation
function promiseTry(fn) {
  return Promise.resolve().then(fn);
}

// Usage
promiseTry(() => {
  throw new Error('Sync error');
})
  .catch((error) => {
    console.error('Caught:', error.message);
  });

// vs without Promise.try (must handle sync errors)
try {
  const result = (async () => {
    throw new Error('Error');
  })();
  
  result.catch(error => console.error(error));
} catch (error) {
  console.error(error);
}
```

---

## Practical Examples

### Example 1: Sequential Fetch

```javascript
// ✅ Fetch user, then posts, then comments
function loadUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then((user) => {
      return fetch(`/api/users/${userId}/posts`)
        .then(response => response.json())
        .then((posts) => ({ user, posts }));
    })
    .then(({ user, posts }) => {
      return fetch(`/api/posts/${posts[0].id}/comments`)
        .then(response => response.json())
        .then((comments) => ({ user, posts, comments }));
    })
    .catch((error) => {
      console.error('Failed to load user data:', error);
    });
}

loadUserData(1).then(data => console.log(data));
```

### Example 2: Parallel Requests with Fallback

```javascript
// ✅ Try primary then fallback
function loadWithFallback() {
  return Promise.any([
    fetch('/api/primary/data'),
    new Promise(resolve => 
      setTimeout(() => resolve(fetch('/api/fallback/data')), 1000)
    )
  ])
  .then(response => response.json());
}
```

### Example 3: Retry Logic

```javascript
// ✅ Retry with exponential backoff
function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  return fn().catch((error) => {
    if (maxRetries === 0) throw error;
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(retryWithBackoff(fn, maxRetries - 1, delay * 2));
      }, delay);
    });
  });
}

retryWithBackoff(() => fetch('/api/data'), 3)
  .then(response => response.json())
  .catch(error => console.error('Failed after retries'));
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use Promise.all for parallel operations
Promise.all([
  fetch('/api/1'),
  fetch('/api/2'),
  fetch('/api/3')
]);

// ✅ Chain promises for sequential operations
Promise.resolve(1)
  .then(x => x * 2)
  .then(x => x + 10);

// ✅ Use catch to handle errors
promise
  .then(success)
  .catch(error);

// ✅ Use finally for cleanup
promise
  .finally(() => {
    cleanup();
  });

// ✅ Return promises from handlers
.then(result => {
  return anotherPromise(result);
});
```

### ❌ DON'T

```javascript
// ❌ Don't create "promise inside promise"
new Promise((resolve) => {
  new Promise((innerResolve) => {
    innerResolve('value');
  }).then(v => resolve(v));
});

// ❌ Don't forget to return in chain
promise
  .then(result => {
    anotherPromise(result);  // Forgot to return!
  });

// ❌ Don't use .then() for sync operations
Promise.resolve()
  .then(() => {
    const x = 2 + 2;  // Should just do this directly
  });

// ❌ Don't catch and re-throw without handling
promise
  .catch(error => {
    throw error;  // Just let it propagate
  });
```

---

## Summary

### Promise Methods Overview

| Method | Purpose | Returns |
|--------|---------|---------|
| **then()** | Handle fulfilled value | New promise |
| **catch()** | Handle rejection | New promise |
| **finally()** | Always execute | New promise |
| **Promise.resolve()** | Create fulfilled promise | Promise |
| **Promise.reject()** | Create rejected promise | Promise |
| **Promise.all()** | All must succeed | Promise |
| **Promise.race()** | First to settle | Promise |
| **Promise.allSettled()** | Wait for all | Promise |
| **Promise.any()** | First fulfilled | Promise |

### When to Use Each Combinator

```javascript
// All must succeed
Promise.all([p1, p2, p3])

// First to settle wins
Promise.race([p1, p2, p3])

// All complete, partial failures OK
Promise.allSettled([p1, p2, p3])

// First success wins (skip failures)
Promise.any([p1, p2, p3])
```

### Next Steps

- Master async/await for cleaner syntax
- Learn async patterns and best practices
- Understand concurrency patterns
- Apply to real-world scenarios