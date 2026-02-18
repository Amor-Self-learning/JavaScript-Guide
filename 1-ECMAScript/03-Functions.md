# 3 Functions

Functions are first-class citizens in JavaScript—they can be assigned to variables, passed as arguments, returned from other functions, and have properties. This chapter covers function fundamentals through advanced patterns, from basic declarations to generators and async functions.

---

## 3.1 Function Basics


### 3.1.1 Function Declarations

### Basic Syntax

```javascript
function name(parameters) {
  // Body
  return value;
}
```

**Example:**

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Alice"));  // "Hello, Alice!"
```

---

### Characteristics

**1. Hoisted to top of scope:**

```javascript
// Can call before declaration
console.log(add(5, 3));  // 8

function add(a, b) {
  return a + b;
}
```

**2. Creates a named binding:**

```javascript
function myFunc() { }

console.log(myFunc.name);  // "myFunc"
console.log(typeof myFunc);  // "function"
```

**3. Not an expression (cannot use in expression position):**

```javascript
// SyntaxError: function statement requires a name
if (true) function f() { }  // Not allowed in strict mode

// Valid: function expression
if (true) {
  function f() { }  // Allowed (function declaration in block)
}
```

---

### Function Hoisting

**Entire function is hoisted:**

```javascript
console.log(greet("Alice"));  // "Hello, Alice!"

function greet(name) {
  return `Hello, ${name}!`;
}
```

**Conceptually transformed to:**

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Alice"));  // "Hello, Alice!"
```

**Function declarations take precedence over `var`:**

```javascript
console.log(typeof foo);  // "function"

var foo = "variable";

function foo() {
  return "function";
}

console.log(typeof foo);  // "string" (reassigned)
```

**Compilation phase:**

1. `var foo` creates binding, initializes to `undefined`
2. `function foo() {}` overwrites with function
3. Execution: `foo = "variable"` reassigns to string

---

### Block-Scoped Function Declarations (Strict Mode)

**In strict mode, function declarations are block-scoped:**

```javascript
"use strict";

if (true) {
  function f() { return "inside"; }
  console.log(f());  // "inside"
}

console.log(typeof f);  // "undefined" (not accessible outside block)
```

**In sloppy mode, behavior is inconsistent:**

```javascript
// Sloppy mode (avoid this)
if (true) {
  function f() { return "inside"; }
}

console.log(typeof f);  // "function" (hoisted to enclosing function/global)
```

**Always use strict mode to avoid confusion.**

---

### 3.1.2 Function Expressions

### Basic Syntax

```javascript
const name = function(parameters) {
  // Body
  return value;
};
```

**Example:**

```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};

console.log(greet("Alice"));  // "Hello, Alice!"
```

---

### Characteristics

**1. Not hoisted (variable is hoisted, not the function):**

```javascript
console.log(add(5, 3));  // TypeError: add is not a function

var add = function(a, b) {
  return a + b;
};
```

**With `var` hoisting:**

```javascript
var add;  // Hoisted, initialized to undefined
console.log(add(5, 3));  // TypeError (undefined is not a function)

add = function(a, b) {
  return a + b;
};
```

**With `let`/`const` (TDZ):**

```javascript
console.log(add(5, 3));  // ReferenceError: Cannot access 'add' before initialization

const add = function(a, b) {
  return a + b;
};
```

**2. Can be used in expression position:**

```javascript
// As argument
setTimeout(function() {
  console.log("delayed");
}, 1000);

// As return value
function createAdder() {
  return function(x) {
    return x + 10;
  };
}

// In array
const funcs = [
  function() { return 1; },
  function() { return 2; }
];
```

**3. Usually anonymous (but can be named):**

```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};

console.log(greet.name);  // "greet" (inferred from variable name)
```

---

### 3.1.3 Anonymous Functions

### Definition

Functions without a name:

```javascript
function(x) {
  return x * 2;
}
```

---

### Common Uses

**Callbacks:**

```javascript
setTimeout(function() {
  console.log("done");
}, 1000);

arr.map(function(x) {
  return x * 2;
});
```

**IIFEs (Immediately Invoked Function Expressions):**

```javascript
(function() {
  console.log("IIFE");
})();

// Alternative syntax
(function() {
  console.log("IIFE");
}());
```

**Event handlers:**

```javascript
button.addEventListener("click", function(event) {
  console.log("clicked");
});
```

---

### Name Inference

**Modern engines infer names from context:**

```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};

console.log(greet.name);  // "greet"

const obj = {
  method: function() { }
};

console.log(obj.method.name);  // "method"
```

**But not always:**

```javascript
const funcs = [function() { }];
console.log(funcs[0].name);  // "" (empty)

arr.map(function(x) { return x * 2; })[0].name;  // "" (empty)
```

---

### Drawbacks of Anonymous Functions

**1. Stack traces are less helpful:**

```javascript
// Anonymous
setTimeout(function() {
  throw new Error("oops");
}, 1000);

// Stack trace:
// Error: oops
//     at <anonymous>  ← Not helpful

// Named
setTimeout(function handleTimeout() {
  throw new Error("oops");
}, 1000);

// Stack trace:
// Error: oops
//     at handleTimeout  ← More helpful
```

**2. No self-reference:**

```javascript
// Cannot reference itself
const countdown = function(n) {
  if (n > 0) {
    console.log(n);
    countdown(n - 1);  // Works (variable name)
  }
};

countdown(3);  // 3, 2, 1

// But if reassigned:
const original = countdown;
countdown = null;
original(3);  // TypeError: countdown is not a function
```

---

### 3.1.4 Named Function Expressions

### Syntax

```javascript
const name1 = function name2(parameters) {
  // Body
};
```

**Example:**

```javascript
const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);  // Self-reference
};

console.log(factorial(5));  // 120
```

---

### Name Scope

**Function name only visible inside function:**

```javascript
const greet = function sayHello(name) {
  console.log(sayHello.name);  // "sayHello" (accessible inside)
  return `Hello, ${name}!`;
};

console.log(greet.name);    // "sayHello"
console.log(sayHello);      // ReferenceError: sayHello is not defined
```

---

### Self-Reference

**Reliable recursion:**

```javascript
const countdown = function count(n) {
  if (n > 0) {
    console.log(n);
    count(n - 1);  // Always refers to this function
  }
};

const original = countdown;
countdown = null;
original(3);  // Still works! (count is stable)
```

**vs anonymous:**

```javascript
let countdown = function(n) {
  if (n > 0) {
    console.log(n);
    countdown(n - 1);  // References variable (can change)
  }
};

let original = countdown;
countdown = null;
original(3);  // TypeError: countdown is not a function
```

---

### Best Practice

**Use named function expressions for:**

1. **Recursion** (reliable self-reference)
2. **Stack traces** (better debugging)
3. **Self-documenting code** (clear intent)

```javascript
// Good
const users = data.map(function transformUser(raw) {
  return {
    id: raw.id,
    name: raw.name.toUpperCase()
  };
});

// Stack trace will show "transformUser" instead of "<anonymous>"
```

---

### 3.1.5 Function Properties and Methods

### `name` Property

```javascript
function myFunc() { }
console.log(myFunc.name);  // "myFunc"

const anon = function() { };
console.log(anon.name);  // "anon" (inferred)

const named = function myName() { };
console.log(named.name);  // "myName"

const arrow = () => { };
console.log(arrow.name);  // "arrow" (inferred)
```

---

### `length` Property

**Number of parameters (excluding rest and defaults):**

```javascript
function f(a, b, c) { }
console.log(f.length);  // 3

function g(a, b = 2, c) { }
console.log(g.length);  // 1 (stops at first default)

function h(a, b, ...rest) { }
console.log(h.length);  // 2 (rest not counted)
```

---

### `prototype` Property

**Only on regular functions (not arrows):**

```javascript
function F() { }
console.log(F.prototype);  // { constructor: F }

const arrow = () => { };
console.log(arrow.prototype);  // undefined
```

---

### `call()`, `apply()`, `bind()`

**Explicit `this` binding:**

```javascript
function greet(greeting) {
  return `${greeting}, ${this.name}!`;
}

const user = { name: "Alice" };

// call: arguments individually
greet.call(user, "Hello");  // "Hello, Alice!"

// apply: arguments as array
greet.apply(user, ["Hi"]);  // "Hi, Alice!"

// bind: create new function with bound this
const boundGreet = greet.bind(user, "Hey");
boundGreet();  // "Hey, Alice!"
```

---

### 3.1.6 IIFEs (Immediately Invoked Function Expressions)

### Syntax

```javascript
(function() {
  // Body
})();

// Alternative
(function() {
  // Body
}());
```

---

### Use Cases

**1. Create private scope:**

```javascript
(function() {
  const private = "hidden";
  console.log(private);  // "hidden"
})();

console.log(private);  // ReferenceError
```

**2. Avoid global pollution:**

```javascript
(function() {
  const helper = function() { };
  const utils = { };
  
  // Use helper and utils
  // They don't leak to global scope
})();
```

**3. Module pattern (pre-ES6):**

```javascript
const myModule = (function() {
  const privateVar = "secret";
  
  function privateFunc() {
    return privateVar;
  }
  
  return {
    publicMethod() {
      return privateFunc();
    }
  };
})();

console.log(myModule.publicMethod());  // "secret"
console.log(myModule.privateVar);      // undefined
```

**4. Capture loop variable (pre-ES6):**

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);
    }, 100);
  })(i);
}
// 0, 1, 2 (each IIFE has its own j)
```

---

### Modern Alternative: Blocks

**ES6 block scoping:**

```javascript
{
  const private = "hidden";
  console.log(private);
}

console.log(private);  // ReferenceError
```

**Modules:**

```javascript
// module.js
const privateVar = "secret";

function privateFunc() { }

