# 3.6 Advanced Function Concepts

## Introduction

Advanced function patterns enable powerful abstractions: higher-order functions, composition, currying, and recursion. Understanding these concepts is key to functional programming in JavaScript.

---

## 3.6.1 Higher-Order Functions

### Definition

A **higher-order function** either:

1. Takes one or more functions as arguments, OR
2. Returns a function

---

### Functions as Arguments

```javascript
// Higher-order function
function map(array, fn) {
  const result = [];
  for (let item of array) {
    result.push(fn(item));
  }
  return result;
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, x => x * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]
```

---

### Functions as Return Values

```javascript
function greeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = greeter("Hello");
const sayHi = greeter("Hi");

console.log(sayHello("Alice"));  // "Hello, Alice!"
console.log(sayHi("Bob"));       // "Hi, Bob!"
```

---

### Built-In Higher-Order Functions

```javascript
// Array methods
[1, 2, 3, 4, 5]
  .map(x => x * 2)        // [2, 4, 6, 8, 10]
  .filter(x => x > 5)     // [6, 8, 10]
  .reduce((sum, x) => sum + x, 0);  // 24

// setTimeout, setInterval
setTimeout(() => console.log("delayed"), 1000);

// Event listeners
button.addEventListener("click", () => console.log("clicked"));

// Promise methods
Promise.resolve(42).then(x => x * 2);
```

---

### Creating Utilities

```javascript
function repeat(n, fn) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}

repeat(3, i => console.log(`Iteration ${i}`));
// Iteration 0
// Iteration 1
// Iteration 2
```

---

## 3.6.2 Callbacks

### Definition

A **callback** is a function passed as an argument to be executed later.

---

### Synchronous Callbacks

```javascript
function processArray(array, callback) {
  const result = [];
  for (let item of array) {
    result.push(callback(item));
  }
  return result;
}

const numbers = [1, 2, 3];
const squared = processArray(numbers, x => x * x);
console.log(squared);  // [1, 4, 9]
```

---

### Asynchronous Callbacks

```javascript
function fetchData(url, callback) {
  setTimeout(() => {
    const data = { id: 1, name: "Alice" };
    callback(data);
  }, 1000);
}

fetchData("https://api.example.com/user/1", (data) => {
  console.log(data);  // After 1 second
});
```

---

### Error-First Callbacks (Node.js Convention)

```javascript
function readFile(path, callback) {
  setTimeout(() => {
    if (path === "error.txt") {
      callback(new Error("File not found"), null);
    } else {
      callback(null, "File contents");
    }
  }, 100);
}

readFile("data.txt", (err, data) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(data);
});
```

---

### Callback Hell (Pyramid of Doom)

```javascript
asyncOperation1((err1, result1) => {
  if (err1) return handleError(err1);
  
  asyncOperation2(result1, (err2, result2) => {
    if (err2) return handleError(err2);
    
    asyncOperation3(result2, (err3, result3) => {
      if (err3) return handleError(err3);
      
      console.log(result3);
    });
  });
});
```

**Solution: Promises or async/await:**

```javascript
// Promises
asyncOperation1()
  .then(result1 => asyncOperation2(result1))
  .then(result2 => asyncOperation3(result2))
  .then(result3 => console.log(result3))
  .catch(handleError);

// Async/await
try {
  const result1 = await asyncOperation1();
  const result2 = await asyncOperation2(result1);
  const result3 = await asyncOperation3(result2);
  console.log(result3);
} catch (error) {
  handleError(error);
}
```

---

## 3.6.3 Function Composition

### Definition

**Function composition** is combining two or more functions to create a new function.

---

### Basic Composition

```javascript
const add = x => x + 1;
const multiply = x => x * 2;

// Manual composition
const addThenMultiply = x => multiply(add(x));
console.log(addThenMultiply(5));  // 12 ((5 + 1) * 2)
```

---

### Compose Function

**Right-to-left composition:**

```javascript
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

const add = x => x + 1;
const multiply = x => x * 2;
const square = x => x * x;

const composed = compose(square, multiply, add);
console.log(composed(5));  // 144
// Execution: add(5) -> multiply(6) -> square(12) -> 144
```

---

### Pipe Function

**Left-to-right composition:**

