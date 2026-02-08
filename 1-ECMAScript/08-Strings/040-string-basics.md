# 8.1 String Basics

**Strings** are immutable sequences of characters. JavaScript has three ways to create strings and various mechanisms for accessing and manipulating characters.

---

## 8.1.1 String Literals

**String literals** define strings using quotes or template literals. All three formats create the same String primitive type.

```javascript
// Single quotes
let str1 = 'Hello';
typeof str1                 // 'string'

// Double quotes
let str2 = "World";
typeof str2                 // 'string'

// Backticks (template literals - covered in 8.3)
let str3 = `Template`;
typeof str3                 // 'string'

// All equivalent
str1 === str1;              // true (same value)
str1 == str2.toLowerCase(); // false (different content)

// Escape sequences
let escaped = 'It\'s working';  // Single quote in single-quoted string
escaped                     // "It's working"

let doubled = "He said \"Hi\"";  // Double quote in double-quoted string
doubled                     // 'He said "Hi"'

// Common escape sequences
let tab = "Hello\tWorld";       // Tab character
let newline = "Line1\nLine2";   // Newline
let backslash = "C:\\Users";    // Backslash

// Unicode escapes
let unicode = "\u0048\u0065\u006C\u006C\u006F";
unicode                     // 'Hello'

// Hex escapes
let hex = "\x48\x65\x6C\x6C\x6F";
hex                         // 'Hello'

// No implicit conversion
let str = 'hello';
str[0];                     // 'h'
str['length'];              // 5

// Quote preference (usually single or template)
// Pick one style and be consistent
const style1 = 'Use single quotes';
const style2 = `Or template literals`;

// Mixing quotes (no escaping needed)
let mixed1 = "It's fine here";
let mixed2 = 'She said "Hello"';

// String concatenation (avoid, use template literals instead)
let old = 'Hello' + ' ' + 'World';  // ❌ Dated style
old                         // 'Hello World'

// Better
let modern = `Hello World`;         // ✓ Template literal
let better = 'Hello'.concat(' World');  // ✓ concat() method
```

**String Primitives vs String Objects:**

```javascript
// Primitive string (most common)
let primitive = 'hello';
typeof primitive;           // 'string'
primitive === primitive;    // true

// String object (rarely used)
let object = new String('hello');
typeof object;              // 'object'
object === object;          // true (same object reference)
primitive === object;       // false (different types)

// Primitive when using string literals
let str = 'hello';
str instanceof String;      // false (primitive)

// Object when using new String()
let obj = new String('hello');
obj instanceof String;      // true (object)

// Both support string methods (auto-boxing)
primitive.charAt(0);        // 'h' - works on primitive
object.charAt(0);           // 'h' - works on object

// But primitives are more efficient
// JavaScript engine auto-boxes primitives temporarily

// Gotcha: object comparison
let obj1 = new String('hello');
let obj2 = new String('hello');
obj1 === obj2;              // false (different object references)
obj1.valueOf() === obj2.valueOf();  // true (same value)

// Always use primitives, not objects
let correct = 'string';
let incorrect = new String('string');
```

---

## 8.1.2 Template Literals

**Template literals** use backticks and support expression interpolation and multi-line strings.

```javascript
// Basic template
let str = `Hello World`;
str                         // 'Hello World'

// Expression interpolation with ${}
let name = 'Alice';
let greeting = `Hello, ${name}!`;
greeting                    // 'Hello, Alice!'

// Complex expressions
let a = 5, b = 10;
let result = `${a} + ${b} = ${a + b}`;
result                      // '5 + 10 = 15'

// Function calls in expressions
function getName() {
  return 'Bob';
}

let greeting2 = `Welcome, ${getName()}!`;
greeting2                   // 'Welcome, Bob!'

// Object property access
let user = { name: 'Charlie', age: 25 };
let info = `${user.name} is ${user.age} years old`;
info                        // 'Charlie is 25 years old'

// Nested templates
let outer = `outer: ${`inner`}`;
outer                       // 'outer: inner'

// Multi-line strings (preserved)
let multiline = `Line 1
Line 2
Line 3`;
multiline                   // 'Line 1\nLine 2\nLine 3'

// Indentation is preserved (careful!)
let indented = `
  This is indented
    More indented
  Back to first level
`;
// Contains leading newline and spaces!

// Better: use backslash or join
let clean = `
  This is indented
  Still indented
  No extra spaces
