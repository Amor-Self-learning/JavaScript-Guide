# 8 Strings

Strings are immutable sequences of UTF-16 code units. This chapter covers string creation, manipulation methods, template literals, and internationalization.

---

## 8.1 String Basics

**Strings** are immutable sequences of characters. JavaScript has three ways to create strings and various mechanisms for accessing and manipulating characters.

---

### 8.1.1 String Literals

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

### 8.1.2 Template Literals

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

### 8.1.3 String Length Property

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

### 8.1.4 Character Access

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

### 8.1.5 Unicode and Code Points

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

### 8.1.6 Converting Array-like to Strings

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
## 8.2 String Methods

**String methods** allow searching, manipulation, and transformation of strings. All methods return new strings (strings are immutable).

---

### 8.2.1 Character Code Methods

**Character code methods** retrieve numeric representations of characters.

```javascript
// charAt() - get character at index
let str = 'Hello';
str.charAt(0);              // 'H'
str.charAt(4);              // 'o'
str.charAt(10);             // '' (empty string, out of bounds)

// charCodeAt() - get UTF-16 code of character
str.charCodeAt(0);          // 72
str.charCodeAt(1);          // 101
str.charCodeAt(10);         // NaN (out of bounds)

// codePointAt() - get Unicode code point
'A'.codePointAt(0);         // 65
'é'.codePointAt(0);         // 233
'😀'.codePointAt(0);        // 128512

// Difference: charCodeAt vs codePointAt
let emoji = '😀';
emoji.charCodeAt(0);        // 55357 (first surrogate)
emoji.codePointAt(0);       // 128512 (actual code point)

// fromCharCode() - create string from UTF-16 codes (static)
String.fromCharCode(65, 66, 67);  // 'ABC'
String.fromCharCode(72, 101, 108, 108, 111);  // 'Hello'

// For emoji, need both surrogates
String.fromCharCode(55357, 56832);  // '😀'

// fromCodePoint() - create from code points (static, ES2015)
String.fromCodePoint(65, 66, 67);  // 'ABC'
String.fromCodePoint(128512);      // '😀' (single parameter)

// at() - ES2022 method, supports negative indices
let str2 = 'JavaScript';
str2.at(0);                 // 'J'
str2.at(-1);                // 't' (last character)
str2.at(-2);                // 'p' (second from end)

// Comparison: charAt() vs at()
str2.charAt(-1);            // '' (negative index not supported)
str2.at(-1);                // 't' (works!)

// Real-world pattern: get last character
function lastChar(str) {
  return str.at(-1) ?? '';  // Using at() or fallback
}

lastChar('hello');          // 'o'
lastChar('');               // ''

// Character frequency counter
function charFrequency(str) {
  let freq = {};
  for (let i = 0; i < str.length; i++) {
    let char = str.charAt(i);
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}

charFrequency('hello');     // { h: 1, e: 1, l: 2, o: 1 }

// Character code to ASCII art
function getCharCodes(str) {
  let codes = [];
  for (let i = 0; i < str.length; i++) {
    codes.push(str.charCodeAt(i));
  }
  return codes;
}

getCharCodes('ABC');        // [65, 66, 67]

// Range check (is character in range)
function isDigit(char) {
  let code = char.charCodeAt(0);
  return code >= 48 && code <= 57;  // '0' to '9'
}

isDigit('5');               // true
isDigit('a');               // false

// Case detection
function isUpperCase(char) {
  return char === char.toUpperCase() && char !== char.toLowerCase();
}

isUpperCase('A');           // true
isUpperCase('a');           // false
isUpperCase('5');           // false
```

---

### 8.2.2 Searching and Matching

**Search methods** find substrings or patterns within strings.

```javascript
// indexOf() - find first occurrence
let str = 'Hello World Hello';
str.indexOf('o');           // 4 (first 'o')
str.indexOf('World');       // 6
str.indexOf('xyz');         // -1 (not found)

// indexOf() with start position
str.indexOf('o', 5);        // 7 (search from index 5)
str.indexOf('Hello', 1);    // 12 (second 'Hello')

// lastIndexOf() - find last occurrence
str.lastIndexOf('o');       // 16 (last 'o')
str.lastIndexOf('Hello');   // 12 (last 'Hello')
str.lastIndexOf('Hello', 11);  // 0 (search backwards from index 11)

// includes() - check if substring exists
str.includes('World');      // true
str.includes('xyz');        // false

// includes() with position
str.includes('Hello', 1);   // true (search from index 1)
str.includes('Hello', 13);  // false (only after index 12)

// startsWith() - check beginning
str.startsWith('Hello');    // true
str.startsWith('World');    // false

// startsWith() with position
str.startsWith('World', 6); // true (position 6)

// endsWith() - check ending
str.endsWith('Hello');      // true
str.endsWith('World');      // false

// endsWith() with length parameter
str.endsWith('World', 11);  // true (treat as if length 11)

// search() - find regex match position
let text = 'The price is $50';
text.search(/\$\d+/);       // 13 (position of match)
text.search(/xyz/);         // -1 (not found)

// match() - find all matches
let text2 = 'cat bat hat';
text2.match(/at/);          // ['at'] (first match without 'g' flag)
text2.match(/at/g);         // ['at', 'at', 'at'] (all matches)

// match() with groups
let email = 'user@example.com';
email.match(/(\w+)@(\w+)/);
// ['user@example', 'user', 'example'] (with groups)

// matchAll() - get all matches with groups (ES2020)
let text3 = 'cat123bat456';
let matches = [...text3.matchAll(/(\w+)(\d+)/g)];
// Each match includes groups

// Pattern matching
function findAll(str, pattern) {
  let matches = [];
  let match;
  let regex = new RegExp(pattern, 'g');
  while ((match = regex.exec(str)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

findAll('hello world hello', 'hello');  // ['hello', 'hello']

// Case-insensitive search
let str2 = 'Hello HELLO hello';
str2.indexOf('hello');      // -1 (case-sensitive)
str2.toLowerCase().indexOf('hello');  // 0 (case-insensitive)

// Find all positions
function findAllIndices(str, substring) {
  let indices = [];
  let pos = 0;
  while ((pos = str.indexOf(substring, pos)) !== -1) {
    indices.push(pos);
    pos += substring.length;
  }
  return indices;
}

findAllIndices('hello hello hello', 'hello');  // [0, 6, 12]

// URL parameter extraction
function getParam(url, param) {
  let regex = new RegExp(`[?&]${param}=([^&]*)`);
  let match = url.match(regex);
  return match ? match[1] : null;
}

getParam('https://example.com?id=123&name=test', 'name');
// 'test'
```

