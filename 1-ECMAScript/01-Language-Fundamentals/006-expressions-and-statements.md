# 1.6 Expressions and Statements

## Introduction

JavaScript code consists of **expressions** (produce values) and **statements** (perform actions). Understanding this distinction is fundamental—expressions can be used anywhere a value is expected, while statements control program flow and structure.

This chapter dissects primary expressions, left-hand-side expressions, statement types, control flow, and jump statements. We'll examine how expressions and statements combine, their side effects, and the subtle rules governing their use.

---

## 1.6.1 Expressions vs Statements

### Definitions

**Expression:**

- Produces a value
- Can be used anywhere a value is expected
- Examples: `5`, `x + 2`, `func()`, `a ? b : c`

**Statement:**

- Performs an action
- Cannot be used as a value
- Examples: `if`, `for`, `while`, `let x = 5;`

---

### Key Differences

```javascript
// Expression: produces value
5 + 3;              // Evaluates to 8
x = 10;             // Evaluates to 10 (and assigns)
user.getName();     // Evaluates to return value

// Statement: performs action
let x = 5;          // Declares variable (no value produced)
if (x > 0) { }      // Controls flow (no value)
while (true) { }    // Loop (no value)

// Expression statement: expression used as statement
5 + 3;              // Valid (but useless)
console.log("hi");  // Expression used as statement
```

**Where expressions can be used:**

```javascript
// Anywhere a value is expected
let x = 5 + 3;           // Right side of assignment
console.log(5 + 3);      // Function argument
arr[5 + 3];              // Array index
obj[5 + 3];              // Property access
(5 + 3) + 2;             // Part of larger expression
return 5 + 3;            // Return value
```

**Where statements can be used:**

```javascript
// At statement position
if (x > 0) { }           // Control flow
for (let i = 0; i < 10; i++) { }  // Loop
let x = 5;               // Declaration
```

---

### Expression Statements

Any expression can be used as a statement (though often pointless):

```javascript
// Valid expression statements
5;                  // Evaluates to 5 (discarded)
"hello";            // Evaluates to "hello" (discarded)
x + y;              // Evaluates (result discarded)
func();             // Calls function (side effects may occur)

// Common expression statements
console.log("hi");  // Function call
x = 5;              // Assignment
x++;                // Increment
arr.push(5);        // Method call
```

---

## 1.6.2 Primary Expressions

Primary expressions are the simplest expressions—literals and identifiers.

### Literals

**Primitive literals:**

```javascript
// Number
42
3.14
0xFF
0b1010
0o77
1e5
123n  // BigInt

// String
"hello"
'world'
`template`

// Boolean
true
false

// Null and undefined
null
undefined

// Regular expression
/pattern/flags
```

**Object literals:**

```javascript
{}
{ x: 1, y: 2 }
{ name: "Alice", age: 30 }

// Computed property names
{ [key]: value }
{ ["prop" + 1]: "value" }

// Method shorthand
{ method() { } }

// Getter/setter
{ get prop() { }, set prop(value) { } }
```

**Array literals:**

```javascript
[]
[1, 2, 3]
[1, , 3]  // Sparse (hole at index 1)
[...arr]  // Spread
```

**Function literals:**

```javascript
function() { }
function(x) { return x * 2; }
function name(x) { return x * 2; }

// Arrow functions
() => { }
x => x * 2
(x, y) => x + y
```

**Class literals:**

```javascript
class { }
class MyClass { }
class extends Parent { }
```

**Template literals:**

```javascript
`hello`
`hello ${name}`
`multi
line
string`

// Tagged template
tag`template`
```

---

### Identifiers

Variable, function, and property names:

```javascript
x
userName
_private
$jquery
Symbol.iterator
```

---

### Reserved Words as Property Names

**Allowed in object literals and member access:**

```javascript
let obj = {
  if: 1,
  while: 2,
  class: 3,
  return: 4
};

console.log(obj.if);      // 1
console.log(obj["if"]);   // 1

// But not as identifiers
let if = 5;  // SyntaxError
```

---

## 1.6.3 Left-Hand-Side Expressions

Expressions that can appear on the left side of an assignment.

### Property Access

**Dot notation:**

```javascript
obj.property
obj.method()
arr.length
```

**Bracket notation:**

```javascript
obj[property]
obj["property"]
arr[0]
arr[index]
obj[dynamicKey]
```

**Computed property access:**

