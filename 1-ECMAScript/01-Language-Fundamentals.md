# 1 Language Fundamentals

**JavaScript's foundation rests on six pillars:** 
1. **lexical structure** (how source code is tokenized)
2. **variables and declarations** (scoping, hoisting, TDZ)
3. **data types** (primitives vs references)
4. **type system** (coercion, equality, checking)
5. **operators** (arithmetic to nullish coalescing)
6. **expressions/statements** (the building blocks of executable code).

This chapter dissects each pillar without shortcuts. We examine internal mechanics, edge cases, and the precise rules that govern JavaScript's behavior. Master these fundamentals and every advanced concept becomes tractable.

---

## 1.1 Lexical Structure

### 1.1.1 Tokens and Keywords

JavaScript source code is parsed into a sequence of **tokens**. A token is the smallest meaningful unit of code.

**Token Types:**

1. **Keywords** - Reserved words with special meaning
2. **Identifiers** - Names for variables, functions, properties
3. **Literals** - Fixed values (numbers, strings, booleans, etc.)
4. **Operators** - Symbols that perform operations (`+`, `-`, `=`, etc.)
5. **Punctuators** - Structural symbols (`{`, `}`, `;`, `,`, etc.)
6. **Whitespace** - Spaces, tabs, newlines (mostly ignored)
7. **Comments** - Code annotations (ignored by interpreter)

**Keywords (as of ES2024):**

```javascript
await       break       case        catch       class
const       continue    debugger    default     delete
do          else        enum        export      extends
false       finally     for         function    if
import      in          instanceof  new         null
return      super       switch      this        throw
true        try         typeof      var         void
while       with        yield
```

**Contextual Keywords** (reserved in specific contexts):

```javascript
as          async       from        get         let
of          set         static      target      meta
```

**Important Notes:**

- Keywords cannot be used as identifiers (variable/function names)
- Case-sensitive: `if` is a keyword, `If` is not
- Some keywords are unused but reserved for future use (e.g., `enum`)

**Examples:**

```javascript
// Valid
let userName = "John";
const _private = 42;
var $jquery = true;

// Invalid - using keywords
let if = 5;        // SyntaxError
const class = {};  // SyntaxError
var return = 10;   // SyntaxError
```

---

### 1.1.2 Reserved Words

Reserved words include **keywords** plus additional words reserved for future use or specific contexts.

**Complete Reserved Word List:**

```javascript
Current Keywords: (see 1.1.1)

Future Reserved Words (Strict Mode):
implements   interface    package      private      protected
public       static

Contextual Reserved Words:
arguments    eval         let          yield        await
async        of           target       meta

Reserved in Strict Mode Only:
let          static       implements   interface    package
private      protected    public
```

**Special Identifiers (not reserved but have special meaning):**

```javascript
undefined    NaN          Infinity     arguments    eval
```

**Critical Rules:**

1. **Never use reserved words as identifiers**, even if the interpreter allows it in sloppy mode
2. **`arguments` and `eval`** cannot be redeclared in strict mode
3. **`let`** is a reserved word in strict mode but not in sloppy mode (confusing, avoid)
4. Future reserved words may break your code in future JS versions

**Examples:**

```javascript
// Sloppy mode (non-strict)
var let = 5;           // Works (bad practice)
var implements = {};   // Works (bad practice)

// Strict mode
"use strict";
var let = 5;           // SyntaxError
var implements = {};   // SyntaxError
var public = true;     // SyntaxError

// Always problematic
var if = 10;           // SyntaxError in all modes
var class = {};        // SyntaxError in all modes
```

---

### 1.1.3 Identifiers and Naming Rules

An **identifier** is a name used to identify a variable, function, property, or label.

**Syntax Rules:**

1. **First character** must be:
    
    - Letter (a-z, A-Z)
    - Underscore (`_`)
    - Dollar sign (`$`)
    - Unicode letter (e.g., `α`, `中`)
2. **Subsequent characters** can be:
    
    - Letters
    - Digits (0-9)
    - Underscore (`_`)
    - Dollar sign (`$`)
    - Unicode letters/digits
3. **Case-sensitive**: `myVar`, `MyVar`, and `MYVAR` are different identifiers
    
4. **Cannot be a reserved word**
    

**Valid Identifiers:**

```javascript
// Standard ASCII
myVariable
_privateVar
$jqueryElement
userName123
camelCaseNaming
PascalCaseNaming
CONSTANT_VALUE
__proto__
$_

// Unicode (valid but not recommended)
let café = "coffee";
let π = 3.14159;
let 変数 = "variable in Japanese";
let имя = "name in Russian";
```

**Invalid Identifiers:**

```javascript
let 123start = 10;      // Cannot start with digit
let my-var = 5;         // Hyphen not allowed
let my var = 5;         // Space not allowed
let my.var = 5;         // Dot not allowed
let @handle = "user";   // @ not allowed
let class = {};         // Reserved word
```

**Naming Conventions (not enforced, but standard):**

```javascript
// Variables and functions: camelCase
let userName = "Alice";
function getUserData() {}

// Constants: UPPER_SNAKE_CASE (convention for primitive constants)
const MAX_SIZE = 100;
const API_KEY = "abc123";

// Classes and Constructors: PascalCase
class UserAccount {}
function Person(name) {}

// Private properties: prefix with underscore (convention, not enforced until # syntax)
this._internalValue = 42;

// Private fields (ES2022+): prefix with #
class MyClass {
  #privateField = 10;
}

// Boolean variables: prefix with is/has/can
let isActive = true;
let hasPermission = false;
let canEdit = true;

// jQuery objects: prefix with $ (convention)
let $button = $("#myButton");
```

**Special Considerations:**

```javascript
// Unicode identifiers work but avoid in most codebases
let λ = x => x * 2;  // Works, but confusing
let ಠ_ಠ = "disapproval"; // Works, but silly

// Identifiers can use Unicode escape sequences
let \u0061bc = 10;  // Same as: let abc = 10;

// Zero-width characters (DON'T USE - security risk)
let myVar = 1;
let my\u200BVar = 2;  // Different variable! (zero-width space)
```

**Best Practices:**

1. Use **descriptive names**: `getUserById` not `gud`
2. Be **consistent** with naming conventions
3. Avoid **single-letter names** except in tight loops (`i`, `j`, `k`)
4. Don't use **Hungarian notation** (`strName`, `intCount`) - JS is dynamically typed
5. Avoid **abbreviations** unless universally known (`btn`, `db`, `url` are okay)
6. Don't start with underscore unless indicating privacy convention
7. **Never use Unicode** tricks or unusual characters in production code

---

### 1.1.4 Comments

Comments are ignored by the JavaScript interpreter. They document code for humans.

**Types of Comments:**

#### **1. Single-Line Comments**

```javascript
// This is a single-line comment

let x = 5; // Comment after code

// Multiple single-line comments
// can be stacked
// like this
```

#### **2. Multi-Line Comments**

```javascript
/* This is a multi-line comment
   that spans multiple lines
   and can contain any text */

let y = 10; /* inline multi-line comment */ let z = 20;

/*
 * Block comment style often used for longer explanations
 * Each line starts with asterisk for readability
 * (asterisks are optional, just convention)
 */
```

#### **3. JSDoc Comments**

JSDoc is a documentation standard using special comment syntax. Used by documentation generators and IDEs for type hints and documentation.

```javascript
/**
 * Calculates the sum of two numbers
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The sum of a and b
 * @throws {TypeError} If arguments are not numbers
 * @example
 * add(2, 3); // returns 5
 */
function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Arguments must be numbers');
  }
  return a + b;
}

/**
 * Represents a user in the system
 * @class
 * @param {string} name - User's name
 * @param {number} age - User's age
 */
class User {
  constructor(name, age) {
    /** @type {string} */
    this.name = name;
    
    /** @type {number} */
    this.age = age;
  }
  
  /**
   * Gets user's display name
   * @returns {string} Formatted display name
   */
  getDisplayName() {
    return `User: ${this.name}`;
  }
}

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @type {Point}
 */
let origin = { x: 0, y: 0 };
```

**Common JSDoc Tags:**

```javascript
/**
* @param       // Parameter description
* @returns     // Return value description
* @type        // Type of variable
* @typedef     // Custom type definition
* @property    // Object property
* @class       // Class description
* @constructor // Constructor function
* @throws      // Exceptions thrown
* @example     // Usage example
* @deprecated  // Mark as deprecated
* @author      // Author information
* @version     // Version information
* @see         // Cross-reference
* @link        // Link to resource
* @callback    // Callback function
* @async       // Async function
* @generator   // Generator function
* @private     // Private member
* @protected   // Protected member
* @public      // Public member
* @readonly    // Read-only property
* @static      // Static member
* @abstract    // Abstract method
* @override    // Override parent method
* @implements  // Implements interface
* @extends     // Extends parent
*/
```

**Comment Gotchas:**

```javascript
// Multi-line comments DO NOT nest
/* outer comment /* inner comment */ still in outer */ // ERROR!

// Comments can break code in unexpected ways
let url = "http://example.com"; // Works
let url = "http://example.com"; // Oops, this looks like: let url = "http:

// HTML-style comments (legacy, avoid)
<!-- This works but is deprecated
console.log("old school");
--> also works but don't use it

// Hashbang comments (ES2023+, for CLI scripts)
#!/usr/bin/env node
console.log("Executable script");

// Comments in JSON
// JSON does NOT support comments! This is a common mistake
{
  "name": "value",
  // "comment": "not allowed"  // Syntax Error in JSON
}
```

**Best Practices:**

1. **Explain WHY, not WHAT**: Code shows what; comments explain why
    
    ```javascript
    // Bad: Increment i
    i++;
    
    // Good: Skip the header row
    i++;
    
    // Good: Work around browser bug (link to issue)
    // Chrome 89 doesn't support X, so we use Y instead
    // See: https://bugs.chromium.org/p/chromium/issues/detail?id=123456
    ```
    
2. **Keep comments up-to-date**: Stale comments are worse than no comments
    
3. **Use TODO/FIXME/HACK markers**:
    
    ```javascript
    // TODO: Implement caching
    // FIXME: This breaks on negative numbers
    // HACK: Temporary workaround until API is fixed
    // NOTE: Important consideration
    // OPTIMIZE: Performance bottleneck
    ```
    
4. **Don't comment obvious code**:
    
    ```javascript
    // Bad
    let x = 5; // Set x to 5
    
    // Good
    let maxRetries = 5; // Max retries before timeout
    ```
    
5. **Use JSDoc for public APIs**
    
6. **Remove commented-out code** (use version control instead)
    

---

### 1.1.5 Literals

A **literal** is a fixed value directly written in source code.

#### **1. Numeric Literals**

```javascript
// Decimal (base 10)
42
3.14159
.5        // Same as 0.5
5.        // Same as 5.0
1e3       // Scientific notation: 1000
1e-3      // 0.001
2E10      // 20000000000

// Binary (base 2) - prefix 0b or 0B
0b1010    // 10 in decimal
0B11111111 // 255 in decimal

// Octal (base 8) - prefix 0o or 0O (NOT just 0 in strict mode)
0o755     // 493 in decimal
0O644     // 420 in decimal

// Legacy octal (sloppy mode only, avoid)
0755      // 493 in decimal (works in sloppy mode only)

// Hexadecimal (base 16) - prefix 0x or 0X
0xFF      // 255 in decimal
0xDEADBEEF // 3735928559
0X10      // 16 in decimal

// Numeric separators (ES2021) - for readability
1_000_000       // One million
3.141_592_653   // Pi
0b1010_0001     // Binary with separator
0xFF_FF_FF      // Hex with separator

// Special numeric values
Infinity        // Positive infinity
-Infinity       // Negative infinity
NaN             // Not a Number

// BigInt literals (ES2020) - suffix n
42n
0b1010n         // Binary BigInt
0o755n          // Octal BigInt
0xFFn           // Hex BigInt
1_000_000_000_000n // BigInt with separator
```

**Numeric Literal Gotchas:**

```javascript
// Leading zeros in sloppy mode are octal (confusing)
let x = 0123;     // 83 in decimal (sloppy mode)
"use strict";
let y = 0123;     // SyntaxError (strict mode)

// Floating point precision issues
0.1 + 0.2         // 0.30000000000000004 (not exactly 0.3)

// Multiple dots
5..toString()     // "5" (works: first dot is decimal, second is property access)
5.toString()      // SyntaxError (parsed as 5. followed by identifier)
(5).toString()    // "5" (works)

// Underscores placement
1__000            // SyntaxError (no consecutive underscores)
_1000             // Valid identifier, not a number
1000_             // SyntaxError (no trailing underscore)
0x_FF             // SyntaxError (no underscore after prefix)
```

#### **2. String Literals**

```javascript
// Single quotes
'Hello, World!'
'It\'s a beautiful day'  // Escape single quote

// Double quotes
"Hello, World!"
"He said, \"Hello\""     // Escape double quote

// Template literals (backticks) - ES6+
`Hello, World!`
`Multi-line
string`

// String interpolation with template literals
let name = "Alice";
let age = 30;
`My name is ${name} and I'm ${age} years old`

// Expression evaluation in template literals
`2 + 2 = ${2 + 2}`       // "2 + 2 = 4"
`Function result: ${Math.random()}`