---

### 8.2.3 String Replacement

**Replacement methods** modify string content.

```javascript
// replace() - replace first occurrence
let str = 'hello world hello';
str.replace('hello', 'hi');  // 'hi world hello'

// replace() with regex
str.replace(/hello/g, 'hi');  // 'hi world hi'

// replace() with function
str.replace(/hello/g, function(match) {
  return match.toUpperCase();
});
// 'HELLO world HELLO'

// replaceAll() - replace all occurrences (ES2021)
str.replaceAll('hello', 'hi');  // 'hi world hi'

// Replacement with groups
let text = 'John Smith';
text.replace(/(\w+) (\w+)/, '$2, $1');  // 'Smith, John'

// Function replacement with groups
let date = '2024-02-08';
date.replace(/(\d{4})-(\d{2})-(\d{2})/, (match, year, month, day) => {
  return `${day}/${month}/${year}`;
});
// '08/02/2024'

// Advanced replacement function
let text2 = 'The price is $50 and the tax is $10';
text2.replace(/\$(\d+)/g, (match, price) => {
  return `$${parseInt(price) * 1.1}`;  // 10% increase
});
// 'The price is $55 and the tax is $11'

// HTML escaping
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

escapeHTML('<script>alert("XSS")</script>');
// '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

// Word replacement (whole word only)
let text3 = 'cat concatenate scatter';
text3.replace(/\bcat\b/g, 'dog');  // 'dog concatenate scatter'

// Case-insensitive replacement
text3.replace(/cat/i, 'dog');     // 'dog concatenate scatter' (first only)
text3.replace(/cat/gi, 'dog');    // 'dog dogcatenate scatdog' (all)

// Template-like replacement
function interpolate(str, data) {
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || match;
  });
}

interpolate('Hello {name}, you are {age} years old', 
  { name: 'Alice', age: 25 });
// 'Hello Alice, you are 25 years old'

// Capitalize each word
function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

capitalizeWords('hello world');  // 'Hello World'

// Trim and replace extra spaces
function normalizeSpaces(str) {
  return str.trim().replace(/\s+/g, ' ');
}

normalizeSpaces('  hello    world  ');  // 'hello world'

// Remove duplicates
function removeDuplicates(str) {
  return str.replace(/(.)\1+/g, '$1');
}

removeDuplicates('hellooo wooorld');  // 'helo world'

// Split, process, rejoin pattern (alternative)
str.split(' ').map(word => word.toUpperCase()).join(' ');
// More explicit than regex replacement

// Performance: replace vs replaceAll
let str2 = 'hello hello hello';
str2.replace(/hello/g, 'hi');      // Works (regex)
str2.replaceAll('hello', 'hi');    // Works (ES2021)
// replaceAll is clearer for simple string replacement
```

---

### 8.2.4 String Extraction

**Extraction methods** get portions of strings.

```javascript
// slice() - extract substring
let str = 'JavaScript';
str.slice(0, 4);            // 'Java'
str.slice(4);               // 'Script'
str.slice(-6);              // 'Script' (last 6 chars)
str.slice(-6, -2);          // 'Scrip'

// substring() - similar to slice (older)
str.substring(0, 4);        // 'Java'
str.substring(4);           // 'Script'

// Difference: negative indices
str.slice(-3);              // 'pto' (last 3)
str.substring(-3);          // 'JavaScript' (treats -3 as 0)

// substr() - deprecated, avoid
str.substr(0, 4);           // 'Java' (but don't use)

// split() - break into array
let text = 'hello world test';
text.split(' ');            // ['hello', 'world', 'test']

// split() without separator
'hello'.split('');          // ['h', 'e', 'l', 'l', 'o']

// split() with limit
text.split(' ', 2);         // ['hello', 'world']

// split() with regex
'hello123world456'.split(/\d+/);  // ['hello', 'world', '']

// join() - opposite of split
let arr = ['hello', 'world'];
arr.join(' ');              // 'hello world'
arr.join('-');              // 'hello-world'

// Common pattern: split and map
let csv = 'a,b,c';
csv.split(',').map(x => x.toUpperCase());  // ['A', 'B', 'C']

// Extract filename
function getFilename(path) {
  return path.split('/').pop();  // Last part after slash
}

getFilename('/path/to/file.js');  // 'file.js'

// Extract extension
function getExtension(filename) {
  return filename.slice(filename.lastIndexOf('.') + 1);
}

getExtension('file.js');    // 'js'

// Extract domain from email
function getDomain(email) {
  return email.split('@')[1];
}

getDomain('user@example.com');  // 'example.com'

// First N characters
function first(str, n) {
  return str.slice(0, n);
}

first('JavaScript', 4);     // 'Java'

// Last N characters
function last(str, n) {
  return str.slice(-n);
}

last('JavaScript', 6);      // 'Script'

// Truncate with ellipsis
function truncate(str, length) {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

truncate('JavaScript is fun', 10);  // 'JavaScript...'

// Middle extraction
function middle(str, start, length) {
  return str.slice(start, start + length);
}

middle('JavaScript', 4, 6);  // 'Script'

// Word wrapping
function wrap(str, width) {
  return str.match(new RegExp(`.{1,${width}}`, 'g')).join('\n');
}

wrap('HelloWorld', 5);
// 'Hello\nWorld'

// Case conversion
let str2 = 'Hello World';
str2.toLowerCase();         // 'hello world'
str2.toUpperCase();         // 'HELLO WORLD'

// toLocaleLowerCase() / toLocaleUpperCase()
'İ'.toLocaleLowerCase('tr');  // 'i' (Turkish)
'i'.toLocaleUpperCase('tr');  // 'İ' (Turkish)
```

---

### 8.2.5 String Transformation

**Transformation methods** change string format or structure.