```javascript
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

const add = x => x + 1;
const multiply = x => x * 2;
const square = x => x * x;

const piped = pipe(add, multiply, square);
console.log(piped(5));  // 144
// Execution: add(5) -> multiply(6) -> square(12) -> 144
```

---

### Practical Example

```javascript
const users = [
  { name: "alice smith", age: 30 },
  { name: "bob jones", age: 25 },
  { name: "charlie brown", age: 35 }
];

const capitalize = str =>
  str.charAt(0).toUpperCase() + str.slice(1);

const capitalizeWords = str =>
  str.split(" ").map(capitalize).join(" ");

const getNames = users => users.map(u => u.name);
const capitalizeNames = names => names.map(capitalizeWords);
const sortNames = names => names.sort();

const processUsers = pipe(
  getNames,
  capitalizeNames,
  sortNames
);

console.log(processUsers(users));
// ["Alice Smith", "Bob Jones", "Charlie Brown"]
```

---

## 3.6.4 Currying

### Definition

**Currying** transforms a function with multiple arguments into a sequence of functions, each taking a single argument.

---

### Manual Currying

```javascript
// Regular function
function add(a, b, c) {
  return a + b + c;
}

add(1, 2, 3);  // 6

// Curried version
function addCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

addCurried(1)(2)(3);  // 6

// Or with arrow functions
const addCurried = a => b => c => a + b + c;
addCurried(1)(2)(3);  // 6
```

---

### Curry Utility

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    } else {
      return function(...nextArgs) {
        return curried(...args, ...nextArgs);
      };
    }
  };
}

// Usage
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
console.log(curriedAdd(1, 2, 3));     // 6
```

---

### Practical Use Cases

**Creating specialized functions:**

```javascript
const multiply = curry((a, b) => a * b);

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

**Reusable filters:**

```javascript
const filter = curry((fn, array) => array.filter(fn));

const numbers = [1, 2, 3, 4, 5];
const isEven = x => x % 2 === 0;
const isGreaterThan = curry((threshold, x) => x > threshold);

const filterEven = filter(isEven);
const filterGreaterThan3 = filter(isGreaterThan(3));

console.log(filterEven(numbers));        // [2, 4]
console.log(filterGreaterThan3(numbers)); // [4, 5]
```

---

## 3.6.5 Partial Application

### Definition

**Partial application** fixes some arguments of a function, producing a new function with fewer arguments.

---

### Manual Partial Application

```javascript
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

const sayHello = partial(greet, "Hello");
const sayHi = partial(greet, "Hi");

console.log(sayHello("Alice"));  // "Hello, Alice!"
console.log(sayHi("Bob"));       // "Hi, Bob!"
```

---

### Partial vs Currying

**Partial application:**

```javascript
const partial = (fn, ...args) =>
  (...newArgs) => fn(...args, ...newArgs);

const add = (a, b, c) => a + b + c;
const add5 = partial(add, 5);

add5(10, 15);  // 30 (5 + 10 + 15)
```

**Currying:**

```javascript
const curry = fn =>
  function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...newArgs) => curried(...args, ...newArgs);
  };

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(5)(10)(15);  // 30
```

**Key difference:**

- **Partial**: Apply some args, get function expecting remaining args
- **Currying**: Always returns single-arg functions until all args provided

---

### Using `bind` for Partial Application

```javascript
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = greet.bind(null, "Hello");
console.log(sayHello("Alice"));  // "Hello, Alice!"
```

---

## 3.6.6 Function Binding

### `bind()` Method

**Creates new function with bound `this`:**

```javascript
const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

user.greet();  // "Hello, Alice"

const greet = user.greet;
greet();  // "Hello, undefined" (lost this)

const boundGreet = user.greet.bind(user);
boundGreet();  // "Hello, Alice" (this bound to user)
```

---

### Binding with Arguments

```javascript
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);
console.log(double(5));  // 10 (2 * 5)

const triple = multiply.bind(null, 3);
console.log(triple(5));  // 15 (3 * 5)
```

---

### `call()` Method

**Invoke function with specified `this` and arguments:**

```javascript
function greet(greeting) {
  return `${greeting}, ${this.name}!`;
}

const user = { name: "Alice" };

console.log(greet.call(user, "Hello"));  // "Hello, Alice!"
```

---

### `apply()` Method

**Like `call`, but arguments as array:**

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const user = { name: "Alice" };

