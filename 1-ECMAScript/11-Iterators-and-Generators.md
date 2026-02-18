# 11 Iterators and Generators

The iteration protocol defines how objects produce sequences of values. Generators are functions that can pause and resume, implementing the iterator protocol.

---

## Iteration Protocols


## The Iterable Protocol

### What is the Iterable Protocol?

The **iterable protocol** defines how objects become iterable, allowing them to work with `for...of` loops, spread operator, and destructuring.

**Core requirement:** An object must have a method accessible via `Symbol.iterator` that returns an iterator object.

### Interface Definition

```javascript
// An object is iterable if it has this method:
object[Symbol.iterator]() {
  // Must return an iterator object
  return {
    next() { /* ... */ }
  };
}
```

### Simple Example

```javascript
// ✅ Iterable object
const iterable = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.data.length) {
          return { value: this.data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

// Now you can use it with for...of
for (const value of iterable) {
  console.log(value);  // 1, 2, 3
}
```

### Key Points

- The iterable protocol defines **how** to iterate
- Does NOT specify iteration behavior
- Enables multiple iteration methods on same data
- Foundation for all iteration in JavaScript

---

## The Iterator Protocol

### What is the Iterator Protocol?

The **iterator protocol** defines the `next()` method that returns objects with `{ value, done }` structure.

**Core requirement:** An iterator must have a `next()` method that returns a result object.

### Result Object Structure

```javascript
// The result of calling iterator.next()
{
  value: any,        // Current value (optional if done: true)
  done: boolean      // true when iteration complete
}
```

### Simple Example

```javascript
// ✅ Iterator object
const iterator = {
  values: ['a', 'b', 'c'],
  index: 0,
  
  next() {
    if (this.index < this.values.length) {
      return {
        value: this.values[this.index++],
        done: false
      };
    }
    return { done: true };
  }
};

// Manual iteration
console.log(iterator.next());  // { value: 'a', done: false }
console.log(iterator.next());  // { value: 'b', done: false }
console.log(iterator.next());  // { value: 'c', done: false }
console.log(iterator.next());  // { done: true }
```

### Iterator with Return Value

```javascript
const iterator = {
  values: [1, 2, 3],
  index: 0,
  
  next() {
    if (this.index < this.values.length) {
      return {
        value: this.values[this.index++],
        done: false
      };
    }
    return {
      value: 'FINISHED',  // Optional return value
      done: true
    };
  }
};

// Manual iteration
let result = iterator.next();
while (!result.done) {
  console.log(result.value);  // 1, 2, 3
  result = iterator.next();
}
console.log(result.value);  // 'FINISHED'
```

### Key Points

- Iterator protocol defines **mechanism** of iteration
- `next()` is the only required method
- Controls iteration state internally
- Can be called manually or automatically

---

## Symbol.iterator

### Connecting Iterable and Iterator

`Symbol.iterator` is the bridge between:
- **Iterable** (has `Symbol.iterator` method)
- **Iterator** (returned by that method, has `next()`)

```javascript
// The connection
object[Symbol.iterator]() → returns → iterator
                                        ↓
                                    has next()
                                        ↓
                                    returns { value, done }
```

### Complete Example

```javascript
class CountUp {
  constructor(max) {
    this.max = max;
  }

  // Make it iterable
  [Symbol.iterator]() {
    let current = 1;
    const max = this.max;
    
    // Return an iterator
    return {
      next() {
        if (current <= max) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

const counter = new CountUp(3);

// Works with for...of
for (const num of counter) {
  console.log(num);  // 1, 2, 3
}

// Works with spread operator
const arr = [...counter];  // [1, 2, 3]

// Works with destructuring
const [first, second] = counter;
console.log(first, second);  // 1, 2
```

### Checking if Something is Iterable

```javascript
// ✅ Check if object has Symbol.iterator
function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === 'function';
}

console.log(isIterable([1, 2, 3]));        // true
console.log(isIterable('hello'));         // true
console.log(isIterable(new Map()));       // true
console.log(isIterable(42));              // false
console.log(isIterable({ a: 1 }));        // false

// More thorough check
function getIterator(obj) {
  if (!isIterable(obj)) {
    throw new TypeError(`Object is not iterable`);
  }
  return obj[Symbol.iterator]();
}

const iter = getIterator([1, 2]);
console.log(iter.next());  // { value: 1, done: false }
```

### Symbol.iterator is a Symbol

```javascript
// Symbol.iterator is a well-known symbol
console.log(typeof Symbol.iterator);        // 'symbol'
console.log(Symbol.iterator.toString());    // 'Symbol(Symbol.iterator)'

// It's the same across all code
class A {
  [Symbol.iterator]() { return { next: () => ({ done: true }) }; }
}
class B {
  [Symbol.iterator]() { return { next: () => ({ done: true }) }; }
}

const a = new A();
const b = new B();

// Same symbol
console.log(Object.getOwnPropertySymbols(a)[0] === Symbol.iterator);  // true
console.log(Object.getOwnPropertySymbols(b)[0] === Symbol.iterator);  // true
```

---

## Making Objects Iterable

### Pattern 1: Simple Object Iteration

```javascript
// Iterate over object values
const person = {
  name: 'Alice',
  age: 30,
  city: 'NYC',
  
  [Symbol.iterator]() {
    const values = Object.values(this);
    let index = 0;
    
    return {
      next: () => index < values.length
        ? { value: values[index++], done: false }
        : { done: true }
    };
  }
};

for (const value of person) {
  console.log(value);  // 'Alice', 30, 'NYC'
}
```

### Pattern 2: Iterating Object Entries

