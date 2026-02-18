# 17 Memory Management

---

# JavaScript Deep Dive: Memory Management


## 17.1 Garbage Collection

JavaScript uses automatic memory management through garbage collection, which periodically frees memory occupied by objects that are no longer reachable.

### Mark-and-Sweep Algorithm

Mark-and-sweep is the fundamental garbage collection algorithm used by modern JavaScript engines.

**How Mark-and-Sweep Works:**

```javascript
// Conceptual explanation of mark-and-sweep

// 1. MARK PHASE: Start from roots (global objects, local variables)
const root1 = { name: 'Root Object' };

const obj1 = { data: 'Object 1' };
const obj2 = { data: 'Object 2' };
const obj3 = { data: 'Object 3' };

root1.child = obj1;  // obj1 is reachable from root
obj1.next = obj2;    // obj2 is reachable from obj1
// obj3 is NOT referenced by anything - unreachable

// 2. SWEEP PHASE: Collect unmarked objects
// obj3 will be garbage collected because it's unreachable

// MARK-AND-SWEEP VISUALIZATION:
/*
  Roots → root1 → obj1 → obj2
          (marked) (marked) (marked)
  
  obj3 (unmarked) → COLLECTED
*/
```

**Reachability Example:**

```javascript
// Objects are reachable when referenced
let user = {
  name: 'Alice',
  address: {
    city: 'New York'
  }
};

// Both user and user.address are reachable

let admin = user; // Another reference to the same object

user = null; // Remove one reference

// Object is still reachable through 'admin'
console.log(admin.name); // 'Alice'

admin = null; // Now no references exist

// Object becomes unreachable and will be garbage collected
```

**Circular References Handled:**

```javascript
// Mark-and-sweep handles circular references correctly

function createCircular() {
  const obj1 = { name: 'Object 1' };
  const obj2 = { name: 'Object 2' };
  
  obj1.ref = obj2;  // obj1 references obj2
  obj2.ref = obj1;  // obj2 references obj1 (circular)
  
  return obj1;
}

let circular = createCircular();

// Both objects are reachable through 'circular'
console.log(circular.name); // 'Object 1'

circular = null;

// Even though obj1 and obj2 reference each other,
// they're unreachable from any root and will be collected
```

**Island of Isolation:**

```javascript
// Objects that only reference each other but are isolated

function createIsland() {
  const island1 = { name: 'Island 1' };
  const island2 = { name: 'Island 2' };
  const island3 = { name: 'Island 3' };
  
  island1.next = island2;
  island2.next = island3;
  island3.next = island1; // Creates a cycle
  
  // These objects only reference each other
  // Once function returns, no external references exist
}

createIsland();

// The entire "island" of objects is unreachable
// All three objects will be garbage collected
```

**Mark-and-Sweep Phases in Detail:**

```javascript
// Conceptual breakdown of GC phases

class GarbageCollector {
  constructor() {
    this.heap = new Set();
    this.marked = new Set();
  }
  
  // Allocate object on heap
  allocate(obj) {
    this.heap.add(obj);
    return obj;
  }
  
  // Mark phase: mark all reachable objects
  mark(roots) {
    this.marked.clear();
    const queue = [...roots];
    
    while (queue.length > 0) {
      const obj = queue.shift();
      
      if (!this.marked.has(obj)) {
        this.marked.add(obj);
        
        // Add all referenced objects to queue
        for (let prop in obj) {
          if (typeof obj[prop] === 'object' && obj[prop] !== null) {
            queue.push(obj[prop]);
          }
        }
      }
    }
  }
  
  // Sweep phase: collect unmarked objects
  sweep() {
    const collected = [];
    
    for (let obj of this.heap) {
      if (!this.marked.has(obj)) {
        this.heap.delete(obj);
        collected.push(obj);
      }
    }
    
    return collected;
  }
  
  // Full garbage collection cycle
  collect(roots) {
    this.mark(roots);
    const collected = this.sweep();
    console.log(`Collected ${collected.length} objects`);
    return collected;
  }
}

// Simulation
const gc = new GarbageCollector();

const root = gc.allocate({ name: 'root' });
const child1 = gc.allocate({ name: 'child1' });
const child2 = gc.allocate({ name: 'child2' });
const orphan = gc.allocate({ name: 'orphan' });

root.child = child1;
child1.sibling = child2;
// orphan has no references from root

gc.collect([root]); // Collects 'orphan'
```

### Reference Counting

Reference counting is an older GC technique where each object maintains a count of references to it.

**How Reference Counting Works:**

```javascript
// Conceptual explanation (not how JS actually works)

class ReferenceCountedObject {
  constructor(name) {
    this.name = name;
    this.refCount = 0;
  }
  
  addRef() {
    this.refCount++;
    console.log(`${this.name} refCount: ${this.refCount}`);
  }
  
  release() {
    this.refCount--;
    console.log(`${this.name} refCount: ${this.refCount}`);
    
    if (this.refCount === 0) {
      console.log(`${this.name} collected`);
      // Object would be freed
    }
  }
}

// Usage
const obj = new ReferenceCountedObject('MyObject');
obj.addRef(); // refCount: 1

const ref1 = obj;
obj.addRef(); // refCount: 2

const ref2 = obj;
obj.addRef(); // refCount: 3

obj.release(); // refCount: 2
ref1.release(); // refCount: 1
ref2.release(); // refCount: 0 → collected
```

**Reference Counting Problem: Circular References:**

