# 1.5 Operators

## Introduction

Operators are the building blocks of JavaScript expressions. They perform operations on values (operands) and return results. JavaScript has a rich set of operators: arithmetic, assignment, comparison, logical, bitwise, and several special-purpose operators.

Understanding operator precedence, associativity, and side effects is critical. This chapter dissects every operator in JavaScript, from basic arithmetic to advanced features like optional chaining and nullish coalescing.

We'll examine how operators handle different types, their coercion behavior, and the subtle bugs that arise from misunderstanding precedence and evaluation order.

---

## 1.5.1 Arithmetic Operators

### Basic Arithmetic

**Addition (`+`):**

```javascript
5 + 3;        // 8
1.5 + 2.5;    // 4
-5 + 10;      // 5

// String concatenation (if either operand is string)
"hello" + " world";  // "hello world"
"5" + 3;             // "53" (number coerced to string)
5 + "3";             // "53"
```

**Subtraction (`-`):**

```javascript
10 - 5;       // 5
5 - 10;       // -5
1.5 - 0.5;    // 1

// Always converts to number
"10" - 5;     // 5
"10" - "5";   // 5
10 - "abc";   // NaN
```

**Multiplication (`*`):**

```javascript
5 * 3;        // 15
2.5 * 4;      // 10
-5 * 2;       // -10

// Numeric coercion
"5" * "3";    // 15
"5" * 2;      // 10
5 * "abc";    // NaN
```

**Division (`/`):**

```javascript
10 / 2;       // 5
10 / 3;       // 3.3333333333333335
10 / 0;       // Infinity
-10 / 0;      // -Infinity
0 / 0;        // NaN

// Numeric coercion
"10" / "2";   // 5
"10" / 2;     // 5
```

**Remainder/Modulo (`%`):**

```javascript
10 % 3;       // 1
10 % 5;       // 0
10 % 4;       // 2
-10 % 3;      // -1 (sign follows dividend)
10 % -3;      // 1

// Numeric coercion
"10" % 3;     // 1
10 % "3";     // 1

// Floating-point remainder
5.5 % 2;      // 1.5
```

**Exponentiation (`**`):**

```javascript
2 ** 3;       // 8 (2^3)
2 ** 10;      // 1024
3 ** 2;       // 9
5 ** 0;       // 1
2 ** -1;      // 0.5

// Numeric coercion
"2" ** "3";   // 8

// Right-associative
2 ** 3 ** 2;  // 512 (2^(3^2) = 2^9)
```

**Precedence:**

```javascript
2 + 3 * 4;           // 14 (multiplication first)
(2 + 3) * 4;         // 20 (parentheses override)
2 ** 3 * 4;          // 32 (exponentiation first)
2 + 3 ** 2;          // 11 (exponentiation first)
```

---

### Unary Arithmetic Operators

**Unary Plus (`+`):**

Converts operand to number:

```javascript
+5;           // 5
+"5";         // 5 (string to number)
+true;        // 1
+false;       // 0
+null;        // 0
+undefined;   // NaN
+"";          // 0
+"abc";       // NaN
+[];          // 0
+[5];         // 5
+{};          // NaN
```

**Unary Minus (`-`):**

Negates and converts to number:

```javascript
-5;           // -5
-"5";         // -5
-true;        // -1
-false;       // -0
-null;        // -0
```

**Increment (`++`):**

Pre-increment and post-increment:

```javascript
let x = 5;

// Post-increment (returns old value, then increments)
let y = x++;
console.log(y);  // 5
console.log(x);  // 6

// Pre-increment (increments, then returns new value)
let z = ++x;
console.log(z);  // 7
console.log(x);  // 7
```

**Decrement (`--`):**

Pre-decrement and post-decrement:

```javascript
let x = 5;

// Post-decrement
let y = x--;
console.log(y);  // 5
console.log(x);  // 4

// Pre-decrement
let z = --x;
console.log(z);  // 3
console.log(x);  // 3
```

**Increment/Decrement behavior:**

```javascript
let x = "5";
x++;           // x is now 6 (string converted to number)

let y = "abc";
y++;           // y is now NaN

let z;
z++;           // z is now NaN (undefined → NaN)

let obj = { valueOf: () => 10 };
obj++;         // 10 → 11 (calls valueOf)
```

