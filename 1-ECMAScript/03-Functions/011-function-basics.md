# 3.1 Function Basics

### Introduction

Functions are first-class objects in JavaScript—they can be passed as arguments, returned from other functions, and assigned to variables. Understanding function declarations, expressions, hoisting, and the subtle differences between them is fundamental.

This section covers the core mechanics of functions: how they're defined, how they're invoked, and how JavaScript's engine processes them.

---

## 3.1.1 Function Declarations

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

## 3.1.2 Function Expressions

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

## 3.1.3 Anonymous Functions

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

## 3.1.4 Named Function Expressions

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

## 3.1.5 Function Properties and Methods

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

## 3.1.6 IIFEs (Immediately Invoked Function Expressions)

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

## 3.1.7 Function Declaration vs Expression

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