```javascript
// Reference counting fails with circular references

class Node {
  constructor(name) {
    this.name = name;
    this.refCount = 0;
    this.next = null;
  }
  
  setNext(node) {
    this.next = node;
    node.refCount++;
  }
}

// Create circular reference
const node1 = new Node('Node1');
const node2 = new Node('Node2');

node1.setNext(node2); // node2.refCount = 1
node2.setNext(node1); // node1.refCount = 1

// Even if no external references exist,
// refCount never reaches 0 due to circular references
// Objects would LEAK with pure reference counting

// This is why modern JS uses mark-and-sweep instead
```

**Why JavaScript Doesn't Use Reference Counting Alone:**

```javascript
// Demonstration of circular reference issue

function createMemoryLeak() {
  const obj1 = { name: 'Object 1' };
  const obj2 = { name: 'Object 2' };
  
  // Create circular reference
  obj1.ref = obj2;
  obj2.ref = obj1;
  
  // With reference counting alone:
  // obj1 has refCount = 1 (from obj2.ref)
  // obj2 has refCount = 1 (from obj1.ref)
  // Neither can be collected even though unreachable
  
  // With mark-and-sweep:
  // Both are unreachable from roots and will be collected
}

createMemoryLeak();
// Mark-and-sweep handles this correctly
```

### Generational Collection

Modern JavaScript engines use generational garbage collection, which optimizes collection based on object lifetime.

**Generational Hypothesis:**

```javascript
// Most objects die young
// Objects that survive become long-lived

// YOUNG GENERATION (frequently collected)
function createShortLived() {
  // These objects are created and destroyed quickly
  const temp1 = { data: new Array(1000).fill(0) };
  const temp2 = { data: 'temporary' };
  const result = temp1.data.length + temp2.data.length;
  return result;
  // temp1 and temp2 are immediately unreachable after return
}

// These objects are collected in the next minor GC
for (let i = 0; i < 1000; i++) {
  createShortLived();
}

// OLD GENERATION (infrequently collected)
const cache = new Map(); // Long-lived object

function addToCache(key, value) {
  cache.set(key, value);
  // Cache persists, promoted to old generation
}
```

**Generation Promotion:**

```javascript
// Objects that survive multiple young GC cycles
// are promoted to old generation

class LongLivedCache {
  constructor() {
    this.data = new Map();
    // This object will likely be promoted to old generation
  }
  
  set(key, value) {
    this.data.set(key, value);
  }
  
  get(key) {
    return this.data.get(key);
  }
}

const cache = new LongLivedCache();

// Short-lived objects in young generation
for (let i = 0; i < 10000; i++) {
  const temp = { id: i, data: 'temporary' };
  cache.set(temp.id, temp.data);
  // 'temp' object is short-lived
  // The data in cache is long-lived
}

// cache object is promoted to old generation
// Temporary objects are frequently collected in minor GC
```

**GC Types:**

```javascript
// MINOR GC (Scavenge)
// - Collects young generation only
// - Fast and frequent
// - Most objects collected here

function demonstrateMinorGC() {
  // Create many short-lived objects
  for (let i = 0; i < 100000; i++) {
    const temp = {
      id: i,
      data: new Array(100).fill(i),
      timestamp: Date.now()
    };
    
    // Process and discard
    const result = temp.data.reduce((a, b) => a + b, 0);
    
    // temp becomes unreachable immediately
    // Collected in next minor GC
  }
}

// MAJOR GC (Full GC)
// - Collects both young and old generations
// - Slower but less frequent
// - Only when old generation is full

const longLived = [];

function demonstrateMajorGC() {
  // Create objects that survive to old generation
  for (let i = 0; i < 10000; i++) {
    longLived.push({
      id: i,
      data: new Array(1000).fill(i)
    });
  }
  
  // These objects survive minor GCs
  // Eventually trigger major GC when old generation fills
}
```

### Memory Leaks (Common Causes)

Understanding common patterns that cause memory leaks in JavaScript.

**1. Accidental Global Variables:**

```javascript
// BAD: Creates global variable (memory leak)
function leakyFunction() {
  leakedVariable = 'I am global!'; // Missing 'var', 'let', or 'const'
  // This creates a global variable that persists
}

leakyFunction();
console.log(window.leakedVariable); // 'I am global!'

// GOOD: Use strict mode and proper declarations
'use strict';
function properFunction() {
  const properVariable = 'I am local';
  // Properly scoped, will be collected
}
```

**2. Forgotten Timers and Callbacks:**

```javascript
// BAD: Timer references keep objects alive
class LeakyWidget {
  constructor() {
    this.data = new Array(10000).fill('data');
    
    // This timer keeps the widget alive forever
    setInterval(() => {
      console.log(this.data.length);
    }, 1000);
  }
}

const widget = new LeakyWidget();
// Even if widget is no longer used, the timer keeps it alive

// GOOD: Clean up timers
class ProperWidget {
  constructor() {
    this.data = new Array(10000).fill('data');
    
    this.timer = setInterval(() => {
      console.log(this.data.length);
    }, 1000);
  }
  
  destroy() {
    clearInterval(this.timer);
    // Now widget can be garbage collected
  }
}

const properWidget = new ProperWidget();
// Later...
properWidget.destroy();
```

**3. Detached DOM Nodes:**

```javascript
// BAD: Keeping references to removed DOM nodes
const detachedNodes = [];

function createAndRemoveNode() {
  const div = document.createElement('div');
  div.className = 'my-div';
  div.innerHTML = 'Content';
  
  document.body.appendChild(div);
  
  // Store reference
  detachedNodes.push(div);
  
  // Remove from DOM
  document.body.removeChild(div);
  
  // div is detached but still referenced in array
  // Memory leak!
}

// GOOD: Don't keep references to removed nodes
function properNodeManagement() {
  const div = document.createElement('div');
  div.className = 'my-div';
  
  document.body.appendChild(div);
  
  // Use the node...
  
  document.body.removeChild(div);
  // No references kept, can be collected
}
```

