# Sets and WeakSets

## Table of Contents
1. [Introduction to Sets](#introduction-to-sets)
2. [Creating Sets](#creating-sets)
3. [Set Methods: add(), has(), delete(), clear()](#set-methods)
4. [Set Size and Properties](#set-size-and-properties)
5. [Iterating Sets](#iterating-sets)
6. [Set Operations](#set-operations)
7. [Sets vs Arrays](#sets-vs-arrays)
8. [Practical Set Examples](#practical-set-examples)
9. [WeakSet: Weak References](#weakset-weak-references)
10. [WeakSet Methods and Behavior](#weakset-methods-and-behavior)
11. [WeakSet Use Cases](#weakset-use-cases)
12. [Best Practices](#best-practices)
13. [Summary](#summary)

---

## Introduction to Sets

### What is a Set?

A **Set** is a collection of **unique values**. Each value appears at most once, and values can be of any type.

```javascript
// ✅ Set automatically enforces uniqueness
const set = new Set();
set.add('apple');
set.add('banana');
set.add('apple');  // Duplicate, not added

console.log(set.size);  // 2
console.log([...set]);  // ['apple', 'banana']

// ✅ Can contain any type
const mixedSet = new Set([
  'string',
  42,
  true,
  null,
  undefined,
  { obj: true },
  Symbol('sym')
]);

console.log(mixedSet.size);  // 7
```

### Set vs Array

| Aspect | Set | Array |
|--------|-----|-------|
| **Uniqueness** | ✅ Enforced | ❌ Duplicates allowed |
| **Order** | Insertion order | Positional index |
| **Lookup** | O(1) average | O(n) |
| **Memory** | Optimized for uniqueness | Sequential storage |
| **Methods** | add, has, delete, clear | push, pop, slice, etc. |

---

## Creating Sets

### Basic Set Creation

```javascript
// ✅ Empty set
const set1 = new Set();

// ✅ Initialize from array
const set2 = new Set([1, 2, 3, 2, 1]);
console.log(set2.size);  // 3 (duplicates removed)

// ✅ Initialize from string (each character)
const set3 = new Set('hello');
console.log([...set3]);  // ['h', 'e', 'l', 'o'] (l appears once)

// ✅ Initialize from another set
const original = new Set(['a', 'b', 'c']);
const copy = new Set(original);

// ✅ Initialize with iterable
const set4 = new Set(new Map([['key1', 'val1'], ['key2', 'val2']]).keys());
console.log([...set4]);  // ['key1', 'key2']
```

### Creating Sets with Different Value Types

```javascript
const set = new Set();

// ✅ Primitives
set.add('string');
set.add(42);
set.add(3.14);
set.add(true);
set.add(false);
set.add(null);
set.add(undefined);
set.add(Symbol('sym'));
set.add(BigInt(9007199254740991));

// ✅ Objects (reference-based)
const obj1 = { id: 1 };
const obj2 = { id: 1 };  // Different reference!
set.add(obj1);
set.add(obj2);  // Both added (different references)

console.log(set.size);  // 9 + 2 = 11

// ✅ Functions
const fn1 = () => {};
const fn2 = () => {};
set.add(fn1);
set.add(fn2);  // Different functions

// ✅ NaN is special (all NaN are same value)
set.add(NaN);
set.add(NaN);  // Not added (duplicate)
console.log(set.size);  // Still 13, not 14
```

---

## Set Methods: add(), has(), delete(), clear()

### add() - Adding Values

```javascript
const set = new Set();

// ✅ add() returns the set (allows chaining)
set.add('first')
   .add('second')
   .add('third');

console.log(set.size);  // 3

// ✅ Attempting to add duplicate returns set without adding
set.add('first');  // Not added
console.log(set.size);  // Still 3

// ✅ add() returns the same set for chaining
const result = set.add('new');
console.log(result === set);  // true

// ✅ Can add any value type
const set2 = new Set();
set2.add(42);
set2.add('forty-two');
set2.add({ value: 42 });
set2.add(null);
set2.add(undefined);
```

### has() - Checking for Values

```javascript
const set = new Set(['apple', 'banana', 'cherry']);

// ✅ Check if value exists
console.log(set.has('apple'));   // true
console.log(set.has('banana'));  // true
console.log(set.has('grape'));   // false

// ✅ Works with any type
const set2 = new Set();
set2.add(42);
set2.add(true);
set2.add(null);

console.log(set2.has(42));        // true
console.log(set2.has(true));      // true
console.log(set2.has(null));      // true
console.log(set2.has('42'));      // false (different type)

// ✅ Useful in conditionals
if (set.has('apple')) {
  console.log('Apple is in the set');
}

// ✅ Safe existence check
const items = new Set([1, 2, 3]);
const checkValue = (val) => items.has(val) ? 'found' : 'not found';
console.log(checkValue(2));  // 'found'
console.log(checkValue(5));  // 'not found'
```

### delete() - Removing Values

```javascript
const set = new Set(['a', 'b', 'c', 'd']);

// ✅ delete() returns true if value existed
console.log(set.delete('b'));  // true (was deleted)
console.log(set.delete('b'));  // false (already deleted)
console.log(set.delete('z'));  // false (never existed)

console.log(set.size);  // 3
console.log([...set]);  // ['a', 'c', 'd']

// ✅ Chain conditions
const set2 = new Set([1, 2, 3, 4, 5]);
if (set2.has(3)) {
  set2.delete(3);
}

// ✅ Delete with reference checking
const obj = { id: 1 };
const set3 = new Set();
set3.add(obj);

console.log(set3.delete(obj));      // true
console.log(set3.delete({ id: 1 })); // false (different reference)
```

### clear() - Removing All Values

```javascript
const set = new Set(['a', 'b', 'c', 'd', 'e']);

console.log(set.size);  // 5

// ✅ clear() removes everything
set.clear();

console.log(set.size);  // 0
console.log([...set]);  // []

// ✅ Set is reusable after clear
set.add('new');
console.log(set.size);  // 1
```

---

## Set Size and Properties

### The size Property

```javascript
const set = new Set();

// ✅ size property (read-only)
console.log(set.size);  // 0

set.add('a');
console.log(set.size);  // 1

set.add('b');
set.add('c');
console.log(set.size);  // 3

// ✅ Adding duplicate doesn't change size
set.add('a');  // Already exists
console.log(set.size);  // Still 3

// ✅ delete() decreases size
set.delete('b');
console.log(set.size);  // 2

// ✅ clear() resets size
set.clear();
console.log(set.size);  // 0

// ✅ Can't set size directly
set.size = 100;  // Fails silently
console.log(set.size);  // Still 0
```

### Constructor Property

```javascript
const set = new Set();
console.log(set.constructor === Set);  // true

// ✅ Type checking
function isSet(obj) {
  return obj instanceof Set;
  // or: obj.constructor === Set;
}

console.log(isSet(new Set()));    // true
console.log(isSet([]));           // false
console.log(isSet(new Map()));    // false
```

---

## Iterating Sets

### for...of Loop

```javascript
const set = new Set(['a', 'b', 'c']);

// ✅ Iterate values
for (const value of set) {
  console.log(value);  // 'a', 'b', 'c'
}

// ✅ Default iteration is same as values()
for (const value of set.values()) {
  console.log(value);  // Same output
}

// ✅ Destructuring from set
const [first, second] = set;
console.log(first, second);  // 'a', 'b'
```

### values() - Iterating Values

```javascript
const set = new Set([10, 20, 30]);

// ✅ Iterate values
for (const value of set.values()) {
  console.log(value);  // 10, 20, 30
}

// ✅ Convert to array
const valueArray = [...set.values()];
console.log(valueArray);  // [10, 20, 30]

// ✅ Get first value
const iterator = set.values();
const firstValue = iterator.next().value;
console.log(firstValue);  // 10
```

### keys() - Same as values()

```javascript
const set = new Set(['x', 'y', 'z']);

// ✅ For Sets, keys() returns same as values()
for (const key of set.keys()) {
  console.log(key);  // 'x', 'y', 'z'
}

// This exists for compatibility with Map
console.log(set.keys() === set.values());  // false (different iterators)
console.log([...set.keys()]);  // ['x', 'y', 'z']
```

### entries() - [value, value] Pairs

```javascript
const set = new Set(['a', 'b', 'c']);

// ✅ entries() returns [value, value] pairs
for (const [key, value] of set.entries()) {
  console.log(key === value);  // true (always true for Set)
}

// ✅ Convert to array
const entriesArray = [...set.entries()];
console.log(entriesArray);  // [['a', 'a'], ['b', 'b'], ['c', 'c']]
```

### forEach() - Functional Iteration

```javascript
const set = new Set([1, 2, 3, 4, 5]);

// ✅ forEach with callback
set.forEach((value) => {
  console.log(value);  // 1, 2, 3, 4, 5
});

// ✅ forEach with this context
class Processor {
  constructor(prefix) {
    this.prefix = prefix;
  }
  
  processSet(set) {
    set.forEach(function(value) {
      console.log(this.prefix + value);
    }, this);
  }
}

new Processor('>> ').processSet(new Set(['a', 'b', 'c']));
// >> a, >> b, >> c

// ✅ Collecting values
const doubled = [];
set.forEach(value => doubled.push(value * 2));
console.log(doubled);  // [2, 4, 6, 8, 10]
```

---

## Set Operations

### Union (Combine Two Sets)

```javascript
// ✅ Union of two sets
const set1 = new Set([1, 2, 3]);
const set2 = new Set([2, 3, 4]);

const union = new Set([...set1, ...set2]);
console.log([...union]);  // [1, 2, 3, 4]

// ✅ As a function
function setUnion(setA, setB) {
  return new Set([...setA, ...setB]);
}

const result = setUnion(set1, set2);
console.log([...result]);  // [1, 2, 3, 4]
```

### Intersection (Common Elements)

```javascript
// ✅ Intersection of two sets
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([2, 3, 5, 6]);

const intersection = new Set([...set1].filter(x => set2.has(x)));
console.log([...intersection]);  // [2, 3]

// ✅ As a function
function setIntersection(setA, setB) {
  return new Set([...setA].filter(x => setB.has(x)));
}

const result = setIntersection(set1, set2);
console.log([...result]);  // [2, 3]
```

### Difference (Elements in A but not in B)

```javascript
// ✅ Difference of two sets
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([2, 3, 5, 6]);

const difference = new Set([...set1].filter(x => !set2.has(x)));
console.log([...difference]);  // [1, 4]

// ✅ As a function
function setDifference(setA, setB) {
  return new Set([...setA].filter(x => !setB.has(x)));
}

const result = setDifference(set1, set2);
console.log([...result]);  // [1, 4]
```

### Symmetric Difference (Elements in either A or B, but not both)

```javascript
// ✅ Symmetric difference
const set1 = new Set([1, 2, 3, 4]);
const set2 = new Set([2, 3, 5, 6]);

const symDiff = new Set([
  ...setDifference(set1, set2),
  ...setDifference(set2, set1)
]);

console.log([...symDiff]);  // [1, 4, 5, 6]

// ✅ As a function
function setSymmetricDifference(setA, setB) {
  const diffAB = new Set([...setA].filter(x => !setB.has(x)));
  const diffBA = new Set([...setB].filter(x => !setA.has(x)));
  return new Set([...diffAB, ...diffBA]);
}
```

### Subset Check (All of A in B)

```javascript
// ✅ Check if set1 is subset of set2
const set1 = new Set([1, 2]);
const set2 = new Set([1, 2, 3, 4]);

function isSubset(setA, setB) {
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

console.log(isSubset(set1, set2));  // true
console.log(isSubset(set2, set1));  // false
```

---

## Sets vs Arrays

### Performance Comparison

```javascript
// ✅ Set is faster for membership testing
const array = [1, 2, 3, 4, 5, 1000000];
const set = new Set(array);

// Checking membership
console.time('Array includes');
for (let i = 0; i < 100000; i++) {
  array.includes(1000000);  // O(n) search
}
console.timeEnd('Array includes');  // Much slower

console.time('Set has');
for (let i = 0; i < 100000; i++) {
  set.has(1000000);  // O(1) lookup
}
console.timeEnd('Set has');  // Much faster
```

### When to Use Each

```javascript
// ✅ Use Set when:
// - Need unique values only
// - Frequent membership checking
// - Add/remove operations common
// - Don't need index-based access

const uniqueUsers = new Set();
uniqueUsers.add(user1);
uniqueUsers.add(user2);
if (uniqueUsers.has(user3)) { }

// ✅ Use Array when:
// - Need indexed access
// - Order and duplicates matter
// - Need array methods (map, filter, etc.)
// - JSON serialization needed

const numbers = [1, 2, 2, 3, 3, 3];
const doubled = numbers.map(x => x * 2);
console.log(numbers[0]);  // Index access
```

### Converting Between Set and Array

```javascript
// Array → Set (remove duplicates)
const array = [1, 2, 2, 3, 3, 3, 4, 4];
const set = new Set(array);
console.log([...set]);  // [1, 2, 3, 4]

// Set → Array
const set2 = new Set(['a', 'b', 'c']);
const array2 = [...set2];  // Or Array.from(set2)
console.log(array2);  // ['a', 'b', 'c']

// Remove duplicates from array
function deduplicate(arr) {
  return [...new Set(arr)];
}

console.log(deduplicate([1, 2, 2, 3, 3, 3]));  // [1, 2, 3]
```

---

## Practical Set Examples

### Example 1: Unique Items Tracking

```javascript
class UniqueItemTracker {
  constructor() {
    this.items = new Set();
    this.history = [];
  }
  
  add(item) {
    if (!this.items.has(item)) {
      this.items.add(item);
      this.history.push({ action: 'add', item, time: Date.now() });
      return true;
    }
    return false;
  }
  
  remove(item) {
    if (this.items.delete(item)) {
      this.history.push({ action: 'remove', item, time: Date.now() });
      return true;
    }
    return false;
  }
  
  getAll() {
    return [...this.items];
  }
  
  count() {
    return this.items.size;
  }
}

const tracker = new UniqueItemTracker();
console.log(tracker.add('item1'));  // true
console.log(tracker.add('item1'));  // false (duplicate)
console.log(tracker.add('item2'));  // true
console.log(tracker.count());       // 2
```

### Example 2: Finding Unique Elements

```javascript
// Find unique elements in multiple arrays
function findUnique(arrays) {
  const all = new Set();
  const duplicates = new Set();
  
  for (const arr of arrays) {
    for (const item of arr) {
      if (all.has(item)) {
        duplicates.add(item);
      } else {
        all.add(item);
      }
    }
  }
  
  // Return items that appear exactly once
  return [...all].filter(item => !duplicates.has(item));
}

const result = findUnique([
  [1, 2, 3],
  [2, 3, 4],
  [4, 5, 6]
]);

console.log(result);  // [1, 5, 6] (appear in only one array)
```

### Example 3: Tag System

```javascript
class TagManager {
  constructor() {
    this.tags = new Set();
  }
  
  addTag(tag) {
    this.tags.add(tag.toLowerCase());
  }
  
  hasTag(tag) {
    return this.tags.has(tag.toLowerCase());
  }
  
  removeTag(tag) {
    this.tags.delete(tag.toLowerCase());
  }
  
  getTags() {
    return [...this.tags].sort();
  }
  
  getTagCount() {
    return this.tags.size;
  }
  
  mergeTags(other) {
    return new Set([...this.tags, ...other.tags]);
  }
}

const post = new TagManager();
post.addTag('JavaScript');
post.addTag('Tutorial');
post.addTag('javascript');  // Duplicate (case-insensitive)

console.log(post.getTags());        // ['javascript', 'tutorial']
console.log(post.getTagCount());    // 2
```

### Example 4: Word Frequency Analysis

```javascript
function analyzeWords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const unique = new Set(words);
  
  return {
    total: words.length,
    unique: unique.size,
    coverage: (unique.size / words.length * 100).toFixed(2) + '%',
    words: [...unique].sort()
  };
}

const text = "The quick brown fox jumps over the lazy dog";
const analysis = analyzeWords(text);

console.log(analysis);
// { total: 9, unique: 8, coverage: '88.89%', words: ['brown', 'dog', ...] }
```

---

## WeakSet: Weak References

### What is a WeakSet?

A **WeakSet** is like a Set but:
- Values must be **objects only** (no primitives)
- Values are held **weakly** (don't prevent garbage collection)
- Values can be garbage collected even if in WeakSet
- **Not iterable** (no forEach, no iteration methods)
- **No size property**

```javascript
// ✅ WeakSet with object values
const weakSet = new WeakSet();
const obj1 = { id: 1 };
const obj2 = { id: 2 };

weakSet.add(obj1);
weakSet.add(obj2);

console.log(weakSet.has(obj1));  // true
console.log(weakSet.has(obj2));  // true

// ❌ WeakSet cannot have primitive values
const ws = new WeakSet();
// ws.add('string');  // TypeError
// ws.add(42);         // TypeError
// ws.add(true);       // TypeError
```

### WeakSet Methods and Behavior

```javascript
const weakSet = new WeakSet();
const obj = { id: 1 };

// ✅ add() - Add value
weakSet.add(obj);

// ✅ has() - Check existence
console.log(weakSet.has(obj));  // true

// ✅ delete() - Remove
weakSet.delete(obj);
console.log(weakSet.has(obj));  // false

// ❌ NO size property
console.log(weakSet.size);  // undefined

// ❌ NO iteration methods
// weakSet.forEach(...)  // TypeError
// for (const item of weakSet) {}  // TypeError
// [...weakSet.values()]  // TypeError
```

---

## WeakSet Use Cases

### Use Case 1: Object Tagging

```javascript
// ✅ Mark objects without modifying them
const processed = new WeakSet();

class DataProcessor {
  process(obj) {
    if (processed.has(obj)) {
      console.log('Already processed');
      return;
    }
    
    // Process object
    console.log('Processing:', obj);
    processed.add(obj);  // Mark as processed
  }
}

const processor = new DataProcessor();
const obj = { data: 'value' };

processor.process(obj);   // Processing: { data: 'value' }
processor.process(obj);   // Already processed
```

### Use Case 2: Detecting Cycles in Graphs

```javascript
// ✅ Detect circular references
function hasCycle(obj) {
  const visited = new WeakSet();
  
  function visit(node) {
    if (typeof node !== 'object' || node === null) {
      return false;
    }
    
    if (visited.has(node)) {
      return true;  // Cycle detected
    }
    
    visited.add(node);
    
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        if (visit(node[key])) {
          return true;
        }
      }
    }
    
    visited.delete(node);  // Backtrack
    return false;
  }
  
  return visit(obj);
}

const circular = { a: 1 };
circular.self = circular;

console.log(hasCycle(circular));  // true
console.log(hasCycle({ a: 1 }));  // false
```

### Use Case 3: Tracking DOM Elements

```javascript
// ✅ Track processed DOM elements
const processedElements = new WeakSet();

class DOMHandler {
  process(element) {
    if (processedElements.has(element)) {
      return;  // Already handled
    }
    
    // Attach event listeners, etc.
    element.addEventListener('click', () => console.log('Clicked'));
    
    processedElements.add(element);
  }
  
  unprocess(element) {
    processedElements.delete(element);
  }
}

const handler = new DOMHandler();
const button = document.querySelector('button');

if (button) {
  handler.process(button);
  // When button removed from DOM and GC runs,
  // WeakSet entry is automatically cleaned up
}
```

### Use Case 4: Request Tracking

```javascript
// ✅ Track active requests without preventing GC
const activeRequests = new WeakSet();

class RequestManager {
  async fetchData(controller) {
    if (activeRequests.has(controller)) {
      throw new Error('Request already in progress');
    }
    
    activeRequests.add(controller);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      return await response.json();
    } finally {
      activeRequests.delete(controller);
    }
  }
  
  isActive(controller) {
    return activeRequests.has(controller);
  }
}

const manager = new RequestManager();
const controller = new AbortController();

manager.fetchData(controller).catch(console.error);
console.log(manager.isActive(controller));  // true
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use Set for unique values
const userIds = new Set();
userIds.add(1);
userIds.add(2);
userIds.add(1);  // Duplicate ignored
console.log(userIds.size);  // 2

// ✅ Use WeakSet for object tagging
const processed = new WeakSet();
processed.add(obj);  // Won't prevent GC

// ✅ Check size before operations
if (set.size > 0) {
  const first = [...set][0];
}

// ✅ Use Set operations appropriately
const union = new Set([...set1, ...set2]);

// ✅ Convert to array for advanced operations
const doubled = [...set].map(x => x * 2);
```

### ❌ DON'T

```javascript
// ❌ Don't use primitives in WeakSet
const ws = new WeakSet();
// ws.add('string');  // TypeError
// ws.add(42);         // TypeError

// ❌ Don't assume WeakSet has size
console.log(ws.size);  // undefined

// ❌ Don't try to iterate WeakSet
// for (const item of ws) {}  // TypeError

// ❌ Don't expect WeakSet to prevent GC
let obj = { id: 1 };
const ws2 = new WeakSet();
ws2.add(obj);

obj = null;
// Object can be garbage collected
// WeakSet entry will disappear

// ❌ Don't forget to handle duplicates manually with Array
const arr = [1, 2, 2, 3];  // Has duplicates
// Set automatically removes them
const unique = new Set(arr);
```

---

## Summary

### Sets Key Points

| Feature | Details |
|---------|---------|
| **Uniqueness** | Automatically enforced |
| **Value types** | Any type (primitives and objects) |
| **Methods** | add(), has(), delete(), clear() |
| **Iteration** | for...of, .keys(), .values(), .entries(), .forEach() |
| **Size** | .size property available |
| **Operations** | Union, intersection, difference, symmetric difference |

### WeakSets Key Points

| Feature | Details |
|---------|---------|
| **Value types** | Objects only |
| **Weak refs** | Values don't prevent garbage collection |
| **Methods** | add(), has(), delete() |
| **Iteration** | ❌ Not iterable |
| **Size** | ❌ No .size property |
| **Use when** | Object tagging, cycle detection, tracking |

### Quick Comparison

```javascript
// Set: Collection of unique values
const set = new Set([1, 2, 2, 3]);
console.log(set.size);  // 3
for (const value of set) { }  // Iterable

// WeakSet: Weak references to objects
const ws = new WeakSet();
ws.add(obj);  // Won't prevent GC
// Cannot iterate, no size
```

### Next Steps

- Combine Maps/WeakMaps with Sets/WeakSets
- Implement complex data structures
- Use in caching and memoization
- Handle special memory scenarios with WeakSet