**Cannot increment/decrement literals or expressions:**

```javascript
5++;           // SyntaxError
(x + y)++;     // SyntaxError

// Must assign to variable first
let result = x + y;
result++;
```

---

### Special Arithmetic Cases

**`+` operator ambiguity:**

```javascript
// Addition or concatenation?
1 + 2 + "3";      // "33" (left-to-right: 3 + "3")
"1" + 2 + 3;      // "123" (left-to-right: "1" + 2, then + 3)
1 + 2 + 3;        // 6

// Force numeric addition
1 + 2 + +"3";     // 6 (unary + converts "3" to number)
```

**Division by zero:**

```javascript
1 / 0;            // Infinity
-1 / 0;           // -Infinity
0 / 0;            // NaN
Infinity / Infinity;  // NaN
```

**Infinity arithmetic:**

```javascript
Infinity + Infinity;  // Infinity
Infinity - Infinity;  // NaN
Infinity * Infinity;  // Infinity
Infinity / Infinity;  // NaN
Infinity * 0;         // NaN
Infinity / 0;         // Infinity
```

**NaN propagation:**

```javascript
NaN + 5;          // NaN
NaN - 5;          // NaN
NaN * 5;          // NaN
NaN / 5;          // NaN
NaN % 5;          // NaN
NaN ** 5;         // NaN
```

---

## 1.5.2 Assignment Operators

### Simple Assignment (`=`)

Assigns value to variable:

```javascript
let x = 5;
let y = x;
let z = x = 10;  // Right-associative: x = 10, then z = x

console.log(x);  // 10
console.log(y);  // 5
console.log(z);  // 10
```

**Assignment is an expression (returns assigned value):**

```javascript
let a, b, c;
a = b = c = 10;  // All get 10

if (x = 5) {     // Assignment, not comparison!
  console.log(x);  // 5
}

// Common bug
if (x = y) {     // Should be x === y
  // Always truthy if y is truthy
}
```

---

### Compound Assignment Operators

**Arithmetic assignment:**

```javascript
let x = 10;

x += 5;   // x = x + 5;      → 15
x -= 3;   // x = x - 3;      → 12
x *= 2;   // x = x * 2;      → 24
x /= 4;   // x = x / 4;      → 6
x %= 4;   // x = x % 4;      → 2
x **= 3;  // x = x ** 3;     → 8
```

**With type coercion:**

```javascript
let x = "5";
x += 3;   // "53" (string concatenation)

let y = "10";
y -= 5;   // 5 (numeric subtraction)

let z = "10";
z *= 2;   // 20 (numeric multiplication)
```

**Compound assignment is not exactly equivalent:**

```javascript
// These are NOT identical:
a += b;
a = a + b;

// Why? Evaluation order and side effects
let obj = { x: 10 };
function getObj() {
  console.log("called");
  return obj;
}

// Evaluates getObj() once
getObj().x += 5;  // Logs "called" once

// Evaluates getObj() twice
getObj().x = getObj().x + 5;  // Logs "called" twice
```

---

### Logical Assignment Operators (ES2021)

**Logical AND assignment (`&&=`):**

Assigns only if left side is truthy:

```javascript
let x = 5;
x &&= 10;      // x is truthy, so x = 10

let y = 0;
y &&= 10;      // y is falsy, so no assignment (y remains 0)

// Equivalent to:
x = x && 10;

// Use case: Set default only if exists
let user = { name: "Alice" };
user.name &&= user.name.toUpperCase();  // "ALICE"

let guest = {};
guest.name &&= guest.name.toUpperCase();  // undefined (no error)
```

**Logical OR assignment (`||=`):**

Assigns only if left side is falsy:

```javascript
let x = 5;
x ||= 10;      // x is truthy, so no assignment (x remains 5)

let y = 0;
y ||= 10;      // y is falsy, so y = 10

// Equivalent to:
x = x || 10;

// Use case: Default values
let config = {};
config.timeout ||= 5000;  // Sets timeout to 5000 if not set
```

**Nullish coalescing assignment (`??=`):**

Assigns only if left side is `null` or `undefined`:

