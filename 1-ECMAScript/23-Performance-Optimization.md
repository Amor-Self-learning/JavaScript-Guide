# 23 Performance Optimization

Performance matters for user experience. This chapter covers JavaScript optimization, algorithm complexity, memory management, rendering, and bundle optimization.

---

# Table of Contents

- [23.1 JavaScript Engine Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#231-javascript-engine-optimization)
    - [V8 Optimization Tips](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#v8-optimization-tips)
    - [JIT Compilation](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#jit-compilation)
    - [Hidden Classes and Inline Caching](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#hidden-classes-and-inline-caching)
    - [Deoptimization Triggers](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#deoptimization-triggers)
- [23.2 Algorithm Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#232-algorithm-optimization)
    - [Time Complexity (Big O)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#time-complexity-big-o)
    - [Space Complexity](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#space-complexity)
    - [Common Algorithm Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#common-algorithm-patterns)
    - [Choosing Appropriate Data Structures](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#choosing-appropriate-data-structures)

---

## 23.1 JavaScript Engine Optimization

Modern JavaScript engines like V8 (Chrome, Node.js), SpiderMonkey (Firefox), and JavaScriptCore (Safari) use sophisticated optimization techniques.

### V8 Optimization Tips

V8 uses multiple compilation tiers and optimization strategies to make JavaScript fast.

#### Monomorphic vs Polymorphic Code

```javascript
// MONOMORPHIC (FAST) - Always receives same type
function addMonomorphic(obj) {
  return obj.x + obj.y;
}

// Always called with same shape
addMonomorphic({ x: 1, y: 2 });
addMonomorphic({ x: 3, y: 4 });
addMonomorphic({ x: 5, y: 6 });

// POLYMORPHIC (SLOWER) - Receives different types
function addPolymorphic(obj) {
  return obj.x + obj.y;
}

// Called with different shapes
addPolymorphic({ x: 1, y: 2 });
addPolymorphic({ x: 3, y: 4, z: 5 }); // Different shape
addPolymorphic({ y: 6, x: 7 }); // Different property order
addPolymorphic({ x: '8', y: '9' }); // Different types

// MEGAMORPHIC (SLOWEST) - Too many different types
// V8 gives up optimization after ~4 different shapes
```

#### Optimizing Object Creation

```javascript
// BAD: Different shapes
function createUser1(name, age) {
  const user = {};
  user.name = name;
  if (age) {
    user.age = age; // Sometimes added, sometimes not
  }
  return user;
}

// GOOD: Consistent shape
function createUser2(name, age) {
  return {
    name: name,
    age: age || null // Always has same properties
  };
}

// BETTER: Use constructor or class
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age || null;
  }
}

function createUser3(name, age) {
  return new User(name, age);
}

// Benchmark
console.time('inconsistent');
for (let i = 0; i < 1000000; i++) {
  createUser1('Alice', i % 2 ? 30 : undefined);
}
console.timeEnd('inconsistent');

console.time('consistent');
for (let i = 0; i < 1000000; i++) {
  createUser2('Alice', i % 2 ? 30 : null);
}
console.timeEnd('consistent');

console.time('class');
for (let i = 0; i < 1000000; i++) {
  createUser3('Alice', i % 2 ? 30 : null);
}
console.timeEnd('class');
```

#### Array Optimization

```javascript
// BAD: Mixed types in array
const mixedArray = [1, 'two', 3, 'four', 5];
// V8 can't optimize - switches to slower "dictionary mode"

// GOOD: Consistent types
const numbersArray = [1, 2, 3, 4, 5];
const stringsArray = ['one', 'two', 'three', 'four', 'five'];

// BAD: Holes in array
const sparseArray = [1, 2, 3];
sparseArray[100] = 100; // Creates holes
// V8 uses slower hash table representation

// GOOD: Dense arrays
const denseArray = new Array(100).fill(0);
denseArray[50] = 50;

// BAD: Changing array length frequently
const dynamic = [];
for (let i = 0; i < 1000; i++) {
  dynamic.push(i);
  if (i % 10 === 0) {
    dynamic.pop(); // Frequent size changes
  }
}

// GOOD: Pre-allocate if size is known
const preallocated = new Array(1000);
for (let i = 0; i < 1000; i++) {
  preallocated[i] = i;
}

// BAD: delete on arrays
const arr = [1, 2, 3, 4, 5];
delete arr[2]; // Creates hole, degrades performance

// GOOD: splice or filter
const arr2 = [1, 2, 3, 4, 5];
arr2.splice(2, 1); // Maintains dense array
```

#### Function Optimization

```javascript
// BAD: Functions with too many arguments (>4 becomes slower)
function tooManyArgs(a, b, c, d, e, f, g, h) {
  return a + b + c + d + e + f + g + h;
}

// GOOD: Use object parameter
function betterArgs({ a, b, c, d, e, f, g, h }) {
  return a + b + c + d + e + f + g + h;
}

// BAD: try-catch in hot code
function hotFunction(x) {
  try {
    return x * 2; // Normal code shouldn't be in try
  } catch (e) {
    return 0;
  }
}

// GOOD: Minimize try-catch scope
function hotFunction2(x) {
  return x * 2;
}

function callHotFunction(x) {
  try {
    return hotFunction2(x);
  } catch (e) {
    return 0;
  }
}

// BAD: arguments object
function useArguments() {
  return Array.prototype.slice.call(arguments);
}

// GOOD: Rest parameters
function useRest(...args) {
  return args;
}
```

### JIT Compilation

V8 uses Just-In-Time compilation to optimize hot code paths.

#### Compilation Pipeline

```javascript
/*
V8 Compilation Pipeline:
1. Ignition (Interpreter) - Runs code quickly with baseline performance
2. TurboFan (Optimizing Compiler) - Optimizes hot functions

Code starts in interpreter, then:
- If function is called many times → TurboFan optimizes it
- If assumptions break → Deoptimizes back to interpreter
*/

// Example: Hot function that gets optimized
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Called many times - gets optimized by TurboFan
console.time('first run');
fibonacci(20);
console.timeEnd('first run');

console.time('optimized run');
fibonacci(20); // Faster after optimization
console.timeEnd('optimized run');
```

#### Optimization Flags

```javascript
// Check optimization status (V8 specific, requires --allow-natives-syntax flag)

// Run with: node --allow-natives-syntax script.js

function add(a, b) {
  return a + b;
}

// Force optimization (for testing)
// %OptimizeFunctionOnNextCall(add);

// Warm up function
for (let i = 0; i < 10000; i++) {
  add(i, i + 1);
}

// Check if optimized
// console.log(%GetOptimizationStatus(add));

// Force deoptimization
// %DeoptimizeFunction(add);
```

#### Inline Caching Tiers

```javascript
// Inline caching progression: Uninitialized → Monomorphic → Polymorphic → Megamorphic

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function distance(p) {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

// First call - cache miss (uninitialized)
distance(new Point(3, 4));

// Subsequent calls with same shape - cache hit (monomorphic - FAST)
for (let i = 0; i < 10000; i++) {
  distance(new Point(i, i + 1));
}

// Different shape - polymorphic (slower)
distance({ x: 5, y: 6, z: 7 });

// Too many shapes - megamorphic (slowest)
distance({ y: 8, x: 9 }); // Different property order
distance({ x: '10', y: '11' }); // Different types
```

### Hidden Classes and Inline Caching

V8 uses hidden classes (also called shapes or maps) to optimize property access.

#### Hidden Classes

```javascript
// Objects with same properties in same order share hidden class

// These share the same hidden class (FAST)
const obj1 = { x: 1, y: 2 };
const obj2 = { x: 3, y: 4 };
const obj3 = { x: 5, y: 6 };

// These have different hidden classes (SLOW)
const obj4 = { y: 8, x: 7 }; // Different order
const obj5 = { x: 9, y: 10, z: 11 }; // Different properties

// Visualizing hidden class transitions
function Point(x, y) {
  this.x = x; // Transition 1: empty -> {x}
  this.y = y; // Transition 2: {x} -> {x, y}
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 and p2 share same hidden class

// Breaking shared hidden class
p1.z = 5; // p1 gets new hidden class
// p2 still has original hidden class
```

#### Property Access Optimization

```javascript
// SLOW: Property names as variables
function getProperty(obj, prop) {
  return obj[prop]; // Dynamic property access - can't inline cache
}

// FAST: Direct property access
function getX(obj) {
  return obj.x; // Static property access - inline caching works
}

// SLOW: Adding properties after creation
function createUser() {
  const user = {};
  user.name = 'Alice';
  user.age = 30;
  user.email = 'alice@example.com';
  return user;
  // Each assignment creates new hidden class
}

// FAST: Object literal
function createUserFast() {
  return {
    name: 'Alice',
    age: 30,
    email: 'alice@example.com'
  };
  // Single hidden class
}

// FAST: Constructor
class User {
  constructor(name, age, email) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
}

function createUserConstructor() {
  return new User('Alice', 30, 'alice@example.com');
  // All instances share hidden class
}
```

#### Property Deletion

```javascript
// VERY BAD: Deleting properties
function deleteProperty(obj) {
  delete obj.x; // Breaks hidden class, puts object in "dictionary mode"
  // Object becomes slow hash table instead of optimized structure
}

const obj = { x: 1, y: 2, z: 3 };
deleteProperty(obj);

// GOOD: Set to undefined instead
function nullifyProperty(obj) {
  obj.x = undefined; // Keeps hidden class intact
}

const obj2 = { x: 1, y: 2, z: 3 };
nullifyProperty(obj2);

// BETTER: Design objects to not need deletion
class OptimizedObject {
  constructor() {
    this.x = null; // Always has property, even if unused
    this.y = null;
    this.z = null;
  }
}
```

#### Monomorphic Property Access

```javascript
// Create consistent object shapes
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  area() {
    return this.width * this.height;
  }
}

// FAST: All rectangles have same shape
const rectangles = [
  new Rectangle(10, 20),
  new Rectangle(30, 40),
  new Rectangle(50, 60)
];

function totalArea(shapes) {
  let total = 0;
  for (const shape of shapes) {
    total += shape.area(); // Monomorphic - V8 can inline
  }
  return total;
}

console.log(totalArea(rectangles)); // Fast

// SLOW: Mixed shapes
class Circle {
  constructor(radius) {
    this.radius = radius;
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

const mixedShapes = [
  new Rectangle(10, 20),
  new Circle(15),
  new Rectangle(30, 40)
];

console.log(totalArea(mixedShapes)); // Polymorphic - slower
```

### Deoptimization Triggers

Certain patterns cause optimized code to deoptimize back to interpreted code.

#### Type Changes

```javascript
// Optimized for numbers
function add(a, b) {
  return a + b;
}

// Warm up with numbers
for (let i = 0; i < 10000; i++) {
  add(i, i + 1);
}

// Now optimized for number addition

// DEOPTIMIZATION: Pass strings
add('hello', 'world'); // Deoptimizes - now handles strings too

// Function becomes polymorphic, slower for numbers
```

#### Arguments Object

```javascript
// Using 'arguments' prevents optimization
function sumBad() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i]; // Prevents optimization
  }
  return total;
}

// GOOD: Use rest parameters
function sumGood(...numbers) {
  let total = 0;
  for (const num of numbers) {
    total += num;
  }
  return total;
}
```

#### For-In Loops

```javascript
// For-in loops can prevent optimization
function processObjectBad(obj) {
  let sum = 0;
  for (const key in obj) { // Can deoptimize
    sum += obj[key];
  }
  return sum;
}

// BETTER: Object.keys
function processObjectGood(obj) {
  let sum = 0;
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    sum += obj[keys[i]];
  }
  return sum;
}

// BEST: Object.values if you don't need keys
function processObjectBest(obj) {
  let sum = 0;
  const values = Object.values(obj);
  for (const value of values) {
    sum += value;
  }
  return sum;
}
```

#### Changing Function Behavior

```javascript
// Function behavior should be consistent
function calculate(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    // Type checking in function deoptimizes
    return 0;
  }
  return x + y;
}

// BETTER: Validate outside hot path
function validateAndCalculate(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    return 0;
  }
  return calculateFast(x, y);
}

function calculateFast(x, y) {
  // Only called with validated numbers
  return x + y;
}
```

#### Try-Catch

```javascript
// Try-catch blocks prevent optimization of the entire function

// BAD: Try-catch around hot code
function processDataBad(data) {
  try {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * 2; // Hot code in try block - can't optimize
    }
    return sum;
  } catch (e) {
    return 0;
  }
}

// GOOD: Isolate try-catch
function processDataGood(data) {
  return processDataInner(data);
}

function processDataInner(data) {
  // This function can be optimized
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * 2;
  }
  return sum;
}

// Wrap only when calling
function safeProcess(data) {
  try {
    return processDataInner(data);
  } catch (e) {
    return 0;
  }
}
```

#### Sparse Arrays and Holes

```javascript
// Sparse arrays deoptimize array operations
const sparse = [1, 2, 3];
sparse[1000] = 1000; // Creates holes - array becomes slow

// Operations on sparse arrays are slower
function sumSparse(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i] || 0; // Must check for holes
  }
  return sum;
}

// GOOD: Dense arrays
const dense = new Array(1001).fill(0);
dense[1000] = 1000;

function sumDense(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]; // No hole checks needed
  }
  return sum;
}
```

---

## 23.2 Algorithm Optimization

Understanding algorithmic complexity helps write performant code.

### Time Complexity (Big O)

Big O notation describes how an algorithm's runtime grows with input size.

#### Common Time Complexities

```javascript
// O(1) - Constant time
// Runtime doesn't depend on input size
function getFirst(arr) {
  return arr[0]; // Always one operation
}

function hashMapLookup(map, key) {
  return map.get(key); // Hash table lookup is O(1) average case
}

// O(log n) - Logarithmic time
// Runtime grows logarithmically with input size
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Sorted array of 1,000,000 items: max ~20 comparisons
// Sorted array of 1,000,000,000 items: max ~30 comparisons

// O(n) - Linear time
// Runtime grows linearly with input size
function findMax(arr) {
  let max = arr[0];
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  
  return max;
}

// Array of 1000 items: 1000 operations
// Array of 2000 items: 2000 operations

// O(n log n) - Linearithmic time
// Most efficient comparison-based sorting algorithms
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// O(n²) - Quadratic time
// Nested loops over same data
function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}

// Array of 100 items: 10,000 operations
// Array of 1000 items: 1,000,000 operations

// O(2ⁿ) - Exponential time
// Very slow, usually indicates inefficient recursion
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// fibonacci(10): 177 calls
// fibonacci(20): 21,891 calls
// fibonacci(40): 331,160,281 calls!
```

#### Analyzing Time Complexity

```javascript
// Example 1: Find duplicates
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {        // n iterations
    for (let j = i + 1; j < arr.length; j++) {  // n iterations
      if (arr[i] === arr[j]) {
        return true;
      }
    }
  }
  return false;
}
// Time: O(n²) - nested loops

// Better solution using Set
function hasDuplicatesFast(arr) {
  const seen = new Set();
  
  for (const item of arr) {  // n iterations
    if (seen.has(item)) {    // O(1) lookup
      return true;
    }
    seen.add(item);          // O(1) insertion
  }
  
  return false;
}
// Time: O(n) - single loop with O(1) operations

// Example 2: Two Sum problem
function twoSumSlow(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) {
        return [i, j];
      }
    }
  }
  return null;
}
// Time: O(n²)

function twoSumFast(arr, target) {
  const map = new Map();
  
  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(arr[i], i);
  }
  
  return null;
}
// Time: O(n)

// Benchmark
const largeArray = Array.from({ length: 10000 }, (_, i) => i);

console.time('O(n²) solution');
twoSumSlow(largeArray, 19998);
console.timeEnd('O(n²) solution');

console.time('O(n) solution');
twoSumFast(largeArray, 19998);
console.timeEnd('O(n) solution');
```

#### Optimizing Common Patterns

```javascript
// Pattern 1: Array search
// BAD: O(n) for each search
function findMultiple(arr, targets) {
  const results = [];
  for (const target of targets) {
    results.push(arr.includes(target)); // O(n) each time
  }
  return results;
}
// Total: O(n × m) where m is targets.length

// GOOD: O(n) setup, O(1) per search
function findMultipleFast(arr, targets) {
  const set = new Set(arr); // O(n)
  const results = [];
  for (const target of targets) {
    results.push(set.has(target)); // O(1) each time
  }
  return results;
}
// Total: O(n + m)

// Pattern 2: Remove duplicates
// BAD: O(n²)
function removeDuplicatesSlow(arr) {
  const result = [];
  for (const item of arr) {
    if (!result.includes(item)) { // O(n) check
      result.push(item);
    }
  }
  return result;
}

// GOOD: O(n)
function removeDuplicatesFast(arr) {
  return [...new Set(arr)]; // Set removes duplicates
}

// Pattern 3: Counting occurrences
// O(n)
function countOccurrences(arr) {
  const counts = new Map();
  
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  
  return counts;
}

// Pattern 4: Finding pairs with sum
// O(n) using hash map
function findPairsWithSum(arr, target) {
  const pairs = [];
  const seen = new Set();
  
  for (const num of arr) {
    const complement = target - num;
    
    if (seen.has(complement)) {
      pairs.push([complement, num]);
    }
    
    seen.add(num);
  }
  
  return pairs;
}
```

### Space Complexity

Space complexity measures memory usage relative to input size.

#### Common Space Complexities

```javascript
// O(1) - Constant space
// Memory usage doesn't grow with input
function sum(arr) {
  let total = 0; // Fixed variables
  for (const num of arr) {
    total += num;
  }
  return total;
}

// O(n) - Linear space
// Memory grows linearly with input
function double(arr) {
  const result = []; // New array of size n
  for (const num of arr) {
    result.push(num * 2);
  }
  return result;
}

// Recursion space complexity
// O(n) space - call stack depth
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
  // Each call adds frame to stack
}

// O(1) space - iterative version
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// O(n²) space - 2D array
function createMatrix(n) {
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = new Array(n).fill(0);
  }
  return matrix;
}
```

#### Space-Time Tradeoffs

```javascript
// Fibonacci: Time vs Space tradeoffs

// BAD: O(2ⁿ) time, O(n) space (call stack)
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// BETTER: O(n) time, O(n) space (memoization)
function fibMemoized(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibMemoized(n - 1, memo) + fibMemoized(n - 2, memo);
  return memo[n];
}

// BEST: O(n) time, O(1) space (iterative)
function fibIterative(n) {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  
  return curr;
}

// Benchmark
console.time('Recursive');
fibRecursive(30);
console.timeEnd('Recursive'); // Very slow

console.time('Memoized');
fibMemoized(30);
console.timeEnd('Memoized'); // Fast

console.time('Iterative');
fibIterative(30);
console.timeEnd('Iterative'); // Fastest

// Memoization pattern for expensive functions
function memoize(fn) {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Trading space for time
const expensiveCalculation = memoize((n) => {
  // Simulate expensive operation
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
});

console.time('First call');
expensiveCalculation(10);
console.timeEnd('First call'); // Slow

console.time('Cached call');
expensiveCalculation(10);
console.timeEnd('Cached call'); // Instant
```

### Common Algorithm Patterns

Recognizing patterns helps choose the right algorithm.

#### Sliding Window

```javascript
// Problem: Find max sum of k consecutive elements
// BAD: O(n × k) - recalculate each window
function maxSumSlow(arr, k) {
  let maxSum = -Infinity;
  
  for (let i = 0; i <= arr.length - k; i++) {
    let sum = 0;
    for (let j = i; j < i + k; j++) {
      sum += arr[j];
    }
    maxSum = Math.max(maxSum, sum);
  }
  
  return maxSum;
}

// GOOD: O(n) - sliding window
function maxSumFast(arr, k) {
  let windowSum = 0;
  
  // Calculate first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  
  let maxSum = windowSum;
  
  // Slide window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}

// Longest substring without repeating characters
function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLength = 0;
  let start = 0;
  
  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    
    if (seen.has(char) && seen.get(char) >= start) {
      start = seen.get(char) + 1;
    }
    
    seen.set(char, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }
  
  return maxLength;
}
```

#### Two Pointers

```javascript
// Problem: Check if string is palindrome
// O(n) - two pointers from ends
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  
  while (left < right) {
    if (s[left] !== s[right]) {
      return false;
    }
    left++;
    right--;
  }
  
  return true;
}

// Problem: Remove duplicates from sorted array in-place
function removeDuplicates(arr) {
  if (arr.length === 0) return 0;
  
  let writeIndex = 1;
  
  for (let readIndex = 1; readIndex < arr.length; readIndex++) {
    if (arr[readIndex] !== arr[readIndex - 1]) {
      arr[writeIndex] = arr[readIndex];
      writeIndex++;
    }
  }
  
  return writeIndex;
}

// Problem: Container with most water
function maxArea(heights) {
  let maxArea = 0;
  let left = 0;
  let right = heights.length - 1;
  
  while (left < right) {
    const width = right - left;
    const height = Math.min(heights[left], heights[right]);
    maxArea = Math.max(maxArea, width * height);
    
    if (heights[left] < heights[right]) {
      left++;
    } else {
      right--;
    }
  }
  
  return maxArea;
}
```

#### Binary Search Variations

```javascript
// Standard binary search
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Find first occurrence
function findFirst(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1; // Continue searching left
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return result;
}

// Find insertion point
function findInsertPosition(arr, target) {
  let left = 0;
  let right = arr.length;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  
  return left;
}
```

#### Dynamic Programming

```javascript
// Problem: Coin change - minimum coins to make amount
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i >= coin) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// Problem: Longest increasing subsequence
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  const dp = new Array(nums.length).fill(1);
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}

// Problem: 0/1 Knapsack
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill(null)
    .map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
}
```

### Choosing Appropriate Data Structures

The right data structure dramatically affects performance.

#### Array vs Set

```javascript
// Problem: Check membership
const data = Array.from({ length: 100000 }, (_, i) => i);

// Array: O(n) lookup
console.time('Array lookup');
for (let i = 0; i < 1000; i++) {
  data.includes(50000);
}
console.timeEnd('Array lookup');

// Set: O(1) lookup
const dataSet = new Set(data);

console.time('Set lookup');
for (let i = 0; i < 1000; i++) {
  dataSet.has(50000);
}
console.timeEnd('Set lookup');

// Use Array when:
// - Order matters
// - Need indexed access
// - Duplicates allowed
// - Iterating frequently

// Use Set when:
// - Checking membership frequently
// - Need unique values
// - No duplicates allowed
// - Order doesn't matter
```

#### Array vs Map

```javascript
// Problem: Key-value storage

// Object/Map comparison
const objStore = {};
const mapStore = new Map();

// Objects are slower with many properties
console.time('Object set');
for (let i = 0; i < 100000; i++) {
  objStore[`key${i}`] = i;
}
console.timeEnd('Object set');

console.time('Map set');
for (let i = 0; i < 100000; i++) {
  mapStore.set(`key${i}`, i);
}
console.timeEnd('Map set');

// Maps are faster for frequent additions/deletions
console.time('Object delete');
for (let i = 0; i < 10000; i++) {
  delete objStore[`key${i}`];
}
console.timeEnd('Object delete');

console.time('Map delete');
for (let i = 0; i < 10000; i++) {
  mapStore.delete(`key${i}`);
}
console.timeEnd('Map delete');

// Use Object when:
// - Simple key-value pairs
// - Keys are strings
// - JSON serialization needed
// - Small number of properties

// Use Map when:
// - Frequent additions/deletions
// - Non-string keys needed
// - Need to iterate keys
// - Large number of entries
```

#### Array vs Linked List

```javascript
// Linked List implementation
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  
  // O(1)
  prepend(value) {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size++;
  }
  
  // O(1)
  append(value) {
    const node = new Node(value);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }
  
  // O(n)
  get(index) {
    let current = this.head;
    for (let i = 0; i < index && current; i++) {
      current = current.next;
    }
    return current?.value;
  }
}

// Comparison
const arr = [];
const list = new LinkedList();

// Array: O(1) for append (amortized)
console.time('Array append');
for (let i = 0; i < 100000; i++) {
  arr.push(i);
}
console.timeEnd('Array append');

// Linked List: O(1) for append
console.time('List append');
for (let i = 0; i < 100000; i++) {
  list.append(i);
}
console.timeEnd('List append');

// Array: O(n) for prepend
console.time('Array prepend');
for (let i = 0; i < 1000; i++) {
  arr.unshift(i);
}
console.timeEnd('Array prepend');

// Linked List: O(1) for prepend
console.time('List prepend');
for (let i = 0; i < 1000; i++) {
  list.prepend(i);
}
console.timeEnd('List prepend');

// Use Array when:
// - Random access needed (O(1))
// - Memory locality important
// - Simple iteration
// - Most operations are at end

// Use Linked List when:
// - Frequent insertions/deletions at beginning
// - No random access needed
// - Don't know size in advance
// - Memory fragmentation acceptable
```

#### Stack vs Queue

```javascript
// Stack (LIFO) using Array
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item); // O(1)
  }
  
  pop() {
    return this.items.pop(); // O(1)
  }
  
  peek() {
    return this.items[this.items.length - 1]; // O(1)
  }
}

// Queue (FIFO) using Array
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(item) {
    this.items.push(item); // O(1)
  }
  
  dequeue() {
    return this.items.shift(); // O(n) - slow!
  }
}

// Better Queue using two stacks
class QueueFast {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  
  enqueue(item) {
    this.inbox.push(item); // O(1)
  }
  
  dequeue() {
    if (this.outbox.length === 0) {
      while (this.inbox.length > 0) {
        this.outbox.push(this.inbox.pop());
      }
    }
    return this.outbox.pop(); // O(1) amortized
  }
}

// Use Stack when:
// - LIFO order needed
// - Backtracking (undo/redo)
// - Function call stack simulation
// - Expression evaluation

// Use Queue when:
// - FIFO order needed
// - Breadth-first search
// - Task scheduling
// - Event handling
```

#### Priority Queue (Heap)

```javascript
// Min Heap implementation
class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  insert(value) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }
  
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }
  
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.heap[index] >= this.heap[parentIndex]) break;
      
      [this.heap[index], this.heap[parentIndex]] = 
        [this.heap[parentIndex], this.heap[index]];
      
      index = parentIndex;
    }
  }
  
  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      
      if (leftChild < this.heap.length && 
          this.heap[leftChild] < this.heap[smallest]) {
        smallest = leftChild;
      }
      
      if (rightChild < this.heap.length && 
          this.heap[rightChild] < this.heap[smallest]) {
        smallest = rightChild;
      }
      
      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = 
        [this.heap[smallest], this.heap[index]];
      
      index = smallest;
    }
  }
  
  peek() {
    return this.heap[0];
  }
}

// Use Priority Queue when:
// - Need min/max element quickly
// - Dijkstra's algorithm
// - Job scheduling by priority
// - Event simulation
// - Median maintenance
```

---

## Summary

This document covered Performance Optimization:

**JavaScript Engine Optimization:**

- V8 optimization tips (monomorphic code, consistent shapes, array optimization)
- JIT compilation (Ignition interpreter, TurboFan compiler)
- Hidden classes and inline caching (property access optimization)
- Deoptimization triggers (type changes, arguments, try-catch, sparse arrays)

**Algorithm Optimization:**

- Time complexity (O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ))
- Space complexity (constant, linear, quadratic)
- Common patterns (sliding window, two pointers, binary search, dynamic programming)
- Data structure selection (Array, Set, Map, LinkedList, Stack, Queue, Heap)

Understanding these concepts helps write performant JavaScript code.

---

**Related Topics:**

- Web Performance APIs
- Memory Profiling
- Bundle Optimization
- Lazy Loading
- Code Splitting
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
# Rendering & Bundle

## Table of Contents

- [23.5 Rendering Performance](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#235-rendering-performance)
    - [Reflow and Repaint](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#reflow-and-repaint)
    - [Layout Thrashing](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#layout-thrashing)
    - [requestAnimationFrame](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#requestanimationframe)
    - [Virtual Scrolling](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#virtual-scrolling)
    - [Debouncing and Throttling](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#debouncing-and-throttling)
- [23.6 Bundle Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#236-bundle-optimization)
    - [Code Splitting](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#code-splitting)
    - [Tree Shaking](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#tree-shaking)
    - [Minification](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#minification)
    - [Compression](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#compression)

---

## 23.5 Rendering Performance

Browser rendering performance is crucial for smooth user experiences.

### Reflow and Repaint

Understanding the browser's rendering pipeline helps avoid performance bottlenecks.

#### Browser Rendering Pipeline

```
1. JavaScript → 2. Style → 3. Layout → 4. Paint → 5. Composite
```

**Reflow (Layout)**: Recalculating element positions and sizes **Repaint (Paint)**: Redrawing pixels on screen **Composite**: Layering painted elements

```javascript
// EXPENSIVE: Causes reflow
element.style.width = '100px';  // Reflow + Repaint
element.style.height = '100px'; // Reflow + Repaint

// LESS EXPENSIVE: Only causes repaint
element.style.color = 'red';       // Repaint only
element.style.backgroundColor = 'blue'; // Repaint only

// CHEAP: Only causes composite
element.style.transform = 'translateX(100px)'; // Composite only
element.style.opacity = 0.5;                   // Composite only
```

#### Properties That Trigger Reflow

```javascript
// Reading these properties forces synchronous reflow
const element = document.getElementById('myElement');

// Geometric properties (SLOW - trigger reflow)
const width = element.offsetWidth;
const height = element.offsetHeight;
const top = element.offsetTop;
const left = element.offsetLeft;

const clientWidth = element.clientWidth;
const clientHeight = element.clientHeight;

const scrollTop = element.scrollTop;
const scrollHeight = element.scrollHeight;

// Getting computed style (SLOW - may trigger reflow)
const computed = window.getComputedStyle(element);
const fontSize = computed.fontSize;

// Writing these properties triggers reflow
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '10px';
element.style.border = '1px solid black';
element.style.display = 'block';
element.style.position = 'absolute';
```

#### Batching DOM Changes

```javascript
const container = document.getElementById('container');

// BAD: Interleaved reads and writes (causes multiple reflows)
console.time('Interleaved');
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  container.appendChild(div);
  
  // Reading offsetHeight forces reflow
  const height = div.offsetHeight;
  div.style.height = (height * 2) + 'px';
}
console.timeEnd('Interleaved');

// GOOD: Batch reads, then batch writes
console.time('Batched');
const elements = [];

// Create all elements
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  elements.push(div);
}

// Append all at once
const fragment = document.createDocumentFragment();
elements.forEach(el => fragment.appendChild(el));
container.appendChild(fragment); // Single reflow

// Read all heights
const heights = elements.map(el => el.offsetHeight); // Single forced reflow

// Write all heights
elements.forEach((el, i) => {
  el.style.height = (heights[i] * 2) + 'px';
}); // Single reflow

console.timeEnd('Batched');
```

#### Using DocumentFragment

```javascript
// BAD: Multiple reflows
console.time('Direct append');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  container.appendChild(div); // Reflow each time
}
console.timeEnd('Direct append');

// GOOD: Single reflow
console.time('Fragment');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div); // No reflow
}

container.appendChild(fragment); // Single reflow
console.timeEnd('Fragment');

// BEST: innerHTML for static content
console.time('innerHTML');
const html = Array.from({ length: 1000 }, (_, i) => 
  `<div>Item ${i}</div>`
).join('');
container.innerHTML = html; // Single reflow
console.timeEnd('innerHTML');
```

#### CSS Class Changes

```javascript
// BAD: Multiple style changes
element.style.width = '100px';
element.style.height = '100px';
element.style.backgroundColor = 'red';
element.style.border = '1px solid black';
// 4 reflows

// GOOD: Single class change
element.className = 'styled'; // 1 reflow

// Or use classList
element.classList.add('styled'); // 1 reflow

// CSS:
// .styled {
//   width: 100px;
//   height: 100px;
//   background-color: red;
//   border: 1px solid black;
// }
```

#### Avoid Forced Synchronous Layout

```javascript
// BAD: Reading property that was just modified
element.style.width = '100px';
const width = element.offsetWidth; // Forces immediate reflow!

// GOOD: Read first, then write
const width = element.offsetWidth;
element.style.width = (width * 2) + 'px';

// BETTER: Use transform instead of width
element.style.transform = 'scaleX(2)'; // No reflow!
```

### Layout Thrashing

Layout thrashing occurs when you repeatedly read and write to the DOM, forcing synchronous reflows.

#### What is Layout Thrashing

```javascript
// BAD: Layout thrashing
function updateElements() {
  const elements = document.querySelectorAll('.item');
  
  elements.forEach(el => {
    // Read (forces reflow)
    const height = el.offsetHeight;
    
    // Write (invalidates layout)
    el.style.height = (height + 10) + 'px';
    
    // Next read forces another reflow!
  });
}

// GOOD: Batch reads and writes
function updateElementsOptimized() {
  const elements = document.querySelectorAll('.item');
  
  // Batch all reads
  const heights = Array.from(elements).map(el => el.offsetHeight);
  
  // Batch all writes
  elements.forEach((el, i) => {
    el.style.height = (heights[i] + 10) + 'px';
  });
}
```

#### FastDOM Library Pattern

```javascript
// Manual read/write batching
const reads = [];
const writes = [];
let scheduled = false;

function fastdom() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      // Execute all reads
      reads.forEach(fn => fn());
      reads.length = 0;
      
      // Execute all writes
      writes.forEach(fn => fn());
      writes.length = 0;
      
      scheduled = false;
    });
  }
}

function measure(fn) {
  reads.push(fn);
  fastdom();
}

function mutate(fn) {
  writes.push(fn);
  fastdom();
}

// Usage
const element = document.getElementById('box');

measure(() => {
  const height = element.offsetHeight;
  
  mutate(() => {
    element.style.height = (height + 10) + 'px';
  });
});
```

#### Intersection Observer Instead of Scroll

```javascript
// BAD: Scroll handler causes layout thrashing
window.addEventListener('scroll', () => {
  const elements = document.querySelectorAll('.lazy-load');
  
  elements.forEach(el => {
    const rect = el.getBoundingClientRect(); // Forced reflow!
    
    if (rect.top < window.innerHeight) {
      loadImage(el);
    }
  });
});

// GOOD: Use Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '50px' // Start loading 50px before visible
});

document.querySelectorAll('.lazy-load').forEach(el => {
  observer.observe(el);
});
```

### requestAnimationFrame

requestAnimationFrame synchronizes animations with the browser's refresh rate.

#### Basic Usage

```javascript
// BAD: Using setTimeout for animations
let position = 0;

function animate() {
  position += 1;
  element.style.left = position + 'px';
  
  setTimeout(animate, 16); // ~60fps, but not synchronized
}

animate();

// GOOD: Use requestAnimationFrame
let position = 0;

function animateOptimized() {
  position += 1;
  element.style.left = position + 'px';
  
  if (position < 500) {
    requestAnimationFrame(animateOptimized);
  }
}

requestAnimationFrame(animateOptimized);
```

#### Smooth Animations

```javascript
function smoothAnimate() {
  let start = null;
  const duration = 1000; // 1 second
  const element = document.getElementById('box');
  const startPosition = 0;
  const endPosition = 500;
  
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const percentage = Math.min(progress / duration, 1);
    
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - percentage, 3);
    
    const currentPosition = startPosition + (endPosition - startPosition) * eased;
    element.style.transform = `translateX(${currentPosition}px)`;
    
    if (progress < duration) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

smoothAnimate();
```

#### Canceling Animations

```javascript
let animationId = null;

function startAnimation() {
  let position = 0;
  
  function animate() {
    position += 2;
    element.style.left = position + 'px';
    
    if (position < 500) {
      animationId = requestAnimationFrame(animate);
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Start animation
startAnimation();

// Stop after 2 seconds
setTimeout(stopAnimation, 2000);
```

#### Performance Monitoring

```javascript
class FPSMonitor {
  constructor() {
    this.frames = [];
    this.lastTime = performance.now();
  }
  
  start() {
    const loop = (currentTime) => {
      // Calculate time since last frame
      const delta = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // Store frame time
      this.frames.push(delta);
      
      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }
      
      // Calculate average FPS
      if (this.frames.length > 0) {
        const avgDelta = this.frames.reduce((a, b) => a + b) / this.frames.length;
        const fps = Math.round(1000 / avgDelta);
        
        document.getElementById('fps').textContent = `${fps} FPS`;
      }
      
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
  }
}

const monitor = new FPSMonitor();
monitor.start();
```

### Virtual Scrolling

Virtual scrolling only renders visible items, dramatically improving performance for long lists.

#### Basic Virtual Scrolling

```javascript
class VirtualScroller {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.scrollTop = 0;
    
    this.init();
  }
  
  init() {
    // Set container height to represent all items
    this.container.style.height = `${this.items.length * this.itemHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    // Create visible items container
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.width = '100%';
    this.container.appendChild(this.viewport);
    
    // Handle scroll
    this.container.addEventListener('scroll', () => this.handleScroll());
    
    // Initial render
    this.render();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }
  
  render() {
    // Calculate which items should be visible
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 1,
      this.items.length
    );
    
    // Clear viewport
    this.viewport.innerHTML = '';
    
    // Position viewport
    this.viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.items[i];
      this.viewport.appendChild(item);
    }
  }
}

// Usage
const container = document.getElementById('scroll-container');
const items = Array.from({ length: 100000 }, (_, i) => `Item ${i}`);

const scroller = new VirtualScroller(container, items, 50);
```

#### Advanced Virtual Scrolling with Buffer

```javascript
class AdvancedVirtualScroller {
  constructor(container, items, itemHeight, bufferSize = 5) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.bufferSize = bufferSize;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.scrollTop = 0;
    this.renderedItems = new Map();
    
    this.init();
  }
  
  init() {
    // Wrapper for total height
    this.wrapper = document.createElement('div');
    this.wrapper.style.height = `${this.items.length * this.itemHeight}px`;
    this.wrapper.style.position = 'relative';
    this.container.appendChild(this.wrapper);
    
    // Viewport for visible items
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.width = '100%';
    this.wrapper.appendChild(this.viewport);
    
    // Scroll handler with RAF
    let ticking = false;
    this.container.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    this.render();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }
  
  render() {
    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize
    );
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + this.container.clientHeight) / this.itemHeight) + this.bufferSize
    );
    
    // Remove items outside range
    for (const [index, element] of this.renderedItems) {
      if (index < startIndex || index >= endIndex) {
        element.remove();
        this.renderedItems.delete(index);
      }
    }
    
    // Add items in range
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.renderedItems.has(i)) {
        const item = this.createItem(i);
        this.viewport.appendChild(item);
        this.renderedItems.set(i, item);
      }
    }
  }
  
  createItem(index) {
    const item = document.createElement('div');
    item.style.position = 'absolute';
    item.style.top = `${index * this.itemHeight}px`;
    item.style.height = `${this.itemHeight}px`;
    item.style.width = '100%';
    item.textContent = this.items[index];
    item.dataset.index = index;
    return item;
  }
}

// Usage with 1 million items
const container = document.getElementById('advanced-scroller');
const items = Array.from({ length: 1000000 }, (_, i) => `Item ${i}`);

const scroller = new AdvancedVirtualScroller(container, items, 40, 10);
```

### Debouncing and Throttling

Rate limiting for event handlers improves performance.

#### Debouncing

Debouncing delays function execution until after a pause in events.

```javascript
// Basic debounce
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage: Search input
const searchInput = document.getElementById('search');

// BAD: Fires on every keystroke
searchInput.addEventListener('input', (e) => {
  performSearch(e.target.value); // Expensive!
});

// GOOD: Debounced - only fires after user stops typing
const debouncedSearch = debounce((value) => {
  performSearch(value);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

function performSearch(query) {
  console.log('Searching for:', query);
  // Make API call...
}
```

#### Advanced Debounce with Leading/Trailing

```javascript
function advancedDebounce(func, delay, { leading = false, trailing = true } = {}) {
  let timeoutId;
  let lastArgs;
  
  return function(...args) {
    lastArgs = args;
    
    const callNow = leading && !timeoutId;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      if (trailing) {
        func.apply(this, lastArgs);
      }
      timeoutId = null;
    }, delay);
    
    if (callNow) {
      func.apply(this, args);
    }
  };
}

// Leading: Execute immediately, then wait
const leadingDebounce = advancedDebounce(handleResize, 300, { leading: true, trailing: false });

// Trailing: Wait, then execute (default)
const trailingDebounce = advancedDebounce(handleResize, 300, { trailing: true });

// Both: Execute immediately, then again after pause
const bothDebounce = advancedDebounce(handleResize, 300, { leading: true, trailing: true });

function handleResize() {
  console.log('Window resized:', window.innerWidth);
}

window.addEventListener('resize', leadingDebounce);
```

#### Throttling

Throttling limits function execution to once per time interval.

```javascript
// Basic throttle
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Usage: Scroll handler
// BAD: Fires hundreds of times per second
window.addEventListener('scroll', () => {
  updateScrollProgress(); // Expensive!
});

// GOOD: Throttled - fires at most once per 100ms
const throttledScroll = throttle(() => {
  updateScrollProgress();
}, 100);

window.addEventListener('scroll', throttledScroll);

function updateScrollProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  
  document.getElementById('progress').style.width = `${progress}%`;
}
```

#### Advanced Throttle with Leading/Trailing

```javascript
function advancedThrottle(func, limit, { leading = true, trailing = true } = {}) {
  let timeout;
  let lastRan;
  let lastFunc;
  
  return function(...args) {
    const context = this;
    
    if (!lastRan) {
      if (leading) {
        func.apply(context, args);
      }
      lastRan = Date.now();
    } else {
      clearTimeout(timeout);
      
      lastFunc = () => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      };
      
      timeout = setTimeout(() => {
        if (trailing) {
          lastFunc();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Mouse move throttling
const throttledMouseMove = advancedThrottle((e) => {
  console.log('Mouse position:', e.clientX, e.clientY);
}, 100);

document.addEventListener('mousemove', throttledMouseMove);
```

#### RequestAnimationFrame Throttle

```javascript
// Throttle to animation frame (best for visual updates)
function rafThrottle(func) {
  let requestId;
  let lastArgs;
  
  const later = (context) => () => {
    requestId = null;
    func.apply(context, lastArgs);
  };
  
  return function(...args) {
    lastArgs = args;
    
    if (!requestId) {
      requestId = requestAnimationFrame(later(this));
    }
  };
}

// Perfect for scroll animations
const rafScrollHandler = rafThrottle(() => {
  const scrollTop = window.pageYOffset;
  
  // Update parallax elements
  document.querySelectorAll('.parallax').forEach(el => {
    const speed = el.dataset.speed || 0.5;
    el.style.transform = `translateY(${scrollTop * speed}px)`;
  });
});

window.addEventListener('scroll', rafScrollHandler);
```

---

## 23.6 Bundle Optimization

Optimizing JavaScript bundles reduces load time and improves performance.

### Code Splitting

Split code into smaller chunks loaded on demand.

#### Dynamic Imports

```javascript
// Instead of importing everything upfront
import heavyLibrary from 'heavy-library';
import anotherLib from 'another-lib';
import utils from './utils';

// Dynamic import - load only when needed
async function processSpecialData(data) {
  if (data.requiresHeavyProcessing) {
    // Load heavy library only when needed
    const { default: heavyLibrary } = await import('heavy-library');
    return heavyLibrary.process(data);
  }
  
  return simpleProcess(data);
}

// Route-based code splitting
async function loadRoute(routeName) {
  switch (routeName) {
    case 'home':
      const { HomePage } = await import('./pages/HomePage');
      return HomePage;
    
    case 'dashboard':
      const { Dashboard } = await import('./pages/Dashboard');
      return Dashboard;
    
    case 'settings':
      const { Settings } = await import('./pages/Settings');
      return Settings;
    
    default:
      const { NotFound } = await import('./pages/NotFound');
      return NotFound;
  }
}
```

#### Webpack Code Splitting

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].[contenthash].chunk.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk for node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // Common chunk for shared code
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};

// Magic comments for webpack
// Named chunks
import(/* webpackChunkName: "heavy-feature" */ './heavyFeature');

// Prefetch (load during idle time)
import(/* webpackPrefetch: true */ './futureFeature');

// Preload (load in parallel with parent)
import(/* webpackPreload: true */ './criticalFeature');
```

#### React Lazy Loading

```javascript
import React, { Suspense, lazy } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const Profile = lazy(() => import('./Profile'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// With error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Tree Shaking

Remove unused code from the final bundle.

#### ES6 Modules for Tree Shaking

```javascript
// utils.js - Use named exports
export function usedFunction() {
  return 'This is used';
}

export function unusedFunction() {
  return 'This is never imported';
}

export function anotherUnusedFunction() {
  return 'Also never imported';
}

// main.js - Only import what you need
import { usedFunction } from './utils';

console.log(usedFunction());

// Bundle will only include usedFunction, not the unused ones
```

#### Side Effects

```javascript
// package.json - Mark packages as side-effect free
{
  "name": "my-package",
  "sideEffects": false  // No side effects, safe to tree-shake
}

// Or specify files with side effects
{
  "name": "my-package",
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// Code with side effects (can't be tree-shaken)
// globals.js
window.myGlobal = 'value';  // Side effect!

export function myFunction() {
  return 'hello';
}

// Code without side effects (can be tree-shaken)
// pure.js
export function add(a, b) {
  return a + b;  // Pure function, no side effects
}
```

#### Webpack Tree Shaking Configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // Enables tree shaking
  optimization: {
    usedExports: true,  // Mark unused exports
    minimize: true,      // Remove unused code
    sideEffects: true    // Respect package.json sideEffects
  }
};

// Lodash tree shaking
// BAD: Imports entire lodash
import _ from 'lodash';
_.map([1, 2, 3], n => n * 2);

// GOOD: Import only what you need
import map from 'lodash/map';
map([1, 2, 3], n => n * 2);

// BETTER: Use lodash-es (ES6 modules)
import { map } from 'lodash-es';
map([1, 2, 3], n => n * 2);
```

#### Analyzing Bundle Size

```javascript
// Install webpack-bundle-analyzer
// npm install --save-dev webpack-bundle-analyzer

// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false
    })
  ]
};

// Run build and open bundle-report.html to see what's in your bundle
```

### Minification

Reduce code size by removing whitespace and shortening names.

#### Terser for JavaScript

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,      // Remove console.log
            drop_debugger: true,     // Remove debugger
            pure_funcs: ['console.info', 'console.debug']  // Remove specific functions
          },
          mangle: {
            safari10: true  // Fix Safari 10 issues
          },
          format: {
            comments: false  // Remove comments
          }
        },
        extractComments: false  // Don't create separate LICENSE file
      })
    ]
  }
};

// Before minification:
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

// After minification:
function c(t){let e=0;for(let r=0;r<t.length;r++)e+=t[r].price*t[r].quantity;return e}
```

#### CSS Minification

```javascript
// Install css-minimizer-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              minifyFontValues: true
            }
          ]
        }
      })
    ]
  }
};

