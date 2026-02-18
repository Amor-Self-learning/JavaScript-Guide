# 14 Modules

Modules organize code into reusable units. ES modules (`import`/`export`) are the standard; CommonJS remains common in Node.js.

---

# ES Modules (ESM) 



## import Statement

### Basic Imports

```javascript
// ✅ Import named export
import { add } from './math.js';

// ✅ Import multiple named exports
import { add, subtract, multiply } from './math.js';

// ✅ Import with alias
import { add as addition } from './math.js';
console.log(addition(5, 3));

// ✅ Import all named exports as namespace
import * as math from './math.js';
console.log(math.add(5, 3));
console.log(math.subtract(5, 3));

// ✅ Import default export
import Calculator from './calculator.js';

// ✅ Import both default and named
import Calculator, { add, subtract } from './calculator.js';
```

### Import Paths

```javascript
// ✅ Relative paths (most common)
import { helper } from './utils/helper.js';
import { config } from '../config.js';

// ✅ Absolute paths (some environments)
import { helper } from '/src/utils/helper.js';

// ✅ Package imports (npm packages)
import React from 'react';
import { useState } from 'react';

// ✅ Bare module specifier
import lodash from 'lodash-es';

// ✅ With file extension (required in ESM)
import { fn } from './module.js';  // ✓ Correct
// import { fn } from './module';  // ✗ Wrong
```

### Import Side Effects

```javascript
// ✅ Import for side effects only (no bindings)
import './polyfills.js';
import './global-styles.css';

// Module executes but nothing is imported
```

### Hoisting Behavior

```javascript
// ✅ Import declarations are hoisted
console.log(add(2, 3));  // Works! (5)

import { add } from './math.js';

// All imports are processed before code execution
```

---

## export Statement

### Named Exports

```javascript
// ✅ Export individual declarations
export function add(a, b) {
  return a + b;
}

export const PI = 3.14159;

export class Calculator {
  constructor(value) {
    this.value = value;
  }
}

// ✅ Export after declaration
function subtract(a, b) {
  return a - b;
}

const E = 2.71828;

export { subtract, E };

// ✅ Export with rename
export { subtract as minus };

// ✅ Export multiple with renames
export {
  subtract as minus,
  E as EULER_NUMBER
};
```

### Default Export

```javascript
// ✅ Export default function
export default function greet(name) {
  return `Hello, ${name}!`;
}

// ✅ Export default class
export default class Calculator {
  add(a, b) {
    return a + b;
  }
}

// ✅ Export default value
export default {
  name: 'MyApp',
  version: '1.0.0'
};

// ✅ Export default after declaration
const config = { debug: true };
export default config;

// Note: Only ONE default export per module
```

### Mixed Exports

```javascript
// ✅ Combine default and named exports
export default class User {
  constructor(name) {
    this.name = name;
  }
}

export function createUser(name) {
  return new User(name);
}

export const ADMIN_ROLE = 'admin';

// Import
import User, { createUser, ADMIN_ROLE } from './user.js';
```

---

## Default Exports vs Named Exports

### Comparison

| Aspect | Default Export | Named Export |
|--------|-----------------|--------------|
| **Quantity** | One per module | Multiple per module |
| **Import name** | Any name | Must match name |
| **Syntax** | `export default` | `export { name }` |
| **Use case** | Main export | Utilities/helpers |
| **Alias** | Always possible | Optional |

```javascript
// ✅ Default export - rename on import
export default class Logger {}
import Logger from './logger.js';  // Any name
import MyLogger from './logger.js'; // Also works

// ✅ Named export - must match or use alias
export class Logger {}
import { Logger } from './logger.js';     // Must match
import { Logger as MyLogger } from './logger.js';  // Alias required
```

### When to Use Each

```javascript
// ✅ Use default export for main functionality
// calculator.js
export default class Calculator {
  add(a, b) { return a + b; }
}

// app.js
import Calculator from './calculator.js';

// ✅ Use named exports for utilities/helpers
// utils.js
export function formatDate(date) { /* ... */ }
export function parseJSON(str) { /* ... */ }
export function debounce(fn, delay) { /* ... */ }

// app.js
import { formatDate, debounce } from './utils.js';
```

---

## Re-exporting

### Basic Re-export

```javascript
// ✅ Re-export named export
export { add } from './math.js';

// ✅ Re-export multiple
export { add, subtract } from './math.js';

// ✅ Re-export with alias
export { add as addition } from './math.js';

// ✅ Re-export all
export * from './math.js';
```

### Re-exporting Default

```javascript
// ✅ Re-export default
export { default } from './calculator.js';

// ✅ Re-export default with name
export { default as Calculator } from './calculator.js';

// ✅ Re-export default as named
export { default as myCalculator } from './calculator.js';
```