```javascript
const config = {
  host: 'localhost',
  port: 3000,
  debug: true,
  
  [Symbol.iterator]() {
    const entries = Object.entries(this);
    let index = 0;
    
    return {
      next: () => index < entries.length
        ? { value: entries[index++], done: false }
        : { done: true }
    };
  }
};

for (const [key, value] of config) {
  console.log(`${key}: ${value}`);
}
// Output:
// host: localhost
// port: 3000
// debug: true
```

### Pattern 3: Filtering Iteration

```javascript
// Iterate over even numbers only
class Numbers {
  constructor(max) {
    this.max = max;
  }
  
  [Symbol.iterator]() {
    let current = 0;
    const max = this.max;
    
    return {
      next: () => {
        while (current <= max) {
          if (current % 2 === 0) {
            return { value: current++, done: false };
          }
          current++;
        }
        return { done: true };
      }
    };
  }
}

for (const num of new Numbers(10)) {
  console.log(num);  // 0, 2, 4, 6, 8, 10
}
```

### Pattern 4: Stateful Iteration

```javascript
// Track iteration state
class Fibonacci {
  constructor(maxCount) {
    this.maxCount = maxCount;
  }
  
  [Symbol.iterator]() {
    let count = 0;
    let current = 0;
    let next = 1;
    
    return {
      next: () => {
        if (count < this.maxCount) {
          const value = current;
          [current, next] = [next, current + next];
          count++;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

for (const num of new Fibonacci(8)) {
  console.log(num);  // 0, 1, 1, 2, 3, 5, 8, 13
}
```

### Pattern 5: Infinite Iterator

```javascript
// Be careful with infinite iterators!
class InfiniteCounter {
  constructor(start = 0) {
    this.start = start;
  }
  
  [Symbol.iterator]() {
    let value = this.start;
    
    return {
      next: () => ({ value: value++, done: false })
    };
  }
}

// MUST use break or take() pattern
let count = 0;
for (const num of new InfiniteCounter(100)) {
  console.log(num);
  if (++count >= 5) break;  // 100, 101, 102, 103, 104
}
```

### Pattern 6: Multi-Value Iteration

```javascript
// Yield multiple values per iteration
class Pairs {
  constructor(arr) {
    this.arr = arr;
  }
  
  [Symbol.iterator]() {
    let index = 0;
    const arr = this.arr;
    
    return {
      next: () => {
        if (index < arr.length) {
          const pair = [arr[index], arr[index + 1]];
          index += 2;
          return { value: pair, done: false };
        }
        return { done: true };
      }
    };
  }
}

for (const [a, b] of new Pairs([1, 2, 3, 4, 5])) {
  console.log(a, b);
}
// Output:
// 1 2
// 3 4
// 5 undefined
```

---

## Practical Examples

### Example 1: Range Iterator

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;
    
    return {
      next: () => {
        if (
          (step > 0 && current < end) ||
          (step < 0 && current > end)
        ) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
  
  // Also make it reversible
  reverse() {
    return new Range(this.end - 1, this.start - 1, -this.step);
  }
}

// Usage
console.log([...new Range(1, 5)]);           // [1, 2, 3, 4]
console.log([...new Range(0, 10, 2)]);       // [0, 2, 4, 6, 8]
console.log([...new Range(10, 0, -1)]);      // [10, 9, 8, ..., 1]
```

### Example 2: Tree Traversal

```javascript
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
  
  // Depth-first traversal
  *[Symbol.iterator]() {
    yield this.value;
    for (const child of this.children) {
      yield* child;  // Delegate to child
    }
  }
}

const tree = new TreeNode(1, [
  new TreeNode(2, [
    new TreeNode(4),
    new TreeNode(5)
  ]),
  new TreeNode(3, [
    new TreeNode(6)
  ])
]);

console.log([...tree]);  // [1, 2, 4, 5, 3, 6]
```

### Example 3: Linked List

```javascript
class LinkedList {
  constructor() {
    this.head = null;
  }
  
  append(value) {
    const node = { value, next: null };
    
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
  }
  
