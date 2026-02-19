# Module 16: Utilities

The `util` module provides utility functions for debugging, type checking, formatting, and converting callback-based APIs to promises.

---

## 16.1 Module Import

```javascript
// CommonJS
const util = require('util');

// ES Modules
import util from 'util';
import { promisify, format, inspect } from 'util';
```

---

## 16.2 promisify

Convert callback-based functions to Promise-based.

### Basic Usage

```javascript
const fs = require('fs');
const util = require('util');

// Callback style
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promisified
const readFile = util.promisify(fs.readFile);

const data = await readFile('file.txt', 'utf8');
console.log(data);
```

### Custom Symbol

```javascript
// Make custom function promisify-able
function customAsync(callback) {
  setTimeout(() => callback(null, 'result'), 100);
}

customAsync[util.promisify.custom] = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve('custom result'), 100);
  });
};

const promisified = util.promisify(customAsync);
const result = await promisified();
console.log(result);  // 'custom result'
```

### Common Promisifications

```javascript
const { promisify } = require('util');
const { exec } = require('child_process');
const dns = require('dns');
const crypto = require('crypto');

const execAsync = promisify(exec);
const lookupAsync = promisify(dns.lookup);
const randomBytesAsync = promisify(crypto.randomBytes);

// Usage
const { stdout } = await execAsync('ls -la');
const { address } = await lookupAsync('google.com');
const bytes = await randomBytesAsync(32);
```

---

## 16.3 callbackify

Convert Promise-based functions to callback style.

```javascript
const util = require('util');

async function asyncFunction() {
  return 'result';
}

const callbackFunction = util.callbackify(asyncFunction);

callbackFunction((err, result) => {
  if (err) throw err;
  console.log(result);  // 'result'
});
```

### With Rejection

```javascript
async function failingAsync() {
  throw new Error('Async error');
}

const failing = util.callbackify(failingAsync);

failing((err, result) => {
  console.log(err.message);  // 'Async error'
});
```

---

## 16.4 inspect

Convert objects to string representation for debugging.

### Basic Usage

```javascript
const obj = {
  name: 'Alice',
  nested: {
    deep: {
      value: 42
    }
  },
  arr: [1, 2, 3]
};

console.log(util.inspect(obj));
// { name: 'Alice', nested: { deep: { value: 42 } }, arr: [ 1, 2, 3 ] }
```

### Options

```javascript
util.inspect(obj, {
  depth: 2,              // How deep to recurse (null = infinite)
  colors: true,          // Colorize output
  showHidden: true,      // Show non-enumerable properties
  showProxy: true,       // Show proxy details
  maxArrayLength: 100,   // Max array elements
  maxStringLength: 100,  // Max string length
  breakLength: 80,       // Line wrap width
  compact: false,        // Multi-line formatting
  sorted: true,          // Sort object keys
  getters: true,         // Invoke getters
  numericSeparator: true // 1_000_000 format
});
```

### Shorthand

```javascript
// Second arg can be boolean (showHidden) or number (depth)
util.inspect(obj, false, 4);  // depth=4, no hidden
util.inspect(obj, true, 2);   // depth=2, show hidden
```

### Custom inspect

```javascript
const util = require('util');

class User {
  constructor(name, password) {
    this.name = name;
    this.password = password;
  }
  
  // Custom inspect symbol
  [util.inspect.custom](depth, opts) {
    return `User { name: ${this.name}, password: [HIDDEN] }`;
  }
}

const user = new User('Alice', 'secret123');
console.log(util.inspect(user));
// User { name: Alice, password: [HIDDEN] }
```

### Default inspect options

```javascript
// Change defaults globally
util.inspect.defaultOptions.depth = 4;
util.inspect.defaultOptions.colors = true;
util.inspect.defaultOptions.maxArrayLength = 200;
```

---

## 16.5 format

Printf-style string formatting.

