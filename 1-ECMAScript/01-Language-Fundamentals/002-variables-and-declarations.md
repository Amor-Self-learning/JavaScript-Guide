# 1.2 Variables and Declarations

## Introduction

Variable declaration in JavaScript has undergone significant evolution. ES5's `var` brought function scoping and hoisting quirks that confused developers for years. ES6 introduced `let` and `const`, adding block scoping and the Temporal Dead Zone (TDZ). Understanding these mechanisms—not just their surface syntax—is essential for writing robust JavaScript.

This chapter dissects the internal mechanics of variable declarations, scoping rules, hoisting behavior, and the TDZ. No fluff, no handholding—just the technical reality of how JavaScript's engine treats variables.

---

## 1.2.1 `var`: Function-Scoped Declaration

### Basic Syntax and Semantics

`var` declares function-scoped variables. It's the oldest declaration keyword, predating ES6.

```javascript
var x;           // Declaration without initialization
var y = 10;      // Declaration with initialization
var a, b, c;     // Multiple declarations
var m = 1, n = 2, o = 3;  // Multiple declarations with initialization
```

**Key Characteristics:**

- Function-scoped (or globally scoped if outside any function)
- Hoisted to the top of its scope
- Can be re-declared in the same scope
- Creates property on global object when declared globally
- No Temporal Dead Zone

---

### Function Scoping Deep Dive

`var` declarations are scoped to the **nearest enclosing function**, not block:

```javascript
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x);  // 10 - accessible outside if block
}

// Block scoping doesn't apply
{
  var y = 20;
}
console.log(y);  // 20 - accessible outside block
```

**Why this matters:**

```javascript
function processUsers(users) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];  // 'user' is function-scoped
    // Process user
  }
  
  console.log(i);     // users.length (i leaked out of loop)
  console.log(user);  // last user (user leaked out of loop)
}
```

All `var` declarations in a function exist throughout the entire function, creating a single binding shared across all blocks.

---

### Global Scope Behavior

`var` at the top level creates a **property on the global object**:

**Browser Environment:**

```javascript
var globalVar = "test";
console.log(window.globalVar);     // "test"
console.log(globalThis.globalVar); // "test"

// These are identical
window.globalVar = "modified";
console.log(globalVar);  // "modified"
```

**Node.js Environment:**

```javascript
// Top-level in .js file (CommonJS)
var globalVar = "test";
console.log(global.globalVar);     // undefined (module scope!)
console.log(globalThis.globalVar); // undefined

// Only creates global property in REPL or non-module context
```

**Important distinction:** In Node.js modules, top-level `var` is module-scoped, not truly global. In browsers, it's always global.

---

### Hoisting Mechanics

Hoisting is often misunderstood. It's not that code is literally "moved" to the top—it's about how the JavaScript engine processes declarations during the compilation phase.

**What actually happens:**

```javascript
console.log(x);  // undefined (not ReferenceError!)
var x = 5;
console.log(x);  // 5
```

**Compilation phase:**

1. Engine scans for all `var` declarations
2. Creates bindings in the current execution context
3. Initializes all `var` bindings to `undefined`
4. Executes code line by line

**Conceptual transformation:**

```javascript
var x;           // Declaration hoisted and initialized to undefined
console.log(x);  // undefined
x = 5;           // Assignment stays in place
console.log(x);  // 5
```

**Complex hoisting example:**

```javascript
var x = 'outer';

function test() {
  console.log(x);  // undefined (not 'outer'!)
  var x = 'inner';
  console.log(x);  // 'inner'
}

test();
```

**Why `undefined` not `'outer'`?**

The `var x` inside `test()` is hoisted to the top of the function, creating a local binding that shadows the outer `x`. Before assignment, it's `undefined`.

**Conceptual transformation:**

```javascript
var x = 'outer';

function test() {
  var x;           // Hoisted, initialized to undefined
  console.log(x);  // undefined
  x = 'inner';
  console.log(x);  // 'inner'
}

test();
```

---

### Re-declaration Semantics

`var` allows re-declaration in the same scope:

```javascript
var x = 10;
var x = 20;  // No error, x is now 20
var x;       // No error, x remains 20 (no re-initialization)

console.log(x);  // 20
```

**With initialization:**

```javascript
var count = 1;
var count = 2;     // Overwrites
console.log(count); // 2
```

**Without re-initialization:**

```javascript
var count = 1;
var count;         // Doesn't reset to undefined
console.log(count); // Still 1
```

**Why this is dangerous:**

```javascript
// File 1
var config = { apiUrl: "https://api.example.com" };

// File 2 (concatenated or loaded later)
var config = { timeout: 5000 };  // Whoops! Overwrote config

// Result: original config lost
console.log(config);  // { timeout: 5000 }
```

This silent overwrites are why `var` is problematic in large codebases.

---

### The Classic Loop Problem

One of `var`'s most infamous issues:

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}