  [Symbol.iterator]() {
    let current = this.head;
    
    return {
      next: () => {
        if (current) {
          const value = current.value;
          current = current.next;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);

for (const value of list) {
  console.log(value);  // 1, 2, 3
}

console.log([...list]);  // [1, 2, 3]
```

### Example 4: Filtered Iterator

```javascript
class FilteredIterable {
  constructor(iterable, predicate) {
    this.iterable = iterable;
    this.predicate = predicate;
  }
  
  [Symbol.iterator]() {
    const iterator = this.iterable[Symbol.iterator]();
    const predicate = this.predicate;
    
    return {
      next() {
        let result = iterator.next();
        while (!result.done) {
          if (predicate(result.value)) {
            return result;
          }
          result = iterator.next();
        }
        return { done: true };
      }
    };
  }
}

// Usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = new FilteredIterable(numbers, x => x % 2 === 0);

console.log([...evens]);  // [2, 4, 6, 8, 10]
```

---

## Common Patterns

### Pattern: Iterator Wrapper

```javascript
// Generic iterator wrapper
function makeIterable(array) {
  return {
    [Symbol.iterator]() {
      let index = 0;
      return {
        next: () => index < array.length
          ? { value: array[index++], done: false }
          : { done: true }
      };
    }
  };
}

const wrapped = makeIterable([10, 20, 30]);
for (const value of wrapped) {
  console.log(value);  // 10, 20, 30
}
```

### Pattern: Lazy Iterator

```javascript
// Only compute values when requested
class LazyMap {
  constructor(iterable, transform) {
    this.iterable = iterable;
    this.transform = transform;
  }
  
  [Symbol.iterator]() {
    const iterator = this.iterable[Symbol.iterator]();
    const transform = this.transform;
    
    return {
      next() {
        const result = iterator.next();
        if (!result.done) {
          result.value = transform(result.value);
        }
        return result;
      }
    };
  }
}

const numbers = [1, 2, 3, 4, 5];
const squared = new LazyMap(numbers, x => x * x);

console.log([...squared]);  // [1, 4, 9, 16, 25]
```

### Pattern: Iterator Composition

```javascript
// Combine multiple iterators
function* chain(...iterables) {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

const result = [...chain([1, 2], [3, 4], [5])];
console.log(result);  // [1, 2, 3, 4, 5]
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Cache the this reference when needed
class Good {
  [Symbol.iterator]() {
    let index = 0;
    const data = this.data;  // Cache this.data
    
    return {
      next: () => index < data.length
        ? { value: data[index++], done: false }
        : { done: true }
    };
  }
}

// ✅ Use generators for simpler code (see Module 11.3)
class SimpleClass {
  *[Symbol.iterator]() {
    yield* this.data;
  }
}

// ✅ Make iteration state independent
class Independent {
  [Symbol.iterator]() {
    // Creates new state each time
    let current = 0;
    return {
      next: () => {
        if (current < this.data.length) {
          return { value: this.data[current++], done: false };
        }
        return { done: true };
      }
    };
  }
}
```

### ❌ DON'T

```javascript
// ❌ Don't expose iterator state directly
class Bad1 {
  constructor() {
    this.iterator = null;
    this.index = 0;  // Shared state!
  }
  
  [Symbol.iterator]() {
    return this;  // Returns same object
  }
  
  next() {
    if (this.index < this.data.length) {
      return { value: this.data[this.index++], done: false };
    }
    return { done: true };
  }
}

// ❌ Don't forget to return an iterator
class Bad2 {
  [Symbol.iterator]() {
    // ❌ Returns undefined, not an iterator!
    return this.data;
  }
}

// ❌ Don't modify data during iteration
class Bad3 {
  constructor(data) {
    this.data = data;
  }
  
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        // ❌ Dangerous if data is modified
        if (index < this.data.length) {
          return { value: this.data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
}
```

### Performance Considerations

```javascript
// ✅ Iterator reuse is cheap (new state each iteration)
class Efficient {
  data = [1, 2, 3, 4, 5];
  
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => index < this.data.length
        ? { value: this.data[index++], done: false }
        : { done: true }
    };
  }
}

// Can iterate multiple times efficiently
const obj = new Efficient();
for (const x of obj) { /* ... */ }  // Creates new iterator
for (const x of obj) { /* ... */ }  // Creates another new iterator

// ❌ Avoid expensive operations in iteration
class Inefficient {
  [Symbol.iterator]() {
    return {
      next: () => {
        // ❌ Expensive computation per next() call
        const expensive = computeExpensiveValue();
        return { value: expensive, done: false };
      }
    };
  }
}
```

---

## Summary

### Key Concepts

| Concept | Purpose |
|---------|---------|
| **Iterable Protocol** | Defines how objects become iterable |
| **Iterator Protocol** | Defines the `next()` mechanism |
| **Symbol.iterator** | The method key that connects them |
| **for...of loop** | Consumes iterables automatically |
| **Spread operator** | Converts iterables to arrays |

### Protocol Requirements

**Iterable (object) must have:**
- Method at `[Symbol.iterator]` key
- Returns an iterator object

**Iterator (returned object) must have:**
- `next()` method
- Returns `{ value, done }` object
- `done` = true when finished

### Common Use Cases

```javascript
// 1. Custom iteration logic
class Custom {
  [Symbol.iterator]() { /* ... */ }
}

// 2. Filtering data
class Filtered {
  [Symbol.iterator]() { /* ... */ }
}

// 3. Lazy evaluation
class Lazy {
  [Symbol.iterator]() { /* ... */ }
}

// 4. Multiple iteration strategies
class Multi {
  [Symbol.iterator]() { /* forward */ }
  reverse() { /* backward */ }
}
```

### Next Steps

- **Module 11.2** - Learn about built-in iterables (Array, String, Map, Set)
- **Module 11.3** - Use generators to simplify iterator creation
- **Module 11.4** - Async iterators for asynchronous operations
## Generators, Built-in Iterables & Async Iterators
## Part 1: Built-in Iterables (Module 11.2)


## Built-in Iterables Overview

### What Objects are Iterable?

JavaScript provides several built-in iterable objects:

```javascript
// ✅ All of these have Symbol.iterator
const arr = [1, 2, 3];
const str = "hello";
const map = new Map([['a', 1], ['b', 2]]);
const set = new Set([1, 2, 3]);
const typed = new Uint8Array([1, 2, 3]);

// ✅ Check if iterable
function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === 'function';
}

console.log(isIterable(arr));      // true
console.log(isIterable(str));      // true
console.log(isIterable(map));      // true
console.log(isIterable(set));      // true
console.log(isIterable(typed));    // true

// ❌ These are NOT iterable
console.log(isIterable(42));       // false
console.log(isIterable({ a: 1 })); // false
```

---

## Arrays

### Array Iteration

```javascript
// ✅ Arrays are iterable
const arr = [10, 20, 30];

// 1. for...of loop
for (const value of arr) {
  console.log(value);  // 10, 20, 30
}

// 2. Spread operator
const copy = [...arr];  // [10, 20, 30]

// 3. Destructuring
const [first, second] = arr;  // 10, 20

// 4. Array methods
const doubled = [...arr].map(x => x * 2);

// 5. Manual iteration
const iterator = arr[Symbol.iterator]();
console.log(iterator.next());  // { value: 10, done: false }
console.log(iterator.next());  // { value: 20, done: false }
```

### Array Iterator Details

```javascript
// Array iterators are independent
const arr = [1, 2, 3];
const iter1 = arr[Symbol.iterator]();
const iter2 = arr[Symbol.iterator]();

console.log(iter1.next());  // { value: 1, done: false }
console.log(iter1.next());  // { value: 2, done: false }
console.log(iter2.next());  // { value: 1, done: false }  <- iter2 is independent

// Arrays also provide other iteration methods
arr.forEach(x => console.log(x));  // 1, 2, 3
const mapped = arr.map(x => x * 2);
const filtered = arr.filter(x => x > 1);
```

### Array Subclass Iteration

```javascript
// Custom array subclass still works with for...of
class MyArray extends Array {
  // Inherits [Symbol.iterator] from Array
}

const custom = new MyArray(1, 2, 3);
for (const value of custom) {
  console.log(value);  // 1, 2, 3
}

// Override iterator behavior
class ReverseArray extends Array {
  [Symbol.iterator]() {
    let index = this.length - 1;
    return {
      next: () => index >= 0
        ? { value: this[index--], done: false }
        : { done: true }
    };
  }
}

const reversed = new ReverseArray(1, 2, 3);
console.log([...reversed]);  // [3, 2, 1]
```

---

## Strings

### String Iteration

```javascript
// ✅ Strings are iterable
const str = "hello";

// 1. for...of loop
for (const char of str) {
  console.log(char);  // h, e, l, l, o
}

// 2. Spread operator
const chars = [...str];  // ['h', 'e', 'l', 'l', 'o']

// 3. Destructuring
const [first, second] = str;  // 'h', 'e'

// 4. Manual iteration
const iterator = str[Symbol.iterator]();
console.log(iterator.next());  // { value: 'h', done: false }
```

### Unicode-Aware String Iteration

```javascript
// for...of handles Unicode correctly
const emoji = "👨‍👩‍👧‍👦";  // Family emoji (multi-code point)

console.log(emoji.length);  // 25 (length counts code units)
console.log([...emoji]);    // Correctly split into graphemes

// Character counting
const text = "Hello 👋";
console.log(text.length);    // 8 (wrong count)
console.log([...text].length); // 7 (correct count)

// UTF-16 surrogate pairs
const text2 = "😀";  // Emoji
console.log(text2.length);      // 2 (two UTF-16 code units)
console.log([...text2].length);  // 1 (one grapheme)
```

### String Processing with for...of

```javascript
// Convert to uppercase with for...of
function uppercase(str) {
  let result = '';
  for (const char of str) {
    result += char.toUpperCase();
  }
  return result;
}

console.log(uppercase("hello"));  // "HELLO"

// Count characters
function countChars(str) {
  return [...str].length;
}

console.log(countChars("hello"));  // 5
console.log(countChars("🎉"));     // 1

// Filter characters
function removeVowels(str) {
  return [...str].filter(ch => !'aeiouAEIOU'.includes(ch)).join('');
}

console.log(removeVowels("Hello World"));  // "Hll Wrld"
```

---

## Maps and Sets

### Map Iteration

```javascript
// ✅ Maps are iterable
const map = new Map([
  ['name', 'Alice'],
  ['age', 30],
  ['city', 'NYC']
]);

// 1. for...of over entries
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}

// 2. Iterate just keys
for (const key of map.keys()) {
  console.log(key);  // 'name', 'age', 'city'
}

// 3. Iterate just values
for (const value of map.values()) {
  console.log(value);  // 'Alice', 30, 'NYC'
}

// 4. Iterate entries explicitly
for (const entry of map.entries()) {
  console.log(entry);  // ['name', 'Alice'], ['age', 30], etc.
}

// 5. Spread operator
const entries = [...map];  // [['name', 'Alice'], ['age', 30], ...]

// 6. Destructuring
const [first, second] = map;  // ['name', 'Alice'], ['age', 30]
```

### Set Iteration

```javascript
// ✅ Sets are iterable
const set = new Set([1, 2, 3, 2, 1]);

// 1. for...of loop
for (const value of set) {
  console.log(value);  // 1, 2, 3
}

// 2. Set methods return iterables
for (const value of set.values()) {
  console.log(value);  // 1, 2, 3
}

// 3. keys() returns same as values() for Set
for (const key of set.keys()) {
  console.log(key);  // 1, 2, 3
}

// 4. entries() returns [value, value] pairs
for (const [a, b] of set.entries()) {
  console.log(a === b);  // true
}

// 5. Spread operator
const arr = [...set];  // [1, 2, 3]

// 6. forEach method
set.forEach(value => console.log(value));
```

### WeakMap and WeakSet

```javascript
// ❌ WeakMap and WeakSet are NOT iterable
const weakMap = new WeakMap();
const weakSet = new WeakSet();

console.log(typeof weakMap[Symbol.iterator]);  // undefined
console.log(typeof weakSet[Symbol.iterator]);  // undefined

// Cannot use for...of with WeakMap/WeakSet
// for (const entry of weakMap) { }  // ❌ TypeError
```

---

## TypedArrays

### TypedArray Iteration

```javascript
// ✅ All TypedArrays are iterable
const uint8 = new Uint8Array([10, 20, 30]);
const float32 = new Float32Array([1.5, 2.5, 3.5]);
const int16 = new Int16Array([100, 200, 300]);

// 1. for...of loop
for (const value of uint8) {
  console.log(value);  // 10, 20, 30
}

// 2. Spread operator
const copy = [...float32];  // [1.5, 2.5, 3.5]

// 3. Map operations
const doubled = [...uint8].map(x => x * 2);  // [20, 40, 60]

// 4. Manual iteration
const iterator = int16[Symbol.iterator]();
console.log(iterator.next());  // { value: 100, done: false }
```

### TypedArray Types

```javascript
// All these are iterable:
new Int8Array([1, 2, 3]);
new Uint8Array([1, 2, 3]);
new Uint8ClampedArray([1, 2, 3]);
new Int16Array([1, 2, 3]);
new Uint16Array([1, 2, 3]);
new Int32Array([1, 2, 3]);
new Uint32Array([1, 2, 3]);
new Float32Array([1.5, 2.5, 3.5]);
new Float64Array([1.5, 2.5, 3.5]);
new BigInt64Array([100n, 200n, 300n]);
new BigUint64Array([100n, 200n, 300n]);

// Each maintains its type
const int8 = new Int8Array([127, -128]);
for (const value of int8) {
  console.log(typeof value);  // 'number'
}

// BigInt types preserve BigInt
const bigInt = new BigInt64Array([100n, 200n]);
for (const value of bigInt) {
  console.log(typeof value);  // 'bigint'
}
```

---

## DOM NodeLists

### NodeList Iteration

```javascript
// ✅ Modern NodeLists are iterable (most browsers)
const elements = document.querySelectorAll('div');

// 1. for...of loop
for (const element of elements) {
  console.log(element);
}

// 2. Spread operator
const arr = [...elements];

// 3. Map operations
const ids = [...elements].map(el => el.id);

// 4. Filter operations
const withClass = [...elements].filter(el => el.classList.length > 0);
```

### HTMLCollection vs NodeList

```javascript
// ✅ NodeList is iterable
const nodeList = document.querySelectorAll('div');
for (const element of nodeList) { }  // Works

// ⚠️ HTMLCollection is iterable (in modern browsers)
const htmlCollection = document.getElementsByTagName('div');
for (const element of htmlCollection) { }  // Works

// ✅ Can always convert to array
const asArray = Array.from(nodeList);
const asArray2 = [...nodeList];

// ❌ Live collections be careful
const liveCollection = document.getElementsByClassName('my-class');
for (const element of liveCollection) {
  element.classList.remove('my-class');  // Modifies collection!
}
```

---

## Part 2: Generator Functions (Module 11.3)


## Generator Function Basics

### What are Generator Functions?

A **generator function** is a function that can be paused and resumed, making it easy to create iterators.

```javascript
// ✅ Generator function syntax
function* myGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

// Calling generator returns an iterator
const iterator = myGenerator();
console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
console.log(iterator.next());  // { value: 3, done: false }
console.log(iterator.next());  // { done: true }

// ✅ Use with for...of
for (const value of myGenerator()) {
  console.log(value);  // 1, 2, 3
}

// ✅ Use with spread operator
const arr = [...myGenerator()];  // [1, 2, 3]
```

### Generator Syntax Variations

```javascript
// Function declaration
function* gen1() {
  yield 1;
}

// Function expression
const gen2 = function*() {
  yield 2;
};

// Method in object
const obj = {
  *gen3() {
    yield 3;
  }
};

// Method in class
class MyClass {
  *gen4() {
    yield 4;
  }
  
  // Can also use computed property names
  *[Symbol.iterator]() {
    yield 5;
  }
}

// All work the same way
for (const x of gen1()) { }
for (const x of gen2()) { }
for (const x of obj.gen3()) { }
for (const x of new MyClass().gen4()) { }
```

---

## The yield Mechanism

### Basic yield

```javascript
function* counter() {
  console.log('start');
  yield 1;
  console.log('between 1 and 2');
  yield 2;
  console.log('between 2 and 3');
  yield 3;
  console.log('end');
}

const iter = counter();
console.log(iter.next());  // Logs 'start', returns { value: 1, done: false }
console.log(iter.next());  // Logs 'between 1 and 2', returns { value: 2, done: false }
console.log(iter.next());  // Logs 'between 2 and 3', returns { value: 3, done: false }
console.log(iter.next());  // Logs 'end', returns { done: true }
```

### Return Value from Generator

```javascript
// ✅ return value is ignored in for...of
function* withReturn() {
  yield 1;
  yield 2;
  return 'DONE';  // Not printed in for...of
}

for (const value of withReturn()) {
  console.log(value);  // 1, 2 (not 'DONE')
}

// ❌ But return value is returned in last next()
const iterator = withReturn();
console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
console.log(iterator.next());  // { value: 'DONE', done: true }
```

### Early Exit with return

```javascript
function* earlyExit() {
  yield 1;
  yield 2;
  if (Math.random() > 0.5) {
    return;  // Early exit
  }
  yield 3;
}

// Sometimes yields 3, sometimes doesn't
for (const value of earlyExit()) {
  console.log(value);
}
```

### yield Expression Value

```javascript
// ✅ yield can receive values through next()
function* receiver() {
  const x = yield 'waiting for value';
  console.log('received:', x);
  
  const y = yield 'waiting for another';
  console.log('received:', y);
}

const iter = receiver();
console.log(iter.next());              // { value: 'waiting for value', done: false }
console.log(iter.next(10));            // Logs 'received: 10', returns { value: 'waiting for another', done: false }
console.log(iter.next(20));            // Logs 'received: 20', returns { done: true }
```

---

## Generator Delegation (yield*)

### What is yield*?

The `yield*` operator delegates to another iterable or generator.

```javascript
// ✅ Simple yield*
function* inner() {
  yield 1;
  yield 2;
}

function* outer() {
  yield* inner();
  yield 3;
}

console.log([...outer()]);  // [1, 2, 3]
```

### Recursive Generators with yield*

```javascript
// Tree traversal with yield*
function* traverse(node) {
  yield node.value;
  if (node.left) {
    yield* traverse(node.left);
  }
  if (node.right) {
    yield* traverse(node.right);
  }
}

const tree = {
  value: 1,
  left: { value: 2, left: { value: 4 }, right: { value: 5 } },
  right: { value: 3, right: { value: 6 } }
};

console.log([...traverse(tree)]);  // [1, 2, 4, 5, 3, 6]
```

### yield* with Arrays

```javascript
// yield* works with any iterable
function* flatten() {
  yield* [1, 2, 3];
  yield* 'abc';  // Strings are iterable
  yield* new Set([4, 5, 6]);
}

console.log([...flatten()]);  // [1, 2, 3, 'a', 'b', 'c', 4, 5, 6]
```

### Bidirectional Communication with yield*

```javascript
// Values passed through yield*
function* inner() {
  const x = yield 'inner';
  return x * 2;
}

function* outer() {
  const x = yield 'outer start';
  const result = yield* inner();  // Passes values through
  yield `outer end: ${result}`;
}

const iter = outer();
console.log(iter.next());        // { value: 'outer start', done: false }
console.log(iter.next(5));       // { value: 'inner', done: false }
console.log(iter.next(10));      // { value: 'outer end: 20', done: false }
console.log(iter.next());        // { done: true }
```

---

## Passing Values to Generators

### Sending Values with next()

```javascript
function* dialog() {
  const name = yield 'What is your name?';
  console.log(`Hello, ${name}!`);
  
  const age = yield 'How old are you?';
  console.log(`You are ${age} years old`);
  
  return `Nice to meet you, ${name}!`;
}

const iter = dialog();

// First next() starts the generator
const q1 = iter.next();
console.log(q1.value);  // 'What is your name?'

// Provide answer to first question
const q2 = iter.next('Alice');  // Logs 'Hello, Alice!'
console.log(q2.value);  // 'How old are you?'

// Provide answer to second question
const result = iter.next(30);  // Logs 'You are 30 years old'
console.log(result.value);  // 'Nice to meet you, Alice!'
```

### Practical Example: Range with Step

```javascript
// Traditional range (with iterator)
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;
    
    return {
      next: () => current < end
        ? { value: current, done: false }
        : { done: true }
    };
  }
}

// Generator version (simpler!)
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log([...range(0, 5)]);        // [0, 1, 2, 3, 4]
console.log([...range(0, 10, 2)]);    // [0, 2, 4, 6, 8]
console.log([...range(10, 0, -1)]);   // [10, 9, 8, ..., 1]
```

---

## Error Handling in Generators

### Throwing Errors into Generators

```javascript
function* errorHandler() {
  try {
    const x = yield 'value1';
    console.log('x =', x);
  } catch (err) {
    console.log('caught error:', err.message);
  }
  
  yield 'value2';
}

const iter = errorHandler();
console.log(iter.next());        // { value: 'value1', done: false }
console.log(iter.throw(new Error('oops')));  // Logs 'caught error: oops', returns { value: 'value2', done: false }
```

### Generator Error Recovery

```javascript
function* withRecovery() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      yield `attempt ${++attempts}`;
    } catch (err) {
      console.log(`Error: ${err.message}`);
      if (attempts >= 3) throw err;  // Re-throw after max attempts
    }
  }
}