console.log(greet.apply(user, ["Hello", "!"]));  // "Hello, Alice!"
```

---

### Comparison

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const user = { name: "Alice" };

// bind: returns new function
const boundGreet = greet.bind(user, "Hello");
boundGreet("!");  // "Hello, Alice!"

// call: invokes immediately, args individually
greet.call(user, "Hello", "!");  // "Hello, Alice!"

// apply: invokes immediately, args as array
greet.apply(user, ["Hello", "!"]);  // "Hello, Alice!"
```

---

## 3.6.7 IIFE Revisited

### Pattern

```javascript
(function() {
  // Code here
})();

// Alternative syntax
(function() {
  // Code here
}());
```

---

### Use Cases

**1. Private scope:**

```javascript
(function() {
  const secret = "hidden";
  console.log(secret);  // "hidden"
})();

console.log(secret);  // ReferenceError
```

**2. Avoid global pollution:**

```javascript
(function() {
  const helpers = {
    add(a, b) { return a + b; },
    multiply(a, b) { return a * b; }
  };
  
  // Use helpers
  console.log(helpers.add(5, 3));
})();

// helpers not in global scope
```

**3. Module pattern:**

```javascript
const myModule = (function() {
  const privateVar = "secret";
  
  function privateFunc() {
    return privateVar;
  }
  
  return {
    publicMethod() {
      return privateFunc();
    }
  };
})();

console.log(myModule.publicMethod());  // "secret"
console.log(myModule.privateVar);      // undefined
```

**4. With parameters:**

```javascript
(function(global, $) {
  // Use global and $ without risk of conflict
  global.myApp = { };
  $(".element").hide();
})(window, jQuery);
```

---

## 3.6.8 Recursion

### Definition

A **recursive function** calls itself.

---

### Basic Recursion

```javascript
function factorial(n) {
  if (n <= 1) return 1;  // Base case
  return n * factorial(n - 1);  // Recursive case
}

console.log(factorial(5));  // 120
// 5 * factorial(4)
// 5 * 4 * factorial(3)
// 5 * 4 * 3 * factorial(2)
// 5 * 4 * 3 * 2 * factorial(1)
// 5 * 4 * 3 * 2 * 1 = 120
```

---

### Recursive Patterns

**Counting:**

```javascript
function countdown(n) {
  if (n <= 0) {
    console.log("Done!");
    return;
  }
  console.log(n);
  countdown(n - 1);
}

countdown(3);  // 3, 2, 1, Done!
```

**Tree traversal:**

```javascript
function traverse(node) {
  console.log(node.value);
  
  if (node.children) {
    node.children.forEach(child => traverse(child));
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2 },
    { value: 3, children: [{ value: 4 }, { value: 5 }] }
  ]
};

traverse(tree);  // 1, 2, 3, 4, 5
```

**Array flattening:**

```javascript
function flatten(array) {
  const result = [];
  
  for (let item of array) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));  // Recursive
    } else {
      result.push(item);
    }
  }
  
  return result;
}

const nested = [1, [2, [3, [4]], 5]];
console.log(flatten(nested));  // [1, 2, 3, 4, 5]
```

---

### Tail Call Optimization (TCO)

**Tail call:** Recursive call is the last operation in the function.

```javascript
// NOT tail recursive (multiplication after recursive call)
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);  // Multiplication is last operation
}

// Tail recursive (recursive call is last operation)
function factorial(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorial(n - 1, n * accumulator);  // Recursive call is last
}
```

**JavaScript TCO support:**

- **ES6 spec** includes TCO
- **Most engines don't implement it** (only Safari does)
- **Don't rely on TCO** in JavaScript

---

### Mutual Recursion

**Functions call each other:**

```javascript
function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}

console.log(isEven(4));  // true
console.log(isOdd(7));   // true
```

---

### Stack Overflow

**Recursion can exhaust call stack:**

```javascript
function infinite() {
  return infinite();  // No base case!
}

infinite();  // RangeError: Maximum call stack size exceeded
```

**Solutions:**

1. **Add base case**
2. **Use iteration instead**
3. **Trampoline pattern** (for very deep recursion)

```javascript
function trampoline(fn) {
  while (typeof fn === "function") {
    fn = fn();
  }
  return fn;
}

function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, n * acc);
}

console.log(trampoline(() => factorial(10000)));  // Works!
```

---

## 3.6.9 Memoization

### Definition

