# 10 Symbols

Symbols are unique, immutable primitive values used as property keys. Well-known symbols customize object behavior.

---

## 10.1 Symbol Basics

**Symbols** are a primitive data type representing unique, immutable identifiers. They enable creating truly private object properties and special behavioral hooks.

---

### 10.1.1 Creating Symbols

**Symbols are created with the `Symbol()` function.** Each call creates a unique symbol.

```javascript
// Creating symbols
let sym1 = Symbol();
let sym2 = Symbol();

// Every symbol is unique
sym1 === sym2;                   // false
sym1 == sym2;                    // false

// Different from any other value
sym1 === Symbol();               // false (new symbol each time)

// Type checking
typeof Symbol();                 // 'symbol'
typeof sym1;                     // 'symbol'

// Cannot use new keyword
new Symbol();                    // TypeError: Symbol is not a constructor

// Symbols are immutable
const sym = Symbol();
sym.value = 'test';              // Allowed but useless (assigned to undefined)
sym;                             // Symbol() (unchanged)

// Cannot be coerced to other types
String(Symbol());                // TypeError: Cannot convert symbol to string
Number(Symbol());                // TypeError: Cannot convert symbol to number
Boolean(Symbol());               // true (only falsy values are false/0/''/null/undefined/NaN)

// Can convert to string explicitly with String()
let mySym = Symbol('description');
String(mySym);                   // 'Symbol(description)'

// Symbol.toString() works
mySym.toString();                // 'Symbol(description)'

// Cannot use in template literals without explicit conversion
`Symbol: ${String(mySym)}`;      // 'Symbol: Symbol(description)'
```

---

### 10.1.2 Symbol Description

**The optional description parameter** helps identify symbols during debugging.

```javascript
// With description
let user = Symbol('user');
let admin = Symbol('admin');

user.description;                // 'user'
admin.description;               // 'admin'

// Description doesn't affect uniqueness
Symbol('test') === Symbol('test');  // false (still unique)

// No description
let noDesc = Symbol();
noDesc.description;              // undefined

// Descriptions in output
user.toString();                 // 'Symbol(user)'
admin.toString();                // 'Symbol(admin)'

// Real-world use: object property keys
let permissions = {
  [user]: 'can read',
  [admin]: 'can modify',
  regular: 'can view'
};

// Symbol keys are hidden from normal enumeration
Object.keys(permissions);        // ['regular']
Object.getOwnPropertyNames(permissions);  // ['regular']
Object.getOwnPropertySymbols(permissions);  // [Symbol(user), Symbol(admin)]

// Accessing via symbols
permissions[user];               // 'can read'
permissions[admin];              // 'can modify'

// Descriptive symbols for clarity
const PRIVATE_DATA = Symbol('private data');
const HIDDEN_ID = Symbol('hidden id');

class User {
  constructor(name) {
    this.name = name;
    this[PRIVATE_DATA] = Math.random();
    this[HIDDEN_ID] = Date.now();
  }

  getPrivateData() {
    return this[PRIVATE_DATA];
  }
}

let user1 = new User('Alice');
user1.name;                      // 'Alice'
user1[PRIVATE_DATA];             // 0.123... (only accessible internally)

// Outside access to private data impossible without symbol reference
user1[Symbol('private data')];   // undefined (different symbol)

// Symbol description useful for debugging
console.log(PRIVATE_DATA);       // Symbol(private data)
console.log(HIDDEN_ID);          // Symbol(hidden id)
```

---

### 10.1.3 Global Symbol Registry

**`Symbol.for()` and `Symbol.keyFor()`** manage a global registry of symbols.

