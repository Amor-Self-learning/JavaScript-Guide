# Async Patterns

## Table of Contents

- [Promise Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#promise-patterns)
- [Async/Await Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#asyncawait-patterns)
- [Observable Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#observable-pattern)
- [Reactive Programming Concepts](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#reactive-programming-concepts)

---

## Async Patterns

Async patterns help manage asynchronous operations, handling callbacks, promises, and event-driven programming effectively.

---

## Promise Patterns

Promises represent the eventual completion or failure of an asynchronous operation.

### Basic Promise Patterns

```javascript
// Creating promises
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchUser = id => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) {
      resolve({ id, name: `User ${id}` });
    } else {
      reject(new Error('Invalid ID'));
    }
  }, 1000);
});

// Using promises
fetchUser(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error));

// Chaining promises
fetchUser(1)
  .then(user => {
    console.log('Fetched user:', user);
    return fetchUser(2);
  })
  .then(user2 => {
    console.log('Fetched user 2:', user2);
  })
  .catch(error => console.error('Error:', error));
```

### Promise.all - Parallel Execution

```javascript
// Execute multiple promises in parallel
const fetchMultipleUsers = async ids => {
  const promises = ids.map(id => fetchUser(id));
  return Promise.all(promises);
};

fetchMultipleUsers([1, 2, 3])
  .then(users => {
    console.log('All users:', users);
  })
  .catch(error => {
    console.error('One or more requests failed:', error);
  });

// Practical example: Fetch data from multiple APIs
const fetchDashboardData = async () => {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};
```

### Promise.race - First to Complete

```javascript
// Return first promise to resolve/reject
const timeout = ms => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), ms)
);

const fetchWithTimeout = (url, ms) => {
  return Promise.race([
    fetch(url),
    timeout(ms)
  ]);
};

// Usage
fetchWithTimeout('/api/data', 5000)
  .then(response => response.json())
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Request failed or timed out:', error));

// Practical: Multiple endpoints, use first response
const fetchFromMirrors = urls => {
  const promises = urls.map(url => 
    fetch(url).then(r => r.json())
  );
  
  return Promise.race(promises);
};

fetchFromMirrors([
  'https://api1.example.com/data',
  'https://api2.example.com/data',
  'https://api3.example.com/data'
]).then(data => console.log('Fastest response:', data));
```

### Promise.allSettled - All Results

```javascript
// Wait for all promises to settle (resolve or reject)
const fetchAllData = async ids => {
  const promises = ids.map(id => fetchUser(id));
  const results = await Promise.allSettled(promises);
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
  
  return { successful, failed };
};

fetchAllData([1, 2, -1, 3])
  .then(({ successful, failed }) => {
    console.log('Successful:', successful);
    console.log('Failed:', failed);
  });

// Practical: Batch operations with error handling
const batchUpdate = async items => {
  const promises = items.map(item => updateItem(item));
  const results = await Promise.allSettled(promises);
  
  return {
    succeeded: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    results
  };
};
```

### Promise.any - First Successful

```javascript
// Return first promise to resolve (ignore rejections)
const fetchFromBackups = urls => {
  const promises = urls.map(url => 
    fetch(url).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
  );
  
  return Promise.any(promises);
};

fetchFromBackups([
  'https://primary.example.com/data',
  'https://backup1.example.com/data',
  'https://backup2.example.com/data'
])
  .then(data => console.log('Data from first successful:', data))
  .catch(error => console.error('All requests failed:', error));
```

### Sequential Promise Execution

```javascript
// Execute promises one after another
const sequential = async (tasks) => {
  const results = [];
  
  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }
  
  return results;
};

// Usage
const tasks = [
  () => fetchUser(1),
  () => fetchUser(2),
  () => fetchUser(3)
];

sequential(tasks)
  .then(results => console.log('Sequential results:', results));

// Reduce pattern
const sequentialReduce = tasks => {
  return tasks.reduce(
    (promise, task) => promise.then(results => 
      task().then(result => [...results, result])
    ),
    Promise.resolve([])
  );
};

sequentialReduce(tasks)
  .then(results => console.log('Results:', results));
```

### Promise Retry Pattern

```javascript
const retry = (fn, maxAttempts, delay = 1000) => {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          reject(error);
          return;
        }
        
        await new Promise(r => setTimeout(r, delay));
      }
    }
  });
};

// Usage
const unreliableAPI = () => {
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.7) {
      reject(new Error('API failed'));
    } else {
      resolve({ data: 'Success!' });
    }
  });
};

retry(unreliableAPI, 3, 500)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('All attempts failed:', error));

// Exponential backoff
const retryWithBackoff = async (fn, maxAttempts) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};
```

### Promise Queue

```javascript
class PromiseQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }
  
  async run() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.run();
    }
  }
}

// Usage
const queue = new PromiseQueue(2); // Max 2 concurrent

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => new Promise(resolve => {
    console.log(`Task ${i} started`);
    setTimeout(() => {
      console.log(`Task ${i} completed`);
      resolve(i);
    }, 1000);
  })
);

Promise.all(tasks.map(task => queue.add(task)))
  .then(results => console.log('All tasks completed:', results));
```

### Promisify Pattern

```javascript
// Convert callback-based functions to promises
const promisify = fn => {
  return (...args) => {
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
};

// Example: Node.js style callback
const readFile = (path, callback) => {
  setTimeout(() => {
    if (path) {
      callback(null, `Contents of ${path}`);
    } else {
      callback(new Error('Invalid path'));
    }
  }, 100);
};

const readFilePromise = promisify(readFile);

readFilePromise('file.txt')
  .then(contents => console.log(contents))
  .catch(error => console.error(error));

// Generic promisify for multiple arguments
const promisifyAll = obj => {
  const promisified = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      promisified[key] = promisify(obj[key].bind(obj));
    }
  }
  
  return promisified;
};
```

---

## Async/Await Patterns

Async/await provides syntactic sugar for working with promises, making async code look synchronous.

### Basic Async/Await

```javascript
// Async function always returns a promise
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}

// Error handling with try/catch
async function fetchUserSafe(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Usage
fetchUserSafe(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error));
```

### Parallel Async Operations

```javascript
// Sequential (slow)
async function fetchSequential() {
  const user = await fetchUser(1);      // Wait 1s
  const posts = await fetchPosts(1);    // Wait 1s
  const comments = await fetchComments(1); // Wait 1s
  // Total: 3s
  
  return { user, posts, comments };
}

// Parallel (fast)
async function fetchParallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),        // Start all
    fetchPosts(1),       // at the
    fetchComments(1)     // same time
  ]);
  // Total: 1s (assuming all take 1s)
  
  return { user, posts, comments };
}

// Conditional parallel
async function fetchUserData(userId) {
  // Fetch user first
  const user = await fetchUser(userId);
  
  // Then fetch posts and friends in parallel
  const [posts, friends] = await Promise.all([
    fetchPosts(userId),
    fetchFriends(userId)
  ]);
  
  return { user, posts, friends };
}
```

### Async Error Handling

```javascript
// Multiple try/catch blocks
async function fetchWithMultipleErrors() {
  let user;
  let posts;
  
  try {
    user = await fetchUser(1);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    user = null;
  }
  
  try {
    posts = await fetchPosts(1);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    posts = [];
  }
  
  return { user, posts };
}

// Error boundaries
async function withErrorBoundary(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error('Error caught by boundary:', error);
    return fallback;
  }
}

// Usage
const user = await withErrorBoundary(
  () => fetchUser(1),
  { name: 'Guest', id: 0 }
);

// Finally clause
async function fetchWithCleanup() {
  const connection = await openConnection();
  
  try {
    const data = await fetchData(connection);
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  } finally {
    await closeConnection(connection);
    console.log('Connection closed');
  }
}
```

### Async Iteration

```javascript
// For await...of
async function* asyncGenerator() {
  for (let i = 1; i <= 5; i++) {
    await delay(1000);
    yield i;
  }
}

async function processAsyncSequence() {
  for await (const value of asyncGenerator()) {
    console.log('Value:', value);
  }
}

// Async iteration over promises
async function* fetchUsers(ids) {
  for (const id of ids) {
    yield await fetchUser(id);
  }
}

async function displayUsers() {
  for await (const user of fetchUsers([1, 2, 3, 4, 5])) {
    console.log('User:', user.name);
  }
}

// Async map
async function asyncMap(array, asyncFn) {
  const results = [];
  
  for (const item of array) {
    results.push(await asyncFn(item));
  }
  
  return results;
}

// Usage
const userIds = [1, 2, 3, 4, 5];
const users = await asyncMap(userIds, fetchUser);

// Parallel async map
async function asyncMapParallel(array, asyncFn) {
  return Promise.all(array.map(asyncFn));
}

const usersParallel = await asyncMapParallel(userIds, fetchUser);
```

### Async Control Flow

```javascript
// Async while loop
async function pollUntilComplete(checkFn, interval = 1000) {
  while (true) {
    const result = await checkFn();
    
    if (result.complete) {
      return result.data;
    }
    
    await delay(interval);
  }
}

// Usage
const jobResult = await pollUntilComplete(
  async () => {
    const status = await checkJobStatus(jobId);
    return {
      complete: status === 'completed',
      data: status
    };
  },
  2000
);

// Async forEach
async function asyncForEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
}

// Usage
await asyncForEach([1, 2, 3], async (num) => {
  await delay(1000);
  console.log(num);
});

// Async reduce
async function asyncReduce(array, reducer, initialValue) {
  let accumulator = initialValue;
  
  for (const item of array) {
    accumulator = await reducer(accumulator, item);
  }
  
  return accumulator;
}

// Usage
const total = await asyncReduce(
  [1, 2, 3, 4, 5],
  async (sum, num) => {
    await delay(100);
    return sum + num;
  },
  0
);
```

### Async Memoization

```javascript
const asyncMemoize = fn => {
  const cache = new Map();
  const pending = new Map();
  
  return async (...args) => {
    const key = JSON.stringify(args);
    
    // Return cached result
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }
    
    // Return pending promise if in progress
    if (pending.has(key)) {
      console.log('Waiting for pending request');
      return pending.get(key);
    }
    
    // Create new promise
    console.log('New request');
    const promise = fn(...args);
    pending.set(key, promise);
    
    try {
      const result = await promise;
      cache.set(key, result);
      return result;
    } finally {
      pending.delete(key);
    }
  };
};

// Usage
const fetchUserMemoized = asyncMemoize(fetchUser);

// Multiple calls with same ID
const results = await Promise.all([
  fetchUserMemoized(1),
  fetchUserMemoized(1),
  fetchUserMemoized(1)
]);
// Only one actual fetch, others wait or use cache
```

### Async Pipeline

```javascript
const asyncPipe = (...fns) => async x => {
  let result = x;
  
  for (const fn of fns) {
    result = await fn(result);
  }
  
  return result;
};

// Async transformations
const fetchUserData = async id => {
  await delay(100);
  return { id, name: `User ${id}` };
};

const enrichWithPosts = async user => {
  await delay(100);
  return {
    ...user,
    posts: [{ id: 1, title: 'Post 1' }]
  };
};

const calculateStats = async user => {
  await delay(100);
  return {
    ...user,
    stats: { postCount: user.posts.length }
  };
};

// Create pipeline
const getUserComplete = asyncPipe(
  fetchUserData,
  enrichWithPosts,
  calculateStats
);

// Usage
const completeUser = await getUserComplete(1);
console.log(completeUser);
```

---

## Observable Pattern

Observables represent a stream of asynchronous events.

### Basic Observable

```javascript
class Observable {
  constructor(subscribe) {
    this.subscribe = subscribe;
  }
  
  static create(subscribe) {
    return new Observable(subscribe);
  }
  
  map(fn) {
    return Observable.create(observer => {
      return this.subscribe({
        next: value => observer.next(fn(value)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  filter(predicate) {
    return Observable.create(observer => {
      return this.subscribe({
        next: value => {
          if (predicate(value)) {
            observer.next(value);
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
}

// Create observable
const numbers$ = Observable.create(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.next(4);
  observer.next(5);
  observer.complete();
  
  // Return cleanup function
  return () => console.log('Cleanup');
});

// Subscribe
const subscription = numbers$
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .subscribe({
    next: value => console.log('Value:', value),
    error: err => console.error('Error:', err),
    complete: () => console.log('Complete')
  });
// Value: 4
// Value: 8
// Complete
```

### Event Observable

```javascript
class Observable {
  constructor(subscribe) {
    this.subscribe = subscribe;
  }
  
  static fromEvent(element, eventName) {
    return new Observable(observer => {
      const handler = event => observer.next(event);
      
      element.addEventListener(eventName, handler);
      
      // Return cleanup
      return () => {
        element.removeEventListener(eventName, handler);
      };
    });
  }
  
  static interval(ms) {
    return new Observable(observer => {
      let count = 0;
      const id = setInterval(() => {
        observer.next(count++);
      }, ms);
      
      return () => clearInterval(id);
    });
  }
  
  static of(...values) {
    return new Observable(observer => {
      values.forEach(value => observer.next(value));
      observer.complete();
    });
  }
}

// Usage
const clicks$ = Observable.fromEvent(button, 'click');

clicks$.subscribe({
  next: event => console.log('Clicked at:', event.clientX, event.clientY)
});

const timer$ = Observable.interval(1000);

const subscription = timer$.subscribe({
  next: count => console.log('Count:', count)
});

// Stop after 5 seconds
setTimeout(() => subscription(), 5000);
```

### Observable Operators

```javascript
class Observable {
  // ... previous code ...
  
  take(count) {
    return Observable.create(observer => {
      let taken = 0;
      
      return this.subscribe({
        next: value => {
          if (taken < count) {
            observer.next(value);
            taken++;
            
            if (taken === count) {
              observer.complete();
            }
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  debounce(ms) {
    return Observable.create(observer => {
      let timeoutId;
      
      return this.subscribe({
        next: value => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            observer.next(value);
          }, ms);
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  throttle(ms) {
    return Observable.create(observer => {
      let lastTime = 0;
      
      return this.subscribe({
        next: value => {
          const now = Date.now();
          
          if (now - lastTime >= ms) {
            observer.next(value);
            lastTime = now;
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  scan(reducer, seed) {
    return Observable.create(observer => {
      let accumulator = seed;
      
      return this.subscribe({
        next: value => {
          accumulator = reducer(accumulator, value);
          observer.next(accumulator);
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
}

// Usage
const clicks$ = Observable.fromEvent(button, 'click');

// Debounce clicks
clicks$
  .debounce(300)
  .subscribe({ next: () => console.log('Clicked') });

// Count clicks
clicks$
  .scan((count, _) => count + 1, 0)
  .subscribe({ next: count => console.log('Click count:', count) });

// Take first 5 clicks
clicks$
  .take(5)
  .subscribe({
    next: () => console.log('Click'),
    complete: () => console.log('Done after 5 clicks')
  });
```

### Subject (Hot Observable)

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
    
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }
  
  next(value) {
    this.observers.forEach(observer => {
      if (observer.next) {
        observer.next(value);
      }
    });
  }
  
  error(err) {
    this.observers.forEach(observer => {
      if (observer.error) {
        observer.error(err);
      }
    });
  }
  
  complete() {
    this.observers.forEach(observer => {
      if (observer.complete) {
        observer.complete();
      }
    });
    this.observers = [];
  }
}

// Usage
const subject = new Subject();

// Multiple subscribers
subject.subscribe({
  next: value => console.log('Subscriber 1:', value)
});

subject.subscribe({
  next: value => console.log('Subscriber 2:', value)
});

// Emit values
subject.next(1); // Both subscribers receive
subject.next(2); // Both subscribers receive

// BehaviorSubject - remembers last value
class BehaviorSubject extends Subject {
  constructor(initialValue) {
    super();
    this.currentValue = initialValue;
  }
  
  subscribe(observer) {
    observer.next(this.currentValue);
    return super.subscribe(observer);
  }
  
  next(value) {
    this.currentValue = value;
    super.next(value);
  }
  
  getValue() {
    return this.currentValue;
  }
}

const behavior$ = new BehaviorSubject(0);

behavior$.subscribe({
  next: value => console.log('Sub 1:', value)
}); // Immediately logs: Sub 1: 0

behavior$.next(1); // Sub 1: 1

behavior$.subscribe({
  next: value => console.log('Sub 2:', value)
}); // Immediately logs: Sub 2: 1
```

---

## Reactive Programming Concepts

Reactive programming is about working with asynchronous data streams.

### Stream Composition

```javascript
// Combining multiple streams
class Observable {
  // ... previous code ...
  
  static merge(...observables) {
    return Observable.create(observer => {
      const subscriptions = observables.map(obs =>
        obs.subscribe({
          next: value => observer.next(value),
          error: err => observer.error(err)
        })
      );
      
      return () => subscriptions.forEach(unsub => unsub());
    });
  }
  
  static combineLatest(...observables) {
    return Observable.create(observer => {
      const values = new Array(observables.length);
      const hasValue = new Array(observables.length).fill(false);
      let completed = 0;
      
      const subscriptions = observables.map((obs, index) =>
        obs.subscribe({
          next: value => {
            values[index] = value;
            hasValue[index] = true;
            
            if (hasValue.every(Boolean)) {
              observer.next([...values]);
            }
          },
          complete: () => {
            completed++;
            if (completed === observables.length) {
              observer.complete();
            }
          }
        })
      );
      
      return () => subscriptions.forEach(unsub => unsub());
    });
  }
}

// Usage
const temp$ = Observable.interval(1000).map(() => 
  Math.round(Math.random() * 30 + 10)
);

const humidity$ = Observable.interval(1500).map(() => 
  Math.round(Math.random() * 50 + 30)
);

Observable.combineLatest(temp$, humidity$)
  .subscribe({
    next: ([temp, humidity]) => {
      console.log(`Temperature: ${temp}°C, Humidity: ${humidity}%`);
    }
  });
```

### Reactive State Management

```javascript
class Store {
  constructor(initialState) {
    this.state$ = new BehaviorSubject(initialState);
  }
  
  select(selector) {
    return this.state$.map(selector);
  }
  
  setState(updater) {
    const currentState = this.state$.getValue();
    const newState = typeof updater === 'function'
      ? updater(currentState)
      : { ...currentState, ...updater };
    
    this.state$.next(newState);
  }
  
  getState() {
    return this.state$.getValue();
  }
}

// Usage
const store = new Store({
  user: null,
  count: 0,
  items: []
});

// Subscribe to specific parts
store.select(state => state.count).subscribe({
  next: count => console.log('Count:', count)
});

store.select(state => state.user).subscribe({
  next: user => console.log('User:', user)
});

// Update state
store.setState({ count: 1 }); // Count: 1
store.setState(state => ({ count: state.count + 1 })); // Count: 2
store.setState({ user: { name: 'Alice' } }); // User: { name: 'Alice' }
```

### Reactive Forms

```javascript
class FormControl {
  constructor(initialValue = '') {
    this.value$ = new BehaviorSubject(initialValue);
    this.errors$ = new BehaviorSubject([]);
    this.validators = [];
  }
  
  setValue(value) {
    this.value$.next(value);
    this.validate();
  }
  
  addValidator(validator) {
    this.validators.push(validator);
    this.validate();
  }
  
  validate() {
    const value = this.value$.getValue();
    const errors = [];
    
    for (const validator of this.validators) {
      const error = validator(value);
      if (error) errors.push(error);
    }
    
    this.errors$.next(errors);
  }
  
  get isValid$() {
    return this.errors$.map(errors => errors.length === 0);
  }
}

// Usage
const emailControl = new FormControl('');

emailControl.addValidator(value => 
  !value ? 'Required' : null
);

emailControl.addValidator(value =>
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : null
);

// Subscribe to changes
emailControl.value$.subscribe({
  next: value => console.log('Email:', value)
});

emailControl.errors$.subscribe({
  next: errors => console.log('Errors:', errors)
});

emailControl.isValid$.subscribe({
  next: isValid => console.log('Valid:', isValid)
});

// User types
emailControl.setValue('test'); // Invalid email
emailControl.setValue('test@example.com'); // Valid
```

### Reactive Data Flow

```javascript
// Data flow with transformations
class DataFlow {
  constructor() {
    this.source$ = new Subject();
    
    // Transform stream
    this.processed$ = this.source$
      .filter(data => data.value > 0)
      .map(data => ({
        ...data,
        doubled: data.value * 2
      }))
      .debounce(300);
    
    // Side effects
    this.processed$.subscribe({
      next: data => this.saveToDatabase(data)
    });
    
    // Aggregations
    this.count$ = this.source$
      .scan((count, _) => count + 1, 0);
    
    this.sum$ = this.source$
      .filter(data => data.value > 0)
      .map(data => data.value)
      .scan((sum, value) => sum + value, 0);
  }
  
  emit(data) {
    this.source$.next(data);
  }
  
  saveToDatabase(data) {
    console.log('Saving to database:', data);
  }
}

// Usage
const flow = new DataFlow();

flow.count$.subscribe({
  next: count => console.log('Count:', count)
});

flow.sum$.subscribe({
  next: sum => console.log('Sum:', sum)
});

flow.emit({ value: 5 });
flow.emit({ value: -3 });
flow.emit({ value: 10 });
```

---

## Summary

This document covered Async Programming Patterns:

- **Promise Patterns**: Basic promises, Promise.all/race/allSettled/any, sequential execution, retry, queue, promisify
- **Async/Await Patterns**: Basic async/await, parallel operations, error handling, async iteration, control flow, memoization, pipelines
- **Observable Pattern**: Basic observables, event observables, operators (map, filter, debounce, throttle), subjects
- **Reactive Programming**: Stream composition, reactive state management, reactive forms, data flow

These patterns enable effective handling of asynchronous operations and event-driven programming.

---

**Related Topics:**

- RxJS Library
- Promise Libraries (Bluebird, Q)
- Async Generators
- WebSockets and Real-time Communication