// Output: 3, 3, 3 (not 0, 1, 2)
```

**Why?**

1. `var i` is function-scoped (or global-scoped here)
2. Only **one** `i` variable exists
3. Loop completes immediately, setting `i` to 3
4. Timeouts execute 100ms later
5. All three closures reference the same `i`, which is now 3

**Visual representation:**

```javascript
var i;  // Single variable hoisted to top

i = 0;  // First iteration
setTimeout(function() { console.log(i); }, 100);  // Captures reference to i

i = 1;  // Second iteration
setTimeout(function() { console.log(i); }, 100);  // Captures same i

i = 2;  // Third iteration
setTimeout(function() { console.log(i); }, 100);  // Captures same i

i = 3;  // Loop terminates, i is now 3

// 100ms later, all three functions execute
// They all reference the same i, which is 3
```

**ES5 solution (IIFE):**

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {  // Create new scope with parameter
    setTimeout(function() {
      console.log(j);
    }, 100);
  })(i);  // Pass current i value
}

// Output: 0, 1, 2
```

Each IIFE creates a new scope with its own `j` parameter.

**ES6 solution (just use `let`):**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}

// Output: 0, 1, 2
```

---

## 1.2.2 `let`: Block-Scoped Declaration

### Basic Syntax and Semantics

`let` declares block-scoped variables with proper temporal semantics:

```javascript
let x;           // Declaration without initialization (x is undefined)
let y = 10;      // Declaration with initialization
let a, b, c;     // Multiple declarations
let m = 1, n = 2;  // Multiple declarations with initialization
```

**Key Characteristics:**

- Block-scoped
- Hoisted but not initialized (TDZ)
- Cannot be re-declared in the same scope
- Does not create global object property
- Temporal Dead Zone applies

---

### Block Scoping

`let` creates bindings that exist only within the nearest enclosing block `{}`:

```javascript
{
  let x = 10;
  console.log(x);  // 10
}
console.log(x);  // ReferenceError: x is not defined
```

**All blocks create scope:**

```javascript
// If blocks
if (true) {
  let x = 1;
}
console.log(x);  // ReferenceError

// For blocks
for (let i = 0; i < 3; i++) {
  let x = i;
}
console.log(i);  // ReferenceError
console.log(x);  // ReferenceError

// While blocks
while (false) {
  let x = 1;
}
console.log(x);  // ReferenceError

// Standalone blocks
{
  let x = 1;
  {
    let x = 2;  // Different variable (shadowing)
    console.log(x);  // 2
  }
  console.log(x);  // 1
}
```

**Function parameters and body:**

```javascript
function example(x) {  // Parameter x
  let y = 10;          // Local y
  
  if (true) {
    let x = 20;        // Different x, shadows parameter
    let y = 30;        // Different y, shadows outer let
    console.log(x, y); // 20, 30
  }
  
  console.log(x, y);   // (parameter value), 10
}
```

---

### Hoisting and the Temporal Dead Zone (TDZ)

`let` declarations **are hoisted** to the top of their block, but unlike `var`, they are **not initialized**. Accessing them before the declaration line results in a `ReferenceError`.

**The Temporal Dead Zone:**

```javascript
{
  // TDZ starts for x
  console.log(x);  // ReferenceError: Cannot access 'x' before initialization
  // TDZ continues
  let x = 10;      // TDZ ends for x
  console.log(x);  // 10
}
```

**Why it's called "Temporal":**

The dead zone is **temporal** (time-based), not spatial (location-based). It starts when the scope is entered and ends when the declaration is encountered during execution:

```javascript
{
  const getValue = () => x;  // Captures x (but doesn't execute yet)
  
  // getValue() here would throw ReferenceError
  
  let x = 10;  // TDZ ends
  
  console.log(getValue());  // 10 - now safe to call
}
```

**TDZ with `typeof`:**

Before ES6, `typeof` was "safe" for undeclared variables:

```javascript
console.log(typeof undeclaredVariable);  // "undefined" (no error)
```

With TDZ, this safety is lost:

```javascript
console.log(typeof x);  // ReferenceError (x is in TDZ)
let x;
```

But for truly undeclared variables, `typeof` still works:

```javascript
console.log(typeof completelyUndeclared);  // "undefined"
```

**Why TDZ exists:**

1. **Catch errors early**: Forces declarations before use
2. **Prevent `undefined` bugs**: `var`'s initialization to `undefined` masked bugs
3. **Const semantics**: `const` needs TDZ for consistency (can't initialize to `undefined`)
4. **Spec alignment**: Matches other languages' behavior

---

### No Re-declaration

`let` forbids re-declaration in the same scope:

```javascript
let x = 10;
let x = 20;  // SyntaxError: Identifier 'x' has already been declared
```

This applies even if one is `var`:

```javascript
var x = 10;
let x = 20;  // SyntaxError

let y = 10;
var y = 20;  // SyntaxError
```

**But shadowing is allowed:**

```javascript
let x = 1;
{
  let x = 2;  // Different scope, different variable
  console.log(x);  // 2
}
console.log(x);  // 1
```

**Cannot shadow in the same block:**

```javascript
let x = 1;
let x = 2;  // SyntaxError
```

**Function parameters and scope:**

```javascript
function f(x) {
  let x = 10;  // SyntaxError: x already declared (as parameter)
}