```javascript
obj[key]
obj["prop" + suffix]
obj[func()]
```

---

### Function Calls

**Regular calls:**

```javascript
func()
func(arg1, arg2)
obj.method()
obj.method(arg1, arg2)
```

**Constructor calls:**

```javascript
new Constructor()
new Constructor(arg1, arg2)
new Date()
new Array(5)
```

**Optional chaining in calls:**

```javascript
func?.()              // Call if func is not nullish
obj.method?.()        // Call if method is not nullish
obj?.method()         // Access method if obj is not nullish
```

---

### `new` Expression

**With arguments:**

```javascript
new Constructor(arg1, arg2)
new Date()
new Array(5)
new Map()
```

**Without arguments:**

```javascript
new Constructor
new Date
new Array  // Same as new Array()
```

**Precedence matters:**

```javascript
new Constructor().method();    // (new Constructor()).method()
new Constructor.staticMethod(); // new (Constructor.staticMethod)()
```

---

### `super` Expression

**In class methods:**

```javascript
class Child extends Parent {
  constructor() {
    super();          // Call parent constructor
  }
  
  method() {
    super.method();   // Call parent method
  }
}
```

**In object literals:**

```javascript
let obj = {
  method() {
    super.method();  // Call method from prototype
  }
};
```

---

### `this` Expression

```javascript
this.property
this.method()

function f() {
  console.log(this);  // Depends on how f is called
}

// Method call
obj.f();  // this = obj

// Regular call
f();      // this = globalThis (sloppy) or undefined (strict)

// Constructor call
new f();  // this = new object

// Explicit binding
f.call(obj);   // this = obj
f.apply(obj);  // this = obj
f.bind(obj)(); // this = obj

// Arrow functions (lexical this)
const arrow = () => console.log(this);
```

---

### Import and Import.meta

**Import (static):**

```javascript
import { name } from "./module.js";
import * as ns from "./module.js";
import defaultExport from "./module.js";
```

**Dynamic import (expression):**

```javascript
import("./module.js").then(module => {
  // Use module
});

// In async function
const module = await import("./module.js");
```

**Import.meta:**

```javascript
import.meta.url;  // Current module URL
```

---

## 1.6.4 Expression Composition

### Binary Expressions

Operators with two operands:

```javascript
// Arithmetic
a + b
a - b
a * b
a / b
a % b
a ** b

// Comparison
a < b
a > b
a <= b
a >= b
a == b
a === b
a != b
a !== b

// Logical
a && b
a || b
a ?? b

// Bitwise
a & b
a | b
a ^ b
a << b
a >> b
a >>> b

// Relational
a in obj
a instanceof Constructor
```

---

### Unary Expressions

Operators with one operand:

```javascript
+x        // Numeric conversion
-x        // Negation
!x        // Logical NOT
~x        // Bitwise NOT
typeof x  // Type check
void x    // Returns undefined
delete x  // Delete property
++x       // Pre-increment
--x       // Pre-decrement
x++       // Post-increment
x--       // Post-decrement
await x   // Await promise (async context)
```

---

### Ternary Expression

Conditional operator (only ternary operator):

```javascript
condition ? trueValue : falseValue

x > 0 ? "positive" : "negative"

// Nested
x > 0 ? "positive" :
x < 0 ? "negative" : "zero"
```

---

### Comma Expression

Evaluates multiple expressions, returns last:

```javascript
(a, b, c)     // Evaluates a, b, c; returns c
(x++, y++, z++)  // Increments all; returns z++

// In for loop
for (i = 0, j = 10; i < j; i++, j--) { }
```

---

### Grouping Expression

Parentheses control evaluation order:

```javascript
(expression)

(2 + 3) * 4    // 20 (vs 2 + 3 * 4 = 14)
(a, b, c)      // Comma expression
(function() {})()  // IIFE
```

---

## 1.6.5 Declaration Statements

### Variable Declarations

**`var` declarations:**

```javascript
var x;
var y = 10;
var a, b, c;
var m = 1, n = 2;
```

**`let` declarations:**

```javascript
let x;
let y = 10;
let a, b, c;
let m = 1, n = 2;

// Block-scoped
{
  let blockVar = 5;
}
// blockVar not accessible here
```

**`const` declarations:**

```javascript
const PI = 3.14159;
const obj = { x: 1 };

// Must be initialized
const x;  // SyntaxError

// Cannot reassign
const y = 5;
y = 10;  // TypeError
```