// Nested template literals
`Outer ${ `Inner ${1 + 1}` } End`  // "Outer Inner 2 End"

// Tagged template literals
function tag(strings, ...values) {
  console.log(strings);  // Array of string parts
  console.log(values);   // Array of expression values
}
tag`Hello ${name}, you are ${age}`;

// Escape sequences
'\n'      // Newline
'\r'      // Carriage return
'\t'      // Tab
'\b'      // Backspace
'\f'      // Form feed
'\v'      // Vertical tab
'\0'      // Null character
'\\'      // Backslash
'\''      // Single quote
'\"'      // Double quote
'\xA9'    // Hex escape (©)
'\u00A9'  // Unicode escape (©)
'\u{1F600}' // Unicode code point escape (😀) - ES6+

// Raw strings (template literals)
String.raw`C:\Users\name\file.txt`  // "C:\Users\name\file.txt" (no escaping)
`C:\Users\name\file.txt`            // Escapes \U, \n, \f

// Line continuation in regular strings (old style, avoid)
"This is a very long \
string that continues \
on multiple lines"
```

**String Literal Gotchas:**

```javascript
// Line terminators not allowed in regular strings
let bad = "This
is broken";         // SyntaxError

// Use template literals for multi-line
let good = `This
is fine`;

// Octal escape sequences (deprecated in strict mode)
"use strict";
let x = "\251";     // SyntaxError in strict mode
let y = "\xA9";     // OK in all modes

// Empty strings
''                  // Empty string
""                  // Empty string
``                  // Empty string

// Comparing strings
'hello' === "hello" // true (quotes don't matter for equality)
```

#### **3. Boolean Literals**

```javascript
true
false

// NOT boolean literals (but commonly confused)
"true"              // String, not boolean
"false"             // String, not boolean
1                   // Number (truthy, but not boolean literal)
0                   // Number (falsy, but not boolean literal)
```

#### **4. Null Literal**

```javascript
null                // Represents intentional absence of value

// Typeof quirk
typeof null         // "object" (historical bug in JavaScript)

// Null vs undefined
null === undefined  // false
null == undefined   // true (loose equality)
```

#### **5. Undefined**

```javascript
undefined           // Represents uninitialized value

// Ways to get undefined
let x;              // Declared but not assigned
let obj = {};
obj.missing;        // Non-existent property
function f() {}
f();                // Function with no return

// Note: undefined is NOT a keyword, it's a global property
// (can be shadowed in sloppy mode, but don't)
function bad() {
  var undefined = 5; // Don't do this
  console.log(undefined); // 5 (confusing)
}

// Safe way to get undefined
void 0              // Always returns undefined
void(0)             // Same
```

#### **6. Array Literals**

```javascript
// Empty array
[]

// Array with elements
[1, 2, 3, 4, 5]
['a', 'b', 'c']
[1, 'two', true, null, { key: 'value' }]

// Nested arrays
[[1, 2], [3, 4], [5, 6]]

// Sparse arrays (holes)
[1, , 3]            // [1, empty, 3]
[1, , , 4]          // [1, empty, empty, 4]
[,,,]               // [empty × 3]

// Trailing comma (ignored)
[1, 2, 3,]          // Same as [1, 2, 3]

// Spread in array literals
let arr1 = [1, 2];
let arr2 = [...arr1, 3, 4];  // [1, 2, 3, 4]
```

#### **7. Object Literals**

```javascript
// Empty object
{}

// Object with properties
{
  name: 'Alice',
  age: 30,
  isActive: true
}

// Property names can be identifiers, strings, or numbers
{
  identifier: 1,
  'string-key': 2,
  123: 3,
  'normal key': 4
}

// Computed property names (ES6+)
let key = 'dynamicKey';
{
  [key]: 'value',
  ['computed_' + key]: 'another value'
}

// Shorthand property names (ES6+)
let name = 'Alice';
let age = 30;
{ name, age }       // Same as { name: name, age: age }

// Method shorthand (ES6+)
{
  getName() { return this.name; }
  // Same as: getName: function() { return this.name; }
}

// Nested objects
{
  person: {
    name: 'Alice',
    address: {
      city: 'NYC'
    }
  }
}

// Spread in object literals (ES2018+)
let obj1 = { a: 1, b: 2 };
let obj2 = { ...obj1, c: 3 };  // { a: 1, b: 2, c: 3 }

// Trailing comma (allowed)
{
  name: 'Alice',
  age: 30,
}
```

#### **8. Regular Expression Literals**

```javascript
// Basic regex
/pattern/

// Regex with flags
/pattern/gi         // g = global, i = case-insensitive

// Common flags
/pattern/g          // Global search
/pattern/i          // Case-insensitive
/pattern/m          // Multi-line
/pattern/s          // Dot matches newline (ES2018)
/pattern/u          // Unicode mode (ES6)
/pattern/y          // Sticky mode (ES6)
/pattern/d          // Generate indices (ES2022)

// Regex special characters must be escaped in literals
/\./                // Literal dot
/\*/                // Literal asterisk
/\?/                // Literal question mark

// Cannot have unescaped forward slash
/http:\/\//         // Match "http://"

// Note: Division operator can look like regex
let x = 10 / 5;     // Division
let r = /5/;        // Regex

// Ambiguity resolved by context
let y = function() {} /test/;  // Syntax error (ambiguous)
```

#### **9. Template Literal Edge Cases**

```javascript
// Expression in template must be valid
`${}`               // SyntaxError
`${x`               // SyntaxError (unclosed)

// Can contain any expression
`${ function() { return 42; }() }`  // "42"
`${ (() => 'arrow')() }`            // "arrow"

// Nested templates
`outer ${ `inner ${ 'deep' }` }`    // "outer inner deep"

// Tagged templates preserve raw strings
function tag(strings, ...values) {
  console.log(strings.raw[0]);  // Raw string (no escape processing)
}
tag`C:\new\tab`;    // strings.raw[0] = "C:\\new\\tab"
```

---

### 1.1.6 Semicolons and ASI (Automatic Semicolon Insertion)

JavaScript has a mechanism called **Automatic Semicolon Insertion (ASI)** that automatically inserts semicolons in certain situations.

#### **Semicolon Rules:**

**1. Explicit Semicolons**

```javascript
let x = 5;
let y = 10;
console.log(x + y);
```

**2. Semicolons Can Be Omitted**

ASI inserts semicolons automatically in these cases:

- At the end of a line (before a line terminator)
- Before a closing brace `}`
- At the end of the program

```javascript
let x = 5  // Semicolon inserted
let y = 10 // Semicolon inserted
console.log(x + y) // Semicolon inserted
```

#### **ASI Rules (The Exact Specification):**

1. **When the next token cannot form a valid statement continuation:**
    
    ```javascript
    let a = 1
    let b = 2  // Semicolon inserted after 1
    ```
    
2. **When a line terminator is encountered after a restricted token:**
    
    - `return`, `throw`, `break`, `continue`, `yield`, `++`, `--`
    
    ```javascript
    return
    x + y      // Interpreted as: return; x + y;
    
    x
    ++
    y          // Interpreted as: x; ++y;
    ```
    
3. **When a closing brace `}` is encountered:**
    
    ```javascript
    function f() {
      return 42
    }  // Semicolon inserted after 42
    ```
    
4. **At the end of the input:**
    
    ```javascript
    let x = 5  // Semicolon inserted at end
    ```
    

#### **ASI Hazards:**

**1. Return Statement Hazard**

```javascript
// WRONG - returns undefined!
function getObject() {
  return
  {
    name: 'Alice'
  }
}
// Interpreted as:
// return;
// { name: 'Alice' };

// CORRECT
function getObject() {
  return {
    name: 'Alice'
  }
}
```

**2. Array/Object Literal Access**

```javascript
// WRONG - treated as two statements
let arr = [1, 2, 3]
[0, 1].forEach(i => console.log(i))
// Interpreted as: arr[[0, 1]].forEach(...)
// Error: Cannot read property 'forEach' of undefined

// CORRECT
let arr = [1, 2, 3];
[0, 1].forEach(i => console.log(i));
```

**3. Postfix Operators**

```javascript
let x = 5
let y = x
++y  // Interpreted as: let y = x++; y (increments x!)

// Should be:
let x = 5
let y = x;
++y
```

**4. Template Literals**

```javascript
let x = "hello"
`world`  // Interpreted as: "hello"("world")
// TypeError: "hello" is not a function

// Should be:
let x = "hello";
`world`
```

**5. Function Calls with IIFE**

```javascript
let f = function() { return 42 }
(function() { console.log("IIFE") })()
// Interpreted as: let f = function() { return 42 }(function()...)()
// Tries to call 42 as function

// Should be:
let f = function() { return 42 };
(function() { console.log("IIFE") })();
```

**6. Property Access**

```javascript
let obj = {}
[1, 2, 3].forEach(x => console.log(x))
// Interpreted as: let obj = {}[1, 2, 3].forEach(...)
// Error

