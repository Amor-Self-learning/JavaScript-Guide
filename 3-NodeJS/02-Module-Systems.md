# Module 2: Module Systems

Node.js supports two module systems: CommonJS (traditional) and ES Modules (modern standard). This module covers both systems, their interoperability, and the module resolution algorithm.

---

## 2.1 CommonJS

### What It Is

CommonJS is Node.js's original module system. Every file is treated as a separate module with its own scope.

### Basic Syntax

```javascript
// --- Exporting ---

// file: math.js

// Named exports using exports object
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;

// Or using module.exports (preferred for multiple exports)
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

// Single/default export
module.exports = function greet(name) {
  return `Hello, ${name}!`;
};

// Export a class
module.exports = class Calculator {
  add(a, b) { return a + b; }
};
```

```javascript
// --- Importing ---

// file: app.js

// Import entire module
const math = require('./math');
console.log(math.add(2, 3));  // 5

// Destructuring import
const { add, subtract } = require('./math');
console.log(add(2, 3));  // 5

// Import single export
const greet = require('./greet');
console.log(greet('World'));  // Hello, World!

// Import core modules (no path needed)
const fs = require('fs');
const path = require('path');
const http = require('http');

// Import from node_modules
const express = require('express');
const lodash = require('lodash');
```

### Module Wrapper

Every CommonJS module is wrapped in a function:

```javascript
// What Node.js actually sees:
(function(exports, require, module, __filename, __dirname) {
  // Your module code here
  
  const secret = 'not accessible outside';
  
  module.exports = {
    public: 'accessible'
  };
  
});

// This is why:
// - Variables are scoped to the module
// - exports, require, module, __filename, __dirname are available
// - Top-level code runs when module is first required
```

### exports vs module.exports

```javascript
// exports is a shorthand reference to module.exports
console.log(exports === module.exports);  // true (initially)

// ✅ These work
exports.method = () => {};
module.exports.method = () => {};
module.exports = { method: () => {} };

// ❌ This DOESN'T work
exports = { method: () => {} };  // Breaks the reference!

// Why? Because require() returns module.exports, not exports
// When you reassign exports, you lose the connection

// Rule: Use module.exports for object/function/class exports
// Use exports.x for adding properties
```

### Module Caching

```javascript
// Modules are cached after first load

// file: counter.js
let count = 0;
module.exports = {
  increment: () => ++count,
  getCount: () => count
};

// file: app.js
const counter1 = require('./counter');
const counter2 = require('./counter');

console.log(counter1 === counter2);  // true (same instance!)

counter1.increment();
console.log(counter2.getCount());  // 1 (shared state)

// To check cache
console.log(require.cache);

// To clear cache (rarely needed)
delete require.cache[require.resolve('./counter')];
const counter3 = require('./counter');
console.log(counter3.getCount());  // 0 (fresh instance)
```

### Circular Dependencies

```javascript
// file: a.js
console.log('a.js starting');
exports.done = false;
const b = require('./b');
console.log('in a.js, b.done =', b.done);
exports.done = true;
console.log('a.js done');

// file: b.js
console.log('b.js starting');
exports.done = false;
const a = require('./a');
console.log('in b.js, a.done =', a.done);
exports.done = true;
console.log('b.js done');

// file: main.js
const a = require('./a');
const b = require('./b');

// Output:
// a.js starting
// b.js starting
// in b.js, a.done = false  (a.js not finished yet!)
// b.js done
// in a.js, b.done = true
// a.js done

// Node.js handles circular deps by returning incomplete exports
// ❌ Avoid circular dependencies when possible
// ✅ Restructure code or use dependency injection
```

### Core vs User Modules

```javascript
// Core modules (built into Node.js)
const fs = require('fs');           // No path, no node_modules
const path = require('path');
const http = require('http');
const crypto = require('crypto');

// User modules (your files)
const myModule = require('./myModule');        // Relative path
const config = require('../config/settings');  // Parent directory
const utils = require('/absolute/path/utils'); // Absolute path

// Third-party modules (from node_modules)
const express = require('express');
const lodash = require('lodash');
const chalk = require('chalk');

// Resolution priority:
// 1. Core modules
// 2. File modules (if path starts with ./ ../ or /)
// 3. node_modules (walks up directory tree)
```

---

## 2.2 ES Modules in Node

### Enabling ES Modules

```javascript
// Method 1: Use .mjs extension
// file: module.mjs

// Method 2: Add "type": "module" to package.json
{
  "name": "my-package",
  "type": "module"  // All .js files are ESM
}

// Method 3: Use --input-type=module flag
// node --input-type=module script.js
```

### Basic Syntax