```javascript
// Symbol.for() - get or create global symbol
let globalSym1 = Symbol.for('app.id');
let globalSym2 = Symbol.for('app.id');

globalSym1 === globalSym2;       // true (same global symbol!)

// Different from Symbol()
let localSym = Symbol('app.id');
globalSym1 === localSym;         // false (different registries)

// Symbol.keyFor() - get key from global symbol
Symbol.keyFor(globalSym1);       // 'app.id'

// Works only with global symbols
Symbol.keyFor(localSym);         // undefined (not in global registry)

// Real-world: shared library symbols
const APP_ID = Symbol.for('myapp.id');
const SESSION_ID = Symbol.for('myapp.session');

// In different modules, access same symbols
// Module A
let obj = {
  [APP_ID]: 'app-123',
  [SESSION_ID]: 'sess-456'
};

// Module B (different file)
let appId = Symbol.for('myapp.id');
let sessionId = Symbol.for('myapp.session');

obj[appId];                      // 'app-123' (works - same global symbol)
obj[sessionId];                  // 'sess-456'

// Global registry persists across realms (frames, workers, etc.)
// In frame 1
window[Symbol.for('shared')] = 'data';

// In frame 2 (different browsing context)
Symbol.keyFor(Symbol.for('shared'));  // 'shared' (accessible)

// Namespace pattern with global symbols
const CONFIG = Symbol.for('config.settings');
const CACHE = Symbol.for('config.cache');
const LIMITS = Symbol.for('config.limits');

let config = {
  [CONFIG]: { theme: 'dark', lang: 'en' },
  [CACHE]: new Map(),
  [LIMITS]: { timeout: 5000 }
};

// Get all global symbols
function getAllGlobalSymbols() {
  let result = [];
  // No built-in way, must track manually
  return result;
}

// Local vs global distinction
const LOCAL = Symbol('local');
const GLOBAL = Symbol.for('global');

LOCAL.description;               // 'local'
GLOBAL.description;              // 'global'

Symbol.keyFor(LOCAL);             // undefined
Symbol.keyFor(GLOBAL);            // 'global'

// Practical: shared data between libraries
// Library A: creates config storage
const DATA_KEY = Symbol.for('__shared_data__');
window[DATA_KEY] = { users: new Map() };

// Library B: accesses same storage
const SHARED = Symbol.for('__shared_data__');
SHARED === DATA_KEY;             // true
window[SHARED].users.set('alice', { id: 1 });

// Multiple global symbol namespaces
const EXTERNAL_API = Symbol.for('api.external');
const INTERNAL_API = Symbol.for('api.internal');

let service = {
  [EXTERNAL_API]: { getUser: () => {} },
  [INTERNAL_API]: { validate: () => {} }
};

let external = Symbol.for('api.external');
service[external].getUser();     // works
```

---

### 10.1.4 Symbols as Property Keys

**Symbols work as object property keys**, enabling private properties.

```javascript
// Using symbols as keys
let sym1 = Symbol('key1');
let sym2 = Symbol('key2');

let obj = {
  [sym1]: 'value1',
  [sym2]: 'value2',
  regular: 'public'
};

// Accessing properties
obj[sym1];                       // 'value1'
obj[sym2];                       // 'value2'
obj.regular;                     // 'public'

// Symbols don't appear in for...in loop
for (let key in obj) {
  console.log(key);              // Only 'regular'
}

// Object.keys() doesn't include symbols
Object.keys(obj);                // ['regular']

// Object.getOwnPropertyNames() doesn't include symbols
Object.getOwnPropertyNames(obj); // ['regular']

// Object.getOwnPropertySymbols() gets symbol keys only
Object.getOwnPropertySymbols(obj);  // [Symbol(key1), Symbol(key2)]

// Get all properties (both types)
function getAllProperties(obj) {
  return [
    ...Object.keys(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];
}

getAllProperties(obj);           // ['regular', Symbol(key1), Symbol(key2)]

// Real-world: truly private properties
class BankAccount {
  constructor(balance) {
    this.accountNumber = '12345';
    this[BALANCE] = balance;  // Private
  }

  withdraw(amount) {
    if (this[BALANCE] >= amount) {
      this[BALANCE] -= amount;
      return true;
    }
    return false;
  }

  getBalance() {
    return this[BALANCE];     // Only via method
  }
}

const BALANCE = Symbol('balance');
let account = new BankAccount(1000);

account.accountNumber;           // '12345' (public)
account[BALANCE];                // 1000 (private, if you have the symbol)
account.getBalance();            // 1000 (through method)

// Outside code can't access without symbol
account.balance;                 // undefined
account.BALANCE;                 // undefined

// Combining symbols and regular properties
let settings = {
  theme: 'dark',                 // Public
  language: 'en',                // Public
  [Symbol('password')]: 'secret', // Private
  [Symbol('salt')]: 'abc123'     // Private
};

// Public API
Object.keys(settings);           // ['theme', 'language']

// Private accessible only internally
Object.getOwnPropertySymbols(settings);  // [Symbol(password), Symbol(salt)]

// Real-world: plugin system with private state
const STATE = Symbol('state');
const CONFIG = Symbol('config');

class Plugin {
  constructor(name) {
    this.name = name;
    this[STATE] = { enabled: false };
    this[CONFIG] = {};
  }

  enable() {
    this[STATE].enabled = true;
  }

  isEnabled() {
    return this[STATE].enabled;
  }
}

let plugin = new Plugin('Auth');
Object.keys(plugin);             // ['name'] - internal state hidden

// Comparing approaches
// Bad: underscore convention (not truly private)
class BadPrivacy {
  constructor() {
    this._private = 'hidden';     // Not actually private
  }
}

let bad = new BadPrivacy();
bad._private;                    // 'hidden' - accessible!

// Good: symbol-based (truly private)
class GoodPrivacy {
  constructor() {
    this[PRIVATE_KEY] = 'hidden'; // Only accessible with symbol
  }
}

const PRIVATE_KEY = Symbol('private');
let good = new GoodPrivacy();
good[PRIVATE_KEY];               // 'hidden' - need symbol to access
good.PRIVATE_KEY;                // undefined - can't access with property name

// Iteration over all properties preserves symbols
let full = {
  name: 'Alice',
  [Symbol('id')]: 123
};

// Using Object.getOwnPropertyDescriptors()
let descriptors = Object.getOwnPropertyDescriptors(full);
Object.keys(descriptors);        // ['name', Symbol(id)]

// Copying objects with symbols
function copyWithSymbols(obj) {
  let copy = {};
  [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)].forEach(key => {
    copy[key] = obj[key];
  });
  return copy;
}

let original = { name: 'Bob', [Symbol('id')]: 456 };
let copied = copyWithSymbols(original);
Object.getOwnPropertySymbols(copied).length; // 1 (symbol copied too)
```

