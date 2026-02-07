# 2.2 Loops

## Introduction

Loops execute code repeatedly. JavaScript provides several loop constructs: `for`, `while`, `do...while`, `for...in`, `for...of`, and `for await...of`. Each has specific use cases and behavior.

Understanding iteration mechanics, per-iteration bindings, and when to use each loop type is essential for writing efficient, bug-free code.

---

## 2.2.1 `for` Loop

### Basic Syntax

```javascript
for (initialization; condition; increment) {
  // Body executes while condition is truthy
}
```

**Example:**

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 0, 1, 2, 3, 4
```

---

### Execution Order

```javascript
// 1. initialization (once)
// 2. condition check
// 3. body (if condition true)
// 4. increment
// 5. goto step 2

for (let i = 0; i < 3; i++) {
  console.log(i);
}

// Execution:
// i = 0 (initialization)
// i < 3? true → console.log(0) → i++ → i = 1
// i < 3? true → console.log(1) → i++ → i = 2
// i < 3? true → console.log(2) → i++ → i = 3
// i < 3? false → exit loop
```

---

### Parts Are Optional

**All parts optional:**

```javascript
// Infinite loop
for (;;) {
  // Runs forever (use break to exit)
}
```

**Initialization outside:**

```javascript
let i = 0;
for (; i < 5; i++) {
  console.log(i);
}
```

**Increment in body:**

```javascript
for (let i = 0; i < 5;) {
  console.log(i);
  i++;
}
```

**Multiple statements in increment:**

```javascript
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
// 0 10
// 1 9
// 2 8
// 3 7
// 4 6
```

---

### `let` vs `var` in Loops

**`let` creates per-iteration binding:**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2 (each iteration has its own i)
```

**`var` has single binding:**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3 (all closures reference same i)
```

**How `let` works internally:**

```javascript
// Conceptually:
{
  let i = 0;
  {
    let i_iteration0 = i;
    setTimeout(() => console.log(i_iteration0), 100);
  }
  i++;
  {
    let i_iteration1 = i;
    setTimeout(() => console.log(i_iteration1), 100);
  }
  i++;
  // etc.
}
```

---

### Common Patterns

**Iterate array:**

```javascript
let arr = [10, 20, 30];

