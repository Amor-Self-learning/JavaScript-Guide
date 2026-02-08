# CommonJS (Node.js) 

## Table of Contents
1. [Introduction to CommonJS](#introduction-to-commonjs)
2. [require() Function](#require-function)
3. [module.exports and exports](#moduleexports-and-exports)
4. [Module Caching](#module-caching)
5. [Circular Dependencies](#circular-dependencies)
6. [ESM vs CommonJS](#esm-vs-commonjs)
7. [ESM/CommonJS Interoperability](#esmcommonjs-interoperability)
8. [Best Practices](#best-practices)
9. [Summary](#summary)

---

## Introduction to CommonJS

### What is CommonJS?

**CommonJS** is the module system used by Node.js. It uses `require()` to load modules and `module.exports` to export them.

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract
};

// app.js
const math = require('./math');

console.log(math.add(5, 3));       // 8
console.log(math.subtract(5, 3));  // 2
```

### Why CommonJS?

1. **Built-in to Node.js** - No build step needed
2. **Synchronous** - Simple behavior
3. **Widely used** - Legacy and npm packages
4. **Dynamic** - Load modules conditionally

### Module Scope

```javascript
// Each file is a separate module with its own scope
const privateVar = 'private';
let counter = 0;

module.exports = {
  increment: () => ++counter,
  getCounter: () => counter
};

// privateVar is not accessible from outside
```

---

## require() Function

### Basic require()

```javascript
// ✅ Require local module
const math = require('./math.js');
const math2 = require('./math');  // .js extension optional

// ✅ Require npm package
const express = require('express');
const _ = require('lodash');

// ✅ Require built-in Node.js module
const fs = require('fs');
const path = require('path');

// ✅ Require from node_modules (without ./  or ../)
const package = require('package-name');
```

### Destructuring Imports

```javascript
// ✅ Destructure specific exports
const { add, subtract } = require('./math.js');

console.log(add(5, 3));
console.log(subtract(5, 3));

// ✅ Destructure with renaming
const { add: addition, subtract: minus } = require('./math.js');

// ✅ Get everything then destructure
const math = require('./math.js');
const { add, subtract } = math;
```

### Module Paths

```javascript
// ✅ Relative paths
const utils = require('./utils.js');           // Same directory
const config = require('../config.js');        // Parent directory
const helper = require('./lib/helper.js');     // Subdirectory

// ✅ Package paths (installed npm)
const react = require('react');
const lodash = require('lodash');

// ✅ Absolute paths
const fs = require('fs');
const path = require('path');
const absolutePath = require('/absolute/path/module.js');

// ✅ Built-in modules
const http = require('http');
const util = require('util');
```

### Conditional Imports

```javascript
// ✅ Load module conditionally
let db;
if (process.env.NODE_ENV === 'production') {
  db = require('./db/postgres.js');
} else {
  db = require('./db/sqlite.js');
}

// ✅ Try-catch for optional dependencies
let optional;
try {
  optional = require('optional-package');
} catch (error) {
  optional = null;
}

if (optional) {
  optional.init();
}
```

---

## module.exports and exports

### module.exports

```javascript
// ✅ Export object with properties
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  PI: 3.14159
};

// ✅ Export function
module.exports = function greet(name) {
  return `Hello, ${name}!`;
};

// ✅ Export class
module.exports = class Calculator {
  add(a, b) {
    return a + b;
  }
};

// ✅ Export multiple values
const config = { debug: true };
const version = '1.0.0';

module.exports = {
  config,
  version
};

// ✅ Export and extend
module.exports = {
  name: 'MyModule'
};

module.exports.additional = 'value';
```

### exports Shorthand

```javascript
// ✅ exports is shorthand for module.exports
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// ✅ Equivalent to:
module.exports.add = (a, b) => a + b;
module.exports.subtract = (a, b) => a - b;

// ❌ BUT: Don't reassign exports
// This breaks the connection to module.exports:
// exports = { add, subtract };  // ✗ Won't work

// ✅ Use module.exports instead:
module.exports = { add, subtract };  // ✓ Works
```

### When to Use Each

```javascript
// ✅ Use exports for adding properties
exports.helper1 = () => { };
exports.helper2 = () => { };
exports.config = { };

// ✅ Use module.exports to replace everything
module.exports = class MyClass { };

module.exports = function main() { };

module.exports = {
  setup: () => { },
  teardown: () => { }
};
```

---

## Module Caching

### How Module Caching Works

```javascript
// ✅ Modules are cached after first require
const math1 = require('./math.js');
const math2 = require('./math.js');

console.log(math1 === math2);  // true (same object reference)

// Module code executes only once
```

### Cache Behavior

```javascript
// module.js
console.log('Module loaded');

let counter = 0;

exports.increment = () => ++counter;
exports.getCounter = () => counter;

// app.js
const mod1 = require('./module.js');  // Logs: "Module loaded"

mod1.increment();
console.log(mod1.getCounter());       // 1

const mod2 = require('./module.js');  // No log (cached)

mod2.increment();
console.log(mod2.getCounter());       // 2 (shared state)

console.log(mod1 === mod2);           // true (same module)
```

### Clearing Cache

```javascript
// ✅ Delete module from cache
delete require.cache[require.resolve('./module.js')];

// Next require will re-execute the module
const mod = require('./module.js');  // Executes again

// ✅ Clear all cache
Object.keys(require.cache).forEach(key => {
  delete require.cache[key];
});

// ⚠️ Generally not recommended in production
```

### Cache ID

```javascript
// ✅ Get module cache ID
const moduleId = require.resolve('./math.js');
console.log(moduleId);  // /full/path/to/math.js

// Module cache uses full paths as keys
console.log(require.cache[moduleId]);  // Module object
```

---

## Circular Dependencies

### The Problem

```javascript
// ❌ Circular dependency example
// a.js
const b = require('./b.js');

console.log('a: b.value =', b.value);

module.exports = { value: 'a' };

// b.js
const a = require('./a.js');

console.log('b: a.value =', a.value);

module.exports = { value: 'b' };

// Running: node a.js
// Output:
// b: a.value = undefined  (a not fully loaded yet)
// a: b.value = b
```

### Solution 1: Restructure

```javascript
// ✅ Move shared code to separate module
// shared.js
module.exports = {
  sharedFunction: () => { }
};

// a.js
const shared = require('./shared.js');
const b = require('./b.js');

module.exports = {
  valueA: 'a'
};

// b.js
const shared = require('./shared.js');
const a = require('./a.js');

module.exports = {
  valueB: 'b'
};
```

### Solution 2: Lazy Load

```javascript
// ✅ Require inside function (lazy loading)
// a.js
module.exports = {
  getValue: () => {
    const b = require('./b.js');  // Load when needed
    return b.value;
  },
  value: 'a'
};

// b.js
module.exports = {
  getValue: () => {
    const a = require('./a.js');  // Load when needed
    return a.value;
  },
  value: 'b'
};
```

### Solution 3: Dependency Injection

```javascript
// ✅ Pass dependencies as arguments
// a.js
function setup(b) {
  console.log('a initialized with b:', b.value);
  return { value: 'a', b };
}

module.exports = { setup };

// b.js
function setup(a) {
  console.log('b initialized with a:', a.value);
  return { value: 'b', a };
}

module.exports = { setup };

// main.js
const aModule = require('./a.js');
const bModule = require('./b.js');

const a = aModule.setup(null);
const b = bModule.setup(null);

a.b = b;
b.a = a;
```

---

## ESM vs CommonJS

### Comparison

| Feature | ESM | CommonJS |
|---------|-----|----------|
| **Syntax** | `import`/`export` | `require()`/`module.exports` |
| **Loading** | Async | Sync |
| **Standard** | ES6+ official | Node.js custom |
| **Tree-shaking** | ✅ Yes | ❌ Difficult |
| **Top-level await** | ✅ Yes | ❌ No |
| **Dynamic import** | ✅ `import()` | ✅ `require()` |
| **Default export** | ✅ Yes | Single export only |
| **Named exports** | ✅ Multiple | Via object properties |
| **Circular deps** | Partial | Full support |

### Code Comparison

```javascript
// ✅ CommonJS
const math = require('./math.js');
const { add } = require('./math.js');

module.exports = { greet: () => 'hi' };
exports.helper = () => { };

// ✅ ESM
import math from './math.js';
import { add } from './math.js';

export default { greet: () => 'hi' };
export function helper() { }
```

---

## ESM/CommonJS Interoperability

### ESM Importing CommonJS

```javascript
// ✅ Import CommonJS module into ESM
// math.js (CommonJS)
module.exports = {
  add: (a, b) => a + b
};

// app.mjs (ESM)
import math from './math.js';
console.log(math.add(5, 3));  // Works

// ✅ Importing named exports
import * as math from './math.js';
console.log(math.add(5, 3));  // Works
```

### CommonJS Requiring ESM

```javascript
// ❌ CommonJS cannot directly require ESM
const esm = require('./module.mjs');  // Error!

// ✅ Use dynamic import instead
(async () => {
  const esm = await import('./module.mjs');
  console.log(esm);
})();

// ✅ Or use conditional import
async function loadESM() {
  return await import('./module.mjs');
}
```

### Dual Package Support

```javascript
// package.json
{
  "name": "my-package",
  "main": "./dist/index.js",           // CommonJS
  "module": "./dist/index.mjs",        // ESM
  "exports": {
    ".": {
      "import": "./dist/index.mjs",    // ESM
      "require": "./dist/index.js"     // CommonJS
    }
  }
}

// Consumers can use either:
// CommonJS: const pkg = require('my-package');
// ESM: import pkg from 'my-package';
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use module.exports for main export
module.exports = class User { };

// ✅ Use exports for multiple utilities
exports.helper1 = () => { };
exports.helper2 = () => { };

// ✅ Require at top of file (usually)
const express = require('express');
const config = require('./config.js');

// ✅ Use destructuring for readability
const { add, subtract } = require('./math.js');

// ✅ Handle optional dependencies
try {
  const optional = require('optional');
} catch (e) {
  // Handle missing package
}

// ✅ Use relative paths for local modules
const utils = require('./utils.js');
const config = require('../config.js');
```

### ❌ DON'T

```javascript
// ❌ Don't mix exports and module.exports
exports.helper = () => { };
module.exports = { setup };  // Overwrites exports!

// ❌ Don't reassign exports
exports = { add, subtract };  // Breaks connection!

// ❌ Don't require in loops (performance issue)
for (const file of files) {
  const mod = require(`./modules/${file}`);  // Avoid
}

// ✅ Better:
const modules = {};
for (const file of files) {
  modules[file] = require(`./modules/${file}`);
}

// ❌ Don't use with await (not supported)
// const mod = await require('./module.js');  // Error

// ✅ Use dynamic import:
// const mod = await import('./module.mjs');

// ❌ Don't create circular dependencies
// a.js: require('./b.js');
// b.js: require('./a.js');  // ✗ Problematic

// ✅ Use dependency injection instead
```

---

## Summary

### CommonJS Quick Reference

```javascript
// Exporting
module.exports = { };
module.exports = function() { };
exports.helper = () => { };

// Importing
const mod = require('./module.js');
const { helper } = require('./module.js');
const express = require('express');
```

### Module.exports vs exports

| Aspect | module.exports | exports |
|--------|------------------|---------|
| **Reassign** | ✅ Yes | ❌ No |
| **Add properties** | ✅ Yes | ✅ Yes |
| **Replace object** | ✅ Yes | ❌ Breaks |
| **Primary use** | ✅ Main export | ✅ Multiple utilities |

### When to Use CommonJS vs ESM

| Scenario | Use |
|----------|-----|
| **Node.js app** | CommonJS (or ESM with `.mjs`) |
| **npm package** | Both (dual export) |
| **Browser** | ESM |
| **Modern project** | ESM |
| **Legacy code** | CommonJS |

### Next Steps

- Learn module patterns for code organization
- Master both CommonJS and ESM
- Understand module loading strategies
- Build modular applications