---

### 10.1.5 Symbol Uniqueness and Identity

**Symbols are always unique**, making them perfect for identity-based operations.

```javascript
// Uniqueness guaranteed
let s1 = Symbol('test');
let s2 = Symbol('test');
s1 === s2;                       // false (even same description)

// Except for global symbols
let g1 = Symbol.for('global');
let g2 = Symbol.for('global');
g1 === g2;                       // true (same global symbol)

// Useful for switch statements
const PENDING = Symbol('pending');
const SUCCESS = Symbol('success');
const ERROR = Symbol('error');

function handleState(state) {
  switch(state) {
    case PENDING:
      return 'Loading...';
    case SUCCESS:
      return 'Done!';
    case ERROR:
      return 'Error!';
    default:
      return 'Unknown';
  }
}

handleState(PENDING);            // 'Loading...'

// Better than strings
const BAD_PENDING = 'pending';
const BAD_SUCCESS = 'success';

// Typos aren't caught with strings
handleState('PENDING');          // 'Unknown' (typo not caught)
handleState(PENDING);            // 'Loading...' (type safe)

// Unique identifiers for objects
let users = new Map();
let user1 = { name: 'Alice' };
let user2 = { name: 'Bob' };

let id1 = Symbol('user-1');
let id2 = Symbol('user-2');

users.set(id1, user1);
users.set(id2, user2);

users.get(id1);                  // { name: 'Alice' }
users.get(id2);                  // { name: 'Bob' }

// Can't accidentally overwrite
users.set(Symbol('user-1'), { name: 'Eve' });  // New symbol
users.get(id1);                  // Still { name: 'Alice' }

// Real-world: event emitter with internal events
const INTERNAL_INIT = Symbol('init');
const INTERNAL_CLEANUP = Symbol('cleanup');

class EventEmitter {
  constructor() {
    this.listeners = {};
    this[INTERNAL_INIT]();
  }

  on(event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(h => h(data));
    }
  }

  destroy() {
    this[INTERNAL_CLEANUP]();
  }

  [INTERNAL_INIT]() {
    // Setup only accessible internally
  }

  [INTERNAL_CLEANUP]() {
    // Cleanup only accessible internally
  }
}

// User can only use public API
let emitter = new EventEmitter();
emitter.on('message', (data) => console.log(data));
// Can't access emitter[INTERNAL_INIT] or emitter[INTERNAL_CLEANUP]

// Weak references with symbols
let weakMap = new WeakMap();
let obj = {};
let sym = Symbol('ref');

weakMap.set(obj, sym);           // Using symbol as value is OK
weakMap.get(obj) === sym;        // true

// Real-world: multiple interfaces on one object
const RENDERER = Symbol('renderer');
const VALIDATOR = Symbol('validator');
const FORMATTER = Symbol('formatter');

class DataProcessor {
  constructor() {
    this[RENDERER] = { render: () => {} };
    this[VALIDATOR] = { validate: () => {} };
    this[FORMATTER] = { format: () => {} };
  }

  // Public API only shows what's needed
  process(data) {
    // Uses internal interfaces
    if (!this[VALIDATOR].validate(data)) return;
    data = this[FORMATTER].format(data);
    return this[RENDERER].render(data);
  }
}

// Consumer doesn't know about internal interfaces
let processor = new DataProcessor();
processor.process(data);         // Works through public method
processor[RENDERER];             // undefined - needs symbol
```

---

## Summary: Symbol Basics

**Key Takeaways:**

1. **Symbols are primitive unique values** created with `Symbol()`
2. **Each symbol is unique** - `Symbol('x') !== Symbol('x')`
3. **Descriptions help debugging** but don't affect identity
4. **Global registry** via `Symbol.for(key)` for shared symbols
5. **Symbol properties are hidden** from `Object.keys()` and `for...in` loops
6. **Perfect for private properties** - truly inaccessible without symbol reference
7. **Symbol.keyFor()** retrieves key from global symbols only