```javascript
let x = 5;
x ??= 10;      // x is not nullish, so no assignment (x remains 5)

let y = 0;
y ??= 10;      // y is not nullish (just falsy), so no assignment (y remains 0)

let z = null;
z ??= 10;      // z is nullish, so z = 10

let w;
w ??= 10;      // w is undefined (nullish), so w = 10

// Equivalent to:
x = x ?? 10;

// Use case: Distinguish null/undefined from other falsy values
let count = 0;
count ??= 10;  // count remains 0 (not null/undefined)
```

**Difference between `||=` and `??=`:**

```javascript
let x = 0;
x ||= 10;      // 10 (0 is falsy)
x ??= 10;      // 0 (0 is not nullish)

let y = "";
y ||= "default";   // "default" ("" is falsy)
y ??= "default";   // "" ("" is not nullish)

let z = null;
z ||= "default";   // "default" (null is falsy)
z ??= "default";   // "default" (null is nullish)
```

---

### Short-Circuit Evaluation

Logical assignment operators **short-circuit**:

```javascript
// &&= doesn't evaluate right side if left is falsy
let x = 0;
x &&= expensiveOperation();  // expensiveOperation() NOT called

// ||= doesn't evaluate right side if left is truthy
let y = 5;
y ||= expensiveOperation();  // expensiveOperation() NOT called

// ??= doesn't evaluate right side if left is not nullish
let z = 0;
z ??= expensiveOperation();  // expensiveOperation() NOT called
```

---

## 1.5.3 Comparison Operators

### Equality Operators

**Strict equality (`===`):**

```javascript
5 === 5;           // true
5 === "5";         // false (different types)
true === 1;        // false
null === undefined;// false
NaN === NaN;       // false
0 === -0;          // true

{} === {};         // false (different objects)
[] === [];         // false
```

**Strict inequality (`!==`):**

```javascript
5 !== 3;           // true
5 !== "5";         // true (different types)
null !== undefined;// true
NaN !== NaN;       // true (NaN is never equal to itself)
```

**Loose equality (`==`):**

```javascript
5 == 5;            // true
5 == "5";          // true (coerces "5" to number)
true == 1;         // true (true → 1)
false == 0;        // true (false → 0)
null == undefined; // true (special case)
"" == 0;           // true ("" → 0)

{} == {};          // false (different objects)
```

**Loose inequality (`!=`):**

```javascript
5 != 3;            // true
5 != "5";          // false (coerces "5" to number)
null != undefined; // false (special case)
```

See Chapter 1.4 for detailed equality behavior.

---

### Relational Operators

**Less than (`<`):**

```javascript
5 < 10;            // true
10 < 5;            // false
5 < 5;             // false

// String comparison (lexicographic)
"a" < "b";         // true
"apple" < "banana";// true
"10" < "9";        // true (string comparison, not numeric!)

// Numeric coercion
"10" < 9;          // false (both converted to numbers)
"10" < "9";        // true (string comparison)
```

**Greater than (`>`):**

```javascript
10 > 5;            // true
5 > 10;            // false
5 > 5;             // false

// String comparison
"b" > "a";         // true
"banana" > "apple";// true
```

**Less than or equal (`<=`):**

```javascript
5 <= 10;           // true
5 <= 5;            // true
10 <= 5;           // false

// NOT equivalent to !(a > b)
NaN <= NaN;        // false
NaN > NaN;         // false
!(NaN > NaN);      // true
```

**Greater than or equal (`>=`):**

```javascript
10 >= 5;           // true
5 >= 5;            // true
5 >= 10;           // false
```

---

### Comparison Type Coercion

**Both operands strings:** Lexicographic comparison:

```javascript
"apple" < "banana";  // true
"10" < "9";          // true (lexicographic, not numeric!)
"2" > "10";          // true (lexicographic)
```

**One or both numbers:** Convert to number:

```javascript
10 < "20";         // true (20 converted to number)
"10" < 20;         // true (10 converted to number)
10 < 20;           // true
```

**Special values:**

```javascript
// NaN comparisons always false
NaN < 5;           // false
NaN > 5;           // false
NaN <= 5;          // false
NaN >= 5;          // false
NaN == NaN;        // false

// null and undefined
null < 1;          // true (null → 0)
undefined < 1;     // false (undefined → NaN)
null == undefined; // true (special case)
null === undefined;// false
```

**Object comparison:**

