# 3.3 Parameters and Arguments

## Introduction

JavaScript functions are flexible with parameters: default values, rest parameters, destructuring, and the `arguments` object provide powerful ways to handle function inputs.

---

## 3.3.1 Default Parameters

### Basic Syntax

```javascript
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}

greet();        // "Hello, Guest!"
greet("Alice"); // "Hello, Alice!"
```

---

### Default Values Can Be Expressions

```javascript
function createUser(name, id = generateId()) {
  return { name, id };
}

function greet(name, greeting = `Hello, ${name}`) {
  return greeting;
}
```

---

### Defaults Evaluated at Call Time

```javascript
let count = 0;

function increment(x = count++) {
  return x;
}

increment();  // 0 (count becomes 1)
increment();  // 1 (count becomes 2)
increment(10);  // 10 (default not used, count unchanged)
```

---

### Previous Parameters in Defaults

```javascript
function createRange(start, end = start + 10) {
  return { start, end };
}

createRange(5);  // { start: 5, end: 15 }
```

**But TDZ applies:**

```javascript
function f(a = b, b = 2) {  // ReferenceError: b in TDZ
  return [a, b];
}
```

---

### `undefined` Triggers Default

```javascript
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}

greet(undefined);  // "Hello, Guest!" (undefined triggers default)
greet(null);       // "Hello, null!" (null doesn't trigger default)
greet("");         // "Hello, !" (empty string doesn't trigger default)
```

---

### Defaults and `length` Property

**Parameters with defaults not counted:**

```javascript
function f(a, b = 2, c) { }
console.log(f.length);  // 1 (stops at first default)

function g(a, b, c = 3) { }
console.log(g.length);  // 2
```

---

## 3.3.2 Rest Parameters

### Basic Syntax

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);      // 6
sum(1, 2, 3, 4, 5); // 15
```

---

### Rest is an Array

```javascript
function log(...args) {
  console.log(Array.isArray(args));  // true
  console.log(args.length);
}

log(1, 2, 3);  // true, 3
```

---

### Combined with Regular Parameters

**Rest must be last:**

```javascript
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(" and ")}!`;
}

greet("Hello", "Alice", "Bob");  // "Hello, Alice and Bob!"

// Error: rest must be last
function invalid(...args, last) { }  // SyntaxError
```

---

### Rest vs `arguments`

|Feature|Rest (`...args`)|`arguments`|
|---|---|---|
|**Type**|Real array|Array-like object|
|**Methods**|All array methods|None (must convert)|
|**Arrow functions**|Works|Not available|
|**Excludes named params**|Yes|No (includes all)|

**Example:**

```javascript
function withRest(a, b, ...rest) {
  console.log(rest);  // [3, 4, 5] (excludes a and b)
}

function withArguments(a, b) {
  console.log(arguments);  // [1, 2, 3, 4, 5] (includes all)
}

withRest(1, 2, 3, 4, 5);
withArguments(1, 2, 3, 4, 5);
```

---

### Rest and `length`

**Rest parameter not counted:**

```javascript
function f(a, b, ...rest) { }
console.log(f.length);  // 2
```

---

## 3.3.3 `arguments` Object

### Basic Usage

**Array-like object containing all arguments:**

```javascript
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

sum(1, 2, 3);  // 6
```

---

### Not a Real Array

```javascript
function f() {
  console.log(Array.isArray(arguments));  // false
  console.log(arguments instanceof Array);  // false
  
  // No array methods
  arguments.forEach(x => console.log(x));  // TypeError
}
```

**Convert to array:**

```javascript
function f() {
  // ES6
  const args = Array.from(arguments);
  const args2 = [...arguments];
  
  // ES5
  const args3 = Array.prototype.slice.call(arguments);
}
```

---

### Properties

**`length` (number of arguments):**

```javascript
function f(a, b) {
  console.log(arguments.length);
}

f(1, 2, 3);  // 3 (actual arguments passed)
console.log(f.length);  // 2 (defined parameters)
```

**`callee` (the function itself):**

```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * arguments.callee(n - 1);
}

// Forbidden in strict mode
"use strict";
function f() {
  console.log(arguments.callee);  // TypeError
}
```

---

### Aliasing (Sloppy Mode)

**In sloppy mode, `arguments` tracks parameter changes:**

```javascript
function f(x) {
  x = 10;
  console.log(arguments[0]);  // 10 (aliased)
}

f(5);
```

**In strict mode, no aliasing:**

```javascript
"use strict";
function f(x) {
  x = 10;
  console.log(arguments[0]);  // 5 (not aliased)
}

f(5);
```

---

### Not Available in Arrow Functions

```javascript
const arrow = () => {
  console.log(arguments);  // ReferenceError
};

// Use rest parameters instead
const withRest = (...args) => {
  console.log(args);  // Works
};
```

---

### Modern Alternative: Rest Parameters

**Prefer rest parameters:**

```javascript
// Old way (avoid)
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}

// Modern way (prefer)
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
```

---

## 3.3.4 Parameter Destructuring

### Array Destructuring

```javascript
function sum([a, b]) {
  return a + b;
}

sum([5, 3]);  // 8

// With rest
function first([head, ...tail]) {
  console.log(head);  // 1
  console.log(tail);  // [2, 3]
}

first([1, 2, 3]);
```

---

### Object Destructuring

```javascript
function greet({ name, age }) {
  return `${name} is ${age} years old`;
}

greet({ name: "Alice", age: 30 });  // "Alice is 30 years old"

// With defaults
function greet({ name = "Guest", age = 0 } = {}) {
  return `${name} is ${age} years old`;
}

greet();  // "Guest is 0 years old"
greet({ name: "Bob" });  // "Bob is 0 years old"
```

---

### Nested Destructuring

```javascript
function processUser({ name, address: { city, country } }) {
  console.log(`${name} lives in ${city}, ${country}`);
}

processUser({
  name: "Alice",
  address: { city: "NYC", country: "USA" }
});
// "Alice lives in NYC, USA"
```

---

### Renaming

```javascript
function greet({ name: userName }) {
  return `Hello, ${userName}!`;
}

greet({ name: "Alice" });  // "Hello, Alice!"
```

---

### With Rest

```javascript
function process({ id, ...rest }) {
  console.log(id);    // 1
  console.log(rest);  // { name: "Alice", age: 30 }
}

process({ id: 1, name: "Alice", age: 30 });
```

---

## 3.3.5 Spread in Function Calls

### Basic Usage

```javascript
function sum(a, b, c) {
  return a + b + c;
}

const numbers = [1, 2, 3];
sum(...numbers);  // 6 (same as sum(1, 2, 3))
```

---

### Combining with Regular Arguments

```javascript
function greet(greeting, ...names) {
  return `${greeting}, ${names.join(" and ")}!`;
}

const people = ["Alice", "Bob"];
greet("Hello", ...people);  // "Hello, Alice and Bob!"
```

---

### Multiple Spreads

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

sum(...arr1, ...arr2);  // 21
```

---

### With Other Values

```javascript
function log(a, b, c, d, e) {
  console.log(a, b, c, d, e);
}

log(1, ...[2, 3], 4, 5);  // 1, 2, 3, 4, 5
```

---

### Spread Any Iterable

```javascript
const str = "hello";
console.log(...str);  // "h" "e" "l" "l" "o"

const set = new Set([1, 2, 3]);
Math.max(...set);  // 3
```

---

