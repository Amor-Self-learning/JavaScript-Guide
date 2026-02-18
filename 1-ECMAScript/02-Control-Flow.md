# 2 Control Flow

Control flow determines the order in which statements execute. JavaScript provides conditionals (`if`, `switch`), loops (`for`, `while`, `for...of`), jump statements (`break`, `continue`, `return`), and exception handling (`try...catch...finally`).

This chapter builds on the statement fundamentals from Chapter 1.6, diving deeper into patterns, edge cases, and best practices for controlling program execution.

---

## 2.1 Conditional Statements

### 2.1.1 `if` Statement

### Basic Syntax

```javascript
if (condition) {
  // Execute if condition is truthy
}
```

**Example:**

```javascript
let age = 20;

if (age >= 18) {
  console.log("Adult");
}
```

---

### Truthiness in Conditions

The condition is **coerced to boolean**:

```javascript
// Truthy values
if (1) { }              // Executes
if ("hello") { }        // Executes
if ([]) { }             // Executes (arrays are truthy!)
if ({}) { }             // Executes (objects are truthy!)

// Falsy values (8 total)
if (false) { }          // Doesn't execute
if (0) { }              // Doesn't execute
if (-0) { }             // Doesn't execute
if (0n) { }             // Doesn't execute
if ("") { }             // Doesn't execute
if (null) { }           // Doesn't execute
if (undefined) { }      // Doesn't execute
if (NaN) { }            // Doesn't execute
```

**Common mistakes:**

```javascript
// Wrong: Checking if array/object exists
let arr = [];
if (arr) {
  // Always executes! Arrays are truthy even when empty
}

// Correct: Check length
if (arr.length) {
  // Executes only if array has elements
}

// Wrong: Checking if string is "0" or "false"
let str = "0";
if (str) {
  // Executes! Non-empty strings are truthy
}

// Correct: Explicit comparison
if (str !== "0") { }
```

---

### Block Statements

**With braces (recommended):**

```javascript
if (condition) {
  statement1;
  statement2;
}
```

**Without braces (single statement):**

```javascript
if (condition)
  statement;

// Dangerous: easy to introduce bugs
if (condition)
  statement1;
  statement2;  // Always executes! Not part of if
```

**Always use braces:**

```javascript
// Bad
if (x > 0)
  console.log("positive");

// Good
if (x > 0) {
  console.log("positive");
}
```

---

### `if...else`

```javascript
if (condition) {
  // Execute if truthy
} else {
  // Execute if falsy
}
```

**Example:**

```javascript
let age = 15;

if (age >= 18) {
  console.log("Adult");
} else {
  console.log("Minor");
}
```

---

### `else if` Chains

```javascript
if (condition1) {
  // Execute if condition1 is truthy
} else if (condition2) {
  // Execute if condition2 is truthy
} else if (condition3) {
  // Execute if condition3 is truthy
} else {
  // Execute if all conditions are falsy
}
```

**Example:**

```javascript
let score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else if (score >= 70) {
  console.log("C");
} else if (score >= 60) {
  console.log("D");
} else {
  console.log("F");
}
```

**Order matters (first match wins):**

```javascript
let x = 50;

// Wrong order
if (x > 0) {
  console.log("positive");  // This executes
} else if (x > 25) {
  console.log("greater than 25");  // Never reached!
}

// Correct order (most specific first)
if (x > 25) {
  console.log("greater than 25");
} else if (x > 0) {
  console.log("positive");
}
```

---

### Dangling `else` Problem

**Ambiguous `else` binding:**

```javascript
// Misleading indentation
if (x > 0)
  if (y > 0)
    console.log("both positive");
else  // Which if does this belong to?
  console.log("x not positive?");

// Actually binds to the inner if!
// Equivalent to:
if (x > 0) {
  if (y > 0) {
    console.log("both positive");
  } else {
    console.log("y not positive");
  }
}
```

**Solution: Always use braces:**

```javascript
if (x > 0) {
  if (y > 0) {
    console.log("both positive");
  }
} else {
  console.log("x not positive");
}
```

---

### Nested Conditionals

**Flatten when possible:**

```javascript
// Nested (hard to read)
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      processUser(user);
    }
  }
}

// Guard clauses (better)
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) return;

processUser(user);

// Or combine conditions
if (user && user.isActive && user.hasPermission) {
  processUser(user);
}

// Or use optional chaining
if (user?.isActive && user?.hasPermission) {
  processUser(user);
}
```

---

### Assignment in Conditions (Common Bug)