export function publicMethod() {
  return privateFunc();
}
```

---

### 3.1.7 Function Declaration vs Expression

### Comparison

|Feature|Declaration|Expression|
|---|---|---|
|**Hoisting**|Entire function|Variable only (not function)|
|**Name required**|Yes|No (but can be named)|
|**Expression position**|No|Yes|
|**Block scoping (strict)**|Yes|N/A (follows variable scoping)|
|**Best for**|Top-level, module exports|Callbacks, conditional assignment|

---

### When to Use Each

**Function Declaration:**

```javascript
// Top-level functions
function processData(data) {
  return data.map(transform);
}

// Named exports (modules)
export function validate(input) {
  // ...
}
```

**Function Expression:**

```javascript
// Callbacks
arr.map(function(x) { return x * 2; });

// Conditional assignment
const operation = isAdd ? function(a, b) { return a + b; }
                        : function(a, b) { return a - b; };

// Methods
const obj = {
  method: function() { }
};

// IIFEs
(function() { })();
```

---


## 3.2 Arrow Functions


### 3.2.1 Syntax Variations

### Basic Syntax

```javascript
(parameters) => { body }
```

---

### No Parameters

```javascript
() => { return 42; }

// Or implicit return
() => 42
```

---

### Single Parameter (No Parentheses)

```javascript
x => { return x * 2; }

// Implicit return
x => x * 2
```

---

### Multiple Parameters

```javascript
(a, b) => { return a + b; }

// Implicit return
(a, b) => a + b
```

---

### Default Parameters

```javascript
(a = 0, b = 0) => a + b
```

---

### Rest Parameters

```javascript
(...args) => args.reduce((sum, x) => sum + x, 0)
```

---

### Destructuring Parameters

```javascript
({ x, y }) => x + y

([a, b]) => a + b
```

---

### 3.2.2 Implicit Return

### Single Expression (No Braces)

```javascript
const double = x => x * 2;

const add = (a, b) => a + b;

const greet = name => `Hello, ${name}!`;
```

---

### Returning Object Literal

**Must wrap in parentheses:**

```javascript
// Wrong: interpreted as block
const makeObj = x => { x: x };  // undefined (block, not object)

// Correct: wrap in parentheses
const makeObj = x => ({ x: x });

const user = name => ({ name, age: 0 });
```

---

### Multi-Line Implicit Return

```javascript
const transform = data =>
  data
    .map(x => x * 2)
    .filter(x => x > 10)
    .reduce((sum, x) => sum + x, 0);
```

---

### Block Body (Explicit Return)

```javascript
const processUser = user => {
  const name = user.name.toUpperCase();
  const age = user.age;
  return { name, age };
};
```

---

### 3.2.3 Lexical `this` Binding

### No Own `this`

Arrow functions **don't have their own `this`**—they inherit from enclosing scope:

```javascript
const obj = {
  value: 42,
  
  regularFunc: function() {
    console.log(this.value);  // 42 (this = obj)
  },
  
  arrowFunc: () => {
    console.log(this.value);  // undefined (this = outer scope, not obj)
  }
};

obj.regularFunc();  // 42
obj.arrowFunc();    // undefined
```

---

### Lexical Scope Example

```javascript
const obj = {
  value: 42,
  
  method() {
    // Regular function: this = obj
    setTimeout(function() {
      console.log(this.value);  // undefined (this = global in non-strict)
    }, 100);
    
    // Arrow function: inherits this from method
    setTimeout(() => {
      console.log(this.value);  // 42 (this = obj)
    }, 100);
  }
};

obj.method();
```

---

### Old Workaround (Pre-ES6)

```javascript
const obj = {
  value: 42,
  
  method: function() {
    const self = this;  // Capture this
    
    setTimeout(function() {
      console.log(self.value);  // 42
    }, 100);
  }
};
```

**Arrow functions eliminate this pattern.**

---

### Cannot Bind `this`

**`call`, `apply`, `bind` don't change `this`:**

```javascript
const obj = { value: 42 };

const arrow = () => console.log(this.value);

arrow.call(obj);   // undefined (call ignored)
arrow.apply(obj);  // undefined (apply ignored)
arrow.bind(obj)(); // undefined (bind ignored)
```

---

### Class Methods

**Use arrow functions for event handlers:**

```javascript
class Counter {
  constructor() {
    this.count = 0;
    
    // Regular method: this depends on how it's called
    this.regularIncrement = function() {
      this.count++;
    };
    
    // Arrow function: this always = instance
    this.arrowIncrement = () => {
      this.count++;
    };
  }
}

const counter = new Counter();

// Regular method loses this
const regular = counter.regularIncrement;
regular();  // TypeError (this = undefined in strict mode)

// Arrow function preserves this
const arrow = counter.arrowIncrement;
arrow();  // Works! (this = counter)
```

**Class fields with arrow functions:**

```javascript
class Counter {
  count = 0;
  
  // Arrow function as class field
  increment = () => {
    this.count++;
  }
}

const counter = new Counter();
const increment = counter.increment;
increment();  // Works! (this = counter)
```

---

### 3.2.4 No `arguments` Object

### Arrow Functions Don't Have `arguments`

```javascript
function regularFunc() {
  console.log(arguments);  // Works
}

const arrowFunc = () => {
  console.log(arguments);  // ReferenceError (no arguments)
};

regularFunc(1, 2, 3);  // [1, 2, 3]
arrowFunc(1, 2, 3);    // Error
```

---

### Use Rest Parameters Instead

```javascript
const sum = (...args) => {
  return args.reduce((total, x) => total + x, 0);
};

sum(1, 2, 3);  // 6
```

---

### Accessing Outer `arguments`

**Arrow functions can access enclosing function's `arguments`:**

```javascript
function outer() {
  const inner = () => {
    console.log(arguments);  // Accesses outer's arguments
  };
  
  inner();
}

outer(1, 2, 3);  // [1, 2, 3]
```

---

### 3.2.5 Cannot Be Constructors

### No `new`

**Arrow functions cannot be used with `new`:**

```javascript
const Person = (name) => {
  this.name = name;
};

const alice = new Person("Alice");  // TypeError: Person is not a constructor
```

---

### No `prototype` Property

```javascript
const arrow = () => { };
console.log(arrow.prototype);  // undefined

function regular() { }
console.log(regular.prototype);  // { constructor: regular }
```

---

### Use Regular Functions for Constructors

```javascript
function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");
console.log(alice.name);  // "Alice"
```

**Or classes:**

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

const alice = new Person("Alice");
```

---

### 3.2.6 Other Differences

### No `super`

**Arrow functions cannot access `super`:**

```javascript
class Child extends Parent {
  method() {
    const arrow = () => {
      super.method();  // SyntaxError
    };
  }
}
```

---

### No `new.target`

```javascript
function regular() {
  console.log(new.target);  // Works
}

const arrow = () => {
  console.log(new.target);  // SyntaxError
};
```

---

### No `yield`

**Cannot be generators:**

```javascript
const gen = *() => {  // SyntaxError
  yield 1;
};
```

---

### 3.2.7 When to Use Arrow Functions

### Good Use Cases

**1. Short callbacks:**

```javascript
arr.map(x => x * 2)
arr.filter(x => x > 0)
arr.reduce((sum, x) => sum + x, 0)
```

**2. Lexical `this` needed:**

```javascript
class Timer {
  start() {
    setInterval(() => {
      this.tick();  // this = Timer instance
    }, 1000);
  }
}
```

**3. Higher-order functions:**

```javascript
const multiply = x => y => x * y;
const double = multiply(2);
double(5);  // 10
```

**4. Promise chains:**

```javascript
fetch(url)
  .then(res => res.json())
  .then(data => processData(data))
  .catch(err => console.error(err));
```

---

### When NOT to Use

**1. Object methods:**

```javascript
// Bad: this doesn't refer to obj
const obj = {
  value: 42,
  getValue: () => this.value  // undefined
};

// Good: use regular function or method shorthand
const obj = {
  value: 42,
  getValue() { return this.value; }
};
```

**2. Event handlers (when you need `this`):**

```javascript
// Bad: this doesn't refer to button
button.addEventListener("click", () => {
  this.classList.toggle("active");  // Error
});

// Good: regular function
button.addEventListener("click", function() {
  this.classList.toggle("active");  // Works
});
```

**3. Constructors:**

```javascript
// Bad: cannot use with new
const Person = (name) => {
  this.name = name;
};

// Good: use class or regular function
class Person {
  constructor(name) {
    this.name = name;
  }
}
```

**4. When you need `arguments`:**

```javascript
// Bad: no arguments object
const sum = () => {
  console.log(arguments);  // ReferenceError
};

// Good: use rest parameters
const sum = (...args) => {
  return args.reduce((total, x) => total + x, 0);
};
```

---


## 3.3 Parameters and Arguments


### 3.3.1 Default Parameters

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

### 3.3.2 Rest Parameters

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

### 3.3.3 `arguments` Object

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

### 3.3.4 Parameter Destructuring

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

### 3.3.5 Spread in Function Calls

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


## 3.4 Return Values


### 3.4.1 Explicit Return

### Basic Syntax

```javascript
function add(a, b) {
  return a + b;
}

const result = add(5, 3);  // 8
```

---

### Early Return

```javascript
function validate(input) {
  if (!input) return false;
  if (input.length < 3) return false;
  return true;
}
```

---

### Returning Different Types

```javascript
function process(x) {
  if (x < 0) return null;
  if (x === 0) return "zero";
  if (x < 10) return x;
  return { value: x };
}
```

---

### No Return Value (Returns `undefined`)

```javascript
function log(message) {
  console.log(message);
  // No return statement
}

const result = log("hello");
console.log(result);  // undefined
```

---

### Explicit `undefined` Return

