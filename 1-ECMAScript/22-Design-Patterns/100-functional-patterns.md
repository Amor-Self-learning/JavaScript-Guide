# Functional Patterns

## Table of Contents

- [Function Composition](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#function-composition)
- [Higher-Order Functions](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#higher-order-functions)
- [Currying and Partial Application](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#currying-and-partial-application)
- [Memoization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#memoization)
- [Pure Functions](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#pure-functions)
- [Immutability Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#immutability-patterns)

---

## Functional Patterns

Functional patterns focus on using functions as first-class citizens, emphasizing immutability, pure functions, and function composition.

---

## Function Composition

Function composition is the process of combining two or more functions to produce a new function.

### Basic Composition

```javascript
// Simple compose - right to left
const compose = (...fns) => x => 
  fns.reduceRight((acc, fn) => fn(acc), x);

// Pipe - left to right
const pipe = (...fns) => x => 
  fns.reduce((acc, fn) => fn(acc), x);

// Example functions
const add2 = x => x + 2;
const multiply3 = x => x * 3;
const subtract1 = x => x - 1;

// Compose: subtract1(multiply3(add2(5)))
const composedFn = compose(subtract1, multiply3, add2);
console.log(composedFn(5)); // (5 + 2) * 3 - 1 = 20

// Pipe: add2 -> multiply3 -> subtract1
const pipedFn = pipe(add2, multiply3, subtract1);
console.log(pipedFn(5)); // (5 + 2) * 3 - 1 = 20
```

### String Processing Pipeline

```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Individual transformations
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '-');
const addPrefix = prefix => str => `${prefix}${str}`;
const addSuffix = suffix => str => `${str}${suffix}`;

// Create slug generator
const createSlug = pipe(
  trim,
  toLowerCase,
  removeSpaces,
  addPrefix('post-'),
  addSuffix('-2024')
);

console.log(createSlug('  Hello World  '));
// "post-hello-world-2024"

// Reusable transformations
const sanitizeInput = pipe(
  trim,
  str => str.replace(/[<>]/g, '')
);

const normalizeEmail = pipe(
  trim,
  toLowerCase
);

console.log(sanitizeInput('  <script>alert("xss")</script>  '));
// "scriptalert("xss")/script"

console.log(normalizeEmail('  Alice@EXAMPLE.COM  '));
// "alice@example.com"
```

### Data Transformation Pipeline

```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Data transformations
const filterActive = users => users.filter(u => u.active);
const sortByAge = users => [...users].sort((a, b) => b.age - a.age);
const mapToNames = users => users.map(u => u.name);
const take = n => arr => arr.slice(0, n);

// Create pipeline
const getTopActiveUsers = pipe(
  filterActive,
  sortByAge,
  mapToNames,
  take(3)
);

const users = [
  { name: 'Alice', age: 30, active: true },
  { name: 'Bob', age: 25, active: false },
  { name: 'Charlie', age: 35, active: true },
  { name: 'David', age: 28, active: true },
  { name: 'Eve', age: 32, active: true }
];

console.log(getTopActiveUsers(users));
// ["Charlie", "Eve", "Alice"]
```

### Async Function Composition

```javascript
// Async pipe
const asyncPipe = (...fns) => x => 
  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(x));

// Async functions
const fetchUser = async id => {
  console.log(`Fetching user ${id}`);
  return { id, name: 'Alice', posts: [1, 2, 3] };
};

const fetchPosts = async user => {
  console.log(`Fetching posts for ${user.name}`);
  const posts = await Promise.all(
    user.posts.map(id => ({ id, title: `Post ${id}`, likes: id * 10 }))
  );
  return { ...user, posts };
};

const addStats = async user => {
  const totalLikes = user.posts.reduce((sum, p) => sum + p.likes, 0);
  return { ...user, stats: { totalLikes } };
};

// Create async pipeline
const getUserWithStats = asyncPipe(
  fetchUser,
  fetchPosts,
  addStats
);

// Usage
getUserWithStats(1).then(result => {
  console.log(result);
});
```

### Point-Free Style

```javascript
// Point-free (no explicit arguments)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Not point-free
const doubleNumbers = numbers => numbers.map(n => n * 2);

// Point-free style
const double = x => x * 2;
const doubleAll = arr => arr.map(double);

// Even more point-free
const map = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);
const reduce = fn => init => arr => arr.reduce(fn, init);

const doubleNumbers2 = map(x => x * 2);
const evenNumbers = filter(x => x % 2 === 0);
const sum = reduce((a, b) => a + b)(0);

const processNumbers = pipe(
  evenNumbers,
  doubleNumbers2,
  sum
);

console.log(processNumbers([1, 2, 3, 4, 5, 6]));
// [2, 4, 6] -> [4, 8, 12] -> 24
```

---

## Higher-Order Functions

Higher-order functions are functions that take functions as arguments or return functions.

### Map, Filter, Reduce

```javascript
// Map - transform each element
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const squared = numbers.map(x => x ** 2);
console.log(squared); // [1, 4, 9, 16, 25]

// Filter - select elements
const evens = numbers.filter(x => x % 2 === 0);
console.log(evens); // [2, 4]

const greaterThan3 = numbers.filter(x => x > 3);
console.log(greaterThan3); // [4, 5]

// Reduce - combine elements
const sum = numbers.reduce((acc, x) => acc + x, 0);
console.log(sum); // 15

const product = numbers.reduce((acc, x) => acc * x, 1);
console.log(product); // 120

// Chain operations
const result = numbers
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((acc, x) => acc + x, 0);

console.log(result); // [2, 4] -> [4, 8] -> 12
```

### Custom Higher-Order Functions

```javascript
// Create a function that runs a function n times
const times = n => fn => {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
};

times(5)(i => console.log(`Iteration ${i}`));

// Create a function that retries on failure
const retry = (maxAttempts, delay = 1000) => fn => async (...args) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Usage
const unreliableAPI = async () => {
  if (Math.random() < 0.7) {
    throw new Error('API failed');
  }
  return 'Success!';
};

const reliableAPI = retry(3, 500)(unreliableAPI);

// Create a function that logs execution
const withLogging = fn => (...args) => {
  console.log(`Calling ${fn.name} with:`, args);
  const result = fn(...args);
  console.log(`${fn.name} returned:`, result);
  return result;
};

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);

loggedAdd(5, 3);
// Calling add with: [5, 3]
// add returned: 8
```

### Function Decorators

```javascript
// Timing decorator
const timed = fn => (...args) => {
  const start = performance.now();
  const result = fn(...args);
  const duration = performance.now() - start;
  console.log(`${fn.name} took ${duration.toFixed(2)}ms`);
  return result;
};

// Caching decorator
const cached = fn => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }
    
    console.log('Computing...');
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Once decorator - only execute once
const once = fn => {
  let called = false;
  let result;
  
  return (...args) => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
};

// Usage
const fibonacci = n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const cachedFib = cached(fibonacci);
const timedFib = timed(cachedFib);

console.log(timedFib(10));
console.log(timedFib(10)); // Cache hit

const initialize = once(() => {
  console.log('Initializing...');
  return { initialized: true };
});

initialize(); // Logs: "Initializing..."
initialize(); // No log
initialize(); // No log
```

### Array Methods as HOFs

```javascript
// Every - all elements match predicate
const allPositive = [1, 2, 3, 4].every(x => x > 0);
console.log(allPositive); // true

// Some - at least one element matches
const hasEven = [1, 2, 3, 4].some(x => x % 2 === 0);
console.log(hasEven); // true

// Find - first element that matches
const firstEven = [1, 2, 3, 4].find(x => x % 2 === 0);
console.log(firstEven); // 2

// FindIndex - index of first match
const firstEvenIndex = [1, 2, 3, 4].findIndex(x => x % 2 === 0);
console.log(firstEvenIndex); // 1

// FlatMap - map and flatten
const nested = [1, 2, 3].flatMap(x => [x, x * 2]);
console.log(nested); // [1, 2, 2, 4, 3, 6]

// Sort with comparator
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
const sorted = [...numbers].sort((a, b) => a - b);
console.log(sorted); // [1, 1, 2, 3, 4, 5, 6, 9]
```

---

## Currying and Partial Application

Currying transforms a function with multiple arguments into a sequence of functions each taking a single argument.

### Basic Currying

```javascript
// Regular function
const add = (a, b, c) => a + b + c;

// Curried version
const curriedAdd = a => b => c => a + b + c;

console.log(add(1, 2, 3)); // 6
console.log(curriedAdd(1)(2)(3)); // 6

// Partial application
const add1 = curriedAdd(1);
const add1And2 = add1(2);

console.log(add1And2(3)); // 6
console.log(add1And2(10)); // 13
```

### Auto-Curry Function

```javascript
// Generic curry function
const curry = fn => {
  const arity = fn.length;
  
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
};

// Usage
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6

// Practical example
const multiply = (a, b, c) => a * b * c;
const curriedMultiply = curry(multiply);

const double = curriedMultiply(2);
const doubleThenTriple = double(3);

console.log(doubleThenTriple(4)); // 24
```

### Partial Application

```javascript
// Partial application function
const partial = (fn, ...fixedArgs) => 
  (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);

// Example
const greet = (greeting, name) => `${greeting}, ${name}!`;

const sayHello = partial(greet, 'Hello');
const sayGoodbye = partial(greet, 'Goodbye');

console.log(sayHello('Alice')); // "Hello, Alice!"
console.log(sayGoodbye('Bob')); // "Goodbye, Bob!"

// More complex example
const fetch = (method, url, headers, body) => {
  console.log(`${method} ${url}`, headers, body);
  return { method, url, headers, body };
};

const get = partial(fetch, 'GET');
const post = partial(fetch, 'POST');

const getWithAuth = partial(get, undefined, { 'Authorization': 'Bearer token' });

getWithAuth('/api/users');
// GET /api/users { 'Authorization': 'Bearer token' } undefined
```

### Curried Utility Functions

```javascript
const curry = fn => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

// Curried map
const map = curry((fn, arr) => arr.map(fn));

const double = x => x * 2;
const doubleAll = map(double);

console.log(doubleAll([1, 2, 3])); // [2, 4, 6]

// Curried filter
const filter = curry((predicate, arr) => arr.filter(predicate));

const isEven = x => x % 2 === 0;
const filterEvens = filter(isEven);

console.log(filterEvens([1, 2, 3, 4, 5])); // [2, 4]

// Curried reduce
const reduce = curry((fn, init, arr) => arr.reduce(fn, init));

const sum = reduce((a, b) => a + b, 0);

console.log(sum([1, 2, 3, 4, 5])); // 15

// Compose with curried functions
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const processNumbers = pipe(
  filterEvens,
  doubleAll,
  sum
);

console.log(processNumbers([1, 2, 3, 4, 5, 6]));
// [2, 4, 6] -> [4, 8, 12] -> 24
```

### Practical Currying Examples

```javascript
const curry = fn => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

// Validation
const validate = curry((rules, data) => {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    if (!rule(data[field])) {
      errors.push(`${field} is invalid`);
    }
  }
  
  return { valid: errors.length === 0, errors };
});

const isRequired = val => val !== undefined && val !== '';
const isEmail = val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isMinLength = min => val => val && val.length >= min;

const userRules = {
  name: isRequired,
  email: isEmail,
  password: isMinLength(8)
};

const validateUser = validate(userRules);

console.log(validateUser({ name: 'Alice', email: 'alice@example.com', password: '12345678' }));
// { valid: true, errors: [] }

console.log(validateUser({ name: '', email: 'invalid', password: '123' }));
// { valid: false, errors: [...] }

// HTTP client
const request = curry((method, baseUrl, endpoint, options) => {
  const url = `${baseUrl}${endpoint}`;
  console.log(`${method} ${url}`, options);
  return { method, url, options };
});

const api = request('GET')('https://api.example.com');
const getUsers = api('/users');
const getUser = api('/users/:id');

getUsers({});
getUser({ params: { id: 1 } });
```

---

## Memoization

Memoization is an optimization technique that caches function results based on their inputs.

### Basic Memoization

```javascript
const memoize = fn => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }
    
    console.log('Computing...');
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Expensive function
const fibonacci = n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const memoizedFib = memoize(fibonacci);

console.log(memoizedFib(10)); // Computing...
console.log(memoizedFib(10)); // Cache hit
console.log(memoizedFib(15)); // Computing...
```

### Advanced Memoization

```javascript
const memoize = (fn, options = {}) => {
  const cache = new Map();
  const {
    maxSize = Infinity,
    maxAge = Infinity,
    keyGenerator = JSON.stringify
  } = options;
  
  return (...args) => {
    const key = keyGenerator(args);
    const cached = cache.get(key);
    
    // Check if cached and not expired
    if (cached && Date.now() - cached.timestamp < maxAge) {
      console.log('Cache hit');
      return cached.value;
    }
    
    // Compute result
    console.log('Computing...');
    const result = fn(...args);
    
    // Add to cache
    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    // Enforce max size (LRU)
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Usage with options
const expensiveCalculation = (a, b) => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += a + b;
  }
  return sum;
};

const memoized = memoize(expensiveCalculation, {
  maxSize: 100,
  maxAge: 5000 // 5 seconds
});

console.log(memoized(5, 3)); // Computing...
console.log(memoized(5, 3)); // Cache hit

setTimeout(() => {
  console.log(memoized(5, 3)); // Computing... (cache expired)
}, 6000);
```

### Recursive Memoization

```javascript
// Memoize recursive functions properly
const memoizeRecursive = fn => {
  const cache = new Map();
  
  const memoized = (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(memoized, ...args);
    cache.set(key, result);
    return result;
  };
  
  return memoized;
};

// Fibonacci with memoization
const fibonacci = memoizeRecursive((fib, n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fibonacci(40)); // Fast!
console.log(fibonacci(45)); // Still fast!

// Factorial with memoization
const factorial = memoizeRecursive((fact, n) => {
  if (n <= 1) return 1;
  return n * fact(n - 1);
});

console.log(factorial(10)); // 3628800
console.log(factorial(20)); // 2432902008176640000
```

### Practical Memoization

```javascript
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};

// API call memoization
const fetchUser = memoize(async id => {
  console.log(`Fetching user ${id} from API...`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id, name: `User ${id}`, email: `user${id}@example.com` };
});

// Multiple calls only fetch once
Promise.all([
  fetchUser(1),
  fetchUser(1),
  fetchUser(1)
]).then(results => {
  console.log(results);
  // Only logs "Fetching user 1 from API..." once
});

// Expensive calculation memoization
const calculateDistance = memoize((x1, y1, x2, y2) => {
  console.log('Calculating distance...');
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
});

console.log(calculateDistance(0, 0, 3, 4)); // Calculating... 5
console.log(calculateDistance(0, 0, 3, 4)); // 5 (cached)
```

---

## Pure Functions

Pure functions always return the same output for the same inputs and have no side effects.

### Pure vs Impure Functions

```javascript
// IMPURE - depends on external state
let counter = 0;

const incrementImpure = () => {
  counter++; // Side effect: modifies external state
  return counter;
};

console.log(incrementImpure()); // 1
console.log(incrementImpure()); // 2 (different result with same input)

// PURE - no side effects
const incrementPure = count => count + 1;

console.log(incrementPure(0)); // 1
console.log(incrementPure(0)); // 1 (same result with same input)

// IMPURE - modifies input
const addItemImpure = (cart, item) => {
  cart.push(item); // Mutates input
  return cart;
};

// PURE - returns new array
const addItemPure = (cart, item) => [...cart, item];

const cart = [{ name: 'Book', price: 10 }];

const cart2 = addItemPure(cart, { name: 'Pen', price: 2 });
console.log(cart); // Original unchanged
console.log(cart2); // New cart with item
```

### Benefits of Pure Functions

```javascript
// Easy to test
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

// Tests are simple and reliable
console.assert(add(2, 3) === 5);
console.assert(multiply(2, 3) === 6);

// Easy to compose
const addThenMultiply = (a, b, c) => multiply(add(a, b), c);
console.log(addThenMultiply(2, 3, 4)); // (2 + 3) * 4 = 20

// Cacheable (memoization)
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};

const expensiveAdd = memoize(add);

// Parallelizable - no race conditions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2); // Can be parallelized safely
```

### Making Functions Pure

```javascript
// IMPURE - reads from Date
const getCurrentYear = () => {
  return new Date().getFullYear();
};

// PURE - date passed as parameter
const getYear = date => date.getFullYear();

console.log(getYear(new Date())); // Pass dependency explicitly

// IMPURE - random number
const rollDiceImpure = () => {
  return Math.floor(Math.random() * 6) + 1;
};

// PURE - random number generator passed in
const rollDicePure = rng => {
  return Math.floor(rng() * 6) + 1;
};

console.log(rollDicePure(Math.random));

// IMPURE - DOM access
const getInputValueImpure = () => {
  return document.getElementById('myInput').value;
};

// PURE - element passed as parameter
const getInputValuePure = element => element.value;

// IMPURE - HTTP request
const fetchUserImpure = async id => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// PURE - HTTP client passed as dependency
const fetchUserPure = httpClient => async id => {
  const response = await httpClient.get(`/api/users/${id}`);
  return response.json();
};
```

### Pure Function Patterns

```javascript
// Array operations without mutation
const numbers = [1, 2, 3, 4, 5];

// IMPURE
const removeFirstImpure = arr => {
  arr.shift(); // Mutates array
  return arr;
};

// PURE
const removeFirstPure = arr => arr.slice(1);

console.log(removeFirstPure(numbers)); // [2, 3, 4, 5]
console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)

// Object operations without mutation
const user = { name: 'Alice', age: 30 };

// IMPURE
const updateAgeImpure = (user, age) => {
  user.age = age; // Mutates object
  return user;
};

// PURE
const updateAgePure = (user, age) => ({ ...user, age });

console.log(updateAgePure(user, 31)); // { name: 'Alice', age: 31 }
console.log(user); // { name: 'Alice', age: 30 } (unchanged)

// Nested object updates
const state = {
  user: {
    profile: {
      name: 'Alice',
      settings: {
        theme: 'light'
      }
    }
  }
};

// PURE nested update
const updateTheme = (state, theme) => ({
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      settings: {
        ...state.user.profile.settings,
        theme
      }
    }
  }
});

const newState = updateTheme(state, 'dark');
console.log(newState.user.profile.settings.theme); // 'dark'
console.log(state.user.profile.settings.theme); // 'light' (unchanged)
```

---

## Immutability Patterns

Immutability means data cannot be changed after creation. Instead, new copies are created with modifications.

### Immutable Arrays

```javascript
const numbers = [1, 2, 3, 4, 5];

// Add element
const withSix = [...numbers, 6];
console.log(withSix); // [1, 2, 3, 4, 5, 6]

// Remove element
const withoutThree = numbers.filter(x => x !== 3);
console.log(withoutThree); // [1, 2, 4, 5]

// Update element
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Update specific index
const updateAtIndex = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index + 1)
];

const updated = updateAtIndex(numbers, 2, 99);
console.log(updated); // [1, 2, 99, 4, 5]

// Insert at index
const insertAtIndex = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index)
];

const inserted = insertAtIndex(numbers, 2, 99);
console.log(inserted); // [1, 2, 99, 3, 4, 5]

// Sort (immutable)
const sortedDesc = [...numbers].sort((a, b) => b - a);
console.log(sortedDesc); // [5, 4, 3, 2, 1]
console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)
```

### Immutable Objects

```javascript
const user = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
};

// Update property
const olderUser = { ...user, age: 31 };
console.log(olderUser);

// Add property
const userWithPhone = { ...user, phone: '123-456-7890' };
console.log(userWithPhone);

// Remove property
const { email, ...userWithoutEmail } = user;
console.log(userWithoutEmail);

// Deep update
const state = {
  user: {
    profile: { name: 'Alice', age: 30 },
    settings: { theme: 'light' }
  }
};

// Helper for deep updates
const updateIn = (obj, path, value) => {
  const [head, ...rest] = path;
  
  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }
  
  return {
    ...obj,
    [head]: updateIn(obj[head], rest, value)
  };
};

const newState = updateIn(state, ['user', 'profile', 'age'], 31);
console.log(newState.user.profile.age); // 31
console.log(state.user.profile.age); // 30 (unchanged)
```

### Immutable Data Structures

```javascript
// Immutable List
class ImmutableList {
  constructor(items = []) {
    this.items = Object.freeze([...items]);
  }
  
  push(item) {
    return new ImmutableList([...this.items, item]);
  }
  
  pop() {
    return new ImmutableList(this.items.slice(0, -1));
  }
  
  map(fn) {
    return new ImmutableList(this.items.map(fn));
  }
  
  filter(fn) {
    return new ImmutableList(this.items.filter(fn));
  }
  
  get(index) {
    return this.items[index];
  }
  
  toArray() {
    return [...this.items];
  }
}

const list = new ImmutableList([1, 2, 3]);
const list2 = list.push(4);
const list3 = list2.map(x => x * 2);

console.log(list.toArray()); // [1, 2, 3]
console.log(list2.toArray()); // [1, 2, 3, 4]
console.log(list3.toArray()); // [2, 4, 6, 8]

// Immutable Map
class ImmutableMap {
  constructor(obj = {}) {
    this.data = Object.freeze({ ...obj });
  }
  
  set(key, value) {
    return new ImmutableMap({ ...this.data, [key]: value });
  }
  
  delete(key) {
    const { [key]: _, ...rest } = this.data;
    return new ImmutableMap(rest);
  }
  
  get(key) {
    return this.data[key];
  }
  
  has(key) {
    return key in this.data;
  }
  
  toObject() {
    return { ...this.data };
  }
}

const map = new ImmutableMap({ a: 1, b: 2 });
const map2 = map.set('c', 3);
const map3 = map2.delete('b');

console.log(map.toObject()); // { a: 1, b: 2 }
console.log(map2.toObject()); // { a: 1, b: 2, c: 3 }
console.log(map3.toObject()); // { a: 1, c: 3 }
```

### Object.freeze and Const

```javascript
// const prevents reassignment
const arr = [1, 2, 3];
// arr = [4, 5, 6]; // Error
arr.push(4); // But can still mutate!
console.log(arr); // [1, 2, 3, 4]

// Object.freeze prevents mutation
const frozenArr = Object.freeze([1, 2, 3]);
frozenArr.push(4); // Silently fails (throws in strict mode)
console.log(frozenArr); // [1, 2, 3]

const obj = { name: 'Alice', age: 30 };
const frozenObj = Object.freeze(obj);
frozenObj.age = 31; // Silently fails
console.log(frozenObj.age); // 30

// Deep freeze
const deepFreeze = obj => {
  Object.freeze(obj);
  
  Object.values(obj).forEach(value => {
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value);
    }
  });
  
  return obj;
};

const nested = {
  user: {
    profile: {
      name: 'Alice',
      settings: { theme: 'light' }
    }
  }
};

deepFreeze(nested);
nested.user.profile.settings.theme = 'dark'; // Fails
console.log(nested.user.profile.settings.theme); // 'light'
```

### Immutability Helpers

```javascript
// Update helpers
const immutable = {
  set: (obj, key, value) => ({ ...obj, [key]: value }),
  
  delete: (obj, key) => {
    const { [key]: _, ...rest } = obj;
    return rest;
  },
  
  update: (obj, key, fn) => ({
    ...obj,
    [key]: fn(obj[key])
  }),
  
  merge: (obj, updates) => ({ ...obj, ...updates }),
  
  // Array helpers
  push: (arr, item) => [...arr, item],
  
  pop: arr => arr.slice(0, -1),
  
  unshift: (arr, item) => [item, ...arr],
  
  shift: arr => arr.slice(1),
  
  splice: (arr, start, deleteCount, ...items) => [
    ...arr.slice(0, start),
    ...items,
    ...arr.slice(start + deleteCount)
  ],
  
  setIndex: (arr, index, value) => [
    ...arr.slice(0, index),
    value,
    ...arr.slice(index + 1)
  ]
};

// Usage
const user = { name: 'Alice', age: 30 };

const updated = immutable.set(user, 'age', 31);
const withEmail = immutable.merge(updated, { email: 'alice@example.com' });
const incremented = immutable.update(withEmail, 'age', age => age + 1);

console.log(incremented);
// { name: 'Alice', age: 32, email: 'alice@example.com' }

const numbers = [1, 2, 3, 4, 5];
const modified = immutable.splice(numbers, 2, 1, 99, 100);
console.log(modified); // [1, 2, 99, 100, 4, 5]
```

---

## Summary

This document covered Functional Programming Patterns:

- **Function Composition**: Combining functions (compose, pipe, async composition, point-free style)
- **Higher-Order Functions**: Functions that take or return functions (map/filter/reduce, decorators, custom HOFs)
- **Currying and Partial Application**: Transforming functions (auto-curry, partial application, practical examples)
- **Memoization**: Caching function results (basic memoization, advanced options, recursive memoization)
- **Pure Functions**: Functions without side effects (pure vs impure, making functions pure, benefits)
- **Immutability Patterns**: Unchangeable data (immutable arrays/objects, data structures, freeze, helpers)

These patterns promote predictable, testable, and maintainable code through functional programming principles.

---

**Related Topics:**

- Async Patterns
- Functional Libraries (Ramda, Lodash/FP)
- Category Theory
- Monads and Functors