```javascript
// %s - String
util.format('Hello %s', 'World');
// 'Hello World'

// %d - Number
util.format('Count: %d', 42);
// 'Count: 42'

// %i - Integer
util.format('Int: %i', 42.5);
// 'Int: 42'

// %f - Float
util.format('Float: %f', 3.14159);
// 'Float: 3.14159'

// %j - JSON
util.format('Data: %j', { a: 1 });
// 'Data: {"a":1}'

// %o - Object with options
util.format('Obj: %o', { a: 1 });
// 'Obj: { a: 1 }'

// %O - Object without options
util.format('Obj: %O', { a: 1 });
// 'Obj: { a: 1 }'

// %% - Literal percent
util.format('100%% complete');
// '100% complete'

// Multiple args without placeholders
util.format('a', 'b', 'c');
// 'a b c'
```

### formatWithOptions

```javascript
// Format with inspect options
util.formatWithOptions(
  { colors: true, depth: 4 },
  'Object: %o',
  { nested: { deep: { value: 1 } } }
);
```

---

## 16.6 Type Checking

### util.types

```javascript
const { types } = require('util');

// ArrayBuffer
types.isArrayBuffer(new ArrayBuffer(8));  // true

// TypedArray
types.isTypedArray(new Uint8Array());     // true
types.isUint8Array(new Uint8Array());     // true
types.isFloat64Array(new Float64Array()); // true

// DataView
types.isDataView(new DataView(new ArrayBuffer(8)));  // true

// Map/Set
types.isMap(new Map());         // true
types.isSet(new Set());         // true
types.isWeakMap(new WeakMap()); // true
types.isWeakSet(new WeakSet()); // true

// Promise
types.isPromise(Promise.resolve()); // true

// Proxy
types.isProxy(new Proxy({}, {}));   // true

// Date
types.isDate(new Date());           // true

// RegExp
types.isRegExp(/pattern/);          // true

// Generator
function* gen() {}
types.isGeneratorFunction(gen);     // true
types.isGeneratorObject(gen());     // true

// Async
async function async() {}
types.isAsyncFunction(async);       // true

// Error types
types.isNativeError(new Error());   // true
types.isNativeError(new TypeError()); // true

// SharedArrayBuffer
types.isSharedArrayBuffer(new SharedArrayBuffer(8)); // true

// BigInt
types.isBigInt64Array(new BigInt64Array()); // true

// Module namespace
import * as mod from 'fs';
types.isModuleNamespaceObject(mod); // true
```

---

## 16.7 Deprecation

### deprecate

```javascript
const util = require('util');

const oldFunction = util.deprecate(
  function(x) { return x * 2; },
  'oldFunction() is deprecated. Use newFunction() instead.',
  'DEP0001'  // Optional deprecation code
);

oldFunction(5);  // Works but prints warning

// Suppress warnings
process.noDeprecation = true;

// Throw on deprecation (for testing)
process.throwDeprecation = true;

// Trace deprecation
process.traceDeprecation = true;
```

---

## 16.8 Debug Logging

### debuglog

```javascript
const util = require('util');

// Create debug logger
const debug = util.debuglog('myapp');

debug('Starting application');
debug('Processing %d items', 100);

// Only prints if NODE_DEBUG=myapp or NODE_DEBUG=myapp*
// $ NODE_DEBUG=myapp node app.js
// MYAPP 12345: Starting application
// MYAPP 12345: Processing 100 items
```

### Multiple debug sections

```javascript
const dbDebug = util.debuglog('myapp-db');
const httpDebug = util.debuglog('myapp-http');
const cacheDebug = util.debuglog('myapp-cache');

// Enable all: NODE_DEBUG=myapp-*
// Enable specific: NODE_DEBUG=myapp-db,myapp-http
```

---

## 16.9 Text Encoding

### TextEncoder / TextDecoder

```javascript
// These are globals, not from util module
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Encode string to Uint8Array
const encoded = encoder.encode('Hello');
console.log(encoded);  // Uint8Array [72, 101, 108, 108, 111]

// Decode Uint8Array to string
const decoded = decoder.decode(encoded);
console.log(decoded);  // 'Hello'

// With encoding options
const utf16Decoder = new TextDecoder('utf-16le');
const decoded16 = utf16Decoder.decode(buffer);
```