const iter = withRecovery();
console.log(iter.next());              // { value: 'attempt 1', done: false }
console.log(iter.throw(new Error('fail')));  // Logs error, yields next
console.log(iter.next());              // { value: 'attempt 2', done: false }
```

### Generator finally Block

```javascript
function* withCleanup() {
  try {
    yield 1;
    yield 2;
    throw new Error('oops');
  } finally {
    console.log('cleaning up');
  }
}

const iter = withCleanup();
console.log(iter.next());  // { value: 1, done: false }
console.log(iter.next());  // { value: 2, done: false }

try {
  console.log(iter.next());  // Logs 'cleaning up', then throws
} catch (err) {
  console.log(err.message);  // 'oops'
}
```

---

## Infinite Sequences

### Infinite Counter

```javascript
// ✅ Generator makes this simple
function* infiniteCounter(start = 0) {
  let i = start;
  while (true) {
    yield i++;
  }
}

// Use with break or take limit
let count = 0;
for (const num of infiniteCounter(100)) {
  console.log(num);  // 100, 101, 102, ...
  if (++count >= 5) break;
}
```

### Fibonacci Sequence

```javascript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Get first 10 Fibonacci numbers
const fibs = [...Array(10)].map((_, i) => {
  if (i === 0) return gen.next();
  return gen.next();
}).map(r => r.value);