```javascript
function maybeReturn(condition) {
  if (condition) {
    return "value";
  }
  return undefined;  // Explicit
  // or: return;
  // or: (omit return)
}
```

---

### 3.4.2 Implicit Return (Arrow Functions)

### Single Expression

```javascript
const double = x => x * 2;

const add = (a, b) => a + b;

const greet = name => `Hello, ${name}!`;
```

---

### Object Literal (Must Wrap)

```javascript
const makeUser = (name, age) => ({ name, age });

// Without parens: interpreted as block
const broken = (name, age) => { name, age };  // undefined
```

---

### Multi-Line Expression

```javascript
const transform = data =>
  data
    .map(x => x * 2)
    .filter(x => x > 10)
    .reduce((sum, x) => sum + x, 0);
```

---

### Conditional Return

```javascript
const abs = x => x >= 0 ? x : -x;

const sign = x =>
  x > 0 ? 1 :
  x < 0 ? -1 : 0;
```

---

### 3.4.3 Returning Multiple Values

### Using Arrays

```javascript
function getCoordinates() {
  return [10, 20];
}

const [x, y] = getCoordinates();
console.log(x, y);  // 10, 20
```

---

### Using Objects

```javascript
function getUser() {
  return {
    name: "Alice",
    age: 30,
    email: "alice@example.com"
  };
}

const { name, age } = getUser();
console.log(name, age);  // "Alice", 30
```

---

### Choosing Between Array and Object

**Use array when:**

- Order matters
- Values are homogeneous
- Positional access makes sense

```javascript
function getDimensions() {
  return [width, height];
}

const [w, h] = getDimensions();
```

**Use object when:**

- Named values more readable
- May skip some values
- May add more values later

```javascript
function getStats() {
  return { min, max, avg, median };
}

const { min, max } = getStats();  // Can skip avg, median
```

---

### Nested Destructuring

```javascript
function getData() {
  return {
    user: {
      name: "Alice",
      age: 30
    },
    posts: [1, 2, 3]
  };
}

const {
  user: { name, age },
  posts: [firstPost]
} = getData();
```

---

### 3.4.4 Return Value Best Practices

### Be Consistent

**Bad:**

```javascript
function getUser(id) {
  const user = database.find(id);
  if (user) return user;
  return null;  // Sometimes object, sometimes null
}
```

**Good:**

```javascript
function getUser(id) {
  return database.find(id) || null;
}

// Or always return object
function getUser(id) {
  return database.find(id) || { error: "Not found" };
}
```

---

### Document Return Types (JSDoc)

```javascript
/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Object|null} User object or null if not found
 */
function getUser(id) {
  return database.find(id) || null;
}
```

---

### Avoid Too Many Return Points

**Hard to follow:**

```javascript
function complex(x) {
  if (x < 0) return "negative";
  if (x === 0) return "zero";
  if (x < 10) return "small";
  if (x < 100) return "medium";
  if (x < 1000) return "large";
  return "huge";
}
```

**Better:**

```javascript
function complex(x) {
  if (x < 0) return "negative";
  if (x === 0) return "zero";
  
  if (x < 10) return "small";
  if (x < 100) return "medium";
  if (x < 1000) return "large";
  
  return "huge";
}

// Or use lookup
const ranges = [
  [0, "negative"],
  [10, "small"],
  [100, "medium"],
  [1000, "large"],
  [Infinity, "huge"]
];
```

---

## Summary

### Function Types

|Feature|Declaration|Expression|Arrow|
|---|---|---|---|
|**Hoisting**|Full|Variable only|Variable only|
|**`this`**|Dynamic|Dynamic|Lexical|
|**`arguments`**|Yes|Yes|No|
|**Constructor**|Yes|Yes|No|
|**Implicit return**|No|No|Yes (single expr)|
|**`super`**|Yes|Yes|No|

---

### Parameter Features

- **Default parameters**: `function f(x = 0) { }`
- **Rest parameters**: `function f(...args) { }`
- **Destructuring**: `function f({ x, y }) { }`
- **Spread in calls**: `f(...arr)`
- **`arguments` object**: Array-like, all args (not in arrows)

---

### Best Practices

1. **Prefer `const`** for function expressions
2. **Use arrow functions** for callbacks and lexical `this`
3. **Use regular functions** for methods and constructors
4. **Use rest parameters** over `arguments`
5. **Use destructuring** for complex parameters
6. **Use implicit return** for simple arrow functions
7. **Return consistent types** from functions
8. **Document return types** with JSDoc
9. **Use named function expressions** for stack traces
10. **Prefer `function` declarations** for top-level functions

---

## 3.5 Scope and Closures


### 3.5.1 Lexical Scope

### Definition

**Lexical scope** (static scope) means a variable's scope is determined by its position in the source code at write-time, not at run-time.

```javascript
function outer() {
  const x = 10;
  
  function inner() {
    console.log(x);  // Can access x (lexically enclosed)
  }
  
  inner();
}

outer();  // 10
```

---

### Scope Chain

When a variable is referenced, JavaScript searches:

1. **Current scope**
2. **Outer scope** (enclosing function)
3. **Outer-outer scope** (and so on)
4. **Global scope**
5. **ReferenceError** if not found

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";
  
  function inner() {
    const innerVar = "inner";
    
    console.log(innerVar);   // 1. Current scope
    console.log(outerVar);   // 2. Outer scope
    console.log(global);     // 3. Global scope
    console.log(notDefined); // ReferenceError
  }
  
  inner();
}

outer();
```

---

### Shadowing

**Inner variables shadow outer variables:**

```javascript
const x = "global";

function outer() {
  const x = "outer";
  
  function inner() {
    const x = "inner";
    console.log(x);  // "inner" (shadows outer variables)
  }
  
  inner();
  console.log(x);  // "outer"
}

outer();
console.log(x);  // "global"
```

---

### Lexical vs Dynamic Scope

**JavaScript uses lexical scope:**

```javascript
const x = "global";

function foo() {
  console.log(x);  // Looks up lexically, not where it's called
}

function bar() {
  const x = "local";
  foo();  // What does this log?
}

bar();  // "global" (not "local")
```

**In dynamic scope (not JavaScript), it would log `"local"` because `foo` was called from `bar`.**

---

### 3.5.2 Function Scope

### `var` is Function-Scoped

```javascript
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x);  // 10 (accessible outside if block)
}

example();
```

---

### Functions Create Scope

**Each function creates its own scope:**

```javascript
function outer() {
  const x = 10;
  
  function inner1() {
    const y = 20;
    console.log(x);  // 10 (can access outer)
  }
  
  function inner2() {
    console.log(y);  // ReferenceError (cannot access inner1's y)
  }
  
  inner1();
  inner2();
}
```

---

### Nested Functions

```javascript
function level1() {
  const a = 1;
  
  function level2() {
    const b = 2;
    
    function level3() {
      const c = 3;
      console.log(a, b, c);  // 1, 2, 3 (access all outer scopes)
    }
    
    level3();
  }
  
  level2();
}

level1();
```

---

### 3.5.3 Block Scope

### `let` and `const` are Block-Scoped

```javascript
{
  const x = 10;
  let y = 20;
  console.log(x, y);  // 10, 20
}

console.log(x);  // ReferenceError
console.log(y);  // ReferenceError
```

---

### Blocks Create Scope

**All blocks create scope for `let`/`const`:**

```javascript
// if block
if (true) {
  const x = 10;
}
console.log(x);  // ReferenceError

// for block
for (let i = 0; i < 5; i++) {
  const x = i;
}
console.log(i);  // ReferenceError
console.log(x);  // ReferenceError

// while block
while (condition) {
  const x = 10;
}

// switch block (single scope for all cases)
switch (value) {
  case 1:
    const x = 10;  // Available in entire switch
    break;
}

// Standalone block
{
  const x = 10;
}
```

---

### Loop Iterations Create Separate Scopes

**`let` in `for` loop creates per-iteration binding:**

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

**How it works internally:**

```javascript
// Conceptual transformation
{
  let i = 0;
  {
    let i_0 = i;
    setTimeout(() => console.log(i_0), 100);
  }
  i++;
  {
    let i_1 = i;
    setTimeout(() => console.log(i_1), 100);
  }
  i++;
  // etc.
}
```

---

### Temporal Dead Zone (TDZ)

**Variables exist but cannot be accessed before declaration:**

```javascript
{
  // TDZ starts for x
  console.log(x);  // ReferenceError
  // TDZ continues
  let x = 10;  // TDZ ends
  console.log(x);  // 10
}
```

---

### 3.5.4 Closure Mechanism

### Why Closures Matter

Closures are one of JavaScript's most powerful features. They enable:

- **Data privacy** — Variables hidden from outside access
- **State persistence** — Functions that "remember" values between calls
- **Factory functions** — Creating customized functions dynamically
- **Callbacks** — Event handlers that access outer variables
- **Module pattern** — Encapsulation before ES6 modules existed

Without closures, JavaScript would lack fundamental patterns like private variables, memoization, and partial application.

### Definition

A **closure** is a function that retains access to its lexical scope even when the function is executed outside that scope. In simpler terms: **a function "remembers" the variables from where it was created, not where it's called.**

```javascript
function outer() {
  const x = 10;
  
  function inner() {
    console.log(x);  // Closure: inner "closes over" x
  }
  
  return inner;
}

const fn = outer();  // outer() has finished executing
fn();  // 10 (but x is still accessible!)
```

---

### How Closures Work

**When a function is created, it stores a reference to its lexical environment:**

```javascript
function makeCounter() {
  let count = 0;
  
  return function() {
    count++;
    return count;
  };
}

const counter1 = makeCounter();
const counter2 = makeCounter();

console.log(counter1());  // 1
console.log(counter1());  // 2
console.log(counter1());  // 3

