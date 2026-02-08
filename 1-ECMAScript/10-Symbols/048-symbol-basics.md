# 10.1 Symbol Basics

**Symbols** are a primitive data type representing unique, immutable identifiers. They enable creating truly private object properties and special behavioral hooks.

---

## 10.1.1 Creating Symbols

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

## 10.1.2 Symbol Description

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

## 10.1.3 Global Symbol Registry

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

## 10.1.4 Symbols as Property Keys

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

## 10.1.5 Symbol Uniqueness and Identity

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