function g(x) {
  {
    let x = 10;  // OK: different scope
  }
}
```

---

### Loop Behavior and Per-Iteration Bindings

With `let`, each loop iteration creates a **new binding**:

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// Output: 0, 1, 2
```

**What happens internally:**

```javascript
// Conceptually transformed to:
{
  let i = 0;
  {
    let i_0 = i;  // Iteration 0
    setTimeout(() => console.log(i_0), 100);
  }
  i++;
  {
    let i_1 = i;  // Iteration 1
    setTimeout(() => console.log(i_1), 100);
  }
  i++;
  {
    let i_2 = i;  // Iteration 2
    setTimeout(() => console.log(i_2), 100);
  }
  i++;
}
```

Each iteration gets its own `i` binding.

**`for...in` and `for...of`:**

```javascript
const arr = ['a', 'b', 'c'];

for (let value of arr) {
  setTimeout(() => console.log(value), 100);
}

// Output: a, b, c (each iteration has its own binding)
```

**`for` loop with closures:**

```javascript
const funcs = [];

for (let i = 0; i < 3; i++) {
  funcs.push(() => i);
}

console.log(funcs[0]());  // 0
console.log(funcs[1]());  // 1
console.log(funcs[2]());  // 2
```

Compare with `var`:

```javascript
const funcs = [];

for (var i = 0; i < 3; i++) {
  funcs.push(() => i);
}

console.log(funcs[0]());  // 3
console.log(funcs[1]());  // 3
console.log(funcs[2]());  // 3
```

---

### Global Scope Behavior

`let` at the global level does **not** create a property on the global object:

```javascript
let globalLet = "test";

console.log(window.globalLet);     // undefined (browsers)
console.log(global.globalLet);     // undefined (Node.js)
console.log(globalThis.globalLet); // undefined
console.log(globalLet);            // "test" (variable exists)
```

Global `let` and `const` exist in a separate **global lexical environment**, distinct from the global object's properties.

**Contrast with `var`:**

```javascript
var globalVar = "test";
console.log(window.globalVar);  // "test"

let globalLet = "test";
console.log(window.globalLet);  // undefined
```

---

## 1.2.3 `const`: Immutable Binding

### Basic Syntax and Semantics

`const` declares block-scoped constants—variables with an **immutable binding**:

```javascript
const PI = 3.14159;
const MAX_SIZE = 100;
const config = { apiUrl: "https://api.example.com" };
```

**Key Characteristics:**

- Block-scoped (same as `let`)
- Hoisted but not initialized (TDZ, same as `let`)
- Cannot be re-declared (same as `let`)
- **Must be initialized at declaration**
- **Binding is immutable** (cannot reassign)
- **Value is not necessarily immutable** (objects/arrays can be mutated)

---

### Immutable Binding vs Immutable Value

**Critical distinction:** `const` creates an **immutable binding**, not an immutable value.

**Primitives (immutable binding = immutable value):**

```javascript
const x = 10;
x = 20;  // TypeError: Assignment to constant variable
```

**Objects (immutable binding ≠ immutable value):**

```javascript
const obj = { count: 0 };

// Cannot reassign the binding
obj = { count: 1 };  // TypeError: Assignment to constant variable

// But can mutate the object
obj.count = 1;       // OK
obj.newProp = "hi";  // OK
delete obj.count;    // OK

console.log(obj);    // { newProp: "hi" }
```

**Arrays:**

```javascript
const arr = [1, 2, 3];

// Cannot reassign
arr = [4, 5, 6];     // TypeError

// But can mutate
arr.push(4);         // OK
arr[0] = 99;         // OK
arr.length = 0;      // OK (empties array)

console.log(arr);    // []
```

**Why this design?**

JavaScript uses **reference semantics** for objects. The `const` binding holds a **reference** to the object. That reference cannot change, but the object it points to can be modified.

```javascript
const obj = { x: 1 };
// obj → Memory Address 0x1234 → { x: 1 }

obj.x = 2;
// obj → Memory Address 0x1234 → { x: 2 }  (same reference, mutated object)

obj = { x: 3 };  // TypeError
// Trying to change: obj → Memory Address 0x5678  (different reference)
```

---

### Initialization Required

`const` **must** be initialized at declaration:

```javascript
const x;  // SyntaxError: Missing initializer in const declaration

const y = 10;  // OK
```

**Why?**

Since `const` bindings cannot be reassigned, failing to initialize would create an unusable variable:

```javascript
const x;  // If this were allowed, x would be undefined forever
x = 10;   // Cannot assign to const
```

---

### Object Immutability with `Object.freeze()`

To make an object's properties immutable, use `Object.freeze()`:

```javascript
const obj = Object.freeze({ x: 1, y: 2 });

obj.x = 10;        // Silently fails (non-strict) or TypeError (strict)
obj.z = 3;         // Silently fails or TypeError
delete obj.x;      // Silently fails or TypeError

console.log(obj);  // { x: 1, y: 2 }
```