**Memoization** caches function results to avoid redundant computation.

---

### Basic Memoization

```javascript
function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (key in cache) {
      console.log("Returning cached result");
      return cache[key];
    }
    
    console.log("Computing result");
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const slowSquare = memoize(function(x) {
  // Simulate slow operation
  for (let i = 0; i < 1000000000; i++) {}
  return x * x;
});

slowSquare(5);  // "Computing result" (slow)
slowSquare(5);  // "Returning cached result" (instant)
```

---

### Memoizing Recursive Functions

```javascript
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40));  // Fast! (without memo: very slow)
```

**Why it's fast:**

```
fibonacci(5)
├── fibonacci(4) [computed]
│   ├── fibonacci(3) [computed]
│   └── fibonacci(2) [computed]
└── fibonacci(3) [cached!]

Each value computed only once, then cached
```

---

### Limitations

**1. Only works with pure functions** (same input → same output)

**2. Memory usage:**

```javascript
// Cache grows indefinitely
const memoized = memoize(heavyFunction);

// Call with 1000 different inputs
// Cache now has 1000 entries
```

**3. Key generation:**

```javascript
// JSON.stringify doesn't work for all inputs
const fn = memoize(x => x);

fn({a: 1, b: 2});
fn({b: 2, a: 1});  // Same object, different JSON strings!
```

---

### Advanced Memoization

**LRU Cache (Least Recently Used):**

```javascript
function memoizeLRU(fn, maxSize = 100) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      const value = cache.get(key);
      // Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Remove oldest if exceeds max size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}
```

---

## 3.6.10 Pure Functions and Side Effects

### Pure Functions

A **pure function**:

1. Returns same output for same input
2. Has no side effects

```javascript
// Pure
function add(a, b) {
  return a + b;
}

add(2, 3);  // Always 5
add(2, 3);  // Always 5

// Pure
function multiply(arr, factor) {
  return arr.map(x => x * factor);
}
```

---

### Impure Functions

**Depend on external state:**

```javascript
let count = 0;

function increment() {
  count++;  // Modifies external state
  return count;
}

increment();  // 1
increment();  // 2 (different output for same input!)
```

**Have side effects:**

```javascript
function logAndAdd(a, b) {
  console.log(`Adding ${a} + ${b}`);  // Side effect: I/O
  return a + b;
}

function updateUser(user) {
  user.updatedAt = Date.now();  // Side effect: mutation
  return user;
}

function fetchData(url) {
  return fetch(url);  // Side effect: network request
}
```

---

### Benefits of Pure Functions

1. **Predictable** (same input → same output)
2. **Testable** (no setup needed)
3. **Cacheable** (can memoize)
4. **Parallelizable** (no shared state)
5. **Composable** (easy to combine)

```javascript
// Pure functions compose well
const double = x => x * 2;
const increment = x => x + 1;
const square = x => x * x;

const transform = compose(square, double, increment);
// Always produces same result for same input
```

---

### Managing Side Effects

**Isolate side effects:**

```javascript
// Pure computation
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Impure I/O (separate)
function displayTotal(total) {
  document.getElementById("total").textContent = total;
}

// Usage
const total = calculateTotal(items);  // Pure
displayTotal(total);  // Impure, but isolated
```

---

### Immutability

**Don't mutate, create new values:**

```javascript
// Mutating (impure)
function addItem(cart, item) {
  cart.push(item);  // Mutates input
  return cart;
}

// Immutable (pure)
function addItem(cart, item) {
  return [...cart, item];  // Creates new array
}
```

---

## Summary

### Scope and Closures

- **Lexical scope**: Variable scope determined at write-time
- **Function scope**: `var` is function-scoped
- **Block scope**: `let`/`const` are block-scoped
- **Closures**: Functions retain access to lexical scope
- **Use cases**: Private data, factories, memoization, modules
- **Memory**: Closures retain references, can cause leaks

### Advanced Concepts

- **Higher-order functions**: Take/return functions
- **Callbacks**: Functions passed as arguments
- **Composition**: Combine functions into pipelines
- **Currying**: Transform multi-arg function into sequence of single-arg functions
- **Partial application**: Fix some arguments, return function expecting rest
- **Recursion**: Function calls itself (watch stack depth)
- **Memoization**: Cache results for performance
- **Pure functions**: No side effects, same input → same output

---
