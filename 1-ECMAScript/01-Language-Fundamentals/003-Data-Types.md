# 1.3 Data Types

## Introduction

JavaScript's type system is often misunderstood. It's **dynamically typed** (types determined at runtime) and **weakly typed** (implicit conversions happen freely). The language has **two categories of types**: primitives (immutable, stored by value) and reference types (mutable, stored by reference).

Understanding the distinction between these categories, the internal representation of values, and the behavior of each type is critical for avoiding bugs and writing performant code.

This chapter dissects every data type in JavaScript, from the simple `undefined` to the complex `SharedArrayBuffer`. No surface-level explanations—we're diving into IEEE 754 floating-point, symbol uniqueness, WeakMap garbage collection semantics, and everything in between.

---

## 1.3.1 Primitive vs Reference Types

### Fundamental Distinction

**Primitives:**

- Immutable (cannot be changed)
- Stored by value
- Compared by value
- Seven types: `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`

**Reference Types:**

- Mutable (can be changed)
- Stored by reference
- Compared by reference (identity)
- Everything else: objects, arrays, functions, etc.

---

### Value vs Reference Semantics

**Primitives are copied:**

```javascript
let x = 10;
let y = x;  // y gets a COPY of the value
x = 20;

console.log(x);  // 20
console.log(y);  // 10 (unchanged)
```

**Reference types are referenced:**

```javascript
let obj1 = { count: 10 };
let obj2 = obj1;  // obj2 gets a REFERENCE to the same object
obj1.count = 20;

console.log(obj1.count);  // 20
console.log(obj2.count);  // 20 (same object)
```

**Memory model:**

```javascript
// Primitives
let a = 5;
let b = a;

// Memory:
// a → [5]
// b → [5]  (separate copy)

// References
let arr1 = [1, 2, 3];
let arr2 = arr1;

// Memory:
// arr1 → [Reference: 0x1234]
// arr2 → [Reference: 0x1234]
// 0x1234: [1, 2, 3]  (single object in heap)
```

---

### Immutability of Primitives

Primitives **cannot be mutated**. Operations on primitives always create new values:

```javascript
let str = "hello";
str.toUpperCase();  // Returns new string "HELLO"
console.log(str);   // Still "hello" (original unchanged)

let num = 5;
num++;             // Creates new value 6, assigns to num
// The original 5 is gone (or available for garbage collection)
```

**Why this matters:**

```javascript
let str = "test";
str[0] = "T";  // Silent failure (strict mode doesn't help)
console.log(str);  // Still "test"

// Strings are immutable - must create new string
str = "T" + str.slice(1);
console.log(str);  // "Test"
```

---

## 1.3.2 Primitive Types

### `undefined`

**Meaning:** Variable declared but not initialized, or property that doesn't exist.

**Type:** The type `undefined` has exactly one value: `undefined`.

**Characteristics:**

```javascript
let x;
console.log(x);           // undefined
console.log(typeof x);    // "undefined"

let obj = {};
console.log(obj.missing); // undefined

function f() {}
console.log(f());         // undefined (no explicit return)
```

**`undefined` is a global property:**

```javascript
console.log(window.undefined);     // undefined (browser)
console.log(globalThis.undefined); // undefined
```

**Can be shadowed (pre-ES5 bug, still possible in local scope):**

```javascript
// Global undefined cannot be reassigned (ES5+)
undefined = 42;
console.log(undefined);  // Still undefined

// But can be shadowed locally
function test() {
  let undefined = 42;  // Legal but terrible idea
  console.log(undefined);  // 42
}
```

**Safe check for `undefined`:**

```javascript
// Unsafe (can be shadowed)
if (x === undefined) { }

// Safe (typeof always works)
if (typeof x === "undefined") { }

// Safest (void always returns undefined)
if (x === void 0) { }
```

**`void` operator:**

```javascript
void 0;        // undefined
void(0);       // undefined
void anything; // undefined

// Common use: prevent default in href
<a href="javascript:void(0)">Click</a>
```

---

### `null`

**Meaning:** Intentional absence of value. Represents "no object."

**Type:** Despite `typeof null === "object"` (a bug in the spec), `null` is a primitive.

**Characteristics:**

```javascript
let x = null;
console.log(x);        // null
console.log(typeof x); // "object" (historical bug!)

console.log(x === null);     // true
console.log(x == undefined); // true (loose equality)
console.log(x === undefined);// false (strict equality)
```

**The `typeof null` bug:**

This is a **well-known bug** that cannot be fixed for backward compatibility reasons. In the original JavaScript implementation, values were stored with a type tag, and objects had a tag of `000`. `null` was represented as the NULL pointer (all zeros), which looked like an object tag.

**Checking for `null`:**

```javascript
if (x === null) { }         // Correct
if (x == null) { }          // Matches null OR undefined
if (!x && typeof x === "object") { }  // Explicit check
```

**`null` vs `undefined`:**

```javascript
// undefined: unintentional absence
let x;
console.log(x);  // undefined (forgot to initialize)

// null: intentional absence
let y = null;
console.log(y);  // null (explicitly set to "no value")

// API convention: null indicates "intentionally empty"
let user = getUserById(123);  // Returns null if not found
if (user === null) {
  console.log("User not found");
}
```

**Converting to primitive:**

```javascript
Number(null);      // 0
Number(undefined); // NaN

String(null);      // "null"
String(undefined); // "undefined"

Boolean(null);     // false
Boolean(undefined);// false
```

---

### `Boolean`

**Values:** `true` and `false` (only two values).

**Type:** `boolean`

**Characteristics:**

```javascript
let isTrue = true;
let isFalse = false;

console.log(typeof isTrue);  // "boolean"
console.log(typeof isFalse); // "boolean"
```

**Boolean conversion (all values are truthy or falsy):**

**Falsy values (8 total):**