```javascript
// concat() - join strings
let str = 'Hello';
str.concat(' ', 'World');   // 'Hello World'

// With multiple arguments
str.concat(' ', 'World', '!');  // 'Hello World!'

// repeat() - repeat string N times
'abc'.repeat(3);            // 'abcabcabc'
'*'.repeat(5);              // '*****'

// Template repeat
'█'.repeat(10);             // Progress bar

// padStart() - pad beginning to length
'5'.padStart(3, '0');       // '005'
'42'.padStart(4, '0');      // '0042'

// padEnd() - pad ending to length
'5'.padEnd(3, '0');         // '500'

// Array column formatting
function formatColumn(arr, width) {
  return arr.map(item => String(item).padEnd(width));
}

formatColumn(['a', 'bb', 'ccc'], 5);
// ['a    ', 'bb   ', 'ccc  ']

// Table alignment
function rightAlign(str, width) {
  return str.padStart(width);
}

console.log(rightAlign('42', 5));  // '   42'

// trim() - remove leading/trailing whitespace
'  hello  '.trim();         // 'hello'

// trimStart() / trimLeft()
'  hello  '.trimStart();    // 'hello  '

// trimEnd() / trimRight()
'  hello  '.trimEnd();      // '  hello'

// normalize() - Unicode normalization
let str2 = 'é';            // Composed form
str2.normalize('NFC');      // Composed (canonical)
str2.normalize('NFD');      // Decomposed

// localeCompare() - locale-aware comparison
'a'.localeCompare('b');     // -1 (a < b)
'b'.localeCompare('a');     // 1 (b > a)
'a'.localeCompare('a');     // 0 (equal)

// Sorting with localeCompare
let names = ['Zebra', 'Apple', 'banana'];
names.sort((a, b) => a.localeCompare(b));
// ['Apple', 'banana', 'Zebra']

// Case-sensitive vs case-insensitive
'ABC'.localeCompare('abc');  // Negative (uppercase typically first)
'ABC'.localeCompare('abc', undefined, { sensitivity: 'base' });
// 0 (treats as equal ignoring case)

// Common text processing
function cleanText(str) {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

cleanText('  Hello   WORLD  ');  // 'hello world'

// Slug generation
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-');          // Remove duplicate hyphens
}

toSlug('Hello World! How are you?');  // 'hello-world-how-are-you'

// Camel case to kebab case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

toKebabCase('helloWorld');  // 'hello-world'

// Kebab case to camel case
function toCamelCase(str) {
  return str
    .split('-')
    .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

toCamelCase('hello-world');  // 'helloWorld'
```

---

### 8.2.6 Advanced Pattern Matching

```javascript
// Check if string is all uppercase
function isAllUppercase(str) {
  return str === str.toUpperCase() && str !== str.toLowerCase();
}

isAllUppercase('HELLO');    // true
isAllUppercase('Hello');    // false
isAllUppercase('123');      // false

// Check if string is palindrome
function isPalindrome(str) {
  let clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

isPalindrome('A man a plan a canal Panama');  // true

// Check if anagrams
function areAnagrams(str1, str2) {
  let sort = s => s.toLowerCase().split('').sort().join('');
  return sort(str1) === sort(str2);
}

areAnagrams('listen', 'silent');  // true

// URL validation pattern
function isValidURL(str) {
  return /^https?:\/\/.+$/.test(str);
}

isValidURL('https://example.com');  // true

// Email validation pattern
function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

isValidEmail('user@example.com');  // true

// Phone number formatting
function formatPhone(str) {
  let cleaned = str.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

formatPhone('1234567890');  // '(123) 456-7890'

// Credit card formatting
function formatCreditCard(str) {
  let cleaned = str.replace(/\s/g, '');
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
}

formatCreditCard('1234567890123456');  // '1234 5678 9012 3456'

// Performance: prefer simple methods over regex for simple tasks
// string.includes() is faster than regex for existence checks
'hello'.includes('ll');     // true (faster)
/ll/.test('hello');         // true (slower)

// string.startsWith() is faster than regex
'hello'.startsWith('he');   // true (faster)
/^he/.test('hello');        // true (slower)
```
## 8.3 Template Literals and Tagged Templates

**Template literals** (backtick strings) revolutionized string handling in JavaScript with expression interpolation, multi-line support, and custom processing via tag functions.

---

### 8.3.1 Basic Template Literals