// Better approach
const gen = fibonacci();
const fibs2 = Array.from({ length: 10 }, () => gen.next().value);
console.log(fibs2);  // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Prime Numbers

```javascript
function* primes() {
  const isPrime = (n) => {
    for (let i = 2; i * i <= n; i++) {
      if (n % i === 0) return false;
    }
    return true;
  };
  
  let candidate = 2;
  while (true) {
    if (isPrime(candidate)) {
      yield candidate;
    }
    candidate++;
  }
}

// Get first 10 primes
const gen = primes();
const first10 = Array.from({ length: 10 }, () => gen.next().value);
console.log(first10);  // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

---

## Practical Generator Examples

### Example 1: File Reading Simulation

```javascript
function* readLines(text) {
  for (const line of text.split('\n')) {
    yield line;
  }
}

const content = `Line 1
Line 2
Line 3`;

for (const line of readLines(content)) {
  console.log(line);
}
```

### Example 2: Permutations

```javascript
function* permutations(arr) {
  if (arr.length <= 1) {
    yield arr;
  } else {
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of permutations(rest)) {
        yield [arr[i], ...perm];
      }
    }
  }
}

console.log([...permutations([1, 2, 3])]);
// Output: all 6 permutations of [1,2,3]
```

### Example 3: API Pagination

```javascript
function* paginate(apiCall, pageSize) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = apiCall(page, pageSize);
    hasMore = response.hasMore;
    yield response.data;
    page++;
  }
}