```javascript
Boolean(false);      // false
Boolean(0);          // false
Boolean(-0);         // false
Boolean(0n);         // false (BigInt zero)
Boolean("");         // false (empty string)
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
Boolean("false");    // true (non-empty string)
Boolean([]);         // true (empty array is an object)
Boolean({});         // true (empty object)
Boolean(function(){}); // true
```

**Common gotcha:**

```javascript
let arr = [];
if (arr) {
  console.log("Arrays are truthy!");  // This runs
}

if (arr.length) {
  console.log("This doesn't run");  // length is 0 (falsy)
}
```

**Boolean constructor vs boolean primitive:**

```javascript
let primitiveBool = true;
let objectBool = new Boolean(true);

console.log(typeof primitiveBool);  // "boolean"
console.log(typeof objectBool);     // "object"

if (objectBool) {
  console.log("This runs!");  // Objects are always truthy, even Boolean(false)
}

let falseObject = new Boolean(false);
if (falseObject) {
  console.log("This runs too!");  // Object wrapper is truthy
}

// Always use primitives
```

---

### `Number`

**Range:** ±1.7976931348623157 × 10^308 (approximately)

**Type:** All numbers are 64-bit floating-point (IEEE 754 double precision).

**Characteristics:**

JavaScript has **no integer type**. All numbers are floats:

```javascript
let integer = 42;
let float = 42.5;
let scientific = 3.14e10;
let hex = 0xFF;        // 255
let octal = 0o77;      // 63
let binary = 0b1010;   // 10

console.log(typeof integer);  // "number"
console.log(typeof float);    // "number"
```

---

#### IEEE 754 Floating-Point

JavaScript uses **64-bit IEEE 754 double precision**:

**Binary representation:**

```
[Sign: 1 bit] [Exponent: 11 bits] [Mantissa/Fraction: 52 bits]
```

**Precision limits:**

```javascript
// Safe integer range: -(2^53 - 1) to (2^53 - 1)
Number.MAX_SAFE_INTEGER;  // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER;  // -9007199254740991 (-(2^53 - 1))

// Beyond safe integers, precision is lost
console.log(9007199254740992);     // 9007199254740992
console.log(9007199254740993);     // 9007199254740992 (SAME!)
console.log(9007199254740994);     // 9007199254740994

// Checking safety
Number.isSafeInteger(9007199254740991);  // true
Number.isSafeInteger(9007199254740992);  // false
```

**Floating-point precision issues:**

```javascript
0.1 + 0.2;  // 0.30000000000000004 (NOT 0.3!)

// Why? 0.1 and 0.2 cannot be represented exactly in binary
// 0.1 in binary: 0.0001100110011001100110011... (infinite)
// 0.2 in binary: 0.001100110011001100110011... (infinite)

// Solutions:
// 1. Use epsilon comparison
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;  // true

// 2. Use integer arithmetic
(0.1 * 10 + 0.2 * 10) / 10;  // 0.3

// 3. Use libraries (e.g., decimal.js, big.js)

// 4. Use toFixed for display
(0.1 + 0.2).toFixed(2);  // "0.30"
```

**Special numeric values:**

```javascript
Number.MAX_VALUE;     // 1.7976931348623157e+308 (largest positive)
Number.MIN_VALUE;     // 5e-324 (smallest positive, close to zero)
Number.EPSILON;       // 2.220446049250313e-16 (smallest difference)
```

---

#### `NaN` (Not-a-Number)

**Type:** `number` (ironically)

**Characteristics:**

- Result of invalid numeric operations
- Only value that's not equal to itself
- Propagates through calculations

```javascript
console.log(typeof NaN);  // "number"

// Creating NaN
let result = 0 / 0;        // NaN
let invalid = parseInt("hello");  // NaN
let math = Math.sqrt(-1);  // NaN

// NaN is not equal to anything, including itself
console.log(NaN === NaN);  // false
console.log(NaN == NaN);   // false

// Checking for NaN
isNaN(NaN);        // true
isNaN("hello");    // true (coerces to NaN first, then checks)

Number.isNaN(NaN);        // true
Number.isNaN("hello");    // false (strict check, no coercion)

// Use Number.isNaN for accurate checking
```

**NaN propagation:**

```javascript
let x = NaN;
console.log(x + 5);   // NaN
console.log(x * 2);   // NaN
console.log(x - x);   // NaN (not 0!)
```

**Gotcha with `isNaN`:**

```javascript
isNaN("hello");     // true (coerces "hello" to NaN)
isNaN({});          // true (coerces {} to NaN)
isNaN(undefined);   // true (coerces undefined to NaN)

// Use Number.isNaN (ES6)
Number.isNaN("hello");     // false (no coercion)
Number.isNaN(NaN);         // true

// Polyfill for Number.isNaN
Number.isNaN = Number.isNaN || function(value) {
  return typeof value === "number" && isNaN(value);
};
```

---

#### `Infinity` and `-Infinity`

**Characteristics:**

```javascript
console.log(typeof Infinity);   // "number"
console.log(typeof -Infinity);  // "number"

// Creating Infinity
let positive = 1 / 0;         // Infinity
let negative = -1 / 0;        // -Infinity
let overflow = Number.MAX_VALUE * 2;  // Infinity

// Checking
Number.isFinite(Infinity);    // false
Number.isFinite(100);         // true
Number.isFinite(NaN);         // false

isFinite(Infinity);           // false
isFinite("100");              // true (coerces to number)
Number.isFinite("100");       // false (strict, no coercion)
```

**Math with Infinity:**

```javascript
Infinity + Infinity;    // Infinity
Infinity - Infinity;    // NaN
Infinity * Infinity;    // Infinity
Infinity / Infinity;    // NaN

Infinity + 100;         // Infinity
Infinity * 0;           // NaN

1 / Infinity;           // 0
-1 / Infinity;          // -0

// Comparisons
Infinity > 1000000;     // true
-Infinity < -1000000;   // true
```

