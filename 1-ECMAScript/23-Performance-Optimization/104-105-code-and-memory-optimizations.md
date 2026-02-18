# Code & Memory

## Table of Contents

- [23.3 Code-Level Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#233-code-level-optimization)
    - [Loop Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#loop-optimization)
    - [Function Call Overhead](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#function-call-overhead)
    - [Variable Scope Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#variable-scope-optimization)
    - [Avoiding Unnecessary Work](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#avoiding-unnecessary-work)
    - [Lazy Evaluation](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#lazy-evaluation)
- [23.4 Memory Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#234-memory-optimization)
    - [Reducing Memory Allocations](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#reducing-memory-allocations)
    - [Object Pooling](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#object-pooling)
    - [WeakMap/WeakSet Usage](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#weakmapweakset-usage)
    - [Avoiding Memory Leaks](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#avoiding-memory-leaks)

---

## 23.3 Code-Level Optimization

Code-level optimizations focus on writing efficient code patterns that execute faster.

### Loop Optimization

Loops are often the performance bottleneck in applications.

#### Cache Array Length

```javascript
const arr = Array.from({ length: 100000 }, (_, i) => i);

// SLOW: Access length property each iteration
console.time('No caching');
let sum1 = 0;
for (let i = 0; i < arr.length; i++) {
  sum1 += arr[i];
}
console.timeEnd('No caching');

// FAST: Cache length
console.time('With caching');
let sum2 = 0;
const len = arr.length;
for (let i = 0; i < len; i++) {
  sum2 += arr[i];
}
console.timeEnd('With caching');

// FASTEST: For-of (optimized by engine)
console.time('For-of');
let sum3 = 0;
for (const num of arr) {
  sum3 += num;
}
console.timeEnd('For-of');
```

#### Loop Unrolling

```javascript
// Standard loop
function sumStandard(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// Unrolled loop - processes 4 items per iteration
function sumUnrolled(arr) {
  let sum = 0;
  const len = arr.length;
  const remainder = len % 4;
  
  // Process remainder first
  for (let i = 0; i < remainder; i++) {
    sum += arr[i];
  }
  
  // Process 4 items at a time
  for (let i = remainder; i < len; i += 4) {
    sum += arr[i];
    sum += arr[i + 1];
    sum += arr[i + 2];
    sum += arr[i + 3];
  }
  
  return sum;
}

// Benchmark
const largeArr = Array.from({ length: 1000000 }, (_, i) => i);

console.time('Standard');
sumStandard(largeArr);
console.timeEnd('Standard');

console.time('Unrolled');
sumUnrolled(largeArr);
console.timeEnd('Unrolled');

// Note: Modern engines optimize simple loops well,
// unrolling is mainly useful for complex operations
```

#### Avoiding Function Calls in Loops

```javascript
// SLOW: Function call in each iteration
function processDataSlow(arr) {
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    results.push(expensiveOperation(arr[i]));
  }
  return results;
}

function expensiveOperation(x) {
  return x * 2 + 10;
}

// FAST: Inline the operation
function processDataFast(arr) {
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    results.push(arr[i] * 2 + 10);
  }
  return results;
}

// FASTEST: Use map for simple transformations
function processDataFastest(arr) {
  return arr.map(x => x * 2 + 10);
}
```

#### Reverse Loops

```javascript
// Sometimes counting down is slightly faster
const arr = Array.from({ length: 100000 }, (_, i) => i);

// Standard forward loop
console.time('Forward');
let sum1 = 0;
for (let i = 0; i < arr.length; i++) {
  sum1 += arr[i];
}
console.timeEnd('Forward');

// Reverse loop - one less comparison
console.time('Reverse');
let sum2 = 0;
for (let i = arr.length - 1; i >= 0; i--) {
  sum2 += arr[i];
}
console.timeEnd('Reverse');

// While decrement - minimal overhead
console.time('While');
let sum3 = 0;
let i = arr.length;
while (i--) {
  sum3 += arr[i];
}
console.timeEnd('While');
```

#### Breaking Early

```javascript
// Find first match
function findFirstMatch(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i])) {
      return arr[i]; // Exit immediately
    }
  }
  return null;
}

// SLOW: Processes entire array
const slowResult = arr.filter(x => x > 50000)[0];

// FAST: Stops at first match
const fastResult = arr.find(x => x > 50000);

// Check if any match exists
// SLOW: Processes entire array
const hasMatchSlow = arr.filter(x => x > 50000).length > 0;

// FAST: Stops at first match
const hasMatchFast = arr.some(x => x > 50000);
```

#### Avoiding Nested Loops

```javascript
const data1 = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i * 2 }));
const data2 = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));

// BAD: O(n²) - nested loops
console.time('Nested loops');
const result1 = data1.map(item1 => {
  const match = data2.find(item2 => item2.id === item1.id);
  return { ...item1, ...match };
});
console.timeEnd('Nested loops');

// GOOD: O(n) - use hash map
console.time('Hash map');
const map2 = new Map(data2.map(item => [item.id, item]));
const result2 = data1.map(item1 => {
  const match = map2.get(item1.id);
  return { ...item1, ...match };
});
console.timeEnd('Hash map');
```

### Function Call Overhead

Function calls have overhead; minimize them in hot code paths.

#### Inline vs Function Calls

```javascript
const arr = Array.from({ length: 100000 }, (_, i) => i);

// SLOW: Function call overhead
function addOne(x) {
  return x + 1;
}

console.time('With function calls');
const result1 = arr.map(addOne);
console.timeEnd('With function calls');

// FAST: Inline function
console.time('Inline');
const result2 = arr.map(x => x + 1);
console.timeEnd('Inline');

// FASTER: Manual loop with inline operation
console.time('Manual inline');
const result3 = new Array(arr.length);
for (let i = 0; i < arr.length; i++) {
  result3[i] = arr[i] + 1;
}
console.timeEnd('Manual inline');
```

#### Memoization for Expensive Functions

```javascript
// Expensive function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Memoized version
const fibMemo = (() => {
  const cache = {};
  
  return function fib(n) {
    if (n in cache) return cache[n];
    if (n <= 1) return n;
    
    cache[n] = fib(n - 1) + fib(n - 2);
    return cache[n];
  };
})();

console.time('No memoization');
fibonacci(35);
console.timeEnd('No memoization'); // Very slow

console.time('With memoization');
fibMemo(35);
console.timeEnd('With memoization'); // Much faster

// Generic memoization
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalc = (a, b, c) => {
  // Simulate expensive operation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += a + b + c;
  }
  return result;
};

const memoizedCalc = memoize(expensiveCalc);

console.time('First call');
memoizedCalc(1, 2, 3);
console.timeEnd('First call');

console.time('Cached call');
memoizedCalc(1, 2, 3);
console.timeEnd('Cached call'); // Instant
```

#### Reduce Recursion Depth

```javascript
// SLOW: Deep recursion
function sumRecursive(arr, index = 0) {
  if (index >= arr.length) return 0;
  return arr[index] + sumRecursive(arr, index + 1);
}

// FAST: Iterative
function sumIterative(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// FAST: Tail-recursive (optimized by some engines)
function sumTailRecursive(arr, index = 0, acc = 0) {
  if (index >= arr.length) return acc;
  return sumTailRecursive(arr, index + 1, acc + arr[index]);
}

const arr = Array.from({ length: 10000 }, (_, i) => i);

console.time('Recursive');
// sumRecursive(arr); // May cause stack overflow
console.timeEnd('Recursive');

console.time('Iterative');
sumIterative(arr);
console.timeEnd('Iterative');

console.time('Tail recursive');
sumTailRecursive(arr);
console.timeEnd('Tail recursive');
```

#### Method Binding

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  
  // SLOW: Binding in render/loop
  incrementSlow() {
    return () => {
      this.count++;
    };
  }
  
  // FAST: Bind in constructor
  constructor() {
    this.count = 0;
    this.incrementFast = this.incrementFast.bind(this);
  }
  
  incrementFast() {
    this.count++;
  }
  
  // FASTEST: Arrow function as class field
  incrementFastest = () => {
    this.count++;
  }
}

// Benchmark
const counter = new Counter();

console.time('New binding each time');
for (let i = 0; i < 100000; i++) {
  const fn = counter.incrementSlow();
  fn();
}
console.timeEnd('New binding each time');

console.time('Pre-bound');
for (let i = 0; i < 100000; i++) {
  counter.incrementFast();
}
console.timeEnd('Pre-bound');

console.time('Arrow function');
for (let i = 0; i < 100000; i++) {
  counter.incrementFastest();
}
console.timeEnd('Arrow function');
```

### Variable Scope Optimization

Variable access speed depends on scope depth.

#### Local vs Global Variables

```javascript
// Global variable
let globalCounter = 0;

// SLOW: Accessing global variable
function incrementGlobal() {
  for (let i = 0; i < 1000000; i++) {
    globalCounter++;
  }
}

// FAST: Using local variable
function incrementLocal() {
  let localCounter = 0;
  for (let i = 0; i < 1000000; i++) {
    localCounter++;
  }
  return localCounter;
}

console.time('Global access');
incrementGlobal();
console.timeEnd('Global access');

console.time('Local access');
incrementLocal();
console.timeEnd('Local access');
```

#### Cache Object Properties

```javascript
const obj = {
  deeply: {
    nested: {
      property: {
        value: 42
      }
    }
  }
};

// SLOW: Repeated property access
console.time('Repeated access');
let sum1 = 0;
for (let i = 0; i < 100000; i++) {
  sum1 += obj.deeply.nested.property.value;
}
console.timeEnd('Repeated access');

// FAST: Cache property
console.time('Cached property');
let sum2 = 0;
const cached = obj.deeply.nested.property.value;
for (let i = 0; i < 100000; i++) {
  sum2 += cached;
}
console.timeEnd('Cached property');
```

#### Closure Scope

```javascript
// Closure captures outer variables
function createCounter() {
  let count = 0;
  const cache = new Array(1000).fill(0);
  
  return {
    increment() {
      // Accesses both count and cache from closure
      count++;
      cache[count % 1000] = count;
    },
    
    getCount() {
      return count;
    }
  };
}

// Each counter has its own closure
const counter1 = createCounter();
const counter2 = createCounter();

// Optimize: Don't capture unnecessary variables
function createOptimizedCounter() {
  let count = 0;
  
  return {
    increment() {
      count++; // Only captures count, not unnecessary data
    },
    
    getCount() {
      return count;
    }
  };
}
```

### Avoiding Unnecessary Work

Don't compute what you don't need.

#### Short-Circuit Evaluation

```javascript
// Use && and || to skip unnecessary evaluations

// BAD: Always evaluates both
function checkAndProcess(data) {
  if (isValid(data) & shouldProcess(data)) { // Bitwise &, not logical &&
    process(data);
  }
}

// GOOD: Short-circuits
function checkAndProcessOptimized(data) {
  if (isValid(data) && shouldProcess(data)) { // Logical &&
    process(data); // shouldProcess not called if isValid returns false
  }
}

// Practical example: Expensive validation
function validateAndSave(user) {
  // SLOW: Validates everything even if basic checks fail
  if (validateEmail(user.email) & 
      validatePassword(user.password) & 
      checkDatabaseConstraints(user)) {
    saveUser(user);
  }
  
  // FAST: Stops at first failure
  if (validateEmail(user.email) && 
      validatePassword(user.password) && 
      checkDatabaseConstraints(user)) {
    saveUser(user);
  }
}
```

#### Memoization

```javascript
// Cache expensive computations
class DataProcessor {
  constructor() {
    this.cache = new Map();
  }
  
  process(data) {
    const key = this.getCacheKey(data);
    
    if (this.cache.has(key)) {
      console.log('Cache hit');
      return this.cache.get(key);
    }
    
    console.log('Computing...');
    const result = this.expensiveComputation(data);
    this.cache.set(key, result);
    return result;
  }
  
  getCacheKey(data) {
    return JSON.stringify(data);
  }
  
  expensiveComputation(data) {
    // Simulate expensive operation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += data.value * i;
    }
    return result;
  }
}

const processor = new DataProcessor();

console.time('First call');
processor.process({ value: 5 });
console.timeEnd('First call');

console.time('Cached call');
processor.process({ value: 5 });
console.timeEnd('Cached call');
```

#### Early Returns

```javascript
// BAD: Processes everything
function processUserSlow(user) {
  let result = null;
  
  if (user && user.active) {
    if (user.age >= 18) {
      if (user.verified) {
        result = {
          id: user.id,
          name: user.name,
          status: 'approved'
        };
      }
    }
  }
  
  return result;
}

// GOOD: Returns early
function processUserFast(user) {
  if (!user) return null;
  if (!user.active) return null;
  if (user.age < 18) return null;
  if (!user.verified) return null;
  
  return {
    id: user.id,
    name: user.name,
    status: 'approved'
  };
}

// Guard clauses prevent nested conditions
function calculateDiscount(order) {
  // Early returns for invalid cases
  if (!order) return 0;
  if (order.total < 0) return 0;
  if (!order.customer) return 0;
  if (!order.customer.isPremium) return order.total * 0.05;
  
  // Complex calculation only for valid premium customers
  const baseDiscount = order.total * 0.10;
  const loyaltyBonus = order.customer.yearsActive * 0.01;
  return Math.min(baseDiscount * (1 + loyaltyBonus), order.total * 0.3);
}
```

#### Conditional Compilation

```javascript
// Development vs Production
const isDevelopment = process.env.NODE_ENV === 'development';

function processData(data) {
  // BAD: Always checks environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Processing:', data);
  }
  
  return data.map(x => x * 2);
}

// GOOD: Check once at module load
const DEBUG = process.env.NODE_ENV === 'development';

function processDataOptimized(data) {
  if (DEBUG) {
    console.log('Processing:', data);
  }
  
  return data.map(x => x * 2);
}

// BEST: Remove in production build (using bundler)
// Bundler will remove this code in production
if (__DEV__) {
  console.log('Development mode');
}
```

### Lazy Evaluation

Defer computation until actually needed.

#### Lazy Initialization

```javascript
class ExpensiveResource {
  constructor() {
    // DON'T initialize expensive resources immediately
    this._connection = null;
    this._cache = null;
  }
  
  // Initialize only when first accessed
  get connection() {
    if (!this._connection) {
      console.log('Initializing connection...');
      this._connection = this.createConnection();
    }
    return this._connection;
  }
  
  get cache() {
    if (!this._cache) {
      console.log('Initializing cache...');
      this._cache = new Map();
    }
    return this._cache;
  }
  
  createConnection() {
    // Expensive connection setup
    return { connected: true };
  }
}

const resource = new ExpensiveResource();
// Nothing initialized yet

// Only initializes when used
resource.connection; // Logs: "Initializing connection..."
resource.cache; // Logs: "Initializing cache..."
```

#### Generators for Lazy Sequences

```javascript
// Eager evaluation - processes all immediately
function eagerRange(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

// Lazy evaluation - processes on demand
function* lazyRange(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

// Eager: Creates huge array in memory
console.time('Eager');
const eagerResult = eagerRange(1, 1000000)
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .slice(0, 10);
console.timeEnd('Eager');

// Lazy: Only processes what's needed
console.time('Lazy');
function* lazyFilter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) yield item;
  }
}

function* lazyMap(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item);
  }
}

function take(iterable, n) {
  const result = [];
  for (const item of iterable) {
    if (result.length >= n) break;
    result.push(item);
  }
  return result;
}

const lazyResult = take(
  lazyMap(
    lazyFilter(lazyRange(1, 1000000), x => x % 2 === 0),
    x => x * 2
  ),
  10
);
console.timeEnd('Lazy');
```

#### Lazy Properties

```javascript
class DataAnalyzer {
  constructor(data) {
    this.data = data;
    // Don't compute statistics immediately
  }
  
  // Compute only when accessed
  get mean() {
    if (!this._mean) {
      console.log('Computing mean...');
      this._mean = this.data.reduce((a, b) => a + b) / this.data.length;
    }
    return this._mean;
  }
  
  get median() {
    if (!this._median) {
      console.log('Computing median...');
      const sorted = [...this.data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      this._median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }
    return this._median;
  }
  
  get stdDev() {
    if (!this._stdDev) {
      console.log('Computing standard deviation...');
      const mean = this.mean;
      const squareDiffs = this.data.map(x => Math.pow(x - mean, 2));
      this._stdDev = Math.sqrt(
        squareDiffs.reduce((a, b) => a + b) / this.data.length
      );
    }
    return this._stdDev;
  }
}

const analyzer = new DataAnalyzer([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Only computes what's accessed
console.log(analyzer.mean);   // Computes mean
console.log(analyzer.mean);   // Uses cached value
console.log(analyzer.median); // Computes median
```

#### Lazy Loading Modules

```javascript
// SLOW: Load everything upfront
import heavyLibrary from 'heavy-library';
import anotherLibrary from 'another-library';

function processData(data) {
  if (data.type === 'special') {
    return heavyLibrary.process(data);
  }
  return data;
}

// FAST: Load only when needed
async function processDataLazy(data) {
  if (data.type === 'special') {
    const { default: heavyLibrary } = await import('heavy-library');
    return heavyLibrary.process(data);
  }
  return data;
}

// Lazy component loading in React
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </React.Suspense>
  );
}
```

---

## 23.4 Memory Optimization

Efficient memory usage improves performance and prevents leaks.

### Reducing Memory Allocations

Minimize object creation in hot code paths.

#### Reuse Objects

```javascript
// BAD: Creates new object each time
function processPointSlow(x, y) {
  return { x, y, distance: Math.sqrt(x * x + y * y) };
}

const points = [];
for (let i = 0; i < 100000; i++) {
  points.push(processPointSlow(i, i + 1)); // 100,000 allocations
}

// GOOD: Reuse object
const pointCache = { x: 0, y: 0, distance: 0 };

function processPointFast(x, y, result = pointCache) {
  result.x = x;
  result.y = y;
  result.distance = Math.sqrt(x * x + y * y);
  return result;
}

// Use with care - caller must copy if needed
```

#### String Concatenation

```javascript
// BAD: Creates many intermediate strings
console.time('Concatenation');
let str1 = '';
for (let i = 0; i < 10000; i++) {
  str1 += i.toString(); // Creates new string each time
}
console.timeEnd('Concatenation');

// GOOD: Use array join
console.time('Array join');
const parts = [];
for (let i = 0; i < 10000; i++) {
  parts.push(i.toString());
}
const str2 = parts.join('');
console.timeEnd('Array join');

// BETTER: Template literals for small strings
console.time('Template');
const str3 = Array.from({ length: 10000 }, (_, i) => i).join('');
console.timeEnd('Template');
```

#### Array Pre-allocation

```javascript
// BAD: Dynamic growth
console.time('Dynamic');
const arr1 = [];
for (let i = 0; i < 100000; i++) {
  arr1.push(i); // May need reallocation
}
console.timeEnd('Dynamic');

// GOOD: Pre-allocate
console.time('Pre-allocated');
const arr2 = new Array(100000);
for (let i = 0; i < 100000; i++) {
  arr2[i] = i; // No reallocation needed
}
console.timeEnd('Pre-allocated');

// BEST: Use fill if initializing to same value
console.time('Fill');
const arr3 = new Array(100000).fill(0);
console.timeEnd('Fill');
```

#### Typed Arrays for Numeric Data

```javascript
// Regular array - stores any type
const regularArray = new Array(1000000);
for (let i = 0; i < 1000000; i++) {
  regularArray[i] = i;
}

// Typed array - stores only specific numeric type
const typedArray = new Int32Array(1000000);
for (let i = 0; i < 1000000; i++) {
  typedArray[i] = i;
}

console.log('Regular array:', regularArray.length * 8, 'bytes (estimated)');
console.log('Typed array:', typedArray.byteLength, 'bytes');

// Benchmark operations
const numbers = Array.from({ length: 100000 }, (_, i) => i);

console.time('Regular array sum');
let sum1 = 0;
for (let i = 0; i < numbers.length; i++) {
  sum1 += numbers[i];
}
console.timeEnd('Regular array sum');

const typedNumbers = new Int32Array(numbers);

console.time('Typed array sum');
let sum2 = 0;
for (let i = 0; i < typedNumbers.length; i++) {
  sum2 += typedNumbers[i];
}
console.timeEnd('Typed array sum');
```

### Object Pooling

Reuse objects instead of creating and destroying them.

#### Basic Object Pool

```javascript
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    
    // Pre-create objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }
  
  acquire() {
    return this.pool.length > 0 
      ? this.pool.pop() 
      : this.factory();
  }
  
  release(obj) {
    this.reset(obj);
    this.pool.push(obj);
  }
  
  size() {
    return this.pool.length;
  }
}

// Particle system example
class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.active = false;
  }
}

const particlePool = new ObjectPool(
  () => new Particle(),
  (particle) => {
    particle.x = 0;
    particle.y = 0;
    particle.vx = 0;
    particle.vy = 0;
    particle.life = 0;
    particle.active = false;
  },
  100
);

// Game loop
const activeParticles = [];

function spawnParticle(x, y) {
  const particle = particlePool.acquire();
  particle.x = x;
  particle.y = y;
  particle.vx = Math.random() * 2 - 1;
  particle.vy = Math.random() * 2 - 1;
  particle.life = 100;
  particle.active = true;
  activeParticles.push(particle);
}

function updateParticles() {
  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const particle = activeParticles[i];
    
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
    
    if (particle.life <= 0) {
      particle.active = false;
      activeParticles.splice(i, 1);
      particlePool.release(particle);
    }
  }
}

// Benchmark
console.time('With pooling');
for (let i = 0; i < 10000; i++) {
  spawnParticle(Math.random() * 800, Math.random() * 600);
  updateParticles();
}
console.timeEnd('With pooling');

console.log('Pool size:', particlePool.size());
```

#### Array Buffer Pool

```javascript
class ArrayBufferPool {
  constructor(bufferSize, initialCount = 5) {
    this.bufferSize = bufferSize;
    this.pool = [];
    
    for (let i = 0; i < initialCount; i++) {
      this.pool.push(new ArrayBuffer(bufferSize));
    }
  }
  
  acquire() {
    return this.pool.length > 0 
      ? this.pool.pop() 
      : new ArrayBuffer(this.bufferSize);
  }
  
  release(buffer) {
    if (buffer.byteLength === this.bufferSize) {
      // Clear buffer
      new Uint8Array(buffer).fill(0);
      this.pool.push(buffer);
    }
  }
}

const bufferPool = new ArrayBufferPool(1024 * 1024); // 1MB buffers

function processData(data) {
  const buffer = bufferPool.acquire();
  const view = new Uint8Array(buffer);
  
  // Process data using buffer
  for (let i = 0; i < data.length; i++) {
    view[i] = data[i] * 2;
  }
  
  // Use buffer...
  const result = view.slice(0, data.length);
  
  // Return to pool
  bufferPool.release(buffer);
  
  return result;
}
```

#### Connection Pool

```javascript
class ConnectionPool {
  constructor(createConnection, maxSize = 10) {
    this.createConnection = createConnection;
    this.maxSize = maxSize;
    this.available = [];
    this.inUse = new Set();
  }
  
  async acquire() {
    // Use available connection
    if (this.available.length > 0) {
      const conn = this.available.pop();
      this.inUse.add(conn);
      return conn;
    }
    
    // Create new if under limit
    if (this.inUse.size < this.maxSize) {
      const conn = await this.createConnection();
      this.inUse.add(conn);
      return conn;
    }
    
    // Wait for available connection
    return new Promise((resolve) => {
      const checkAvailable = setInterval(() => {
        if (this.available.length > 0) {
          clearInterval(checkAvailable);
          const conn = this.available.pop();
          this.inUse.add(conn);
          resolve(conn);
        }
      }, 10);
    });
  }
  
  release(conn) {
    this.inUse.delete(conn);
    this.available.push(conn);
  }
  
  async destroy() {
    // Close all connections
    const all = [...this.available, ...this.inUse];
    for (const conn of all) {
      await conn.close();
    }
    this.available = [];
    this.inUse.clear();
  }
}

// Usage
const pool = new ConnectionPool(
  async () => ({
    connected: true,
    query: async (sql) => ({ rows: [] }),
    close: async () => {}
  }),
  5
);

async function performQuery(sql) {
  const conn = await pool.acquire();
  try {
    return await conn.query(sql);
  } finally {
    pool.release(conn);
  }
}
```

### WeakMap/WeakSet Usage

WeakMap and WeakSet hold weak references, allowing garbage collection.

#### WeakMap for Metadata

```javascript
// BAD: Prevents garbage collection
const metadata = new Map();

class User {
  constructor(name) {
    this.name = name;
    metadata.set(this, {
      created: Date.now(),
      loginCount: 0
    });
  }
}

let user = new User('Alice');
user = null; // User object can't be GC'd - metadata holds reference

// GOOD: Allows garbage collection
const weakMetadata = new WeakMap();

class UserOptimized {
  constructor(name) {
    this.name = name;
    weakMetadata.set(this, {
      created: Date.now(),
      loginCount: 0
    });
  }
}

let user2 = new UserOptimized('Bob');
user2 = null; // User object can be GC'd - weakMetadata doesn't prevent it
```

#### WeakMap for Private Data

```javascript
// Private data using WeakMap
const privateData = new WeakMap();

class BankAccount {
  constructor(balance) {
    privateData.set(this, { balance });
  }
  
  getBalance() {
    return privateData.get(this).balance;
  }
  
  deposit(amount) {
    const data = privateData.get(this);
    data.balance += amount;
  }
  
  withdraw(amount) {
    const data = privateData.get(this);
    if (data.balance >= amount) {
      data.balance -= amount;
      return true;
    }
    return false;
  }
}

const account = new BankAccount(1000);
console.log(account.getBalance()); // 1000
account.deposit(500);
console.log(account.getBalance()); // 1500

// Private data can't be accessed directly
console.log(account.balance); // undefined
```

#### WeakSet for Tracking

```javascript
const processedObjects = new WeakSet();

function processOnce(obj) {
  if (processedObjects.has(obj)) {
    console.log('Already processed');
    return;
  }
  
  console.log('Processing:', obj);
  // Process object...
  
  processedObjects.add(obj);
}

const obj1 = { id: 1 };
const obj2 = { id: 2 };

processOnce(obj1); // Processing: { id: 1 }
processOnce(obj1); // Already processed
processOnce(obj2); // Processing: { id: 2 }
```

#### WeakMap for Caching

```javascript
const cache = new WeakMap();

function expensiveOperation(obj) {
  if (cache.has(obj)) {
    console.log('Cache hit');
    return cache.get(obj);
  }
  
  console.log('Computing...');
  // Expensive computation
  const result = {
    value: obj.value * 2,
    computed: Date.now()
  };
  
  cache.set(obj, result);
  return result;
}

const data = { value: 42 };

console.log(expensiveOperation(data)); // Computing...
console.log(expensiveOperation(data)); // Cache hit

// When data is GC'd, cache entry is automatically removed
```

### Avoiding Memory Leaks

Common patterns that cause memory leaks and how to fix them.

#### Event Listeners

```javascript
// BAD: Memory leak
class LeakyComponent {
  constructor(element) {
    this.element = element;
    this.data = new Array(10000).fill('data');
    
    // Event listener keeps reference to component
    this.element.addEventListener('click', () => {
      console.log(this.data);
    });
  }
}

// If element is removed from DOM, component can't be GC'd

// GOOD: Remove listeners
class ProperComponent {
  constructor(element) {
    this.element = element;
    this.data = new Array(10000).fill('data');
    
    this.handleClick = () => {
      console.log(this.data);
    };
    
    this.element.addEventListener('click', this.handleClick);
  }
  
  destroy() {
    this.element.removeEventListener('click', this.handleClick);
    this.element = null;
    this.data = null;
  }
}
```

#### Timers

```javascript
// BAD: Memory leak
class LeakyTimer {
  constructor() {
    this.data = new Array(10000).fill('data');
    
    setInterval(() => {
      console.log(this.data.length);
    }, 1000);
  }
}

// Timer keeps running even if object is no longer needed

// GOOD: Clear timers
class ProperTimer {
  constructor() {
    this.data = new Array(10000).fill('data');
    
    this.timerId = setInterval(() => {
      console.log(this.data.length);
    }, 1000);
  }
  
  destroy() {
    clearInterval(this.timerId);
    this.data = null;
  }
}
```

#### Closures

```javascript
// BAD: Closure captures large object
function createHandler() {
  const largeObject = new Array(10000).fill('data');
  const smallValue = 42;
  
  return function() {
    console.log(smallValue);
    // largeObject is captured but not used!
  };
}

// GOOD: Only capture what's needed
function createHandlerOptimized() {
  const largeObject = new Array(10000).fill('data');
  const smallValue = 42;
  
  // Process large object and discard
  const result = largeObject.length + smallValue;
  
  return function() {
    console.log(result);
    // Only captures result, not largeObject
  };
}
```

#### Detached DOM Nodes

```javascript
// BAD: Keeping references to removed DOM nodes
const detachedNodes = [];

function createAndRemoveNode() {
  const div = document.createElement('div');
  div.innerHTML = 'Content';
  document.body.appendChild(div);
  
  // Store reference
  detachedNodes.push(div);
  
  // Remove from DOM
  document.body.removeChild(div);
  
  // div is detached but still referenced - memory leak!
}

// GOOD: Don't keep references
function createAndRemoveNodeProper() {
  const div = document.createElement('div');
  div.innerHTML = 'Content';
  document.body.appendChild(div);
  
  // Use node...
  
  // Remove from DOM
  document.body.removeChild(div);
  
  // No reference kept - can be GC'd
}
```

#### Circular References

```javascript
// BAD: Circular references with DOM
function createCircularLeak() {
  const element = document.createElement('div');
  const data = {
    element: element,
    info: new Array(10000).fill('data')
  };
  
  // Circular reference
  element.myData = data;
  
  document.body.appendChild(element);
  
  return element;
}

// GOOD: Use WeakMap
const elementData = new WeakMap();

function createProper() {
  const element = document.createElement('div');
  const data = {
    info: new Array(10000).fill('data')
  };
  
  // No circular reference
  elementData.set(element, data);
  
  document.body.appendChild(element);
  
  return element;
}
```

---

## Summary

This document covered Code-Level and Memory Optimization:

**Code-Level Optimization:**

- Loop optimization (caching length, unrolling, avoiding calls, early breaks)
- Function call overhead (inlining, memoization, reducing recursion, binding)
- Variable scope (local vs global, caching properties, closure optimization)
- Avoiding unnecessary work (short-circuit, memoization, early returns)
- Lazy evaluation (initialization, generators, properties, module loading)

**Memory Optimization:**

- Reducing allocations (reusing objects, string handling, pre-allocation, typed arrays)
- Object pooling (particles, buffers, connections)
- WeakMap/WeakSet (metadata, private data, tracking, caching)
- Avoiding leaks (event listeners, timers, closures, DOM nodes, circular references)

These optimizations help create faster, more memory-efficient JavaScript applications.

---

**Related Topics:**

- Rendering Performance
- Bundle Optimization
- Profiling Tools
- Performance Monitoring