for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
```

**Reverse iteration:**

```javascript
for (let i = arr.length - 1; i >= 0; i--) {
  console.log(arr[i]);
}
// 30, 20, 10
```

**Step by 2:**

```javascript
for (let i = 0; i < 10; i += 2) {
  console.log(i);
}
// 0, 2, 4, 6, 8
```

**Nested loops:**

```javascript
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    console.log(i, j);
  }
}
```

---

## 2.2.2 `while` Loop

### Basic Syntax

```javascript
while (condition) {
  // Execute while condition is truthy
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

---

### Execution Order

```javascript
// 1. Check condition
// 2. Execute body (if condition true)
// 3. Goto step 1

let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}

// Execution:
// i < 3? true → console.log(0) → i++ → i = 1
// i < 3? true → console.log(1) → i++ → i = 2
// i < 3? true → console.log(2) → i++ → i = 3
// i < 3? false → exit
```

---

### When to Use

**Use when:**

- Number of iterations unknown
- Iteration depends on complex condition
- More readable than `for` for the use case

```javascript
// Reading file line by line
let line;
while ((line = readLine()) !== null) {
  processLine(line);
}

// Waiting for condition
while (!isReady) {
  wait();
}

// Processing queue
while (queue.length > 0) {
  processItem(queue.shift());
}
```

---

### Infinite Loop

```javascript
while (true) {
  // Runs forever
  if (shouldExit) break;
}
```

---

## 2.2.3 `do...while` Loop

### Basic Syntax

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
```

---

### Executes At Least Once

```javascript
let i = 10;

// while: doesn't execute
while (i < 5) {
  console.log(i);  // Never runs
}

// do-while: executes once
do {
  console.log(i);  // Logs 10
} while (i < 5);
```

---

### When to Use

**Menu-driven programs:**

```javascript
let choice;
do {
  choice = showMenu();
  processChoice(choice);
} while (choice !== "quit");
```

**Input validation:**

```javascript
let input;
do {
  input = prompt("Enter a number between 1 and 10:");
} while (input < 1 || input > 10);
```

---

## 2.2.4 `for...in` Loop

### Basic Syntax

```javascript
for (variable in object) {
  // Iterate over enumerable properties
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

---

### Enumerates Properties

**Includes inherited properties:**

```javascript
let parent = { inherited: true };
let child = Object.create(parent);
child.own = true;

for (let key in child) {
  console.log(key);
}
// "own"
// "inherited"
```

**Filter own properties:**

```javascript
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key);  // Only "own"
  }
}

// Or use Object.keys (own properties only)
for (let key of Object.keys(child)) {
  console.log(key);  // Only "own"
}
```

---

### Arrays (Don't Use)

**Iterates indices as strings:**

```javascript
let arr = [10, 20, 30];

for (let index in arr) {
  console.log(typeof index);  // "string"
  console.log(index, arr[index]);
}
// "0" 10
// "1" 20
// "2" 30
```

**Problems:**

1. Indices are strings (not numbers)
2. Iterates all enumerable properties (including added ones)
3. Order not guaranteed (though usually is)

```javascript
let arr = [10, 20, 30];
arr.custom = "value";

for (let index in arr) {
  console.log(index, arr[index]);
}
// "0" 10
// "1" 20
// "2" 30
// "custom" "value"  ← included!
```

**Use `for...of` for arrays:**

```javascript
for (let value of arr) {
  console.log(value);
}
// 10, 20, 30 (no "custom")
```

---

### Order of Iteration

**Generally:**

1. Integer keys in ascending order
2. String keys in creation order
3. Symbol keys (not enumerated by `for...in`)

**But order is not guaranteed by spec (though implementations are consistent).**

---

## 2.2.5 `for...of` Loop

### Basic Syntax

```javascript
for (variable of iterable) {
  // Iterate over values
}
```

**Example:**

```javascript
let arr = [10, 20, 30];

for (let value of arr) {
  console.log(value);
}
// 10, 20, 30
```

---

### Works with Iterables

**Arrays:**

```javascript
for (let item of [1, 2, 3]) {
  console.log(item);
}
```

**Strings:**

```javascript
for (let char of "hello") {
  console.log(char);
}
// "h", "e", "l", "l", "o"

// Handles Unicode correctly
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

**Typed Arrays:**

```javascript
let arr = new Uint8Array([1, 2, 3]);
for (let value of arr) {
  console.log(value);
}
```

---

### Not for Plain Objects

**Objects are not iterable:**

```javascript
let obj = { a: 1, b: 2 };

for (let value of obj) {  // TypeError: obj is not iterable
  console.log(value);
}
```

**Solutions:**

```javascript
// Iterate keys
for (let key of Object.keys(obj)) {
  console.log(key, obj[key]);
}

// Iterate values
for (let value of Object.values(obj)) {
  console.log(value);
}

// Iterate entries
for (let [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```

---

### Destructuring in `for...of`

```javascript
let arr = [[1, 2], [3, 4], [5, 6]];

for (let [a, b] of arr) {
  console.log(a, b);
}
// 1 2
// 3 4
// 5 6

let users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
];

for (let { name, age } of users) {
  console.log(name, age);
}
// "Alice" 30
// "Bob" 25
```

---

### Custom Iterables

**Implement `Symbol.iterator`:**

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

**Generator function (easier):**

```javascript
let range = {
  from: 1,
  to: 5,
  
  *[Symbol.iterator]() {
    for (let value = this.from; value <= this.to; value++) {
      yield value;
    }
  }
};

for (let num of range) {
  console.log(num);
}
// 1, 2, 3, 4, 5
```

---

## 2.2.6 `for await...of` Loop

### Basic Syntax

```javascript
for await (variable of asyncIterable) {
  // Iterate over async values
}
```

**Must be in async context:**

```javascript
async function process() {
  for await (let value of asyncIterable) {
    console.log(value);
  }
}
```

---

### Async Iterables

**Async generators:**

```javascript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

(async () => {
  for await (let value of asyncGenerator()) {
    console.log(value);
  }
})();
// 1 (after delay)
// 2 (after delay)
// 3 (after delay)
```

**Custom async iterable:**

```javascript
let asyncRange = {
  from: 1,
  to: 3,
  
  [Symbol.asyncIterator]() {
    return {
      current: this.from,
      last: this.to,
      
      async next() {
        await delay(100);  // Simulate async operation
        
        if (this.current <= this.last) {
          return { value: this.current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

(async () => {
  for await (let num of asyncRange) {
    console.log(num);
  }
})();
```

---

### Streams and Async Iteration

**ReadableStream:**

```javascript
const response = await fetch(url);
const reader = response.body.getReader();

// Manual iteration
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  processChunk(value);
}

// With async iteration (Node.js Streams)
for await (const chunk of stream) {
  processChunk(chunk);
}
```

---

### Error Handling

```javascript
async function* asyncGen() {
  yield 1;
  throw new Error("Error at 2");
  yield 3;  // Never reached
}

(async () => {
  try {
    for await (let value of asyncGen()) {
      console.log(value);
    }
  } catch (error) {
    console.error(error.message);  // "Error at 2"
  }
})();
```

---

## 2.2.7 Loop Control Best Practices

### Avoid Modifying Loop Variable

**Bad:**

```javascript
for (let i = 0; i < 10; i++) {
  if (condition) {
    i += 5;  // Confusing
  }
}
```

**Good:**

```javascript
for (let i = 0; i < 10; i++) {
  if (condition) {
    break;  // Or continue
  }
}
```

---

### Cache Length in Performance-Critical Loops

**If length doesn't change:**

```javascript
// Recalculates length each iteration
for (let i = 0; i < arr.length; i++) { }

// Cache length (micro-optimization, usually not needed)
for (let i = 0, len = arr.length; i < len; i++) { }
```

**Modern engines optimize this, so prefer readability.**

---

### Prefer `for...of` for Arrays

**More readable:**

```javascript
// Traditional for
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// for...of (better)
for (let item of arr) {
  console.log(item);
}
```

**When you need index:**

```javascript
// entries() provides index
for (let [index, item] of arr.entries()) {
  console.log(index, item);
}

// Or forEach
arr.forEach((item, index) => {
  console.log(index, item);
});
```

---

### Loop Choice Flowchart

1. **Iterating array/iterable?** → `for...of`
2. **Iterating object properties?** → `Object.keys/values/entries` + `for...of`
3. **Need index in array?** → `array.entries()` or traditional `for`
4. **Unknown iterations (condition-based)?** → `while`
5. **Guaranteed at least once?** → `do...while`
6. **Async iteration?** → `for await...of`

---