```javascript
// Objects compared by reference
let obj1 = { x: 5 };
let obj2 = { x: 5 };
let obj3 = obj1;

obj1 < obj2;       // false (convert to primitive first)
obj1 == obj2;      // false (different objects)
obj1 == obj3;      // true (same reference)
```

---

## 1.5.4 Logical Operators

### Logical AND (`&&`)

Returns first falsy value or last value:

```javascript
true && true;         // true
true && false;        // false
false && true;        // false
5 && 3;               // 3 (both truthy, returns last)
0 && 5;               // 0 (first falsy)
5 && 0;               // 0 (second falsy)
null && "hello";      // null (first falsy)
"hello" && "world";   // "world" (both truthy)
```

**Short-circuit evaluation:**

```javascript
false && expensiveOperation();  // expensiveOperation() NOT called

let x = 0;
x && console.log("Not logged");  // Doesn't log

let y = 5;
y && console.log("Logged");      // Logs "Logged"
```

**Common patterns:**

```javascript
// Conditional execution
isValid && processData();

// Safe property access (pre-optional chaining)
user && user.name && user.name.toUpperCase();

// Guard clauses
function divide(a, b) {
  b !== 0 && console.log(a / b);
}
```

---

### Logical OR (`||`)

Returns first truthy value or last value:

```javascript
true || false;        // true
false || true;        // true
5 || 3;               // 5 (first truthy)
0 || 5;               // 5 (second truthy)
0 || null;            // null (both falsy, returns last)
null || undefined;    // undefined (both falsy, returns last)
"hello" || "world";   // "hello" (first truthy)
```

**Short-circuit evaluation:**

```javascript
true || expensiveOperation();  // expensiveOperation() NOT called

let x = 5;
x || console.log("Not logged");  // Doesn't log

let y = 0;
y || console.log("Logged");      // Logs "Logged"
```

**Default values:**

```javascript
let name = userName || "Anonymous";

function greet(greeting) {
  greeting = greeting || "Hello";
  console.log(greeting);
}

// But beware of falsy valid values
let count = userCount || 0;  // Wrong! If userCount is 0, uses 0 default
let count = userCount ?? 0;  // Correct: use nullish coalescing
```

---

### Logical NOT (`!`)

Converts to boolean and negates:

```javascript
!true;            // false
!false;           // true
!0;               // true (0 is falsy)
!1;               // false (1 is truthy)
!"";              // true ("" is falsy)
!"hello";         // false ("hello" is truthy)
!null;            // true
!undefined;       // true
!NaN;             // true
![];              // false (arrays are truthy)
!{};              // false (objects are truthy)
```

**Double negation (convert to boolean):**

```javascript
!!0;              // false
!!1;              // true
!!"";             // false
!!"hello";        // true
!![];             // true
!!{};             // true

// Equivalent to Boolean()
!!value === Boolean(value);
```

---

### Logical Operator Precedence

```javascript
// NOT (!) has highest precedence
!true || false;        // false ((!true) || false)

// AND (&&) has higher precedence than OR (||)
true || false && false;  // true (true || (false && false))
(true || false) && false;// false (override with parentheses)

// Comparison
a < b && b < c;        // Explicit
a < b < c;             // Wrong! (a < b) < c (chaining doesn't work)
```

---

## 1.5.5 Nullish Coalescing Operator (`??`)

Returns right operand when left is `null` or `undefined`:

```javascript
null ?? "default";      // "default"
undefined ?? "default"; // "default"
0 ?? "default";         // 0 (not nullish)
"" ?? "default";        // "" (not nullish)
false ?? "default";     // false (not nullish)
NaN ?? "default";       // NaN (not nullish)

let x;
x ?? 10;                // 10 (undefined is nullish)
```

**Difference from `||`:**

```javascript
// || returns right operand if left is falsy
0 || 10;         // 10
"" || "default"; // "default"
false || true;   // true

// ?? returns right operand only if left is nullish
0 ?? 10;         // 0 (not nullish)
"" ?? "default"; // "" (not nullish)
false ?? true;   // false (not nullish)

null ?? 10;      // 10 (nullish)
undefined ?? 10; // 10 (nullish)
```

**Use cases:**

```javascript
// Config with 0 or "" as valid values
let timeout = config.timeout ?? 5000;  // 0 is valid
let message = config.message ?? "Hello";  // "" is valid

// vs
let timeout = config.timeout || 5000;  // 0 would use default!
```