---

### Function Declarations

**Named function:**

```javascript
function name(params) {
  // Body
}

function add(a, b) {
  return a + b;
}
```

**Generator function:**

```javascript
function* gen() {
  yield 1;
  yield 2;
}

const g = gen();
g.next();  // { value: 1, done: false }
```

**Async function:**

```javascript
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}
```

**Async generator:**

```javascript
async function* asyncGen() {
  yield await promise1;
  yield await promise2;
}
```

---

### Class Declarations

**Basic class:**

```javascript
class MyClass {
  constructor(x) {
    this.x = x;
  }
  
  method() {
    return this.x;
  }
}
```

**Class with inheritance:**

```javascript
class Child extends Parent {
  constructor(x, y) {
    super(x);
    this.y = y;
  }
  
  method() {
    return super.method() + this.y;
  }
}
```

---

### Import/Export Declarations

**Export:**

```javascript
export const value = 42;
export function func() { }
export class MyClass { }

export { name1, name2 };
export { name1 as alias };

export default value;
export default function() { }
export default class { }
```

**Import:**

```javascript
import { name } from "./module.js";
import { name as alias } from "./module.js";
import * as ns from "./module.js";
import defaultExport from "./module.js";
import defaultExport, { name } from "./module.js";
```

---

## 1.6.6 Control Flow Statements

### `if` Statement

**Basic:**

```javascript
if (condition) {
  // Execute if true
}

if (x > 0) {
  console.log("positive");
}
```

**With `else`:**

```javascript
if (condition) {
  // Execute if true
} else {
  // Execute if false
}

if (x > 0) {
  console.log("positive");
} else {
  console.log("not positive");
}
```

**With `else if`:**

```javascript
if (condition1) {
  // Execute if condition1 is true
} else if (condition2) {
  // Execute if condition2 is true
} else {
  // Execute if all false
}

if (x > 0) {
  console.log("positive");
} else if (x < 0) {
  console.log("negative");
} else {
  console.log("zero");
}
```

**Without braces (single statement):**

```javascript
if (x > 0) console.log("positive");

if (x > 0)
  console.log("positive");
else
  console.log("not positive");

// Dangling else problem
if (x > 0)
  if (y > 0)
    console.log("both positive");
else  // Binds to inner if!
  console.log("x positive, y not");

// Use braces for clarity
if (x > 0) {
  if (y > 0) {
    console.log("both positive");
  }
} else {
  console.log("x not positive");
}
```

---

### `switch` Statement

**Basic:**

```javascript
switch (expression) {
  case value1:
    // Execute if expression === value1
    break;
  case value2:
    // Execute if expression === value2
    break;
  default:
    // Execute if no case matches
}
```

**Example:**

```javascript
switch (day) {
  case 0:
    console.log("Sunday");
    break;
  case 1:
    console.log("Monday");
    break;
  case 2:
    console.log("Tuesday");
    break;
  // ...
  default:
    console.log("Unknown day");
}
```

**Fall-through (intentional):**

```javascript
switch (month) {
  case 1:
  case 3:
  case 5:
  case 7:
  case 8:
  case 10:
  case 12:
    console.log("31 days");
    break;
  case 4:
  case 6:
  case 9:
  case 11:
    console.log("30 days");
    break;
  case 2:
    console.log("28 or 29 days");
    break;
}
```

**Block scope in cases:**

```javascript
switch (value) {
  case 1: {
    let x = 10;
    console.log(x);
    break;
  }
  case 2: {
    let x = 20;  // Different scope, no conflict
    console.log(x);
    break;
  }
}
```

**Without `break` (fall-through bug):**

```javascript
switch (x) {
  case 1:
    console.log("one");
    // Falls through!
  case 2:
    console.log("two");
    // Falls through!
  case 3:
    console.log("three");
}

// If x = 1, logs: "one", "two", "three"
```

**Using expressions in cases:**

```javascript
switch (true) {
  case x > 0:
    console.log("positive");
    break;
  case x < 0:
    console.log("negative");
    break;
  default:
    console.log("zero");
}
```

---

## 1.6.7 Loop Statements

### `while` Loop

**Syntax:**

```javascript
while (condition) {
  // Execute while condition is true
}
```

**Example:**

```javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
// 0, 1, 2, 3, 4
```

**Infinite loop:**