**4. Closures Holding References:**

```javascript
// BAD: Closure inadvertently keeps large object alive
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  const smallData = 'small';
  
  // This closure keeps entire scope alive
  return function() {
    console.log(smallData); // Only uses smallData
    // But largeData is also kept in memory!
  };
}

const leak = createClosure();
// largeData is kept alive even though not used

// GOOD: Don't capture unnecessary variables
function properClosure() {
  const largeData = new Array(1000000).fill('data');
  const smallData = 'small';
  
  // Extract only what's needed
  const needed = smallData;
  
  return function() {
    console.log(needed);
    // largeData can be collected
  };
}

// BETTER: Use block scope
function bestClosure() {
  const smallData = 'small';
  
  {
    const largeData = new Array(1000000).fill('data');
    // Use largeData here if needed
  }
  // largeData out of scope
  
  return function() {
    console.log(smallData);
  };
}
```

**5. Event Listeners Not Removed:**

```javascript
// BAD: Event listeners keep objects alive
class LeakyComponent {
  constructor(element) {
    this.element = element;
    this.data = new Array(10000).fill('data');
    
    this.element.addEventListener('click', () => {
      console.log(this.data.length);
    });
    
    // If element is removed from DOM but listener not removed,
    // entire component is kept alive
  }
}

// GOOD: Remove event listeners
class ProperComponent {
  constructor(element) {
    this.element = element;
    this.data = new Array(10000).fill('data');
    
    this.handleClick = () => {
      console.log(this.data.length);
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

**6. Maps and Sets with Object Keys:**

```javascript
// BAD: Map with object keys prevents GC
const leakyMap = new Map();

function addToMap() {
  const key = { id: 1 };
  const value = new Array(10000).fill('data');
  
  leakyMap.set(key, value);
  
  // Even if key goes out of scope here,
  // it's kept alive by the Map
}

addToMap();
// key and value remain in memory

// GOOD: Use WeakMap for object keys
const properMap = new WeakMap();

function addToWeakMap() {
  const key = { id: 1 };
  const value = new Array(10000).fill('data');
  
  properMap.set(key, value);
  
  // When key is no longer referenced elsewhere,
  // entry is automatically removed from WeakMap
}

addToWeakMap();
// Entry can be garbage collected
```

**7. Circular References with DOM:**

```javascript
// BAD: Circular references between JS and DOM
function createCircularLeak() {
  const element = document.createElement('div');
  const data = {
    element: element,
    info: new Array(10000).fill('data')
  };
  
  // Circular reference
  element.myData = data;
  
  document.body.appendChild(element);
  
  // If element is removed but reference kept
  document.body.removeChild(element);
  
  return element;
  // element keeps data alive
  // data keeps element alive
}

// GOOD: Break circular references
function properManagement() {
  const element = document.createElement('div');
  const data = {
    info: new Array(10000).fill('data')
  };
  
  // Use WeakMap instead
  const elementData = new WeakMap();
  elementData.set(element, data);
  
  document.body.appendChild(element);
  
  // Later...
  document.body.removeChild(element);
  // No circular reference, can be collected
}
```

### Memory Profiling Tools

Using browser DevTools to find and fix memory leaks.

**Chrome DevTools Memory Profiler:**

```javascript
// Example: Finding memory leaks

class LeakyClass {
  constructor() {
    this.data = new Array(100000).fill('leak');
    
    // Leak: global reference
    window.leakyInstances = window.leakyInstances || [];
    window.leakyInstances.push(this);
  }
}

// Create many instances
for (let i = 0; i < 100; i++) {
  new LeakyClass();
}

// How to detect in Chrome DevTools:
// 1. Open DevTools → Memory tab
// 2. Take Heap Snapshot
// 3. Create more instances
// 4. Take another snapshot
// 5. Compare snapshots
// 6. Look for objects that increased
// 7. Check retention path to find leak source
```

**Memory Timeline Recording:**

```javascript
// Example: Detecting growing memory

function demonstrateMemoryGrowth() {
  const leaks = [];
  
  setInterval(() => {
    // Each interval adds to array, never released
    leaks.push(new Array(10000).fill('data'));
    
    console.log('Leaks array size:', leaks.length);
  }, 100);
}

// To profile:
// 1. Open DevTools → Performance tab
// 2. Check "Memory" checkbox
// 3. Click Record
// 4. Run demonstrateMemoryGrowth()
// 5. Let it run for 10-20 seconds
// 6. Stop recording
// 7. Look at Memory graph - should show steady increase
```

**Allocation Timeline:**

```javascript
// Example: Finding where allocations happen

class AllocationDemo {
  static instances = [];
  
  constructor() {
    this.largeArray = new Array(50000).fill({
      data: 'large object',
      timestamp: Date.now()
    });
    
    AllocationDemo.instances.push(this);
  }
  
  static createMany(count) {
    for (let i = 0; i < count; i++) {
      new AllocationDemo();
    }
  }
}

// To profile allocations:
// 1. DevTools → Memory → Allocation instrumentation timeline
// 2. Start recording
// 3. Run: AllocationDemo.createMany(100)
// 4. Stop recording
// 5. Examine which objects were allocated
// 6. Check retention paths
```

**Heap Snapshot Comparison:**

```javascript
class SnapshotDemo {
  constructor(id) {
    this.id = id;
    this.data = new Array(10000).fill(id);
  }
}

// Step 1: Take baseline snapshot
const retained = [];

// Step 2: Create objects
for (let i = 0; i < 50; i++) {
  retained.push(new SnapshotDemo(i));
}

// Step 3: Take second snapshot

// Step 4: Compare snapshots
// Look for SnapshotDemo instances
// Follow retention path: window → retained → SnapshotDemo

