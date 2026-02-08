# ES Modules (ESM) 

## Table of Contents
1. [Introduction to ES Modules](#introduction-to-es-modules)
2. [import Statement](#import-statement)
3. [export Statement](#export-statement)
4. [Default Exports vs Named Exports](#default-exports-vs-named-exports)
5. [Re-exporting](#re-exporting)
6. [Dynamic Imports](#dynamic-imports)
7. [import.meta](#importmeta)
8. [Module Scope](#module-scope)
9. [Top-Level await](#top-level-await)
10. [Practical Examples](#practical-examples)
11. [Best Practices](#best-practices)
12. [Summary](#summary)

---

## Introduction to ES Modules

### What are ES Modules?

**ES Modules (ESM)** is the standard module system for JavaScript, standardized in ES6 (2015). Each file is a separate module with its own scope.

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// main.js
import { add, subtract } from './math.js';

console.log(add(5, 3));       // 8
console.log(subtract(5, 3));  // 2
```

### Benefits of ES Modules

1. **Standardized** - Official JavaScript standard
2. **Scoped** - Each module has its own scope
3. **Static analysis** - Tools can analyze dependencies
4. **Tree-shaking** - Dead code elimination
5. **Async loading** - Loads asynchronously
6. **Circular dependencies** - Handles them gracefully

### Module Types

```javascript
// Module (has imports/exports)
export const value = 42;

// Script (no imports/exports)
console.log('This is a script');
```

---

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