**Strict mode enforcement:**

```javascript
"use strict";

const obj = Object.freeze({ x: 1 });
obj.x = 10;  // TypeError: Cannot assign to read only property 'x'
```

**Shallow freeze:**

`Object.freeze()` is **shallow**—nested objects are not frozen:

```javascript
const obj = Object.freeze({
  x: 1,
  nested: { y: 2 }
});

obj.x = 10;           // TypeError
obj.nested.y = 20;    // OK (nested object not frozen)
obj.nested.z = 30;    // OK

console.log(obj);     // { x: 1, nested: { y: 20, z: 30 } }
```

**Deep freeze:**

```javascript
function deepFreeze(obj) {
  Object.freeze(obj);
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null
        && (typeof obj[prop] === "object" || typeof obj[prop] === "function")
        && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  
  return obj;
}

const obj = deepFreeze({
  x: 1,
  nested: { y: 2 }
});

obj.nested.y = 20;  // TypeError (now frozen)
```

**Alternative: Immutable libraries**

For complex immutability needs, use libraries like:

- Immutable.js
- Immer
- seamless-immutable

---

### Scoping, Hoisting, and TDZ

`const` follows the same rules as `let`:

**Block-scoped:**

```javascript
{
  const x = 10;
}
console.log(x);  // ReferenceError
```

**Hoisted with TDZ:**

```javascript
{
  console.log(MAX);  // ReferenceError: Cannot access 'MAX' before initialization
  const MAX = 100;
}
```

**No re-declaration:**

```javascript
const x = 10;
const x = 20;  // SyntaxError
```

**No global object property:**

```javascript
const globalConst = "test";
console.log(window.globalConst);  // undefined
```

---

## 1.2.4 Hoisting Deep Dive

### What is Hoisting?

Hoisting is a **mental model** for understanding how JavaScript's engine processes variable and function declarations during the **compilation phase** before execution.

**Two phases of JavaScript execution:**