### Barrel Exports (Index Pattern)

```javascript
// components/index.js
export { default as Button } from './Button.js';
export { default as Input } from './Input.js';
export { default as Modal } from './Modal.js';

export { useForm } from './hooks/useForm.js';
export { useAuth } from './hooks/useAuth.js';

// app.js
import { Button, Input, Modal, useForm } from './components/index.js';
// Or just:
import { Button, Input, Modal, useForm } from './components';

// Index.js is automatically resolved
```

### Namespace Exports

```javascript
// math.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// aggregator.js (re-export as namespace)
export * as math from './math.js';

// app.js
import { math } from './aggregator.js';
console.log(math.add(5, 3));
```

---

## Dynamic Imports

### Basic Dynamic Import

```javascript
// ✅ Import on demand
button.addEventListener('click', async () => {
  const { processData } = await import('./processor.js');
  processData(data);
});

// ✅ Conditional import
if (isDevelopment) {
  const { DevTools } = await import('./dev-tools.js');
}

// ✅ Dynamic module path
async function loadModule(moduleName) {
  const module = await import(`./modules/${moduleName}.js`);
  return module;
}

const utils = await loadModule('utils');
```

### Use Cases

```javascript
// ✅ Code splitting / Lazy loading
async function loadFeature(feature) {
  const module = await import(`./features/${feature}.js`);
  return module.init();
}

// ✅ Conditional dependencies
async function loadPolyfill() {
  if (!Array.prototype.includes) {
    await import('./polyfills/array-includes.js');
  }
}

// ✅ Large library lazy loading
button.addEventListener('click', async () => {
  const { Chart } = await import('chart.js');
  // Use Chart...
});

// ✅ Route-based code splitting
async function renderPage(route) {
  const module = await import(`./pages/${route}.js`);
  return module.render();
}
```

### Error Handling

```javascript
// ✅ Handle import errors
async function loadModule(name) {
  try {
    return await import(`./modules/${name}.js`);
  } catch (error) {
    console.error(`Failed to load ${name}:`, error);
    return null;
  }
}

// ✅ Fallback module
async function loadWithFallback(primary, fallback) {
  try {
    return await import(primary);
  } catch (error) {
    console.warn(`Failed to load ${primary}, using fallback`);
    return await import(fallback);
  }
}
```

---

## import.meta

### What is import.meta?

`import.meta` is an object containing metadata about the current module.

```javascript
// ✅ Common properties
console.log(import.meta.url);   // file:///.../module.js
console.log(import.meta.main);  // true if main module
console.log(import.meta.resolve); // Resolve module path
```

### Use Cases

```javascript
// ✅ Get module directory
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);  // Current directory path

// ✅ Resolve relative paths
const configPath = import.meta.resolve('./config.json');

// ✅ Check if module is main
if (import.meta.main) {
  console.log('This is the main module');
  // Run CLI logic
}

// ✅ Environment detection
if (import.meta.url.includes('http')) {
  console.log('Running in browser');
} else {
  console.log('Running in Node.js');
}

// ✅ Dynamic import resolution
const moduleName = process.env.MODULE || 'default';
const modulePath = import.meta.resolve(`./${moduleName}.js`);
const module = await import(modulePath);
```

---

## Module Scope

### Module Scope Isolation

```javascript
// module1.js
const privateVar = 'private';  // Not accessible outside
let counter = 0;

export function increment() {
  counter++;
}

export function getCounter() {
  return counter;
}

// module2.js
import { getCounter, increment } from './module1.js';

console.log(getCounter());  // 0
increment();
console.log(getCounter());  // 1

// Each module has its own scope
// privateVar is inaccessible
// counter is private (encapsulated)
```

### Global Scope vs Module Scope

```javascript
// ❌ Creates global variable
globalThis.config = { debug: true };

// ✅ Module-scoped variable
const config = { debug: true };
export { config };

// ✅ Each module gets its own copy
// module1.js
import { config } from './config.js';
config.debug = false;

// module2.js
import { config } from './config.js';
console.log(config.debug);  // true (not affected by module1)
```

### Shared State

```javascript
// counter.js
let count = 0;

export function increment() {
  return ++count;
}

export function getCount() {
  return count;
}

// module1.js
import { increment, getCount } from './counter.js';

increment();
increment();
console.log(getCount());  // 2

// module2.js
import { increment, getCount } from './counter.js';

console.log(getCount());  // 2 (shared state!)
increment();
console.log(getCount());  // 3
```

---

## Top-Level await

### Using await Outside async Function

```javascript
// ✅ Top-level await (ES2022)
const response = await fetch('/api/data');
const data = await response.json();

console.log('Data loaded:', data);

// Module waits for promise before continuing
```