```javascript
let x = 5;

// Bug: Assignment instead of comparison
if (x = 10) {  // Assigns 10 to x, evaluates to 10 (truthy)
  console.log("This always runs");
  console.log(x);  // 10
}

// Correct: Comparison
if (x === 10) {
  console.log("x is 10");
}
```

**Intentional assignment (Yoda conditions prevent this):**

```javascript
// Intentional assignment
let match;
if (match = str.match(/pattern/)) {
  console.log("Found:", match);
}

// Prevent accidental assignment with Yoda condition
if (10 === x) {  // Can't accidentally write 10 = x
  console.log("x is 10");
}
```

**Use linters to catch this:**

```javascript
// ESLint rule: no-cond-assign
if (x = 10) {  // Warning: Expected a conditional expression
  // ...
}
```

---

### 2.1.2 Ternary Operator

### Basic Syntax

```javascript
condition ? valueIfTrue : valueIfFalse
```

**Example:**

```javascript
let age = 20;
let status = age >= 18 ? "adult" : "minor";
console.log(status);  // "adult"
```

---

### When to Use

**Good use cases:**

```javascript
// Simple conditional assignment
let max = a > b ? a : b;

// Inline rendering (React)
{isLoggedIn ? <Dashboard /> : <Login />}

// Default values (though ?? is better)
let name = user.name ? user.name : "Anonymous";
let name = user.name ?? "Anonymous";  // Better

// Simple conditional expressions
console.log(x > 0 ? "positive" : "negative");
```

**Avoid for:**

```javascript
// Complex logic (use if...else)
let result = condition1 ? (
  condition2 ? value1 : value2
) : (
  condition3 ? value3 : value4
);  // Hard to read

// Side effects (confusing)
x > 0 ? doThis() : doThat();  // Use if...else instead

// Multiple statements
x > 0 ? (a++, b++, c++) : (x++, y++, z++);  // Confusing
```

---

### Nested Ternary

**Single level (acceptable):**

```javascript
let grade = score >= 90 ? "A" :
            score >= 80 ? "B" :
            score >= 70 ? "C" : "F";
```

**Multiple levels (avoid):**

```javascript
// Unreadable
let result = a ? b ? c ? d : e : f : g ? h : i;

// Better: use if...else
let result;
if (a) {
  if (b) {
    result = c ? d : e;
  } else {
    result = f;
  }
} else {
  result = g ? h : i;
}
```

---

### Ternary vs Logical Operators

```javascript
// Ternary
let result = condition ? value : defaultValue;

// Logical OR (shorter for defaults)
let result = value || defaultValue;

// But beware of falsy values
let count = userCount || 0;  // Wrong if userCount is 0
let count = userCount ?? 0;  // Correct: only null/undefined

// Ternary is explicit
let count = userCount !== null && userCount !== undefined ? userCount : 0;
```

---

### Operator Precedence

```javascript
// Assignment has lower precedence
let result = x > 0 ? 1 : 0;  // OK

// But watch out for complex expressions
let result = x > 0 ? y = 1 : y = 0;  // Assignment in ternary
let result = (x > 0 ? y : z) = 1;    // SyntaxError

// Use parentheses for clarity
let result = x > 0 ? (a + b) : (c + d);
```

---

### 2.1.3 `switch` Statement

### Basic Syntax

```javascript
switch (expression) {
  case value1:
    // Execute if expression === value1
    break;
  case value2:
    // Execute if expression === value2
    break;
  default:
    // Execute if no case matches
}
```

**Example:**

```javascript
let day = 2;

switch (day) {
  case 0:
    console.log("Sunday");
    break;
  case 1:
    console.log("Monday");
    break;
  case 2:
    console.log("Tuesday");
    break;
  default:
    console.log("Unknown");
}
// "Tuesday"
```

---

### Strict Equality Comparison

`switch` uses **strict equality (`===`)**:

```javascript
let x = "10";

switch (x) {
  case 10:  // Doesn't match (number vs string)
    console.log("number 10");
    break;
  case "10":  // Matches
    console.log("string 10");
    break;
}
// "string 10"
```

---

### Fall-Through Behavior

**Without `break`, execution continues to next case:**

```javascript
let x = 1;

switch (x) {
  case 1:
    console.log("one");
    // No break! Falls through
  case 2:
    console.log("two");
    // No break! Falls through
  case 3:
    console.log("three");
    break;
}
// Logs: "one", "two", "three"
```

**Intentional fall-through (document it):**

```javascript
let month = 2;

switch (month) {
  case 1:
  case 3:
  case 5:
  case 7:
  case 8:
  case 10:
  case 12:
    console.log("31 days");
    break;
  case 4:
  case 6:
  case 9:
  case 11:
    console.log("30 days");
    break;
  case 2:
    console.log("28 or 29 days");
    break;
}
```