**Common Use Cases:**
- Private object properties
- Hidden internal methods
- Unique event types
- Internal state storage
- Library-shared data via global registry
- Plugin systems with private state

**Key Methods:**
- `Symbol(description)` - Create unique symbol
- `Symbol.for(key)` - Get/create global symbol
- `Symbol.keyFor(symbol)` - Get key if global
- `Object.getOwnPropertySymbols()` - Get symbol keys
- `.description` - Get symbol description

**Best Practices:**
- Use symbols for truly private properties
- Use descriptive descriptions for debugging
- Use `Symbol.for()` for cross-module communication
- Consider symbols over underscore convention
- Document which symbols are private vs public
- Use global symbols carefully to avoid conflicts
## 10.2 Well-known Symbols

**Well-known symbols** are built-in symbols that customize how objects interact with language features and built-in operations. They enable protocol implementation.

---

### 10.2.1 Symbol.iterator

**Symbol.iterator** enables objects to work with `for...of` loops and spread operator.

```javascript
// Make object iterable
let iterable = {
  data: [1, 2, 3],
  
  [Symbol.iterator]() {
    let index = 0;
    let data = this.data;
    
    return {
      next: () => {
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

// Now works with for...of
for (let value of iterable) {
  console.log(value);            // 1, 2, 3
}

// Works with spread operator
[...iterable];                   // [1, 2, 3]

// Works with destructuring
let [first, ...rest] = iterable;
first;                           // 1
rest;                            // [2, 3]

// Check if object is iterable
typeof iterable[Symbol.iterator] === 'function';  // true

// Real-world: custom range iterator
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let current = this.start;
    let end = this.end;
    
    return {
      next: () => {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { done: true };
      }
    };
  }
}

let range = new Range(1, 5);
[...range];                      // [1, 2, 3, 4, 5]

for (let n of range) {
  console.log(n);                // 1, 2, 3, 4, 5
}

// Custom collection with Symbol.iterator
class LinkedList {
  constructor() {
    this.head = null;
  }

  append(value) {
    if (!this.head) {
      this.head = { value, next: null };
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = { value, next: null };
    }
  }

  [Symbol.iterator]() {
    let current = this.head;
    
    return {
      next: () => {
        if (current) {
          let value = current.value;
          current = current.next;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

let list = new LinkedList();
list.append(10);
list.append(20);
list.append(30);

for (let val of list) {
  console.log(val);              // 10, 20, 30
}

// Generator functions create iterators automatically
function* countdown(n) {
  while (n > 0) {
    yield n--;
  }
}

[...countdown(3)];               // [3, 2, 1]

for (let n of countdown(5)) {
  console.log(n);                // 5, 4, 3, 2, 1
}

// Symbol.iterator with generator
class Tree {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }

  *[Symbol.iterator]() {
    yield this.value;
    if (this.left) yield* this.left;
    if (this.right) yield* this.right;
  }
}

let tree = new Tree(1,
  new Tree(2, new Tree(4), new Tree(5)),
  new Tree(3, new Tree(6), new Tree(7))
);

[...tree];                       // [1, 2, 4, 5, 3, 6, 7] (in-order traversal)

// Built-in iterables
[...'hello'];                    // ['h', 'e', 'l', 'l', 'o'] (String iterable)
[...new Set([1, 2, 3])];         // [1, 2, 3] (Set iterable)
[...new Map([['a', 1]])];        // [['a', 1]] (Map iterable)
```

---

### 10.2.2 Symbol.asyncIterator

**Symbol.asyncIterator** enables async iteration with `for await...of` loops.

