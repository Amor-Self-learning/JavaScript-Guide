# 2.1 Conditional Statements

### Introduction

Conditional statements control program execution based on boolean conditions. JavaScript provides `if...else`, the ternary operator, and `switch...case` for branching logic.

Understanding truthiness, short-circuit evaluation, and the nuances of each conditional construct is essential for writing clear, efficient code. This chapter explores conditional statements in depth, including common pitfalls and best practices.

---

## 2.1.1 `if` Statement

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

## 2.1.2 Ternary Operator

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

## 2.1.3 `switch` Statement

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

## 2.1.4 Common Patterns and Best Practices

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

## 2.1.5 Performance Considerations

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

## 2.1.6 Summary

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

**End of Chapter 2.1: Conditional Statements**

You now understand:

- How `if...else` works with truthiness
- When to use ternary vs `if...else`
- Switch statement mechanics and fall-through
- Common patterns: guard clauses, null checks, type checking
- Performance considerations and best practices
- How to write clear, maintainable conditional code

Next: Loops (for, while, for-in, for-of, for await...of).