```javascript
while (true) {
  // Runs forever (use break to exit)
}
```

---

### `do-while` Loop

**Syntax:**

```javascript
do {
  // Execute at least once
} while (condition);
```

**Example:**

```javascript
let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);
// 0, 1, 2, 3, 4

// Executes at least once even if condition is false
let j = 10;
do {
  console.log(j);  // Logs 10
} while (j < 5);
```

---

### `for` Loop

**Syntax:**

```javascript
for (initialization; condition; increment) {
  // Execute while condition is true
}
```

**Example:**

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 0, 1, 2, 3, 4
```

**Parts are optional:**

```javascript
// Infinite loop
for (;;) {
  // Runs forever
}

// Initialization outside
let i = 0;
for (; i < 5; i++) {
  console.log(i);
}

// Increment inside body
for (let i = 0; i < 5;) {
  console.log(i);
  i++;
}
```

**Multiple variables:**

```javascript
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
```

**`let` creates per-iteration binding:**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2 (each iteration has its own i)

// vs var (single binding)
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3
```

---

### `for-in` Loop

Iterate over enumerable properties:

```javascript
for (variable in object) {
  // Execute for each property
}
```

**Example:**

```javascript
let obj = { a: 1, b: 2, c: 3 };

for (let key in obj) {
  console.log(key, obj[key]);
}
// "a" 1
// "b" 2
// "c" 3
```

**Arrays (avoid):**

```javascript
let arr = [10, 20, 30];

for (let index in arr) {
  console.log(index, arr[index]);
}
// "0" 10  (index is string!)
// "1" 20
// "2" 30

// Plus inherited properties (if any)
// Use for-of instead
```

**Inherited properties:**

```javascript
let parent = { inherited: true };
let child = Object.create(parent);
child.own = true;

for (let key in child) {
  console.log(key);
}
// "own"
// "inherited"

// Filter own properties
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key);  // Only "own"
  }
}
```

---

### `for-of` Loop

Iterate over iterable objects:

```javascript
for (variable of iterable) {
  // Execute for each value
}
```

**Arrays:**

```javascript
let arr = [10, 20, 30];

for (let value of arr) {
  console.log(value);
}
// 10, 20, 30
```

**Strings:**

```javascript
let str = "hello";

for (let char of str) {
  console.log(char);
}
// "h", "e", "l", "l", "o"

// Works with Unicode correctly
for (let char of "😀🎉") {
  console.log(char);
}
// "😀", "🎉"
```

**Sets:**

```javascript
let set = new Set([1, 2, 3]);

for (let value of set) {
  console.log(value);
}
// 1, 2, 3
```

**Maps:**

```javascript
let map = new Map([["a", 1], ["b", 2]]);

for (let [key, value] of map) {
  console.log(key, value);
}
// "a" 1
// "b" 2

// Just keys
for (let key of map.keys()) {
  console.log(key);
}

// Just values
for (let value of map.values()) {
  console.log(value);
}
```

**Custom iterables:**

```javascript
let range = {
  from: 1,
  to: 5,
  
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      
      next() {
        if (this.current <= this.last) {
          return { value: this.current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (let num of range) {
  console.log(num);
}
// 1, 2, 3, 4, 5
```

**Destructuring:**

```javascript
let arr = [[1, 2], [3, 4], [5, 6]];

for (let [a, b] of arr) {
  console.log(a, b);
}
// 1 2
// 3 4
// 5 6
```

---

### `for await...of` Loop

Iterate over async iterables:

```javascript
for await (variable of asyncIterable) {
  // Execute for each value
}
```

**Example:**

```javascript
async function* asyncGen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

(async () => {
  for await (let value of asyncGen()) {
    console.log(value);
  }
})();
// 1, 2, 3 (awaits each promise)
```

---

## 1.6.8 Jump Statements

### `break` Statement

**Exit loop:**

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);
}
// 0, 1, 2, 3, 4
```

**Exit switch:**

```javascript
switch (value) {
  case 1:
    console.log("one");
    break;  // Exit switch
  case 2:
    console.log("two");
    break;
}
```

**Labeled break:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    console.log(i, j);
  }
}
// 0 0
// 0 1
// 0 2
// 1 0
```

**Cannot break from function:**

```javascript
function f() {
  for (let i = 0; i < 10; i++) {
    break;  // OK: breaks loop
  }
  break;  // SyntaxError: not in loop/switch
}
```