---

#### Negative Zero (`-0`)

**Yes, JavaScript has negative zero:**

```javascript
let negZero = -0;
let posZero = 0;

console.log(negZero === posZero);  // true (equality ignores sign)
console.log(negZero);              // 0 (displayed as 0)

// Creating -0
let result = -1 / Infinity;  // -0
let math = Math.round(-0.1); // -0

// Detecting -0
function isNegativeZero(x) {
  return x === 0 && (1 / x) === -Infinity;
}

isNegativeZero(-0);  // true
isNegativeZero(0);   // false

// Object.is can distinguish
Object.is(0, -0);    // false
Object.is(-0, -0);   // true
```

**Why negative zero exists:**

IEEE 754 represents zero with a sign bit. This allows distinguishing direction in certain calculations:

```javascript
// Approaching zero from negative side
let x = -0.000001;
while (x !== 0) {
  x = x / 2;
}
console.log(1 / x);  // -Infinity (preserves direction)
```

---

#### Number Methods

```javascript
// Parsing
parseInt("123");        // 123
parseInt("123.45");     // 123
parseInt("FF", 16);     // 255 (hex)
parseFloat("123.45");   // 123.45

// Checking
Number.isInteger(42);       // true
Number.isInteger(42.5);     // false
Number.isNaN(NaN);          // true
Number.isFinite(100);       // true
Number.isSafeInteger(9007199254740991);  // true

// Conversion
(42).toString();        // "42"
(42).toString(2);       // "101010" (binary)
(42).toString(16);      // "2a" (hex)
(3.14159).toFixed(2);   // "3.14"
(3.14159).toPrecision(3);  // "3.14"
(1234).toExponential();    // "1.234e+3"
```

---

### `BigInt`

**Purpose:** Arbitrary-precision integers (no size limit).

**Type:** `bigint` (distinct from `number`)

**Syntax:**

```javascript
let big1 = 1234567890123456789012345678901234567890n;  // Literal: suffix with 'n'
let big2 = BigInt("1234567890123456789012345678901234567890");
let big3 = BigInt(123);  // From number

console.log(typeof big1);  // "bigint"
```

**No precision loss:**

```javascript
// Number loses precision
console.log(9007199254740993);     // 9007199254740992 (wrong!)

// BigInt preserves precision
console.log(9007199254740993n);    // 9007199254740993n (correct!)
```

**Arithmetic:**

```javascript
let a = 10n;
let b = 20n;

console.log(a + b);   // 30n
console.log(a * b);   // 200n
console.log(b / a);   // 2n (integer division, truncates)
console.log(b % a);   // 0n
console.log(a ** b);  // 100000000000000000000n

// Division truncates (no decimals)
console.log(7n / 2n);  // 3n (not 3.5)
```

**Cannot mix with Number:**

```javascript
let big = 10n;
let num = 20;

console.log(big + num);  // TypeError: Cannot mix BigInt and other types

// Must convert explicitly
console.log(big + BigInt(num));  // 30n
console.log(Number(big) + num);  // 30

// Caution: converting BigInt to Number may lose precision
let huge = 9007199254740993n;
console.log(Number(huge));  // 9007199254740992 (precision lost!)
```

**Comparisons:**

```javascript
// Equality (strict)
console.log(10n === 10);   // false (different types)
console.log(10n === 10n);  // true

// Equality (loose, coerces)
console.log(10n == 10);    // true

// Relational (works cross-type)
console.log(10n < 20);     // true
console.log(10n > 5);      // true
```

**No decimal, no exponential, no bitwise NOT:**

```javascript
let x = 10.5n;  // SyntaxError: invalid BigInt syntax
let y = 1e9n;   // SyntaxError: invalid BigInt syntax

~10n;  // TypeError: BigInt does not support bitwise NOT
// Other bitwise operators work fine
```

**Methods:**

```javascript
BigInt.asIntN(64, 2n ** 63n);   // Convert to signed 64-bit
BigInt.asUintN(64, 2n ** 64n);  // Convert to unsigned 64-bit

(123n).toString();     // "123"
(123n).toString(16);   // "7b" (hex)
```

---

### `String`

**Type:** Immutable sequence of UTF-16 code units.

**Characteristics:**

```javascript
let str1 = "double quotes";
let str2 = 'single quotes';
let str3 = `template literal`;

console.log(typeof str1);  // "string"
```

**Strings are immutable:**

```javascript
let str = "hello";
str[0] = "H";  // Silent failure
console.log(str);  // Still "hello"

// Must create new string
str = "H" + str.slice(1);
console.log(str);  // "Hello"
```

---

#### String Encoding (UTF-16)

JavaScript strings are sequences of **UTF-16 code units** (not characters!).

**Basic Multilingual Plane (BMP) characters (U+0000 to U+FFFF):**

Most common characters fit in a single code unit:

```javascript
let str = "A";  // U+0041
console.log(str.length);        // 1
console.log(str.charCodeAt(0)); // 65 (0x41)
```

**Supplementary characters (U+10000 to U+10FFFF):**

Characters outside BMP require **two code units** (surrogate pair):

```javascript
let emoji = "😀";  // U+1F600
console.log(emoji.length);        // 2 (surrogate pair!)
console.log(emoji.charCodeAt(0)); // 55357 (high surrogate)
console.log(emoji.charCodeAt(1)); // 56832 (low surrogate)

// Correct way to get code point
console.log(emoji.codePointAt(0));  // 128512 (0x1F600)
```

**Iterating strings correctly:**

```javascript
let str = "A😀B";

// Wrong: iterates code units
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);
}
// Output: A, �, �, B (surrogate pairs split)

// Correct: iterates code points
for (let char of str) {
  console.log(char);
}
// Output: A, 😀, B

// Or use spread operator
console.log([...str]);  // ["A", "😀", "B"]

// Array.from also works
console.log(Array.from(str));  // ["A", "😀", "B"]
```