```javascript
// --- Named Exports ---

// file: math.mjs
export const PI = 3.14159;
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

export function multiply(a, b) {
  return a * b;
}

export class Calculator {
  add(a, b) { return a + b; }
}

// --- Default Export ---

// file: greet.mjs
export default function greet(name) {
  return `Hello, ${name}!`;
}

// Or
const greet = (name) => `Hello, ${name}!`;
export default greet;

// --- Mixed Exports ---

// file: utils.mjs
export const VERSION = '1.0.0';
export function helper() {}
export default class Utils {}
```

```javascript
// --- Named Imports ---

// file: app.mjs
import { add, subtract, PI } from './math.mjs';
console.log(add(2, 3));
console.log(PI);

// Import with alias
import { add as sum, subtract as minus } from './math.mjs';
console.log(sum(2, 3));

// Import all as namespace
import * as math from './math.mjs';
console.log(math.add(2, 3));
console.log(math.PI);

// --- Default Imports ---
import greet from './greet.mjs';
console.log(greet('World'));

// Default with alias (any name works)
import sayHello from './greet.mjs';
console.log(sayHello('World'));

// --- Mixed Imports ---
import Utils, { VERSION, helper } from './utils.mjs';

// --- Core and npm modules ---
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import express from 'express';
```

### Dynamic Imports

```javascript
// Static imports must be at top level
// Dynamic imports work anywhere and return a Promise

// Conditional loading
if (condition) {
  const { feature } = await import('./feature.mjs');
  feature();
}

// Load based on runtime value
const moduleName = process.env.MODULE;
const module = await import(`./${moduleName}.mjs`);

// In async function
async function loadModule() {
  const { default: greet, helper } = await import('./utils.mjs');
  return greet('World');
}

// Works in CommonJS too (async import of ESM)
// file: app.cjs
async function main() {
  const { add } = await import('./math.mjs');
  console.log(add(2, 3));
}
main();
```

### import.meta

```javascript
// ESM equivalent of __filename and __dirname

// Get current file URL
console.log(import.meta.url);
// file:///home/user/project/src/app.mjs

// Convert to path
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__filename);  // /home/user/project/src/app.mjs
console.log(__dirname);   // /home/user/project/src

// Resolve relative paths
const configPath = new URL('./config.json', import.meta.url);
```

### Top-Level Await

```javascript
// ESM supports top-level await (no async wrapper needed)

// file: config.mjs
const response = await fetch('https://api.example.com/config');
export const config = await response.json();

// file: db.mjs
import { createConnection } from 'database';
export const db = await createConnection();

// file: app.mjs
import { config } from './config.mjs';
import { db } from './db.mjs';

// Both are fully initialized here
console.log(config);
console.log(db.isConnected);
```

### Differences from CommonJS

```javascript
// Feature                  | CommonJS          | ESM
// -------------------------|-------------------|------------------
// Syntax                   | require/exports   | import/export
// Loading                  | Synchronous       | Asynchronous
// Top-level await          | ❌ No             | ✅ Yes
// __filename/__dirname     | ✅ Yes            | ❌ Use import.meta
// require.cache            | ✅ Yes            | ❌ No equivalent
// Conditional exports      | ✅ Yes            | ❌ Static only*
// Live bindings            | ❌ No (copies)    | ✅ Yes (references)
// this at top level        | exports           | undefined
// .json import             | ✅ Built-in       | ❌ Needs flag**

// *Dynamic import() for conditional loading
// **Use: node --experimental-json-modules or import assertion

// Live bindings example
// file: counter.mjs
export let count = 0;
export const increment = () => count++;

// file: app.mjs
import { count, increment } from './counter.mjs';
console.log(count);  // 0
increment();
console.log(count);  // 1 (live binding updated!)

// In CommonJS, count would still be 0 (it's a copy)
```

---

## 2.3 Interoperability

### ESM Importing CommonJS

```javascript
// ESM can import CommonJS default export
import cjsModule from './commonjs-module.cjs';

// Named imports may not work depending on the export style
// ❌ May not work
import { named } from './commonjs-module.cjs';

// ✅ Always works
import cjs from './commonjs-module.cjs';
const { named } = cjs;

// Import core modules
import fs from 'fs';
import { readFileSync } from 'fs';  // Named exports work for core

// Import npm packages (most support ESM imports)
import express from 'express';
import _ from 'lodash';
```

### CommonJS Importing ESM

```javascript
// CommonJS cannot use require() with ESM
// ❌ This throws an error
const esm = require('./esm-module.mjs');

// ✅ Use dynamic import (returns Promise)
async function main() {
  const { default: greet, helper } = await import('./esm-module.mjs');
  console.log(greet('World'));
}
main();

// Or with .then()
import('./esm-module.mjs').then(({ default: greet }) => {
  console.log(greet('World'));
});
```

### Package.json Exports

```javascript
// Modern packages use "exports" field for ESM/CJS dual support

{
  "name": "my-package",
  "type": "module",
  "exports": {
    // Main entry
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    // Subpath exports
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  // Fallback for older Node versions
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs"
}

// Usage:
// import pkg from 'my-package';        // Gets .mjs
// const pkg = require('my-package');   // Gets .cjs
// import utils from 'my-package/utils';
```

