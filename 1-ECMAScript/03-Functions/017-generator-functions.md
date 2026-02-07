# 3.7 Generator Functions

## Introduction

Generator functions are special functions that can pause execution and resume later, yielding multiple values over time. They provide powerful control flow and enable lazy evaluation, infinite sequences, and custom iteration.

Understanding generators requires grasping how they differ from regular functions, how `yield` works, and their practical applications.

---

## 3.7.1 `function*` Syntax

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

## 3.7.2 `yield` Keyword

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

## 3.7.3 `yield*` Delegation

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

## 3.7.4 Generator Methods

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

## 3.7.5 Iterating Generators

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

## 3.7.6 Use Cases

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

## 3.7.7 Generator Best Practices

1. **Use for lazy evaluation** (don't compute everything upfront)
2. **Document infinite sequences** (make it clear they're infinite)
3. **Use `yield*` for delegation** (cleaner than manual yielding)
4. **Handle cleanup in `finally`** (runs even if generator terminated early)
5. **Return meaningful values** (for `yield*` delegation)
6. **Prefer `for...of`** over manual `next()` calls
7. **Use generators for custom iterables** (cleaner than manual iterator protocol)

---