**Counting characters correctly:**

```javascript
let str = "A😀B";
console.log(str.length);  // 4 (code units)

// Correct character count
console.log([...str].length);  // 3 (code points)
console.log(Array.from(str).length);  // 3
```

---

#### Template Literals

**Introduced in ES6:**

```javascript
let name = "Alice";
let age = 30;

// Template literal
let greeting = `Hello, ${name}! You are ${age} years old.`;
console.log(greeting);  // "Hello, Alice! You are 30 years old."

// Multi-line
let multiLine = `
  Line 1
  Line 2
  Line 3
`;

// Expressions
let math = `2 + 2 = ${2 + 2}`;  // "2 + 2 = 4"

// Function calls
let upper = `Hello ${name.toUpperCase()}!`;  // "Hello ALICE!"
```

**Tagged templates:**

```javascript
function tag(strings, ...values) {
  console.log(strings);  // ["Hello ", "! You are ", " years old."]
  console.log(values);   // ["Alice", 30]
  
  return strings[0] + values[0].toUpperCase() + strings[1] + values[1] + strings[2];
}

let result = tag`Hello ${name}! You are ${age} years old.`;
console.log(result);  // "Hello ALICE! You are 30 years old."
```

**Raw strings:**

```javascript
let path = String.raw`C:\Users\name\file.txt`;
console.log(path);  // "C:\Users\name\file.txt" (backslashes preserved)

// Without String.raw
let path2 = `C:\Users\name\file.txt`;
console.log(path2);  // "C:Usersame\file.txt" (\U and \n interpreted)
```

---

#### String Methods

```javascript
// Length and access
"hello".length;          // 5
"hello"[0];              // "h"
"hello".charAt(0);       // "h"
"hello".charCodeAt(0);   // 104
"😀".codePointAt(0);     // 128512

// Searching
"hello".indexOf("l");         // 2
"hello".lastIndexOf("l");     // 3
"hello".includes("ll");       // true
"hello".startsWith("he");     // true
"hello".endsWith("lo");       // true

// Extraction
"hello".slice(1, 4);          // "ell"
"hello".substring(1, 4);      // "ell"
"hello".substr(1, 3);         // "ell" (deprecated)

// Modification (returns new string)
"hello".toUpperCase();        // "HELLO"
"hello".toLowerCase();        // "hello"
"  hello  ".trim();           // "hello"
"  hello  ".trimStart();      // "hello  "
"  hello  ".trimEnd();        // "  hello"
"hello".repeat(3);            // "hellohellohello"
"hello".padStart(10, "*");    // "*****hello"
"hello".padEnd(10, "*");      // "hello*****"

// Replacement
"hello".replace("l", "L");    // "heLlo" (first occurrence)
"hello".replaceAll("l", "L"); // "heLLo" (all occurrences, ES2021)

// Splitting
"a,b,c".split(",");           // ["a", "b", "c"]
"hello".split("");            // ["h", "e", "l", "l", "o"]

// Concatenation
"hello".concat(" ", "world"); // "hello world"
"hello" + " " + "world";      // "hello world"
```

---

### `Symbol`

**Purpose:** Unique, immutable primitive for property keys.

**Type:** `symbol`

**Characteristics:**

- Every symbol is unique (even with same description)
- Immutable
- Not auto-converted to string
- Used as object property keys

**Creating symbols:**

```javascript
let sym1 = Symbol();
let sym2 = Symbol("description");
let sym3 = Symbol("description");

console.log(typeof sym1);  // "symbol"

console.log(sym2 === sym3);  // false (always unique!)

// Description is for debugging only
console.log(sym2.description);  // "description"
```

**Cannot convert to number or string implicitly:**

```javascript
let sym = Symbol("test");

console.log(sym + "");     // TypeError
console.log(+sym);         // TypeError

// Must be explicit
console.log(String(sym));  // "Symbol(test)"
console.log(sym.toString());  // "Symbol(test)"
```

**As property keys:**

```javascript
let sym = Symbol("id");

let obj = {
  [sym]: 123,
  name: "Alice"
};

console.log(obj[sym]);  // 123
console.log(obj.name);  // "Alice"

// Symbols are not enumerable in for-in
for (let key in obj) {
  console.log(key);  // Only "name"
}

// Symbols are not in Object.keys
console.log(Object.keys(obj));  // ["name"]

// Must use Object.getOwnPropertySymbols
console.log(Object.getOwnPropertySymbols(obj));  // [Symbol(id)]

// Or Reflect.ownKeys (gets all keys)
console.log(Reflect.ownKeys(obj));  // ["name", Symbol(id)]
```

**Well-known symbols:**

JavaScript has built-in symbols for customizing behavior:

```javascript
Symbol.iterator       // Customize iteration
Symbol.toStringTag    // Customize Object.prototype.toString
Symbol.hasInstance    // Customize instanceof
Symbol.toPrimitive    // Customize type conversion
Symbol.match          // Customize String.prototype.match
Symbol.species        // Customize derived constructors
// ... and more
```

**Example with `Symbol.iterator`:**

```javascript
let range = {
  from: 1,
  to: 5,
  
  [Symbol.iterator]() {
    let current = this.from;
    let last = this.to;
    
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (let num of range) {
  console.log(num);  // 1, 2, 3, 4, 5
}

console.log([...range]);  // [1, 2, 3, 4, 5]
```

**Global symbol registry:**

```javascript
// Create or get global symbol
let sym1 = Symbol.for("shared");
let sym2 = Symbol.for("shared");

console.log(sym1 === sym2);  // true (same global symbol)

// Get key for global symbol
console.log(Symbol.keyFor(sym1));  // "shared"

// Local symbols not in registry
let local = Symbol("local");
console.log(Symbol.keyFor(local));  // undefined
```