// To find leak:
// If you intended to remove these but they persist,
// the comparison shows they're still in 'retained' array
```

---

## 17.2 WeakRef

WeakRef allows holding a weak reference to an object, which doesn't prevent garbage collection.

### Creating Weak References

WeakRef creates references that don't prevent the referenced object from being collected.

**Basic WeakRef:**

```javascript
// Create object
let target = { name: 'Alice', data: new Array(10000).fill(0) };

// Create weak reference
const weakRef = new WeakRef(target);

// Can access object through deref()
console.log(weakRef.deref()?.name); // 'Alice'

// Remove strong reference
target = null;

// Object can now be garbage collected
// After GC, weakRef.deref() returns undefined
setTimeout(() => {
  const obj = weakRef.deref();
  if (obj) {
    console.log('Object still alive:', obj.name);
  } else {
    console.log('Object was collected');
  }
}, 1000);
```

**WeakRef vs Regular Reference:**

```javascript
// Regular reference prevents GC
let strongTarget = { data: 'strong' };
const strongRef = strongTarget;

strongTarget = null;
// Object still alive through strongRef

// Weak reference allows GC
let weakTarget = { data: 'weak' };
const weakReference = new WeakRef(weakTarget);

weakTarget = null;
// Object can be collected even though weakReference exists
```

### `deref()` Method

The deref() method returns the referenced object if it still exists, or undefined if it was collected.

**Using deref():**

```javascript
class Cache {
  constructor() {
    this.weakCache = new Map();
  }
  
  set(key, value) {
    // Store weak reference to value
    this.weakCache.set(key, new WeakRef(value));
  }
  
  get(key) {
    const weakRef = this.weakCache.get(key);
    if (!weakRef) return undefined;
    
    // Dereference - returns undefined if collected
    const value = weakRef.deref();
    
    if (!value) {
      // Object was collected, clean up entry
      this.weakCache.delete(key);
    }
    
    return value;
  }
  
  has(key) {
    const weakRef = this.weakCache.get(key);
    if (!weakRef) return false;
    
    const value = weakRef.deref();
    if (!value) {
      this.weakCache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Usage
const cache = new Cache();

let data = { id: 1, content: 'Important data' };
cache.set('myData', data);

console.log(cache.get('myData')); // { id: 1, content: 'Important data' }

data = null; // Remove strong reference

// After GC, cache.get('myData') returns undefined
```

**Checking if Object is Still Alive:**

```javascript
function createWeakReference(obj) {
  const ref = new WeakRef(obj);
  
  return {
    deref() {
      return ref.deref();
    },
    
    isAlive() {
      return ref.deref() !== undefined;
    },
    
    withValue(callback) {
      const value = ref.deref();
      if (value) {
        return callback(value);
      }
      return null;
    }
  };
}

let target = { name: 'Test', value: 42 };
const ref = createWeakReference(target);

console.log(ref.isAlive()); // true

ref.withValue(obj => {
  console.log('Object:', obj.name);
}); // "Object: Test"

target = null;

// After GC
setTimeout(() => {
  console.log(ref.isAlive()); // false (possibly)
  
  ref.withValue(obj => {
    console.log('This might not run');
  }); // Returns null
}, 1000);
```

### Use Cases

Practical applications of WeakRef.

**1. Caching Without Memory Leaks:**

```javascript
class ImageCache {
  constructor() {
    this.cache = new Map();
  }
  
  async loadImage(url) {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached) {
      const image = cached.deref();
      if (image) {
        console.log('Cache hit:', url);
        return image;
      }
      // Image was collected, remove entry
      this.cache.delete(url);
    }
    
    // Load image
    console.log('Loading:', url);
    const image = await this.fetchImage(url);
    
    // Store weak reference
    this.cache.set(url, new WeakRef(image));
    
    return image;
  }
  
  async fetchImage(url) {
    // Simulate image loading
    return {
      url,
      data: new ArrayBuffer(1024 * 1024), // 1MB
      timestamp: Date.now()
    };
  }
  
  cleanUp() {
    // Remove collected entries
    for (const [url, weakRef] of this.cache.entries()) {
      if (!weakRef.deref()) {
        this.cache.delete(url);
      }
    }
  }
}

// Usage
const imageCache = new ImageCache();

async function demo() {
  await imageCache.loadImage('/image1.jpg');
  await imageCache.loadImage('/image2.jpg');
  await imageCache.loadImage('/image1.jpg'); // Cache hit
  
  // Periodically clean up
  setInterval(() => imageCache.cleanUp(), 10000);
}
```

**2. Observer Pattern Without Memory Leaks:**

```javascript
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, listener, useWeakRef = false) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const entry = useWeakRef 
      ? { weak: new WeakRef(listener) }
      : { strong: listener };
    
    this.listeners.get(event).push(entry);
  }
  
  emit(event, ...args) {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    // Clean up collected listeners
    const active = eventListeners.filter(entry => {
      if (entry.weak) {
        const listener = entry.weak.deref();
        if (!listener) return false; // Collected
        listener(...args);
        return true;
      } else {
        entry.strong(...args);
        return true;
      }
    });
    
    this.listeners.set(event, active);
  }
  
  off(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    const filtered = eventListeners.filter(entry => {
      if (entry.weak) {
        const ref = entry.weak.deref();
        return ref !== listener;
      }
      return entry.strong !== listener;
    });
    
    this.listeners.set(event, filtered);
  }
}

// Usage
const emitter = new EventEmitter();

let handler = function(data) {
  console.log('Received:', data);
};

// Weak reference - allows handler to be collected
emitter.on('data', handler, true);

emitter.emit('data', 'Hello'); // "Received: Hello"

handler = null; // Remove strong reference