**Comment intentional fall-through:**

```javascript
switch (value) {
  case 1:
    doSomething();
    // falls through
  case 2:
    doSomethingElse();
    break;
}
```

---

### `default` Case

**Optional but recommended:**

```javascript
switch (value) {
  case 1:
    console.log("one");
    break;
  case 2:
    console.log("two");
    break;
  default:
    console.log("other");
}
```

**Position doesn't matter (but put at end by convention):**

```javascript
// Default at beginning (unusual but valid)
switch (value) {
  default:
    console.log("default");
    break;
  case 1:
    console.log("one");
    break;
}
```

**`default` with fall-through:**

```javascript
switch (value) {
  case 1:
  case 2:
  case 3:
    console.log("1, 2, or 3");
    break;
  default:
    console.log("other");
    // No break needed (last case)
}
```

---

### Block Scope in Cases

**Single block scope for entire switch:**

```javascript
switch (value) {
  case 1:
    let x = 10;  // Declared in switch block
    break;
  case 2:
    let x = 20;  // SyntaxError: x already declared
    break;
}
```

**Solution: Use block in each case:**

```javascript
switch (value) {
  case 1: {
    let x = 10;
    console.log(x);
    break;
  }
  case 2: {
    let x = 20;  // OK: different block scope
    console.log(x);
    break;
  }
}
```

---

### Expressions in Cases

**Cases can be expressions:**

```javascript
let x = 5;

switch (true) {
  case x > 0:
    console.log("positive");
    break;
  case x < 0:
    console.log("negative");
    break;
  default:
    console.log("zero");
}
```

**Dynamic case values:**

```javascript
const MIN = 0;
const MAX = 100;

switch (value) {
  case MIN:
    console.log("minimum");
    break;
  case MAX:
    console.log("maximum");
    break;
}
```

---

### Return in Switch

**Can return directly (no break needed):**

```javascript
function getDayName(day) {
  switch (day) {
    case 0: return "Sunday";
    case 1: return "Monday";
    case 2: return "Tuesday";
    case 3: return "Wednesday";
    case 4: return "Thursday";
    case 5: return "Friday";
    case 6: return "Saturday";
    default: return "Invalid";
  }
}
```

---

### `switch` vs `if...else`

**Use `switch` when:**

- Multiple discrete values to check
- Same variable/expression tested
- Fall-through behavior needed

```javascript
// Good use of switch
switch (status) {
  case "pending":
    processPending();
    break;
  case "approved":
    processApproved();
    break;
  case "rejected":
    processRejected();
    break;
}
```

**Use `if...else` when:**

- Complex conditions
- Range checks
- Different variables tested
- Boolean logic needed

```javascript
// Better as if...else
if (age < 18) {
  console.log("minor");
} else if (age >= 18 && age < 65) {
  console.log("adult");
} else {
  console.log("senior");
}
```

---

### Object Lookup Alternative

**Instead of switch:**

```javascript
switch (action) {
  case "add":
    return a + b;
  case "subtract":
    return a - b;
  case "multiply":
    return a * b;
  case "divide":
    return a / b;
}
```

**Use object lookup:**

```javascript
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

return operations[action]?.(a, b);
```

**Or Map:**

```javascript
const operations = new Map([
  ["add", (a, b) => a + b],
  ["subtract", (a, b) => a - b],
  ["multiply", (a, b) => a * b],
  ["divide", (a, b) => a / b]
]);

return operations.get(action)?.(a, b);
```

---

### 2.1.4 Common Patterns and Best Practices

### Guard Clauses

**Early returns to reduce nesting:**

```javascript
// Deeply nested
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // Process user
        return user.data;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// Guard clauses (better)
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;
  
  // Process user
  return user.data;
}
```

---

### Null/Undefined Checks

**Explicit null check:**

```javascript
if (value === null) { }
if (value === undefined) { }
if (value === null || value === undefined) { }

// Loose equality (checks both)
if (value == null) { }  // Matches null or undefined

// Nullish check (preferred)
if (value ?? false) { }
```

**Optional chaining:**

```javascript
// Old way
if (user && user.profile && user.profile.name) {
  console.log(user.profile.name);
}

// Optional chaining
if (user?.profile?.name) {
  console.log(user.profile.name);
}

// With nullish coalescing
const name = user?.profile?.name ?? "Anonymous";
```

---

### Boolean Conditions

**Don't compare to true/false:**