console.log(counter2());  // 1 (separate closure)
console.log(counter2());  // 2
```

**Each call to `makeCounter()` creates a new lexical environment with its own `count`.**

---

### Closure Scope Chain

**Closures retain entire scope chain:**

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";
  
  function middle() {
    const middleVar = "middle";
    
    function inner() {
      console.log(global);     // Accesses global
      console.log(outerVar);   // Accesses outer
      console.log(middleVar);  // Accesses middle
    }
    
    return inner;
  }
  
  return middle();
}

const fn = outer();
fn();  // All variables accessible
```

---

### Closures Capture Variables, Not Values

```javascript
function createFunctions() {
  const funcs = [];
  
  for (var i = 0; i < 3; i++) {
    funcs.push(function() {
      console.log(i);  // Captures variable i, not value
    });
  }
  
  return funcs;
}

const funcs = createFunctions();
funcs[0]();  // 3 (not 0!)
funcs[1]();  // 3
funcs[2]();  // 3

// All functions reference same i, which is 3 after loop
```

**Fix with `let` (creates per-iteration binding):**

```javascript
function createFunctions() {
  const funcs = [];
  
  for (let i = 0; i < 3; i++) {
    funcs.push(function() {
      console.log(i);
    });
  }
  
  return funcs;
}

const funcs = createFunctions();
funcs[0]();  // 0
funcs[1]();  // 1
funcs[2]();  // 2
```

**Or IIFE (pre-ES6):**

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {
    funcs.push(function() {
      console.log(j);
    });
  })(i);
}
```

---

### 3.5.5 Closure Use Cases

### Private Variables

**Encapsulate data:**

```javascript
function createPerson(name) {
  // Private variable
  let _name = name;
  
  return {
    getName() {
      return _name;
    },
    setName(newName) {
      if (typeof newName === "string") {
        _name = newName;
      }
    }
  };
}

const person = createPerson("Alice");
console.log(person.getName());  // "Alice"
person.setName("Bob");
console.log(person.getName());  // "Bob"
console.log(person._name);      // undefined (private)
```

---

### Function Factories

**Create specialized functions:**

```javascript
function multiplier(factor) {
  return function(x) {
    return x * factor;
  };
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

---

### Event Handlers

**Capture context:**

```javascript
function setupButton(buttonId, message) {
  const button = document.getElementById(buttonId);
  
  button.addEventListener("click", function() {
    alert(message);  // Closure over message
  });
}

setupButton("btn1", "Button 1 clicked");
setupButton("btn2", "Button 2 clicked");
```

---

### Memoization

**Cache results:**

```javascript
function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (key in cache) {
      return cache[key];
    }
    
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const factorial = memoize(function(n) {
  console.log(`Computing ${n}!`);
  if (n <= 1) return 1;
  return n * factorial(n - 1);
});

factorial(5);  // Computes 5, 4, 3, 2, 1
factorial(5);  // Returns cached result
factorial(6);  // Only computes 6 (reuses cached 5!)
```

---

### Iterators and Generators

```javascript
function createIterator(array) {
  let index = 0;
  
  return {
    next() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      }
      return { done: true };
    }
  };
}

const iter = createIterator([1, 2, 3]);
console.log(iter.next());  // { value: 1, done: false }
console.log(iter.next());  // { value: 2, done: false }
console.log(iter.next());  // { value: 3, done: false }
console.log(iter.next());  // { done: true }
```

---

### Partial Application

```javascript
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = partial(greet, "Hello");
console.log(sayHello("Alice"));  // "Hello, Alice!"
console.log(sayHello("Bob"));    // "Hello, Bob!"
```

---

### 3.5.6 Module Pattern with Closures

### Revealing Module Pattern

```javascript
const calculator = (function() {
  // Private variables
  let result = 0;
  
  // Private functions
  function validate(x) {
    return typeof x === "number";
  }
  
  // Public API
  return {
    add(x) {
      if (validate(x)) {
        result += x;
      }
      return this;
    },
    
    subtract(x) {
      if (validate(x)) {
        result -= x;
      }
      return this;
    },
    
    getResult() {
      return result;
    },
    
    reset() {
      result = 0;
      return this;
    }
  };
})();

calculator.add(10).add(5).subtract(3);
console.log(calculator.getResult());  // 12
console.log(calculator.result);       // undefined (private)
console.log(calculator.validate);     // undefined (private)
```

---

### Singleton Pattern

```javascript
const database = (function() {
  let instance;
  
  function init() {
    // Private
    const data = [];
    
    return {
      insert(item) {
        data.push(item);
      },
      
      query() {
        return data.slice();  // Return copy
      }
    };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
})();

const db1 = database.getInstance();
const db2 = database.getInstance();

db1.insert("item1");
console.log(db2.query());  // ["item1"] (same instance)
console.log(db1 === db2);  // true
```

---

### Namespace Pattern

```javascript
const MyApp = (function() {
  // Namespace for different modules
  const utils = (function() {
    return {
      formatDate(date) {
        // ...
      },
      
      capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    };
  })();
  
  const api = (function() {
    const baseURL = "https://api.example.com";
    
    return {
      get(endpoint) {
        return fetch(`${baseURL}/${endpoint}`);
      }
    };
  })();
  
  return {
    utils,
    api
  };
})();

MyApp.utils.capitalize("hello");  // "Hello"
MyApp.api.get("users");
```

---

### 3.5.7 Memory Considerations

### Closures and Memory

**Closures retain references to outer scope:**

```javascript
function heavy() {
  const bigData = new Array(1000000).fill("data");
  
  return function() {
    console.log(bigData[0]);  // Closure retains bigData
  };
}

const fn = heavy();
// bigData cannot be garbage collected (fn holds reference)
```

---

### Memory Leaks

**Unintentional retention:**

```javascript
function setupHandler() {
  const element = document.getElementById("big-element");
  const data = new Array(1000000).fill("data");
  
  element.addEventListener("click", function() {
    console.log(data[0]);  // Closure retains data
  });
}

// If element is removed but event listener not cleaned up,
// data stays in memory
```

**Fix: Clean up:**

```javascript
function setupHandler() {
  const element = document.getElementById("big-element");
  const data = new Array(1000000).fill("data");
  
  const handler = function() {
    console.log(data[0]);
  };
  
  element.addEventListener("click", handler);
  
  // Clean up when done
  return function cleanup() {
    element.removeEventListener("click", handler);
  };
}

const cleanup = setupHandler();
// Later:
cleanup();
```

---

### Only Capture What's Needed

**Bad: Captures entire scope:**

```javascript
function outer() {
  const hugeData = new Array(1000000).fill("data");
  const smallValue = 42;
  
  return function() {
    console.log(smallValue);  // Also retains hugeData!
  };
}
```

**Good: Extract what's needed:**

```javascript
function outer() {
  const hugeData = new Array(1000000).fill("data");
  const smallValue = 42;
  
  // Process hugeData...
  const result = processData(hugeData);
  
  return function() {
    console.log(result);  // Only retains result, not hugeData
  };
}
```

---

### WeakMap for Private Data

**Modern alternative to closures for private data:**

```javascript
const privateData = new WeakMap();

class Person {
  constructor(name) {
    privateData.set(this, { name });
  }
  
  getName() {
    return privateData.get(this).name;
  }
  
  setName(name) {
    privateData.get(this).name = name;
  }
}

const person = new Person("Alice");
console.log(person.getName());  // "Alice"
// When person is garbage collected, privateData entry is too
```

---

### 3.5.8 Best Practices

1. **Use closures for data privacy**
2. **Be aware of memory retention**
3. **Clean up event listeners**
4. **Only capture variables you need**
5. **Use `let` in loops** (creates per-iteration binding)
6. **Document closure dependencies**
7. **Consider WeakMap** for private data in classes
8. **Profile memory** if closures are used heavily

---


## 3.6 Advanced Function Concepts


### 3.6.1 Higher-Order Functions

### Definition

A **higher-order function** either:

1. Takes one or more functions as arguments, OR
2. Returns a function

---

### Functions as Arguments

```javascript
// Higher-order function
function map(array, fn) {
  const result = [];
  for (let item of array) {
    result.push(fn(item));
  }
  return result;
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, x => x * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]
```

---

### Functions as Return Values

```javascript
function greeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = greeter("Hello");
const sayHi = greeter("Hi");

console.log(sayHello("Alice"));  // "Hello, Alice!"
console.log(sayHi("Bob"));       // "Hi, Bob!"
```

---

### Built-In Higher-Order Functions

```javascript
// Array methods
[1, 2, 3, 4, 5]
  .map(x => x * 2)        // [2, 4, 6, 8, 10]
  .filter(x => x > 5)     // [6, 8, 10]
  .reduce((sum, x) => sum + x, 0);  // 24

// setTimeout, setInterval
setTimeout(() => console.log("delayed"), 1000);

// Event listeners
button.addEventListener("click", () => console.log("clicked"));

// Promise methods
Promise.resolve(42).then(x => x * 2);
```

---

### Creating Utilities

```javascript
function repeat(n, fn) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}

repeat(3, i => console.log(`Iteration ${i}`));
// Iteration 0
// Iteration 1
// Iteration 2
```

---

### 3.6.2 Callbacks

### Definition

A **callback** is a function passed as an argument to be executed later.

---

### Synchronous Callbacks

```javascript
function processArray(array, callback) {
  const result = [];
  for (let item of array) {
    result.push(callback(item));
  }
  return result;
}

const numbers = [1, 2, 3];
const squared = processArray(numbers, x => x * x);
console.log(squared);  // [1, 4, 9]
```

---

### Asynchronous Callbacks

```javascript
function fetchData(url, callback) {
  setTimeout(() => {
    const data = { id: 1, name: "Alice" };
    callback(data);
  }, 1000);
}

fetchData("https://api.example.com/user/1", (data) => {
  console.log(data);  // After 1 second
});
```

---

### Error-First Callbacks (Node.js Convention)

```javascript
function readFile(path, callback) {
  setTimeout(() => {
    if (path === "error.txt") {
      callback(new Error("File not found"), null);
    } else {
      callback(null, "File contents");
    }
  }, 100);
}

readFile("data.txt", (err, data) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(data);
});
```

---

### Callback Hell (Pyramid of Doom)

```javascript
asyncOperation1((err1, result1) => {
  if (err1) return handleError(err1);
  
  asyncOperation2(result1, (err2, result2) => {
    if (err2) return handleError(err2);
    
    asyncOperation3(result2, (err3, result3) => {
      if (err3) return handleError(err3);
      
      console.log(result3);
    });
  });
});
```

**Solution: Promises or async/await:**

```javascript
// Promises
asyncOperation1()
  .then(result1 => asyncOperation2(result1))
  .then(result2 => asyncOperation3(result2))
  .then(result3 => console.log(result3))
  .catch(handleError);

// Async/await
try {
  const result1 = await asyncOperation1();
  const result2 = await asyncOperation2(result1);
  const result3 = await asyncOperation3(result2);
  console.log(result3);
} catch (error) {
  handleError(error);
}
```

---

### 3.6.3 Function Composition

### Definition

**Function composition** is combining two or more functions to create a new function.

---

### Basic Composition

```javascript
const add = x => x + 1;
const multiply = x => x * 2;

// Manual composition
const addThenMultiply = x => multiply(add(x));
console.log(addThenMultiply(5));  // 12 ((5 + 1) * 2)
```

---

### Compose Function

**Right-to-left composition:**

```javascript
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

const add = x => x + 1;
const multiply = x => x * 2;
const square = x => x * x;

const composed = compose(square, multiply, add);
console.log(composed(5));  // 144
// Execution: add(5) -> multiply(6) -> square(12) -> 144
```

---

### Pipe Function

**Left-to-right composition:**

```javascript
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

const add = x => x + 1;
const multiply = x => x * 2;
const square = x => x * x;

const piped = pipe(add, multiply, square);
console.log(piped(5));  // 144
// Execution: add(5) -> multiply(6) -> square(12) -> 144
```

---

### Practical Example

```javascript
const users = [
  { name: "alice smith", age: 30 },
  { name: "bob jones", age: 25 },
  { name: "charlie brown", age: 35 }
];

const capitalize = str =>
  str.charAt(0).toUpperCase() + str.slice(1);

const capitalizeWords = str =>
  str.split(" ").map(capitalize).join(" ");

const getNames = users => users.map(u => u.name);
const capitalizeNames = names => names.map(capitalizeWords);
const sortNames = names => names.sort();

const processUsers = pipe(
  getNames,
  capitalizeNames,
  sortNames
);

console.log(processUsers(users));
// ["Alice Smith", "Bob Jones", "Charlie Brown"]
```

---

### 3.6.4 Currying

### Definition

**Currying** transforms a function with multiple arguments into a sequence of functions, each taking a single argument.

---

### Manual Currying

```javascript
// Regular function
function add(a, b, c) {
  return a + b + c;
}

add(1, 2, 3);  // 6

// Curried version
function addCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

addCurried(1)(2)(3);  // 6

// Or with arrow functions
const addCurried = a => b => c => a + b + c;
addCurried(1)(2)(3);  // 6
```

---

### Curry Utility

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    } else {
      return function(...nextArgs) {
        return curried(...args, ...nextArgs);
      };
    }
  };
}