// Usage
function mockApi(page, size) {
  return {
    data: Array.from({ length: size }, (_, i) => (page - 1) * size + i + 1),
    hasMore: page < 3
  };
}

for (const batch of paginate(mockApi, 5)) {
  console.log('batch:', batch);
}
```

### Example 4: Generator Composition

```javascript
function* map(iterable, transform) {
  for (const value of iterable) {
    yield transform(value);
  }
}

function* filter(iterable, predicate) {
  for (const value of iterable) {
    if (predicate(value)) {
      yield value;
    }
  }
}

function* take(iterable, n) {
  let count = 0;
  for (const value of iterable) {
    if (count++ < n) {
      yield value;
    } else {
      break;
    }
  }
}

// Compose generators
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = [...take(
  filter(
    map(data, x => x * 2),
    x => x > 5
  ),
  3
)];

console.log(result);  // [6, 8, 10]
```

---

## Part 3: Async Iterators (Module 11.4)


## Async Iterable Protocol

### What is the Async Iterable Protocol?

The **async iterable protocol** allows iteration over asynchronous data streams using `for await...of`.

```javascript
// Async iterable interface
object[Symbol.asyncIterator]() {
  return {
    async next() {
      return {
        value: any,      // May be a Promise
        done: boolean
      };
    }
  };
}
```

### Synchronous vs Asynchronous Iteration

```javascript
// Synchronous - immediate values
const syncIterable = {
  [Symbol.iterator]() {
    const data = [1, 2, 3];
    let index = 0;
    return {
      next: () => index < data.length
        ? { value: data[index++], done: false }
        : { done: true }
    };
  }
};