`.trim();

// Join array of lines
let lines = ['Line 1', 'Line 2', 'Line 3'];
let joined = lines.join('\n');
joined                      // 'Line 1\nLine 2\nLine 3'

// Escape sequences work in templates
let escaped = `Tab:\tNewline:\n`;
escaped                     // 'Tab:  Newline:\n'

// Dollar sign escaping
let dollar = `Price: $100`;
dollar                      // 'Price: $100' (no interpolation)

let escaped$ = `Price: \${amount}`;  // Escape ${}
escaped$                    // 'Price: ${amount}'

// Tag functions (covered in 8.3)
function tag(strings, ...values) {
  return 'Tagged template';
}

let tagged = tag`Hello ${'World'}`;
tagged                      // 'Tagged template'
```

**Benefits and Use Cases:**

```javascript
// Clean multi-line HTML
let html = `
  <div class="card">
    <h1>${title}</h1>
    <p>${description}</p>
  </div>
`;

// SQL queries
let query = `
  SELECT * FROM users
  WHERE name = '${name}'
  AND age > ${minAge}
`;

// JSON-like structures
let data = `
{
  "name": "${user.name}",
  "email": "${user.email}",
  "status": "${user.status}"
}
`;

// Readable formatting
let report = `
  Report Summary
  ==============
  Total: ${total}
  Average: ${average}
  Count: ${count}
`;

// Complex computations in expressions
let data = [1, 2, 3, 4, 5];
let summary = `
  Array: [${data}]
  Length: ${data.length}
  Sum: ${data.reduce((a, b) => a + b, 0)}
  Max: ${Math.max(...data)}
`;
```

---

## 8.1.3 String Length Property

**Length property** returns the number of UTF-16 code units in the string.

```javascript
// Basic length
let str = 'Hello';
str.length;                 // 5

// Empty string
let empty = '';
empty.length;               // 0

// Spaces count
let spaced = 'H e l l o';
spaced.length;              // 9

// Special characters count as 1
let special = 'Hello!@#$%';
special.length;             // 10

// Newlines count as 1
let newline = 'Line1\nLine2';
newline.length;             // 11 (\n is one character)

// Tab counts as 1
let tabbed = 'before\tafter';
tabbed.length;              // 12 (\t is one character)

// Unicode: most characters are 1 code unit
let basic = 'café';
basic.length;               // 4

// Some emoji are 2 code units (surrogate pairs)
let emoji = '😀';
emoji.length;               // 2 (represented as surrogate pair)

// Multiple emoji
let emojis = '😀😁😂';
emojis.length;              // 6 (3 emoji × 2 code units each)

// Combining characters
let combined = 'é';         // Single character
combined.length;            // 1

let composed = 'e\u0301';   // 'e' + combining acute accent
composed.length;            // 2 (two code units)

// Length is read-only (cannot modify)
let str2 = 'hello';
str2.length = 10;           // Silently fails or throws error (strict mode)
str2.length;                // Still 5

// Not a method, it's a property
str.length;                 // ✓ Property access
str.length();               // ✗ TypeError: str.length is not a function

// Length in loops
let str3 = 'JavaScript';
for (let i = 0; i < str3.length; i++) {
  console.log(str3[i]);     // J, a, v, a, S, c, r, i, p, t
}

// Cache length for performance
let str4 = 'long string...';
for (let i = 0, len = str4.length; i < len; i++) {  // Slightly faster
  // Process character
}

// String-like objects also have length
let arrayLike = '12345';
arrayLike.length;           // 5

// Gotcha: UTF-16 code units, not characters
let str5 = '👨‍👩‍👧‍👦';  // Family emoji (multiple code points)
str5.length;                // 25 (multiple surrogate pairs and ZWJ)
// More than visually apparent!
```

---

## 8.1.4 Character Access

**Character access** retrieves individual characters by index using bracket notation or charAt().