```javascript
// Async iterable
let asyncIterable = {
  data: ['a', 'b', 'c'],
  
  [Symbol.asyncIterator]() {
    let index = 0;
    let data = this.data;
    
    return {
      next: async () => {
        // Simulate async operation
        await new Promise(r => setTimeout(r, 100));
        
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

// Use with for await...of
async function iterate() {
  for await (let value of asyncIterable) {
    console.log(value);          // 'a', 'b', 'c' (with 100ms delays)
  }
}

iterate();

// Async generator (shorthand)
async function* asyncCounter(n) {
  for (let i = 0; i < n; i++) {
    await new Promise(r => setTimeout(r, 100));
    yield i;
  }
}

// Use async generator
async function count() {
  for await (let n of asyncCounter(3)) {
    console.log(n);              // 0, 1, 2
  }
}

// Real-world: async data fetching
class AsyncDataFetcher {
  constructor(urls) {
    this.urls = urls;
  }

  [Symbol.asyncIterator]() {
    let index = 0;
    let urls = this.urls;
    
    return {
      next: async () => {
        if (index < urls.length) {
          let url = urls[index++];
          let response = await fetch(url);
          let data = await response.json();
          return { value: data, done: false };
        }
        return { done: true };
      }
    };
  }
}

// Usage
async function fetchAll() {
  let fetcher = new AsyncDataFetcher([
    '/api/users',
    '/api/posts',
    '/api/comments'
  ]);

  for await (let data of fetcher) {
    console.log(data);            // Each API response
  }
}

// Combining async with sync iterables
async function* asyncMap(iterable, fn) {
  for (let item of iterable) {
    yield await fn(item);
  }
}

let numbers = [1, 2, 3];
async function double(n) {
  return n * 2;
}

for await (let n of asyncMap(numbers, double)) {
  console.log(n);                // 2, 4, 6
}

// Real-world: database cursor
class DatabaseCursor {
  constructor(query, pageSize = 10) {
    this.query = query;
    this.pageSize = pageSize;
    this.page = 0;
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next() {
    // Simulate database fetch
    let results = await this.fetchPage(this.page);
    
    if (results.length === 0) {
      return { done: true };
    }
    
    this.page++;
    return { value: results, done: false };
  }

  async fetchPage(pageNum) {
    // Simulate async database call
    await new Promise(r => setTimeout(r, 50));
    return this.query.slice(
      pageNum * this.pageSize,
      (pageNum + 1) * this.pageSize
    );
  }
}

// Usage
async function queryDatabase() {
  let cursor = new DatabaseCursor([1, 2, 3, 4, 5, 6, 7], 2);
  
  for await (let page of cursor) {
    console.log(page);            // [1, 2], [3, 4], [5, 6], [7]
  }
}
```

---

### 10.2.3 Symbol.toStringTag

**Symbol.toStringTag** customizes the output of `Object.prototype.toString()`.

```javascript
// Default toString
let obj = {};
Object.prototype.toString.call(obj);  // '[object Object]'

let arr = [];
Object.prototype.toString.call(arr);  // '[object Array]'

// Custom toStringTag
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

let instance = new MyClass();
Object.prototype.toString.call(instance);  // '[object MyClass]'

// Built-in classes have toStringTag
Object.prototype.toString.call(new Map());      // '[object Map]'
Object.prototype.toString.call(new Set());      // '[object Set]'
Object.prototype.toString.call(new Promise(() => {}));  // '[object Promise]'
Object.prototype.toString.call(new Date());     // '[object Date]'

// Real-world: custom error classes
class ValidationError {
  constructor(message) {
    this.message = message;
  }

  get [Symbol.toStringTag]() {
    return 'ValidationError';
  }
}

let error = new ValidationError('Invalid input');
String(error);                   // Using toString indirectly
Object.prototype.toString.call(error);  // '[object ValidationError]'

// Type checking
function isError(obj) {
  let tag = Object.prototype.toString.call(obj);
  return tag === '[object Error]' ||
         tag === '[object ValidationError]' ||
         tag === '[object TypeError]';
}

// Real-world: custom collection
class Stack {
  constructor() {
    this.items = [];
  }

  push(value) {
    this.items.push(value);
  }

  pop() {
    return this.items.pop();
  }

  get [Symbol.toStringTag]() {
    return 'Stack';
  }

  toString() {
    return `Stack(${this.items.length})`;
  }
}

let stack = new Stack();
stack.push(1);
stack.push(2);

Object.prototype.toString.call(stack);  // '[object Stack]'
String(stack);                   // 'Stack(2)'

// Useful for logging
console.log(`Processing: ${Object.prototype.toString.call(obj)}`);

// Factory pattern with type checking
function createParser(type) {
  class Parser {
    get [Symbol.toStringTag]() {
      return `${type}Parser`;
    }
  }
  return new Parser();
}

let jsonParser = createParser('JSON');
Object.prototype.toString.call(jsonParser);  // '[object JSONParser]'
```

---

### 10.2.4 Symbol.toPrimitive

**Symbol.toPrimitive** defines how objects convert to primitives in coercion.