for (const value of syncIterable) {
  console.log(value);  // 1, 2, 3
}

// Asynchronous - promises/delayed values
const asyncIterable = {
  [Symbol.asyncIterator]() {
    const data = [1, 2, 3];
    let index = 0;
    return {
      async next() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return index < data.length
          ? { value: data[index++], done: false }
          : { done: true }
      }
    };
  }
};

// Can only iterate with for await...of
for await (const value of asyncIterable) {
  console.log(value);  // 1, 2, 3 (each after 1 second)
}
```

---

## Symbol.asyncIterator

### Creating Async Iterables

```javascript
// ✅ Manual async iterable
class AsyncRange {
  constructor(start, end, delay = 100) {
    this.start = start;
    this.end = end;
    this.delay = delay;
  }
  
  [Symbol.asyncIterator]() {
    let current = this.start;
    const end = this.end;
    const delay = this.delay;
    
    return {
      async next() {
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (current < end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

// Usage
for await (const num of new AsyncRange(1, 5, 500)) {
  console.log(num);  // 1, 2, 3, 4 (each after 500ms)
}
```

### Checking for Async Iterability

```javascript
// Check if async iterable
function isAsyncIterable(obj) {
  return obj != null && typeof obj[Symbol.asyncIterator] === 'function';
}

console.log(isAsyncIterable(new AsyncRange(1, 5)));  // true
console.log(isAsyncIterable([1, 2, 3]));             // false

// Objects can be both sync and async iterable
class BothIterables {
  [Symbol.iterator]() {
    // Sync iteration
    return {
      next: () => ({ value: 1, done: false })
    };
  }
  
  [Symbol.asyncIterator]() {
    // Async iteration
    return {
      async next() {
        await new Promise(r => setTimeout(r, 100));
        return { value: 1, done: false };
      }
    };
  }
}

for (const x of new BothIterables()) { }  // Sync
for await (const x of new BothIterables()) { }  // Async
```

---

## for await...of Loops

### Basic for await...of

```javascript
// Async generator (covered next)
async function* count(max) {
  for (let i = 1; i <= max; i++) {
    await new Promise(r => setTimeout(r, 500));
    yield i;
  }
}

// Use with for await...of
async function main() {
  for await (const num of count(5)) {
    console.log(num);  // 1, 2, 3, 4, 5 (each after 500ms)
  }
  console.log('done');
}

main();
```

### for await...of with Promises

```javascript
// Array of promises
async function processPromises() {
  const promises = [
    new Promise(r => setTimeout(() => r('first'), 1000)),
    new Promise(r => setTimeout(() => r('second'), 500)),
    new Promise(r => setTimeout(() => r('third'), 1500))
  ];
  
  for await (const result of promises) {
    console.log(result);  // Waits for each promise
  }
}

// ⚠️ Still waits for all, not just next available
```

### Error Handling in for await...of

```javascript
async function* withError() {
  yield 1;
  yield 2;
  throw new Error('Something went wrong');
}

async function main() {
  try {
    for await (const value of withError()) {
      console.log(value);  // 1, 2
    }
  } catch (err) {
    console.log('caught:', err.message);  // 'Something went wrong'
  }
}

main();
```

---

## Async Generators

### Async Generator Syntax

```javascript
// Async generator function
async function* asyncGen() {
  yield 1;
  await new Promise(r => setTimeout(r, 1000));
  yield 2;
  await new Promise(r => setTimeout(r, 1000));
  yield 3;
}

// Use with for await...of
async function main() {
  for await (const value of asyncGen()) {
    console.log(value);  // 1, 2, 3 (with delays)
  }
}

main();
```

### Combining async and yield

```javascript
// Fetch data asynchronously
async function* fetchBatches(urls) {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      yield data;
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err);
    }
  }
}

// Usage
async function main() {
  const urls = [
    'https://api.example.com/page1',
    'https://api.example.com/page2',
    'https://api.example.com/page3'
  ];
  
  for await (const data of fetchBatches(urls)) {
    console.log('data:', data);
  }
}
```

### Yielding Promises

```javascript
// Async generator with parallel operations
async function* parallel() {
  yield Promise.resolve(1);
  yield Promise.resolve(2);
  yield Promise.resolve(3);
}

async function main() {
  // Sequential resolution
  for await (const promise of parallel()) {
    const result = await promise;
    console.log(result);  // 1, 2, 3
  }
  
  // Or resolve in parallel
  const promises = [...parallel()];
  const results = await Promise.all(promises);
  console.log(results);  // [1, 2, 3]
}

main();
```

---

## Streaming Data

### Example 1: Reading File Chunks (Node.js)

```javascript
// Node.js fs.createReadStream is async iterable
const fs = require('fs');

async function readFile() {
  const stream = fs.createReadStream('large-file.txt', { encoding: 'utf8', highWaterMark: 1024 });
  
  for await (const chunk of stream) {
    console.log(`Chunk size: ${chunk.length}`);
  }
}

readFile();
```

### Example 2: Custom Stream Generator

```javascript
// Simulate data streaming
async function* dataStream(delayMs = 100) {
  const data = ['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5'];
  
  for (const chunk of data) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    yield chunk;
  }
}

async function processStream() {
  let totalSize = 0;
  
  for await (const chunk of dataStream(500)) {
    console.log(`Received: ${chunk}`);
    totalSize += chunk.length;
  }
  
  console.log(`Total size: ${totalSize}`);
}

processStream();
```

### Example 3: Database Cursor Iteration

```javascript
// Simulate database cursor
async function* databaseCursor(query, pageSize = 10) {
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const results = await executeQuery(`${query} LIMIT ${pageSize} OFFSET ${offset}`);
    
    if (results.length === 0) {
      hasMore = false;
    } else {
      yield* results;  // Yield each result
      offset += pageSize;
    }
  }
}

