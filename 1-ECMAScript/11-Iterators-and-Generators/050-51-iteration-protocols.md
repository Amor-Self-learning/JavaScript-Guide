# Iteration Protocols

## Table of Contents
1. [The Iterable Protocol](#the-iterable-protocol)
2. [The Iterator Protocol](#the-iterator-protocol)
3. [Symbol.iterator](#symboliterator)
4. [Making Objects Iterable](#making-objects-iterable)
5. [Practical Examples](#practical-examples)
6. [Common Patterns](#common-patterns)
7. [Best Practices](#best-practices)
8. [Summary](#summary)

---

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