---

## 16.10 Parse Args

```javascript
const { parseArgs } = require('util');

// Define expected options
const options = {
  name: { type: 'string', short: 'n' },
  verbose: { type: 'boolean', short: 'v', default: false },
  count: { type: 'string', multiple: true }
};

// Parse
const { values, positionals } = parseArgs({
  args: ['--name', 'Alice', '-v', '--count', '1', '--count', '2', 'file.txt'],
  options,
  allowPositionals: true
});

console.log(values);
// { name: 'Alice', verbose: true, count: ['1', '2'] }

console.log(positionals);
// ['file.txt']
```

### Strict Mode

```javascript
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: { type: 'boolean', short: 'h' },
    config: { type: 'string', short: 'c' }
  },
  strict: true  // Throw on unknown options
});
```

---

## 16.11 Misc Utilities

### inherits (Legacy)

```javascript
// Deprecated: Use class extends instead
const util = require('util');

function Parent() {
  this.name = 'parent';
}
Parent.prototype.sayHello = function() {
  console.log('Hello from', this.name);
};

function Child() {
  Parent.call(this);
  this.name = 'child';
}
util.inherits(Child, Parent);

// Modern equivalent
class ModernChild extends Parent {
  constructor() {
    super();
    this.name = 'child';
  }
}
```

### getSystemErrorName

```javascript
const util = require('util');

console.log(util.getSystemErrorName(-2));   // 'ENOENT'
console.log(util.getSystemErrorName(-13));  // 'EACCES'
console.log(util.getSystemErrorName(-22));  // 'EINVAL'
```

### getSystemErrorMap

```javascript
const errorMap = util.getSystemErrorMap();
// Map { -2 => ['ENOENT', 'no such file or directory'], ... }

for (const [code, [name, desc]] of errorMap) {
  console.log(`${code}: ${name} - ${desc}`);
}
```

### isDeepStrictEqual

```javascript
const util = require('util');

util.isDeepStrictEqual({ a: 1 }, { a: 1 });     // true
util.isDeepStrictEqual([1, 2], [1, 2]);         // true
util.isDeepStrictEqual(NaN, NaN);               // true
util.isDeepStrictEqual({ a: 1 }, { a: '1' });   // false (type differs)
```

### MIMEType (Node.js 19+)

```javascript
const { MIMEType } = require('util');

const mime = new MIMEType('text/html; charset=utf-8');
console.log(mime.type);       // 'text'
console.log(mime.subtype);    // 'html'
console.log(mime.essence);    // 'text/html'
console.log(mime.params.get('charset'));  // 'utf-8'
```

---

## 16.12 Summary

| Method | Description |
|--------|-------------|
| `promisify(fn)` | Convert callback to Promise |
| `callbackify(fn)` | Convert Promise to callback |
| `inspect(obj)` | Object to string for debugging |
| `format(str, ...)` | Printf-style formatting |
| `formatWithOptions()` | format with inspect options |
| `deprecate(fn, msg)` | Mark function as deprecated |
| `debuglog(section)` | Create debug logger |
| `parseArgs(config)` | Parse command line args |

| util.types | Description |
|------------|-------------|
| `isPromise()` | Check if Promise |
| `isDate()` | Check if Date |
| `isRegExp()` | Check if RegExp |
| `isMap()` / `isSet()` | Check Map/Set |
| `isTypedArray()` | Check TypedArray |
| `isAsyncFunction()` | Check async function |
| `isProxy()` | Check Proxy |
| `isNativeError()` | Check Error instance |

| Inspect Option | Description |
|----------------|-------------|
| `depth` | Recursion depth |
| `colors` | Colorize output |
| `showHidden` | Show non-enumerable |
| `maxArrayLength` | Max array items |
| `breakLength` | Line wrap width |
| `compact` | Multi-line format |

---

**End of Module 16: Utilities**

Next: **Module 17 — Net and DNS** (Low-level networking)
