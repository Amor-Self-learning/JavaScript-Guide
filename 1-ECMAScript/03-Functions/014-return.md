# 3.4 Return Values

## Introduction

Functions can return values explicitly with `return`, implicitly (arrow functions), or return `undefined` by default.

---

## 3.4.1 Explicit Return

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

## 3.4.2 Implicit Return (Arrow Functions)

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

## 3.4.3 Returning Multiple Values

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

## 3.4.4 Return Value Best Practices

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