---

## 1.3.3 Reference Types (Objects)

All reference types are objects. They're mutable and compared by reference.

### `Object`

**The base type for all objects:**

```javascript
let obj1 = {};  // Object literal
let obj2 = new Object();  // Constructor
let obj3 = Object.create(null);  // No prototype

console.log(typeof obj1);  // "object"
```

**Properties:**

```javascript
let user = {
  name: "Alice",
  age: 30,
  "full name": "Alice Smith",  // Key with space
  123: "numeric key"  // Numeric key (converted to string)
};

// Access
console.log(user.name);         // "Alice"
console.log(user["full name"]); // "Alice Smith"
console.log(user[123]);         // "numeric key"
console.log(user["123"]);       // "numeric key" (same)

// Add
user.email = "alice@example.com";

// Modify
user.age = 31;

// Delete
delete user.age;

// Check existence
console.log("name" in user);     // true
console.log(user.hasOwnProperty("name"));  // true
```

**Computed property names:**

```javascript
let propName = "dynamicKey";

let obj = {
  [propName]: "value",
  ["computed" + "Key"]: "value2"
};

console.log(obj.dynamicKey);   // "value"
console.log(obj.computedKey);  // "value2"
```

**Property shorthand:**

```javascript
let name = "Alice";
let age = 30;

// ES5
let user1 = { name: name, age: age };

// ES6 shorthand
let user2 = { name, age };
```

**Method shorthand:**

```javascript
// ES5
let obj1 = {
  method: function() {
    console.log("Hello");
  }
};

// ES6 shorthand
let obj2 = {
  method() {
    console.log("Hello");
  }
};
```

**Object methods:**

```javascript
// Keys and values
Object.keys(obj);     // ["key1", "key2", ...]
Object.values(obj);   // [value1, value2, ...]
Object.entries(obj);  // [["key1", value1], ["key2", value2], ...]

// Copying
Object.assign({}, obj);  // Shallow copy
{...obj};                // Spread (shallow copy)

// Freezing
Object.freeze(obj);      // Make immutable (shallow)
Object.seal(obj);        // Prevent add/delete, allow modify
Object.preventExtensions(obj);  // Prevent add only

// Checking
Object.isFrozen(obj);
Object.isSealed(obj);
Object.isExtensible(obj);

// Property descriptors
Object.getOwnPropertyDescriptor(obj, "key");
Object.defineProperty(obj, "key", descriptor);

// Prototype
Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, proto);
```

**Property descriptors:**

```javascript
let obj = {};

Object.defineProperty(obj, "name", {
  value: "Alice",
  writable: false,     // Cannot modify value
  enumerable: true,    // Shows in for-in
  configurable: false  // Cannot delete or reconfigure
});

obj.name = "Bob";  // Silent failure (strict mode: TypeError)
console.log(obj.name);  // Still "Alice"

delete obj.name;  // Silent failure
console.log(obj.name);  // Still "Alice"
```

---

### `Array`

**Ordered collection of elements:**

```javascript
let arr1 = [];  // Array literal
let arr2 = new Array();  // Constructor
let arr3 = [1, 2, 3];
let arr4 = new Array(5);  // Creates array with length 5 (empty slots)

console.log(typeof arr1);  // "object"
console.log(Array.isArray(arr1));  // true
```

**Length property:**

```javascript
let arr = [1, 2, 3];
console.log(arr.length);  // 3

// Length is writable
arr.length = 5;
console.log(arr);  // [1, 2, 3, empty × 2]

arr.length = 2;
console.log(arr);  // [1, 2] (elements truncated!)
```

**Sparse arrays (holes):**

```javascript
let sparse = [1, , 3];  // Hole at index 1
console.log(sparse.length);  // 3
console.log(sparse[1]);      // undefined
console.log(1 in sparse);    // false (hole, not undefined value)

let dense = [1, undefined, 3];
console.log(2 in dense);     // true (explicit undefined)
```

**Array methods:**

```javascript
// Mutating (modify original array)
arr.push(item);       // Add to end
arr.pop();            // Remove from end
arr.unshift(item);    // Add to start
arr.shift();          // Remove from start
arr.splice(start, deleteCount, ...items);  // Add/remove at index
arr.reverse();        // Reverse in place
arr.sort();           // Sort in place
arr.fill(value);      // Fill with value

// Non-mutating (return new array)
arr.concat(arr2);     // Merge arrays
arr.slice(start, end);  // Extract subarray
arr.map(fn);          // Transform elements
arr.filter(fn);       // Filter elements
arr.reduce(fn, initial);  // Reduce to single value
arr.flat();           // Flatten nested arrays
arr.flatMap(fn);      // Map then flatten

// Searching
arr.indexOf(item);
arr.lastIndexOf(item);
arr.includes(item);
arr.find(fn);
arr.findIndex(fn);

// Iteration
arr.forEach(fn);
arr.some(fn);         // At least one passes test
arr.every(fn);        // All pass test

// Conversion
arr.join(separator);
arr.toString();
```

**Array iteration:**

```javascript
let arr = ["a", "b", "c"];

// for loop
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// for-of (values)
for (let value of arr) {
  console.log(value);
}

// for-in (indices, avoid)
for (let index in arr) {
  console.log(index);  // "0", "1", "2" (strings!)
}

// forEach
arr.forEach((value, index, array) => {
  console.log(value);
});
```

**Array-like objects:**

```javascript
let arrayLike = {
  0: "a",
  1: "b",
  2: "c",
  length: 3
};

// Convert to array
let arr1 = Array.from(arrayLike);
let arr2 = [...arrayLike];  // Only if iterable
let arr3 = Array.prototype.slice.call(arrayLike);
```

---

### `Function`

**Functions are first-class objects:**