// Usage
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
console.log(curriedAdd(1, 2, 3));     // 6
```

---

### Practical Use Cases

**Creating specialized functions:**

```javascript
const multiply = curry((a, b) => a * b);

const double = multiply(2);
const triple = multiply(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

**Reusable filters:**

```javascript
const filter = curry((fn, array) => array.filter(fn));

const numbers = [1, 2, 3, 4, 5];
const isEven = x => x % 2 === 0;
const isGreaterThan = curry((threshold, x) => x > threshold);

const filterEven = filter(isEven);
const filterGreaterThan3 = filter(isGreaterThan(3));

console.log(filterEven(numbers));        // [2, 4]
console.log(filterGreaterThan3(numbers)); // [4, 5]
```

---

### 3.6.5 Partial Application

### Definition

**Partial application** fixes some arguments of a function, producing a new function with fewer arguments.

---

### Manual Partial Application

```javascript
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

const sayHello = partial(greet, "Hello");
const sayHi = partial(greet, "Hi");

console.log(sayHello("Alice"));  // "Hello, Alice!"
console.log(sayHi("Bob"));       // "Hi, Bob!"
```

---

### Partial vs Currying

**Partial application:**

```javascript
const partial = (fn, ...args) =>
  (...newArgs) => fn(...args, ...newArgs);

const add = (a, b, c) => a + b + c;
const add5 = partial(add, 5);

add5(10, 15);  // 30 (5 + 10 + 15)
```

**Currying:**

```javascript
const curry = fn =>
  function curried(...args) {
    return args.length >= fn.length
      ? fn(...args)
      : (...newArgs) => curried(...args, ...newArgs);
  };

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(5)(10)(15);  // 30
```

**Key difference:**

- **Partial**: Apply some args, get function expecting remaining args
- **Currying**: Always returns single-arg functions until all args provided

---

### Using `bind` for Partial Application

```javascript
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = greet.bind(null, "Hello");
console.log(sayHello("Alice"));  // "Hello, Alice!"
```

---

### 3.6.6 Function Binding

### `bind()` Method

**Creates new function with bound `this`:**

```javascript
const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

user.greet();  // "Hello, Alice"

const greet = user.greet;
greet();  // "Hello, undefined" (lost this)

const boundGreet = user.greet.bind(user);
boundGreet();  // "Hello, Alice" (this bound to user)
```

---

### Binding with Arguments

```javascript
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);
console.log(double(5));  // 10 (2 * 5)

const triple = multiply.bind(null, 3);
console.log(triple(5));  // 15 (3 * 5)
```

---

### `call()` Method

**Invoke function with specified `this` and arguments:**

```javascript
function greet(greeting) {
  return `${greeting}, ${this.name}!`;
}

const user = { name: "Alice" };

console.log(greet.call(user, "Hello"));  // "Hello, Alice!"
```

---

### `apply()` Method

**Like `call`, but arguments as array:**

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const user = { name: "Alice" };

console.log(greet.apply(user, ["Hello", "!"]));  // "Hello, Alice!"
```

---

### Comparison

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const user = { name: "Alice" };

// bind: returns new function
const boundGreet = greet.bind(user, "Hello");
boundGreet("!");  // "Hello, Alice!"

// call: invokes immediately, args individually
greet.call(user, "Hello", "!");  // "Hello, Alice!"

// apply: invokes immediately, args as array
greet.apply(user, ["Hello", "!"]);  // "Hello, Alice!"
```

---

### 3.6.7 IIFE Revisited

### Pattern

```javascript
(function() {
  // Code here
})();

// Alternative syntax
(function() {
  // Code here
}());
```

---

### Use Cases

**1. Private scope:**

```javascript
(function() {
  const secret = "hidden";
  console.log(secret);  // "hidden"
})();

console.log(secret);  // ReferenceError
```

**2. Avoid global pollution:**

```javascript
(function() {
  const helpers = {
    add(a, b) { return a + b; },
    multiply(a, b) { return a * b; }
  };
  
  // Use helpers
  console.log(helpers.add(5, 3));
})();

// helpers not in global scope
```

**3. Module pattern:**

```javascript
const myModule = (function() {
  const privateVar = "secret";
  
  function privateFunc() {
    return privateVar;
  }
  
  return {
    publicMethod() {
      return privateFunc();
    }
  };
})();

console.log(myModule.publicMethod());  // "secret"
console.log(myModule.privateVar);      // undefined
```

**4. With parameters:**

```javascript
(function(global, $) {
  // Use global and $ without risk of conflict
  global.myApp = { };
  $(".element").hide();
})(window, jQuery);
```

---

### 3.6.8 Recursion

### Definition

A **recursive function** calls itself.

---

### Basic Recursion

```javascript
function factorial(n) {
  if (n <= 1) return 1;  // Base case
  return n * factorial(n - 1);  // Recursive case
}

console.log(factorial(5));  // 120
// 5 * factorial(4)
// 5 * 4 * factorial(3)
// 5 * 4 * 3 * factorial(2)
// 5 * 4 * 3 * 2 * factorial(1)
// 5 * 4 * 3 * 2 * 1 = 120
```

---

### Recursive Patterns

**Counting:**

```javascript
function countdown(n) {
  if (n <= 0) {
    console.log("Done!");
    return;
  }
  console.log(n);
  countdown(n - 1);
}

countdown(3);  // 3, 2, 1, Done!
```

**Tree traversal:**

```javascript
function traverse(node) {
  console.log(node.value);
  
  if (node.children) {
    node.children.forEach(child => traverse(child));
  }
}

const tree = {
  value: 1,
  children: [
    { value: 2 },
    { value: 3, children: [{ value: 4 }, { value: 5 }] }
  ]
};

traverse(tree);  // 1, 2, 3, 4, 5
```

**Array flattening:**

```javascript
function flatten(array) {
  const result = [];
  
  for (let item of array) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));  // Recursive
    } else {
      result.push(item);
    }
  }
  
  return result;
}

const nested = [1, [2, [3, [4]], 5]];
console.log(flatten(nested));  // [1, 2, 3, 4, 5]
```

---

### Tail Call Optimization (TCO)

**Tail call:** Recursive call is the last operation in the function.

```javascript
// NOT tail recursive (multiplication after recursive call)
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);  // Multiplication is last operation
}

// Tail recursive (recursive call is last operation)
function factorial(n, accumulator = 1) {
  if (n <= 1) return accumulator;
  return factorial(n - 1, n * accumulator);  // Recursive call is last
}
```

**JavaScript TCO support:**

- **ES6 spec** includes TCO
- **Most engines don't implement it** (only Safari does)
- **Don't rely on TCO** in JavaScript

---

### Mutual Recursion

**Functions call each other:**

```javascript
function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}

console.log(isEven(4));  // true
console.log(isOdd(7));   // true
```

---

### Stack Overflow

**Recursion can exhaust call stack:**

```javascript
function infinite() {
  return infinite();  // No base case!
}

infinite();  // RangeError: Maximum call stack size exceeded
```

**Solutions:**

1. **Add base case**
2. **Use iteration instead**
3. **Trampoline pattern** (for very deep recursion)

```javascript
function trampoline(fn) {
  while (typeof fn === "function") {
    fn = fn();
  }
  return fn;
}

function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, n * acc);
}

console.log(trampoline(() => factorial(10000)));  // Works!
```

---

### 3.6.9 Memoization

### Definition

**Memoization** caches function results to avoid redundant computation.

---

### Basic Memoization

```javascript
function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (key in cache) {
      console.log("Returning cached result");
      return cache[key];
    }
    
    console.log("Computing result");
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const slowSquare = memoize(function(x) {
  // Simulate slow operation
  for (let i = 0; i < 1000000000; i++) {}
  return x * x;
});

slowSquare(5);  // "Computing result" (slow)
slowSquare(5);  // "Returning cached result" (instant)
```

---

### Memoizing Recursive Functions

```javascript
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40));  // Fast! (without memo: very slow)
```

**Why it's fast:**

```
fibonacci(5)
├── fibonacci(4) [computed]
│   ├── fibonacci(3) [computed]
│   └── fibonacci(2) [computed]
└── fibonacci(3) [cached!]

Each value computed only once, then cached
```

---

### Limitations

**1. Only works with pure functions** (same input → same output)

**2. Memory usage:**

```javascript
// Cache grows indefinitely
const memoized = memoize(heavyFunction);

// Call with 1000 different inputs
// Cache now has 1000 entries
```

**3. Key generation:**

```javascript
// JSON.stringify doesn't work for all inputs
const fn = memoize(x => x);

fn({a: 1, b: 2});
fn({b: 2, a: 1});  // Same object, different JSON strings!
```

---

### Advanced Memoization

**LRU Cache (Least Recently Used):**

```javascript
function memoizeLRU(fn, maxSize = 100) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      const value = cache.get(key);
      // Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Remove oldest if exceeds max size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}
```

---

### 3.6.10 Pure Functions and Side Effects

### Pure Functions

A **pure function**:

1. Returns same output for same input
2. Has no side effects

```javascript
// Pure
function add(a, b) {
  return a + b;
}

add(2, 3);  // Always 5
add(2, 3);  // Always 5

// Pure
function multiply(arr, factor) {
  return arr.map(x => x * factor);
}
```

---

### Impure Functions

**Depend on external state:**

```javascript
let count = 0;

function increment() {
  count++;  // Modifies external state
  return count;
}

increment();  // 1
increment();  // 2 (different output for same input!)
```

**Have side effects:**

```javascript
function logAndAdd(a, b) {
  console.log(`Adding ${a} + ${b}`);  // Side effect: I/O
  return a + b;
}

function updateUser(user) {
  user.updatedAt = Date.now();  // Side effect: mutation
  return user;
}

function fetchData(url) {
  return fetch(url);  // Side effect: network request
}
```

---

### Benefits of Pure Functions

1. **Predictable** (same input → same output)
2. **Testable** (no setup needed)
3. **Cacheable** (can memoize)
4. **Parallelizable** (no shared state)
5. **Composable** (easy to combine)

```javascript
// Pure functions compose well
const double = x => x * 2;
const increment = x => x + 1;
const square = x => x * x;

const transform = compose(square, double, increment);
// Always produces same result for same input
```

---

### Managing Side Effects

**Isolate side effects:**

```javascript
// Pure computation
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Impure I/O (separate)
function displayTotal(total) {
  document.getElementById("total").textContent = total;
}

// Usage
const total = calculateTotal(items);  // Pure
displayTotal(total);  // Impure, but isolated
```

---

### Immutability

**Don't mutate, create new values:**

```javascript
// Mutating (impure)
function addItem(cart, item) {
  cart.push(item);  // Mutates input
  return cart;
}

// Immutable (pure)
function addItem(cart, item) {
  return [...cart, item];  // Creates new array
}
```

---

## Summary

### Scope and Closures

- **Lexical scope**: Variable scope determined at write-time
- **Function scope**: `var` is function-scoped
- **Block scope**: `let`/`const` are block-scoped
- **Closures**: Functions retain access to lexical scope
- **Use cases**: Private data, factories, memoization, modules
- **Memory**: Closures retain references, can cause leaks

### Advanced Concepts

- **Higher-order functions**: Take/return functions
- **Callbacks**: Functions passed as arguments
- **Composition**: Combine functions into pipelines
- **Currying**: Transform multi-arg function into sequence of single-arg functions
- **Partial application**: Fix some arguments, return function expecting rest
- **Recursion**: Function calls itself (watch stack depth)
- **Memoization**: Cache results for performance
- **Pure functions**: No side effects, same input → same output

---

## 3.7 Generator Functions


### 3.7.1 `function*` Syntax

### Basic Syntax

```javascript
function* generatorFunction() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generatorFunction();
```

**Note the asterisk (`*`) - it can be positioned:**

```javascript
function* gen() { }   // Preferred
function *gen() { }   // Valid
function * gen() { }  // Valid
function*gen() { }    // Valid (no space)
```

---

### Generator as Method

```javascript
const obj = {
  *generator() {
    yield 1;
    yield 2;
  }
};

const gen = obj.generator();
```

---

### Generator as Class Method

```javascript
class MyClass {
  *generator() {
    yield 1;
    yield 2;
  }
  
  static *staticGenerator() {
    yield "a";
    yield "b";
  }
}

const instance = new MyClass();
const gen1 = instance.generator();
const gen2 = MyClass.staticGenerator();
```

---

### Generator vs Regular Function

```javascript
// Regular function: executes completely
function regular() {
  console.log("start");
  console.log("middle");
  console.log("end");
  return "done";
}

regular();  // Logs all three, returns "done"

// Generator function: can pause/resume
function* generator() {
  console.log("start");
  yield 1;
  console.log("middle");
  yield 2;
  console.log("end");
  return "done";
}

const gen = generator();  // Doesn't execute yet!
gen.next();  // Logs "start", returns { value: 1, done: false }
gen.next();  // Logs "middle", returns { value: 2, done: false }
gen.next();  // Logs "end", returns { value: "done", done: true }
```

---

### 3.7.2 `yield` Keyword

### Basic Usage

**`yield` produces a value and pauses execution:**

```javascript
function* counter() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = counter();

console.log(gen.next());  // { value: 1, done: false }
console.log(gen.next());  // { value: 2, done: false }
console.log(gen.next());  // { value: 3, done: false }
console.log(gen.next());  // { value: undefined, done: true }
```

---

### `yield` is an Expression

**`yield` can receive values:**

```javascript
function* twoWay() {
  const a = yield 1;
  console.log("Received:", a);
  
  const b = yield 2;
  console.log("Received:", b);
  
  return "done";
}

const gen = twoWay();

console.log(gen.next());      // { value: 1, done: false }
console.log(gen.next("A"));   // Logs "Received: A", { value: 2, done: false }
console.log(gen.next("B"));   // Logs "Received: B", { value: "done", done: true }
```

**How it works:**

1. First `next()`: Starts execution, pauses at first `yield 1`
2. Second `next("A")`: Resumes, `yield 1` returns `"A"`, assigned to `a`
3. Third `next("B")`: Resumes, `yield 2` returns `"B"`, assigned to `b`

---

### `yield` in Loops

```javascript
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

const gen = range(1, 5);

for (let value of gen) {
  console.log(value);
}
// 1, 2, 3, 4
```

---

### Multiple `yield` Statements

```javascript
function* fibonacci() {
  let a = 0, b = 1;
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();

console.log(fib.next().value);  // 0
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 2
console.log(fib.next().value);  // 3
console.log(fib.next().value);  // 5
```

---

### 3.7.3 `yield*` Delegation

### Delegating to Another Generator

**`yield*` delegates to another iterable:**

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield "a";
  yield* gen1();  // Delegate to gen1
  yield "b";
}