```javascript
// Bad
if (isActive === true) { }
if (isActive === false) { }

// Good
if (isActive) { }
if (!isActive) { }
```

**Exception: Checking for exact boolean:**

```javascript
// When value might be truthy but not true
let value = "hello";

if (value) { }       // true (truthy)
if (value === true) { }  // false (not boolean true)
```

---

### Type Checking

**Check type before operations:**

```javascript
// Defensive
function processString(str) {
  if (typeof str !== "string") {
    throw new TypeError("Expected string");
  }
  
  return str.toUpperCase();
}

// With default
function processString(str = "") {
  if (typeof str !== "string") {
    str = String(str);
  }
  
  return str.toUpperCase();
}
```

---

### Logical Operators in Conditions

**Short-circuit evaluation:**

```javascript
// Execute only if user exists
user && user.login();

// Default value
let name = user.name || "Anonymous";

// Nullish coalescing (better for 0, "", false)
let count = userCount ?? 0;
```

**Combining conditions:**

```javascript
// AND
if (user && user.isActive && user.hasPermission) { }

// OR
if (isAdmin || isModerator || isOwner) { }

// Mixed
if ((isAdmin || isModerator) && hasPermission) { }
```

---

### Switch Statement Best Practices

1. **Always include `default`** (even if just error handling)
2. **Always use `break`** (unless intentional fall-through)
3. **Comment intentional fall-through**
4. **Use blocks for `let`/`const` in cases**
5. **Consider object lookup for complex switches**

---

### Readability Guidelines

**Positive conditions first:**

```javascript
// Harder to read
if (!user.isInactive) {
  processUser(user);
}

// Easier to read
if (user.isActive) {
  processUser(user);
}
```

**Extract complex conditions:**

```javascript
// Hard to read
if (user.age >= 18 && user.hasLicense && !user.isSuspended && user.passedTest) {
  allowDriving(user);
}

// Better: Extract to variable
const canDrive = user.age >= 18 && 
                 user.hasLicense && 
                 !user.isSuspended && 
                 user.passedTest;

if (canDrive) {
  allowDriving(user);
}

// Or extract to function
function canUserDrive(user) {
  return user.age >= 18 && 
         user.hasLicense && 
         !user.isSuspended && 
         user.passedTest;
}

if (canUserDrive(user)) {
  allowDriving(user);
}
```

---

### 2.1.5 Performance Considerations

### Short-Circuit Evaluation

**Logical operators stop at first determinant:**

```javascript
// && stops at first falsy
false && expensiveOperation();  // expensiveOperation not called

// || stops at first truthy
true || expensiveOperation();   // expensiveOperation not called

// Put cheap checks first
if (cheapCheck() && expensiveCheck()) { }
```

---

### Switch vs If-Else Performance

**For many cases, switch can be faster:**

```javascript
// Many if-else (linear search)
if (x === 1) { }
else if (x === 2) { }
else if (x === 3) { }
// ... 100 more cases

// Switch (can be optimized to jump table)
switch (x) {
  case 1: break;
  case 2: break;
  case 3: break;
  // ... 100 more cases
}
```

**But modern engines optimize both well. Prefer readability.**

---

### 2.1.6 Summary

### Conditional Statement Comparison

|Feature|`if...else`|Ternary|`switch`|
|---|---|---|---|
|**Complexity**|Any|Simple|Discrete values|
|**Returns value**|No (statement)|Yes (expression)|No (statement)|
|**Fall-through**|No|No|Yes (with care)|
|**Readability**|Best for complex|Best for simple|Best for many cases|
|**Type check**|Coerces to boolean|Coerces to boolean|Strict equality|

---

### Best Practices

1. **Always use braces** for `if` blocks (even single statement)
2. **Use guard clauses** to reduce nesting
3. **Prefer positive conditions** for readability
4. **Extract complex conditions** to variables/functions
5. **Use ternary only for simple assignments**
6. **Include `default` in switch statements**
7. **Document intentional fall-through**
8. **Use optional chaining** for null checks
9. **Prefer nullish coalescing (`??`)** over OR (`||`) for defaults
10. **Choose the right tool**: `if` for complex, ternary for simple, switch for many discrete cases

---

### Key Takeaways

