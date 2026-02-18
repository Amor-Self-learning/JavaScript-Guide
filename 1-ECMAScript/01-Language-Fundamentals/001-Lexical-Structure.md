# 1.1 Lexical Structure

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

```
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

**End of Chapter 1.1: Lexical Structure**

This chapter covered the foundational syntax of JavaScript without sugar-coating. You now understand:

- How JavaScript parses source code into tokens
- Reserved words and identifier rules
- All comment types including JSDoc
- Every type of literal value
- The intricacies of ASI and semicolon behavior
- Unicode handling and UTF-16 encoding
- Strict mode and its enforcement of better JavaScript practices

This knowledge forms the basis for understanding all subsequent JavaScript concepts.