```javascript
// Bracket notation (ES5+)
let str = 'Hello';
str[0];                     // 'H'
str[1];                     // 'e'
str[4];                     // 'o'
str[5];                     // undefined (out of bounds)

// Negative indices (not supported)
str[-1];                    // undefined (not like arrays)

// charAt() method
str.charAt(0);              // 'H'
str.charAt(1);              // 'e'
str.charAt(5);              // '' (empty string for out of bounds)

// Difference when out of bounds
let str2 = 'abc';
str2[10];                   // undefined
str2.charAt(10);            // '' (empty string)

// charCodeAt() - get UTF-16 code
str.charCodeAt(0);          // 72 (code for 'H')
str.charCodeAt(1);          // 101 (code for 'e')

// Out of bounds charCodeAt
str.charCodeAt(10);         // NaN

// Last character
let str3 = 'JavaScript';
str3[str3.length - 1];      // 't'
str3.charAt(str3.length - 1);  // 't'

// Iteration
for (let char of 'Hello') {
  console.log(char);        // H, e, l, l, o
}

// Mapping to array
let chars = [...'Hello'];   // ['H', 'e', 'l', 'l', 'o']

// Get all characters
Array.from('Hello');        // ['H', 'e', 'l', 'l', 'o']
'Hello'.split('');          // ['H', 'e', 'l', 'l', 'o']

// Code points (for emoji and special chars)
'😀'.charCodeAt(0);         // 55357 (first surrogate)
'😀'.charCodeAt(1);         // 56832 (second surrogate)

// codePointAt() - handle surrogate pairs
'😀'.codePointAt(0);        // 128512 (actual code point)

// Common pattern: character frequency
function charFrequency(str) {
  let freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}

charFrequency('hello');     // { h: 1, e: 1, l: 2, o: 1 }

// Check if character exists
let str4 = 'JavaScript';
str4.includes('a');         // true
str4.indexOf('a') !== -1;   // true

// Bracket notation vs charAt()
// Bracket: returns undefined for out of bounds (consistent with arrays)
// charAt: returns empty string (more forgiving)

// Performance note
// Both bracket notation and charAt() are O(1) - equally fast
```

---

## 8.1.5 Unicode and Code Points

**Unicode** represents characters using code points. JavaScript uses UTF-16 encoding, which requires surrogates for some characters.

```javascript
// Basic ASCII - single code unit
let ascii = 'Hello';
ascii.length;               // 5 (5 code units)

// Extended Latin - single code unit
let extended = 'café';
extended.length;            // 4 (4 code units)

// Emoji - surrogate pairs (2 code units each)
let emoji = '😀';
emoji.length;               // 2 (1 emoji = 2 code units in UTF-16)

// charCodeAt() - UTF-16 code unit (0-65535)
'A'.charCodeAt(0);          // 65
'é'.charCodeAt(0);          // 233
'😀'.charCodeAt(0);         // 55357 (first half of surrogate pair)

// codePointAt() - Unicode code point
'A'.codePointAt(0);         // 65
'é'.codePointAt(0);         // 233
'😀'.codePointAt(0);        // 128512 (actual code point)

// String.fromCharCode() - from UTF-16 code units
String.fromCharCode(65);    // 'A'
String.fromCharCode(233);   // 'é'

// Emoji requires two code units
String.fromCharCode(55357, 56832);  // '😀'

// String.fromCodePoint() - from code points (better)
String.fromCodePoint(65);   // 'A'
String.fromCodePoint(233);  // 'é'
String.fromCodePoint(128512);  // '😀' (single parameter)

// BMP (Basic Multilingual Plane) - 0 to 65535
// Supplementary Planes - 65536 and above (needs surrogates)

let str = 'A😀Z';           // Mix of BMP and supplementary
str.length;                 // 4 (A=1, 😀=2, Z=1)

// Iterating with proper Unicode support
for (let codePoint of 'A😀Z') {
  console.log(codePoint);   // A, 😀, Z (correct!)
}

// Splitting breaks emoji
'A😀Z'.split('');           // ['A', '?', '?', 'Z'] - broken!

// Using Array.from() or spread handles Unicode correctly
[...'A😀Z'];               // ['A', '😀', 'Z'] - correct!
Array.from('A😀Z');        // ['A', '😀', 'Z'] - correct!

// Counting characters (considering Unicode)
function countCharacters(str) {
  return [...str].length;   // Correct count
}

countCharacters('hello');   // 5
countCharacters('😀😁😂');   // 3 (not 6!)

// Combining characters (diacritics)
let combining = 'e\u0301';  // 'e' + combining acute
combining.length;           // 2 (two code units)
[...combining].length;      // 2 (still two characters)

// Normalized form
let nfc = combining.normalize('NFC');  // Composed
nfc.length;                 // 1 ('é' as single character)

let nfd = combining.normalize('NFD');  // Decomposed
nfd.length;                 // 2 ('e' + combining)

// Emoji with variation selector
let heartRed = '❤️';        // 2-3 code units (emoji + variation selector)
heartRed.length;            // 3

// ZWJ (Zero-Width Joiner) sequences
let family = '👨‍👩‍👧‍👦';       // Family emoji (multiple parts)
family.length;              // 25 (complex!)
[...family].length;         // 1 (correct display unit)

// Safe character access (handles surrogate pairs)
function getCharAt(str, index) {
  let chars = [...str];     // Break into proper characters
  return chars[index];
}

getCharAt('A😀Z', 1);      // '😀' (correct, not broken)

// Case conversion with Unicode
'ß'.toUpperCase();          // 'SS' (German sharp s)
'I'.toLowerCase();          // 'i'
'İ'.toLowerCase();          // 'i̇' (Turkish capital I with dot)

// Locale considerations
// Case conversion may produce multiple characters in some locales
```