const gen = gen2();

console.log([...gen]);  // ["a", 1, 2, "b"]
```

---

### Delegating to Arrays

```javascript
function* gen() {
  yield 1;
  yield* [2, 3, 4];  // Delegate to array
  yield 5;
}

console.log([...gen()]);  // [1, 2, 3, 4, 5]
```

---

### Delegating to Strings

```javascript
function* gen() {
  yield* "hello";
}

console.log([...gen()]);  // ["h", "e", "l", "l", "o"]
```

---

### Nested Delegation

```javascript
function* inner() {
  yield 1;
  yield 2;
}

function* middle() {
  yield "a";
  yield* inner();
  yield "b";
}

function* outer() {
  yield "start";
  yield* middle();
  yield "end";
}

console.log([...outer()]);
// ["start", "a", 1, 2, "b", "end"]
```

---

### Return Value from Delegation

**`yield*` returns the delegated generator's return value:**

```javascript
function* inner() {
  yield 1;
  yield 2;
  return "inner done";
}

function* outer() {
  const result = yield* inner();
  console.log(result);  // "inner done"
  yield 3;
}

const gen = outer();

console.log(gen.next());  // { value: 1, done: false }
console.log(gen.next());  // { value: 2, done: false }
console.log(gen.next());  // Logs "inner done", { value: 3, done: false }
console.log(gen.next());  // { value: undefined, done: true }
```

---

### 3.7.4 Generator Methods

### `next(value)` Method

**Advance generator and optionally pass value:**

```javascript
function* gen() {
  const a = yield 1;
  console.log("a:", a);
  
  const b = yield 2;
  console.log("b:", b);
  
  return "done";
}

