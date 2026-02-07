# 2.4 Exception Handling

## Introduction

Exception handling uses `try...catch...finally` to handle errors gracefully. JavaScript provides built-in error types and allows custom errors.

---

## 2.4.1 `try...catch...finally`

### Basic `try...catch`

```javascript
try {
  // Code that might throw
  riskyOperation();
} catch (error) {
  // Handle error
  console.error("Error:", error.message);
}
```

---

### `finally` Block

**Always executes:**

```javascript
try {
  riskyOperation();
} catch (error) {
  console.error(error);
} finally {
  // Cleanup (always runs)
  cleanup();
}
```

**Runs even with `return`:**

```javascript
function test() {
  try {
    return "try";
  } finally {
    console.log("finally");  // Runs before return
  }
}

test();
// Logs: "finally"
// Returns: "try"
```

**`finally` can override return:**

```javascript
function test() {
  try {
    return "try";
  } finally {
    return "finally";  // Overrides try's return
  }
}

test();  // Returns "finally"
```

---

### Catch Without Binding (ES2019)

```javascript
try {
  riskyOperation();
} catch {
  // Don't need error variable
  console.log("Something went wrong");
}
```

---

### Nested `try...catch`

```javascript
try {
  try {
    throw new Error("inner");
  } catch (error) {
    console.log("inner catch");
    throw error;  // Re-throw
  }
} catch (error) {
  console.log("outer catch");
}
// Logs: "inner catch", "outer catch"
```

---

## 2.4.2 `throw` Statement

### Throw Errors

```javascript
throw new Error("Something went wrong");

throw new TypeError("Wrong type");

throw new RangeError("Out of range");
```

---

### Throw Any Value

```javascript
throw "Error string";

throw 42;

throw { code: 500, message: "Server error" };

throw null;  // Don't do this
```

**Always throw `Error` objects (for stack traces):**

```javascript
// Bad
throw "Error";

// Good
throw new Error("Error");
```

---

### Custom Error Messages

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

---

## 2.4.3 Built-In Error Types

### `Error` (Base Type)

```javascript
throw new Error("Generic error");

let error = new Error("Message");
error.name;     // "Error"
error.message;  // "Message"
error.stack;    // Stack trace
```

---

### `TypeError`

**Wrong type:**

```javascript
let x = null;
x.method();  // TypeError: Cannot read properties of null

// Manual throw
function process(value) {
  if (typeof value !== "number") {
    throw new TypeError("Expected number");
  }
}
```

---

### `ReferenceError`

**Undefined variable:**

```javascript
console.log(undeclaredVariable);
// ReferenceError: undeclaredVariable is not defined

// Or accessing before initialization
console.log(x);
let x = 10;
// ReferenceError: Cannot access 'x' before initialization
```

---

### `SyntaxError`

**Invalid syntax:**

```javascript
eval("let 123 = 'invalid'");
// SyntaxError: Invalid or unexpected token

JSON.parse("invalid json");
// SyntaxError: Unexpected token (in JSON)
```

---

### `RangeError`

**Out of range:**

```javascript
new Array(-1);
// RangeError: Invalid array length

(10).toFixed(101);
// RangeError: toFixed() digits argument must be between 0 and 100
```

---

### `URIError`

**Invalid URI:**

```javascript
decodeURIComponent("%");
// URIError: URI malformed
```

---

### `EvalError`

**Deprecated** (not used in modern JavaScript).

---

### `AggregateError`

**Multiple errors:**

```javascript
Promise.any([
  Promise.reject(new Error("Error 1")),
  Promise.reject(new Error("Error 2"))
]).catch(error => {
  console.log(error instanceof AggregateError);  // true
  console.log(error.errors);  // [Error: Error 1, Error: Error 2]
});
```

---

## 2.4.4 Custom Errors

### Extend `Error`

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

### With Additional Properties

```javascript
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

throw new HttpError(404, "Not found");
```

---

### Catch Specific Errors

```javascript
try {
  riskyOperation();
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation error:", error.message);
  } else if (error instanceof HttpError) {
    console.log("HTTP error:", error.statusCode);
  } else {
    console.log("Unknown error:", error);
  }
}
```

---

## 2.4.5 Error Stack Traces

### `stack` Property

```javascript
function a() { b(); }
function b() { c(); }
function c() { throw new Error("Oops"); }

try {
  a();
} catch (error) {
  console.log(error.stack);
}

// Stack trace:
// Error: Oops
//     at c (<file>:<line>:<col>)
//     at b (<file>:<line>:<col>)
//     at a (<file>:<line>:<col>)
//     at <global> (<file>:<line>:<col>)
```

---

### `Error.captureStackTrace()` (V8)

```javascript
class MyError extends Error {
  constructor(message) {
    super(message);
    this.name = "MyError";
    Error.captureStackTrace(this, MyError);  // Exclude constructor from stack
  }
}
```

---

## 2.4.6 Error Handling Patterns

### Fail Fast

```javascript
function processUser(user) {
  if (!user) {
    throw new Error("User is required");
  }
  
  if (!user.id) {
    throw new Error("User ID is required");
  }
  
  // Process...
}
```

---

### Try-Catch at Boundaries

**Catch at appropriate level:**

```javascript
// Low-level: let errors propagate
function readFile(path) {
  // Might throw, let caller handle
  return fs.readFileSync(path, "utf8");
}

// High-level: catch and handle
function loadConfig() {
  try {
    return readFile("config.json");
  } catch (error) {
    console.error("Failed to load config:", error);
    return getDefaultConfig();
  }
}
```

---

### Rethrowing

```javascript
try {
  riskyOperation();
} catch (error) {
  console.log("Logging error:", error);
  throw error;  // Re-throw for caller to handle
}
```

---

### Wrapping Errors

```javascript
try {
  lowLevelOperation();
} catch (error) {
  throw new Error(`High-level operation failed: ${error.message}`);
}
```

---

### Error Boundaries (React Pattern)

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

### Global Error Handlers

**Browser:**

```javascript
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
```

**Node.js:**

```javascript
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});
```

---

## 2.4.7 Best Practices

1. **Always throw `Error` objects** (not strings/numbers)
2. **Use specific error types** (`TypeError`, custom errors)
3. **Catch at appropriate level** (boundaries, not everywhere)
4. **Provide context in error messages**
5. **Log errors with stack traces**
6. **Clean up resources in `finally`**
7. **Don't catch and ignore** (at least log)
8. **Validate inputs early** (fail fast)
9. **Use custom errors for domain logic**
10. **Handle async errors** (try-catch in async, .catch for promises)

---

## Summary

### Loop Comparison

|Loop|Use Case|
|---|---|
|`for`|Known iterations, index needed|
|`while`|Unknown iterations, condition-based|
|`do-while`|At least one iteration guaranteed|
|`for-in`|Object properties|
|`for-of`|Array/iterable values|
|`for await-of`|Async iterables|

### Jump Statements

- **`break`**: Exit loop/switch/block
- **`continue`**: Skip to next iteration
- **`return`**: Exit function with value
- **Labels**: Target for break/continue

### Exception Handling

- **`try-catch`**: Handle errors
- **`finally`**: Cleanup (always runs)
- **`throw`**: Raise error
- **Built-in errors**: `Error`, `TypeError`, `ReferenceError`, etc.
- **Custom errors**: Extend `Error` class
- **Stack traces**: Debug with `error.stack`

---