```javascript
function f() {}
let g = function() {};
let h = () => {};

console.log(typeof f);  // "function"
console.log(f instanceof Object);  // true
```

**Function properties:**

```javascript
function example(a, b) {
  return a + b;
}

console.log(example.name);      // "example"
console.log(example.length);    // 2 (number of parameters)
console.log(example.prototype); // { constructor: example }
```

**Functions have methods:**

```javascript
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

let user = { name: "Alice" };

// call: invoke with explicit 'this'
greet.call(user, "Hello");  // "Hello, Alice"

// apply: like call, but arguments as array
greet.apply(user, ["Hi"]);  // "Hi, Alice"

// bind: create new function with bound 'this'
let boundGreet = greet.bind(user, "Hey");
boundGreet();  // "Hey, Alice"
```

**Constructor functions:**

```javascript
function Person(name) {
  this.name = name;
}

let alice = new Person("Alice");
console.log(alice.name);  // "Alice"
console.log(alice instanceof Person);  // true
```

We'll cover functions in depth in later chapters.

---

### `Date`

**Represents dates and times:**

```javascript
let now = new Date();                    // Current date/time
let specific = new Date(2024, 0, 15);    // Jan 15, 2024 (month is 0-indexed!)
let fromString = new Date("2024-01-15"); // ISO 8601 string
let fromTimestamp = new Date(1705334400000);  // Milliseconds since epoch

console.log(typeof now);  // "object"
```

**Months are 0-indexed (gotcha!):**

```javascript
let jan = new Date(2024, 0, 15);  // January
let dec = new Date(2024, 11, 15); // December
```

**Getting components:**

```javascript
let date = new Date(2024, 0, 15, 14, 30, 45, 500);

date.getFullYear();    // 2024
date.getMonth();       // 0 (January)
date.getDate();        // 15
date.getDay();         // 1 (Monday, 0 = Sunday)
date.getHours();       // 14
date.getMinutes();     // 30
date.getSeconds();     // 45
date.getMilliseconds();// 500

// UTC versions
date.getUTCFullYear();
date.getUTCMonth();
// etc.
```

**Setting components:**

```javascript
let date = new Date();
date.setFullYear(2025);
date.setMonth(5);  // June
date.setDate(15);
date.setHours(12);
// etc.
```

**Timestamp:**

```javascript
let timestamp = Date.now();  // Current timestamp (milliseconds since Jan 1, 1970)
let timestamp2 = new Date().getTime();  // Same

let date = new Date(timestamp);  // Convert back to Date
```

**Date arithmetic:**

```javascript
let date1 = new Date(2024, 0, 15);
let date2 = new Date(2024, 0, 20);

let diff = date2 - date1;  // Difference in milliseconds
console.log(diff / 1000 / 60 / 60 / 24);  // 5 days
```

**Formatting:**

```javascript
let date = new Date();

date.toString();       // "Mon Jan 15 2024 14:30:45 GMT+0000"
date.toISOString();    // "2024-01-15T14:30:45.500Z"
date.toDateString();   // "Mon Jan 15 2024"
date.toTimeString();   // "14:30:45 GMT+0000"
date.toLocaleDateString();  // Locale-specific
date.toLocaleTimeString();  // Locale-specific
```

---

### `RegExp`

**Pattern matching:**

```javascript
let regex1 = /pattern/flags;
let regex2 = new RegExp("pattern", "flags");

console.log(typeof regex1);  // "object"
```

**Flags:**

```javascript
/pattern/i;   // i = case-insensitive
/pattern/g;   // g = global (find all matches)
/pattern/m;   // m = multiline (^ and $ match line boundaries)
/pattern/s;   // s = dotAll (. matches newlines)
/pattern/u;   // u = unicode (proper handling of surrogate pairs)
/pattern/y;   // y = sticky (match from lastIndex only)
```

**Testing:**

```javascript
let regex = /hello/i;
console.log(regex.test("Hello World"));  // true
console.log(regex.test("Goodbye"));      // false
```

**Matching:**

```javascript
let str = "The year is 2024";
let regex = /\d+/g;

// exec: returns match details
let match = regex.exec(str);
console.log(match);  // ["2024", index: 12, input: "...", groups: undefined]

// String.match
console.log(str.match(regex));  // ["2024"]

// String.matchAll (ES2020)
let matches = [...str.matchAll(/\d+/g)];
```

**Replacement:**

```javascript
let str = "Hello World";
console.log(str.replace(/world/i, "JavaScript"));  // "Hello JavaScript"

// With capture groups
let date = "2024-01-15";
console.log(date.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1"));  // "01/15/2024"
```

**Splitting:**

```javascript
let str = "a,b,c";
console.log(str.split(/,/));  // ["a", "b", "c"]
```

We'll cover regex in detail in Chapter 7.

---

### `Map`

**Key-value pairs with any key type:**

```javascript
let map = new Map();

// Set
map.set("name", "Alice");
map.set(123, "numeric key");
map.set({}, "object key");

// Get
console.log(map.get("name"));  // "Alice"

// Has
console.log(map.has("name"));  // true

// Delete
map.delete("name");

// Size
console.log(map.size);  // 2

// Clear
map.clear();
```

**Any key type (unlike objects):**

```javascript
let map = new Map();

let objKey = { id: 1 };
let funcKey = function() {};
let symKey = Symbol("key");

map.set(objKey, "object value");
map.set(funcKey, "function value");
map.set(symKey, "symbol value");

console.log(map.get(objKey));   // "object value"
console.log(map.get(funcKey));  // "function value"
console.log(map.get(symKey));   // "symbol value"
```

**Iteration:**

```javascript
let map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3]
]);

// for-of
for (let [key, value] of map) {
  console.log(key, value);
}

// forEach
map.forEach((value, key) => {
  console.log(key, value);
});

// Keys, values, entries
console.log([...map.keys()]);    // ["a", "b", "c"]
console.log([...map.values()]);  // [1, 2, 3]
console.log([...map.entries()]); // [["a", 1], ["b", 2], ["c", 3]]
```