```javascript
// Default behavior
let obj = {};
obj + 1;                         // '[object Object]1' (converts to string)
Number(obj);                     // NaN
Boolean(obj);                    // true

// Custom toPrimitive
let customObj = {
  [Symbol.toPrimitive](hint) {
    // hint: 'string', 'number', or 'default'
    switch(hint) {
      case 'number':
        return 42;
      case 'string':
        return 'MyObject';
      case 'default':
        return 'DEFAULT';
    }
  }
};

Number(customObj);               // 42
String(customObj);               // 'MyObject'
customObj + 0;                   // 42 (hint: 'default', but treated as number)
customObj + '';                  // 'DEFAULT' (hint: 'default')

// Real-world: custom numeric type
class Currency {
  constructor(amount, code = 'USD') {
    this.amount = amount;
    this.code = code;
  }

  [Symbol.toPrimitive](hint) {
    switch(hint) {
      case 'number':
        return this.amount;
      case 'string':
        return `${this.amount} ${this.code}`;
      case 'default':
        return this.amount;
    }
  }
}

let usd = new Currency(100, 'USD');

// Numeric operations
usd + 50;                        // 150
usd * 2;                         // 200

// String operations
String(usd);                     // '100 USD'
`Total: ${usd}`;                 // 'Total: 100 USD'

// Comparison
usd == 100;                      // true
usd < 200;                       // true

// Real-world: version comparison
class Version {
  constructor(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'string') {
      return `${this.major}.${this.minor}.${this.patch}`;
    }
    // Numeric: convert to single number for comparison
    return this.major * 10000 + this.minor * 100 + this.patch;
  }
}

let v1 = new Version(1, 2, 3);
let v2 = new Version(1, 3, 0);

String(v1);                      // '1.2.3'
v2 > v1;                         // true (1300 > 1203)

// Real-world: date comparison
class SmartDate {
  constructor(date) {
    this.date = new Date(date);
  }

  [Symbol.toPrimitive](hint) {
    switch(hint) {
      case 'number':
        return this.date.getTime();
      case 'string':
        return this.date.toISOString();
      case 'default':
        return this.date.getTime();
    }
  }
}

let d1 = new SmartDate('2024-01-01');
let d2 = new SmartDate('2024-12-31');

String(d1);                      // '2024-01-01T00:00:00.000Z'
d2 > d1;                         // true
d1 + 100000;                     // timestamp + 100000 ms

// Conditional behavior
class Flexible {
  constructor(value) {
    this.value = value;
  }

  [Symbol.toPrimitive](hint) {
    console.log(`Converting with hint: ${hint}`);
    if (hint === 'string') return String(this.value);
    if (hint === 'number') return Number(this.value);
    return this.value;
  }
}

let flex = new Flexible(42);
flex + 0;                        // Log: 'Converting with hint: default' -> 42
```

---

### 10.2.5 Symbol.hasInstance

**Symbol.hasInstance** customizes the `instanceof` operator.

```javascript
// Default instanceof
class Animal {}
let dog = new Animal();
dog instanceof Animal;           // true

// Custom hasInstance
class CustomClass {
  static [Symbol.hasInstance](obj) {
    return obj && typeof obj === 'object' && 'customProp' in obj;
  }
}

let obj1 = { customProp: true };
let obj2 = { other: true };

obj1 instanceof CustomClass;     // true
obj2 instanceof CustomClass;     // false

// Real-world: check for duck-typing
class Drawable {
  static [Symbol.hasInstance](obj) {
    return typeof obj.draw === 'function';
  }
}

let canvas = { draw: () => {} };
let notCanvas = {};

canvas instanceof Drawable;      // true
notCanvas instanceof Drawable;   // false

// Real-world: multiple interface support
class Serializable {
  static [Symbol.hasInstance](obj) {
    return typeof obj.toJSON === 'function' &&
           typeof obj.fromJSON === 'function';
  }
}

class User {
  toJSON() { return JSON.stringify(this); }
  fromJSON(str) { return JSON.parse(str); }
}

let user = new User();
user instanceof Serializable;    // true

// Type checking with custom logic
class Number {
  static [Symbol.hasInstance](obj) {
    return typeof obj === 'number' || obj instanceof global.Number;
  }
}

let num = 42;
let numObj = new Number(42);

num instanceof Number;           // true (custom)
numObj instanceof Number;        // true

// Practical: polymorphism checking
class Shape {
  static [Symbol.hasInstance](obj) {
    return obj && typeof obj.area === 'function' &&
           typeof obj.perimeter === 'function';
  }
}

class Circle {
  constructor(radius) {
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }

  perimeter() {
    return 2 * Math.PI * this.radius;
  }
}

let circle = new Circle(5);
circle instanceof Shape;         // true

// Validation with hasInstance
function validate(value, type) {
  return value instanceof type;
}

validate(canvas, Drawable);      // true
validate(user, Serializable);    // true
```

---

### 10.2.6 Symbol.species

**Symbol.species** controls which constructor is used for derived objects.

