# Callbacks 

## Table of Contents
1. [Introduction to Callbacks](#introduction-to-callbacks)
2. [Callback Pattern](#callback-pattern)
3. [Error-First Callbacks](#error-first-callbacks)
4. [Callback Hell](#callback-hell)
5. [Inversion of Control](#inversion-of-control)
6. [Advanced Callback Patterns](#advanced-callback-patterns)
7. [Best Practices](#best-practices)
8. [Summary](#summary)

---

## Introduction to Callbacks

### What is a Callback?

A **callback** is a function passed as an argument to another function, which is executed after some operation has been performed.

```javascript
// ✅ Simple callback
function greet(name, callback) {
  console.log(`Hello, ${name}!`);
  callback();
}

function sayGoodbye() {
  console.log('Goodbye!');
}

greet('Alice', sayGoodbye);
// Output: Hello, Alice! Goodbye!

// ✅ Callback as anonymous function
greet('Bob', () => {
  console.log('See you later!');
});
// Output: Hello, Bob! See you later!
```

### Synchronous vs Asynchronous Callbacks

```javascript
// ✅ Synchronous callback (executes immediately)
function syncCallback(fn) {
  fn();
}

syncCallback(() => {
  console.log('Sync callback executed');
});

// ✅ Asynchronous callback (executes later)
function asyncCallback(fn) {
  setTimeout(fn, 100);
}

asyncCallback(() => {
  console.log('Async callback executed');
});
```

---

## Callback Pattern

### Basic Callback Pattern

```javascript
// ✅ Standard callback for async operations
function fetchData(url, callback) {
  // Simulate async operation
  setTimeout(() => {
    const data = { id: 1, name: 'User' };
    callback(data);
  }, 100);
}

fetchData('https://api.example.com/user', (data) => {
  console.log('Data received:', data);
});

// Output: Data received: { id: 1, name: 'User' }
```

### Callback with Multiple Parameters

```javascript
// ✅ Callback receiving multiple values
function calculateAsync(a, b, callback) {
  setTimeout(() => {
    const result = a + b;
    callback(result);
  }, 100);
}

calculateAsync(5, 3, (result) => {
  console.log(`Result: ${result}`);
});

// Output: Result: 8
```

### Array Methods with Callbacks

```javascript
// ✅ Array.forEach uses callbacks
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((num) => {
  console.log(num * 2);
});

// ✅ Array.map uses callbacks
const doubled = numbers.map((num) => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// ✅ Array.filter uses callbacks
const evens = numbers.filter((num) => num % 2 === 0);
console.log(evens);  // [2, 4]

// ✅ Array.reduce uses callbacks
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum);  // 15
```

### Event Listeners with Callbacks

```javascript
// ✅ Event listeners are callbacks
const button = document.querySelector('button');

button.addEventListener('click', () => {
  console.log('Button clicked!');
});

// ✅ Remove event listener
function handleClick() {
  console.log('Clicked!');
}

button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);
```

---

## Error-First Callbacks

### The Error-First Convention

The **error-first callback** (Node.js convention) takes error as the first parameter:

```javascript
// ✅ Error-first callback pattern
function readFile(filename, callback) {
  // Simulated file reading
  setTimeout(() => {
    if (filename === 'nonexistent.txt') {
      // First argument: error
      callback(new Error('File not found'));
    } else {
      // First argument: null (no error)
      // Second argument: data
      callback(null, 'File contents');
    }
  }, 100);
}

readFile('document.txt', (error, data) => {
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Data:', data);
  }
});

// Using with nonexistent file
readFile('nonexistent.txt', (error, data) => {
  if (error) {
    console.error('Error:', error.message);  // Error: File not found
  }
});
```

### Multiple Callbacks for Different States

```javascript
// ✅ Success and error callbacks
function fetchUserData(userId, onSuccess, onError) {
  setTimeout(() => {
    if (userId > 0) {
      onSuccess({ id: userId, name: 'User' });
    } else {
      onError('Invalid user ID');
    }
  }, 100);
}

fetchUserData(
  1,
  (data) => {
    console.log('Success:', data);
  },
  (error) => {
    console.error('Error:', error);
  }
);
```

### Callback with Finally

```javascript
// ✅ Success, error, and finally callbacks
function performOperation(callback) {
  let loading = true;
  
  const onSuccess = (data) => {
    console.log('Success:', data);
    callback();
  };
  
  const onError = (error) => {
    console.error('Error:', error);
    callback();
  };
  
  // Do something
  setTimeout(() => {
    if (Math.random() > 0.5) {
      onSuccess({ result: 42 });
    } else {
      onError('Operation failed');
    }
  }, 100);
}

performOperation(() => {
  console.log('Operation complete');
});
```

---

## Callback Hell

### What is Callback Hell?

**Callback hell** (or "pyramid of doom") occurs when multiple nested callbacks make code hard to read and maintain.

```javascript
// ❌ Callback hell example
function getData(callback) {
  setTimeout(() => {
    callback({ userId: 1 });
  }, 100);
}

function getUser(userId, callback) {
  setTimeout(() => {
    callback({ id: userId, name: 'John' });
  }, 100);
}

function getPosts(userId, callback) {
  setTimeout(() => {
    callback([{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]);
  }, 100);
}

function getComments(postId, callback) {
  setTimeout(() => {
    callback([{ id: 1, text: 'Comment 1' }]);
  }, 100);
}

// Callback hell!
getData((data) => {
  getUser(data.userId, (user) => {
    getPosts(user.id, (posts) => {
      getComments(posts[0].id, (comments) => {
        console.log('Finally got comments:', comments);
      });
    });
  });
});
```

### Problems with Callback Hell

1. **Difficult to read** - Code flows right, not down
2. **Hard to maintain** - Changes require deep nesting edits
3. **Error handling is complex** - Need try-catch at each level
4. **Testing is harder** - Hard to isolate functionality

### Solutions to Callback Hell

**Solution 1: Named Functions**

```javascript
// ✅ Using named functions instead of nested callbacks
function handleData(data) {
  getUser(data.userId, handleUser);
}

function handleUser(user) {
  getPosts(user.id, handlePosts);
}

function handlePosts(posts) {
  getComments(posts[0].id, handleComments);
}

function handleComments(comments) {
  console.log('Finally got comments:', comments);
}

getData(handleData);
```

**Solution 2: Promises**

```javascript
// ✅ Using Promises (chain with .then())
getData()
  .then((data) => getUser(data.userId))
  .then((user) => getPosts(user.id))
  .then((posts) => getComments(posts[0].id))
  .then((comments) => {
    console.log('Finally got comments:', comments);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

**Solution 3: Async/Await**

```javascript
// ✅ Using async/await (looks like sync code)
async function fetchComments() {
  try {
    const data = await getData();
    const user = await getUser(data.userId);
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
    console.log('Finally got comments:', comments);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchComments();
```

---

## Inversion of Control

### What is Inversion of Control?

**Inversion of Control (IoC)** means you lose control of when and how your callback is executed. You must trust the library/function to call it correctly.

```javascript
// ❌ Loss of control
function saveUserData(user, callback) {
  // You pass your callback but don't control:
  // - When it's called
  // - How many times it's called
  // - With what arguments
  // - In what context (this value)
  
  setTimeout(() => {
    callback(user);  // Hope they call it right!
  }, 100);
}

saveUserData({ name: 'John' }, (result) => {
  console.log('Saved:', result);
});
```

### Risks of IoC with Callbacks

```javascript
// ❌ Risk 1: Callback called multiple times
function buggyOperation(callback) {
  callback('first');
  callback('second');  // Called twice!
  callback('third');   // Called three times!
}

buggyOperation((result) => {
  console.log('Result:', result);  // Logs three times
});

// ❌ Risk 2: Callback never called
function forgotCallback(callback) {
  setTimeout(() => {
    // Oops, forgot to call callback!
    console.log('Operation complete');
  }, 100);
}

forgotCallback((result) => {
  console.log('Never executes');
});

// ❌ Risk 3: Callback called with wrong arguments
function wrongArguments(callback) {
  callback({ id: 1, wrong: 'data' });
}

wrongArguments((expectedData) => {
  // expectedData is not what we expected
  console.log(expectedData.name);  // undefined
});

// ❌ Risk 4: Callback called with wrong context
function wrongContext(callback) {
  callback.call({ wrongThis: true });
}

wrongContext(function() {
  // this might not be what we expected
  console.log(this);  // { wrongThis: true }
});
```

### IoC Solutions with Promises

```javascript
// ✅ Promises solve IoC problems
const promise = new Promise((resolve, reject) => {
  // - Can only be called once
  // - Either resolve() or reject()
  // - Cannot be called with wrong context
  
  resolve('success');
  
  // These have no effect (already settled)
  resolve('ignored');
  reject('ignored');
});

promise
  .then((result) => {
    console.log('Called exactly once:', result);
  })
  .catch((error) => {
    // Won't execute (promise resolved)
  });
```

---

## Advanced Callback Patterns

### Continuation-Passing Style (CPS)

```javascript
// ✅ Continuation-passing style
function add(a, b, continuation) {
  // Continue with the result
  continuation(a + b);
}

function multiply(a, b, continuation) {
  continuation(a * b);
}

// Chaining operations
add(2, 3, (result1) => {
  console.log('Add result:', result1);
  
  multiply(result1, 2, (result2) => {
    console.log('Multiply result:', result2);
  });
});
```

### Transforming Callbacks to Promises (Promisification)

```javascript
// ❌ Callback-based function
function readFileCallback(filename, callback) {
  setTimeout(() => {
    callback(null, `Contents of ${filename}`);
  }, 100);
}

// ✅ Convert to Promise
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    readFileCallback(filename, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

// Now usable with async/await
async function readFiles() {
  const data1 = await readFilePromise('file1.txt');
  const data2 = await readFilePromise('file2.txt');
  console.log(data1, data2);
}

readFiles();
```

### Callback Composition

```javascript
// ✅ Compose multiple callbacks
function compose(...fns) {
  return (value, callback) => {
    let index = 0;
    
    const next = (err, result) => {
      if (err) return callback(err);
      if (index >= fns.length) return callback(null, result);
      
      fns[index++](result, next);
    };
    
    next(null, value);
  };
}

function step1(value, next) {
  console.log('Step 1:', value);
  next(null, value * 2);
}

function step2(value, next) {
  console.log('Step 2:', value);
  next(null, value + 10);
}

function step3(value, next) {
  console.log('Step 3:', value);
  next(null, value * 3);
}

const pipeline = compose(step1, step2, step3);

pipeline(5, (error, result) => {
  console.log('Final result:', result);  // ((5 * 2) + 10) * 3 = 60
});
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use error-first callbacks
function operation(callback) {
  setTimeout(() => {
    const success = true;
    if (success) {
      callback(null, { data: 'success' });
    } else {
      callback(new Error('Failed'));
    }
  }, 100);
}

operation((error, result) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', result);
  }
});

// ✅ Document callback expectations
/**
 * Fetches user data
 * @param {number} userId - The user ID
 * @param {Function} callback - Called with (error, user)
 */
function getUser(userId, callback) {
  // Implementation
}

// ✅ Validate callbacks
function executeCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  callback();
}

// ✅ Consider using Promises for new code
function newFeature(input) {
  return new Promise((resolve, reject) => {
    if (input) {
      resolve({ data: 'success' });
    } else {
      reject(new Error('Invalid input'));
    }
  });
}
```

### ❌ DON'T

```javascript
// ❌ Don't nest callbacks unnecessarily
operation1((result1) => {
  operation2((result2) => {
    operation3((result3) => {
      console.log(result3);
    });
  });
});

// ❌ Don't forget error handling
function buggyOperation(callback) {
  callback(null, someUndefinedVariable);  // Will error
}

// ❌ Don't call callback multiple times (if you only meant to call once)
function buggy(callback) {
  callback('first');
  callback('second');  // Unexpected
}

// ❌ Don't assume callback will be called
function forgetful(callback) {
  // Forgot to call callback!
  console.log('Done');
}

// ❌ Don't use callbacks for synchronous operations
function sync(callback) {
  const result = 2 + 2;
  callback(result);  // Unnecessary
}

sync((result) => {
  console.log(result);
});
```

---

## Summary

### Callback Key Points

| Concept | Details |
|---------|---------|
| **Definition** | Function passed as argument to another function |
| **Synchronous** | Executes immediately |
| **Asynchronous** | Executes later |
| **Error-first** | Error as first parameter (Node.js convention) |
| **Hell** | Multiple nested callbacks (pyramid of doom) |
| **IoC Problem** | Loss of control over callback execution |
| **Solutions** | Promises, async/await, named functions |

### When to Use Callbacks

✅ **Still useful for:**
- Event listeners (DOM, EventEmitter)
- Array methods (map, filter, reduce, forEach)
- Simple async operations
- Legacy codebases

❌ **Avoid for:**
- Complex async flows
- Multiple sequential operations
- New code (use Promises/async-await)

### Callback vs Promises vs Async/Await

```javascript
// Callbacks
operation((error, result) => {
  if (error) throw error;
  console.log(result);
});

// Promises
operation()
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

// Async/Await
try {
  const result = await operation();
  console.log(result);
} catch (error) {
  console.error(error);
}
```

### Next Steps

- Master Promises and their power
- Learn async/await syntax
- Understand async patterns and antipatterns
- Apply to real-world projects