// After GC, handler is collected and won't be called
```

**3. Metadata Association:**

```javascript
class Metadata {
  constructor() {
    this.data = new Map();
  }
  
  set(object, metadata) {
    // Store weak reference to object
    const key = new WeakRef(object);
    this.data.set(key, {
      objectRef: key,
      metadata
    });
  }
  
  get(object) {
    for (const [key, value] of this.data.entries()) {
      const ref = value.objectRef.deref();
      if (ref === object) {
        return value.metadata;
      }
      if (!ref) {
        // Clean up collected object
        this.data.delete(key);
      }
    }
    return undefined;
  }
  
  cleanUp() {
    const toDelete = [];
    
    for (const [key, value] of this.data.entries()) {
      if (!value.objectRef.deref()) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.data.delete(key));
  }
}

// Usage
const metadata = new Metadata();

let obj1 = { id: 1 };
let obj2 = { id: 2 };

metadata.set(obj1, { type: 'user', role: 'admin' });
metadata.set(obj2, { type: 'user', role: 'guest' });

console.log(metadata.get(obj1)); // { type: 'user', role: 'admin' }

obj1 = null; // Remove reference

// After GC, metadata for obj1 is automatically cleaned
```

---

## 17.3 FinalizationRegistry

FinalizationRegistry allows registering cleanup callbacks that run when objects are garbage collected.

### Registering Cleanup Callbacks

FinalizationRegistry runs callbacks when registered objects are collected.

**Basic Usage:**

```javascript
// Create registry with cleanup callback
const registry = new FinalizationRegistry((heldValue) => {
  console.log('Object collected:', heldValue);
  // Perform cleanup
});

// Register object
let target = { name: 'Alice' };
registry.register(target, 'User Alice');

// Object is tracked
// When target is collected, callback runs with 'User Alice'

target = null;

// After GC, logs: "Object collected: User Alice"
```

**Cleanup Function:**

```javascript
const cleanupRegistry = new FinalizationRegistry((resourceId) => {
  console.log(`Cleaning up resource: ${resourceId}`);
  
  // Perform actual cleanup
  closeResource(resourceId);
});

function closeResource(id) {
  console.log(`Closing resource ${id}`);
  // Close file, database connection, etc.
}

function createResource(id) {
  const resource = {
    id,
    data: new ArrayBuffer(1024 * 1024)
  };
  
  // Register for cleanup
  cleanupRegistry.register(resource, id);
  
  return resource;
}

let res1 = createResource(1);
let res2 = createResource(2);

res1 = null; // Will trigger cleanup after GC
res2 = null; // Will trigger cleanup after GC
```

**Unregistering Objects:**

```javascript
const registry = new FinalizationRegistry((value) => {
  console.log('Cleanup:', value);
});

let target = { data: 'important' };
const token = {};

// Register with unregister token
registry.register(target, 'my-object', token);

// Decide not to clean up
registry.unregister(token);

target = null;
// Cleanup callback won't run because we unregistered
```

### Use Cases (Resource Management)

**1. File Handle Cleanup:**

```javascript
class FileHandle {
  static registry = new FinalizationRegistry((fd) => {
    console.log(`Closing file descriptor ${fd}`);
    // Actually close the file
    FileHandle.closeFile(fd);
  });
  
  constructor(filename) {
    this.fd = FileHandle.openFile(filename);
    this.filename = filename;
    
    // Register for automatic cleanup
    FileHandle.registry.register(this, this.fd, this);
  }
  
  close() {
    if (this.fd !== null) {
      FileHandle.closeFile(this.fd);
      // Unregister since we manually closed
      FileHandle.registry.unregister(this);
      this.fd = null;
    }
  }
  
  static openFile(filename) {
    console.log(`Opening file: ${filename}`);
    return Math.floor(Math.random() * 10000); // Simulated FD
  }
  
  static closeFile(fd) {
    console.log(`Actually closing FD: ${fd}`);
  }
}

// Usage
let file = new FileHandle('data.txt');

// Option 1: Manual close
file.close();

// Option 2: Let GC handle it
file = null;
// File will be automatically closed when collected
```

**2. Database Connection Pool:**

```javascript
class DatabaseConnection {
  static activeConnections = new Set();
  static registry = new FinalizationRegistry((connId) => {
    console.log(`Connection ${connId} was leaked, cleaning up`);
    DatabaseConnection.forceClose(connId);
  });
  
  constructor(id) {
    this.id = id;
    this.isOpen = true;
    
    DatabaseConnection.activeConnections.add(this.id);
    DatabaseConnection.registry.register(this, this.id, this);
  }
  
  close() {
    if (this.isOpen) {
      console.log(`Properly closing connection ${this.id}`);
      DatabaseConnection.activeConnections.delete(this.id);
      DatabaseConnection.registry.unregister(this);
      this.isOpen = false;
    }
  }
  
  static forceClose(connId) {
    if (DatabaseConnection.activeConnections.has(connId)) {
      console.log(`Force closing leaked connection ${connId}`);
      DatabaseConnection.activeConnections.delete(connId);
    }
  }
}

// Usage
let conn1 = new DatabaseConnection(1);
let conn2 = new DatabaseConnection(2);

conn1.close(); // Proper cleanup
conn2 = null;  // Leak - finalization registry will clean up
```

**3. Event Listener Cleanup:**

```javascript
class ManagedEventTarget {
  static registry = new FinalizationRegistry(({ target, type, listener }) => {
    console.log(`Cleaning up forgotten listener for ${type}`);
    target.removeEventListener(type, listener);
  });
  
  constructor(element) {
    this.element = element;
    this.listeners = [];
  }
  