```javascript
// Array subclass creates Array instances
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;  // Use Array constructor
  }
}

let arr = new MyArray(1, 2, 3);
let mapped = arr.map(x => x * 2);

mapped instanceof MyArray;       // false
mapped instanceof Array;         // true

// Custom species
class CustomArray extends Array {
  static get [Symbol.species]() {
    return this;  // Use CustomArray constructor
  }
}

let custom = new CustomArray(1, 2, 3);
let customMapped = custom.map(x => x * 2);

customMapped instanceof CustomArray;  // true

// Real-world: specialized collection
class NumberArray extends Array {
  static get [Symbol.species]() {
    return Array;  // Results are regular arrays
  }

  sum() {
    return this.reduce((a, b) => a + b, 0);
  }

  average() {
    return this.sum() / this.length;
  }
}

let nums = new NumberArray(1, 2, 3);
nums.sum();                      // 6
nums.average();                  // 2

let filtered = nums.filter(x => x > 1);
filtered instanceof NumberArray; // false
filtered.sum();                  // 5 (Array doesn't have sum method)

// Real-world: custom Promise
class MyPromise extends Promise {
  static get [Symbol.species]() {
    return Promise;  // then() returns regular Promise
  }

  delay(ms) {
    return this.then(val => 
      new Promise(r => setTimeout(() => r(val), ms))
    );
  }
}

let p = MyPromise.resolve(42);
let delayed = p.delay(1000);

delayed instanceof MyPromise;    // false
delayed instanceof Promise;      // true

// Controlling derived object type
class TrackedArray extends Array {
  static get [Symbol.species]() {
    return this;  // Keep track of derived types
  }

  static create(items) {
    return new this(items);
  }
}

let tracked = new TrackedArray(1, 2, 3);
let sliced = tracked.slice(1);

sliced instanceof TrackedArray;  // true

// Performance optimization with species
class LazyArray extends Array {
  static get [Symbol.species]() {
    return Array;  // Return plain array (faster)
  }

  lazy() {
    // Custom lazy evaluation
  }
}

let lazy = new LazyArray(1, 2, 3);
let result = lazy.map(x => x * 2);  // Returns Array for performance

// Real-world: collection reducer
class Collection extends Array {
  static get [Symbol.species]() {
    return Array;
  }

  unique() {
    return [...new Set(this)];
  }

  groupBy(fn) {
    return this.reduce((acc, item) => {
      let key = fn(item);
      (acc[key] = acc[key] || []).push(item);
      return acc;
    }, {});
  }
}

let coll = new Collection(1, 2, 2, 3, 3, 3);
let unique = coll.map(x => x);  // Returns Array
```

---

### 10.2.7 String Pattern Symbols

**Symbol.match, Symbol.replace, Symbol.search, Symbol.split** customize regex behavior with strings.

```javascript
// Custom string matching
class CustomPattern {
  [Symbol.match](str) {
    // Return match result
    return [str.toUpperCase()];
  }
}

'hello'.match(new CustomPattern());  // ['HELLO']

// Symbol.replace
class Replacer {
  [Symbol.replace](str, replacement) {
    return str.split('').reverse().join('');
  }
}

'hello'.replace(new Replacer(), '');  // 'olleh'

// Symbol.search
class Searcher {
  [Symbol.search](str) {
    return str.indexOf('world');
  }
}

'hello world'.search(new Searcher());  // 6

// Symbol.split
class Splitter {
  [Symbol.split](str) {
    return str.split('');
  }
}

'hello'.split(new Splitter());   // ['h', 'e', 'l', 'l', 'o']

// Real-world: case-insensitive pattern
class CaseInsensitivePattern {
  constructor(text) {
    this.text = text.toLowerCase();
  }

  [Symbol.match](str) {
    let lowerStr = str.toLowerCase();
    let index = lowerStr.indexOf(this.text);
    if (index > -1) {
      return [str.substr(index, this.text.length)];
    }
    return null;
  }

  [Symbol.search](str) {
    return str.toLowerCase().indexOf(this.text);
  }

  [Symbol.replace](str, replacement) {
    let lowerStr = str.toLowerCase();
    let index = lowerStr.indexOf(this.text);
    if (index > -1) {
      return str.substr(0, index) + 
             replacement + 
             str.substr(index + this.text.length);
    }
    return str;
  }
}

let pattern = new CaseInsensitivePattern('hello');
'Hello World'.match(pattern);    // ['Hello']
'Hello World'.search(pattern);   // 0
'Hello World'.replace(pattern, 'Hi');  // 'Hi World'

// Symbol.matchAll (ES2020)
class MultiMatcher {
  constructor(pattern) {
    this.pattern = pattern;
  }

  [Symbol.matchAll](str) {
    let matches = [];
    for (let i = 0; i < str.length; i++) {
      if (str[i] === this.pattern) {
        matches.push({
          0: this.pattern,
          index: i,
          input: str
        });
      }
    }
    return matches[Symbol.iterator]();
  }
}

let matcher = new MultiMatcher('l');
for (let m of 'hello'.matchAll(matcher)) {
  console.log(m);                // Each 'l' match
}
```

---

### 10.2.8 Other Well-known Symbols

**Symbol.unscopables, Symbol.isConcatSpreadable, Symbol.for(), etc.**

