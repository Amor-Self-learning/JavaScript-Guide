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