**Cannot chain with `&&` or `||` without parentheses:**

```javascript
null ?? "default" || "fallback";  // SyntaxError
(null ?? "default") || "fallback";  // OK
null ?? ("default" || "fallback");  // OK
```

---

## 1.5.6 Conditional (Ternary) Operator (`? :`)

Only ternary operator in JavaScript (three operands):

```javascript
condition ? valueIfTrue : valueIfFalse;

// Examples
let age = 20;
let status = age >= 18 ? "adult" : "minor";  // "adult"

let x = 5;
let result = x > 0 ? "positive" : "negative or zero";

// Can be nested (but avoid deep nesting)
let score = 85;
let grade = score >= 90 ? "A" :
            score >= 80 ? "B" :
            score >= 70 ? "C" :
            score >= 60 ? "D" : "F";

// Alternative: use if-else for readability
```

**Short-circuit evaluation:**

```javascript
true ? expensiveOperation() : cheapOperation();
// Only expensiveOperation() called

false ? expensiveOperation() : cheapOperation();
// Only cheapOperation() called
```

**Operator precedence:**

```javascript
// Assignment has lower precedence than ternary
let result = x > 0 ? 1 : 0;  // OK

// But watch out for complex expressions
let result = x > 0 ? y = 1 : y = 0;  // Assignment in ternary
let result = (x > 0 ? y : z) = 1;    // SyntaxError
```

**Common patterns:**

```javascript
// Inline defaults
let name = user.name ? user.name : "Anonymous";
// Better: use ?? or ||
let name = user.name ?? "Anonymous";

// Conditional rendering (React)
{isLoggedIn ? <Dashboard /> : <Login />}

// Conditional method call
array.length > 0 ? array.sort() : null;
```

---

## 1.5.7 Optional Chaining Operator (`?.`)

Safely access nested properties (ES2020):

```javascript
// Old way
let name = user && user.profile && user.profile.name;

// Optional chaining
let name = user?.profile?.name;

// If any part is null/undefined, returns undefined
let name = null?.profile?.name;  // undefined
let name = undefined?.profile?.name;  // undefined
```

**Works with:**

**1. Property access:**

```javascript
obj?.prop;
obj?.[expr];
```

**2. Method calls:**

```javascript
obj?.method();

// Only calls method if obj is not nullish
user?.login();  // Doesn't call if user is null/undefined

// vs
user.login?.();  // Doesn't call if login is null/undefined
```

**3. Array/computed access:**

```javascript
arr?.[0];
obj?.[key];

let arr = null;
arr?.[0];  // undefined (not TypeError)

let obj = null;
obj?.[dynamicKey];  // undefined
```

**Short-circuiting:**

```javascript
// If left side is nullish, right side not evaluated
user?.profile?.logAccess();  // logAccess() not called if user or profile is nullish

// Example
let count = 0;
null?.[count++];  // count remains 0 (right side not evaluated)
```

**Cannot use with assignment:**

```javascript
obj?.prop = value;  // SyntaxError
```

**Combining with nullish coalescing:**

```javascript
let name = user?.profile?.name ?? "Anonymous";

// If any part is nullish, uses "Anonymous"
```

**Difference from `&&`:**

```javascript
// && checks truthiness
0 && console.log("Not logged");  // Doesn't log (0 is falsy)

// ?. checks nullishness
let obj = { value: 0 };
obj?.value && console.log("Not logged");  // Doesn't log (0 is falsy)
obj?.value ?? console.log("Logged");      // Doesn't log (0 is not nullish)
```

---

## 1.5.8 Bitwise Operators

Operate on 32-bit integers (convert operands to 32-bit signed integers):

### Bitwise AND (`&`)

```javascript
5 & 3;   // 1
// 5:  0101
// 3:  0011
// &:  0001 = 1

12 & 10; // 8
// 12: 1100
// 10: 1010
// &:  1000 = 8
```

**Use case: Check if even/odd:**

```javascript
num & 1;  // 1 if odd, 0 if even

5 & 1;    // 1 (odd)
6 & 1;    // 0 (even)
```

### Bitwise OR (`|`)

```javascript
5 | 3;   // 7
// 5:  0101
// 3:  0011
// |:  0111 = 7

12 | 10; // 14
// 12: 1100
// 10: 1010
// |:  1110 = 14
```