1. **Compilation (Creation) Phase:**
    - Scan code for declarations
    - Create bindings in execution context
    - Initialize `var` and function declarations
    - Create bindings (but don't initialize) for `let`, `const`, `class`
2. **Execution Phase:**
    - Execute code line by line
    - Assign values to variables
    - Call functions

---

### `var` Hoisting

**Source code:**

```javascript
console.log(x);  // undefined
var x = 5;
console.log(x);  // 5
```

**Compilation phase:**

1. Scan finds `var x`
2. Create binding `x` in function scope (or global scope)
3. Initialize `x` to `undefined`

**Execution phase:**

1. `console.log(x)` → prints `undefined`
2. `x = 5` → assigns 5 to `x`
3. `console.log(x)` → prints `5`

**Conceptual transformation:**

```javascript
var x;           // Hoisted: declaration + initialization to undefined
console.log(x);  // undefined
x = 5;           // Assignment stays in place
console.log(x);  // 5
```

---

### `let` and `const` Hoisting

`let` and `const` **are hoisted**, but unlike `var`, they are **not initialized**. This creates the TDZ.

**Source code:**

```javascript
console.log(x);  // ReferenceError
let x = 5;
console.log(x);  // 5
```

**Compilation phase:**

1. Scan finds `let x`
2. Create binding `x` in block scope
3. **Do not initialize** (TDZ begins)

**Execution phase:**

1. `console.log(x)` → `x` is in TDZ → ReferenceError
2. `let x = 5` → initialize `x` to `5` (TDZ ends)
3. `console.log(x)` → prints `5`

**Proof that `let` is hoisted:**

```javascript
let x = 'outer';

{
  console.log(x);  // ReferenceError (not 'outer')
  let x = 'inner';
}
```

If `let x` were not hoisted, `console.log(x)` would print `'outer'`. Instead, it throws ReferenceError because the inner `let x` is hoisted to the top of the block, creating a TDZ.

---

### Function Hoisting

**Function declarations are fully hoisted:**

```javascript
greet();  // "Hello"

function greet() {
  console.log("Hello");
}
```

**Compilation phase:**

1. Scan finds `function greet() {...}`
2. Create binding `greet` in function scope
3. Initialize `greet` to the function object

**Function expressions follow variable hoisting rules:**

```javascript
greet();  // TypeError: greet is not a function

var greet = function() {
  console.log("Hello");
};
```

The `var greet` is hoisted and initialized to `undefined`. Calling `greet()` tries to invoke `undefined`, causing a TypeError.

**With `let` or `const`:**

```javascript
greet();  // ReferenceError

let greet = function() {
  console.log("Hello");
};
```

---

### Variable vs Function Hoisting Priority

**When both variable and function have the same name:**

```javascript
console.log(typeof foo);  // "function"

var foo = "variable";

function foo() {
  console.log("function");
}

console.log(typeof foo);  // "string"
```

**Compilation phase:**

1. `var foo` creates binding `foo`, initializes to `undefined`
2. `function foo() {}` creates binding `foo`, initializes to function
3. **Function wins** (overwrites the `undefined`)

**Execution phase:**

1. `console.log(typeof foo)` → `"function"`
2. `foo = "variable"` → reassigns `foo` to `"variable"`
3. `console.log(typeof foo)` → `"string"`

**Function declarations take precedence over variable declarations during hoisting.**

---

### Hoisting in Different Scopes

**Global scope:**

```javascript
var globalVar = 1;
let globalLet = 2;
const globalConst = 3;

function globalFunc() {}
```

All hoisted to global scope, but:

- `var globalVar` creates property on global object
- `let globalLet` and `const globalConst` exist in global lexical environment
- `function globalFunc` creates property on global object

**Function scope:**

```javascript
function example() {
  var functionVar = 1;
  let functionLet = 2;
  const functionConst = 3;
  
  function nestedFunc() {}
}
```

All hoisted to `example` function's scope.

**Block scope:**

```javascript
{
  var blockVar = 1;     // Hoisted to enclosing function scope (or global)
  let blockLet = 2;     // Hoisted to block scope
  const blockConst = 3; // Hoisted to block scope
}

console.log(blockVar);   // 1
console.log(blockLet);   // ReferenceError
console.log(blockConst); // ReferenceError
```

---

## 1.2.5 Temporal Dead Zone (TDZ) Deep Dive

### Definition

The **Temporal Dead Zone** is the period between entering a scope and the point where a `let` or `const` variable is declared and initialized. During this time, the variable exists but cannot be accessed.

**Temporal (time-based), not spatial (location-based):**

```javascript
{
  // TDZ for x starts (scope entered)
  const f = () => x;  // Captures x, but doesn't execute
  // TDZ continues
  let x = 10;         // TDZ ends (declaration reached)
  f();                // 10 - now safe
}
```

---

### TDZ Triggers

**Accessing variable before declaration:**

```javascript
{
  console.log(x);  // ReferenceError: Cannot access 'x' before initialization
  let x = 10;
}
```

**Using in expression:**

```javascript
{
  let x = x + 1;  // ReferenceError (right-side x is in TDZ)
}
```

**Function calls:**

```javascript
{
  function getValue() {
    return x;
  }
  
  getValue();  // ReferenceError (x in TDZ)
  let x = 10;
}
```

---

### TDZ and Default Parameters

Function parameters are evaluated **left-to-right**, and each parameter is in TDZ until it's initialized:

```javascript
function example(a = b, b = 2) {
  return [a, b];
}

example();  // ReferenceError: Cannot access 'b' before initialization
```

**Why?**

1. Evaluate `a = b`
2. `b` is in TDZ (not yet initialized)
3. ReferenceError

**Correct order:**

```javascript
function example(b = 2, a = b) {
  return [a, b];
}

example();  // [2, 2]
```

**More complex example:**

```javascript
function f(x = y, y = 10) {
  return x + y;
}

f();  // ReferenceError
```

```javascript
function f(y = 10, x = y) {
  return x + y;
}

f();  // 20
```

---

### TDZ and `typeof`

Before ES6, `typeof` was "safe" for undeclared variables:

```javascript
console.log(typeof undeclaredVariable);  // "undefined"
```

With TDZ, this safety is lost for `let` and `const`:

```javascript
{
  console.log(typeof x);  // ReferenceError
  let x = 10;
}
```

But for truly undeclared variables (not in TDZ), `typeof` still works:

```javascript
console.log(typeof completelyUndeclared);  // "undefined"
```

**Practical issue:**

```javascript
// Check if a variable exists
if (typeof myVar !== 'undefined') {
  // Use myVar
}

// If myVar is let/const in enclosing scope, this throws ReferenceError!
{
  if (typeof myVar !== 'undefined') {  // ReferenceError
    console.log(myVar);
  }
  let myVar = 10;
}
```

**Solution: Try-catch:**

```javascript
{
  let exists = false;
  try {
    myVar;
    exists = true;
  } catch (e) {
    exists = false;
  }
  
  let myVar = 10;
}
```

---

### TDZ in Closures

Closures capture variables, including their TDZ state:

```javascript
{
  const funcs = [];
  
  funcs.push(() => x);  // Captures x (in TDZ)
  
  // funcs[0]() would throw ReferenceError here
  
  let x = 10;  // TDZ ends
  
  funcs[0]();  // 10 - now safe
}
```

**Timing matters:**

```javascript
{
  let funcs = [];
  
  for (let i = 0; i < 3; i++) {
    funcs.push(() => arr[i]);  // Captures arr (in TDZ)
  }
  
  // funcs[0]() would throw ReferenceError here
  
  let arr = [10, 20, 30];  // TDZ ends
  
  console.log(funcs[0]());  // 10
  console.log(funcs[1]());  // 20
  console.log(funcs[2]());  // 30
}
```

---

### Why TDZ Exists

**1. Catch errors early:**

Forces developers to declare before use, preventing subtle bugs:

```javascript
// Without TDZ (var behavior)
console.log(config);  // undefined (misleading)
var config = loadConfig();

// With TDZ (let/const behavior)
console.log(config);  // ReferenceError (clear error)
let config = loadConfig();
```

**2. Prevent `undefined` pollution:**

`var`'s automatic initialization to `undefined` masked bugs:

```javascript
// var: bug not caught
function processUser() {
  console.log(user);  // undefined (should be error!)
  // ... lots of code ...
  var user = getUser();
}

// let: bug caught immediately
function processUser() {
  console.log(user);  // ReferenceError (caught early!)
  // ... lots of code ...
  let user = getUser();
}
```

**3. `const` semantics:**

`const` cannot be initialized to `undefined` then assigned later. TDZ makes `let` and `const` consistent:

```javascript
// Without TDZ, this would be problematic
const x;  // Initialize to undefined?
x = 10;   // Then assign? (violates const semantics)

// TDZ solves this: const must be initialized at declaration
const x = 10;  // OK
```

**4. Align with other languages:**

Most block-scoped languages (Java, C#, Rust) forbid use-before-declaration. TDZ aligns JavaScript with these expectations.

---

## 1.2.6 Global Variables and `globalThis`

### Global Scope Mechanics

JavaScript has **two types of global variables**:

1. **Global object properties** (created by `var` and function declarations)
2. **Global lexical environment bindings** (created by `let` and `const`)

**Browser example:**

```javascript
var varGlobal = 1;
let letGlobal = 2;
const constGlobal = 3;

console.log(window.varGlobal);    // 1 (property)
console.log(window.letGlobal);    // undefined (not a property)
console.log(window.constGlobal);  // undefined (not a property)

console.log(varGlobal);           // 1
console.log(letGlobal);           // 2
console.log(constGlobal);         // 3
```

**Why the distinction?**

ES6 needed backward compatibility with `var` (which creates global properties) while providing better behavior for `let` and `const` (which don't pollute the global object).

---

### The Global Object

The global object is environment-dependent:

- **Browsers:** `window` (also `self`, `frames`)
- **Web Workers:** `self`
- **Node.js (CommonJS):** `global`
- **Node.js (ES modules):** No global object at top level (module scope)

**Historical inconsistency:**

```javascript
// Browser
var global = window;

// Node.js
var global = global;  // Already exists

// Web Worker
var global = self;
```

---

### `globalThis`: Universal Global Access

ES2020 introduced `globalThis` as a **standardized way** to access the global object across all environments:

```javascript
// Works everywhere
console.log(globalThis);

// Browser
console.log(globalThis === window);  // true

// Node.js (REPL or non-module)
console.log(globalThis === global);  // true

// Web Worker
console.log(globalThis === self);    // true
```

**Before `globalThis`, you needed this monstrosity:**

```javascript
var getGlobal = function() {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
};

var globalObj = getGlobal();
```

**Now:**

```javascript
var globalObj = globalThis;
```

---

### Global Pollution

**Problem:**

Every global variable can be accidentally overwritten or conflict with other scripts:

```javascript
// Library A
var config = { theme: 'dark' };

// Library B (loaded later)
var config = { apiKey: '12345' };  // Whoops! Overwrote Library A's config

// Your code
console.log(config);  // { apiKey: '12345' } (Library A broken)
```

**Solutions:**

**1. Use modules (best):**

ES6 modules have their own scope:

```javascript
// moduleA.js
let config = { theme: 'dark' };
export { config };

// moduleB.js
let config = { apiKey: '12345' };
export { config };

// main.js
import { config as configA } from './moduleA.js';
import { config as configB } from './moduleB.js';
// No conflict!
```

**2. Use IIFE (ES5 pattern):**

```javascript
// Library A
(function() {
  var config = { theme: 'dark' };
  // Use config...
})();

// Library B
(function() {
  var config = { apiKey: '12345' };
  // Use config...
})();

// No conflict - each IIFE has its own scope
```

**3. Use namespaces:**

```javascript
var LibraryA = LibraryA || {};
LibraryA.config = { theme: 'dark' };

var LibraryB = LibraryB || {};
LibraryB.config = { apiKey: '12345' };

console.log(LibraryA.config);  // { theme: 'dark' }
console.log(LibraryB.config);  // { apiKey: '12345' }
```

**4. Use `let`/`const` instead of `var`:**

At least they don't create global object properties:

```javascript
let config = { theme: 'dark' };
// window.config is undefined (doesn't pollute global object)
```

---

### Global Variables Best Practices

1. **Minimize globals**: Use modules or IIFEs
2. **Never use `var` at global level**: Use `let` or `const`
3. **Use strict mode**: Prevents accidental global creation
4. **Use linters**: Catch undeclared variable assignments
5. **Prefix globals if necessary**: `APP_CONFIG` instead of `config`
6. **Use `Object.freeze()` for global constants:**

```javascript
const CONFIG = Object.freeze({
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000
});
```

**7. Check for conflicts before declaring:**

```javascript
if (typeof MyLibrary === 'undefined') {
  let MyLibrary = {};
}
```

---

## 1.2.7 Practical Guidelines

### When to Use Each Declaration

**Use `const` by default:**

- Values that won't be reassigned
- Object and array references (even if mutated)
- Function expressions
- Imported modules
- Configuration objects

```javascript
const API_URL = 'https://api.example.com';
const config = { timeout: 5000 };
const users = [];

const getUserById = (id) => users.find(u => u.id === id);

// Can mutate
config.timeout = 10000;
users.push({ id: 1, name: 'Alice' });
```

**Use `let` when reassignment is needed:**

- Loop counters
- Conditional assignments
- Accumulator variables
- State that changes

```javascript
let count = 0;
let result;

for (let i = 0; i < 10; i++) {
  count += i;
}

if (condition) {
  result = 'yes';
} else {
  result = 'no';
}
```

**Never use `var` in modern code:**

- Legacy code maintenance only
- No legitimate use cases in ES6+

---

### Common Patterns

**1. Loop iteration:**

```javascript
// Use let for traditional loops
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// Use const for for-of (no reassignment)
for (const item of arr) {
  console.log(item);
}

// Use const for for-in
for (const key in obj) {
  console.log(key, obj[key]);
}
```

**2. Destructuring:**

```javascript
// Prefer const
const { name, age } = user;
const [first, second] = arr;

// Use let if reassigning
let { count } = state;
count = count + 1;
```

**3. Conditional assignment:**

```javascript
let message;

if (condition) {
  message = 'yes';
} else {
  message = 'no';
}

// Better: use const with ternary
const message = condition ? 'yes' : 'no';
```

**4. Accumulation:**

```javascript
let sum = 0;
for (const num of numbers) {
  sum += num;
}

// Or use reduce
const sum = numbers.reduce((acc, num) => acc + num, 0);
```

**5. Configuration objects:**

```javascript
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

// Can mutate properties
config.timeout = 10000;

// Can't reassign
// config = {};  // TypeError
```

---

## 1.2.8 Edge Cases and Gotchas

### 1. Variable Shadowing

**Shadowing occurs when an inner scope declares a variable with the same name as an outer scope:**

```javascript
let x = 1;

{
  let x = 2;  // Shadows outer x
  console.log(x);  // 2
}

console.log(x);  // 1
```

**Shadowing is allowed across scopes:**

```javascript
let x = 1;

function f() {
  let x = 2;  // Shadows global x
  {
    let x = 3;  // Shadows function's x
    console.log(x);  // 3
  }
  console.log(x);  // 2
}

f();
console.log(x);  // 1
```

**But not in the same scope:**

```javascript
let x = 1;
let x = 2;  // SyntaxError
```

**Function parameters create bindings:**

```javascript
function f(x) {  // x is a parameter (binding)
  let x = 10;    // SyntaxError: x already declared
}

function g(x) {
  {
    let x = 10;  // OK: different scope
  }
}
```

---

### 2. Switch Statement Scope

**`switch` creates a single block scope for all cases:**

```javascript
switch (value) {
  case 1:
    let x = 10;  // Declared in switch block
    break;
  case 2:
    let x = 20;  // SyntaxError: x already declared
    break;
}
```

**Solution: Use explicit blocks:**

```javascript
switch (value) {
  case 1: {
    let x = 10;
    console.log(x);
    break;
  }
  case 2: {
    let x = 20;  // OK: different block
    console.log(x);
    break;
  }
}
```

---

### 3. Destructuring with `const`

**Each destructured binding is individually `const`:**

```javascript
const { x, y } = { x: 1, y: 2 };

x = 10;  // TypeError: Assignment to constant variable
y = 20;  // TypeError: Assignment to constant variable
```

**`undefined` values don't throw errors:**

```javascript
const { a, b } = { a: 1 };  // b is undefined, but no error
console.log(b);  // undefined (not ReferenceError)
```

**Default values:**

```javascript
const { a = 10, b = 20 } = { a: 1 };
console.log(a);  // 1
console.log(b);  // 20 (default)
```

---

### 4. Loop Variable Reassignment

**`for` loops with `const` in the loop body:**

```javascript
for (const item of arr) {
  // item is const, cannot reassign
  item = newValue;  // TypeError
}
```

**But new binding each iteration:**

```javascript
for (const item of ['a', 'b', 'c']) {
  // Each iteration has its own 'item' binding
  console.log(item);
}
// Output: a, b, c
```

**Traditional `for` loop:**

```javascript
// Cannot use const for counter (it needs to be reassigned)
for (const i = 0; i < 3; i++) {  // TypeError on i++
  console.log(i);
}

// Use let
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

---

### 5. TDZ and Class Methods

```javascript
class Example {
  method() {
    return this.value;
  }
  
  value = this.method();  // ReferenceError: Cannot access 'method' before initialization
}
```

**Why?**

Class fields are initialized in declaration order. `value` is initialized before `method` is available.

**Solution:**

```javascript
class Example {
  constructor() {
    this.value = this.method();  // OK: constructor runs after class is fully initialized
  }
  
  method() {
    return 42;
  }
}
```

---

### 6. Closure Capture with `var` vs `let`

**`var` captures reference to single variable:**

```javascript
var funcs = [];

for (var i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}

console.log(funcs[0]());  // 3
console.log(funcs[1]());  // 3
console.log(funcs[2]());  // 3
```

**`let` creates new binding per iteration:**

```javascript
var funcs = [];

for (let i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}

console.log(funcs[0]());  // 0
console.log(funcs[1]());  // 1
console.log(funcs[2]());  // 2
```

---

### 7. Global Object vs Global Lexical Environment

**`var` creates property on global object:**

```javascript
var x = 10;
console.log(window.x);  // 10 (browsers)

delete window.x;  // true (can delete)
console.log(x);   // ReferenceError
```

**`let`/`const` in global lexical environment:**

```javascript
let x = 10;
console.log(window.x);  // undefined

delete window.x;  // true (but meaningless)
console.log(x);   // 10 (still exists)
```

---

### 8. Const with Object Methods

**`const` only prevents reassignment, not mutation:**

```javascript
const obj = {
  count: 0,
  increment() {
    this.count++;  // OK: mutating object
  }
};

obj.increment();
console.log(obj.count);  // 1

obj = { count: 10 };  // TypeError: cannot reassign
```

---

## 1.2.9 Performance Considerations

### Variable Lookup Performance

**Block-scoped variables (`let`, `const`) are generally faster:**

Modern JavaScript engines optimize block-scoped variables better because their lifetime is more predictable.

**Scope chain traversal:**

```javascript
var globalVar = 1;

function outer() {
  var outerVar = 2;
  
  function inner() {
    var innerVar = 3;
    
    // Accessing variables requires scope chain traversal
    console.log(innerVar);   // Fast: local scope
    console.log(outerVar);   // Slower: traverse 1 level
    console.log(globalVar);  // Slowest: traverse 2 levels
  }
  
  inner();
}
```

**Minimize global access:**

```javascript
// Slow: repeated global access
for (let i = 0; i < 1000; i++) {
  console.log(Math.random());  // Math is global, accessed 1000 times
}

// Faster: cache global reference
const { random } = Math;
for (let i = 0; i < 1000; i++) {
  console.log(random());  // Local reference, faster
}
```

---

### TDZ Overhead

**TDZ checks have minimal overhead:**

Modern engines optimize TDZ checks efficiently. The performance cost is negligible compared to the correctness benefits.

---

### Memory Considerations

**Closures and memory:**

```javascript
function createCounter() {
  let count = 0;  // Memory allocated
  
  return {
    increment() { count++; },
    getCount() { return count; }
  };
}

const counter = createCounter();  // 'count' stays in memory (closure)
```

**`var` vs `let`/`const` memory:**

No significant difference in memory usage. Block-scoped variables may be garbage collected sooner when leaving scope, but this is engine-dependent and rarely matters in practice.

---

## 1.2.10 Summary

### Declaration Comparison Table

|Feature|`var`|`let`|`const`|
|---|---|---|---|
|**Scope**|Function|Block|Block|
|**Hoisting**|Yes, initialized|Yes, TDZ|Yes, TDZ|
|**Re-declaration**|Allowed|Not allowed|Not allowed|
|**Reassignment**|Allowed|Allowed|Not allowed|
|**Initialization required**|No|No|Yes|
|**TDZ**|No|Yes|Yes|
|**Global object property**|Yes|No|No|
|**Per-iteration binding**|No (single binding)|Yes (new each time)|Yes (new each time)|

---

### Key Takeaways

1. **`const` is the default choice**: Use unless reassignment is needed
2. **`let` for reassignment**: Loop counters, conditional assignments
3. **Never use `var`**: Except in legacy code maintenance
4. **TDZ catches errors early**: Forces proper declaration ordering
5. **Block scoping is clearer**: Variables exist only where needed
6. **Hoisting still applies**: But differently for `var` vs `let`/`const`
7. **`const` ≠ immutable value**: Only the binding is immutable
8. **`globalThis` for global access**: Works across all environments
9. **Minimize global variables**: Use modules or IIFE patterns
10. **Each loop iteration gets new bindings with `let`**: Solves closure problems

---

### Modern Best Practices

```javascript
// Default to const
const MAX_RETRIES = 3;
const config = { timeout: 5000 };
const users = [];

// Use let when reassignment needed
let count = 0;
for (let i = 0; i < 10; i++) {
  count += i;
}

// Avoid var entirely
// var x = 10;  // DON'T

// Use const in for-of/for-in
for (const user of users) {
  console.log(user);
}

// Object mutation is fine with const
config.timeout = 10000;
users.push({ id: 1 });

// Use Object.freeze() for immutability
const CONSTANTS = Object.freeze({
  API_URL: 'https://api.example.com'
});
```

---

**End of Chapter 1.2: Variables and Declarations**

You now understand:

- The scoping rules of `var`, `let`, and `const`
- How hoisting works for each declaration type
- The Temporal Dead Zone and why it exists
- The difference between immutable bindings and immutable values
- Global variable mechanics and `globalThis`
- When to use each declaration type
- Common edge cases and gotchas
- Performance considerations

This knowledge is fundamental to writing predictable, maintainable JavaScript code.