const g = gen();

g.next();        // { value: 1, done: false }
g.next("first"); // Logs "a: first", { value: 2, done: false }
g.next("second");// Logs "b: second", { value: "done", done: true }
```

**First `next()` doesn't receive a value:**

```javascript
function* gen() {
  const first = yield 1;
  console.log("Never sees the value passed to first next()");
}

const g = gen();
g.next("ignored");  // Value ignored (no yield to receive it yet)
```

---

### `return(value)` Method

**Terminate generator and return value:**

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();

console.log(g.next());         // { value: 1, done: false }
console.log(g.return("early")); // { value: "early", done: true }
console.log(g.next());         // { value: undefined, done: true }
```

**With `try...finally`:**

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log("Cleanup");
  }
}

const g = gen();

console.log(g.next());    // { value: 1, done: false }
console.log(g.return(0)); // Logs "Cleanup", { value: 0, done: true }
```

---

### `throw(error)` Method

**Throw error inside generator:**

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (error) {
    console.log("Caught:", error.message);
    yield "error handled";
  }
}

const g = gen();

console.log(g.next());  // { value: 1, done: false }
console.log(g.throw(new Error("oops")));
// Logs "Caught: oops"
// { value: "error handled", done: false }
console.log(g.next());  // { value: undefined, done: true }
```

**Uncaught error terminates generator:**

```javascript
function* gen() {
  yield 1;
  yield 2;
}

const g = gen();

console.log(g.next());  // { value: 1, done: false }
g.throw(new Error("oops"));  // Error propagates to caller
```

---

### 3.7.5 Iterating Generators

### Manual Iteration

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();

let result = g.next();
while (!result.done) {
  console.log(result.value);
  result = g.next();
}
// 1, 2, 3
```

---

### `for...of` Loop

**Automatically iterates until `done: true`:**

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
  return "ignored";  // Return value not included in for...of
}

for (let value of gen()) {
  console.log(value);
}
// 1, 2, 3
```

---

### Spread Operator

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const arr = [...gen()];
console.log(arr);  // [1, 2, 3]
```

---

### Destructuring

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const [a, b, c] = gen();
console.log(a, b, c);  // 1, 2, 3
```

---