**Use case: Truncate to integer:**

```javascript
3.14 | 0;  // 3 (truncates decimal)
-3.14 | 0; // -3
```

### Bitwise XOR (`^`)

```javascript
5 ^ 3;   // 6
// 5:  0101
// 3:  0011
// ^:  0110 = 6

12 ^ 10; // 6
// 12: 1100
// 10: 1010
// ^:  0110 = 6
```

**Use case: Toggle bits:**

```javascript
let flags = 0b1010;
flags ^= 0b0100;  // Toggle bit at position 2
```

**Use case: Swap without temp variable:**

```javascript
let a = 5, b = 3;
a ^= b;
b ^= a;
a ^= b;
console.log(a, b);  // 3, 5
```

### Bitwise NOT (`~`)

```javascript
~5;      // -6
// 5:   00000000000000000000000000000101
// ~5:  11111111111111111111111111111010 = -6 (two's complement)

~-1;     // 0
~0;      // -1
```

**Formula:** `~n === -(n + 1)`

**Use case: indexOf check (old pattern):**

```javascript
// Old way to check if found
if (~str.indexOf("hello")) {
  // Found (-1 → 0, anything else → non-zero)
}

// Modern way (use includes)
if (str.includes("hello")) { }
```

### Left Shift (`<<`)

```javascript
5 << 1;  // 10
// 5:  00000101
// <<1: 00001010 = 10

5 << 2;  // 20 (multiply by 2^2 = 4)
5 << 3;  // 40 (multiply by 2^3 = 8)
```

**Formula:** `n << m` === `n * 2^m`

### Sign-Propagating Right Shift (`>>`)

```javascript
20 >> 1;  // 10
// 20:  00010100
// >>1: 00001010 = 10

20 >> 2;  // 5 (divide by 2^2 = 4)

-20 >> 2; // -5 (sign bit preserved)
```

**Formula:** `n >> m` ≈ `Math.floor(n / 2^m)` (for positive)

### Zero-Fill Right Shift (`>>>`)

```javascript
20 >>> 1;  // 10
-20 >>> 1; // 2147483638 (no sign preservation)

// -20: 11111111111111111111111111101100
// >>>1: 01111111111111111111111111110110 = 2147483638
```

**Use case: Convert to unsigned 32-bit integer:**

```javascript
-1 >>> 0;  // 4294967295 (unsigned 32-bit max)
```

---

### Bitwise Assignment Operators

```javascript
let x = 5;
x &= 3;   // x = x & 3
x |= 3;   // x = x | 3
x ^= 3;   // x = x ^ 3
x <<= 2;  // x = x << 2
x >>= 2;  // x = x >> 2
x >>>= 2; // x = x >>> 2
```

---

### Bitwise Operators with Non-Integers

**Convert to 32-bit signed integer first:**

```javascript
3.14 & 5;     // 1 (3.14 → 3)
3.9 | 0;      // 3 (truncate to integer)
"5" & 3;      // 1 ("5" → 5)
true & 1;     // 1 (true → 1)
```

---

## 1.5.9 Other Operators

### Comma Operator (`,`)

Evaluates each operand left-to-right, returns last:

```javascript
let x = (1, 2, 3);  // x = 3

let a = 1, b = 2, c = 3;  // Variable declarations (not comma operator)

// In expressions
let result = (a++, b++, c++);  // Evaluates all, returns c++
```

**Use case: For loop:**

```javascript
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
```

**Use case: Compact expressions:**

```javascript
// Return from function and log
return (console.log("Returning"), value);

// Multiple statements in arrow function
const fn = () => (sideEffect(), returnValue);
```

---

### `typeof` Operator

See Chapter 1.4 for details:

```javascript
typeof 42;           // "number"
typeof "hello";      // "string"
typeof true;         // "boolean"
typeof undefined;    // "undefined"
typeof null;         // "object" (bug)
typeof {};           // "object"
typeof [];           // "object"
typeof function(){}; // "function"
typeof Symbol();     // "symbol"
typeof 123n;         // "bigint"
```

---

### `instanceof` Operator

See Chapter 1.4 for details:

