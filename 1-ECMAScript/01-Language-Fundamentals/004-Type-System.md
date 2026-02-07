# 1.4 Type System

## Introduction

JavaScript's type system is **dynamic** (types determined at runtime) and **weakly typed** (aggressive implicit conversions). This flexibility is powerful but dangerous—type coercion causes more bugs than perhaps any other language feature.

Understanding how JavaScript checks types, converts between them, and evaluates equality is essential. This chapter dissects `typeof`, `instanceof`, implicit coercion, explicit conversion, truthy/falsy values, and the three equality operators (`==`, `===`, `Object.is()`).

No superficial explanations here. We'll examine the internal type conversion algorithms, edge cases that break expectations, and the precise rules that govern JavaScript's type behavior.

---

## 1.4.1 Type Checking with `typeof`

### Basic Behavior

`typeof` returns a **string** indicating the type of the operand:

```javascript
typeof undefined;        // "undefined"
typeof null;             // "object" (BUG!)
typeof true;             // "boolean"
typeof 42;               // "number"
typeof 42n;              // "bigint"
typeof "hello";          // "string"
typeof Symbol("id");     // "symbol"
typeof {};               // "object"
typeof [];               // "object"
typeof function(){};     // "function"
```

---

### Return Values

`typeof` returns exactly **8 possible strings**:

1. `"undefined"`
2. `"boolean"`
3. `"number"`
4. `"bigint"`
5. `"string"`
6. `"symbol"`
7. `"object"` (includes `null`, arrays, plain objects, dates, regex, etc.)
8. `"function"` (special case for callable objects)

---

### The `typeof null` Bug

This is JavaScript's most famous bug:

```javascript
typeof null;  // "object" (WRONG!)
```

**Why it exists:**

In the original JavaScript implementation (1995), values were stored with a type tag:

- `000`: object
- `001`: integer
- `010`: double
- `100`: string
- `110`: boolean

`null` was represented as the NULL pointer (all zeros: `0x00`), which matched the object tag `000`.

**Cannot be fixed:** Changing this would break millions of websites that depend on this behavior.

**Correct check for `null`:**

```javascript
// Wrong
if (typeof value === "object") {
  // Matches null too!
}

// Correct
if (value === null) {
  // ...
}

// Check for object (excluding null)
if (typeof value === "object" && value !== null) {
  // ...
}
```

---

### `typeof` with Undeclared Variables

