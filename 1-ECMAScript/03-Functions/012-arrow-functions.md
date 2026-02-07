# 3.2 Arrow Functions

## Introduction

Arrow functions provide concise syntax and **lexical `this` binding**. They're not just syntactic sugar—they have different behavior from regular functions.

---

## 3.2.1 Syntax Variations

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

## 3.2.2 Implicit Return

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

## 3.2.3 Lexical `this` Binding

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

## 3.2.4 No `arguments` Object

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

## 3.2.5 Cannot Be Constructors

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

## 3.2.6 Other Differences

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

## 3.2.7 When to Use Arrow Functions

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