**Map vs Object:**

```javascript
// Object: keys are always strings (or symbols)
let obj = {};
obj[{ key: "object" }] = "value";
console.log(obj);  // { "[object Object]": "value" }

// Map: keys can be anything
let map = new Map();
map.set({ key: "object" }, "value");
console.log(map);  // Map { { key: "object" } => "value" }
```

---

### `WeakMap`

**Like Map, but:**

- Keys must be objects
- Keys are weakly referenced (garbage collected if no other references)
- Not iterable
- No `size` property

```javascript
let weakMap = new WeakMap();

let obj1 = { id: 1 };
let obj2 = { id: 2 };

weakMap.set(obj1, "value1");
weakMap.set(obj2, "value2");

console.log(weakMap.get(obj1));  // "value1"

// If obj1 goes out of scope and has no other references:
obj1 = null;  // Entry automatically removed from WeakMap (garbage collected)

// Cannot iterate
// console.log([...weakMap]);  // TypeError
```

**Use case: Private data:**

```javascript
let privateData = new WeakMap();

class User {
  constructor(name) {
    privateData.set(this, { name });
  }
  
  getName() {
    return privateData.get(this).name;
  }
}

let user = new User("Alice");
console.log(user.getName());  // "Alice"
// No way to access privateData from outside
```

---

### `Set`

**Collection of unique values:**

```javascript
let set = new Set();

// Add
set.add(1);
set.add(2);
set.add(2);  // Duplicate, ignored

// Has
console.log(set.has(1));  // true

// Delete
set.delete(1);

// Size
console.log(set.size);  // 1

// Clear
set.clear();
```

**Initialization:**

```javascript
let set = new Set([1, 2, 3, 2, 1]);  // Duplicates removed
console.log([...set]);  // [1, 2, 3]
```

**Iteration:**

```javascript
let set = new Set(["a", "b", "c"]);

// for-of
for (let value of set) {
  console.log(value);
}

// forEach
set.forEach(value => {
  console.log(value);
});

// values(), keys(), entries()
console.log([...set.values()]);  // ["a", "b", "c"]
console.log([...set.keys()]);    // ["a", "b", "c"] (same as values)
console.log([...set.entries()]); // [["a", "a"], ["b", "b"], ["c", "c"]]
```

**Use case: Remove duplicates:**

```javascript
let arr = [1, 2, 3, 2, 1];
let unique = [...new Set(arr)];
console.log(unique);  // [1, 2, 3]
```

---

### `WeakSet`

**Like Set, but:**

- Values must be objects
- Values are weakly referenced
- Not iterable
- No `size` property

```javascript
let weakSet = new WeakSet();

let obj1 = { id: 1 };
let obj2 = { id: 2 };

weakSet.add(obj1);
weakSet.add(obj2);

console.log(weakSet.has(obj1));  // true

obj1 = null;  // Entry automatically removed (garbage collected)
```

**Use case: Track object existence:**

```javascript
let visitedNodes = new WeakSet();

function traverse(node) {
  if (visitedNodes.has(node)) return;
  
  visitedNodes.add(node);
  // Process node
}
```

---

### Typed Arrays

**Binary data in array-like structures:**

**Types:**

```javascript
Int8Array       // 8-bit signed integer
Uint8Array      // 8-bit unsigned integer
Uint8ClampedArray  // 8-bit unsigned (clamped)
Int16Array      // 16-bit signed integer
Uint16Array     // 16-bit unsigned integer
Int32Array      // 32-bit signed integer
Uint32Array     // 32-bit unsigned integer
Float32Array    // 32-bit float
Float64Array    // 64-bit float
BigInt64Array   // 64-bit signed BigInt
BigUint64Array  // 64-bit unsigned BigInt
```

**Creating:**

```javascript
// From length
let arr1 = new Uint8Array(10);  // 10 elements, initialized to 0

// From array-like
let arr2 = new Uint8Array([1, 2, 3]);

// From ArrayBuffer
let buffer = new ArrayBuffer(16);  // 16 bytes
let arr3 = new Uint8Array(buffer);
```

**Characteristics:**

```javascript
let arr = new Uint8Array([1, 2, 3]);

arr.length;         // 3
arr.byteLength;     // 3 (bytes)
arr.byteOffset;     // 0
arr.buffer;         // Underlying ArrayBuffer

arr[0] = 255;
arr[1] = 256;  // Wraps to 0 (overflow)
console.log(arr);  // Uint8Array [255, 0, 3]
```

**Clamping (Uint8ClampedArray):**

```javascript
let arr = new Uint8ClampedArray([1, 2, 3]);
arr[0] = 300;   // Clamped to 255 (max)
arr[1] = -10;   // Clamped to 0 (min)
console.log(arr);  // Uint8ClampedArray [255, 0, 3]
```

**Use case: Binary data, WebGL, Canvas, file I/O**

---

### `ArrayBuffer`

**Raw binary data (fixed-length):**

```javascript
let buffer = new ArrayBuffer(16);  // 16 bytes
console.log(buffer.byteLength);    // 16

// Cannot read/write directly, need a view
let view = new Uint8Array(buffer);
view[0] = 255;
```

**Multiple views on same buffer:**

```javascript
let buffer = new ArrayBuffer(8);

let view1 = new Uint8Array(buffer);   // 8 × 1-byte elements
let view2 = new Uint16Array(buffer);  // 4 × 2-byte elements
let view3 = new Uint32Array(buffer);  // 2 × 4-byte elements

view1[0] = 255;
console.log(view2[0]);  // 255 (same bytes)
console.log(view3[0]);  // 255 (same bytes)
```

---

### `SharedArrayBuffer`

**Shared memory between workers:**

