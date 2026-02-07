# 2.3 Jump Statements

## Introduction

Jump statements alter normal control flow: `break` exits loops/switch, `continue` skips iterations, `return` exits functions, and labels enable targeted jumps.

---

## 2.3.1 `break` Statement

### Exit Loop

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);
}
// 0, 1, 2, 3, 4
```

---

### Exit Switch

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

---

### Labeled `break`

**Break outer loop:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    console.log(i, j);
  }
}
// 0 0, 0 1, 0 2, 1 0
```

**Break block:**

```javascript
myBlock: {
  console.log("before");
  if (condition) break myBlock;
  console.log("after");  // Skipped if condition true
}
console.log("outside");
```

---

### Common Patterns

**Search with early exit:**

```javascript
let found = false;
for (let item of arr) {
  if (item === target) {
    found = true;
    break;
  }
}

// Or use Array.includes/find
let found = arr.includes(target);
let item = arr.find(x => x === target);
```

**Process until condition:**

```javascript
while (true) {
  let item = queue.shift();
  if (!item) break;
  processItem(item);
}
```

---

## 2.3.2 `continue` Statement

### Skip to Next Iteration

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);
}
// 0, 1, 3, 4
```

---

### In Different Loops

**`for` loop:**

```javascript
for (let i = 0; i < 5; i++) {
  if (i % 2 === 0) continue;
  console.log(i);  // Odd numbers only
}
// 1, 3
```

**`while` loop:**

```javascript
let i = 0;
while (i < 5) {
  i++;
  if (i % 2 === 0) continue;
  console.log(i);  // Odd numbers only
}
// 1, 3, 5
```

**`for...of` loop:**

```javascript
for (let item of arr) {
  if (item < 0) continue;
  console.log(item);  // Positive numbers only
}
```

---

### Labeled `continue`

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;
    console.log(i, j);
  }
}
// 0 0, 1 0, 2 0
```

---

### Common Patterns

**Skip invalid items:**

```javascript
for (let user of users) {
  if (!user.isActive) continue;
  processUser(user);
}
```

**Filter in loop:**

```javascript
for (let value of values) {
  if (value < min || value > max) continue;
  result.push(value);
}

// Better: use filter
let result = values.filter(v => v >= min && v <= max);
```

---

## 2.3.3 `return` Statement

### Exit Function

```javascript
function add(a, b) {
  return a + b;
}

let result = add(5, 3);  // 8
```

---

### Early Return (Guard Clauses)

```javascript
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;
  
  // Process user
  return user.data;
}
```

---

### Multiple Return Points

**Readable for guard clauses:**

```javascript
function validateInput(input) {
  if (typeof input !== "string") {
    return { valid: false, error: "Must be string" };
  }
  
  if (input.length < 3) {
    return { valid: false, error: "Too short" };
  }
  
  if (input.length > 100) {
    return { valid: false, error: "Too long" };
  }
  
  return { valid: true };
}
```

**Avoid when confusing:**

```javascript
// Hard to follow
function complex(x) {
  if (x > 0) {
    if (x < 10) {
      return "small";
    } else {
      if (x < 100) {
        return "medium";
      } else {
        return "large";
      }
    }
  } else {
    return "negative";
  }
}

// Better: single return
function complex(x) {
  let result;
  
  if (x < 0) {
    result = "negative";
  } else if (x < 10) {
    result = "small";
  } else if (x < 100) {
    result = "medium";
  } else {
    result = "large";
  }
  
  return result;
}
```

---

### Arrow Function Returns

**Implicit return (single expression):**

```javascript
const add = (a, b) => a + b;

const double = x => x * 2;
```

**Explicit return (block):**

```javascript
const add = (a, b) => {
  const result = a + b;
  return result;
};
```

**Returning object literal:**

```javascript
// Wrong: interpreted as block
const makeObj = (x) => { x: x };  // undefined

// Correct: wrap in parentheses
const makeObj = (x) => ({ x: x });
```

---

## 2.3.4 Labels

### Syntax

```javascript
labelName: statement
```

---

### Label Loops

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    console.log(i, j);
  }
}
```

---

### Label Blocks

```javascript
myBlock: {
  console.log("start");
  if (condition) break myBlock;
  console.log("middle");
  if (condition2) break myBlock;
  console.log("end");
}
console.log("after");
```

---

### Common Use Cases

**Break nested loops:**

```javascript
outer: for (let row of matrix) {
  for (let cell of row) {
    if (cell === target) {
      console.log("Found!");
      break outer;  // Exit both loops
    }
  }
}
```

**Named blocks for clarity:**

```javascript
validation: {
  if (!input) {
    errors.push("Required");
    break validation;
  }
  
  if (input.length < 3) {
    errors.push("Too short");
    break validation;
  }
  
  // More validation...
}
```

---

### Best Practices

1. **Use labels sparingly** (often there's a better way)
2. **Name labels descriptively** (`outer`, `validation`, not `label1`)
3. **Prefer functions over labeled breaks** when possible
4. **Document why you're using a label**

---