```javascript
// Symbol.unscopables - exclude properties from with statement
let obj = {
  prop: 'value',
  [Symbol.unscopables]: {
    prop: true  // Exclude prop from with block
  }
};

with (obj) {
  console.log(prop);  // ReferenceError (excluded)
}

// Symbol.isConcatSpreadable - control array spreading
let arr1 = [1, 2, 3];
let arr2 = [4, 5];
arr2[Symbol.isConcatSpreadable] = false;

[].concat(arr1, arr2);           // [1, 2, 3, [4, 5]] (arr2 not spread)

arr2[Symbol.isConcatSpreadable] = true;
[].concat(arr1, arr2);           // [1, 2, 3, 4, 5] (arr2 spread)

// Real-world: string representation
class Vector {
  constructor(...components) {
    this.components = components;
  }

  [Symbol.isConcatSpreadable] = false;

  toString() {
    return `Vector(${this.components.join(', ')})`;
  }
}

let v = new Vector(1, 2, 3);
[1, 2].concat(v);                // [1, 2, Vector(1, 2, 3)]

// Symbol.for with realm safety
let key = Symbol.for('global.app');
let same = Symbol.for('global.app');

key === same;                    // true (cross-realm)
Symbol.keyFor(key);              // 'global.app'

// All well-known symbols as reference
console.log({
  iterator: Symbol.iterator,
  asyncIterator: Symbol.asyncIterator,
  match: Symbol.match,
  matchAll: Symbol.matchAll,
  replace: Symbol.replace,
  search: Symbol.search,
  species: Symbol.species,
  split: Symbol.split,
  toPrimitive: Symbol.toPrimitive,
  toStringTag: Symbol.toStringTag,
  unscopables: Symbol.unscopables,
  hasInstance: Symbol.hasInstance,
  isConcatSpreadable: Symbol.isConcatSpreadable
});

// Practical: implementing multiple protocols
class CustomCollection {
  constructor(items) {
    this.items = items;
  }

  // Iterator protocol
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  // String representation
  get [Symbol.toStringTag]() {
    return 'CustomCollection';
  }

  // Primitive conversion
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return this.items.length;
    }
    return `CustomCollection(${this.items.length})`;
  }

  // Array concatenation
  [Symbol.isConcatSpreadable] = true;

  // instanceof checking
  static [Symbol.hasInstance](obj) {
    return obj && Array.isArray(obj.items);
  }
}

let coll = new CustomCollection([1, 2, 3]);
[...coll];                       // [1, 2, 3]
String(coll);                    // 'CustomCollection(3)'
Number(coll);                    // 3
[].concat(coll);                 // [1, 2, 3] (spread)
coll instanceof CustomCollection;  // true
```

---

## Summary: Well-known Symbols - Chapter 10

**Complete Chapter 10: Symbols**

**Key Takeaways:**

1. **Symbols are unique primitives** - no two symbols are equal except global symbols
2. **Hidden properties** - symbol keys don't appear in for...in or Object.keys()
3. **Private state** - truly private without needing conventions like underscore
4. **Well-known symbols customize behavior** - iterator, toStringTag, toPrimitive, etc.
5. **Protocols enable duck typing** - objects don't need to inherit, just implement protocol
6. **Global registry** - Symbol.for()/keyFor() for cross-module communication

**All Symbol Methods:**

| Method | Purpose |
|--------|---------|
| `Symbol()` | Create unique symbol |
| `Symbol(description)` | Create with debug description |
| `Symbol.for(key)` | Get/create global symbol |
| `Symbol.keyFor(symbol)` | Get key if global |
| `.description` | Get symbol description |
| `Symbol.iterator` | Enable for...of |
| `Symbol.asyncIterator` | Enable for await...of |
| `Symbol.toStringTag` | Customize [object Type] |
| `Symbol.toPrimitive` | Control coercion |
| `Symbol.hasInstance` | Custom instanceof |
| `Symbol.species` | Control derived constructor |
| `Symbol.match/replace/search/split` | Customize regex |
| `Symbol.isConcatSpreadable` | Control array concat |
| `Symbol.unscopables` | Exclude from with() |

**Common Use Cases:**
- Creating truly private properties
- Implementing custom iterators
- Enabling for...of loops
- Defining internal methods
- Cross-module shared symbols
- Customizing built-in operations
- Protocol implementation (iterator, async iterator, etc.)
- Duck typing with well-known symbols

**Best Practices:**
- Use symbols for private state instead of conventions
- Use global symbols only for library APIs
- Document which symbols are public vs private
- Use well-known symbols to implement protocols
- Combine with classes for encapsulation
- Document symbol purposes with descriptions
- Consider user expectations for duck typing

## 10.3 Symbols Summary

| Well-Known Symbol | Purpose |
|------------------|---------|
| `Symbol.iterator` | Define iteration behavior |
| `Symbol.toStringTag` | Customize `Object.prototype.toString` |
| `Symbol.hasInstance` | Customize `instanceof` |
| `Symbol.toPrimitive` | Customize type conversion |
| `Symbol.species` | Constructor for derived objects |

---

**End of Chapter 10: Symbols**
