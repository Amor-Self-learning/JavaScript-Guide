# 12 Collections

ES6 introduced `Map`, `Set`, `WeakMap`, and `WeakSet`—specialized collections for specific use cases beyond plain objects and arrays.

---

# Maps and WeakMaps

## Table of Contents
1. [Introduction to Maps](#introduction-to-maps)
2. [Creating Maps](#creating-maps)
3. [Map Methods: set(), get(), has(), delete(), clear()](#map-methods)
4. [Map Size and Properties](#map-size-and-properties)
5. [Iterating Maps](#iterating-maps)
6. [Maps vs Objects](#maps-vs-objects)
7. [Practical Map Examples](#practical-map-examples)
8. [WeakMap: Weak References](#weakmap-weak-references)
9. [WeakMap Methods and Behavior](#weakmap-methods-and-behavior)
10. [WeakMap Use Cases](#weakmap-use-cases)
11. [Best Practices](#best-practices)
12. [Summary](#summary)

---


## Creating Maps

### Basic Map Creation

```javascript
// ✅ Empty map
const map1 = new Map();

// ✅ Initialize with entries (array of [key, value] pairs)
const map2 = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

console.log(map2.size);  // 3

// ✅ Initialize from object entries
const obj = { x: 10, y: 20 };
const map3 = new Map(Object.entries(obj));

console.log(map3.get('x'));  // 10
```

### Creating Maps with Different Key Types

```javascript
// ✅ Different key types
const map = new Map();

// String keys
map.set('name', 'Alice');

// Number keys
map.set(1, 'first');
map.set(2, 'second');

// Object keys (reference-based)
const obj1 = { id: 1 };
const obj2 = { id: 2 };
map.set(obj1, 'object 1');
map.set(obj2, 'object 2');

// Function keys
const fn = () => console.log('hello');
map.set(fn, 'function value');

// Symbol keys
const sym = Symbol('key');
map.set(sym, 'symbol value');

// NaN is special - all NaN values are the same key
map.set(NaN, 'nan value');
map.set(NaN, 'updated nan');  // Overwrites previous
console.log(map.get(NaN));  // 'updated nan'

// But undefined, null, false, 0 are different keys
map.set(undefined, 'undefined');
map.set(null, 'null');
map.set(false, 'false');
map.set(0, 'zero');
```

### Map with Complex Initialization

```javascript
// Initialize from another map
const original = new Map([['a', 1], ['b', 2]]);
const copy = new Map(original);

console.log(copy.get('a'));  // 1
console.log(copy === original);  // false (new map instance)

// Convert from object with entries
const data = { name: 'Bob', age: 30, city: 'NYC' };
const map = new Map(Object.entries(data));

// Convert from array
const pairs = [['id', 123], ['status', 'active']];
const mapFromArray = new Map(pairs);
```

---

## Map Methods: set(), get(), has(), delete(), clear()

### set() - Adding and Updating Values

```javascript
const map = new Map();

// ✅ Add new key-value pair
map.set('key1', 'value1');

// ✅ Update existing key (overwrites)
map.set('key1', 'updated value');

// ✅ set() returns the map (allows chaining)
map.set('key2', 'value2')
   .set('key3', 'value3')
   .set('key4', 'value4');

console.log(map.size);  // 4

// ✅ Works with any key type
map.set(42, 'numeric key');
map.set(true, 'boolean key');
map.set({ id: 1 }, 'object key');

// ✅ Can store any value type
map.set('array', [1, 2, 3]);
map.set('obj', { nested: true });
map.set('fn', () => 'callable');
map.set('null', null);
map.set('undefined', undefined);
```

### get() - Retrieving Values

```javascript
const map = new Map([
  ['name', 'Alice'],
  [1, 'one'],
  [true, 'yes']
]);

// ✅ Get value by key
console.log(map.get('name'));    // 'Alice'
console.log(map.get(1));         // 'one'
console.log(map.get(true));      // 'yes'

// ✅ Returns undefined if key not found
console.log(map.get('missing'));  // undefined

// ✅ Distinguish between not found and stored undefined
const map2 = new Map();
map2.set('key1', undefined);

console.log(map2.get('key1'));      // undefined (stored value)
console.log(map2.get('key2'));      // undefined (not found)
console.log(map2.has('key1'));      // true (distinguishes!)
console.log(map2.has('key2'));      // false

// ✅ Safe get with default value
function getOrDefault(map, key, defaultValue) {
  return map.has(key) ? map.get(key) : defaultValue;
}

console.log(getOrDefault(map, 'name', 'Unknown'));    // 'Alice'
console.log(getOrDefault(map, 'age', 25));            // 25
```

### has() - Checking for Keys

```javascript
const map = new Map([
  ['name', 'Alice'],
  [42, 'answer'],
  [null, 'nullish'],
  [undefined, 'void']
]);

// ✅ Check if key exists
console.log(map.has('name'));       // true
console.log(map.has(42));           // true
console.log(map.has(null));         // true
console.log(map.has(undefined));    // true

// ✅ Returns false for missing keys
console.log(map.has('missing'));    // false
console.log(map.has(0));            // false

// ✅ Use in conditionals
if (map.has('name')) {
  console.log(`Name is ${map.get('name')}`);
}

// ✅ Safe retrieval pattern
function getValue(map, key) {
  if (map.has(key)) {
    return map.get(key);
  }
  throw new Error(`Key ${key} not found in map`);
}
```

### delete() - Removing Values

```javascript
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

console.log(map.size);  // 3

// ✅ Delete returns true if key existed
console.log(map.delete('b'));  // true (key was deleted)
console.log(map.delete('b'));  // false (already deleted)
console.log(map.delete('z'));  // false (never existed)

console.log(map.size);  // 2
console.log(map.has('b'));  // false

// ✅ Chained conditional deletion
if (map.has('a')) {
  map.delete('a');  // Safe to delete without checking
}

// ✅ Delete object keys
const obj = { id: 1 };
const map2 = new Map();
map2.set(obj, 'value');

console.log(map2.delete(obj));  // true
console.log(map2.has(obj));     // false

// Note: Different object reference means different key
const obj2 = { id: 1 };  // Different instance
console.log(map2.has(obj2));  // false
```

### clear() - Removing All Values

```javascript
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3],
  ['d', 4],
  ['e', 5]
]);

console.log(map.size);  // 5

// ✅ clear() removes all entries
map.clear();

console.log(map.size);  // 0
console.log(map.has('a'));  // false

// ✅ After clear, map is reusable
map.set('new', 'value');
console.log(map.size);  // 1
```

---

## Map Size and Properties

### The size Property

```javascript
const map = new Map();

// ✅ size property (read-only)
console.log(map.size);  // 0

map.set('a', 1);
console.log(map.size);  // 1

map.set('b', 2);
console.log(map.size);  // 2

// ✅ size updates automatically
map.set('a', 'updated');  // No size change (key exists)
console.log(map.size);  // 2

map.delete('b');
console.log(map.size);  // 1

// ✅ Can't set size directly
map.size = 5;  // Silently fails (or throws in strict mode)
console.log(map.size);  // Still 1

// ✅ Get accurate size
function getMapSize(map) {
  return map.size;  // Always correct
}

// ❌ Different from object
const obj = { a: 1, b: 2 };
console.log(Object.keys(obj).length);  // Need to count manually
```

### Constructor Property

```javascript
const map = new Map();
console.log(map.constructor === Map);  // true

// ✅ Can check if something is a Map
function isMap(obj) {
  return obj instanceof Map;
  // or: obj.constructor === Map;
  // or: Object.prototype.toString.call(obj) === '[object Map]';
}

console.log(isMap(new Map()));      // true
console.log(isMap({}));             // false
console.log(isMap(new Set()));      // false
```

---

## Iterating Maps

### Iterating with for...of

```javascript
const map = new Map([
  ['name', 'Alice'],
  ['age', 30],
  ['city', 'NYC']
]);

// ✅ Default iteration yields [key, value] pairs
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}
// Output:
// name: Alice
// age: 30
// city: NYC

// ✅ Can iterate without destructuring
for (const entry of map) {
  console.log(entry);  // ['name', 'Alice'], ['age', 30], etc.
}
```

### keys() - Iterating Keys Only

```javascript
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

// ✅ Iterate keys
for (const key of map.keys()) {
  console.log(key);  // 'a', 'b', 'c'
}

// ✅ Convert to array
const keyArray = [...map.keys()];
console.log(keyArray);  // ['a', 'b', 'c']

// ✅ Find specific key
const keys = Array.from(map.keys());
const hasKeyStartingWithB = keys.some(k => String(k).startsWith('b'));
```

### values() - Iterating Values Only

```javascript
const map = new Map([
  ['a', 10],
  ['b', 20],
  ['c', 30]
]);

// ✅ Iterate values
for (const value of map.values()) {
  console.log(value);  // 10, 20, 30
}

// ✅ Convert to array
const valueArray = [...map.values()];
console.log(valueArray);  // [10, 20, 30]

// ✅ Sum all values
const total = Array.from(map.values()).reduce((sum, v) => sum + v, 0);
console.log(total);  // 60
```

### entries() - Explicit Entry Iteration

```javascript
const map = new Map([
  ['x', 100],
  ['y', 200]
]);

// ✅ Explicitly get entries
for (const [key, value] of map.entries()) {
  console.log(`${key} => ${value}`);
}

// ✅ entries() is same as default iteration
for (const entry of map.entries()) {
  console.log(entry);  // Same as: for (const entry of map)
}

// ✅ Convert entries to array
const entriesArray = Array.from(map.entries());
console.log(entriesArray);  // [['x', 100], ['y', 200]]
```

### forEach() - Functional Iteration

```javascript
const map = new Map([
  ['name', 'Alice'],
  ['role', 'Developer'],
  ['level', 'Senior']
]);

// ✅ forEach with callback
map.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// ✅ forEach with this context
class Processor {
  constructor(prefix) {
    this.prefix = prefix;
  }
  
  process(map) {
    map.forEach(function(value, key) {
      console.log(`${this.prefix}${key}: ${value}`);
    }, this);
  }
}

new Processor('>> ').process(map);

// ✅ Collecting values
const values = [];
map.forEach(value => values.push(value));
console.log(values);
```

---

## Maps vs Objects

### Feature Comparison

```javascript
// ✅ Maps with any key type
const map = new Map();
map.set({}, 'object key');
map.set(() => {}, 'function key');
map.set(Symbol('s'), 'symbol key');
map.set(NaN, 'NaN key');

// ❌ Objects convert keys to strings
const obj = {};
obj[{}] = 'value';  // Key becomes '[object Object]'
obj[() => {}] = 'value';  // Key becomes string representation
console.log(Object.keys(obj));  // All string keys
```

### Size Property

```javascript
// ✅ Maps have .size
const map = new Map([['a', 1], ['b', 2]]);
console.log(map.size);  // 2

// ❌ Objects don't have .size
const obj = { a: 1, b: 2 };
console.log(obj.size);  // undefined
console.log(Object.keys(obj).length);  // Manual count needed
```

### Iteration

```javascript
// ✅ Maps are directly iterable
const map = new Map([['a', 1], ['b', 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}

// ❌ Objects need Object methods
const obj = { a: 1, b: 2 };
for (const key of Object.keys(obj)) {
  console.log(key, obj[key]);
}
```

### Performance

```javascript
// ✅ Maps optimize for frequent add/delete
const map = new Map();
for (let i = 0; i < 1000000; i++) {
  map.set(i, i * 2);
}
for (let i = 0; i < 500000; i++) {
  map.delete(i);
}

// ❌ Objects less optimized for frequent changes
const obj = {};
for (let i = 0; i < 1000000; i++) {
  obj[i] = i * 2;  // Slower
}
```

### When to Use Each

```javascript
// ✅ Use Maps when:
// - Keys aren't simple strings
// - Frequent additions/deletions
// - Need to preserve insertion order
// - Need to count entries with .size

// ✅ Use Objects when:
// - Keys are always strings/symbols
// - Using JSON serialization
// - Need method definitions
// - Prototype inheritance needed
// - Relatively static data

// Example: Cache with object keys
const userCache = new Map();
const userObj = { id: 1, name: 'Alice' };
userCache.set(userObj, 'cached data');
// Objects as keys only work with Map, not plain object

// Example: Configuration with string keys
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};
// Object is better here (simpler, JSON-compatible)
```

---

## Practical Map Examples

### Example 1: User Registry

```javascript
class UserRegistry {
  constructor() {
    this.users = new Map();  // id -> user object
  }
  
  add(id, name, email) {
    this.users.set(id, { id, name, email });
  }
  
  get(id) {
    return this.users.get(id);
  }
  
  exists(id) {
    return this.users.has(id);
  }
  
  remove(id) {
    return this.users.delete(id);
  }
  
  getAll() {
    return Array.from(this.users.values());
  }
  
  count() {
    return this.users.size;
  }
}

const registry = new UserRegistry();
registry.add(1, 'Alice', 'alice@example.com');
registry.add(2, 'Bob', 'bob@example.com');

console.log(registry.count());  // 2
console.log(registry.get(1));   // { id: 1, name: 'Alice', ... }
console.log(registry.getAll()); // [{ id: 1, ... }, { id: 2, ... }]
```

### Example 2: Frequency Counter

```javascript
function countFrequency(items) {
  const frequency = new Map();
  
  for (const item of items) {
    if (frequency.has(item)) {
      frequency.set(item, frequency.get(item) + 1);
    } else {
      frequency.set(item, 1);
    }
  }
  
  return frequency;
}

const items = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
const counts = countFrequency(items);

console.log(counts.get('apple'));   // 3
console.log(counts.get('banana'));  // 2
console.log(counts.get('cherry'));  // 1

// Find most common
let max = 0;
let maxItem = null;
for (const [item, count] of counts) {
  if (count > max) {
    max = count;
    maxItem = item;
  }
}
console.log(`Most common: ${maxItem} (${max} times)`);
```

### Example 3: Graph Adjacency List

```javascript
class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }
  
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }
  
  addEdge(vertex1, vertex2) {
    this.addVertex(vertex1);
    this.addVertex(vertex2);
    
    this.adjacencyList.get(vertex1).push(vertex2);
    this.adjacencyList.get(vertex2).push(vertex1);  // Undirected
  }
  
  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }
  
  display() {
    for (const [vertex, neighbors] of this.adjacencyList) {
      console.log(`${vertex} -> ${neighbors.join(', ')}`);
    }
  }
}

const graph = new Graph();
graph.addEdge('A', 'B');
graph.addEdge('B', 'C');
graph.addEdge('C', 'A');

graph.display();
// A -> B, C
// B -> A, C
// C -> B, A
```

### Example 4: Command Handler Registry

```javascript
class CommandDispatcher {
  constructor() {
    this.handlers = new Map();
  }
  
  register(command, handler) {
    if (this.handlers.has(command)) {
      throw new Error(`Command '${command}' already registered`);
    }
    this.handlers.set(command, handler);
  }
  
  execute(command, ...args) {
    if (!this.handlers.has(command)) {
      throw new Error(`Unknown command: ${command}`);
    }
    
    const handler = this.handlers.get(command);
    return handler(...args);
  }
  
  listCommands() {
    return Array.from(this.handlers.keys());
  }
}

const dispatcher = new CommandDispatcher();

dispatcher.register('greet', (name) => `Hello, ${name}!`);
dispatcher.register('add', (a, b) => a + b);
dispatcher.register('multiply', (a, b) => a * b);

console.log(dispatcher.execute('greet', 'Alice'));      // 'Hello, Alice!'
console.log(dispatcher.execute('add', 5, 3));          // 8
console.log(dispatcher.execute('multiply', 4, 6));     // 24
console.log(dispatcher.listCommands());                // ['greet', 'add', 'multiply']
```

---

## WeakMap: Weak References

### What is a WeakMap?

A **WeakMap** is like a Map but:
- Keys must be **objects** only
- Keys are held **weakly** (don't prevent garbage collection)
- Keys can be garbage collected even if in WeakMap
- **Not iterable** (no forEach, no iteration methods)

```javascript
// ✅ WeakMap with object keys
const weakMap = new WeakMap();
const obj1 = { id: 1 };
const obj2 = { id: 2 };

weakMap.set(obj1, 'data for obj1');
weakMap.set(obj2, 'data for obj2');

console.log(weakMap.get(obj1));  // 'data for obj1'
console.log(weakMap.get(obj2));  // 'data for obj2'

// ❌ WeakMap cannot have primitive keys
const wm = new WeakMap();
// wm.set('string', 'value');  // TypeError
// wm.set(42, 'value');         // TypeError
// wm.set(true, 'value');       // TypeError
```

### Weak References Explained

```javascript
// ✅ Regular Map holds strong reference
const map = new Map();
let obj = { id: 1 };
map.set(obj, 'data');

// Even if we remove our reference:
obj = null;

// Object is STILL in memory (kept alive by Map)
console.log(map.get(obj));  // Cannot access (obj is null)
console.log(map.size);      // 1 (still there!)

// ✅ WeakMap holds weak reference
const weakMap = new WeakMap();
let obj2 = { id: 2 };
weakMap.set(obj2, 'data');

// When we remove our reference:
obj2 = null;

// Object CAN be garbage collected (no strong reference)
// weakMap still has it, but it will disappear after GC
console.log(weakMap.size);  // ❌ No .size property!
```

### WeakMap Methods and Behavior

```javascript
// ✅ WeakMap has limited methods
const weakMap = new WeakMap();
const key = { id: 1 };

// ✅ set() - Add/update
weakMap.set(key, 'value');

// ✅ get() - Retrieve
console.log(weakMap.get(key));  // 'value'

// ✅ has() - Check existence
console.log(weakMap.has(key));  // true

// ✅ delete() - Remove
weakMap.delete(key);
console.log(weakMap.has(key));  // false

// ❌ NO size property
console.log(weakMap.size);  // undefined

// ❌ NO iteration methods
// weakMap.forEach(...)  // TypeError
// for (const entry of weakMap) {}  // TypeError
// [...weakMap.keys()]  // TypeError
```

---

## WeakMap Use Cases

### Use Case 1: Private Data Storage

```javascript
// ✅ Use WeakMap for private instance data
const privateData = new WeakMap();

class User {
  constructor(name, email) {
    this.name = name;  // Public
    
    // Private data stored in WeakMap
    privateData.set(this, {
      email: email,
      password: null,
      createdAt: new Date()
    });
  }
  
  setPassword(pwd) {
    const data = privateData.get(this);
    if (data) {
      data.password = pwd;
    }
  }
  
  getEmail() {
    const data = privateData.get(this);
    return data ? data.email : null;
  }
}

const user = new User('Alice', 'alice@example.com');
console.log(user.name);        // 'Alice' (public)
console.log(user.getEmail());  // 'alice@example.com' (private access)

// Cannot access private data directly
const data = privateData;  // Would need reference to weakMap
```

### Use Case 2: Caching with Automatic Cleanup

```javascript
// ✅ Cache DOM nodes without preventing garbage collection
const domCache = new WeakMap();

class ComponentManager {
  render(element) {
    // Store component state without preventing GC
    const state = {
      mounted: true,
      listeners: [],
      timestamp: Date.now()
    };
    
    domCache.set(element, state);
  }
  
  getState(element) {
    return domCache.get(element);
  }
}

const manager = new ComponentManager();
let div = document.createElement('div');

manager.render(div);
console.log(manager.getState(div).mounted);  // true

// When element is removed from DOM:
div = null;  // Reference removed

// Element can be garbage collected now
// Cache entry will disappear automatically
```

### Use Case 3: Object Metadata

```javascript
// ✅ Attach metadata to objects without modifying them
const metadata = new WeakMap();

function addMetadata(obj, meta) {
  metadata.set(obj, meta);
}

function getMetadata(obj) {
  return metadata.get(obj);
}

class User {
  constructor(name) {
    this.name = name;
  }
}

const user1 = new User('Alice');
const user2 = new User('Bob');

// Attach metadata
addMetadata(user1, { role: 'admin', permissions: ['read', 'write'] });
addMetadata(user2, { role: 'user', permissions: ['read'] });

// Access metadata
console.log(getMetadata(user1).role);  // 'admin'
console.log(getMetadata(user2).role);  // 'user'

// Original objects unchanged
console.log(user1);  // { name: 'Alice' } - no metadata property
```

### Use Case 4: DOM Element Events

```javascript
// ✅ Avoid memory leaks with DOM listeners
const elementListeners = new WeakMap();

class EventManager {
  addEventListener(element, event, handler) {
    if (!elementListeners.has(element)) {
      elementListeners.set(element, new Map());
    }
    
    const listeners = elementListeners.get(element);
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    
    listeners.get(event).push(handler);
    element.addEventListener(event, handler);
  }
  
  removeAllListeners(element) {
    const listeners = elementListeners.get(element);
    if (!listeners) return;
    
    for (const [event, handlers] of listeners) {
      for (const handler of handlers) {
        element.removeEventListener(event, handler);
      }
    }
  }
}

const manager = new EventManager();
let button = document.querySelector('button');

// Add listeners
manager.addEventListener(button, 'click', () => console.log('Clicked!'));

// When element is removed from DOM:
manager.removeAllListeners(button);
button = null;  // Can be garbage collected
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use Map for collections with non-string keys
const cache = new Map();
const userObj = { id: 1 };
cache.set(userObj, 'data');  // Works perfectly

// ✅ Use WeakMap for private data
const privateData = new WeakMap();
class Secret {
  constructor(value) {
    privateData.set(this, value);
  }
}

// ✅ Check has() before get() when important
const map = new Map();
if (map.has('key')) {
  const value = map.get('key');
  // Process value
}

// ✅ Use for...of for simple iteration
for (const [key, value] of map) {
  console.log(key, value);
}

// ✅ Cache WeakMap references to keys
const weakMap = new WeakMap();
const key = { id: 1 };
weakMap.set(key, 'value');
console.log(weakMap.has(key));  // Works while key reference exists
```

### ❌ DON'T

```javascript
// ❌ Don't assume WeakMap keys persist
let key = { id: 1 };
const wm = new WeakMap();
wm.set(key, 'value');

key = null;
// WeakMap entry may disappear due to GC
console.log(wm.has(key));  // false (key is now null anyway)

// ❌ Don't try to iterate WeakMap
const wm = new WeakMap();
// for (const entry of wm) {}  // TypeError
// wm.forEach(...)  // TypeError

// ❌ Don't use primitives as WeakMap keys
const wm = new WeakMap();
// wm.set('string', 'value');  // TypeError
// wm.set(42, 'value');         // TypeError

// ❌ Don't rely on WeakMap size
const wm = new WeakMap();
console.log(wm.size);  // undefined

// ❌ Don't forget WeakMap use cases are specific
// For most collections, use Map instead
// WeakMap is for private data, caching, metadata
```

### Performance Considerations

```javascript
// ✅ WeakMap for large collections of objects
// GC will clean up unused entries automatically
const domNodeCache = new WeakMap();

// ✅ Map for smaller collections or frequent access
const userCache = new Map();

// ✅ Map when you need iteration
const settings = new Map([
  ['theme', 'dark'],
  ['language', 'en'],
  ['timezone', 'UTC']
]);

for (const [key, value] of settings) {
  console.log(`${key}: ${value}`);
}
```

---

## Summary

### Maps Key Points

| Feature | Details |
|---------|---------|
| **Key types** | Any type (string, number, object, etc.) |
| **Access** | .set(), .get(), .has(), .delete() |
| **Iteration** | for...of, .keys(), .values(), .entries(), .forEach() |
| **Size** | .size property available |
| **Use when** | Non-string keys, frequent add/delete, need .size |

### WeakMaps Key Points

| Feature | Details |
|---------|---------|
| **Key types** | Objects only |
| **Weak refs** | Keys don't prevent garbage collection |
| **Access** | .set(), .get(), .has(), .delete() |
| **Iteration** | ❌ Not iterable |
| **Size** | ❌ No .size property |
| **Use when** | Private data, metadata, caching, DOM associations |

### Quick Comparison

```javascript
// Map: Flexible key collection
const map = new Map();
map.set('string', 1);
map.set(42, 2);
map.set({}, 3);
console.log(map.size);  // 3
for (const [k, v] of map) {}  // Works

// WeakMap: Private/metadata storage
const wm = new WeakMap();
wm.set({}, 'metadata');
// Cannot iterate, size unknown
// Keys can be garbage collected
```

### Next Steps

- **Module 12.3** - Learn about Sets and their operations
- **Module 12.4** - Explore WeakSets for object tagging
- Combine Maps/WeakMaps with other data structures
- Use in real applications for caching and state management
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

## 12.3 Collections Summary

| Collection | Key Type | Iteration | Weak |
|------------|----------|-----------|------|
| `Map` | Any | Insertion order | No |
| `WeakMap` | Objects only | Not iterable | Yes |
| `Set` | Any (unique) | Insertion order | No |
| `WeakSet` | Objects only | Not iterable | Yes |

---

**End of Chapter 12: Collections**