---

### `continue` Statement

**Skip to next iteration:**

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);
}
// 0, 1, 3, 4 (skips 2)
```

**In while loop:**

```javascript
let i = 0;
while (i < 5) {
  i++;
  if (i === 2) continue;
  console.log(i);
}
// 1, 3, 4, 5 (skips 2)
```

**Labeled continue:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;
    console.log(i, j);
  }
}
// 0 0
// 1 0
// 2 0
```

**Only in loops (not switch):**

```javascript
switch (value) {
  case 1:
    continue;  // SyntaxError
}
```

---

### `return` Statement

**Return value from function:**

```javascript
function add(a, b) {
  return a + b;
}

let result = add(5, 3);  // 8
```

**Return without value (returns `undefined`):**

```javascript
function log(msg) {
  console.log(msg);
  return;  // Returns undefined
}

function noReturn() {
  // Implicit: return undefined;
}
```

**Early return:**

```javascript
function processUser(user) {
  if (!user) return;  // Early exit
  
  // Process user
}
```

**Cannot return from top-level:**

```javascript
// Top-level code
return 42;  // SyntaxError (not in function)
```

**Return in arrow functions:**

```javascript
// Implicit return (single expression)
const add = (a, b) => a + b;

// Explicit return (block body)
const add = (a, b) => {
  return a + b;
};

// Returning object literal (wrap in parens)
const makeObj = () => ({ x: 1, y: 2 });
```

---

### `throw` Statement

**Throw exception:**

```javascript
throw expression;

throw new Error("Something went wrong");
throw "Error message";  // Can throw any value
throw 42;
throw { code: 500, message: "Server error" };
```

**Examples:**

```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (error) {
  console.log(error.message);  // "Division by zero"
}
```

**Custom errors:**

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

throw new ValidationError("Invalid input");
```

---

### `try-catch-finally` Statement

**Basic try-catch:**

```javascript
try {
  // Code that might throw
  riskyOperation();
} catch (error) {
  // Handle error
  console.log(error.message);
}
```

**With finally:**

```javascript
try {
  // Code that might throw
  riskyOperation();
} catch (error) {
  // Handle error
  console.log(error.message);
} finally {
  // Always executes (even if return in try/catch)
  cleanup();
}
```

**Catch without binding (ES2019):**

```javascript
try {
  riskyOperation();
} catch {
  // Don't need error variable
  console.log("Something went wrong");
}
```

**Finally executes even with return:**

```javascript
function f() {
  try {
    return 1;
  } finally {
    console.log("finally");  // Executes before return
  }
}

f();
// Logs: "finally"
// Returns: 1
```

**Finally overrides return:**

```javascript
function f() {
  try {
    return 1;
  } finally {
    return 2;  // Overrides try's return
  }
}

f();  // Returns 2
```

**Nested try-catch:**

```javascript
try {
  try {
    throw new Error("inner");
  } catch (error) {
    console.log("inner catch:", error.message);
    throw error;  // Re-throw
  }
} catch (error) {
  console.log("outer catch:", error.message);
}
// Logs: "inner catch: inner"
// Logs: "outer catch: inner"
```

---

## 1.6.9 Other Statements

### Empty Statement

**Syntax:**

```javascript
;
```

**Use case: Empty loop body:**

```javascript
// Process in loop condition
while (processNext());

// Empty for body
for (let i = 0; i < arr.length && arr[i] !== target; i++);
```

---

### Block Statement

**Syntax:**

```javascript
{
  // Statements
}
```

**Creates block scope for `let` and `const`:**

```javascript
{
  let x = 10;
  const y = 20;
}
// x and y not accessible here
```

**Multiple statements where one expected:**

```javascript
if (condition) {
  statement1;
  statement2;
  statement3;
}
```

---

### Labeled Statement

**Syntax:**

```javascript
label: statement
```

**Use with break/continue:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    console.log(i, j);
  }
}
```

**Label any statement:**

```javascript
myLabel: {
  console.log("start");
  if (condition) break myLabel;
  console.log("end");
}
```

---

### `with` Statement (Deprecated)

**Syntax:**

```javascript
with (object) {
  // Statements
}
```

**Example:**

```javascript
let obj = { x: 1, y: 2 };

with (obj) {
  console.log(x);  // 1 (looks up in obj)
  console.log(y);  // 2
}
```

**Problems:**