  addEventListener(type, listener) {
    this.element.addEventListener(type, listener);
    
    this.listeners.push({ type, listener });
    
    // Register cleanup for this specific listener
    ManagedEventTarget.registry.register(
      this,
      { target: this.element, type, listener },
      { owner: this, type, listener }
    );
  }
  
  removeEventListener(type, listener) {
    this.element.removeEventListener(type, listener);
    
    const index = this.listeners.findIndex(
      l => l.type === type && l.listener === listener
    );
    
    if (index > -1) {
      this.listeners.splice(index, 1);
      // Unregister since we manually removed
      ManagedEventTarget.registry.unregister(
        { owner: this, type, listener }
      );
    }
  }
  
  destroy() {
    // Remove all listeners
    this.listeners.forEach(({ type, listener }) => {
      this.element.removeEventListener(type, listener);
      ManagedEventTarget.registry.unregister(
        { owner: this, type, listener }
      );
    });
    this.listeners = [];
  }
}

// Usage
const button = document.createElement('button');
let manager = new ManagedEventTarget(button);

manager.addEventListener('click', () => console.log('Clicked'));

// If we forget to call destroy()
manager = null;
// Registry ensures listeners are cleaned up
```

**4. Resource Tracking:**

```javascript
class ResourceTracker {
  static resources = new Map();
  static registry = new FinalizationRegistry((resourceId) => {
    console.log(`Resource ${resourceId} leaked!`);
    ResourceTracker.logLeak(resourceId);
  });
  
  static allocate(type, size) {
    const id = Math.random().toString(36).substr(2, 9);
    const resource = {
      id,
      type,
      size,
      allocated: Date.now()
    };
    
    ResourceTracker.resources.set(id, resource);
    ResourceTracker.registry.register(resource, id, resource);
    
    return resource;
  }
  
  static release(resource) {
    if (ResourceTracker.resources.has(resource.id)) {
      console.log(`Properly released: ${resource.id}`);
      ResourceTracker.resources.delete(resource.id);
      ResourceTracker.registry.unregister(resource);
    }
  }
  
  static logLeak(resourceId) {
    const resource = ResourceTracker.resources.get(resourceId);
    if (resource) {
      console.warn('Leaked resource:', {
        id: resourceId,
        type: resource.type,
        size: resource.size,
        age: Date.now() - resource.allocated
      });
      ResourceTracker.resources.delete(resourceId);
    }
  }
  
  static getActiveResources() {
    return Array.from(ResourceTracker.resources.values());
  }
}

// Usage
let resource1 = ResourceTracker.allocate('buffer', 1024);
let resource2 = ResourceTracker.allocate('handle', 64);

ResourceTracker.release(resource1); // Proper cleanup
resource2 = null; // Leak - will be logged when collected

console.log('Active:', ResourceTracker.getActiveResources());
```

---

## 17.4 Memory Optimization

Techniques and patterns for optimizing memory usage in JavaScript applications.

### Object Pooling

Reusing objects instead of creating and destroying them repeatedly.

**Basic Object Pool:**

```javascript
class ObjectPool {
  constructor(factory, resetFn, initialSize = 10) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = new Set();
    
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }
  
  acquire() {
    let obj;
    
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      // Pool exhausted, create new
      obj = this.factory();
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      
      // Reset object state
      this.resetFn(obj);
      
      this.available.push(obj);
    }
  }
  
  size() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

// Usage: Pooling expensive objects
const particlePool = new ObjectPool(
  // Factory
  () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    active: false
  }),
  // Reset function
  (particle) => {
    particle.x = 0;
    particle.y = 0;
    particle.vx = 0;
    particle.vy = 0;
    particle.life = 0;
    particle.active = false;
  },
  100 // Initial size
);

// Game loop
function update() {
  // Acquire particle
  const particle = particlePool.acquire();
  particle.x = Math.random() * 800;
  particle.y = Math.random() * 600;
  particle.life = 100;
  particle.active = true;
  
  // Use particle...
  
  // Release when done
  if (particle.life <= 0) {
    particlePool.release(particle);
  }
}

console.log(particlePool.size());
// { available: 100, inUse: 0, total: 100 }
```

**Array Buffer Pool:**

```javascript
class ArrayBufferPool {
  constructor(bufferSize) {
    this.bufferSize = bufferSize;
    this.available = [];
    this.inUse = new WeakSet();
  }
  
  acquire() {
    if (this.available.length > 0) {
      const buffer = this.available.pop();
      this.inUse.add(buffer);
      return buffer;
    }
    
    const buffer = new ArrayBuffer(this.bufferSize);
    this.inUse.add(buffer);
    return buffer;
  }
  
  release(buffer) {
    if (this.inUse.has(buffer)) {
      this.inUse.delete(buffer);
      // Clear buffer
      new Uint8Array(buffer).fill(0);
      this.available.push(buffer);
    }
  }
  
  clear() {
    this.available = [];
    // inUse will be cleared by GC
  }
}

// Usage
const bufferPool = new ArrayBufferPool(1024 * 1024); // 1MB buffers

function processData(data) {
  const buffer = bufferPool.acquire();
  const view = new Uint8Array(buffer);
  
  // Process data into buffer
  for (let i = 0; i < data.length; i++) {
    view[i] = data[i] * 2;
  }
  
  // Use buffer...
  
  // Release back to pool
  bufferPool.release(buffer);
}
```

### Avoiding Memory Leaks

Best practices and patterns to prevent memory leaks.

**1. Proper Event Listener Management:**

```javascript
class ComponentWithListeners {
  constructor(element) {
    this.element = element;
    this.listeners = new Map();
  }
  