`typeof` is "safe" for undeclared variables (doesn't throw ReferenceError):

```javascript
// Variable not declared
typeof undeclaredVariable;  // "undefined" (no error!)

// vs direct access
undeclaredVariable;  // ReferenceError: undeclaredVariable is not defined
```

**But beware of TDZ:**

```javascript
{
  typeof x;  // ReferenceError: Cannot access 'x' before initialization
  let x = 10;
}
```

Variables in the Temporal Dead Zone throw ReferenceError even with `typeof`.

---

### `typeof` with Arrays and Objects

**Cannot distinguish arrays from objects:**

```javascript
typeof [];   // "object"
typeof {};   // "object"

// Use Array.isArray
Array.isArray([]);   // true
Array.isArray({});   // false
```

**Cannot distinguish different object types:**

```javascript
typeof new Date();    // "object"
typeof /regex/;       // "object"
typeof new Map();     // "object"

// Use instanceof or constructor check
```

---

### `typeof` with Functions

Functions are detected separately:

```javascript
typeof function(){};           // "function"
typeof (() => {});             // "function"
typeof class {};               // "function" (classes are functions)
typeof async function(){};     // "function"
typeof function*(){};          // "function" (generators)

// Built-in constructors
typeof Array;                  // "function"
typeof Object;                 // "function"
```

**But not callable objects:**

```javascript
let callable = {
  call() { }
};
typeof callable;  // "object" (not "function")
```

---

### Practical Usage Patterns

**Type guards:**

```javascript
function processValue(value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}
```

**Safe property access:**

```javascript
// Check if method exists
if (typeof obj.method === "function") {
  obj.method();
}

// Check for feature support
if (typeof Promise !== "undefined") {
  // Use Promises
}
```

---

## 1.4.2 Type Checking with `instanceof`

### Basic Behavior

`instanceof` checks if an object's prototype chain contains a constructor's prototype:

```javascript
[] instanceof Array;           // true
[] instanceof Object;          // true
({}) instanceof Object;        // true
({}) instanceof Array;         // false

new Date() instanceof Date;    // true
/regex/ instanceof RegExp;     // true
```

**Syntax:**

```javascript
object instanceof Constructor
```

---

### How `instanceof` Works

`instanceof` walks the prototype chain:

```javascript
function isInstanceOf(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);
  
  while (proto !== null) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}
```

**Example:**

```javascript
let arr = [];

// Prototype chain:
// arr → Array.prototype → Object.prototype → null

arr instanceof Array;   // true (Array.prototype found)
arr instanceof Object;  // true (Object.prototype found)
arr instanceof String;  // false (String.prototype not in chain)
```

---

### Primitives and `instanceof`

**Primitives are not objects, so `instanceof` returns `false`:**

```javascript
"hello" instanceof String;   // false
42 instanceof Number;        // false
true instanceof Boolean;     // false

// But boxed primitives are objects
new String("hello") instanceof String;  // true
new Number(42) instanceof Number;       // true
new Boolean(true) instanceof Boolean;   // true
```

---

### Cross-Realm Issues

`instanceof` fails across different execution contexts (iframes, windows):

```javascript
// In iframe
let iframeArray = iframeWindow.Array;
let arr = new iframeArray(1, 2, 3);

// In parent window
arr instanceof Array;  // false (different Array constructor!)

// Solution: Use Array.isArray
Array.isArray(arr);  // true (works cross-realm)
```

---

### Custom `instanceof` Behavior

**Use `Symbol.hasInstance` to customize:**

```javascript
class MyClass {
  static [Symbol.hasInstance](instance) {
    return instance.customProp === true;
  }
}

let obj = { customProp: true };
console.log(obj instanceof MyClass);  // true (custom logic!)
```

---

### Checking Constructor

**Right-hand side must be a function with `prototype` property:**

```javascript
{} instanceof Object;     // true
{} instanceof Function;   // false

// Error cases
{} instanceof {};         // TypeError: Right-hand side is not callable
{} instanceof 42;         // TypeError: Right-hand side is not callable
```

---

### `instanceof` vs `typeof`

|Check|`typeof`|`instanceof`|
|---|---|---|
|Primitives|✓ (accurate)|✗ (always false)|
|Objects|"object"|✓ (specific type)|
|Functions|"function"|✓ (Function)|
|Arrays|"object"|✓ (Array)|
|`null`|"object" (bug)|✗ (error)|
|Cross-realm|✓ (works)|✗ (fails)|
|Undeclared variables|✓ (safe)|✗ (ReferenceError)|

---

## 1.4.3 Type Coercion (Implicit Conversion)

Type coercion is **automatic type conversion** performed by JavaScript.

---

### String Coercion

**Triggered by `+` operator with a string:**

```javascript
"hello" + 42;        // "hello42"
42 + "hello";        // "42hello"
"" + 42;             // "42"
42 + "";             // "42"

// Complex types convert to string
"value: " + {};      // "value: [object Object]"
"value: " + [];      // "value: "
"value: " + [1,2];   // "value: 1,2"
"value: " + function(){};  // "value: function(){}"
```

**`+` with only one string coerces all operands:**

```javascript
1 + 2 + "3";    // "33" (left-to-right: 3 + "3")
"1" + 2 + 3;    // "123" (left-to-right: "1" + 2, then + 3)
```

**Template literals coerce to string:**

```javascript
`Value: ${42}`;      // "Value: 42"
`Value: ${null}`;    // "Value: null"
`Value: ${{}}`;      // "Value: [object Object]"
```

---

### Numeric Coercion

**Triggered by arithmetic operators (except `+`):**

```javascript
"42" - 2;       // 40 (number)
"42" * 2;       // 84
"42" / 2;       // 21
"42" % 5;       // 2
"42" ** 2;      // 1764

// Unary plus
+"42";          // 42 (number)
+true;          // 1
+false;         // 0
+null;          // 0
+undefined;     // NaN
+"";            // 0
+"hello";       // NaN
```

**Subtraction always coerces:**

```javascript
"5" - "2";      // 3 (both converted to numbers)
"5" - true;     // 4 (true → 1)
"5" - null;     // 5 (null → 0)
"5" - undefined;// NaN (undefined → NaN)
```

**Array to number coercion:**

```javascript
+[];            // 0 ([] → "" → 0)
+[5];           // 5 ([5] → "5" → 5)
+[1,2];         // NaN ([1,2] → "1,2" → NaN)
```

**Object to number coercion:**

```javascript
+{};            // NaN ({} → "[object Object]" → NaN)

// Custom valueOf
let obj = {
  valueOf() { return 42; }
};
+obj;           // 42
```

---

### Boolean Coercion

**Triggered by logical contexts:**

```javascript
if (value) { }
while (value) { }
value ? a : b
!value
!!value
Boolean(value)
```

**Falsy values (8 total):**

```javascript
Boolean(false);      // false
Boolean(0);          // false
Boolean(-0);         // false
Boolean(0n);         // false (BigInt zero)
Boolean("");         // false
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
```

**Everything else is truthy:**

```javascript
Boolean(true);       // true
Boolean(1);          // true
Boolean(-1);         // true
Boolean("0");        // true (non-empty string)
Boolean("false");    // true
Boolean([]);         // true (empty array is an object)
Boolean({});         // true
Boolean(function(){}); // true
```

**Common gotchas:**

```javascript
if ([]) {
  // This runs! Arrays are truthy
}

if ([] == false) {
  // This also runs! Coerces differently in comparison
}

// Checking array emptiness
if (arr.length) {
  // This is the correct check
}
```

---

### Object to Primitive Coercion

Objects convert to primitives via these steps:

1. Call `obj[Symbol.toPrimitive](hint)` if exists
2. Otherwise, if hint is `"string"`:
    - Call `obj.toString()`, if result is primitive, use it
    - Else call `obj.valueOf()`, if result is primitive, use it
3. Otherwise (hint is `"number"` or `"default"`):
    - Call `obj.valueOf()`, if result is primitive, use it
    - Else call `obj.toString()`, if result is primitive, use it
4. Throw TypeError if no primitive obtained

**Example:**

```javascript
let obj = {
  valueOf() {
    console.log("valueOf called");
    return 42;
  },
  toString() {
    console.log("toString called");
    return "hello";
  }
};

// Numeric context (hint: "number")
+obj;           // Logs: "valueOf called", returns 42
obj - 1;        // Logs: "valueOf called", returns 41

// String context (hint: "string")
String(obj);    // Logs: "toString called", returns "hello"
`${obj}`;       // Logs: "toString called", returns "hello"

// Default context (usually numeric)
obj == 42;      // Logs: "valueOf called", returns true
```

**Custom `Symbol.toPrimitive`:**

```javascript
let obj = {
  [Symbol.toPrimitive](hint) {
    console.log(`hint: ${hint}`);
    if (hint === "number") return 42;
    if (hint === "string") return "hello";
    return true;  // default
  }
};

+obj;           // Logs: "hint: number", returns 42
String(obj);    // Logs: "hint: string", returns "hello"
obj == true;    // Logs: "hint: default", returns true
```

---

### Date to Primitive

**`Date` is special:** Default hint is `"string"` (not `"number"`):

```javascript
let date = new Date();

// String context
String(date);     // "Fri Feb 06 2026 ..."
`${date}`;        // "Fri Feb 06 2026 ..."

// Numeric context
+date;            // 1770318000000 (timestamp)
date.valueOf();   // 1770318000000

// Default context (uses string!)
date + "";        // "Fri Feb 06 2026 ..." (not timestamp!)
```

---

### Array to String Coercion

Arrays convert to comma-separated string:

```javascript
String([1, 2, 3]);     // "1,2,3"
[1, 2, 3] + "";        // "1,2,3"
[1, 2, 3].toString();  // "1,2,3"

String([]);            // ""
String([5]);           // "5"
String([undefined]);   // ""
String([null]);        // ""
String([[]]);          // ""
```

**This causes surprising behavior:**

```javascript
[] + [];        // "" (both become "")
[] + {};        // "[object Object]"
{} + [];        // 0 (parsed as empty block + [])
({} + []);      // "[object Object]"
```

---

## 1.4.4 Type Conversion (Explicit)

Explicit conversion uses constructors or functions to convert types.

---

### To String

```javascript
String(42);              // "42"
String(true);            // "true"
String(null);            // "null"
String(undefined);       // "undefined"
String({});              // "[object Object]"
String([1, 2]);          // "1,2"

// toString method
(42).toString();         // "42"
true.toString();         // "true"
({}).toString();         // "[object Object]"
[1, 2].toString();       // "1,2"

// Template literal
`${42}`;                 // "42"

// Concatenation
"" + 42;                 // "42"
```

---

### To Number

```javascript
Number("42");            // 42
Number("3.14");          // 3.14
Number("");              // 0 (empty string → 0)
Number("  ");            // 0 (whitespace → 0)
Number("hello");         // NaN
Number(true);            // 1
Number(false);           // 0
Number(null);            // 0
Number(undefined);       // NaN
Number([]);              // 0
Number([5]);             // 5
Number([1, 2]);          // NaN
Number({});              // NaN

// Unary plus
+"42";                   // 42

// parseInt/parseFloat
parseInt("42");          // 42
parseInt("42.5");        // 42 (truncates)
parseInt("42px");        // 42 (stops at non-digit)
parseFloat("3.14");      // 3.14
parseFloat("3.14.15");   // 3.14 (stops at second dot)

// Arithmetic
"42" - 0;                // 42
"42" * 1;                // 42
```

**`parseInt` with radix:**

```javascript
parseInt("10", 10);      // 10 (decimal)
parseInt("10", 2);       // 2 (binary)
parseInt("10", 16);      // 16 (hex)
parseInt("FF", 16);      // 255

// Always specify radix
parseInt("08");          // 8 (modern: decimal, old: octal)
parseInt("08", 10);      // 8 (explicit decimal)
```

---

### To Boolean

```javascript
Boolean(0);              // false
Boolean(1);              // true
Boolean("");             // false
Boolean("hello");        // true
Boolean(null);           // false
Boolean(undefined);      // false
Boolean({});             // true
Boolean([]);             // true

// Double negation
!!0;                     // false
!!1;                     // true
!!"";                    // false
!!"hello";               // true

// Conditional
if (value) { }           // Implicit conversion
```

---

### To Object (Boxing)

Primitives can be wrapped in objects:

```javascript
Object(42);              // Number {42}
Object("hello");         // String {"hello"}
Object(true);            // Boolean {true}

new Number(42);          // Number {42}
new String("hello");     // String {"hello"}
new Boolean(true);       // Boolean {true}

// Primitives auto-box when accessing properties
"hello".length;          // 5 (auto-boxed to String object)
(42).toFixed(2);         // "42.00" (auto-boxed to Number object)
```

**Avoid explicit boxing:**

```javascript
let num = new Number(42);
console.log(typeof num);     // "object"
console.log(num === 42);     // false (object !== primitive)
console.log(num == 42);      // true (coerces to primitive)

if (new Boolean(false)) {
  // This runs! Object wrapper is truthy
}
```

---

## 1.4.5 Truthiness and Falsiness

### Falsy Values

Exactly **8 falsy values** in JavaScript:

```javascript
false
0
-0
0n              // BigInt zero (ES2020)
""              // Empty string
null
undefined
NaN
```

**All tested:**

```javascript
console.log(!!false);      // false
console.log(!!0);          // false
console.log(!!-0);         // false
console.log(!!0n);         // false
console.log(!!"");         // false
console.log(!!null);       // false
console.log(!!undefined);  // false
console.log(!!NaN);        // false
```

---

### Truthy Values

**Everything else is truthy:**

```javascript
// Numbers
!!1;                 // true
!!-1;                // true
!!Infinity;          // true
!!42n;               // true (BigInt non-zero)

// Strings
!!"0";               // true (non-empty string)
!!"false";           // true
!!" ";               // true (whitespace is non-empty)

// Objects
!!{};                // true
!![];                // true
!!function(){};      // true
!!new Boolean(false);// true (object wrapper)
!!new Number(0);     // true
!!new String("");    // true
```

---

### Common Gotchas

**Empty array/object:**

```javascript
let arr = [];
let obj = {};

if (arr) {
  // This runs! Arrays are truthy
}

if (obj) {
  // This runs! Objects are truthy
}

// Correct checks
if (arr.length) { }
if (Object.keys(obj).length) { }
```

**String `"0"` and `"false"`:**

```javascript
if ("0") {
  // This runs! Non-empty strings are truthy
}

if ("false") {
  // This runs too!
}
```

**Document methods (DOM quirk):**

```javascript
// In some browsers
let all = document.all;
typeof all;          // "undefined" (lie!)
if (all) { }         // Doesn't run (all is falsy!)

// document.all is the only falsy object in existence
```

---

### Conditional Patterns

**Default values:**

```javascript
let name = userInput || "Anonymous";

// But beware of falsy legitimate values
let count = userCount || 0;  // Wrong! If userCount is 0, uses 0 default
let count = userCount ?? 0;  // Correct: nullish coalescing (ES2020)
```

**Short-circuit evaluation:**

```javascript
// AND (returns first falsy or last value)
true && "yes";       // "yes"
false && "yes";      // false
null && "yes";       // null
0 && "yes";          // 0
"" && "yes";         // ""
"a" && "b" && "c";   // "c"

// OR (returns first truthy or last value)
true || "no";        // true
false || "no";       // "no"
null || "no";        // "no"
0 || "no";           // "no"
"" || "no";          // "no"
"a" || "b" || "c";   // "a"
```

---

## 1.4.6 Equality Operators

JavaScript has **three equality operators:**

1. `==` (loose/abstract equality)
2. `===` (strict equality)
3. `Object.is()` (same-value equality)

---

### Strict Equality (`===`)

**No type coercion. Values must be same type AND same value:**

```javascript
// Same type, same value
42 === 42;           // true
"hello" === "hello"; // true
true === true;       // true

// Different types
42 === "42";         // false
true === 1;          // false
null === undefined;  // false

// Special cases
NaN === NaN;         // false (NaN is not equal to itself!)
0 === -0;            // true (signs ignored)

// Objects compared by reference
{} === {};           // false (different objects)
[] === [];           // false

let obj = {};
obj === obj;         // true (same reference)
```

**Rules:**

1. Different types → `false`
2. Same type, same value → `true`
3. `NaN` → always `false` (even `NaN === NaN`)
4. Objects → `true` only if same reference

---

### Loose Equality (`==`)

**Performs type coercion before comparison:**

```javascript
// Same type (acts like ===)
42 == 42;            // true
"hello" == "hello";  // true

// Type coercion
42 == "42";          // true ("42" → 42)
1 == true;           // true (true → 1)
0 == false;          // true (false → 0)
null == undefined;   // true (special case)

// Common surprises
"" == 0;             // true ("" → 0)
"0" == 0;            // true ("0" → 0)
false == "0";        // true (false → 0, "0" → 0)
[] == false;         // true ([] → "" → 0, false → 0)
[] == 0;             // true ([] → "" → 0)
[] == "";            // true ([] → "")
```

---

### Loose Equality Algorithm (Abstract Equality)

When comparing `x == y`:

1. **Same type:** Return `x === y`
    
2. **`null == undefined`:** Return `true`
    
3. **Number vs String:**
    
    - Convert string to number
    - Compare
4. **Boolean vs anything:**
    
    - Convert boolean to number (true → 1, false → 0)
    - Compare
5. **Object vs Primitive:**
    
    - Convert object to primitive (ToPrimitive)
    - Compare
6. **Otherwise:** Return `false`
    

---

### Dangerous `==` Examples

```javascript
// These all return true
"" == 0;             // "" → 0
"0" == 0;            // "0" → 0
false == "0";        // false → 0, "0" → 0
false == "";         // false → 0, "" → 0
false == [];         // false → 0, [] → "" → 0
[] == ![];           // [] → "", ![] → false → 0
[null] == "";        // [null] → "", "" → ""
[undefined] == "";   // [undefined] → "", "" → ""
[[]] == "";          // [[]] → "", "" → ""

// But
"0" == false;        // true
"0" == 0;            // true
0 == false;          // true
// Transitivity broken: "0" == false == 0, but "0" != 0 with some paths!
```

---

### `null` and `undefined` with `==`

**Special rule:** `null == undefined` (and vice versa):

```javascript
null == undefined;   // true
null === undefined;  // false

null == null;        // true
undefined == undefined;  // true

// But not with other falsy values
null == false;       // false
null == 0;           // false
null == "";          // false
undefined == false;  // false
undefined == 0;      // false
undefined == "";     // false
```

**Use case: Check for null or undefined:**

```javascript
if (value == null) {
  // Matches both null and undefined
}

// Equivalent to
if (value === null || value === undefined) {
  // More explicit
}
```

---

### Object Equality

**Both `==` and `===` compare references:**

```javascript
let obj1 = { a: 1 };
let obj2 = { a: 1 };
let obj3 = obj1;

obj1 == obj2;        // false (different objects)
obj1 === obj2;       // false
obj1 == obj3;        // true (same reference)
obj1 === obj3;       // true

[] == [];            // false
[1] == [1];          // false
```

**Comparing to primitive:**

```javascript
// Object coerces to primitive
let obj = { valueOf() { return 42; } };
obj == 42;           // true (obj → 42)
obj === 42;          // false (different types)

[1] == 1;            // true ([1] → "1" → 1)
[1,2] == "1,2";      // true ([1,2] → "1,2")
```

---

### `Object.is()`

**Same-value equality (ES6):**

```javascript
Object.is(42, 42);           // true
Object.is("hello", "hello"); // true

// Fixes NaN
Object.is(NaN, NaN);         // true (unlike ===)

// Distinguishes +0 and -0
Object.is(0, -0);            // false (unlike ===)
Object.is(0, 0);             // true
Object.is(-0, -0);           // true

// Otherwise same as ===
Object.is(null, undefined);  // false
Object.is(42, "42");         // false
```

**Comparison:**

|Expression|`==`|`===`|`Object.is()`|
|---|---|---|---|
|`42 == 42`|true|true|true|
|`42 == "42"`|true|false|false|
|`NaN == NaN`|false|false|**true**|
|`0 == -0`|true|true|**false**|
|`null == undefined`|true|false|false|

---

### Polyfill for `Object.is()`

```javascript
if (!Object.is) {
  Object.is = function(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Handle 0 === -0 case
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Handle NaN case
      return x !== x && y !== y;
    }
  };
}
```

---

### Equality Best Practices

**Prefer `===`:**

```javascript
// Always use === by default
if (value === 42) { }
if (typeof value === "string") { }
```

**Only use `==` for `null`/`undefined` check:**

```javascript
// Check for null or undefined
if (value == null) {
  // Only case where == is preferable
}

// Otherwise use ===
if (value === null || value === undefined) {
  // More explicit, but verbose
}
```

**Use `Object.is()` for NaN and -0:**

```javascript
// Checking for NaN
if (Object.is(value, NaN)) {
  // Or use Number.isNaN(value)
}

// Distinguishing +0 and -0
if (Object.is(value, -0)) {
  // Rare, but correct
}
```

**Never rely on `==` coercion:**

```javascript
// Bad
if (value == true) { }

// Good
if (value === true) { }
if (value) { }  // Truthy check
```

---

## 1.4.7 Type Conversion Cheatsheet

### To String

|Value|String()|toString()|+ ""|
|---|---|---|---|
|`undefined`|"undefined"|TypeError|"undefined"|
|`null`|"null"|TypeError|"null"|
|`true`|"true"|"true"|"true"|
|`false`|"false"|"false"|"false"|
|`42`|"42"|"42"|"42"|
|`NaN`|"NaN"|"NaN"|"NaN"|
|`Infinity`|"Infinity"|"Infinity"|"Infinity"|
|`""`|""|""|""|
|`[]`|""|""|""|
|`[1,2]`|"1,2"|"1,2"|"1,2"|
|`{}`|"[object Object]"|"[object Object]"|"[object Object]"|

---

### To Number

|Value|Number()|+value|parseInt()|
|---|---|---|---|
|`undefined`|NaN|NaN|NaN|
|`null`|0|0|NaN|
|`true`|1|1|NaN|
|`false`|0|0|NaN|
|`""`|0|0|NaN|
|`" "`|0|0|NaN|
|`"42"`|42|42|42|
|`"42px"`|NaN|NaN|42|
|`"hello"`|NaN|NaN|NaN|
|`[]`|0|0|NaN|
|`[5]`|5|5|5|
|`[1,2]`|NaN|NaN|1|
|`{}`|NaN|NaN|NaN|

---

### To Boolean

|Value|Boolean()|!!value|if (value)|
|---|---|---|---|
|`false`|false|false|false|
|`0`|false|false|false|
|`-0`|false|false|false|
|`0n`|false|false|false|
|`""`|false|false|false|
|`null`|false|false|false|
|`undefined`|false|false|false|
|`NaN`|false|false|false|
|`true`|true|true|true|
|`1`|true|true|true|
|`"0"`|true|true|true|
|`"false"`|true|true|true|
|`[]`|true|true|true|
|`{}`|true|true|true|
|`function(){}`|true|true|true|

---

## 1.4.8 Summary

### Type Checking

**`typeof`:**

- Returns string type name
- 8 possible values
- Safe for undeclared variables (except TDZ)
- Bug: `typeof null === "object"`
- Cannot distinguish arrays/objects

**`instanceof`:**

- Checks prototype chain
- Fails for primitives
- Fails cross-realm
- Can be customized with `Symbol.hasInstance`

---

### Type Coercion vs Conversion

**Coercion (implicit):**

- Automatic by JavaScript
- Triggered by operators and contexts
- Often surprising and bug-prone

**Conversion (explicit):**

- Manual by developer
- Use constructors or functions
- More predictable and readable

---

### Equality Operators

|Operator|Coercion|NaN === NaN|0 === -0|null == undefined|Use Case|
|---|---|---|---|---|---|
|`==`|Yes|false|true|**true**|Only for null/undefined check|
|`===`|No|false|true|false|Default choice|
|`Object.is()`|No|**true**|**false**|false|NaN and -0 checks|

---

### Best Practices

1. **Always use `===`** unless you have a specific reason for `==`
2. **Only use `==` for `null`/`undefined` checks**
3. **Use `Number.isNaN()` for NaN checks** (not `=== NaN`)
4. **Use `Array.isArray()` for array checks** (not `instanceof`)
5. **Avoid relying on type coercion**—be explicit
6. **Use linters** to catch `==` usage
7. **Understand truthiness** but don't abuse it
8. **Be explicit with conversions**: `String()`, `Number()`, `Boolean()`

---

**End of Chapter 1.4: Type System**

You now understand:

- How `typeof` and `instanceof` work (and their limitations)
- The rules of type coercion (implicit conversion)
- How to explicitly convert between types
- The 8 falsy values and truthy behavior
- The differences between `==`, `===`, and `Object.is()`
- The internal algorithms for equality and coercion
- Best practices for type checking and equality

This knowledge is essential for avoiding type-related bugs and writing predictable JavaScript code.