- Performance: Prevents optimizations
- Ambiguity: Unclear variable resolution
- Confusing: Hard to understand

**Forbidden in strict mode:**

```javascript
"use strict";
with (obj) {  // SyntaxError
  // ...
}
```

**Don't use `with`. Use destructuring instead:**

```javascript
let { x, y } = obj;
console.log(x, y);
```

---

### `debugger` Statement

**Syntax:**

```javascript
debugger;
```

**Effect:**

Pauses execution in debugger (if open):

```javascript
function buggyFunction() {
  let x = 5;
  debugger;  // Execution pauses here
  console.log(x);
}
```

**No effect if debugger not open.**

---

## 1.6.10 Expression vs Statement Contexts

### Where Statements Expected

**Top-level (module/script):**

```javascript
let x = 5;
function f() { }
class MyClass { }
if (x > 0) { }
```

**Function body:**

```javascript
function f() {
  let x = 5;
  if (x > 0) { }
  return x;
}
```

**Block body:**

```javascript
{
  let x = 5;
  console.log(x);
}
```

**Control flow bodies:**

```javascript
if (condition) {
  statements;
}

for (init; test; incr) {
  statements;
}

while (condition) {
  statements;
}
```

---

### Where Expressions Expected

**Assignment right-hand side:**

```javascript
let x = expression;
```

**Function arguments:**

```javascript
func(expression);
```

**Array elements:**

```javascript
[expression1, expression2];
```

**Object property values:**

```javascript
{ key: expression };
```

**Return value:**

```javascript
return expression;
```

**Conditional:**

```javascript
expression ? a : b;
```

---

### Ambiguous Constructs

**Object literal vs block:**

```javascript
// Block (statement context)
{ x: 1 }  // Label x, expression statement 1

// Object literal (expression context)
({ x: 1 })  // Object { x: 1 }
```

**Function declaration vs expression:**

```javascript
// Declaration (statement context)
function f() { }

// Expression (expression context)
(function f() { })
(function() { })  // Anonymous
```

**Class declaration vs expression:**

```javascript
// Declaration (statement context)
class MyClass { }

// Expression (expression context)
(class MyClass { })
(class { })  // Anonymous
```

---

## 1.6.11 Summary

### Expression Types

**Primary:**

- Literals: `42`, `"hello"`, `true`, `null`, `[]`, `{}`
- Identifiers: `x`, `userName`
- Keywords: `this`, `super`

**Left-hand-side:**

- Property access: `obj.prop`, `arr[0]`
- Calls: `func()`, `new Constructor()`
- Optional chaining: `obj?.prop`

**Operators:**

- Arithmetic: `a + b`, `a * b`
- Comparison: `a < b`, `a === b`
- Logical: `a && b`, `a || b`
- Ternary: `a ? b : c`

---

### Statement Types

**Declarations:**

- `let`, `const`, `var`
- `function`, `class`
- `import`, `export`

**Control flow:**

- `if`, `else`
- `switch`, `case`
- Loops: `for`, `while`, `do-while`, `for-in`, `for-of`

**Jump:**

- `break`, `continue`
- `return`, `throw`

**Exception handling:**

- `try`, `catch`, `finally`

**Other:**

- Block: `{ }`
- Empty: `;`
- Label: `label:`
- `with` (deprecated)
- `debugger`

---

### Key Takeaways

1. **Expressions produce values**, statements perform actions
2. **Expression statements** are valid but often useless
3. **Left-hand-side expressions** can be assigned to
4. **`let` in for loops** creates per-iteration binding
5. **`for-in` iterates properties** (use for objects)
6. **`for-of` iterates values** (use for arrays/iterables)
7. **`break` exits loops/switch**, `continue` skips iteration
8. **`return` exits function**, `throw` raises exception
9. **`finally` always executes**, even with return/throw
10. **Context determines** if `{ }` is block or object literal

---

**End of Chapter 1.6: Expressions and Statements**

You now understand:

- The distinction between expressions and statements
- All expression types (primary, left-hand-side, operators)
- All statement types (declarations, control flow, jumps)
- How loops work (`for`, `while`, `for-in`, `for-of`)
- Exception handling with try-catch-finally
- When to use break, continue, return, throw
- Block scope and labeled statements
- Ambiguous constructs and context resolution

This completes the Language Fundamentals section. You now have a deep understanding of JavaScript's core syntax, semantics, and execution model.