```javascript
[] instanceof Array;        // true
{} instanceof Object;       // true
new Date() instanceof Date; // true
"hello" instanceof String;  // false (primitive)
```

---

### `in` Operator

Check if property exists in object (including prototype chain):

```javascript
let obj = { x: 1, y: 2 };

"x" in obj;          // true
"z" in obj;          // false
"toString" in obj;   // true (inherited from Object.prototype)

// Arrays
let arr = [1, 2, 3];
0 in arr;            // true
3 in arr;            // false
"length" in arr;     // true

// Check for own property
obj.hasOwnProperty("x");  // true
obj.hasOwnProperty("toString");  // false (inherited)
```

**With optional chaining:**

```javascript
"prop" in obj?.nested;  // Safe check
```

---

### `delete` Operator

Delete property from object:

```javascript
let obj = { x: 1, y: 2 };

delete obj.x;     // true (deleted)
console.log(obj); // { y: 2 }

delete obj.z;     // true (property doesn't exist, still returns true)
```

**Cannot delete:**

```javascript
let x = 5;
delete x;         // false (cannot delete variables)

delete Math.PI;   // false (cannot delete non-configurable properties)

function f() {}
delete f;         // false (cannot delete functions)
```

**Arrays:**

```javascript
let arr = [1, 2, 3];
delete arr[1];    // true
console.log(arr); // [1, empty, 3] (creates hole)
console.log(arr.length); // 3 (length unchanged)

// Better: use splice
arr.splice(1, 1); // [1, 3]
```

**Strict mode:**

```javascript
"use strict";
let x = 5;
delete x;  // SyntaxError
```

---

### `void` Operator

Evaluates expression and returns `undefined`:

```javascript
void 0;           // undefined
void (1 + 2);     // undefined
void anyExpression;  // undefined
```

**Use case: Ensure undefined:**

```javascript
// Safe undefined (can't be shadowed)
let x = void 0;

// vs
let x = undefined;  // Can be shadowed in local scope
```

**Use case: IIFE:**

```javascript
void function() {
  console.log("IIFE");
}();
```

**Use case: Prevent default in href:**

```html
<a href="javascript:void(0)">Click</a>
```

---

### Spread Operator (`...`)

**Arrays:**

```javascript
let arr = [1, 2, 3];
let arr2 = [...arr];       // Copy array
let arr3 = [...arr, 4, 5]; // [1, 2, 3, 4, 5]

// Merge arrays
let merged = [...arr1, ...arr2];

// Function arguments
Math.max(...arr);  // Math.max(1, 2, 3)
```

**Objects (ES2018):**

```javascript
let obj = { x: 1, y: 2 };
let obj2 = { ...obj };         // Copy object
let obj3 = { ...obj, z: 3 };   // { x: 1, y: 2, z: 3 }

// Merge objects
let merged = { ...obj1, ...obj2 };

// Override properties
let updated = { ...obj, x: 10 }; // { x: 10, y: 2 }
```

**Strings:**

```javascript
let str = "hello";
let chars = [...str];  // ["h", "e", "l", "l", "o"]
```

**Sets and Maps:**

```javascript
let set = new Set([1, 2, 3]);
let arr = [...set];  // [1, 2, 3]

let map = new Map([["a", 1], ["b", 2]]);
let arr = [...map];  // [["a", 1], ["b", 2]]
```

---

### Destructuring

**Arrays:**

```javascript
let [a, b, c] = [1, 2, 3];
console.log(a, b, c);  // 1 2 3

// Skip elements
let [x, , z] = [1, 2, 3];  // x=1, z=3

// Rest
let [first, ...rest] = [1, 2, 3, 4];  // first=1, rest=[2,3,4]

// Default values
let [a = 0, b = 0] = [1];  // a=1, b=0

// Swap
let x = 1, y = 2;
[x, y] = [y, x];  // x=2, y=1
```

**Objects:**

```javascript
let { x, y } = { x: 1, y: 2 };
console.log(x, y);  // 1 2

// Rename
let { x: a, y: b } = { x: 1, y: 2 };  // a=1, b=2

// Default values
let { x = 0, y = 0 } = { x: 1 };  // x=1, y=0

// Nested
let { profile: { name } } = { profile: { name: "Alice" } };

// Rest
let { x, ...rest } = { x: 1, y: 2, z: 3 };  // x=1, rest={y:2, z:3}
```

