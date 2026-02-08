# 8.2 String Methods

**String methods** allow searching, manipulation, and transformation of strings. All methods return new strings (strings are immutable).

---

## 8.2.1 Character Code Methods

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

## 8.2.2 Searching and Matching

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

## 8.2.3 String Replacement

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

## 8.2.4 String Extraction

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

## 8.2.5 String Transformation

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

## 8.2.6 Advanced Pattern Matching

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