// Should be:
let obj = {};
[1, 2, 3].forEach(x => console.log(x));
```

#### **When to Use Semicolons (Best Practices):**

**Use explicit semicolons if:**

- Starting a line with `[`, `(`, `` ` ``, `+`, `-`, `/`
- Working in a team (consistency)
- You want predictable behavior

**The "Defensive Semicolon" Pattern:**

```javascript
// If you omit semicolons, start these lines with semicolon
;[1, 2, 3].forEach(...)
;(function() { ... })()
;`template literal`
```

**The "Always Use Semicolons" Approach (Recommended):**

```javascript
let x = 5;
let arr = [1, 2, 3];
arr.forEach(item => console.log(item));

function f() {
  return {
    name: 'Alice'
  };
}
```

**The "Never Use Semicolons" Approach:**

```javascript
let x = 5
let arr = [1, 2, 3]
;[0, 1].forEach(i => console.log(i))  // Defensive semicolon

function f() {
  return {
    name: 'Alice'
  }
}
```

#### **Statements That Must Be Terminated:**

Even with ASI, certain patterns require thinking:

```javascript
// These always work fine with ASI
if (condition) doSomething()
while (condition) doSomething()
for (let i = 0; i < 10; i++) doSomething()

// Expression statements need care
let x = 5
x = 10  // Fine

let f = () => 42
f()  // Fine

// But:
let obj = {}
({}).toString()  // Error without semicolon after {}
```

#### **Empty Statements:**

```javascript
// Empty statement (just a semicolon)
;

// Valid but useless
if (condition);  // Empty if body
while (condition);  // Infinite empty loop (be careful)

// Useful in for loops
for (let i = 0; i < 10; i++);  // Loop body is empty
```

#### **Tool Support:**

Most linters (ESLint) can enforce semicolon style:

```javascript
// ESLint rules
"semi": ["error", "always"]   // Require semicolons
"semi": ["error", "never"]    // Forbid semicolons
```

**Bottom Line:**

- **Understand ASI** to avoid bugs
- **Be consistent** in your codebase
- **Most style guides recommend using semicolons** to avoid edge cases
- **Linters can enforce** your chosen style

---

### 1.1.7 Unicode and Character Encoding

JavaScript strings are sequences of **UTF-16 code units**.

#### **Unicode Basics:**

**Unicode** is a standard for representing text from all writing systems. Each character has a unique number called a **code point** (U+0000 to U+10FFFF).

**UTF-16** encodes code points as one or two 16-bit code units:

- **BMP (Basic Multilingual Plane)**: U+0000 to U+FFFF (single code unit)
- **Supplementary planes**: U+10000 to U+10FFFF (surrogate pair: two code units)

#### **Unicode in JavaScript:**

**1. Unicode Escape Sequences**

```javascript
// \uXXXX - 4 hex digits (BMP characters)
'\u0041'        // 'A'
'\u0048\u0069'  // 'Hi'
'\u00A9'        // '©'
'\u4E2D'        // '中' (Chinese)
'\u03B1'        // 'α' (Greek alpha)

// \u{X...} - code point escape (ES6+) - up to 6 hex digits
'\u{41}'        // 'A'
'\u{1F600}'     // '😀' (emoji)
'\u{1F4A9}'     // '💩'
'\u{10FFFF}'    // Maximum code point

// Without code point escape, surrogates needed for non-BMP
'\uD83D\uDE00'  // '😀' (surrogate pair)
```

**2. Unicode in Identifiers**

```javascript
// Unicode letters allowed in identifiers
let café = 'coffee';
let π = 3.14159;
let \u0041BC = 10;  // Same as: let ABC = 10;

// Zero-width characters (security issue)
let myVar = 1;
let my\u200BVar = 2;  // Different variable! (zero-width space U+200B)
```

**3. String Length and Indexing**

JavaScript strings use UTF-16, so `length` counts code units, not characters:

```javascript
// BMP characters (1 code unit each)
'Hello'.length      // 5
'A'.length          // 1
'中'.length          // 1

// Non-BMP characters (2 code units = surrogate pair)
'😀'.length          // 2 (not 1!)
'𝐀'.length          // 2 (mathematical bold A)

// Combining characters
'é'.length          // 1 (precomposed)
'é'.length          // 2 (e + combining acute accent)

// String indexing by code unit
let emoji = '😀';
emoji[0]            // '\uD83D' (high surrogate, invalid character)
emoji[1]            // '\uDE00' (low surrogate, invalid character)
emoji.charAt(0)     // Same as emoji[0]

// Getting actual character (code point)
[...emoji]          // ['😀'] (spread operator handles code points)
Array.from(emoji)   // ['😀']
emoji.codePointAt(0) // 128512 (0x1F600)
```

**4. Iterating Over Strings**

```javascript
let str = 'A😀B';

// Wrong: iterates over code units
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);  // 'A', '\uD83D', '\uDE00', 'B'
}

// Correct: iterates over code points
for (let char of str) {
  console.log(char);  // 'A', '😀', 'B'
}

// Also correct
[...str].forEach(char => console.log(char));  // 'A', '😀', 'B'
```

**5. String Methods and Unicode**

```javascript
// charAt (code unit, old way)
'😀'.charAt(0)      // '\uD83D' (half character)

// codePointAt (code point, ES6+)
'😀'.codePointAt(0) // 128512

// charCodeAt (code unit value)
'😀'.charCodeAt(0)  // 55357 (0xD83D, high surrogate)
'😀'.charCodeAt(1)  // 56832 (0xDE00, low surrogate)

// fromCharCode (creates string from code units)
String.fromCharCode(65)              // 'A'
String.fromCharCode(0xD83D, 0xDE00)  // '😀'

// fromCodePoint (creates string from code points, ES6+)
String.fromCodePoint(128512)         // '😀'
String.fromCodePoint(0x1F600)        // '😀'

// normalize (canonical equivalence)
let e1 = 'é';      // Precomposed (U+00E9)
let e2 = 'é';      // Decomposed (U+0065 U+0301)
e1 === e2          // false
e1.normalize() === e2.normalize()  // true

// Normalization forms
'é'.normalize('NFC')   // Canonical composition
'é'.normalize('NFD')   // Canonical decomposition
'é'.normalize('NFKC')  // Compatibility composition
'é'.normalize('NFKD')  // Compatibility decomposition
```

**6. Regular Expressions and Unicode**

```javascript
// Without 'u' flag: operates on code units
/^.$/.test('😀')           // false (. matches one code unit)
/^..$/.test('😀')          // true (matches both surrogates)

// With 'u' flag: operates on code points (ES6+)
/^.$/u.test('😀')          // true
/^..$/u.test('😀')         // false

// Unicode property escapes (ES2018+)
/\p{Emoji}/u.test('😀')    // true
/\p{Script=Greek}/u.test('α')  // true
/\p{Letter}/u.test('A')    // true
/\p{Number}/u.test('5')    // true
/\p{Currency}/u.test('$')  // true

// Case-insensitive with Unicode
/\u{1F600}/ui.test('😀')   // true
```

**7. Surrogate Pairs**

JavaScript uses UTF-16, which uses **surrogate pairs** for code points > U+FFFF:

```javascript
// High surrogate: 0xD800-0xDBFF
// Low surrogate: 0xDC00-0xDFFF

// Formula for surrogate pairs:
// Code point = (high - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000

let emoji = '😀';  // U+1F600
emoji.charCodeAt(0).toString(16)  // 'd83d' (high surrogate)
emoji.charCodeAt(1).toString(16)  // 'de00' (low surrogate)

// Verify:
// (0xD83D - 0xD800) * 0x400 + (0xDE00 - 0xDC00) + 0x10000
// = 0x3D * 0x400 + 0x200 + 0x10000
// = 0xF400 + 0x200 + 0x10000
// = 0x1F600 ✓

// Detecting surrogates
function isHighSurrogate(code) {
  return code >= 0xD800 && code <= 0xDBFF;
}

function isLowSurrogate(code) {
  return code >= 0xDC00 && code <= 0xDFFF;
}
```

**8. Grapheme Clusters**

A **grapheme cluster** is what users perceive as a single character. It can be multiple code points:

```javascript
// Single code point
'A'.length              // 1

// Combining characters
'é'.length              // 2 (e + combining acute)
'👨‍👩‍👧‍👦'.length        // 11 (family emoji with ZWJ)

// Emoji with modifiers
'👍🏽'.length            // 4 (thumbs up + skin tone modifier)

// Counting graphemes requires a library (e.g., Intl.Segmenter)
let segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
let segments = segmenter.segment('👨‍👩‍👧‍👦');
[...segments].length    // 1 (one grapheme cluster)
```

**9. Source Code Encoding**

JavaScript source files should be UTF-8 encoded:

```javascript
// These work if file is UTF-8
let message = "Hello, 世界";
let greeting = "Привет";
let emoji = "😀";

// Can also use escape sequences
let message = "Hello, \u4E16\u754C";  // Same as "Hello, 世界"
```

**10. JSON and Unicode**

JSON requires strings to be Unicode:

```javascript
// JSON allows Unicode escape sequences
let json = '{"emoji": "\\uD83D\\uDE00"}';
JSON.parse(json)  // { emoji: '😀' }

// JSON.stringify escapes non-ASCII by default
JSON.stringify({ emoji: '😀' })  // '{"emoji":"😀"}'

// Can force ASCII-only output
JSON.stringify({ emoji: '😀' }).replace(/[\u007F-\uFFFF]/g, char =>
  '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
)  // '{"emoji":"\\ud83d\\ude00"}'
```

#### **Best Practices:**

1. **Use code point escapes** (`\u{...}`) for clarity
2. **Use `for...of`** or spread to iterate over strings with non-BMP characters
3. **Use `.codePointAt()`** instead of `.charCodeAt()`
4. **Use `String.fromCodePoint()`** instead of `String.fromCharCode()`
5. **Use the `u` flag** in regex when working with Unicode
6. **Normalize strings** when comparing user input
7. **Be aware** that `.length` counts code units, not characters
8. **Use `Intl.Segmenter`** for accurate grapheme counting (ES2022+)
9. **Test with emoji** and non-BMP characters
10. **Ensure files are UTF-8 encoded**

---

### 1.1.8 Strict Mode

**Strict mode** is a way to opt into a restricted variant of JavaScript, which:

- Eliminates some silent errors (throws errors instead)
- Fixes mistakes that make optimization difficult
- Prohibits syntax likely to be defined in future ECMAScript versions

#### **Enabling Strict Mode:**

**1. Global Strict Mode (entire script)**

```javascript
"use strict";

// All code after this is in strict mode
let x = 10;
delete x;  // SyntaxError in strict mode
```

**2. Function-Level Strict Mode**

```javascript
function strictFunc() {
  "use strict";
  // Only this function is in strict mode
  let x = 10;
  delete x;  // SyntaxError
}

function normalFunc() {
  // This function is in sloppy mode
  let x = 10;
  delete x;  // Silent failure (returns false)
}
```

**3. Module Strict Mode (ES6+ modules)**

```javascript
// ES6 modules are ALWAYS in strict mode (automatic)
export function myFunc() {
  // Already in strict mode, no need for "use strict"
}
```

**4. Class Strict Mode**

```javascript
// Class bodies are ALWAYS in strict mode (automatic)
class MyClass {
  constructor() {
    // Already in strict mode
  }
}
```

#### **Strict Mode Changes:**

**1. Assignment to Undeclared Variables**

```javascript
// Sloppy mode
x = 10;  // Creates global variable (accidental)

// Strict mode
"use strict";
x = 10;  // ReferenceError: x is not defined
```

**2. Deleting Variables**

```javascript
// Sloppy mode
let x = 10;
delete x;  // Returns false, does nothing

// Strict mode
"use strict";
let x = 10;
delete x;  // SyntaxError
```

**3. Deleting Non-Configurable Properties**

```javascript
// Sloppy mode
delete Object.prototype;  // Returns false, silent failure

// Strict mode
"use strict";
delete Object.prototype;  // TypeError
```

**4. Duplicate Parameter Names**

```javascript
// Sloppy mode
function f(a, a, b) {  // Second 'a' shadows first
  return a;
}
f(1, 2, 3);  // Returns 2

// Strict mode
"use strict";
function f(a, a, b) {  // SyntaxError: Duplicate parameter name
  return a;
}
```

**5. Octal Literals**

```javascript
// Sloppy mode
let x = 0123;  // Octal: 83 in decimal (confusing)

// Strict mode
"use strict";
let x = 0123;  // SyntaxError
let y = 0o123; // OK: explicit octal prefix
```

**6. Octal Escape Sequences**

```javascript
// Sloppy mode
let s = "\251";  // Octal escape: ©

// Strict mode
"use strict";
let s = "\251";  // SyntaxError
let t = "\xA9";  // OK: hex escape
```

**7. Assignment to Read-Only Properties**

```javascript
// Sloppy mode
let obj = {};
Object.defineProperty(obj, 'x', { value: 10, writable: false });
obj.x = 20;  // Silent failure

// Strict mode
"use strict";
let obj = {};
Object.defineProperty(obj, 'x', { value: 10, writable: false });
obj.x = 20;  // TypeError: Cannot assign to read only property
```

**8. Assignment to Getter-Only Properties**

```javascript
// Sloppy mode
let obj = {
  get x() { return 10; }
};
obj.x = 20;  // Silent failure

// Strict mode
"use strict";
let obj = {
  get x() { return 10; }
};
obj.x = 20;  // TypeError: Cannot set property x
```

**9. Adding Properties to Non-Extensible Objects**

```javascript
// Sloppy mode
let obj = {};
Object.preventExtensions(obj);
obj.newProp = 10;  // Silent failure

// Strict mode
"use strict";
let obj = {};
Object.preventExtensions(obj);
obj.newProp = 10;  // TypeError: Cannot add property
```

**10. `this` in Functions**

```javascript
// Sloppy mode
function f() {
  console.log(this);  // Global object (window in browsers)
}
f();

// Strict mode
"use strict";
function f() {
  console.log(this);  // undefined
}
f();

// Method calls: 'this' works the same in both modes
let obj = {
  method() {
    console.log(this);  // obj in both modes
  }
};
obj.method();
```

**11. `arguments` and Parameters**

```javascript
// Sloppy mode
function f(x) {
  x = 10;
  console.log(arguments[0]);  // 10 (arguments tracks parameter)
}
f(5);

// Strict mode
"use strict";
function f(x) {
  x = 10;
  console.log(arguments[0]);  // 5 (arguments doesn't track)
}
f(5);
```

**12. `arguments.callee` and `arguments.caller`**

```javascript
// Sloppy mode
function f() {
  console.log(arguments.callee);  // The function itself
}
f();

// Strict mode
"use strict";
function f() {
  console.log(arguments.callee);  // TypeError
}
f();
```

**13. `function.caller` and `function.arguments`**

```javascript
// Sloppy mode
function f() {
  console.log(f.caller);     // Calling function
  console.log(f.arguments);  // Arguments object
}

// Strict mode
"use strict";
function f() {
  console.log(f.caller);     // TypeError
  console.log(f.arguments);  // TypeError
}
```

**14. Reserved Words as Identifiers**

```javascript
// Sloppy mode
let let = 5;           // OK (confusing)
let implements = {};   // OK

// Strict mode
"use strict";
let let = 5;           // SyntaxError
let implements = {};   // SyntaxError
let public = true;     // SyntaxError
let static = 10;       // SyntaxError
```

**15. `with` Statement**

```javascript
// Sloppy mode
let obj = { x: 10 };
with (obj) {
  console.log(x);  // 10
}

// Strict mode
"use strict";
with (obj) {  // SyntaxError: with not allowed
  console.log(x);
}
```

**16. `eval` Scope**

```javascript
// Sloppy mode
eval("var x = 10");
console.log(x);  // 10 (eval creates variable in surrounding scope)

// Strict mode
"use strict";
eval("var x = 10");
console.log(x);  // ReferenceError (eval has its own scope)
```

**17. `eval` and `arguments` as Identifiers**

```javascript
// Sloppy mode
let eval = 10;        // OK (bad idea)
let arguments = 20;   // OK (bad idea)

// Strict mode
"use strict";
let eval = 10;        // SyntaxError
let arguments = 20;   // SyntaxError
function f(eval) {}   // SyntaxError
```

#### **Complete Strict Mode Rules Summary:**

|Behavior|Sloppy Mode|Strict Mode|
|---|---|---|
|Undeclared assignment|Creates global|ReferenceError|
|Delete variable|Silent fail|SyntaxError|
|Delete non-configurable|Silent fail|TypeError|
|Duplicate parameters|Allowed|SyntaxError|
|Octal literals (`0123`)|Allowed|SyntaxError|
|Octal escapes (`\251`)|Allowed|SyntaxError|
|Read-only assignment|Silent fail|TypeError|
|Getter-only assignment|Silent fail|TypeError|
|Non-extensible assignment|Silent fail|TypeError|
|`this` in function|Global object|`undefined`|
|`arguments` tracking|Tracks params|Doesn't track|
|`arguments.callee`|Allowed|TypeError|
|`arguments.caller`|Allowed|TypeError|
|`function.caller`|Allowed|TypeError|
|`function.arguments`|Allowed|TypeError|
|Future reserved words|Allowed|SyntaxError|
|`with` statement|Allowed|SyntaxError|
|`eval` scope|Leaks to parent|Own scope|
|`eval` as identifier|Allowed|SyntaxError|
|`arguments` as identifier|Allowed|SyntaxError|

#### **When to Use Strict Mode:**

**Always use strict mode:**

- In all new code
- In ES6 modules (automatic)
- In classes (automatic)
- When using modern tooling (transpilers enforce it)

**Be careful with strict mode:**

- When concatenating files (one "use strict" affects all)
- In browser console (may not support strict mode commands)
- With legacy code that depends on sloppy mode

**Mixing strict and sloppy:**

```javascript
// file1.js (strict)
"use strict";
function strictFunc() { }

// file2.js (sloppy)
function sloppyFunc() { }

// If concatenated:
// "use strict";  <-- applies to both files!
// function strictFunc() { }
// function sloppyFunc() { }  <-- now also strict!
```

**Solution: Use IIFE or modules**

```javascript
// file1.js
(function() {
  "use strict";
  function strictFunc() { }
})();

// file2.js
(function() {
  function sloppyFunc() { }
})();
```

Or use ES6 modules (always strict).

#### **Best Practices:**

1. **Always use strict mode** in new code
2. **Use ES6 modules** (automatic strict mode)
3. **Use linters** (ESLint enforces strict mode by default)
4. **Use build tools** that handle strict mode properly
5. **Test legacy code** before adding strict mode
6. **Educate team members** on strict mode benefits
7. **Use `"use strict"`** at function level if global is problematic

---

## 1.2 Variables and Declarations

### 1.2.1 `var`: Function-Scoped Declaration

### Basic Syntax and Semantics

`var` declares function-scoped variables. It's the oldest declaration keyword, predating ES6.

```javascript
var x;           // Declaration without initialization
var y = 10;      // Declaration with initialization
var a, b, c;     // Multiple declarations
var m = 1, n = 2, o = 3;  // Multiple declarations with initialization
```

**Key Characteristics:**

- Function-scoped (or globally scoped if outside any function)
- Hoisted to the top of its scope
- Can be re-declared in the same scope
- Creates property on global object when declared globally
- No Temporal Dead Zone

---

### Function Scoping Deep Dive

`var` declarations are scoped to the **nearest enclosing function**, not block:

```javascript
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x);  // 10 - accessible outside if block
}

// Block scoping doesn't apply
{
  var y = 20;
}
console.log(y);  // 20 - accessible outside block
```

**Why this matters:**

```javascript
function processUsers(users) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];  // 'user' is function-scoped
    // Process user
  }
  
  console.log(i);     // users.length (i leaked out of loop)
  console.log(user);  // last user (user leaked out of loop)
}
```

All `var` declarations in a function exist throughout the entire function, creating a single binding shared across all blocks.

---

### Global Scope Behavior

`var` at the top level creates a **property on the global object**:

**Browser Environment:**

```javascript
var globalVar = "test";
console.log(window.globalVar);     // "test"
console.log(globalThis.globalVar); // "test"

// These are identical
window.globalVar = "modified";
console.log(globalVar);  // "modified"
```

**Node.js Environment:**

```javascript
// Top-level in .js file (CommonJS)
var globalVar = "test";
console.log(global.globalVar);     // undefined (module scope!)
console.log(globalThis.globalVar); // undefined

// Only creates global property in REPL or non-module context
```

**Important distinction:** In Node.js modules, top-level `var` is module-scoped, not truly global. In browsers, it's always global.

---

### Hoisting Mechanics

Hoisting is often misunderstood. It's not that code is literally "moved" to the top—it's about how the JavaScript engine processes declarations during the compilation phase.

**What actually happens:**

```javascript
console.log(x);  // undefined (not ReferenceError!)
var x = 5;
console.log(x);  // 5
```

**Compilation phase:**

1. Engine scans for all `var` declarations
2. Creates bindings in the current execution context
3. Initializes all `var` bindings to `undefined`
4. Executes code line by line

**Conceptual transformation:**

```javascript
var x;           // Declaration hoisted and initialized to undefined
console.log(x);  // undefined
x = 5;           // Assignment stays in place
console.log(x);  // 5
```

**Complex hoisting example:**

```javascript
var x = 'outer';

function test() {
  console.log(x);  // undefined (not 'outer'!)
  var x = 'inner';
  console.log(x);  // 'inner'
}

test();
```

**Why `undefined` not `'outer'`?**

The `var x` inside `test()` is hoisted to the top of the function, creating a local binding that shadows the outer `x`. Before assignment, it's `undefined`.

**Conceptual transformation:**

```javascript
var x = 'outer';

function test() {
  var x;           // Hoisted, initialized to undefined
  console.log(x);  // undefined
  x = 'inner';
  console.log(x);  // 'inner'
}

test();
```

---

### Re-declaration Semantics

`var` allows re-declaration in the same scope:

```javascript
var x = 10;
var x = 20;  // No error, x is now 20
var x;       // No error, x remains 20 (no re-initialization)

console.log(x);  // 20
```

**With initialization:**

```javascript
var count = 1;
var count = 2;     // Overwrites
console.log(count); // 2
```

**Without re-initialization:**

```javascript
var count = 1;
var count;         // Doesn't reset to undefined
console.log(count); // Still 1
```

**Why this is dangerous:**

```javascript
// File 1
var config = { apiUrl: "https://api.example.com" };

// File 2 (concatenated or loaded later)
var config = { timeout: 5000 };  // Whoops! Overwrote config

// Result: original config lost
console.log(config);  // { timeout: 5000 }
```

This silent overwrites are why `var` is problematic in large codebases.

---

### The Classic Loop Problem

One of `var`'s most infamous issues:

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}

// Output: 3, 3, 3 (not 0, 1, 2)
```

**Why?**

1. `var i` is function-scoped (or global-scoped here)
2. Only **one** `i` variable exists
3. Loop completes immediately, setting `i` to 3
4. Timeouts execute 100ms later
5. All three closures reference the same `i`, which is now 3

**Visual representation:**

```javascript
var i;  // Single variable hoisted to top

i = 0;  // First iteration
setTimeout(function() { console.log(i); }, 100);  // Captures reference to i

i = 1;  // Second iteration
setTimeout(function() { console.log(i); }, 100);  // Captures same i

i = 2;  // Third iteration
setTimeout(function() { console.log(i); }, 100);  // Captures same i

i = 3;  // Loop terminates, i is now 3

// 100ms later, all three functions execute
// They all reference the same i, which is 3
```

**ES5 solution (IIFE):**

```javascript
for (var i = 0; i < 3; i++) {
  (function(j) {  // Create new scope with parameter
    setTimeout(function() {
      console.log(j);
    }, 100);
  })(i);  // Pass current i value
}

// Output: 0, 1, 2
```

Each IIFE creates a new scope with its own `j` parameter.

**ES6 solution (just use `let`):**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}

// Output: 0, 1, 2
```

---

### 1.2.2 `let`: Block-Scoped Declaration

### Basic Syntax and Semantics

`let` declares block-scoped variables with proper temporal semantics:

```javascript
let x;           // Declaration without initialization (x is undefined)
let y = 10;      // Declaration with initialization
let a, b, c;     // Multiple declarations
let m = 1, n = 2;  // Multiple declarations with initialization
```

**Key Characteristics:**

- Block-scoped
- Hoisted but not initialized (TDZ)
- Cannot be re-declared in the same scope
- Does not create global object property
- Temporal Dead Zone applies

---

### Block Scoping

`let` creates bindings that exist only within the nearest enclosing block `{}`:

```javascript
{
  let x = 10;
  console.log(x);  // 10
}
console.log(x);  // ReferenceError: x is not defined
```

**All blocks create scope:**

```javascript
// If blocks
if (true) {
  let x = 1;
}
console.log(x);  // ReferenceError

// For blocks
for (let i = 0; i < 3; i++) {
  let x = i;
}
console.log(i);  // ReferenceError
console.log(x);  // ReferenceError

// While blocks
while (false) {
  let x = 1;
}
console.log(x);  // ReferenceError

// Standalone blocks
{
  let x = 1;
  {
    let x = 2;  // Different variable (shadowing)
    console.log(x);  // 2
  }
  console.log(x);  // 1
}
```

**Function parameters and body:**

```javascript
function example(x) {  // Parameter x
  let y = 10;          // Local y
  
  if (true) {
    let x = 20;        // Different x, shadows parameter
    let y = 30;        // Different y, shadows outer let
    console.log(x, y); // 20, 30
  }
  
  console.log(x, y);   // (parameter value), 10
}
```

---

### Hoisting and the Temporal Dead Zone (TDZ)

`let` declarations **are hoisted** to the top of their block, but unlike `var`, they are **not initialized**. Accessing them before the declaration line results in a `ReferenceError`.

**The Temporal Dead Zone:**

```javascript
{
  // TDZ starts for x
  console.log(x);  // ReferenceError: Cannot access 'x' before initialization
  // TDZ continues
  let x = 10;      // TDZ ends for x
  console.log(x);  // 10
}
```

**Why it's called "Temporal":**

The dead zone is **temporal** (time-based), not spatial (location-based). It starts when the scope is entered and ends when the declaration is encountered during execution:

```javascript
{
  const getValue = () => x;  // Captures x (but doesn't execute yet)
  
  // getValue() here would throw ReferenceError
  
  let x = 10;  // TDZ ends
  
  console.log(getValue());  // 10 - now safe to call
}
```

**TDZ with `typeof`:**

Before ES6, `typeof` was "safe" for undeclared variables:

```javascript
console.log(typeof undeclaredVariable);  // "undefined" (no error)
```

With TDZ, this safety is lost:

```javascript
console.log(typeof x);  // ReferenceError (x is in TDZ)
let x;
```

But for truly undeclared variables, `typeof` still works:

```javascript
console.log(typeof completelyUndeclared);  // "undefined"
```

**Why TDZ exists:**

1. **Catch errors early**: Forces declarations before use
2. **Prevent `undefined` bugs**: `var`'s initialization to `undefined` masked bugs
3. **Const semantics**: `const` needs TDZ for consistency (can't initialize to `undefined`)
4. **Spec alignment**: Matches other languages' behavior

---

### No Re-declaration

`let` forbids re-declaration in the same scope:

```javascript
let x = 10;
let x = 20;  // SyntaxError: Identifier 'x' has already been declared
```

This applies even if one is `var`:

```javascript
var x = 10;
let x = 20;  // SyntaxError

let y = 10;
var y = 20;  // SyntaxError
```

**But shadowing is allowed:**

```javascript
let x = 1;
{
  let x = 2;  // Different scope, different variable
  console.log(x);  // 2
}
console.log(x);  // 1
```

**Cannot shadow in the same block:**

```javascript
let x = 1;
let x = 2;  // SyntaxError
```

**Function parameters and scope:**

```javascript
function f(x) {
  let x = 10;  // SyntaxError: x already declared (as parameter)
}

function g(x) {
  {
    let x = 10;  // OK: different scope
  }
}
```

---

### Loop Behavior and Per-Iteration Bindings

With `let`, each loop iteration creates a **new binding**:

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// Output: 0, 1, 2
```

**What happens internally:**

```javascript
// Conceptually transformed to:
{
  let i = 0;
  {
    let i_0 = i;  // Iteration 0
    setTimeout(() => console.log(i_0), 100);
  }
  i++;
  {
    let i_1 = i;  // Iteration 1
    setTimeout(() => console.log(i_1), 100);
  }
  i++;
  {
    let i_2 = i;  // Iteration 2
    setTimeout(() => console.log(i_2), 100);
  }
  i++;
}
```

Each iteration gets its own `i` binding.

**`for...in` and `for...of`:**

```javascript
const arr = ['a', 'b', 'c'];

for (let value of arr) {
  setTimeout(() => console.log(value), 100);
}

// Output: a, b, c (each iteration has its own binding)
```

**`for` loop with closures:**

```javascript
const funcs = [];

for (let i = 0; i < 3; i++) {
  funcs.push(() => i);
}

console.log(funcs[0]());  // 0
console.log(funcs[1]());  // 1
console.log(funcs[2]());  // 2
```

Compare with `var`:

```javascript
const funcs = [];

for (var i = 0; i < 3; i++) {
  funcs.push(() => i);
}

console.log(funcs[0]());  // 3
console.log(funcs[1]());  // 3
console.log(funcs[2]());  // 3
```

---

### Global Scope Behavior

`let` at the global level does **not** create a property on the global object:

```javascript
let globalLet = "test";

console.log(window.globalLet);     // undefined (browsers)
console.log(global.globalLet);     // undefined (Node.js)
console.log(globalThis.globalLet); // undefined
console.log(globalLet);            // "test" (variable exists)
```

Global `let` and `const` exist in a separate **global lexical environment**, distinct from the global object's properties.

**Contrast with `var`:**

```javascript
var globalVar = "test";
console.log(window.globalVar);  // "test"

let globalLet = "test";
console.log(window.globalLet);  // undefined
```

---

### 1.2.3 `const`: Immutable Binding

### Basic Syntax and Semantics

`const` declares block-scoped constants—variables with an **immutable binding**:

```javascript
const PI = 3.14159;
const MAX_SIZE = 100;
const config = { apiUrl: "https://api.example.com" };
```

**Key Characteristics:**

- Block-scoped (same as `let`)
- Hoisted but not initialized (TDZ, same as `let`)
- Cannot be re-declared (same as `let`)
- **Must be initialized at declaration**
- **Binding is immutable** (cannot reassign)
- **Value is not necessarily immutable** (objects/arrays can be mutated)

---

### Immutable Binding vs Immutable Value

**Critical distinction:** `const` creates an **immutable binding**, not an immutable value.

**Primitives (immutable binding = immutable value):**

```javascript
const x = 10;
x = 20;  // TypeError: Assignment to constant variable
```

**Objects (immutable binding ≠ immutable value):**

```javascript
const obj = { count: 0 };

// Cannot reassign the binding
obj = { count: 1 };  // TypeError: Assignment to constant variable

// But can mutate the object
obj.count = 1;       // OK
obj.newProp = "hi";  // OK
delete obj.count;    // OK

console.log(obj);    // { newProp: "hi" }
```

**Arrays:**

```javascript
const arr = [1, 2, 3];

// Cannot reassign
arr = [4, 5, 6];     // TypeError

// But can mutate
arr.push(4);         // OK
arr[0] = 99;         // OK
arr.length = 0;      // OK (empties array)

console.log(arr);    // []
```

**Why this design?**

JavaScript uses **reference semantics** for objects. The `const` binding holds a **reference** to the object. That reference cannot change, but the object it points to can be modified.

```javascript
const obj = { x: 1 };
// obj → Memory Address 0x1234 → { x: 1 }

obj.x = 2;
// obj → Memory Address 0x1234 → { x: 2 }  (same reference, mutated object)

obj = { x: 3 };  // TypeError
// Trying to change: obj → Memory Address 0x5678  (different reference)
```

---

### Initialization Required

`const` **must** be initialized at declaration:

```javascript
const x;  // SyntaxError: Missing initializer in const declaration

const y = 10;  // OK
```

**Why?**

Since `const` bindings cannot be reassigned, failing to initialize would create an unusable variable:

```javascript
const x;  // If this were allowed, x would be undefined forever
x = 10;   // Cannot assign to const
```

---

### Object Immutability with `Object.freeze()`

To make an object's properties immutable, use `Object.freeze()`:

```javascript
const obj = Object.freeze({ x: 1, y: 2 });

obj.x = 10;        // Silently fails (non-strict) or TypeError (strict)
obj.z = 3;         // Silently fails or TypeError
delete obj.x;      // Silently fails or TypeError

console.log(obj);  // { x: 1, y: 2 }
```

**Strict mode enforcement:**

```javascript
"use strict";

const obj = Object.freeze({ x: 1 });
obj.x = 10;  // TypeError: Cannot assign to read only property 'x'
```

**Shallow freeze:**

`Object.freeze()` is **shallow**—nested objects are not frozen:

```javascript
const obj = Object.freeze({
  x: 1,
  nested: { y: 2 }
});

obj.x = 10;           // TypeError
obj.nested.y = 20;    // OK (nested object not frozen)
obj.nested.z = 30;    // OK

console.log(obj);     // { x: 1, nested: { y: 20, z: 30 } }
```

**Deep freeze:**

```javascript
function deepFreeze(obj) {
  Object.freeze(obj);
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null
        && (typeof obj[prop] === "object" || typeof obj[prop] === "function")
        && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  
  return obj;
}

const obj = deepFreeze({
  x: 1,
  nested: { y: 2 }
});

obj.nested.y = 20;  // TypeError (now frozen)
```

**Alternative: Immutable libraries**

For complex immutability needs, use libraries like:

- Immutable.js
- Immer
- seamless-immutable

---

### Scoping, Hoisting, and TDZ

`const` follows the same rules as `let`:

**Block-scoped:**

```javascript
{
  const x = 10;
}
console.log(x);  // ReferenceError
```

**Hoisted with TDZ:**

```javascript
{
  console.log(MAX);  // ReferenceError: Cannot access 'MAX' before initialization
  const MAX = 100;
}
```

**No re-declaration:**

```javascript
const x = 10;
const x = 20;  // SyntaxError
```

**No global object property:**

```javascript
const globalConst = "test";
console.log(window.globalConst);  // undefined
```

---

### 1.2.4 Hoisting Deep Dive

### What is Hoisting?

Hoisting is a **mental model** for understanding how JavaScript's engine processes variable and function declarations during the **compilation phase** before execution.

**Two phases of JavaScript execution:**

1. **Compilation (Creation) Phase:**
    - Scan code for declarations
    - Create bindings in execution context
    - Initialize `var` and function declarations
    - Create bindings (but don't initialize) for `let`, `const`, `class`
2. **Execution Phase:**
    - Execute code line by line
    - Assign values to variables
    - Call functions

---

### `var` Hoisting

**Source code:**

```javascript
console.log(x);  // undefined
var x = 5;
console.log(x);  // 5
```

**Compilation phase:**

1. Scan finds `var x`
2. Create binding `x` in function scope (or global scope)
3. Initialize `x` to `undefined`

**Execution phase:**

1. `console.log(x)` → prints `undefined`
2. `x = 5` → assigns 5 to `x`
3. `console.log(x)` → prints `5`

**Conceptual transformation:**

```javascript
var x;           // Hoisted: declaration + initialization to undefined
console.log(x);  // undefined
x = 5;           // Assignment stays in place
console.log(x);  // 5
```

---

### `let` and `const` Hoisting

`let` and `const` **are hoisted**, but unlike `var`, they are **not initialized**. This creates the TDZ.

**Source code:**

```javascript
console.log(x);  // ReferenceError
let x = 5;
console.log(x);  // 5
```

**Compilation phase:**

1. Scan finds `let x`
2. Create binding `x` in block scope
3. **Do not initialize** (TDZ begins)

**Execution phase:**

1. `console.log(x)` → `x` is in TDZ → ReferenceError
2. `let x = 5` → initialize `x` to `5` (TDZ ends)
3. `console.log(x)` → prints `5`

**Proof that `let` is hoisted:**

```javascript
let x = 'outer';

{
  console.log(x);  // ReferenceError (not 'outer')
  let x = 'inner';
}
```

If `let x` were not hoisted, `console.log(x)` would print `'outer'`. Instead, it throws ReferenceError because the inner `let x` is hoisted to the top of the block, creating a TDZ.

---

### Function Hoisting

**Function declarations are fully hoisted:**

```javascript
greet();  // "Hello"

function greet() {
  console.log("Hello");
}
```

**Compilation phase:**

1. Scan finds `function greet() {...}`
2. Create binding `greet` in function scope
3. Initialize `greet` to the function object

**Function expressions follow variable hoisting rules:**

```javascript
greet();  // TypeError: greet is not a function

var greet = function() {
  console.log("Hello");
};
```

The `var greet` is hoisted and initialized to `undefined`. Calling `greet()` tries to invoke `undefined`, causing a TypeError.

**With `let` or `const`:**

```javascript
greet();  // ReferenceError

let greet = function() {
  console.log("Hello");
};
```

---

### Variable vs Function Hoisting Priority

**When both variable and function have the same name:**

```javascript
console.log(typeof foo);  // "function"

var foo = "variable";

function foo() {
  console.log("function");
}

console.log(typeof foo);  // "string"
```

**Compilation phase:**

1. `var foo` creates binding `foo`, initializes to `undefined`
2. `function foo() {}` creates binding `foo`, initializes to function
3. **Function wins** (overwrites the `undefined`)

**Execution phase:**

1. `console.log(typeof foo)` → `"function"`
2. `foo = "variable"` → reassigns `foo` to `"variable"`
3. `console.log(typeof foo)` → `"string"`

**Function declarations take precedence over variable declarations during hoisting.**

---

### Hoisting in Different Scopes

**Global scope:**

```javascript
var globalVar = 1;
let globalLet = 2;
const globalConst = 3;

function globalFunc() {}
```

All hoisted to global scope, but:

- `var globalVar` creates property on global object
- `let globalLet` and `const globalConst` exist in global lexical environment
- `function globalFunc` creates property on global object

**Function scope:**

```javascript
function example() {
  var functionVar = 1;
  let functionLet = 2;
  const functionConst = 3;
  
  function nestedFunc() {}
}
```

All hoisted to `example` function's scope.

**Block scope:**

```javascript
{
  var blockVar = 1;     // Hoisted to enclosing function scope (or global)
  let blockLet = 2;     // Hoisted to block scope
  const blockConst = 3; // Hoisted to block scope
}

console.log(blockVar);   // 1
console.log(blockLet);   // ReferenceError
console.log(blockConst); // ReferenceError
```

---

### 1.2.5 Temporal Dead Zone (TDZ) Deep Dive

### Definition

The **Temporal Dead Zone** is the period between entering a scope and the point where a `let` or `const` variable is declared and initialized. During this time, the variable exists but cannot be accessed.

**Temporal (time-based), not spatial (location-based):**

```javascript
{
  // TDZ for x starts (scope entered)
  const f = () => x;  // Captures x, but doesn't execute
  // TDZ continues
  let x = 10;         // TDZ ends (declaration reached)
  f();                // 10 - now safe
}
```

---

### TDZ Triggers

**Accessing variable before declaration:**

```javascript
{
  console.log(x);  // ReferenceError: Cannot access 'x' before initialization
  let x = 10;
}
```

**Using in expression:**

```javascript
{
  let x = x + 1;  // ReferenceError (right-side x is in TDZ)
}
```

**Function calls:**

```javascript
{
  function getValue() {
    return x;
  }
  
  getValue();  // ReferenceError (x in TDZ)
  let x = 10;
}
```

---

### TDZ and Default Parameters

Function parameters are evaluated **left-to-right**, and each parameter is in TDZ until it's initialized:

```javascript
function example(a = b, b = 2) {
  return [a, b];
}

example();  // ReferenceError: Cannot access 'b' before initialization
```

**Why?**

1. Evaluate `a = b`
2. `b` is in TDZ (not yet initialized)
3. ReferenceError

**Correct order:**

```javascript
function example(b = 2, a = b) {
  return [a, b];
}

example();  // [2, 2]
```

**More complex example:**

```javascript
function f(x = y, y = 10) {
  return x + y;
}

f();  // ReferenceError
```

```javascript
function f(y = 10, x = y) {
  return x + y;
}

f();  // 20
```

---

### TDZ and `typeof`

Before ES6, `typeof` was "safe" for undeclared variables:

```javascript
console.log(typeof undeclaredVariable);  // "undefined"
```

With TDZ, this safety is lost for `let` and `const`:

```javascript
{
  console.log(typeof x);  // ReferenceError
  let x = 10;
}
```

But for truly undeclared variables (not in TDZ), `typeof` still works:

```javascript
console.log(typeof completelyUndeclared);  // "undefined"
```

**Practical issue:**

```javascript
// Check if a variable exists
if (typeof myVar !== 'undefined') {
  // Use myVar
}

// If myVar is let/const in enclosing scope, this throws ReferenceError!
{
  if (typeof myVar !== 'undefined') {  // ReferenceError
    console.log(myVar);
  }
  let myVar = 10;
}
```

**Solution: Try-catch:**

```javascript
{
  let exists = false;
  try {
    myVar;
    exists = true;
  } catch (e) {
    exists = false;
  }
  
  let myVar = 10;
}
```

---

### TDZ in Closures

Closures capture variables, including their TDZ state:

```javascript
{
  const funcs = [];
  
  funcs.push(() => x);  // Captures x (in TDZ)
  
  // funcs[0]() would throw ReferenceError here
  
  let x = 10;  // TDZ ends
  
  funcs[0]();  // 10 - now safe
}
```

**Timing matters:**

```javascript
{
  let funcs = [];
  
  for (let i = 0; i < 3; i++) {
    funcs.push(() => arr[i]);  // Captures arr (in TDZ)
  }
  
  // funcs[0]() would throw ReferenceError here
  
  let arr = [10, 20, 30];  // TDZ ends
  
  console.log(funcs[0]());  // 10
  console.log(funcs[1]());  // 20
  console.log(funcs[2]());  // 30
}
```

---

### Why TDZ Exists

**1. Catch errors early:**

Forces developers to declare before use, preventing subtle bugs:

```javascript
// Without TDZ (var behavior)
console.log(config);  // undefined (misleading)
var config = loadConfig();

// With TDZ (let/const behavior)
console.log(config);  // ReferenceError (clear error)
let config = loadConfig();
```

**2. Prevent `undefined` pollution:**

`var`'s automatic initialization to `undefined` masked bugs:

```javascript
// var: bug not caught
function processUser() {
  console.log(user);  // undefined (should be error!)
  // ... lots of code ...
  var user = getUser();
}

// let: bug caught immediately
function processUser() {
  console.log(user);  // ReferenceError (caught early!)
  // ... lots of code ...
  let user = getUser();
}
```

**3. `const` semantics:**

`const` cannot be initialized to `undefined` then assigned later. TDZ makes `let` and `const` consistent:

```javascript
// Without TDZ, this would be problematic
const x;  // Initialize to undefined?
x = 10;   // Then assign? (violates const semantics)

// TDZ solves this: const must be initialized at declaration
const x = 10;  // OK
```

**4. Align with other languages:**

Most block-scoped languages (Java, C#, Rust) forbid use-before-declaration. TDZ aligns JavaScript with these expectations.

---

### 1.2.6 Global Variables and `globalThis`

### Global Scope Mechanics

JavaScript has **two types of global variables**:

1. **Global object properties** (created by `var` and function declarations)
2. **Global lexical environment bindings** (created by `let` and `const`)

**Browser example:**

```javascript
var varGlobal = 1;
let letGlobal = 2;
const constGlobal = 3;

console.log(window.varGlobal);    // 1 (property)
console.log(window.letGlobal);    // undefined (not a property)
console.log(window.constGlobal);  // undefined (not a property)

console.log(varGlobal);           // 1
console.log(letGlobal);           // 2
console.log(constGlobal);         // 3
```

**Why the distinction?**

ES6 needed backward compatibility with `var` (which creates global properties) while providing better behavior for `let` and `const` (which don't pollute the global object).

---

### The Global Object

The global object is environment-dependent:

- **Browsers:** `window` (also `self`, `frames`)
- **Web Workers:** `self`
- **Node.js (CommonJS):** `global`
- **Node.js (ES modules):** No global object at top level (module scope)

**Historical inconsistency:**

```javascript
// Browser
var global = window;

// Node.js
var global = global;  // Already exists

// Web Worker
var global = self;
```

---

### `globalThis`: Universal Global Access

ES2020 introduced `globalThis` as a **standardized way** to access the global object across all environments:

```javascript
// Works everywhere
console.log(globalThis);

// Browser
console.log(globalThis === window);  // true

// Node.js (REPL or non-module)
console.log(globalThis === global);  // true

// Web Worker
console.log(globalThis === self);    // true
```

**Before `globalThis`, you needed this monstrosity:**

```javascript
var getGlobal = function() {
  if (typeof self !== 'undefined') { return self; }
  if (typeof window !== 'undefined') { return window; }
  if (typeof global !== 'undefined') { return global; }
  throw new Error('unable to locate global object');
};

var globalObj = getGlobal();
```

**Now:**

```javascript
var globalObj = globalThis;
```

---

### Global Pollution

**Problem:**

Every global variable can be accidentally overwritten or conflict with other scripts:

```javascript
// Library A
var config = { theme: 'dark' };

// Library B (loaded later)
var config = { apiKey: '12345' };  // Whoops! Overwrote Library A's config

// Your code
console.log(config);  // { apiKey: '12345' } (Library A broken)
```

**Solutions:**

**1. Use modules (best):**

ES6 modules have their own scope:

```javascript
// moduleA.js
let config = { theme: 'dark' };
export { config };

// moduleB.js
let config = { apiKey: '12345' };
export { config };

// main.js
import { config as configA } from './moduleA.js';
import { config as configB } from './moduleB.js';
// No conflict!
```

**2. Use IIFE (ES5 pattern):**

```javascript
// Library A
(function() {
  var config = { theme: 'dark' };
  // Use config...
})();

// Library B
(function() {
  var config = { apiKey: '12345' };
  // Use config...
})();

// No conflict - each IIFE has its own scope
```

**3. Use namespaces:**

```javascript
var LibraryA = LibraryA || {};
LibraryA.config = { theme: 'dark' };

var LibraryB = LibraryB || {};
LibraryB.config = { apiKey: '12345' };

console.log(LibraryA.config);  // { theme: 'dark' }
console.log(LibraryB.config);  // { apiKey: '12345' }
```

**4. Use `let`/`const` instead of `var`:**

At least they don't create global object properties:

```javascript
let config = { theme: 'dark' };
// window.config is undefined (doesn't pollute global object)
```

---

### Global Variables Best Practices

1. **Minimize globals**: Use modules or IIFEs
2. **Never use `var` at global level**: Use `let` or `const`
3. **Use strict mode**: Prevents accidental global creation
4. **Use linters**: Catch undeclared variable assignments
5. **Prefix globals if necessary**: `APP_CONFIG` instead of `config`
6. **Use `Object.freeze()` for global constants:**

```javascript
const CONFIG = Object.freeze({
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000
});
```

**7. Check for conflicts before declaring:**

```javascript
if (typeof MyLibrary === 'undefined') {
  let MyLibrary = {};
}
```

---

### 1.2.7 Practical Guidelines

### When to Use Each Declaration

**Use `const` by default:**

- Values that won't be reassigned
- Object and array references (even if mutated)
- Function expressions
- Imported modules
- Configuration objects

```javascript
const API_URL = 'https://api.example.com';
const config = { timeout: 5000 };
const users = [];

const getUserById = (id) => users.find(u => u.id === id);

// Can mutate
config.timeout = 10000;
users.push({ id: 1, name: 'Alice' });
```

**Use `let` when reassignment is needed:**

- Loop counters
- Conditional assignments
- Accumulator variables
- State that changes

```javascript
let count = 0;
let result;

for (let i = 0; i < 10; i++) {
  count += i;
}

if (condition) {
  result = 'yes';
} else {
  result = 'no';
}
```

**Never use `var` in modern code:**

- Legacy code maintenance only
- No legitimate use cases in ES6+

---

### Common Patterns

**1. Loop iteration:**

```javascript
// Use let for traditional loops
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// Use const for for-of (no reassignment)
for (const item of arr) {
  console.log(item);
}

// Use const for for-in
for (const key in obj) {
  console.log(key, obj[key]);
}
```

**2. Destructuring:**

```javascript
// Prefer const
const { name, age } = user;
const [first, second] = arr;

// Use let if reassigning
let { count } = state;
count = count + 1;
```

**3. Conditional assignment:**

```javascript
let message;

if (condition) {
  message = 'yes';
} else {
  message = 'no';
}

// Better: use const with ternary
const message = condition ? 'yes' : 'no';
```

**4. Accumulation:**

```javascript
let sum = 0;
for (const num of numbers) {
  sum += num;
}

// Or use reduce
const sum = numbers.reduce((acc, num) => acc + num, 0);
```

**5. Configuration objects:**

```javascript
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

// Can mutate properties
config.timeout = 10000;

// Can't reassign
// config = {};  // TypeError
```

---

### 1.2.8 Edge Cases and Gotchas

### 1. Variable Shadowing

**Shadowing occurs when an inner scope declares a variable with the same name as an outer scope:**

```javascript
let x = 1;

{
  let x = 2;  // Shadows outer x
  console.log(x);  // 2
}

console.log(x);  // 1
```

**Shadowing is allowed across scopes:**

```javascript
let x = 1;

function f() {
  let x = 2;  // Shadows global x
  {
    let x = 3;  // Shadows function's x
    console.log(x);  // 3
  }
  console.log(x);  // 2
}

f();
console.log(x);  // 1
```

**But not in the same scope:**

```javascript
let x = 1;
let x = 2;  // SyntaxError
```

**Function parameters create bindings:**

```javascript
function f(x) {  // x is a parameter (binding)
  let x = 10;    // SyntaxError: x already declared
}

function g(x) {
  {
    let x = 10;  // OK: different scope
  }
}
```

---

### 2. Switch Statement Scope

**`switch` creates a single block scope for all cases:**

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

**Solution: Use explicit blocks:**

```javascript
switch (value) {
  case 1: {
    let x = 10;
    console.log(x);
    break;
  }
  case 2: {
    let x = 20;  // OK: different block
    console.log(x);
    break;
  }
}
```

---

### 3. Destructuring with `const`

**Each destructured binding is individually `const`:**

```javascript
const { x, y } = { x: 1, y: 2 };

x = 10;  // TypeError: Assignment to constant variable
y = 20;  // TypeError: Assignment to constant variable
```

**`undefined` values don't throw errors:**

```javascript
const { a, b } = { a: 1 };  // b is undefined, but no error
console.log(b);  // undefined (not ReferenceError)
```

**Default values:**

```javascript
const { a = 10, b = 20 } = { a: 1 };
console.log(a);  // 1
console.log(b);  // 20 (default)
```

---

### 4. Loop Variable Reassignment

**`for` loops with `const` in the loop body:**

```javascript
for (const item of arr) {
  // item is const, cannot reassign
  item = newValue;  // TypeError
}
```

**But new binding each iteration:**

```javascript
for (const item of ['a', 'b', 'c']) {
  // Each iteration has its own 'item' binding
  console.log(item);
}
// Output: a, b, c
```

**Traditional `for` loop:**

```javascript
// Cannot use const for counter (it needs to be reassigned)
for (const i = 0; i < 3; i++) {  // TypeError on i++
  console.log(i);
}

// Use let
for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

---

### 5. TDZ and Class Methods

```javascript
class Example {
  method() {
    return this.value;
  }
  
  value = this.method();  // ReferenceError: Cannot access 'method' before initialization
}
```

**Why?**

Class fields are initialized in declaration order. `value` is initialized before `method` is available.

**Solution:**

```javascript
class Example {
  constructor() {
    this.value = this.method();  // OK: constructor runs after class is fully initialized
  }
  
  method() {
    return 42;
  }
}
```

---

### 6. Closure Capture with `var` vs `let`

**`var` captures reference to single variable:**

```javascript
var funcs = [];

for (var i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}

console.log(funcs[0]());  // 3
console.log(funcs[1]());  // 3
console.log(funcs[2]());  // 3
```

**`let` creates new binding per iteration:**

```javascript
var funcs = [];

for (let i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}

console.log(funcs[0]());  // 0
console.log(funcs[1]());  // 1
console.log(funcs[2]());  // 2
```

---

### 7. Global Object vs Global Lexical Environment

**`var` creates property on global object:**

```javascript
var x = 10;
console.log(window.x);  // 10 (browsers)

delete window.x;  // true (can delete)
console.log(x);   // ReferenceError
```

**`let`/`const` in global lexical environment:**

```javascript
let x = 10;
console.log(window.x);  // undefined

delete window.x;  // true (but meaningless)
console.log(x);   // 10 (still exists)
```

---

### 8. Const with Object Methods

**`const` only prevents reassignment, not mutation:**

```javascript
const obj = {
  count: 0,
  increment() {
    this.count++;  // OK: mutating object
  }
};

obj.increment();
console.log(obj.count);  // 1

obj = { count: 10 };  // TypeError: cannot reassign
```

---

### 1.2.9 Performance Considerations

### Variable Lookup Performance

**Block-scoped variables (`let`, `const`) are generally faster:**

Modern JavaScript engines optimize block-scoped variables better because their lifetime is more predictable.

**Scope chain traversal:**

```javascript
var globalVar = 1;

function outer() {
  var outerVar = 2;
  
  function inner() {
    var innerVar = 3;
    
    // Accessing variables requires scope chain traversal
    console.log(innerVar);   // Fast: local scope
    console.log(outerVar);   // Slower: traverse 1 level
    console.log(globalVar);  // Slowest: traverse 2 levels
  }
  
  inner();
}
```

**Minimize global access:**

```javascript
// Slow: repeated global access
for (let i = 0; i < 1000; i++) {
  console.log(Math.random());  // Math is global, accessed 1000 times
}

// Faster: cache global reference
const { random } = Math;
for (let i = 0; i < 1000; i++) {
  console.log(random());  // Local reference, faster
}
```

---

### TDZ Overhead

**TDZ checks have minimal overhead:**

Modern engines optimize TDZ checks efficiently. The performance cost is negligible compared to the correctness benefits.

---

### Memory Considerations

**Closures and memory:**

```javascript
function createCounter() {
  let count = 0;  // Memory allocated
  
  return {
    increment() { count++; },
    getCount() { return count; }
  };
}

const counter = createCounter();  // 'count' stays in memory (closure)
```

**`var` vs `let`/`const` memory:**

No significant difference in memory usage. Block-scoped variables may be garbage collected sooner when leaving scope, but this is engine-dependent and rarely matters in practice.

---

### 1.2.10 Summary

### Declaration Comparison Table

|Feature|`var`|`let`|`const`|
|---|---|---|---|
|**Scope**|Function|Block|Block|
|**Hoisting**|Yes, initialized|Yes, TDZ|Yes, TDZ|
|**Re-declaration**|Allowed|Not allowed|Not allowed|
|**Reassignment**|Allowed|Allowed|Not allowed|
|**Initialization required**|No|No|Yes|
|**TDZ**|No|Yes|Yes|
|**Global object property**|Yes|No|No|
|**Per-iteration binding**|No (single binding)|Yes (new each time)|Yes (new each time)|

---

### Key Takeaways

1. **`const` is the default choice**: Use unless reassignment is needed
2. **`let` for reassignment**: Loop counters, conditional assignments
3. **Never use `var`**: Except in legacy code maintenance
4. **TDZ catches errors early**: Forces proper declaration ordering
5. **Block scoping is clearer**: Variables exist only where needed
6. **Hoisting still applies**: But differently for `var` vs `let`/`const`
7. **`const` ≠ immutable value**: Only the binding is immutable
8. **`globalThis` for global access**: Works across all environments
9. **Minimize global variables**: Use modules or IIFE patterns
10. **Each loop iteration gets new bindings with `let`**: Solves closure problems

---

### Modern Best Practices

```javascript
// Default to const
const MAX_RETRIES = 3;
const config = { timeout: 5000 };
const users = [];

// Use let when reassignment needed
let count = 0;
for (let i = 0; i < 10; i++) {
  count += i;
}

// Avoid var entirely
// var x = 10;  // DON'T

// Use const in for-of/for-in
for (const user of users) {
  console.log(user);
}

// Object mutation is fine with const
config.timeout = 10000;
users.push({ id: 1 });

// Use Object.freeze() for immutability
const CONSTANTS = Object.freeze({
  API_URL: 'https://api.example.com'
});
```

---

## 1.3 Data Types

### 1.3.1 Primitive vs Reference Types

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

### 1.3.2 Primitive Types

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

### 1.3.3 Reference Types (Objects)

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

### 1.3.4 Type Summary

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

## 1.4 Type System

### 1.4.1 Type Checking with `typeof`

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

### 1.4.2 Type Checking with `instanceof`

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

### 1.4.3 Type Coercion (Implicit Conversion)

### Why Coercion Causes Bugs

Type coercion is **automatic type conversion** performed by JavaScript. It's the source of infamous quirks like:

```javascript
[] + []      // "" (empty string!)
[] + {}      // "[object Object]"
{} + []      // 0 (or "[object Object]" depending on context)
"5" - 3      // 2 (number)
"5" + 3      // "53" (string!)
```

Understanding coercion rules prevents:
- Unexpected string concatenation instead of addition
- Silent NaN bugs from invalid conversions
- Confusing truthy/falsy behavior in conditionals

**The golden rule:** When in doubt, convert explicitly with `Number()`, `String()`, or `Boolean()`.

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

### 1.4.4 Type Conversion (Explicit)

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

### 1.4.5 Truthiness and Falsiness

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

### 1.4.6 Equality Operators

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

### 1.4.7 Type Conversion Cheatsheet

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

### 1.4.8 Summary

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

## 1.5 Operators

### 1.5.1 Arithmetic Operators

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

### 1.5.2 Assignment Operators

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

### 1.5.3 Comparison Operators

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

### 1.5.4 Logical Operators

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

### 1.5.5 Nullish Coalescing Operator (`??`)

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

### 1.5.6 Conditional (Ternary) Operator (`? :`)

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

### 1.5.7 Optional Chaining Operator (`?.`)

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

### 1.5.8 Bitwise Operators

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

### 1.5.9 Other Operators

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

### 1.5.10 Operator Precedence

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

### 1.5.11 Summary

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

## 1.6 Expressions and Statements

### 1.6.1 Expressions vs Statements

### Definitions

**Expression:**

- Produces a value
- Can be used anywhere a value is expected
- Examples: `5`, `x + 2`, `func()`, `a ? b : c`

**Statement:**

- Performs an action
- Cannot be used as a value
- Examples: `if`, `for`, `while`, `let x = 5;`

---

### Key Differences

```javascript
// Expression: produces value
5 + 3;              // Evaluates to 8
x = 10;             // Evaluates to 10 (and assigns)
user.getName();     // Evaluates to return value

// Statement: performs action
let x = 5;          // Declares variable (no value produced)
if (x > 0) { }      // Controls flow (no value)
while (true) { }    // Loop (no value)

// Expression statement: expression used as statement
5 + 3;              // Valid (but useless)
console.log("hi");  // Expression used as statement
```

**Where expressions can be used:**

```javascript
// Anywhere a value is expected
let x = 5 + 3;           // Right side of assignment
console.log(5 + 3);      // Function argument
arr[5 + 3];              // Array index
obj[5 + 3];              // Property access
(5 + 3) + 2;             // Part of larger expression
return 5 + 3;            // Return value
```

**Where statements can be used:**

```javascript
// At statement position
if (x > 0) { }           // Control flow
for (let i = 0; i < 10; i++) { }  // Loop
let x = 5;               // Declaration
```

---

### Expression Statements

Any expression can be used as a statement (though often pointless):

```javascript
// Valid expression statements
5;                  // Evaluates to 5 (discarded)
"hello";            // Evaluates to "hello" (discarded)
x + y;              // Evaluates (result discarded)
func();             // Calls function (side effects may occur)

// Common expression statements
console.log("hi");  // Function call
x = 5;              // Assignment
x++;                // Increment
arr.push(5);        // Method call
```

---

### 1.6.2 Primary Expressions

Primary expressions are the simplest expressions—literals and identifiers.

### Literals

**Primitive literals:**

```javascript
// Number
42
3.14
0xFF
0b1010
0o77
1e5
123n  // BigInt

// String
"hello"
'world'
`template`

// Boolean
true
false

// Null and undefined
null
undefined

// Regular expression
/pattern/flags
```

**Object literals:**

```javascript
{}
{ x: 1, y: 2 }
{ name: "Alice", age: 30 }

// Computed property names
{ [key]: value }
{ ["prop" + 1]: "value" }

// Method shorthand
{ method() { } }

// Getter/setter
{ get prop() { }, set prop(value) { } }
```

**Array literals:**

```javascript
[]
[1, 2, 3]
[1, , 3]  // Sparse (hole at index 1)
[...arr]  // Spread
```

**Function literals:**

```javascript
function() { }
function(x) { return x * 2; }
function name(x) { return x * 2; }

// Arrow functions
() => { }
x => x * 2
(x, y) => x + y
```

**Class literals:**

```javascript
class { }
class MyClass { }
class extends Parent { }
```

**Template literals:**

```javascript
`hello`
`hello ${name}`
`multi
line
string`

// Tagged template
tag`template`
```

---

### Identifiers

Variable, function, and property names:

```javascript
x
userName
_private
$jquery
Symbol.iterator
```

---

### Reserved Words as Property Names

**Allowed in object literals and member access:**

```javascript
let obj = {
  if: 1,
  while: 2,
  class: 3,
  return: 4
};

console.log(obj.if);      // 1
console.log(obj["if"]);   // 1

// But not as identifiers
let if = 5;  // SyntaxError
```

---

### 1.6.3 Left-Hand-Side Expressions

Expressions that can appear on the left side of an assignment.

### Property Access

**Dot notation:**

```javascript
obj.property
obj.method()
arr.length
```

**Bracket notation:**

```javascript
obj[property]
obj["property"]
arr[0]
arr[index]
obj[dynamicKey]
```

**Computed property access:**

```javascript
obj[key]
obj["prop" + suffix]
obj[func()]
```

---

### Function Calls

**Regular calls:**

```javascript
func()
func(arg1, arg2)
obj.method()
obj.method(arg1, arg2)
```

**Constructor calls:**

```javascript
new Constructor()
new Constructor(arg1, arg2)
new Date()
new Array(5)
```

**Optional chaining in calls:**

```javascript
func?.()              // Call if func is not nullish
obj.method?.()        // Call if method is not nullish
obj?.method()         // Access method if obj is not nullish
```

---

### `new` Expression

**With arguments:**

```javascript
new Constructor(arg1, arg2)
new Date()
new Array(5)
new Map()
```

**Without arguments:**

```javascript
new Constructor
new Date
new Array  // Same as new Array()
```

**Precedence matters:**

```javascript
new Constructor().method();    // (new Constructor()).method()
new Constructor.staticMethod(); // new (Constructor.staticMethod)()
```

---

### `super` Expression

**In class methods:**

```javascript
class Child extends Parent {
  constructor() {
    super();          // Call parent constructor
  }
  
  method() {
    super.method();   // Call parent method
  }
}
```

**In object literals:**

```javascript
let obj = {
  method() {
    super.method();  // Call method from prototype
  }
};
```

---

### `this` Expression

```javascript
this.property
this.method()

function f() {
  console.log(this);  // Depends on how f is called
}

// Method call
obj.f();  // this = obj

// Regular call
f();      // this = globalThis (sloppy) or undefined (strict)

// Constructor call
new f();  // this = new object

// Explicit binding
f.call(obj);   // this = obj
f.apply(obj);  // this = obj
f.bind(obj)(); // this = obj

// Arrow functions (lexical this)
const arrow = () => console.log(this);
```

---

### Import and Import.meta

**Import (static):**

```javascript
import { name } from "./module.js";
import * as ns from "./module.js";
import defaultExport from "./module.js";
```

**Dynamic import (expression):**

```javascript
import("./module.js").then(module => {
  // Use module
});

// In async function
const module = await import("./module.js");
```

**Import.meta:**

```javascript
import.meta.url;  // Current module URL
```

---

### 1.6.4 Expression Composition

### Binary Expressions

Operators with two operands:

```javascript
// Arithmetic
a + b
a - b
a * b
a / b
a % b
a ** b

// Comparison
a < b
a > b
a <= b
a >= b
a == b
a === b
a != b
a !== b

// Logical
a && b
a || b
a ?? b

// Bitwise
a & b
a | b
a ^ b
a << b
a >> b
a >>> b

// Relational
a in obj
a instanceof Constructor
```

---

### Unary Expressions

Operators with one operand:

```javascript
+x        // Numeric conversion
-x        // Negation
!x        // Logical NOT
~x        // Bitwise NOT
typeof x  // Type check
void x    // Returns undefined
delete x  // Delete property
++x       // Pre-increment
--x       // Pre-decrement
x++       // Post-increment
x--       // Post-decrement
await x   // Await promise (async context)
```

---

### Ternary Expression

Conditional operator (only ternary operator):

```javascript
condition ? trueValue : falseValue

x > 0 ? "positive" : "negative"

// Nested
x > 0 ? "positive" :
x < 0 ? "negative" : "zero"
```

---

### Comma Expression

Evaluates multiple expressions, returns last:

```javascript
(a, b, c)     // Evaluates a, b, c; returns c
(x++, y++, z++)  // Increments all; returns z++

// In for loop
for (i = 0, j = 10; i < j; i++, j--) { }
```

---

### Grouping Expression

Parentheses control evaluation order:

```javascript
(expression)

(2 + 3) * 4    // 20 (vs 2 + 3 * 4 = 14)
(a, b, c)      // Comma expression
(function() {})()  // IIFE
```

---

### 1.6.5 Declaration Statements

### Variable Declarations

**`var` declarations:**

```javascript
var x;
var y = 10;
var a, b, c;
var m = 1, n = 2;
```

**`let` declarations:**

```javascript
let x;
let y = 10;
let a, b, c;
let m = 1, n = 2;

// Block-scoped
{
  let blockVar = 5;
}
// blockVar not accessible here
```

**`const` declarations:**

```javascript
const PI = 3.14159;
const obj = { x: 1 };

// Must be initialized
const x;  // SyntaxError

// Cannot reassign
const y = 5;
y = 10;  // TypeError
```

---

### Function Declarations

**Named function:**

```javascript
function name(params) {
  // Body
}

function add(a, b) {
  return a + b;
}
```

**Generator function:**

```javascript
function* gen() {
  yield 1;
  yield 2;
}

const g = gen();
g.next();  // { value: 1, done: false }
```

**Async function:**

```javascript
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}
```

**Async generator:**

```javascript
async function* asyncGen() {
  yield await promise1;
  yield await promise2;
}
```

---

### Class Declarations

**Basic class:**

```javascript
class MyClass {
  constructor(x) {
    this.x = x;
  }
  
  method() {
    return this.x;
  }
}
```

**Class with inheritance:**

```javascript
class Child extends Parent {
  constructor(x, y) {
    super(x);
    this.y = y;
  }
  
  method() {
    return super.method() + this.y;
  }
}
```

---

### Import/Export Declarations

**Export:**

```javascript
export const value = 42;
export function func() { }
export class MyClass { }

export { name1, name2 };
export { name1 as alias };

export default value;
export default function() { }
export default class { }
```

**Import:**

```javascript
import { name } from "./module.js";
import { name as alias } from "./module.js";
import * as ns from "./module.js";
import defaultExport from "./module.js";
import defaultExport, { name } from "./module.js";
```

---

### 1.6.6 Control Flow Statements

### `if` Statement

**Basic:**

```javascript
if (condition) {
  // Execute if true
}

if (x > 0) {
  console.log("positive");
}
```

**With `else`:**

```javascript
if (condition) {
  // Execute if true
} else {
  // Execute if false
}

if (x > 0) {
  console.log("positive");
} else {
  console.log("not positive");
}
```

**With `else if`:**

```javascript
if (condition1) {
  // Execute if condition1 is true
} else if (condition2) {
  // Execute if condition2 is true
} else {
  // Execute if all false
}

if (x > 0) {
  console.log("positive");
} else if (x < 0) {
  console.log("negative");
} else {
  console.log("zero");
}
```

**Without braces (single statement):**

```javascript
if (x > 0) console.log("positive");

if (x > 0)
  console.log("positive");
else
  console.log("not positive");

// Dangling else problem
if (x > 0)
  if (y > 0)
    console.log("both positive");
else  // Binds to inner if!
  console.log("x positive, y not");

// Use braces for clarity
if (x > 0) {
  if (y > 0) {
    console.log("both positive");
  }
} else {
  console.log("x not positive");
}
```

---

### `switch` Statement

**Basic:**

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
  // ...
  default:
    console.log("Unknown day");
}
```

**Fall-through (intentional):**

```javascript
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

**Block scope in cases:**

```javascript
switch (value) {
  case 1: {
    let x = 10;
    console.log(x);
    break;
  }
  case 2: {
    let x = 20;  // Different scope, no conflict
    console.log(x);
    break;
  }
}
```

**Without `break` (fall-through bug):**

```javascript
switch (x) {
  case 1:
    console.log("one");
    // Falls through!
  case 2:
    console.log("two");
    // Falls through!
  case 3:
    console.log("three");
}

// If x = 1, logs: "one", "two", "three"
```

**Using expressions in cases:**

```javascript
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

---

### 1.6.7 Loop Statements

### `while` Loop

**Syntax:**

```javascript
while (condition) {
  // Execute while condition is true
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

**Infinite loop:**

```javascript
while (true) {
  // Runs forever (use break to exit)
}
```

---

### `do-while` Loop

**Syntax:**

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

// Executes at least once even if condition is false
let j = 10;
do {
  console.log(j);  // Logs 10
} while (j < 5);
```

---

### `for` Loop

**Syntax:**

```javascript
for (initialization; condition; increment) {
  // Execute while condition is true
}
```

**Example:**

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// 0, 1, 2, 3, 4
```

**Parts are optional:**

```javascript
// Infinite loop
for (;;) {
  // Runs forever
}

// Initialization outside
let i = 0;
for (; i < 5; i++) {
  console.log(i);
}

// Increment inside body
for (let i = 0; i < 5;) {
  console.log(i);
  i++;
}
```

**Multiple variables:**

```javascript
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
```

**`let` creates per-iteration binding:**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2 (each iteration has its own i)

// vs var (single binding)
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3
```

---

### `for-in` Loop

Iterate over enumerable properties:

```javascript
for (variable in object) {
  // Execute for each property
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

**Arrays (avoid):**

```javascript
let arr = [10, 20, 30];

for (let index in arr) {
  console.log(index, arr[index]);
}
// "0" 10  (index is string!)
// "1" 20
// "2" 30

// Plus inherited properties (if any)
// Use for-of instead
```

**Inherited properties:**

```javascript
let parent = { inherited: true };
let child = Object.create(parent);
child.own = true;

for (let key in child) {
  console.log(key);
}
// "own"
// "inherited"

// Filter own properties
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key);  // Only "own"
  }
}
```

---

### `for-of` Loop

Iterate over iterable objects:

```javascript
for (variable of iterable) {
  // Execute for each value
}
```

**Arrays:**

```javascript
let arr = [10, 20, 30];

for (let value of arr) {
  console.log(value);
}
// 10, 20, 30
```

**Strings:**

```javascript
let str = "hello";

for (let char of str) {
  console.log(char);
}
// "h", "e", "l", "l", "o"

// Works with Unicode correctly
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

**Custom iterables:**

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

**Destructuring:**

```javascript
let arr = [[1, 2], [3, 4], [5, 6]];

for (let [a, b] of arr) {
  console.log(a, b);
}
// 1 2
// 3 4
// 5 6
```

---

### `for await...of` Loop

Iterate over async iterables:

```javascript
for await (variable of asyncIterable) {
  // Execute for each value
}
```

**Example:**

```javascript
async function* asyncGen() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

(async () => {
  for await (let value of asyncGen()) {
    console.log(value);
  }
})();
// 1, 2, 3 (awaits each promise)
```

---

### 1.6.8 Jump Statements

### `break` Statement

**Exit loop:**

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);
}
// 0, 1, 2, 3, 4
```

**Exit switch:**

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

**Labeled break:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    console.log(i, j);
  }
}
// 0 0
// 0 1
// 0 2
// 1 0
```

**Cannot break from function:**

```javascript
function f() {
  for (let i = 0; i < 10; i++) {
    break;  // OK: breaks loop
  }
  break;  // SyntaxError: not in loop/switch
}
```

---

### `continue` Statement

**Skip to next iteration:**

```javascript
for (let i = 0; i < 5; i++) {
  if (i === 2) continue;
  console.log(i);
}
// 0, 1, 3, 4 (skips 2)
```

**In while loop:**

```javascript
let i = 0;
while (i < 5) {
  i++;
  if (i === 2) continue;
  console.log(i);
}
// 1, 3, 4, 5 (skips 2)
```

**Labeled continue:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;
    console.log(i, j);
  }
}
// 0 0
// 1 0
// 2 0
```

**Only in loops (not switch):**

```javascript
switch (value) {
  case 1:
    continue;  // SyntaxError
}
```

---

### `return` Statement

**Return value from function:**

```javascript
function add(a, b) {
  return a + b;
}

let result = add(5, 3);  // 8
```

**Return without value (returns `undefined`):**

```javascript
function log(msg) {
  console.log(msg);
  return;  // Returns undefined
}

function noReturn() {
  // Implicit: return undefined;
}
```

**Early return:**

```javascript
function processUser(user) {
  if (!user) return;  // Early exit
  
  // Process user
}
```

**Cannot return from top-level:**

```javascript
// Top-level code
return 42;  // SyntaxError (not in function)
```

**Return in arrow functions:**

```javascript
// Implicit return (single expression)
const add = (a, b) => a + b;

// Explicit return (block body)
const add = (a, b) => {
  return a + b;
};

// Returning object literal (wrap in parens)
const makeObj = () => ({ x: 1, y: 2 });
```

---

### `throw` Statement

**Throw exception:**

```javascript
throw expression;

throw new Error("Something went wrong");
throw "Error message";  // Can throw any value
throw 42;
throw { code: 500, message: "Server error" };
```

**Examples:**

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

**Custom errors:**

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

### `try-catch-finally` Statement

**Basic try-catch:**

```javascript
try {
  // Code that might throw
  riskyOperation();
} catch (error) {
  // Handle error
  console.log(error.message);
}
```

**With finally:**

```javascript
try {
  // Code that might throw
  riskyOperation();
} catch (error) {
  // Handle error
  console.log(error.message);
} finally {
  // Always executes (even if return in try/catch)
  cleanup();
}
```

**Catch without binding (ES2019):**

```javascript
try {
  riskyOperation();
} catch {
  // Don't need error variable
  console.log("Something went wrong");
}
```

**Finally executes even with return:**

```javascript
function f() {
  try {
    return 1;
  } finally {
    console.log("finally");  // Executes before return
  }
}

f();
// Logs: "finally"
// Returns: 1
```

**Finally overrides return:**

```javascript
function f() {
  try {
    return 1;
  } finally {
    return 2;  // Overrides try's return
  }
}

f();  // Returns 2
```

**Nested try-catch:**

```javascript
try {
  try {
    throw new Error("inner");
  } catch (error) {
    console.log("inner catch:", error.message);
    throw error;  // Re-throw
  }
} catch (error) {
  console.log("outer catch:", error.message);
}
// Logs: "inner catch: inner"
// Logs: "outer catch: inner"
```

---

### 1.6.9 Other Statements

### Empty Statement

**Syntax:**

```javascript
;
```

**Use case: Empty loop body:**

```javascript
// Process in loop condition
while (processNext());

// Empty for body
for (let i = 0; i < arr.length && arr[i] !== target; i++);
```

---

### Block Statement

**Syntax:**

```javascript
{
  // Statements
}
```

**Creates block scope for `let` and `const`:**

```javascript
{
  let x = 10;
  const y = 20;
}
// x and y not accessible here
```

**Multiple statements where one expected:**

```javascript
if (condition) {
  statement1;
  statement2;
  statement3;
}
```

---

### Labeled Statement

**Syntax:**

```javascript
label: statement
```

**Use with break/continue:**

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer;
    console.log(i, j);
  }
}
```

**Label any statement:**

```javascript
myLabel: {
  console.log("start");
  if (condition) break myLabel;
  console.log("end");
}
```

---

### `with` Statement (Deprecated)

**Syntax:**

```javascript
with (object) {
  // Statements
}
```

**Example:**

```javascript
let obj = { x: 1, y: 2 };