  addEventListener(type, handler) {
    // Store reference to handler
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type).push(handler);
    this.element.addEventListener(type, handler);
  }
  
  removeEventListener(type, handler) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        this.element.removeEventListener(type, handler);
      }
    }
  }
  
  destroy() {
    // Remove all listeners
    for (const [type, handlers] of this.listeners) {
      handlers.forEach(handler => {
        this.element.removeEventListener(type, handler);
      });
    }
    
    this.listeners.clear();
    this.element = null;
  }
}

// Usage
const button = document.createElement('button');
const component = new ComponentWithListeners(button);

component.addEventListener('click', () => console.log('Clicked'));

// When done
component.destroy(); // Prevents memory leak
```

**2. Timer Cleanup:**

```javascript
class Timer {
  constructor() {
    this.timers = new Set();
  }
  
  setTimeout(callback, delay) {
    const id = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);
    
    this.timers.add(id);
    return id;
  }
  
  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.timers.add(id);
    return id;
  }
  
  clearTimeout(id) {
    clearTimeout(id);
    this.timers.delete(id);
  }
  
  clearInterval(id) {
    clearInterval(id);
    this.timers.delete(id);
  }
  
  clearAll() {
    for (const id of this.timers) {
      clearTimeout(id);
      clearInterval(id);
    }
    this.timers.clear();
  }
}

// Usage
const timer = new Timer();

timer.setTimeout(() => console.log('Hello'), 1000);
timer.setInterval(() => console.log('Tick'), 1000);

// When done
timer.clearAll(); // Prevents memory leak
```

**3. Avoiding Closure Leaks:**

```javascript
// BAD: Closure captures unnecessary large object
function createHandler() {
  const hugeArray = new Array(1000000).fill('data');
  const smallValue = 42;
  
  return function() {
    console.log(smallValue);
    // hugeArray is captured but not used - leak!
  };
}

// GOOD: Only capture what's needed
function createHandlerOptimized() {
  const hugeArray = new Array(1000000).fill('data');
  const smallValue = 42;
  
  // Process large data and discard
  const processedValue = hugeArray.length + smallValue;
  
  // Closure only captures processedValue
  return function() {
    console.log(processedValue);
    // hugeArray can be collected
  };
}

// BETTER: Use parameters
function createHandlerBest() {
  const hugeArray = new Array(1000000).fill('data');
  const result = processData(hugeArray);
  
  return createClosureWith(result);
}

function processData(array) {
  return array.length;
}

function createClosureWith(value) {
  return function() {
    console.log(value);
  };
}
```

### Closure Memory Implications

Understanding how closures affect memory and how to optimize them.

**Closure Scope Chain:**

```javascript
function createFunctions() {
  const shared = { count: 0 }; // Shared by all closures
  const large = new Array(100000).fill('data'); // Captured by all
  
  return {
    increment() {
      shared.count++;
      // Both 'shared' and 'large' are in scope
    },
    
    getCount() {
      return shared.count;
      // Both 'shared' and 'large' are in scope
    },
    
    // 'large' is never used but still kept in memory!
  };
}

// Memory impact:
// - 'shared' is used, needs to be kept
// - 'large' is NOT used but still kept because it's in scope

// OPTIMIZED VERSION
function createFunctionsOptimized() {
  const shared = { count: 0 };
  
  // Process large data and discard
  {
    const large = new Array(100000).fill('data');
    shared.initial = large.length;
  }
  // 'large' out of scope, can be collected
  
  return {
    increment() {
      shared.count++;
    },
    
    getCount() {
      return shared.count;
    }
  };
}
```

**Nested Closure Memory:**

```javascript
function outerFunction() {
  const outerData = new Array(50000).fill('outer');
  
  return function middleFunction() {
    const middleData = new Array(50000).fill('middle');
    
    return function innerFunction() {
      const innerData = new Array(50000).fill('inner');
      
      // This closure keeps ALL three arrays in memory
      return function() {
        console.log(
          outerData.length,
          middleData.length,
          innerData.length
        );
      };
    };
  };
}

// All three arrays are kept in memory
const fn = outerFunction()()()();

// OPTIMIZED: Only keep what's needed
function optimizedOuter() {
  const outerData = new Array(50000).fill('outer');
  const outerValue = outerData.length; // Extract value
  
  return function optimizedMiddle() {
    const middleData = new Array(50000).fill('middle');
    const middleValue = middleData.length; // Extract value
    
    return function optimizedInner() {
      const innerData = new Array(50000).fill('inner');
      const innerValue = innerData.length; // Extract value
      
      // Only keep the values, not the arrays
      return function() {
        console.log(outerValue, middleValue, innerValue);
      };
    };
  };
}

// Only three numbers kept in memory, arrays are collected
```

### Large Data Structure Strategies

Efficient handling of large data structures.

**1. Lazy Loading:**

```javascript
class LazyDataStructure {
  constructor(size) {
    this.size = size;
    this.chunks = new Map();
    this.chunkSize = 1000;
  }
  
  getChunkIndex(index) {
    return Math.floor(index / this.chunkSize);
  }
  
  loadChunk(chunkIndex) {
    if (!this.chunks.has(chunkIndex)) {
      console.log(`Loading chunk ${chunkIndex}`);
      
      const chunk = new Array(this.chunkSize);
      const startIndex = chunkIndex * this.chunkSize;
      
      for (let i = 0; i < this.chunkSize; i++) {
        chunk[i] = startIndex + i;
      }
      
      this.chunks.set(chunkIndex, chunk);
    }
    return this.chunks.get(chunkIndex);
  }
  
  get(index) {
    if (index < 0 || index >= this.size) {
      throw new RangeError('Index out of bounds');
    }
    
    const chunkIndex = this.getChunkIndex(index);
    const chunk = this.loadChunk(chunkIndex);
    const offsetInChunk = index % this.chunkSize;
    
    return chunk[offsetInChunk];
  }
  