async function main() {
  for await (const record of databaseCursor('SELECT * FROM users')) {
    console.log(record);
  }
}
```

---

## Pagination with Async

### Example 1: API Pagination

```javascript
async function* paginate(apiUrl, pageSize = 20) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${apiUrl}?page=${page}&pageSize=${pageSize}`);
    const data = await response.json();
    
    if (data.items.length === 0) {
      hasMore = false;
    } else {
      yield* data.items;  // Yield each item
      page++;
    }
  }
}

async function main() {
  for await (const item of paginate('https://api.example.com/users')) {
    console.log(item.name);
  }
}

main();
```

### Example 2: Cursor-Based Pagination

```javascript
async function* cursorPaginate(apiUrl, pageSize = 20) {
  let cursor = null;
  
  while (true) {
    const url = cursor
      ? `${apiUrl}?pageSize=${pageSize}&after=${cursor}`
      : `${apiUrl}?pageSize=${pageSize}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items.length === 0) {
      break;
    }
    
    yield* data.items;
    
    // Cursor from last item
    cursor = data.nextCursor;
    
    if (!cursor) break;  // No more pages
  }
}

async function main() {
  for await (const item of cursorPaginate('https://api.example.com/users')) {
    console.log(item);
  }
}

main();
```

---

## Error Handling

### Try-Catch in Async Generators

```javascript
async function* resilientPaginate(apiUrl) {
  let page = 1;
  let maxRetries = 3;
  
  while (true) {
    let retries = 0;
    let success = false;
    let data;
    
    while (retries < maxRetries && !success) {
      try {
        const response = await fetch(`${apiUrl}?page=${page}`);
        data = await response.json();
        success = true;
      } catch (err) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Failed to fetch page ${page} after ${maxRetries} retries`);
        }
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000 * retries));
      }
    }
    
    if (data.items.length === 0) break;
    
    yield* data.items;
    page++;
  }
}

async function main() {
  try {
    for await (const item of resilientPaginate('https://api.example.com/users')) {
      console.log(item);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
```

### Handling Individual Item Errors

```javascript
async function* processWithErrorHandling(items) {
  for (const item of items) {
    try {
      const processed = await process(item);
      yield processed;
    } catch (err) {
      console.error(`Error processing ${item}:`, err);
      // Continue with next item instead of throwing
    }
  }
}

async function main() {
  const items = ['valid', 'invalid', 'valid2'];
  
  for await (const result of processWithErrorHandling(items)) {
    console.log('processed:', result);
  }
}

main();
```

---

## Summary

### Key Concepts Across All Modules

| Concept | Purpose |
|---------|---------|
| **Iterable Protocol** | Objects with Symbol.iterator |
| **Iterator Protocol** | Objects with next() method |
| **Built-in Iterables** | Array, String, Map, Set, etc. |
| **Generators** | Functions that yield values |
| **Async Iterables** | Objects with Symbol.asyncIterator |
| **Async Generators** | async function* with yield |
| **for...of** | Iterate over iterables |
| **for await...of** | Iterate over async iterables |

### Common Use Cases

**Module 11.1 - Iteration Protocols:**
- Custom iteration logic
- Making objects for...of compatible
- Implementing data structures

**Module 11.2 - Built-in Iterables:**
- Working with built-in types
- Understanding what's iterable
- Choosing the right method

**Module 11.3 - Generators:**
- Simplifying iterator creation
- Lazy evaluation
- Infinite sequences

**Module 11.4 - Async Iterators:**
- Handling async data streams
- Pagination and cursor-based fetching
- Real-time data processing

### Next Steps

- Combine all techniques for advanced data processing
- Implement custom protocols with multiple iteration strategies
- Build production-grade async data pipelines
- Explore advanced patterns like backpressure and flow control

## 11.3 Iterators Summary

| Protocol | Required Method |
|----------|-----------------|
| Iterable | `[Symbol.iterator]()` returns iterator |
| Iterator | `next()` returns `{value, done}` |
| Async Iterable | `[Symbol.asyncIterator]()` |
| Generator | `function*` with `yield` |

---

**End of Chapter 11: Iterators and Generators**