```javascript
// Main thread
let sab = new SharedArrayBuffer(1024);
worker.postMessage(sab);

// Worker thread
onmessage = (e) => {
  let sab = e.data;  // Same SharedArrayBuffer
  let view = new Uint8Array(sab);
  view[0] = 123;  // Modifies shared memory
};
```

**Requires atomics for safe concurrent access:**

```javascript
let sab = new SharedArrayBuffer(4);
let view = new Int32Array(sab);

// Atomic operations
Atomics.add(view, 0, 10);   // Atomically add 10
Atomics.sub(view, 0, 5);    // Atomically subtract 5
Atomics.load(view, 0);      // Atomically read
Atomics.store(view, 0, 42); // Atomically write
```

**Security:** Disabled by default due to Spectre. Requires COOP/COEP headers.

---

### `DataView`

**Low-level reading/writing with explicit endianness:**

```javascript
let buffer = new ArrayBuffer(8);
let view = new DataView(buffer);

// Write (little-endian by default)
view.setUint8(0, 255);
view.setUint16(1, 1234, true);   // little-endian
view.setUint32(3, 5678, false);  // big-endian

// Read
view.getUint8(0);          // 255
view.getUint16(1, true);   // 1234
view.getUint32(3, false);  // 5678
```

**Use case: Binary protocols, file formats**

---

### `Promise`

**Represents asynchronous operation result:**

```javascript
let promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 1000);
});

promise.then(result => console.log(result));  // "done" (after 1 second)
```

**States:**

- **Pending:** Initial state
- **Fulfilled:** Operation completed successfully
- **Rejected:** Operation failed

```javascript
let promise = new Promise((resolve, reject) => {
  let success = true;
  
  if (success) {
    resolve("Success!");
  } else {
    reject("Error!");
  }
});

promise
  .then(result => console.log(result))   // "Success!"
  .catch(error => console.log(error));
```

**Chaining:**

```javascript
fetch("/api/user")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

We'll cover Promises in depth in Chapter 10.

---

### `Proxy`

**Intercept operations on objects:**

```javascript
let target = { name: "Alice" };

let proxy = new Proxy(target, {
  get(target, prop) {
    console.log(`Getting ${prop}`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(`Setting ${prop} to ${value}`);
    target[prop] = value;
    return true;
  }
});

proxy.name;         // Logs: "Getting name", returns "Alice"
proxy.name = "Bob"; // Logs: "Setting name to Bob"
```

**Traps (interceptable operations):**

```javascript
get, set, has, deleteProperty, apply, construct,
getPrototypeOf, setPrototypeOf, isExtensible,
preventExtensions, getOwnPropertyDescriptor,
defineProperty, ownKeys
```

**Use case: Validation, logging, reactivity**

```javascript
let validator = {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    target[prop] = value;
    return true;
  }
};

let person = new Proxy({}, validator);
person.age = 30;    // OK
person.age = "30";  // TypeError: Age must be a number
```

---

### `WeakRef`

**Weak reference to object (doesn't prevent garbage collection):**

```javascript
let obj = { data: "important" };
let weakRef = new WeakRef(obj);

// Get reference
console.log(weakRef.deref());  // { data: "important" }

// If obj is garbage collected:
obj = null;
// Later...
console.log(weakRef.deref());  // undefined (object was GC'd)
```

**Use case: Caching without memory leaks**

---

### `FinalizationRegistry`

**Run callback when object is garbage collected:**

```javascript
let registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object with value ${heldValue} was garbage collected`);
});

let obj = { data: "important" };
registry.register(obj, "myObject");

// When obj is garbage collected:
obj = null;
// Eventually logs: "Object with value myObject was garbage collected"
```

**Use case: Cleanup resources (file handles, network connections)**

---

## 1.3.4 Type Summary

### Primitive Types

|Type|typeof|Values|Mutable|Example|
|---|---|---|---|---|
|`undefined`|`undefined`|`undefined`|No|`undefined`|
|`null`|`object`|`null`|No|`null`|
|`boolean`|`boolean`|`true`, `false`|No|`true`|
|`number`|`number`|IEEE 754 floats|No|`42`, `3.14`, `NaN`|
|`bigint`|`bigint`|Arbitrary-size integers|No|`123n`|
|`string`|`string`|UTF-16 code units|No|`"hello"`|
|`symbol`|`symbol`|Unique values|No|`Symbol("id")`|

### Reference Types

|Type|typeof|Description|
|---|---|---|
|`Object`|`object`|Key-value pairs|
|`Array`|`object`|Ordered collection|
|`Function`|`function`|Callable object|
|`Date`|`object`|Date/time|
|`RegExp`|`object`|Regular expression|
|`Map`|`object`|Key-value (any key type)|
|`WeakMap`|`object`|Weakly-held key-value|
|`Set`|`object`|Unique values|
|`WeakSet`|`object`|Weakly-held unique values|
|Typed Arrays|`object`|Binary typed data|
|`ArrayBuffer`|`object`|Raw binary buffer|
|`SharedArrayBuffer`|`object`|Shared binary buffer|
|`DataView`|`object`|Low-level buffer view|
|`Promise`|`object`|Asynchronous result|
|`Proxy`|`object`|Object operation interceptor|
|`WeakRef`|`object`|Weak object reference|
|`FinalizationRegistry`|`object`|GC cleanup callback|

---

**End of Chapter 1.3: Data Types**

This chapter covered all JavaScript data types in depth. You now understand:

- The distinction between primitives and reference types
- Value vs reference semantics
- Every primitive type and its quirks (IEEE 754, NaN, BigInt, Symbol, etc.)
- All built-in reference types and their use cases
- Binary data structures (Typed Arrays, ArrayBuffer, etc.)
- Modern additions (WeakRef, FinalizationRegistry, etc.)

Next: Type System (checking, coercion, conversion, equality).