**Template literals** are delimited by backticks (`) instead of quotes.

```javascript
// Basic template
let str = `Hello World`;
typeof str;                 // 'string' (same type as quoted strings)

// Identical to quoted strings
`hello` === 'hello';        // true
`hello` === "hello";        // true

// Expression interpolation with ${}
let name = 'Alice';
let greeting = `Hello, ${name}!`;
greeting                    // 'Hello, Alice!'

// Expressions (not just variables)
let a = 5, b = 10;
let math = `${a} + ${b} = ${a + b}`;
math                        // '5 + 10 = 15'

// Function calls
function getGreeting() {
  return 'Howdy';
}

let msg = `${getGreeting()}, partner!`;
msg                         // 'Howdy, partner!'

// Method calls
let user = { name: 'Bob', age: 25 };
let info = `User: ${user.name.toUpperCase()}, Age: ${user.age + 1}`;
info                        // 'User: BOB, Age: 26'

// Array access
let colors = ['red', 'green', 'blue'];
let first = `First color: ${colors[0]}`;
first                       // 'First color: red'

// Object properties
let obj = { x: 10, y: 20 };
let point = `Point(${obj.x}, ${obj.y})`;
point                       // 'Point(10, 20)'

// Nested templates
let outer = `outer: ${`inner`}`;
outer                       // 'outer: inner'

// Complex nested expressions
let nested = `Result: ${1 + 2 + `sum${3 + 4}`}`;
nested                      // 'Result: 3sum7'

// Ternary expressions
let age = 25;
let status = `Age is ${age >= 18 ? 'adult' : 'minor'}`;
status                      // 'Age is adult'

// Boolean expressions
let loggedIn = true;
let welcome = `${loggedIn ? 'Welcome back!' : 'Please log in'}`;
welcome                     // 'Welcome back!'

// Logical operators
let value = 42;
let result = `Value: ${value && value * 2}`;
result                      // 'Value: 84'

// Empty expressions (allowed but unusual)
`Empty: ${''}`;             // 'Empty: '

// Expressions with side effects (avoid!)
let counter = 0;
let bad = `Count: ${++counter}`;
bad                         // 'Count: 1'
counter                     // 1 (modified as side effect)

// Multi-line strings
let multiline = `Line 1
Line 2
Line 3`;
multiline                   // 'Line 1\nLine 2\nLine 3'

// Indentation preservation
let indented = `
  This is indented
    This is more indented
  Back to first level
`;
// Includes leading newline and all spaces!

// Better: use trim()
let clean = `
  Clean indentation
  No leading newline
  No extra spaces
`.trim();
// 'Clean indentation\nNo leading newline\nNo extra spaces'

// Join lines for cleaner template
let template = [
  'Line 1',
  'Line 2',
  'Line 3'
].join('\n');
// 'Line 1\nLine 2\nLine 3'

// Escape sequences work in templates
let escaped = `Tab:\tNewline:\nBackslash:\\`;
escaped                     // 'Tab:  Newline:\nBackslash:\'

// Dollar sign escaping
let price = `Price: $100`;
price                       // 'Price: $100' (no interpolation)

let escaped$ = `Escape: \${name}`;
escaped$                    // 'Escape: ${name}' (shows literal ${})

// Backtick escaping
let backtick = `This has a \` backtick`;
backtick                    // 'This has a ` backtick'

// Performance: templates vs concatenation
// Modern engines optimize templates well
let a1 = `Hello ${name}`;         // ✓ Clear and fast
let a2 = 'Hello ' + name;         // ✓ Also fast
let a3 = 'Hello '.concat(name);   // ✓ Also fast

// Complex formatting use case
function formatUserProfile(user) {
  return `
    Name: ${user.name}
    Email: ${user.email}
    Status: ${user.active ? 'Active' : 'Inactive'}
    Created: ${new Date(user.created).toLocaleDateString()}
  `.trim();
}

// For large documents, template is cleaner
let largeTpl = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>${heading}</h1>
    <p>${content}</p>
  </body>
  </html>
`.trim();
```

---

### 8.3.2 Multi-line Strings and Formatting

**Multi-line strings** are a major benefit of template literals.

```javascript
// HTML without concatenation
let html = `
  <div class="card">
    <h1>${title}</h1>
    <p>${description}</p>
  </div>
`;

// SQL queries
let query = `
  SELECT * FROM users
  WHERE age > ${minAge}
  AND status = '${status}'
  ORDER BY created_at DESC
`;

// JSON-like structure
let data = `
{
  "name": "${user.name}",
  "email": "${user.email}",
  "age": ${user.age},
  "active": ${user.active}
}
`;

// API request body
let apiBody = `
{
  "query": "${searchTerm}",
  "limit": ${pageSize},
  "offset": ${offset}
}
`;

// Markdown content
let markdown = `
# ${title}

## Overview
${description}

## Features
- ${features.join('\n- ')}

## Usage
\`\`\`javascript
${codeExample}
\`\`\`
`;

// CSS styling
let styles = `
.button {
  background: ${buttonColor};
  padding: ${padding}px;
  border-radius: ${radius}px;
  font-size: ${fontSize}px;
}
`;

// Console output formatting
let report = `
╔════════════════════════════════╗
║         Test Report            ║
╠════════════════════════════════╣
║ Passed: ${passed.toString().padStart(2)}               ║
║ Failed: ${failed.toString().padStart(2)}               ║
║ Skipped: ${skipped.toString().padStart(2)}              ║
╚════════════════════════════════╝
`;

// Handling indentation properly
function formatTemplate(str) {
  // Remove first and last empty lines
  let lines = str.split('\n').slice(1, -1);
  
  // Find minimum indentation
  let minIndent = lines
    .filter(line => line.trim())
    .reduce((min, line) => {
      let indent = line.match(/^ */)[0].length;
      return Math.min(min, indent);
    }, Infinity);
  
  // Remove minimum indentation from all lines
  return lines
    .map(line => line.slice(minIndent))
    .join('\n');
}

let properlyIndented = formatTemplate(`
  <div>
    <h1>Title</h1>
    <p>Paragraph</p>
  </div>
`);
// '<div>\n  <h1>Title</h1>\n  <p>Paragraph</p>\n</div>'

// Common pattern: array of lines
let lines = [
  'First line',
  'Second line',
  'Third line'
];

let joined = lines.join('\n');
// Often better than template for complex logic

// Multi-line with expressions
let complexHtml = `
  <ul>
    ${items.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>
`;
```

---

### 8.3.3 Tagged Templates

**Tagged templates** process templates through a function for custom behavior.

```javascript
// Basic tag function
function tag(strings, ...values) {
  console.log(strings);  // Array of string parts
  console.log(values);   // Array of expression values
  return 'result';
}

let name = 'Alice';
let result = tag`Hello ${name}!`;
// strings = ['Hello ', '!']
// values = ['Alice']
// result = 'result'

// Tag function that processes templates
function highlight(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += `<mark>${values[i]}</mark>`;
    }
  }
  return result;
}

let text = 'I like';
let color = 'red';
let tagged = highlight`${text} the color ${color}`;
// '<mark>I like</mark> the color <mark>red</mark>'

// HTML escaping tag
function html(strings, ...values) {
  function escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += escape(values[i]);
    }
  }
  return result;
}

let userInput = '<script>alert("XSS")</script>';
let safe = html`<div>${userInput}</div>`;
// '<div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>'

// Translation/localization tag
function translate(strings, ...values) {
  let templates = {
    'Hello {0}!': `¡Hola {0}!`,
    'Goodbye {0}': `Adiós {0}`
  };
  
  let template = strings.join('{}');
  let translated = templates[template] || template;
  
  let parts = translated.split('{}');
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

let spanish = translate`Hello ${'Alice'}!`;
// '¡Hola Alice!'

// CSS-in-JS helper
function css(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result.trim();
}

let buttonStyle = css`
  background: ${buttonColor};
  padding: ${padding}px;
  border-radius: ${radius}px;
`;

// SQL query builder with parameterization
function sql(strings, ...values) {
  let params = [];
  let query = '';
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      query += `$${params.length}`;  // Parameterized
    }
  }
  
  return { query, params };
}

let { query, params } = sql`
  SELECT * FROM users
  WHERE name = ${name}
  AND age > ${age}
`;
// query = 'SELECT * FROM users\nWHERE name = $1\nAND age > $2'
// params = ['Alice', 25]