### Module Loading Order

```javascript
// module1.js
console.log('Module 1: start');
const data = await fetch('/data').then(r => r.json());
console.log('Module 1: got data');

export { data };

// module2.js
console.log('Module 2: start');
import { data } from './module1.js';
console.log('Module 2: data available', data);

// Output:
// Module 1: start
// Module 1: got data
// Module 2: start
// Module 2: data available ...
```

### Use Cases

```javascript
// ✅ Initialize module on load
const db = await connectDatabase();
const config = await loadConfig();

export { db, config };

// ✅ Conditional module loading
const API_URL = await getApiUrl();

const api = API_URL.includes('localhost')
  ? await import('./mockApi.js')
  : await import('./realApi.js');

export { api };

// ✅ Database migrations
await runMigrations();
console.log('Database ready');
```

---

## Practical Examples

### Example 1: Calculator Module with Namespace

```javascript
// calculator.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export const divide = (a, b) => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};

// app.js
import * as calc from './calculator.js';

console.log(calc.add(10, 5));       // 15
console.log(calc.multiply(3, 4));   // 12
```

### Example 2: Component with Re-exports

```javascript
// components/Button.js
export default function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

// components/Input.js
export default function Input({ onChange, value }) {
  return <input onChange={onChange} value={value} />;
}

// components/index.js
export { default as Button } from './Button.js';
export { default as Input } from './Input.js';

// app.js
import { Button, Input } from './components/index.js';
```

### Example 3: Feature Flags with Dynamic Import

```javascript
// features/index.js
const features = {
  analytics: false,
  darkMode: true,
  betaFeatures: false
};

export async function loadFeature(name) {
  if (!features[name]) {
    throw new Error(`Feature ${name} is disabled`);
  }

  return import(`./features/${name}.js`);
}

// app.js
const analytics = await loadFeature('analytics');
// Or graceful fallback:
try {
  const darkMode = await loadFeature('darkMode');
  darkMode.init();
} catch (error) {
  console.warn(error.message);
}
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use named exports for utilities
export function formatDate(date) { }
export function parseJSON(str) { }

// ✅ Use default export for main class/component
export default class User { }

// ✅ Use barrel exports for organization
export { default as Button } from './Button.js';
export { default as Input } from './Input.js';

// ✅ Import specific items needed
import { add, subtract } from './math.js';

// ✅ Use dynamic import for code splitting
const module = await import('./heavy-module.js');

// ✅ Use top-level await for initialization
const config = await loadConfig();
export { config };
```

### ❌ DON'T

```javascript
// ❌ Don't mix default and named confusingly
export default function main() { }
export default class Helper { }  // ERROR: duplicate default

// ❌ Don't import everything unnecessarily
import * as math from './math.js';
const result = math.add(5, 3);  // Could just: import { add }

// ❌ Don't use dynamic import carelessly
const module = await import(userInput);  // Security risk!

// ❌ Don't forget file extensions
import { helper } from './utils';  // ERROR in ESM
import { helper } from './utils.js';  // Correct

// ❌ Don't create circular dependencies
// a.js: import { b } from './b.js';
// b.js: import { a } from './a.js';
```

---

## Summary

### Import/Export Quick Reference

```javascript
// Named exports
export function add(a, b) { }
export const PI = 3.14;
export { subtract, multiply };

// Default export
export default class Calculator { }

// Named imports
import { add, PI } from './math.js';

// Default import
import Calculator from './calculator.js';

// Mixed
import Calculator, { add, PI } from './all.js';

// Namespace import
import * as math from './math.js';

// Dynamic import
const module = await import('./module.js');

// Re-export
export { add } from './math.js';
export * from './utils.js';
```

### Module System Comparison

| Feature | ESM | CommonJS |
|---------|-----|----------|
| **Standard** | ES6+ | Node.js custom |
| **Syntax** | `import`/`export` | `require()`/`module.exports` |
| **Loading** | Async | Sync |
| **Top-level await** | ✅ Yes | ❌ No |
| **Dynamic import** | ✅ `import()` | ✅ `require()` |
| **Tree-shaking** | ✅ Yes | ❌ Difficult |

### Next Steps

- Learn CommonJS for Node.js compatibility
- Master module patterns
- Understand ESM vs CommonJS interop
- Build modular applications
## CommonJS (Node.js) 



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
## Module Patterns 



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

## 14.4 Modules Summary

| Feature | ES Modules | CommonJS |
|---------|------------|----------|
| Syntax | `import`/`export` | `require`/`module.exports` |
| Loading | Async | Sync |
| Scope | Strict mode | Non-strict |
| Hoisting | Yes (live bindings) | No |
| Browser | Native | Needs bundler |

---

**End of Chapter 14: Modules**