- **8 falsy values**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`
- **Empty arrays/objects are truthy**
- **`switch` uses strict equality (`===`)**
- **Fall-through requires explicit `break`**
- **Guard clauses reduce nesting**
- **Optional chaining simplifies null checks**
- **Ternary is an expression**, `if`/`switch` are statements
- **Readability > cleverness**

---

Next: Loops (for, while, for-in, for-of, for await...of).

## 2.2 Loops

### 2.2.1 `for` Loop

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

### 2.2.2 `while` Loop

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

### 2.2.3 `do...while` Loop

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

### 2.2.4 `for...in` Loop

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

### 2.2.5 `for...of` Loop

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

### 2.2.6 `for await...of` Loop

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

### 2.2.7 Loop Control Best Practices

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
## 2.3 Jump Statements

### 2.3.1 `break` Statement

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

### 2.3.2 `continue` Statement

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

### 2.3.3 `return` Statement

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

### 2.3.4 Labels

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

------
## 2.4 Exception Handling

### 2.4.1 `try...catch...finally`

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

### 2.4.2 `throw` Statement

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

### 2.4.3 Built-In Error Types

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

### 2.4.4 Custom Errors

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

### 2.4.5 Error Stack Traces

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

### 2.4.6 Error Handling Patterns

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

### 2.4.7 Best Practices

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

## Common Pitfalls

### Pitfall 1: for-in on Arrays

```javascript
// ❌ WRONG: for-in iterates over ALL enumerable properties
const arr = [1, 2, 3];
arr.customProp = 'oops';

for (const i in arr) {
  console.log(i);  // "0", "1", "2", "customProp" — includes custom property!
}

// ✅ CORRECT: Use for-of for arrays
for (const value of arr) {
  console.log(value);  // 1, 2, 3
}
```

### Pitfall 2: Switch Fallthrough

```javascript
// ❌ WRONG: Missing break causes fallthrough
switch (day) {
  case 'Monday':
    console.log('Start of week');
  case 'Tuesday':  // Falls through! Both log on Monday
    console.log('Still early');
    break;
}

// ✅ CORRECT: Always break (or use return/throw)
switch (day) {
  case 'Monday':
    console.log('Start of week');
    break;
  case 'Tuesday':
    console.log('Still early');
    break;
}
```

### Pitfall 3: Loop Variable Closure with var

```javascript
// ❌ WRONG: var is function-scoped, shared across iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // Logs 3, 3, 3
}

// ✅ CORRECT: let creates new binding per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // Logs 0, 1, 2
}
```

### Pitfall 4: Catching Too Broadly

```javascript
// ❌ WRONG: Catches ALL errors, hides bugs
try {
  const result = someFunction();
  processs(result);  // Typo: 'processs' doesn't exist!
} catch (e) {
  console.log('someFunction failed');  // Wrong! It was processs that failed
}

// ✅ CORRECT: Check error type
try {
  const result = someFunction();
  process(result);
} catch (e) {
  if (e instanceof NetworkError) {
    console.log('Network failed, retrying...');
  } else {
    throw e;  // Re-throw unexpected errors
  }
}
```

### Pitfall 5: finally with return

```javascript
// ⚠️ GOTCHA: finally return overrides try/catch return!
function strange() {
  try {
    return 'try';
  } finally {
    return 'finally';  // This wins!
  }
}

console.log(strange());  // 'finally' — NOT 'try'!

// ✅ CORRECT: Don't return in finally
function correct() {
  try {
    return 'try';
  } finally {
    cleanup();  // OK: side effects, no return
  }
}
```

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

## 2.5 Control Flow Summary

| Construct | Purpose | Key Points |
|-----------|---------|------------|
| `if...else` | Conditional branching | Uses truthiness; 8 falsy values |
| `switch` | Multi-way branching | Strict equality (`===`); requires `break` |
| `for` | Counted iteration | `let` creates per-iteration binding |
| `while` | Condition-based iteration | Test before body |
| `do...while` | Guaranteed-once iteration | Test after body |
| `for...in` | Property iteration | Strings; includes inherited; avoid on arrays |
| `for...of` | Value iteration | Works on iterables; use for arrays |
| `for await...of` | Async iteration | Awaits each value |
| `break` | Exit loop/switch | Can target labels |
| `continue` | Skip iteration | Can target labels |
| `return` | Exit function | Returns value or `undefined` |
| `throw` | Raise exception | Can throw any value |
| `try...catch` | Handle exceptions | `catch` receives error |
| `finally` | Cleanup | Always executes |

### Best Practices

1. **Use `for...of` for arrays**, not `for...in`
2. **Always `break` in switch** unless fall-through is intentional
3. **Guard clauses** reduce nesting in conditionals
4. **Labels sparingly** — prefer extracting to functions
5. **Custom errors** extend `Error` for typed exception handling
6. **`finally` for cleanup** — runs even if `return`/`throw` in try/catch

---

**End of Chapter 2: Control Flow**

With conditionals, loops, and exception handling mastered, you're ready for functions and closures.