with (obj) {
  console.log(x);  // 1 (looks up in obj)
  console.log(y);  // 2
}
```

**Problems:**

- Performance: Prevents optimizations
- Ambiguity: Unclear variable resolution
- Confusing: Hard to understand

**Forbidden in strict mode:**

```javascript
"use strict";
with (obj) {  // SyntaxError
  // ...
}
```

**Don't use `with`. Use destructuring instead:**

```javascript
let { x, y } = obj;
console.log(x, y);
```

---

### `debugger` Statement

**Syntax:**

```javascript
debugger;
```

**Effect:**

Pauses execution in debugger (if open):

```javascript
function buggyFunction() {
  let x = 5;
  debugger;  // Execution pauses here
  console.log(x);
}
```

**No effect if debugger not open.**

---

### 1.6.10 Expression vs Statement Contexts

### Where Statements Expected

**Top-level (module/script):**

```javascript
let x = 5;
function f() { }
class MyClass { }
if (x > 0) { }
```

**Function body:**

```javascript
function f() {
  let x = 5;
  if (x > 0) { }
  return x;
}
```

**Block body:**

```javascript
{
  let x = 5;
  console.log(x);
}
```

**Control flow bodies:**

```javascript
if (condition) {
  statements;
}

for (init; test; incr) {
  statements;
}