  unloadChunk(chunkIndex) {
    this.chunks.delete(chunkIndex);
  }
  
  // LRU cache for chunks
  maintainSize(maxChunks) {
    if (this.chunks.size > maxChunks) {
      const firstKey = this.chunks.keys().next().value;
      this.chunks.delete(firstKey);
    }
  }
}

// Usage: Million element array with lazy loading
const largeArray = new LazyDataStructure(1000000);

console.log(largeArray.get(0)); // Loads chunk 0
console.log(largeArray.get(5000)); // Loads chunk 5
console.log(largeArray.get(10)); // Uses cached chunk 0
```

**2. Pagination:**

```javascript
class PaginatedData {
  constructor(fetchFn, pageSize = 100) {
    this.fetchFn = fetchFn;
    this.pageSize = pageSize;
    this.cache = new Map();
    this.cacheSize = 5; // Keep 5 pages max
  }
  
  async getPage(pageNumber) {
    if (this.cache.has(pageNumber)) {
      console.log(`Cache hit for page ${pageNumber}`);
      return this.cache.get(pageNumber);
    }
    
    console.log(`Fetching page ${pageNumber}`);
    const page = await this.fetchFn(pageNumber, this.pageSize);
    
    this.cache.set(pageNumber, page);
    this.maintainCacheSize();
    
    return page;
  }
  
  async getItem(index) {
    const pageNumber = Math.floor(index / this.pageSize);
    const page = await this.getPage(pageNumber);
    const indexInPage = index % this.pageSize;
    
    return page[indexInPage];
  }
  
  maintainCacheSize() {
    if (this.cache.size > this.cacheSize) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Usage
async function fetchData(page, size) {
  // Simulate API call
  return Array.from({ length: size }, (_, i) => ({
    id: page * size + i,
    data: `Item ${page * size + i}`
  }));
}

const paginatedData = new PaginatedData(fetchData, 50);

async function demo() {
  const item = await paginatedData.getItem(175);
  console.log(item); // Fetches page 3, returns item 25 of that page
}
```

**3. Virtual Scrolling:**

```javascript
class VirtualList {
  constructor(totalItems, itemHeight, visibleCount) {
    this.totalItems = totalItems;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.scrollPosition = 0;
    this.renderedItems = new Map();
  }
  
  getVisibleRange() {
    const startIndex = Math.floor(this.scrollPosition / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount,
      this.totalItems
    );
    
    return { startIndex, endIndex };
  }
  
  onScroll(scrollTop) {
    this.scrollPosition = scrollTop;
    const { startIndex, endIndex } = this.getVisibleRange();
    
    // Remove items outside visible range
    for (const [index] of this.renderedItems) {
      if (index < startIndex || index >= endIndex) {
        this.renderedItems.delete(index);
      }
    }
    
    // Add items in visible range
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.renderedItems.has(i)) {
        this.renderedItems.set(i, this.createItem(i));
      }
    }
    
    return Array.from(this.renderedItems.values());
  }
  
  createItem(index) {
    return {
      index,
      top: index * this.itemHeight,
      height: this.itemHeight,
      content: `Item ${index}`
    };
  }
  
  getRenderedCount() {
    return this.renderedItems.size;
  }
}

// Usage: 100,000 items, only render ~20 at a time
const virtualList = new VirtualList(100000, 50, 20);

// Simulate scroll
let scrollTop = 0;
setInterval(() => {
  scrollTop += 100;
  const visible = virtualList.onScroll(scrollTop);
  
  console.log(
    `Rendered: ${virtualList.getRenderedCount()} / ${virtualList.totalItems}`
  );
}, 100);
```

**4. Streaming Large Data:**

```javascript
class StreamProcessor {
  constructor(chunkSize = 1000) {
    this.chunkSize = chunkSize;
  }
  
  async *processLargeData(dataSource) {
    let offset = 0;
    
    while (true) {
      // Fetch chunk
      const chunk = await dataSource.fetch(offset, this.chunkSize);
      
      if (chunk.length === 0) break;
      
      // Process chunk
      const processed = chunk.map(item => this.transform(item));
      
      // Yield processed chunk
      yield processed;
      
      offset += chunk.length;
      
      // Original chunk can now be garbage collected
    }
  }
  
  transform(item) {
    // Transform logic
    return { ...item, processed: true };
  }
  
  async consumeAll(dataSource, onChunk) {
    for await (const chunk of this.processLargeData(dataSource)) {
      onChunk(chunk);
      // Each chunk is processed and released
    }
  }
}

// Usage
const processor = new StreamProcessor(100);

const dataSource = {
  data: Array.from({ length: 10000 }, (_, i) => ({ id: i })),
  
  async fetch(offset, limit) {
    return this.data.slice(offset, offset + limit);
  }
};

processor.consumeAll(dataSource, (chunk) => {
  console.log(`Processed chunk of ${chunk.length} items`);
  // Process chunk, then it can be collected
});
```

---

## Summary

This document covered Memory Management comprehensively:

- **Garbage Collection**: Mark-and-sweep algorithm, reference counting, generational collection, common memory leak patterns, and profiling tools
- **WeakRef**: Creating weak references, using deref(), and practical use cases for caching and observers
- **FinalizationRegistry**: Registering cleanup callbacks and resource management patterns
- **Memory Optimization**: Object pooling, avoiding leaks, understanding closure memory implications, and strategies for large data structures

Understanding memory management helps build performant JavaScript applications that use memory efficiently and avoid leaks.

---

**Related Topics to Explore Next:**

- Performance profiling and optimization
- Web Workers for parallel processing
- WebAssembly for memory-intensive operations
- IndexedDB for offline storage
- Service Workers and caching strategies
---

**End of Chapter 17**