// GraphQL query builder
function gql(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

let query2 = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`;

// Dedent tag (removes common leading whitespace)
function dedent(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  
  let lines = result.split('\n');
  let minIndent = lines
    .filter(line => line.trim())
    .reduce((min, line) => {
      let indent = line.match(/^ */)[0].length;
      return Math.min(min, indent);
    }, Infinity);
  
  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim();
}

let code = dedent`
  function add(a, b) {
    return a + b;
  }
`;

// Terminal colors tag
function color(strings, ...values) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    reset: '\x1b[0m'
  };
  
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += `${colors.red}${values[i]}${colors.reset}`;
    }
  }
  return result;
}

console.log(color`Error: ${'file not found'}`);
// Outputs with red colored error message

// Custom formatters
function table(strings, ...values) {
  let headers = strings[0].trim().split('\n');
  let rows = values.map((val, i) => {
    let content = Array.isArray(val) ? val.join(' | ') : val;
    return `${content}`;
  });
  return [headers, ...rows].join('\n');
}

// Multiple template expressions
let a = 'hello', b = 'world';
let both = dedent`
  First: ${a}
  Second: ${b}
`;
```

---

### 8.3.4 String.raw and Raw Strings

**String.raw** preserves escape sequences without processing them.

```javascript
// Regular string: escape sequences are processed
let regular = `Line 1\nLine 2`;
regular                    // 'Line 1\nLine 2' (newline)
regular.length;            // 13

// Raw string: escape sequences are literal
let raw = String.raw`Line 1\nLine 2`;
raw                        // 'Line 1\\nLine 2' (backslash-n)
raw.length;                // 14

// Difference visualized
console.log(regular);      // Line 1
                           // Line 2

console.log(raw);          // Line 1\nLine 2

// Backslash preservation
let path1 = `C:\Users\Documents`;   // 'C:UsersDocuments' (wrong!)
let path2 = String.raw`C:\Users\Documents`;  // 'C:\Users\Documents' (correct!)

// Windows paths
let winPath = String.raw`C:\Program Files\App\config.ini`;
winPath                    // 'C:\Program Files\App\config.ini'

// Regex patterns (raw is clearer)
let regex1 = /\d+\.\d+/;   // Already escaped
let regex2 = String.raw`\d+\.\d+`;  // String representation
String(regex2);            // '\\d+\\.\\d+'

// With template expressions
let dir = 'Users';
let raw2 = String.raw`C:\${dir}\Documents`;
raw2                       // 'C:\Users\Documents'

// In tagged templates
function raw(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings.raw[i];  // Access raw strings
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

let latex = raw`\frac{${numerator}}{${denominator}}`;
latex                      // Preserves LaTeX backslashes

// File paths across platforms
let linuxPath = String.raw`/home/user/documents`;
let mixedPath = String.raw`\\server\share\file`;

// LaTeX/Math strings
let math = String.raw`E = mc^2`;
// Or: `E = mc^2` (both work, raw is explicit)

// JSON strings that contain backslashes
let jsonRaw = String.raw`{"regex": "\d+", "path": "C:\Users"}`;
jsonRaw                    // Preserves backslashes for valid JSON

// URL patterns (avoid double-escaping)
let urlPattern = String.raw`^https?://[\w\-\.]+\.\w+$`;
urlPattern                 // Clean regex pattern
```

---

### 8.3.5 Practical Use Cases

**Real-world applications** of template literals.

```javascript
// HTML rendering with data
function renderCard(data) {
  return `
    <div class="card">
      <h2>${data.title}</h2>
      <p>${data.description}</p>
      <footer>${new Date(data.date).toLocaleDateString()}</footer>
    </div>
  `;
}

// List rendering
function renderList(items) {
  return `
    <ul>
      ${items.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

// Conditional rendering
function renderStatus(user) {
  return `
    <div>
      ${user.active ? `<span class="active">Active</span>` : `<span class="inactive">Inactive</span>`}
    </div>
  `;
}

// API call formatting
function buildQuery(filters) {
  return Object.entries(filters)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

// Error message formatting
function errorMessage(error) {
  return `
    ❌ Error: ${error.message}
    Stack: ${error.stack}
    Time: ${new Date().toISOString()}
  `.trim();
}

// Database connection string
function connectionString(config) {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

// Email template
function emailTemplate(user, order) {
  return `
    Dear ${user.name},
    
    Thank you for your order #${order.id}
    
    Items:
    ${order.items.map(item => `- ${item.name} x${item.qty}: $${item.price}`).join('\n')}
    
    Total: $${order.total}
    
    Best regards,
    The Store
  `.trim();
}

// Logging with context
function log(level, message, context) {
  let timestamp = new Date().toISOString();
  return `[${timestamp}] ${level}: ${message} ${JSON.stringify(context)}`;
}

// Type definitions (JSDoc)
function calculate(/** @type {number} */ a, /** @type {number} */ b) {
  return `Result: ${a + b}`;
}

// Build configuration
const buildConfig = `
{
  "name": "my-app",
  "version": "${VERSION}",
  "entry": "${ENTRY_POINT}",
  "output": "${OUTPUT_DIR}",
  "mode": "${MODE}",
  "target": "${TARGET}"
}
`;

// Dynamic CSS
const themeCSS = `
:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --font-size: ${fontSizes.base}px;
  --spacing: ${spacing.unit}px;
}
`;

// SQL with safe parameters (real implementation would use prepared statements)
function buildSQL(table, where, values) {
  let conditions = Object.entries(where)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(' AND ');
  return `SELECT * FROM ${table} WHERE ${conditions}`;
}

// Command line interface
function cliOutput(data) {
  return `
    ╔════════════════════════════════╗
    ║  ${data.title.padEnd(28)} ║
    ╠════════════════════════════════╣
    ${data.rows.map(row => `║  ${row.padEnd(28)} ║`).join('\n')}
    ╚════════════════════════════════╝
  `;
}

// Performance comparison
console.time('concatenation');
let result1 = '';
for (let i = 0; i < 1000; i++) {
  result1 = result1 + `Item ${i}, `;
}
console.timeEnd('concatenation');

console.time('template');
let items = [];
for (let i = 0; i < 1000; i++) {
  items.push(`Item ${i}`);
}
let result2 = items.join(', ');
console.timeEnd('template');

// Modern practice: template literals are idiomatic
// Use for clarity, not necessarily performance
// They perform well in modern engines
```
## 8.4 String Internationalization (i18n)

**Internationalization** handles locale-specific string operations for languages, character sets, and cultural conventions. JavaScript provides the `Intl` API for proper i18n support.

---

### 8.4.1 Intl.Collator

**Collator** performs locale-aware string comparison following linguistic rules.

```javascript
// Basic comparison (UTF-16 code point order - wrong for most languages!)
'ä' > 'z';                  // true (code point order)

// Correct linguistic comparison
let collator = new Intl.Collator('de');  // German locale
collator.compare('ä', 'z');  // -1 (ä < z in German)

// Create collator for specific language
let collatorDE = new Intl.Collator('de-DE');  // German (Germany)
let collatorFR = new Intl.Collator('fr-FR');  // French (France)
let collatorES = new Intl.Collator('es-ES');  // Spanish (Spain)

// Compare strings
collatorDE.compare('apple', 'Apple');  // 0 (case-insensitive by default)
collatorDE.compare('apple', 'äpple');  // 1 (a > ä)

// Compare results
// Negative: first string < second string
// Zero: strings are equal (for comparison purposes)
// Positive: first string > second string

collator.compare('a', 'b');  // -1
collator.compare('b', 'a');  // 1
collator.compare('a', 'a');  // 0

// Sorting with locale awareness
let names = ['Zachary', 'Anna', 'Änne', 'Bea'];
let collator2 = new Intl.Collator('en-US');
names.sort(collator2.compare);
// ['Anna', 'Änne', 'Bea', 'Zachary'] (locale-aware order)

// Without locale awareness
names.sort((a, b) => a.localeCompare(b, 'en-US'));
// Same result, different API

// Swedish collation (different from German)
let swCollator = new Intl.Collator('sv-SE');
let frCollator = new Intl.Collator('fr-FR');

// Same words, different order in different languages
let words = ['tio', 'tionde', 'tidigare'];
words.sort(swCollator.compare);    // Swedish order
words.sort(frCollator.compare);    // French order

// Case sensitivity options
let options1 = { caseFirst: 'upper' };  // Uppercase first
let collatorUpper = new Intl.Collator('en-US', options1);
collatorUpper.compare('a', 'A');  // 1 (A < a)

let options2 = { caseFirst: 'lower' };  // Lowercase first
let collatorLower = new Intl.Collator('en-US', options2);
collatorLower.compare('a', 'A');  // -1 (a < A)

// Numeric sorting
let numbers = ['10', '2', '1', '20'];
numbers.sort();              // ['1', '10', '2', '20'] (string order)

let numericCollator = new Intl.Collator('en-US', { numeric: true });
numbers.sort(numericCollator.compare);  // ['1', '2', '10', '20'] (numeric)

// Case insensitivity
let options3 = { sensitivity: 'accent' };  // Ignore case, respect accents
let accentCollator = new Intl.Collator('en-US', options3);
accentCollator.compare('café', 'cafe');  // 1 (different due to accent)

// Sensitivity levels
// 'base': Ignore case, accents, and variants (a ≈ A ≈ á ≈ ä)
// 'accent': Ignore case but respect accents (a ≈ A, but á ≠ a)
// 'case': Ignore accents but respect case (á ≈ a, but A ≠ a)
// 'variant': Respect all differences (default)

let baseCollator = new Intl.Collator('en-US', { sensitivity: 'base' });
baseCollator.compare('café', 'CAFE');  // 0 (considered equal)

// Ignore punctuation and spaces
let options4 = { ignorePunctuation: true };
let punctCollator = new Intl.Collator('en-US', options4);
punctCollator.compare('hello-world', 'helloworld');  // 0 (punctuation ignored)

// Resolve options (see what options were actually used)
let collator3 = new Intl.Collator('en-US', { numeric: true });
console.log(collator3.resolvedOptions());
// { locale: 'en-US', usage: 'sort', sensitivity: 'variant', numeric: true, ... }

// Binary collation (fast, but not locale-aware)
let binaryCollator = new Intl.Collator('en-US', { usage: 'search' });
// Different performance characteristics

// Real-world: Sort user list
function sortUsersByName(users, locale) {
  let collator = new Intl.Collator(locale);
  return users.sort((a, b) => collator.compare(a.name, b.name));
}

sortUsersByName([
  { name: 'Anna' },
  { name: 'Änne' },
  { name: 'Bea' }
], 'de-DE');

// Unicode collation algorithm (CLDR)
// JavaScript uses CLDR for comprehensive i18n support
// Each locale has specific sorting rules
```

---

### 8.4.2 Locale-Aware String Operations

**Locale-aware methods** handle language-specific transformations.

```javascript
// localeCompare() - ES3 method (pre-Intl alternative)
'a'.localeCompare('b', 'en-US');  // -1
'b'.localeCompare('a', 'en-US');  // 1
'a'.localeCompare('a', 'en-US');  // 0

// Equivalent to Intl.Collator but simpler
// localeCompare automatically handles many details

// Turkish: special I handling
let turkishCollator = new Intl.Collator('tr-TR');
'i'.localeCompare('I', 'tr-TR');  // Different in Turkish!

// German: ß (sharp s) sorting
let germanCollator = new Intl.Collator('de-DE');
'ß'.localeCompare('ss', 'de-DE');  // 0 (considered equivalent)

// Chinese: tone marks
let zhCollator = new Intl.Collator('zh-Hans');
'mā'.localeCompare('má', 'zh-Hans');  // -1 (different tones)

// Locale fallback
let unknown = new Intl.Collator('xyz-ABC');  // Non-existent locale
console.log(unknown.resolvedOptions().locale);  // Falls back to default

// List of available locales
let locales = Intl.Collator.supportedLocalesOf(['de', 'fr', 'xyz']);
// ['de', 'fr'] (xyz not supported)

// Right-to-left languages (Arabic, Hebrew)
let arabicCollator = new Intl.Collator('ar-SA');
// Handles RTL text properly

// Vietnamese: combining characters
'Việt'.localeCompare('Vietnam', 'vi-VN');  // Proper Vietnamese comparison

// Polish: special characters
'ł'.localeCompare('l', 'pl-PL');  // -1 (ł is distinct from l)

// Real-world: Search with locale awareness
function findByName(users, searchName, locale) {
  let collator = new Intl.Collator(locale, { sensitivity: 'base' });
  return users.filter(user => 
    collator.compare(user.name.toLowerCase(), searchName.toLowerCase()) === 0
  );
}

// Case conversion considerations
let str = 'İstanbul';        // Turkish: capital I with dot
str.toLowerCase();           // 'istanbul' (or 'i̇stanbul' - varies)
str.toLocaleLowerCase('tr'); // 'istanbul' (Turkish-aware)

let str2 = 'straße';         // German: lowercase sharp s
str2.toUpperCase();          // 'STRASSE' (becomes ss)
str2.toLocaleUpperCase('de'); // 'STRASSE' (German-aware)

// JavaScript has limited toLocaleUpperCase/toLowerCase
// Most work is done by browser/runtime

// Japanese: hiragana to katakana (limited support)
// Most special conversions require libraries

// Normalization (Unicode NFC vs NFD)
let composed = 'é';         // Precomposed form
let decomposed = 'e\u0301'; // Decomposed form

composed.localeCompare(decomposed, 'en-US');  // -1 (different!)
composed.normalize('NFC').localeCompare(decomposed.normalize('NFC'), 'en-US');  // 0 (same after normalization)

// Proper comparison for visually identical strings
function compareNormalized(str1, str2, locale) {
  return str1.normalize('NFC').localeCompare(str2.normalize('NFC'), locale);
}

compareNormalized('café', 'cafe\u0301', 'en-US');  // 1 (with vs without accent)

// For locale-aware string matching
function fuzzyMatch(str, pattern, locale) {
  let collator = new Intl.Collator(locale, { sensitivity: 'base' });
  return collator.compare(str, pattern) === 0;
}

fuzzyMatch('Café', 'cafe', 'en-US');  // true (ignoring case and accents)
```

---

### 8.4.3 Formatting with Locales

**Number, date, and currency formatting** depends on locale.

```javascript
// Number formatting by locale
let formatter_US = new Intl.NumberFormat('en-US');
formatter_US.format(1234.56);   // '1,234.56' (US format)

let formatter_DE = new Intl.NumberFormat('de-DE');
formatter_DE.format(1234.56);   // '1.234,56' (German format)

let formatter_FR = new Intl.NumberFormat('fr-FR');
formatter_FR.format(1234.56);   // '1 234,56' (French format)

// Currency formatting
let currencyUS = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
});
currencyUS.format(1234.56);     // '$1,234.56'

let currencyEU = new Intl.NumberFormat('de-DE', { 
  style: 'currency', 
  currency: 'EUR' 
});
currencyEU.format(1234.56);     // '1.234,56 €'

// Date formatting
let dateUS = new Intl.DateTimeFormat('en-US');
dateUS.format(new Date('2024-02-08'));  // '2/8/2024'

let dateDE = new Intl.DateTimeFormat('de-DE');
dateDE.format(new Date('2024-02-08'));  // '8.2.2024'

// Time formatting
let timeUS = new Intl.DateTimeFormat('en-US', { 
  hour: '2-digit', 
  minute: '2-digit' 
});
timeUS.format(new Date());      // '02:30 PM' (or AM)

let timeDE = new Intl.DateTimeFormat('de-DE', { 
  hour: '2-digit', 
  minute: '2-digit' 
});
timeDE.format(new Date());      // '14:30' (24-hour format)

// Collation performance implications
// Intl.Collator is optimized but slower than simple string comparison
// Use for user-facing sorting, cache collators for batch operations

let collator = new Intl.Collator('en-US');
let largeList = [...Array(10000).keys()].map(i => String(i));

console.time('collator sort');
largeList.sort(collator.compare);
console.timeEnd('collator sort');

console.time('binary sort');
largeList.sort((a, b) => a.localeCompare(b));
console.timeEnd('binary sort');

// Create collator once, reuse for multiple comparisons
function sortByLocale(items, locale) {
  let collator = new Intl.Collator(locale);
  return items.sort(collator.compare);  // Reuse single collator
}

// Not: creating new collator each comparison
items.sort((a, b) => 
  new Intl.Collator(locale).compare(a, b)  // ❌ Inefficient
);

// Pluralization (Intl.PluralRules - ES2018)
let pluralUS = new Intl.PluralRules('en-US');
pluralUS.select(0);         // 'other'
pluralUS.select(1);         // 'one'
pluralUS.select(2);         // 'other'

let pluralPL = new Intl.PluralRules('pl-PL');
pluralPL.select(1);         // 'one'
pluralPL.select(2);         // 'few' (Polish has more categories)
pluralPL.select(5);         // 'many'

function formatItems(count, locale) {
  let plural = new Intl.PluralRules(locale);
  let category = plural.select(count);
  
  switch(category) {
    case 'one': return `${count} item`;
    case 'other': return `${count} items`;
  }
}

formatItems(1, 'en-US');    // '1 item'
formatItems(5, 'en-US');    // '5 items'

// List formatting (Intl.ListFormat - ES2021)
let listFormatter = new Intl.ListFormat('en-US', { 
  style: 'long', 
  type: 'conjunction' 
});
listFormatter.format(['apple', 'banana', 'cherry']);
// 'apple, banana, and cherry'

let listShort = new Intl.ListFormat('en-US', { 
  style: 'short' 
});
listShort.format(['apple', 'banana', 'cherry']);
// 'apple, banana, cherry'

// Relative time formatting (Intl.RelativeTimeFormat - ES2020)
let rtf = new Intl.RelativeTimeFormat('en-US');
rtf.format(-1, 'day');      // 'yesterday'
rtf.format(0, 'day');       // 'today'
rtf.format(1, 'day');       // 'tomorrow'
rtf.format(-2, 'week');     // '2 weeks ago'

// Real-world: Multi-language application
class Translator {
  constructor(locale) {
    this.locale = locale;
    this.collator = new Intl.Collator(locale);
    this.numberFormatter = new Intl.NumberFormat(locale);
    this.dateFormatter = new Intl.DateTimeFormat(locale);
  }
  
  sort(items) {
    return items.sort(this.collator.compare);
  }
  
  formatNumber(num) {
    return this.numberFormatter.format(num);
  }
  
  formatDate(date) {
    return this.dateFormatter.format(date);
  }
}

let german = new Translator('de-DE');
let sorted = german.sort(['Bea', 'Anna', 'Änne']);
// ['Anna', 'Änne', 'Bea']

// Browser detection of user locale
let userLocale = navigator.language;  // 'en-US', 'de-DE', etc.

// Server-side (Node.js) locale handling
// Requires explicit locale data

// Locale selection best practices
// 1. Use navigator.language for browser
// 2. Use navigator.languages for array of preferences
// 3. Have fallback locale (usually 'en-US')
// 4. Cache collators/formatters for performance
// 5. Let browser/server provide locale, don't force it

function getUserLocale() {
  return navigator.languages?.[0] || navigator.language || 'en-US';
}

let userLoc = getUserLocale();  // Use for all Intl operations
```

---

### 8.4.4 Best Practices and Gotchas

**Common mistakes** and **proper patterns** for i18n.

```javascript
// ❌ WRONG: Assuming English sorting rules
['ä', 'z', 'a'].sort();     // ['a', 'ä', 'z'] (code point order)

// ✓ CORRECT: Use locale-aware sorting
let collator = new Intl.Collator('de-DE');
['ä', 'z', 'a'].sort(collator.compare);  // ['a', 'ä', 'z'] (German order)

// ❌ WRONG: Case conversion without locale
let word = 'straße';
word.toUpperCase();         // 'STRASSE' (loses context)

// ✓ CORRECT: Use locale-aware conversion
word.toLocaleUpperCase('de-DE');  // 'STRASSE' (German-aware)

// ❌ WRONG: Comparing strings without normalization
let s1 = 'café';           // Precomposed
let s2 = 'cafe\u0301';     // Decomposed
s1 === s2;                  // false (but visually identical!)

// ✓ CORRECT: Normalize before comparison
s1.normalize('NFC') === s2.normalize('NFC');  // true

// ❌ WRONG: Creating collator inside loop
for (let item of items) {
  results.push(items.filter(i => 
    new Intl.Collator(locale).compare(i, item) === 0  // Inefficient!
  ));
}

// ✓ CORRECT: Create collator once
let collator = new Intl.Collator(locale);
for (let item of items) {
  results.push(items.filter(i => 
    collator.compare(i, item) === 0  // Reuse!
  ));
}

// ❌ WRONG: Assuming ASCII-only strings
let str = 'Ñoño';
str.charAt(0) === 'Ñ';      // true (but might break with combining chars)

// ✓ CORRECT: Use spread or Array.from for proper character access
let chars = [...'Ñoño'];
chars[0];                   // 'Ñ' (correct even with complex chars)

// ❌ WRONG: Manual implementation of collation
function compare(a, b) {
  return a.charCodeAt(0) - b.charCodeAt(0);  // Wrong for many languages!
}

// ✓ CORRECT: Use Intl API
let collator = new Intl.Collator(locale);
collator.compare(a, b);     // Correct for any language

// ❌ WRONG: Ignoring RTL languages
// HTML: "Hello مرحبا" (mixing LTR and RTL)
// May display incorrectly without proper markup

// ✓ CORRECT: Use dir attribute
// <div dir="auto">Hello مرحبا</div>
// <div dir="ltr">English text</div>
// <div dir="rtl">نص عربي</div>

// Performance considerations
// Intl APIs are slower than simple string operations
// But necessary for correctness in multi-language apps

// Benchmark: 10,000 comparisons
let data = Array(10000).fill(0).map((_, i) => String(i));

// Simple comparison (fast, wrong for non-ASCII)
console.time('simple');
data.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
console.timeEnd('simple');

// Locale-aware (slower, correct)
let collator = new Intl.Collator('en-US');
console.time('collator');
data.sort(collator.compare);
console.timeEnd('collator');

// Difference usually <5-10ms for typical data

// Platform differences
// Intl support varies by browser/environment
// Always check support with try/catch

try {
  let collator = new Intl.Collator('en-US');
  items.sort(collator.compare);
} catch (e) {
  // Fallback to simple sort
  items.sort((a, b) => a.localeCompare(b));
}

// Locale data
// JavaScript relies on OS/browser for locale data
// Locale availability varies by platform

// Check support
let supported = Intl.Collator.supportedLocalesOf(['de', 'fr', 'xyz']);
// May return ['de', 'fr'] if xyz not supported

// Security: Locale injection
// Don't use user input for locale parameter
// ❌ let locale = userInput;  // Could be malicious
// ✓ let locale = supportedLocales[userInput] || 'en-US';

// Testing i18n
function testCollator() {
  let collator = new Intl.Collator('de-DE');
  
  assert(collator.compare('Ä', 'Z') < 0, 'German: Ä < Z');
  assert(collator.compare('ß', 'ss') === 0, 'German: ß = ss');
  assert(collator.compare('a', 'A') === 0, 'Case insensitive');
}

// Real-world: User preferences
class UserSettings {
  constructor(userId, preferences) {
    this.locale = preferences.locale || navigator.language;
    this.collator = new Intl.Collator(this.locale);
    this.numberFormatter = new Intl.NumberFormat(this.locale);
  }
  
  sortList(items) {
    return items.sort(this.collator.compare);
  }
  
  formatNumber(num) {
    return this.numberFormatter.format(num);
  }
}

// Server-side i18n (Node.js)
// Requires explicit configuration
// Example with ICU library:
// const { Collator } = require('icu4x');
// let collator = new Collator('de-DE');
```

---

## Summary: String Internationalization

**Key Takeaways:**

1. **Use Intl APIs** for any language-dependent string operations
2. **Create collators once** and reuse for performance
3. **Normalize strings** before comparison (NFC form)
4. **Respect user locale** from navigator or preferences
5. **Test with multiple languages** including RTL scripts
6. **Cache formatters** (NumberFormat, DateTimeFormat, etc.)
7. **Handle platform variations** gracefully
8. **Avoid manual implementations** of complex i18n logic

**Common Patterns:**

```javascript
// Pattern 1: Locale-aware sorting
let collator = new Intl.Collator(userLocale);
items.sort(collator.compare);

// Pattern 2: Normalized comparison
s1.normalize('NFC').localeCompare(s2.normalize('NFC'), userLocale);

// Pattern 3: Case conversion
str.toLocaleUpperCase(userLocale);
str.toLocaleLowerCase(userLocale);

// Pattern 4: Fuzzy matching (ignore accents)
let collator = new Intl.Collator(userLocale, { sensitivity: 'base' });
collator.compare(str.toLowerCase(), pattern.toLowerCase()) === 0;

// Pattern 5: Search with locale awareness
let collator = new Intl.Collator(userLocale, { sensitivity: 'base' });
results.filter(item => collator.compare(item.name, query) === 0);
```

## 8.5 Strings Summary

| Category | Methods |
|----------|---------|
| **Search** | `indexOf`, `includes`, `startsWith`, `endsWith`, `search` |
| **Extract** | `slice`, `substring`, `charAt`, `at` |
| **Transform** | `toUpperCase`, `toLowerCase`, `trim`, `padStart`, `padEnd` |
| **Split/Join** | `split`, `repeat` |
| **Replace** | `replace`, `replaceAll` |

---

**End of Chapter 8: Strings**