while (condition) {
  statements;
}
```

---

### Where Expressions Expected

**Assignment right-hand side:**

```javascript
let x = expression;
```

**Function arguments:**

```javascript
func(expression);
```

**Array elements:**

```javascript
[expression1, expression2];
```

**Object property values:**

```javascript
{ key: expression };
```

**Return value:**

```javascript
return expression;
```

**Conditional:**

```javascript
expression ? a : b;
```

---

### Ambiguous Constructs

**Object literal vs block:**

```javascript
// Block (statement context)
{ x: 1 }  // Label x, expression statement 1

// Object literal (expression context)
({ x: 1 })  // Object { x: 1 }
```

**Function declaration vs expression:**

```javascript
// Declaration (statement context)
function f() { }

// Expression (expression context)
(function f() { })
(function() { })  // Anonymous
```

**Class declaration vs expression:**

```javascript
// Declaration (statement context)
class MyClass { }

// Expression (expression context)
(class MyClass { })
(class { })  // Anonymous
```

---

### 1.6.11 Summary

### Expression Types

**Primary:**

- Literals: `42`, `"hello"`, `true`, `null`, `[]`, `{}`
- Identifiers: `x`, `userName`
- Keywords: `this`, `super`

**Left-hand-side:**

- Property access: `obj.prop`, `arr[0]`
- Calls: `func()`, `new Constructor()`
- Optional chaining: `obj?.prop`

**Operators:**

- Arithmetic: `a + b`, `a * b`
- Comparison: `a < b`, `a === b`
- Logical: `a && b`, `a || b`
- Ternary: `a ? b : c`

---

### Statement Types

**Declarations:**

- `let`, `const`, `var`
- `function`, `class`
- `import`, `export`

**Control flow:**

- `if`, `else`
- `switch`, `case`
- Loops: `for`, `while`, `do-while`, `for-in`, `for-of`

**Jump:**

- `break`, `continue`
- `return`, `throw`

**Exception handling:**

- `try`, `catch`, `finally`

**Other:**

- Block: `{ }`
- Empty: `;`
- Label: `label:`
- `with` (deprecated)
- `debugger`

---

### Key Takeaways

1. **Expressions produce values**, statements perform actions
2. **Expression statements** are valid but often useless
3. **Left-hand-side expressions** can be assigned to
4. **`let` in for loops** creates per-iteration binding
5. **`for-in` iterates properties** (use for objects)
6. **`for-of` iterates values** (use for arrays/iterables)
7. **`break` exits loops/switch**, `continue` skips iteration
8. **`return` exits function**, `throw` raises exception
9. **`finally` always executes**, even with return/throw
10. **Context determines** if `{ }` is block or object literal

---
## 1.7 Language Fundamentals Summary

### Core Concepts

| Section | Key Topics |
|---------|------------|
| **1.1 Lexical Structure** | Tokens, keywords, identifiers, literals, ASI, Unicode, strict mode |
| **1.2 Variables** | `var`/`let`/`const`, hoisting, TDZ, block vs function scope, `globalThis` |
| **1.3 Data Types** | 7 primitives, reference types, value vs reference semantics, IEEE 754, Symbol, WeakMap/WeakSet |
| **1.4 Type System** | `typeof`, `instanceof`, coercion, explicit conversion, truthy/falsy, `===`/`==`/`Object.is()` |
| **1.5 Operators** | Arithmetic, assignment, comparison, logical, bitwise, `?.`, `??`, `&&=`/`||=`/`??=`, precedence |
| **1.6 Expressions & Statements** | Primary/LHS expressions, control flow, loops, jump statements, try-catch-finally |

### Essential Rules

1. **Use `const` by default**, `let` when reassignment needed, never `var`
2. **Prefer `===` over `==`** — use `==` only for `null`/`undefined` checks
3. **Understand coercion** — `+` concatenates strings, other operators coerce to number
4. **TDZ protects you** — `let`/`const` prevent use-before-declaration bugs
5. **`for-of` for values, `for-in` for properties** — don't use `for-in` on arrays
6. **`?.` and `??` for safety** — optional chaining and nullish coalescing prevent crashes
7. **Strict mode always** — ES6 modules and classes enable it automatically
8. **Primitives are immutable** — `const obj = {}` allows mutation, `const x = 5` doesn't

---

**End of Chapter 1: Language Fundamentals**

With these fundamentals internalized, you're ready to tackle functions, objects, and the advanced features built upon this foundation.