// Before:
.container {
  background-color: #ffffff;
  margin: 10px 10px 10px 10px;
  padding: 0px;
}

// After:
.container{background-color:#fff;margin:10px;padding:0}
```

#### HTML Minification

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      }
    })
  ]
};
```

### Compression

Compress assets for faster transfer over the network.

#### Gzip Compression

```javascript
// Server-side (Express)
const compression = require('compression');
const express = require('express');

const app = express();

// Enable gzip compression
app.use(compression({
  level: 6,  // Compression level (0-9)
  threshold: 1024,  // Only compress files > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept gzip
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.static('public'));

app.listen(3000);
```

#### Brotli Compression

```javascript
// Webpack plugin for pre-compression
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');

module.exports = {
  plugins: [
    // Gzip compression
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,  // Only compress files > 10KB
      minRatio: 0.8      // Only compress if size reduction > 20%
    }),
    
    // Brotli compression (better than gzip)
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      },
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};

// Server-side (Express) - Serve pre-compressed files
const express = require('express');
const expressStaticGzip = require('express-static-gzip');

const app = express();

app.use('/', expressStaticGzip('public', {
  enableBrotli: true,
  orderPreference: ['br', 'gz']  // Prefer brotli over gzip
}));

app.listen(3000);
```

#### Content-Type Specific Compression

```javascript
// Server configuration
app.use(compression({
  filter: (req, res) => {
    const contentType = res.getHeader('Content-Type');
    
    // Compress these types
    const compressible = [
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'image/svg+xml'
    ];
    
    return compressible.some(type => contentType && contentType.includes(type));
  }
}));
```

#### Image Compression

```javascript
// Webpack image optimization
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ['imagemin-mozjpeg', { quality: 80 }],
              ['imagemin-pngquant', { quality: [0.6, 0.8] }],
              ['imagemin-svgo', {
                plugins: [
                  {
                    name: 'removeViewBox',
                    active: false
                  }
                ]
              }]
            ]
          }
        }
      })
    ]
  }
};

// Modern format generation
new ImageMinimizerPlugin({
  generator: [
    {
      preset: 'webp',
      implementation: ImageMinimizerPlugin.imageminGenerate,
      options: {
        plugins: ['imagemin-webp']
      }
    }
  ]
});

// Usage in HTML
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Fallback">
</picture>
```

---

## Summary

This document covered Rendering and Bundle Optimization:

**Rendering Performance:**

- Reflow and repaint (rendering pipeline, batching changes, DocumentFragment, CSS classes)
- Layout thrashing (read/write separation, FastDOM pattern, Intersection Observer)
- requestAnimationFrame (smooth animations, FPS monitoring, cancellation)
- Virtual scrolling (basic implementation, advanced with buffer)
- Debouncing and throttling (rate limiting, leading/trailing options, RAF throttle)

**Bundle Optimization:**

- Code splitting (dynamic imports, webpack configuration, React lazy loading)
- Tree shaking (ES6 modules, side effects, webpack config, bundle analysis)
- Minification (JavaScript with Terser, CSS, HTML)
- Compression (gzip, brotli, pre-compression, image optimization)

These optimizations reduce bundle size, improve load times, and create smooth user experiences.

---

**Related Topics:**

- Service Workers
- Progressive Web Apps
- HTTP/2 and HTTP/3
- CDN Configuration
- Critical CSS

## 23.7 Performance Summary

| Area | Key Techniques |
|------|----------------|
| **JS Engine** | Avoid deopt, use monomorphic functions |
| **Algorithms** | Choose appropriate data structures, reduce complexity |
| **Memory** | Avoid leaks, use WeakMap, pool objects |
| **Rendering** | Minimize reflows, use `requestAnimationFrame` |
| **Bundle** | Code splitting, tree shaking, lazy loading |

---

**End of Chapter 23: Performance Optimization**
