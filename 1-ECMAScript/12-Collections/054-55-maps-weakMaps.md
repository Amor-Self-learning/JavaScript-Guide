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

## Introduction to Maps

### What is a Map?

A **Map** is a collection of key-value pairs where keys can be of **any type** (not just strings or symbols like objects).

```javascript
// ✅ Map can have any key type
const map = new Map();
map.set('string key', 'value 1');
map.set(42, 'value 2');
map.set({ obj: true }, 'value 3');
map.set(Symbol('sym'), 'value 4');
map.set(true, 'value 5');

console.log(map.size);  // 5
```

### Map vs Object

| Aspect | Map | Object |
|--------|-----|--------|
| **Key types** | Any type | String or Symbol only |
| **Key order** | Insertion order | String keys sorted, then symbols |
| **Size property** | ✅ `.size` | ❌ No `.size` |
| **Iteration** | ✅ Iterable | ❌ Need Object.keys() |
| **Performance** | Fast for frequent adds/deletes | Slower for frequent changes |
| **Inheritance** | ❌ No prototype chain | ✅ Can inherit |

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