---

## 8.1.6 Converting Array-like to Strings

**Conversion methods** transform various types into strings for manipulation.

```javascript
// String() constructor
String(123);                // '123'
String(true);               // 'true'
String(null);               // 'null'
String(undefined);          // 'undefined'
String([1, 2, 3]);          // '1,2,3'

// toString() method
let num = 123;
num.toString();             // '123'
true.toString();            // 'true'
[1, 2, 3].toString();       // '1,2,3'

// Difference: String() vs toString()
String(null);               // 'null'
null.toString();            // TypeError: Cannot read property

String(undefined);          // 'undefined'
undefined.toString();       // TypeError: Cannot read property

// Template literal (implicit conversion)
let value = 123;
`Value: ${value}`;          // 'Value: 123'

// Concatenation (implicit conversion)
let result = 'Count: ' + 5;
result                      // 'Count: 5'

// Plus operator (ambiguous)
'5' + 5;                    // '55' (string concatenation)
5 + '5';                    // '55' (string concatenation)
5 + 5;                      // 10 (numeric addition)

// Array to string
let arr = [1, 2, 3];
arr.toString();             // '1,2,3'
String(arr);                // '1,2,3'

// With custom separator (use join)
arr.join(', ');             // '1, 2, 3'

// Nested arrays
let nested = [1, [2, 3], 4];
nested.toString();          // '1,2,3,4'
nested.join(' | ');         // '1 | 2,3 | 4'

// Object to string
let obj = { a: 1, b: 2 };
String(obj);                // '[object Object]'
obj.toString();             // '[object Object]'

// Better: JSON.stringify
JSON.stringify(obj);        // '{"a":1,"b":2}'

// Number formatting
let num2 = 3.14159;
num2.toString();            // '3.14159'
num2.toFixed(2);            // '3.14' (string)
num2.toExponential();       // '3.14159e+0' (string)

// Boolean to string (rarely needed)
String(true);               // 'true'
String(false);              // 'false'

// Date to string
let date = new Date();
String(date);               // '2024-02-08T20:30:00.000Z'
date.toString();            // Longer format

// Symbol to string (special case)
let sym = Symbol('id');
String(sym);                // 'Symbol(id)'
sym.toString();             // 'Symbol(id)'

// Function to string
let fn = function add(a, b) { return a + b; };
fn.toString();              // 'function add(a, b) { return a + b; }'

// Arrow function
let arrow = (x) => x * 2;
arrow.toString();           // '(x) => x * 2'

// Implicit conversions in operations
5 + '5' + 5;                // '555' (all string concatenation)
5 - '5';                    // 0 (numeric subtraction)
5 * '2';                    // 10 (numeric multiplication)
'10' / '2';                 // 5 (numeric division)

// Explicit string coercion is clearer
let count = 42;
let message = String(count);  // Explicit
let message2 = `${count}`;    // Template (clear intent)
let message3 = count + '';    // Implicit (avoid)
```

**Best Practices:**

```javascript
// ✓ Use template literals for clarity
let str = `Value: ${value}`;

// ✓ Use String() for explicit conversion
let str2 = String(value);

// ✓ Use toString() when method available
let str3 = arr.toString();

// ✓ Use join() for array with separator
let str4 = arr.join(', ');

// ✗ Avoid implicit string concatenation
let str5 = 'Value: ' + value;  // Outdated

// ✗ Avoid += for multiple concatenations
let str6 = '';
for (let item of items) {
  str6 += item;  // Inefficient
}

// ✓ Better: use join()
let str7 = items.join('');

// ✓ Or array accumulation
let str8 = items.reduce((acc, item) => acc + item, '');
```