### `Array.from()`

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const arr = Array.from(gen());
console.log(arr);  // [1, 2, 3]
```

---

### 3.7.6 Use Cases

### Lazy Evaluation

**Generate values on-demand:**

```javascript
function* fibonacci() {
  let a = 0, b = 1;
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take first 10 Fibonacci numbers
const fib = fibonacci();
const first10 = [];

for (let i = 0; i < 10; i++) {
  first10.push(fib.next().value);
}

console.log(first10);
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

### Infinite Sequences

```javascript
function* naturalNumbers() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

// Take first 5
const nums = naturalNumbers();
const first5 = [
  nums.next().value,
  nums.next().value,
  nums.next().value,
  nums.next().value,
  nums.next().value
];

console.log(first5);  // [1, 2, 3, 4, 5]

// Helper to take n values
function take(n, iterable) {
  const result = [];
  const iterator = iterable[Symbol.iterator]();
  
  for (let i = 0; i < n; i++) {
    const { value, done } = iterator.next();
    if (done) break;
    result.push(value);
  }
  
  return result;
}

console.log(take(10, naturalNumbers()));
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

---

### Custom Iterables

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }
  
  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i += this.step) {
      yield i;
    }
  }
}

const range = new Range(0, 10, 2);

for (let n of range) {
  console.log(n);
}
// 0, 2, 4, 6, 8

console.log([...range]);  // [0, 2, 4, 6, 8]
```

---

### Tree Traversal

```javascript
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }
  
  *traverse() {
    yield this.value;
    
    for (let child of this.children) {
      yield* child.traverse();
    }
  }
}

const tree = new TreeNode(1, [
  new TreeNode(2, [
    new TreeNode(4),
    new TreeNode(5)
  ]),
  new TreeNode(3, [
    new TreeNode(6)
  ])
]);

console.log([...tree.traverse()]);
// [1, 2, 4, 5, 3, 6]
```

---

### State Machines

```javascript
function* trafficLight() {
  while (true) {
    yield "green";
    yield "yellow";
    yield "red";
  }
}

const light = trafficLight();

console.log(light.next().value);  // "green"
console.log(light.next().value);  // "yellow"
console.log(light.next().value);  // "red"
console.log(light.next().value);  // "green"
```

---

### Pulling Data (Pull-Based)

```javascript
function* dataFetcher() {
  let page = 1;
  
  while (true) {
    const data = yield fetch(`/api/data?page=${page}`);
    page++;
  }
}

const fetcher = dataFetcher();
fetcher.next();  // Start generator

// Pull data when needed
const response1 = fetcher.next().value;  // Fetch page 1
const response2 = fetcher.next().value;  // Fetch page 2
```

---

### Cooperative Multitasking

```javascript
function* task1() {
  console.log("Task 1: Start");
  yield;
  console.log("Task 1: Middle");
  yield;
  console.log("Task 1: End");
}

function* task2() {
  console.log("Task 2: Start");
  yield;
  console.log("Task 2: Middle");
  yield;
  console.log("Task 2: End");
}

function runTasks(...tasks) {
  const generators = tasks.map(task => task());
  
  while (generators.length > 0) {
    for (let i = generators.length - 1; i >= 0; i--) {
      const { done } = generators[i].next();
      if (done) {
        generators.splice(i, 1);
      }
    }
  }
}

runTasks(task1, task2);
// Task 1: Start
// Task 2: Start
// Task 1: Middle
// Task 2: Middle
// Task 1: End
// Task 2: End
```

---

### 3.7.7 Generator Best Practices

1. **Use for lazy evaluation** (don't compute everything upfront)
2. **Document infinite sequences** (make it clear they're infinite)
3. **Use `yield*` for delegation** (cleaner than manual yielding)
4. **Handle cleanup in `finally`** (runs even if generator terminated early)
5. **Return meaningful values** (for `yield*` delegation)
6. **Prefer `for...of`** over manual `next()` calls
7. **Use generators for custom iterables** (cleaner than manual iterator protocol)

---


## 3.8 Async Functions


### 3.8.1 `async` Keyword

### Basic Syntax

```javascript
async function fetchUser() {
  return { id: 1, name: "Alice" };
}

const result = fetchUser();
console.log(result);  // Promise { <fulfilled>: { id: 1, name: "Alice" } }
```

**`async` function always returns a Promise:**

```javascript
async function getValue() {
  return 42;
}

// Equivalent to:
function getValue() {
  return Promise.resolve(42);
}

getValue().then(value => console.log(value));  // 42
```

---

### Async Function Expressions

```javascript
const fetchUser = async function() {
  return { id: 1, name: "Alice" };
};

const getData = async () => {
  return [1, 2, 3];
};
```

---

### Async Methods

```javascript
const obj = {
  async fetchData() {
    return "data";
  }
};

class MyClass {
  async fetchData() {
    return "data";
  }
  
  static async staticFetch() {
    return "static data";
  }
}
```

---

### Throwing Errors

**Throwing in async function creates rejected promise:**

```javascript
async function failingFunction() {
  throw new Error("oops");
}

failingFunction().catch(error => {
  console.log(error.message);  // "oops"
});

// Equivalent to:
function failingFunction() {
  return Promise.reject(new Error("oops"));
}
```

---

### 3.8.2 `await` Keyword

### Basic Usage

**`await` pauses execution until promise settles:**

```javascript
async function fetchUser() {
  const response = await fetch("https://api.example.com/user/1");
  const user = await response.json();
  return user;
}

fetchUser().then(user => console.log(user));
```

**Without `await` (for comparison):**

```javascript
function fetchUser() {
  return fetch("https://api.example.com/user/1")
    .then(response => response.json())
    .then(user => user);
}
```

---

### `await` Unwraps Promises

```javascript
async function example() {
  const promise = Promise.resolve(42);
  const value = await promise;
  console.log(value);  // 42 (not Promise)
}

example();
```

---

### Multiple `await` Statements

**Sequential (one after another):**

```javascript
async function fetchUsers() {
  const user1 = await fetch("/api/user/1").then(r => r.json());
  const user2 = await fetch("/api/user/2").then(r => r.json());
  const user3 = await fetch("/api/user/3").then(r => r.json());
  
  return [user1, user2, user3];
}

// Takes 3 * request_time (sequential)
```

**Parallel (concurrent):**

```javascript
async function fetchUsers() {
  const [user1, user2, user3] = await Promise.all([
    fetch("/api/user/1").then(r => r.json()),
    fetch("/api/user/2").then(r => r.json()),
    fetch("/api/user/3").then(r => r.json())
  ]);
  
  return [user1, user2, user3];
}

// Takes max(request_times) (parallel)
```

---

### `await` Only in Async Functions

```javascript
// Error: await outside async function
function regular() {
  const value = await Promise.resolve(42);  // SyntaxError
}

// Correct: await inside async function
async function asyncFunc() {
  const value = await Promise.resolve(42);  // OK
}
```

**Exception: Top-level await (see 3.8.4)**

---

### `await` with Non-Promises

**Works with any value (wraps in resolved promise):**

```javascript
async function example() {
  const value = await 42;  // Wrapped in Promise.resolve(42)
  console.log(value);  // 42
  
  const str = await "hello";
  console.log(str);  // "hello"
}
```

---

### 3.8.3 Error Handling

### `try...catch`

**Handle rejected promises:**

```javascript
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/user/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
    return null;
  }
}

fetchUser(1);
```

---

### Multiple Try-Catch Blocks

```javascript
async function complexOperation() {
  let user, posts;
  
  try {
    user = await fetchUser();
  } catch (error) {
    console.error("User fetch failed:", error);
    return;
  }
  
  try {
    posts = await fetchPosts(user.id);
  } catch (error) {
    console.error("Posts fetch failed:", error);
    posts = [];  // Use default
  }
  
  return { user, posts };
}
```

---

### `.catch()` on Promises

**Mix await with promise methods:**

```javascript
async function fetchUser(id) {
  const user = await fetch(`/api/user/${id}`)
    .then(r => r.json())
    .catch(error => {
      console.error("Fetch failed:", error);
      return null;
    });
  
  return user;
}
```

---

### Uncaught Errors

**Errors propagate to returned promise:**

```javascript
async function failing() {
  throw new Error("oops");
}

failing();  // Unhandled promise rejection

// Handle with .catch()
failing().catch(error => console.error(error));

// Or with await in async context
async function caller() {
  try {
    await failing();
  } catch (error) {
    console.error("Caught:", error.message);
  }
}
```

---

### `finally` Block

```javascript
async function fetchWithCleanup() {
  let connection;
  
  try {
    connection = await openConnection();
    const data = await connection.query("SELECT * FROM users");
    return data;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();  // Always runs
    }
  }
}
```

---

### 3.8.4 Top-Level `await`

### ES2022 Feature

**Use `await` at module top level:**

```javascript
// config.js (ES module)
const response = await fetch("/api/config");
const config = await response.json();

export default config;

// main.js
import config from "./config.js";
console.log(config);  // Available immediately
```

---

### Dynamic Imports

```javascript
const { default: module } = await import("./module.js");

// Conditional loading
if (condition) {
  const module = await import("./conditional-module.js");
  module.doSomething();
}
```

---

### Module Initialization

```javascript
// database.js
const connection = await connectToDatabase();
await connection.migrate();

export default connection;

// Using module
import db from "./database.js";
// db is already initialized and migrated
```

---

### Limitations

**Only in ES modules:**

```html
<!-- Works: type="module" -->
<script type="module">
  const data = await fetch("/api/data").then(r => r.json());
  console.log(data);
</script>

<!-- Doesn't work: regular script -->
<script>
  const data = await fetch("/api/data");  // SyntaxError
</script>
```

**Not in CommonJS:**

```javascript
// module.cjs (CommonJS)
const data = await fetch("/api/data");  // SyntaxError

// Use IIFE instead
(async () => {
  const data = await fetch("/api/data");
})();
```

---

### Load Order Dependencies

**Modules with top-level await block importing modules:**

```javascript
// slow-module.js
await new Promise(resolve => setTimeout(resolve, 2000));
export const data = "slow data";

// fast-module.js
export const data = "fast data";

// main.js
import { data as slowData } from "./slow-module.js";
import { data as fastData } from "./fast-module.js";

console.log(slowData, fastData);
// Takes 2 seconds (waits for slow-module)
```

---

### 3.8.5 Async Generators

### `async function*` Syntax

**Combine async and generator:**

```javascript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

// Consume with for await...of
(async () => {
  for await (let value of asyncGenerator()) {
    console.log(value);
  }
})();
// 1 (after delay)
// 2 (after delay)
// 3 (after delay)
```

---

### Async Iteration

```javascript
async function* fetchPages() {
  let page = 1;
  
  while (page <= 3) {
    const response = await fetch(`/api/data?page=${page}`);
    const data = await response.json();
    yield data;
    page++;
  }
}

(async () => {
  for await (let pageData of fetchPages()) {
    console.log(pageData);
  }
})();
```

---

### Real-World Example: Streaming

```javascript
async function* readLines(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = "";
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      if (buffer.length > 0) {
        yield buffer;
      }
      break;
    }
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();  // Keep incomplete line
    
    for (let line of lines) {
      yield line;
    }
  }
}

// Usage
(async () => {
  for await (let line of readLines("/data.txt")) {
    console.log(line);
  }
})();
```

---

### Async Generator Methods

**Similar to regular generators:**

```javascript
async function* gen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

const g = gen();

// next()
g.next().then(result => console.log(result));
// { value: 1, done: false }

// return()
g.return(0).then(result => console.log(result));
// { value: 0, done: true }

// throw()
async function* errorGen() {
  try {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
  } catch (error) {
    console.log("Caught:", error.message);
  }
}

const eg = errorGen();
await eg.next();
await eg.throw(new Error("oops"));
// Logs "Caught: oops"
```

---

### Delegating with `yield*`

```javascript
async function* inner() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

async function* outer() {
  yield await Promise.resolve("start");
  yield* inner();
  yield await Promise.resolve("end");
}

(async () => {
  for await (let value of outer()) {
    console.log(value);
  }
})();
// "start", 1, 2, "end"
```

---

### 3.8.6 Async Patterns

### Sequential Execution

```javascript
async function sequential() {
  const result1 = await operation1();
  const result2 = await operation2(result1);
  const result3 = await operation3(result2);
  return result3;
}
```

---

### Parallel Execution

```javascript
async function parallel() {
  const [result1, result2, result3] = await Promise.all([
    operation1(),
    operation2(),
    operation3()
  ]);
  
  return { result1, result2, result3 };
}
```

---

### Race Conditions

```javascript
async function fastest() {
  const result = await Promise.race([
    fetchFromServer1(),
    fetchFromServer2(),
    fetchFromServer3()
  ]);
  
  return result;  // First to complete
}
```

---

### Retry Logic

```javascript
async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const data = await retry(() => fetch("/api/data").then(r => r.json()));
```

---

### Timeout

```javascript
function timeout(ms, promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

async function fetchWithTimeout() {
  try {
    const data = await timeout(5000, fetch("/api/data"));
    return data;
  } catch (error) {
    console.error("Request timed out");
  }
}
```

---

### Cancellation

```javascript
async function cancellable(signal) {
  if (signal.aborted) {
    throw new Error("Aborted");
  }
  
  const response = await fetch("/api/data", { signal });
  return response.json();
}

// Usage
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);  // Cancel after 5s

try {
  const data = await cancellable(controller.signal);
} catch (error) {
  console.log("Request cancelled");
}
```

---

### 3.8.7 Best Practices

1. **Use `async`/`await` over promise chains** (more readable)
2. **Handle errors with `try...catch`** (don't let them go unhandled)
3. **Run independent operations in parallel** (use `Promise.all`)
4. **Don't `await` in loops unnecessarily** (leads to sequential execution)
5. **Use `Promise.allSettled`** when you want all results (even failures)
6. **Be careful with top-level `await`** (blocks module loading)
7. **Clean up resources in `finally`**
8. **Consider cancellation** for long-running operations

---

### 3.8.8 Common Pitfalls

### Forgetting `await`

```javascript
// Bug: forgot await
async function fetchUser() {
  const user = fetch("/api/user/1");  // Returns Promise, not user!
  console.log(user.name);  // undefined
}

// Correct
async function fetchUser() {
  const response = await fetch("/api/user/1");
  const user = await response.json();
  console.log(user.name);
}
```

---

### Sequential Instead of Parallel

```javascript
// Slow: sequential (3 seconds total)
async function slow() {
  const user1 = await fetchUser(1);  // 1 second
  const user2 = await fetchUser(2);  // 1 second
  const user3 = await fetchUser(3);  // 1 second
  return [user1, user2, user3];
}

// Fast: parallel (1 second total)
async function fast() {
  const [user1, user2, user3] = await Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ]);
  return [user1, user2, user3];
}
```

---

### Not Handling Rejections

```javascript
// Bug: unhandled rejection
async function bad() {
  const data = await fetch("/api/data");  // Might fail
  return data;
}

bad();  // If fetch fails, unhandled promise rejection

// Good: handle errors
async function good() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error("Fetch failed");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
```

---

## Summary

### Generators

- **`function*` syntax** creates generator functions
- **`yield`** pauses execution and produces value
- **`yield*`** delegates to another iterable
- **Methods**: `next()`, `return()`, `throw()`
- **Use cases**: lazy evaluation, infinite sequences, custom iterables
- **Iteration**: `for...of`, spread, destructuring

### Async Functions

- **`async`** makes function return Promise
- **`await`** pauses until Promise settles
- **Error handling**: `try...catch` or `.catch()`
- **Top-level `await`** in ES modules
- **Async generators** combine async and generators
- **Patterns**: sequential, parallel, race, retry, timeout
- **Common pitfalls**: forgetting `await`, sequential instead of parallel, unhandled rejections

---


## 3.9 Functions Summary

| Concept | Key Points |
|---------|------------|
| **Declarations vs Expressions** | Declarations hoisted; expressions not |
| **Arrow Functions** | Lexical `this`; no `arguments`; can't be constructors |
| **Parameters** | Default values, rest params, destructuring |
| **Closures** | Functions retain access to outer scope |
| **Higher-Order Functions** | Functions that take/return functions |
| **Currying** | Transform f(a,b,c) to f(a)(b)(c) |
| **Generators** | Pause/resume with `yield`; return iterators |
| **Async Functions** | `async`/`await` for promise-based code |

### Best Practices

1. **Use arrow functions** for callbacks and short functions
2. **Use `function` declarations** for top-level, named functions
3. **Default parameters** over checking `undefined`
4. **Rest parameters** over `arguments` object
5. **Destructure** complex parameters
6. **Keep closures lean** — capture only needed variables
7. **Use `Promise.all()`** for parallel async operations
8. **Always handle errors** in async functions

---

**End of Chapter 3: Functions**

Functions are JavaScript's primary abstraction mechanism. With closures, higher-order patterns, generators, and async/await mastered, you're ready to tackle objects and prototypes.
