# 3.5 Scope and Closures

## Introduction

Scope determines variable accessibility. Closures are functions that retain access to their lexical scope even when executed outside that scope. Understanding these concepts is fundamental to mastering JavaScript.

This chapter explores lexical scoping, the scope chain, how closures work internally, practical use cases, and memory implications.

---

## 3.5.1 Lexical Scope

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

## 3.5.2 Function Scope

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

## 3.5.3 Block Scope

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

## 3.5.4 Closure Mechanism

### Definition

A **closure** is a function that retains access to its lexical scope even when the function is executed outside that scope.

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

## 3.5.5 Closure Use Cases

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

## 3.5.6 Module Pattern with Closures

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

## 3.5.7 Memory Considerations

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

## 3.5.8 Best Practices

1. **Use closures for data privacy**
2. **Be aware of memory retention**
3. **Clean up event listeners**
4. **Only capture variables you need**
5. **Use `let` in loops** (creates per-iteration binding)
6. **Document closure dependencies**
7. **Consider WeakMap** for private data in classes
8. **Profile memory** if closures are used heavily

---