---

## 2.4 Module Resolution

### Resolution Algorithm

```javascript
// When you require('module-name'):

// 1. Is it a core module? (fs, path, http, etc.)
//    → Return core module

// 2. Does it start with './' or '../' or '/'?
//    → Resolve as file or directory

// 3. Otherwise, search node_modules:
//    → Start at current directory
//    → Walk up to root, checking each node_modules

// File resolution order:
// require('./foo')
// 1. ./foo (exact match)
// 2. ./foo.js
// 3. ./foo.json
// 4. ./foo.node
// 5. ./foo/package.json → "main" field
// 6. ./foo/index.js
// 7. ./foo/index.json
// 8. ./foo/index.node
```

### node_modules Search

```javascript
// For require('express') from /home/user/project/src/app.js:

// Search path:
// /home/user/project/src/node_modules/express
// /home/user/project/node_modules/express
// /home/user/node_modules/express
// /home/node_modules/express
// /node_modules/express

// Check module.paths to see search paths
console.log(module.paths);
```

### Package Entry Points

```javascript
// package.json fields for entry points:

{
  // Legacy main entry (CommonJS)
  "main": "./lib/index.js",
  
  // ESM entry (used by bundlers)
  "module": "./lib/index.mjs",
  
  // Modern exports (Node.js 12+)
  "exports": {
    ".": {
      "import": "./lib/index.mjs",
      "require": "./lib/index.cjs",
      "types": "./lib/index.d.ts"
    },
    "./utils": "./lib/utils.js",
    "./package.json": "./package.json"
  },
  
  // TypeScript entry
  "types": "./lib/index.d.ts"
}
```

### require.resolve

```javascript
// Find module path without loading it
const modulePath = require.resolve('express');
console.log(modulePath);
// /home/user/project/node_modules/express/index.js

// With options
require.resolve('./module', {
  paths: ['/custom/search/path']
});

// Check if module exists
function moduleExists(name) {
  try {
    require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
}
```

---

## 2.5 Best Practices

### Module Organization

```javascript
// ✅ Good: Clear, single-purpose modules
// file: validators.js
export const isEmail = (str) => /.+@.+\..+/.test(str);
export const isPhone = (str) => /^\d{10}$/.test(str);

// file: formatters.js  
export const formatCurrency = (n) => `$${n.toFixed(2)}`;
export const formatDate = (d) => d.toISOString();

// ❌ Bad: God module with everything
// file: utils.js
export const isEmail = ...;
export const formatCurrency = ...;
export const fetchUser = ...;
export const calculateTax = ...;
// ...hundreds more
```

### Choosing ESM vs CommonJS

```javascript
// Use ESM when:
// - Starting new projects
// - Tree-shaking is important (bundlers)
// - Using top-level await
// - Following modern standards

// Use CommonJS when:
// - Maintaining legacy projects
// - Library needs to support old Node.js
// - Dynamic requires are essential
// - Simpler require.cache manipulation needed

// Dual package (both ESM and CommonJS)
// Build to both formats for maximum compatibility
```

### Avoiding Circular Dependencies

```javascript
// ❌ Circular dependency
// a.js requires b.js which requires a.js

// ✅ Solution 1: Dependency injection
// file: service.js
export function createService(dep) {
  return {
    method() { return dep.value; }
  };
}

// file: main.js
import { createService } from './service.js';
const dep = { value: 42 };
const service = createService(dep);

// ✅ Solution 2: Event-based communication
import { EventEmitter } from 'events';
export const bus = new EventEmitter();

// ✅ Solution 3: Lazy loading
export function getModuleA() {
  return require('./a');  // Load only when needed
}
```

---

## 2.6 Summary

| Concept | CommonJS | ES Modules |
|---------|----------|------------|
| Syntax | `require()`/`module.exports` | `import`/`export` |
| File extension | `.js`, `.cjs` | `.mjs`, `.js` (with type:module) |
| Loading | Synchronous | Asynchronous |
| Caching | `require.cache` | Implicit |
| Top-level await | ❌ No | ✅ Yes |
| Tree-shaking | ❌ Difficult | ✅ Static analysis |
| `__dirname` | ✅ Built-in | Use `import.meta.url` |
| Circular deps | Returns partial | Handled better |

### Key Points

| Topic | Details |
|-------|---------|
| **CommonJS** | `require()`, `module.exports`, synchronous, cached |
| **ES Modules** | `import`/`export`, async, static analysis, live bindings |
| **Interop** | ESM imports CJS easily; CJS needs dynamic `import()` for ESM |
| **Resolution** | Core → File → node_modules (walk up directory tree) |
| **package.json** | Use `exports` for modern entry points |

---

**End of Module 2: Module Systems**

Next: **Module 3 — File System (fs)** (Reading, writing, directories, promises API)