**Function parameters:**

```javascript
function greet({ name, age }) {
  console.log(`${name} is ${age}`);
}

greet({ name: "Alice", age: 30 });  // "Alice is 30"

// With defaults
function greet({ name = "Guest", age = 0 } = {}) {
  console.log(`${name} is ${age}`);
}
```

---

## 1.5.10 Operator Precedence

Precedence determines evaluation order (higher = evaluated first):

|Precedence|Operator|Description|
|---|---|---|
|21|`()`, `[]`, `.`|Grouping, member access|
|20|`new` (with args)|Constructor|
|19|`()`|Function call|
|19|`new` (no args)|Constructor|
|18|`?.`|Optional chaining|
|17|`++`, `--` (postfix)|Increment/decrement|
|16|`!`, `~`, `+`, `-`, `typeof`, `void`, `delete`, `++`, `--` (prefix)|Unary|
|15|`**`|Exponentiation|
|14|`*`, `/`, `%`|Multiplication/division|
|13|`+`, `-`|Addition/subtraction|
|12|`<<`, `>>`, `>>>`|Bitwise shift|
|11|`<`, `<=`, `>`, `>=`, `in`, `instanceof`|Relational|
|10|`==`, `!=`, `===`, `!==`|Equality|
|9|`&`|Bitwise AND|
|8|`^`|Bitwise XOR|
|7|`\|`|Bitwise OR|
|6|`&&`|Logical AND|
|5|`\|`|Logical OR|
|4|`??`|Nullish coalescing|
|3|`? :`|Conditional (ternary)|
|2|`=`, `+=`, `-=`, etc.|Assignment|
|1|`,`|Comma|

**Examples:**

```javascript
// Precedence
2 + 3 * 4;         // 14 (3 * 4 first)
2 ** 3 ** 2;       // 512 (right-associative: 2 ** (3 ** 2))
a && b || c;       // (a && b) || c
a || b && c;       // a || (b && c)

// Parentheses override
(2 + 3) * 4;       // 20
```

---

### Associativity

**Left-to-right:**

```javascript
a - b - c;         // (a - b) - c
a / b / c;         // (a / b) / c
```

**Right-to-left:**

```javascript
a = b = c;         // a = (b = c)
a ** b ** c;       // a ** (b ** c)
```

---

## 1.5.11 Summary

### Operator Categories

**Arithmetic:**

- `+`, `-`, `*`, `/`, `%`, `**`
- Unary: `+`, `-`, `++`, `--`
- Numeric coercion (except `+` with strings)

**Assignment:**

- `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `**=`
- Logical: `&&=`, `||=`, `??=` (ES2021)

**Comparison:**

- Equality: `==`, `===`, `!=`, `!==`
- Relational: `<`, `>`, `<=`, `>=`

**Logical:**

- `&&`, `||`, `!`
- Short-circuit evaluation
- Return operands (not just true/false)

**Bitwise:**

- `&`, `|`, `^`, `~`
- `<<`, `>>`, `>>>`
- Operate on 32-bit integers

**Special:**

- Ternary: `? :`
- Optional chaining: `?.`
- Nullish coalescing: `??`
- `typeof`, `instanceof`, `in`, `delete`, `void`
- Comma: `,`
- Spread: `...`
- Destructuring

---

### Key Takeaways

1. **`+` is overloaded**: Addition for numbers, concatenation for strings
2. **Other arithmetic operators coerce to number**
3. **`&&` and `||` return operands**, not booleans
4. **`??` vs `||`**: Nullish vs falsy
5. **`?.` safely accesses nested properties**
6. **Logical assignment short-circuits**: `&&=`, `||=`, `??=`
7. **Bitwise operators work on 32-bit integers**
8. **Precedence matters**: Use parentheses for clarity
9. **Assignment is right-associative**
10. **Spread and destructuring enable concise code**

---

**End of Chapter 1.5: Operators**

You now understand:

- Every operator in JavaScript and how they work
- Type coercion behavior for each operator
- Short-circuit evaluation and when it applies
- The difference between `??`, `||`, and `?.`
- Bitwise operations on 32-bit integers
- Operator precedence and associativity
- Modern operators: optional chaining, nullish coalescing, logical assignment

Next: Expressions and Statements (how operators combine into executable code).