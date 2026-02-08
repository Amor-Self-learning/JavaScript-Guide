# Module Patterns 

## Table of Contents
1. [Introduction to Module Patterns](#introduction-to-module-patterns)
2. [Module Pattern (IIFE)](#module-pattern-iife)
3. [Revealing Module Pattern](#revealing-module-pattern)
4. [Singleton Pattern](#singleton-pattern)
5. [Namespace Pattern](#namespace-pattern)
6. [Comparison of Patterns](#comparison-of-patterns)
7. [Modern Approach](#modern-approach)
8. [Best Practices](#best-practices)
9. [Summary](#summary)

---

## Introduction to Module Patterns

### What are Module Patterns?

**Module Patterns** are design patterns that help organize code into reusable, maintainable modules before ES modules were standardized.

```javascript
// ❌ Global scope pollution
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }

// Multiple functions in global scope

// ✅ Module pattern
const calculator = (function() {
  return {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
  };
})();

// Only 'calculator' in global scope
```

### Why Module Patterns?

1. **Encapsulation** - Keep private data hidden
2. **Namespace** - Organize related functions
3. **Prevent conflicts** - Avoid global scope pollution
4. **Maintainability** - Clean, organized code

---

## Module Pattern (IIFE)

### Basic Module Pattern

**IIFE** = Immediately Invoked Function Expression

```javascript
// ✅ Basic structure
const calculator = (function() {
  // Private variables and functions
  let result = 0;

  function logOperation(op, a, b) {
    console.log(`${op}: ${a} ${op} ${b}`);
  }

  // Return public API
  return {
    add: (a, b) => {
      logOperation('+', a, b);
      return a + b;
    },
    subtract: (a, b) => {
      logOperation('-', a, b);
      return a - b;
    }
  };
})();

console.log(calculator.add(5, 3));       // 8 + private logOperation
console.log(calculator.subtract(5, 3));  // 2
```

### Private vs Public

```javascript
// ✅ Private (inside IIFE)
const userModule = (function() {
  // Private
  const password = 'secret';
  
  function validatePassword(pwd) {
    return pwd === password;
  }

  // Public
  return {
    login: (pwd) => {
      if (validatePassword(pwd)) {
        console.log('Login successful');
        return true;
      }
      return false;
    }
  };
})();

// Can access public method
userModule.login('secret');

// Cannot access private password or validatePassword
// userModule.password;           // undefined
// userModule.validatePassword(); // undefined
```

### Shared State with Module Pattern

```javascript
// ✅ Maintain state across calls
const counter = (function() {
  let count = 0;

  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count,
    reset: () => { count = 0; }
  };
})();

counter.increment();
counter.increment();
console.log(counter.get());  // 2

counter.decrement();
console.log(counter.get());  // 1

counter.reset();
console.log(counter.get());  // 0
```

### Module Parameters

```javascript
// ✅ Pass dependencies to module
const calculator = (function(Math) {
  return {
    sqrt: (n) => Math.sqrt(n),
    pow: (a, b) => Math.pow(a, b),
    random: () => Math.random()
  };
})(Math);  // Pass global Math as dependency

console.log(calculator.sqrt(16));  // 4
console.log(calculator.pow(2, 3)); // 8
```

### Advanced Module Pattern

```javascript
// ✅ Complex module with initialization
const userManager = (function() {
  // Private
  let users = [];
  let nextId = 1;

  function findUserById(id) {
    return users.find(u => u.id === id);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Public API
  return {
    addUser: (name, email) => {
      if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email' };
      }

      const user = { id: nextId++, name, email };
      users.push(user);
      return { success: true, user };
    },

    getUser: (id) => {
      return findUserById(id) || null;
    },

    getAllUsers: () => {
      return [...users];  // Return copy
    },

    deleteUser: (id) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return false;
      users.splice(index, 1);
      return true;
    }
  };
})();

userManager.addUser('Alice', 'alice@example.com');
userManager.addUser('Bob', 'bob@example.com');
console.log(userManager.getAllUsers());
```

---

## Revealing Module Pattern

### What is Revealing Module Pattern?

The **Revealing Module Pattern** reveals explicitly chosen variables and methods as public API while hiding the rest.

```javascript
// ✅ Revealing module pattern
const app = (function() {
  // Private
  let count = 0;
  const MAX = 100;

  const increment = () => {
    if (count < MAX) count++;
  };

  const decrement = () => {
    if (count > 0) count--;
  };

  const getCount = () => count;

  const reset = () => {
    count = 0;
  };

  // Reveal specific methods
  return {
    add: increment,
    subtract: decrement,
    display: getCount,
    clear: reset
  };
})();

app.add();
console.log(app.display());  // 1
app.clear();
console.log(app.display());  // 0
```

### Revealing with Aliases

```javascript
// ✅ Use public names that differ from private
const userService = (function() {
  // Private implementation
  const getAllUsers = () => {
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
  };

  const getUserById = (id) => {
    const users = getAllUsers();
    return users.find(u => u.id === id);
  };

  const updateUser = (id, data) => {
    // Implementation
    console.log(`Updated user ${id}`);
  };

  // Public API with revealing
  return {
    list: getAllUsers,        // Public: list
    find: getUserById,        // Public: find
    update: updateUser        // Public: update
  };
})();

console.log(userService.list());
console.log(userService.find(1));
```

### Revealing with Dependencies

```javascript
// ✅ Reveal methods that depend on private state
const cache = (function() {
  // Private storage
  const store = {};
  const hits = { count: 0 };
  const misses = { count: 0 };

  const set = (key, value) => {
    store[key] = value;
  };

  const get = (key) => {
    if (key in store) {
      hits.count++;
      return store[key];
    }
    misses.count++;
    return undefined;
  };

  const clear = () => {
    Object.keys(store).forEach(key => delete store[key]);
    hits.count = 0;
    misses.count = 0;
  };

  const stats = () => ({
    hits: hits.count,
    misses: misses.count,
    hitRate: hits.count / (hits.count + misses.count)
  });

  // Reveal public API
  return { set, get, clear, stats };
})();

cache.set('user1', { name: 'Alice' });
console.log(cache.get('user1'));  // { name: 'Alice' }
console.log(cache.get('user2'));  // undefined
console.log(cache.stats());       // { hits: 1, misses: 1, hitRate: 0.5 }
```

---

## Singleton Pattern

### What is Singleton Pattern?

**Singleton** ensures only one instance of an object exists throughout the application.

```javascript
// ✅ Basic singleton
const database = (function() {
  let instance = null;

  function createInstance() {
    return {
      query: (sql) => console.log(`Executing: ${sql}`),
      close: () => console.log('Connection closed')
    };
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const db1 = database.getInstance();
const db2 = database.getInstance();

console.log(db1 === db2);  // true (same instance)
```

### Lazy Initialization

```javascript
// ✅ Lazy singleton - create only when first needed
const appConfig = (() => {
  let instance = null;

  function createConfig() {
    console.log('Initializing config...');
    return {
      apiUrl: 'https://api.example.com',
      debug: true,
      timeout: 5000
    };
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createConfig();
      }
      return instance;
    }
  };
})();

console.log('App started');
// Config not created yet

const config = appConfig.getInstance();
// Now: Initializing config...

const config2 = appConfig.getInstance();
console.log(config === config2);  // true
```

### Singleton with Methods

```javascript
// ✅ Singleton with instance methods
const eventBus = (() => {
  let instance = null;

  function createBus() {
    const listeners = {};

    return {
      on: (event, callback) => {
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
      },

      emit: (event, data) => {
        if (listeners[event]) {
          listeners[event].forEach(cb => cb(data));
        }
      },

      off: (event, callback) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(
            cb => cb !== callback
          );
        }
      }
    };
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createBus();
      }
      return instance;
    }
  };
})();

const bus = eventBus.getInstance();

bus.on('user-login', (user) => {
  console.log(`User logged in: ${user}`);
});

bus.emit('user-login', 'Alice');
```

### Singleton Counter

```javascript
// ✅ Practical singleton - application logger
const logger = (() => {
  let instance = null;

  function createLogger() {
    const logs = [];
    let level = 'INFO';

    return {
      setLevel: (newLevel) => {
        level = newLevel;
      },

      info: (message) => {
        logs.push({ level: 'INFO', message, time: new Date() });
        console.log(`[INFO] ${message}`);
      },

      error: (message) => {
        logs.push({ level: 'ERROR', message, time: new Date() });
        console.error(`[ERROR] ${message}`);
      },

      debug: (message) => {
        if (level === 'DEBUG') {
          logs.push({ level: 'DEBUG', message, time: new Date() });
          console.log(`[DEBUG] ${message}`);
        }
      },

      getLogs: () => [...logs]
    };
  }

  return {
    getInstance: () => {
      if (!instance) {
        instance = createLogger();
      }
      return instance;
    }
  };
})();

const log = logger.getInstance();
log.info('App started');
log.error('Connection failed');
console.log(log.getLogs());
```

---

## Namespace Pattern

### Basic Namespace

```javascript
// ✅ Create namespace to organize code
const MyApp = {
  utils: {
    formatDate: (date) => date.toLocaleDateString(),
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1)
  },

  models: {
    User: function(name, email) {
      this.name = name;
      this.email = email;
    },
    Post: function(title, content) {
      this.title = title;
      this.content = content;
    }
  }
};

// Usage
console.log(MyApp.utils.formatDate(new Date()));
const user = new MyApp.models.User('Alice', 'alice@example.com');
```

### Nested Namespaces

```javascript
// ✅ Hierarchical namespace
const App = {
  admin: {
    dashboard: {
      widgets: {
        chart: () => console.log('Rendering chart'),
        table: () => console.log('Rendering table')
      },
      settings: {
        theme: 'dark',
        language: 'en'
      }
    }
  },

  user: {
    profile: {
      view: () => console.log('Viewing profile'),
      edit: () => console.log('Editing profile')
    }
  }
};

App.admin.dashboard.widgets.chart();
App.user.profile.view();
```

### Namespace Extension

```javascript
// ✅ Extend namespace dynamically
const Library = {};

// Module 1
Library.math = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// Module 2
Library.string = {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  reverse: (str) => str.split('').reverse().join('')
};

// Module 3 extending math
Library.math.multiply = (a, b) => a * b;
Library.math.divide = (a, b) => a / b;

console.log(Library.math.add(5, 3));
console.log(Library.string.capitalize('hello'));
```

---

## Comparison of Patterns

### Feature Comparison

| Feature | Module Pattern | Revealing | Singleton | Namespace |
|---------|-----------------|-----------|-----------|-----------|
| **Privacy** | ✅ Full | ✅ Full | ✅ Full | ❌ Partial |
| **Single instance** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **Organization** | ✅ Good | ✅ Good | ✅ Good | ✅ Excellent |
| **Flexibility** | ✅ High | ✅ High | ❌ Limited | ✅ Very High |
| **Complexity** | ⭐ 2 | ⭐ 2 | ⭐ 3 | ⭐ 2 |

### When to Use Each

```javascript
// ✅ Module Pattern: Multiple independent instances
const user1 = (function() {
  let name = 'Alice';
  return { getName: () => name };
})();

const user2 = (function() {
  let name = 'Bob';
  return { getName: () => name };
})();

// ✅ Revealing: Clear public API, complex logic
const service = (function() {
  const internalState = [];
  const internalCalc = () => { };
  
  return {
    publicMethod: internalCalc,
    getData: () => internalState
  };
})();

// ✅ Singleton: Only one instance needed (logger, config)
const config = (() => {
  let instance = null;
  // ...
  return { getInstance: () => { /* ... */ } };
})();

// ✅ Namespace: Organize many modules
const API = {
  users: { /* ... */ },
  posts: { /* ... */ },
  comments: { /* ... */ }
};
```

---

## Modern Approach

### Why Modern ES Modules are Better

```javascript
// ❌ Old module pattern (complex)
const calculator = (function() {
  return {
    add: (a, b) => a + b
  };
})();

// ✅ Modern ES6+ approach (simple)
export function add(a, b) {
  return a + b;
}

// ✅ Or with privacy
const privateData = 'secret';

export const publicAPI = {
  method: () => { /* uses privateData */ }
};
```

### Migration Path

```javascript
// Legacy: Module pattern with IIFE
const oldModule = (function() {
  let private = 0;
  return {
    increment: () => ++private,
    get: () => private
  };
})();

// Modern: ES module
// counter.js
let private = 0;

export function increment() {
  return ++private;
}

export function get() {
  return private;
}

// app.js
import { increment, get } from './counter.js';
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use ES modules (modern approach)
export function helper() { }
import { helper } from './module.js';

// ✅ Encapsulate private data with IIFE if needed
const module = (function() {
  const privateVar = 'private';
  return { publicMethod: () => { } };
})();

// ✅ Use singleton for shared instances
const logger = (() => {
  let instance = null;
  return {
    getInstance: () => {
      if (!instance) instance = createLogger();
      return instance;
    }
  };
})();

// ✅ Use namespaces to organize (if not using modules)
const App = {
  admin: { /* admin module */ },
  user: { /* user module */ }
};

// ✅ Be consistent with naming
const MyModule = { /* ... */ };  // PascalCase for objects
```

### ❌ DON'T

```javascript
// ❌ Don't pollute global scope
function helper() { }  // Avoid if possible

// ❌ Don't use module patterns when ES modules work
const oldStyle = (function() { return { }; })();

// ❌ Don't create complex nested namespaces
// const x = { a: { b: { c: { d: { } } } } };

// ❌ Don't forget to reveal public API
const bad = (function() {
  const public = () => { };
  const private = () => { };
  // No return statement = nothing exposed!
})();

// ❌ Don't mix patterns inconsistently
const part1 = { };  // Namespace
const part2 = (function() { return { }; })();  // Module
const part3 = (() => {
  let i = null;
  return { getInstance: () => i };  // Singleton
})();
```

---

## Summary

### Module Pattern Overview

| Pattern | Structure | Use Case | Complexity |
|---------|-----------|----------|-----------|
| **IIFE Module** | `(function() { return {}; })()` | Encapsulation | Low |
| **Revealing** | IIFE with explicit reveal | Clean API | Low |
| **Singleton** | Lazy instance creation | Single instance | Medium |
| **Namespace** | Nested objects | Organization | Low |

### Quick Reference

```javascript
// Module Pattern
const module = (function() {
  const private = 'data';
  return { public: () => { } };
})();

// Revealing Module
const module = (function() {
  const _private = () => { };
  const public = () => _private();
  return { public };
})();

// Singleton
const singleton = (() => {
  let instance;
  return {
    getInstance: () => {
      if (!instance) instance = { };
      return instance;
    }
  };
})();

// Namespace
const app = {
  module1: { /* ... */ },
  module2: { /* ... */ }
};
```

### Modern Alternative

```javascript
// ES Module (preferred)
// math.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// app.js
import { add, subtract } from './math.js';
```

### When to Use Patterns

- **Modern projects**: Use ES modules
- **Legacy code**: Understand these patterns
- **Browser compatibility**: May need module patterns
- **Private data**: ES modules + closures
- **Single instance**: Singleton pattern
- **Code organization**: Namespace or ES modules

### Next Steps

- Master ES modules (modern standard)
- Understand legacy patterns for existing code
- Combine patterns as needed
- Build scalable, organized applications