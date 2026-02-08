# 9.3 RegExp Methods

**RegExp methods** and **String methods for regex** perform matching, searching, and replacing operations.

---

## 9.3.1 RegExp.prototype.test()

**test()** returns a boolean indicating whether a pattern matches.

```javascript
// Basic test
let regex = /hello/;
regex.test('hello world');       // true
regex.test('goodbye');           // false

// Returns true/false, not the match
let result = regex.test('hello');
typeof result;                   // 'boolean'

// Case-sensitive by default
/hello/.test('HELLO');           // false
/hello/i.test('HELLO');          // true

// Returns true on first match (with global flag)
let globalRegex = /o/g;
globalRegex.test('foo');         // true (found first 'o')
globalRegex.test('foo');         // true (found second 'o')
globalRegex.test('foo');         // false (no more 'o')
globalRegex.lastIndex;           // 0 (reset after final failure)

// test() with stateful regex (global/sticky)
let pattern = /\d+/g;
pattern.test('a1b2c3');          // true
pattern.lastIndex;               // 2

pattern.test('a1b2c3');          // true (continues from lastIndex)
pattern.lastIndex;               // 4

// Resetting for re-test
pattern.lastIndex = 0;
pattern.test('a1b2c3');          // true (starts over)

// Common use cases
if (/^[a-z]+$/.test(input)) {
  console.log('Valid: lowercase only');
}

let isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
let isUrl = /^https?:\/\/.+$/.test(url);

// Empty pattern matches everything
//.test('anything');              // true
//.test('');                      // true

// Common patterns
/\d/.test('5');                  // true
/\w/.test('a');                  // true
/\s/.test(' ');                  // true

// Performance: test() is fastest check
if (/pattern/.test(string)) {
  // Do something
}
// Faster than: string.includes() if pattern complex
// Equivalent to: string.match(/pattern/) !== null

// Pattern compilation
let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(email) {
  return emailPattern.test(email);
}

validateEmail('user@example.com');  // true
validateEmail('invalid');           // false
```

---

## 9.3.2 RegExp.prototype.exec()

**exec()** returns match details including captured groups or null.

```javascript
// Basic exec
let regex = /hello/;
let result = regex.exec('hello world');
result;                          // ['hello']
result[0];                       // 'hello' (full match)
result.index;                    // 0 (position)
result.input;                    // 'hello world' (original string)

// Returns null if no match
regex.exec('goodbye');           // null

// With groups
let pattern = /(\d{3})-(\d{4})/;
let match = pattern.exec('phone: 555-1234');
match[0];                        // '555-1234' (full match)
match[1];                        // '555' (first group)
match[2];                        // '1234' (second group)
match.index;                     // 7 (position in string)

// With named groups
let namedPattern = /(?<area>\d{3})-(?<line>\d{4})/;
let namedMatch = namedPattern.exec('555-1234');
namedMatch.groups.area;          // '555'
namedMatch.groups.line;          // '1234'

// Global regex: maintains lastIndex
let globalRegex = /\w+/g;
let first = globalRegex.exec('hello world');
first[0];                        // 'hello'
globalRegex.lastIndex;           // 5

let second = globalRegex.exec('hello world');
second[0];                       // 'world'
globalRegex.lastIndex;           // 11

let third = globalRegex.exec('hello world');
third;                           // null (no more matches)
globalRegex.lastIndex;           // 0 (reset)

// Finding all matches in loop
let regex2 = /\d+/g;
let match2;
let allMatches = [];
while ((match2 = regex2.exec('a1b22c333')) !== null) {
  allMatches.push(match2[0]);
}
allMatches;                      // ['1', '22', '333']

// Sticky regex: only matches at lastIndex
let sticky = /\d+/y;
sticky.lastIndex = 1;
sticky.exec('a1b2c3');           // ['1']

sticky.lastIndex = 0;
sticky.exec('a1b2c3');           // null (no digit at position 0)

// Match object properties
let ex = /(\w+)@(\w+)/.exec('user@example');
ex.length;                       // 3 (full match + 2 groups)
ex.index;                        // 0 (start position)
ex.input;                        // 'user@example'
ex.groups;                       // undefined (no named groups)

// Using exec for validation with details
function parseEmail(email) {
  let pattern = /^([^@]+)@([^@]+)$/;
  let match = pattern.exec(email);
  if (match) {
    return { username: match[1], domain: match[2] };
  }
  return null;
}

parseEmail('user@example.com');
// { username: 'user', domain: 'example.com' }

// Finding match position
function findPattern(string, pattern) {
  let regex = new RegExp(pattern);
  let match = regex.exec(string);
  if (match) {
    return { found: true, index: match.index, match: match[0] };
  }
  return { found: false };
}

// Loop pattern: get all matches with positions
function findAllMatches(string, pattern, flags = 'g') {
  let regex = new RegExp(pattern, flags);
  let match;
  let results = [];
  while ((match = regex.exec(string)) !== null) {
    results.push({ text: match[0], index: match.index });
  }
  return results;
}

findAllMatches('hello 123 world 456', '\\d+');
// [
//   { text: '123', index: 6 },
//   { text: '456', index: 18 }
// ]
```

---

## 9.3.3 String Methods with RegExp

**String methods** perform regex operations on strings.

```javascript
// match() - returns all matches (like exec with /g)
let text = 'hello world hello';
text.match(/hello/);             // ['hello'] (first match)
text.match(/hello/g);            // ['hello', 'hello'] (all matches)
text.match(/xyz/);               // null (no match)

// With groups
let pattern = /(\w+)@(\w+)/g;
text.match(pattern);             // ['user@example', ...] (full matches only)

// matchAll() - returns iterator with all details
let regex = /(\w+)@(\w+)/g;
let matches = [...text.matchAll(regex)];
matches.forEach(match => {
  console.log(match[0], match.index);  // Full match and position
});

// search() - returns index of first match
let str = 'hello world';
str.search(/o/);                 // 4 (position of first 'o')
str.search(/x/);                 // -1 (not found)

// Works with regex but not string patterns
str.search(/world/);             // 6
str.search('world');             // 6 (coerced to regex)

// replace() - replace first or all (with /g)
let replaced = 'hello world'.replace(/o/, 'O');
replaced;                        // 'hellO world' (first only)

let replaceAll = 'hello world'.replace(/o/g, 'O');
replaceAll;                      // 'hellO wOrld' (all)

// replaceAll() - ES2021, only replaces all
'hello world'.replaceAll('o', 'O');  // 'hellO wOrld'

// Replace with function
'hello world'.replace(/\w+/g, (match) => {
  return match.toUpperCase();
});
// 'HELLO WORLD'

// Replace function with groups
'555-1234'.replace(/(\d{3})-(\d{4})/, '($1) $2');
// '(555) 1234'

// Split with regex
let csv = 'apple,banana;cherry|date';
csv.split(/[,;|]/);              // ['apple', 'banana', 'cherry', 'date']

// Keep delimiters with capturing group
'hello123world456'.split(/(\d+)/);
// ['hello', '123', 'world', '456', '']

// Case-insensitive operations
let text2 = 'Hello WORLD';
text2.match(/hello/i);           // ['Hello']
text2.search(/world/i);          // 6
text2.replace(/hello/i, 'Hi');   // 'Hi WORLD'

// Real-world: highlight search results
function highlightMatches(text, keyword) {
  let regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

// Real-world: extract URLs
function extractUrls(text) {
  let regex = /https?:\/\/[^\s]+/g;
  return text.match(regex) || [];
}

// Real-world: validate and format phone
function formatPhone(phone) {
  let digits = phone.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

formatPhone('5551234567');       // '(555) 123-4567'

// Combining multiple operations
let email = 'USER@EXAMPLE.COM';
let processed = email
  .toLowerCase()
  .replace(/\s+/g, '')           // Remove spaces
  .match(/^[^\s@]+@[^\s@]+$/);   // Validate format

// includes() is faster for simple substring
'hello world'.includes('world');  // true (faster than regex)
/world/.test('hello world');     // true (slower)

// Performance: cached regex patterns
const DIGIT = /\d/;
const WORD = /\w+/g;
const WHITESPACE = /\s+/;

// Use cached patterns for repeated operations
for (let item of items) {
  WORD.lastIndex = 0;            // Reset for reuse
  let words = item.match(WORD);
}

// Match with position information
function findAllPositions(text, regex) {
  let match;
  let positions = [];
  if (!regex.global) {
    regex = new RegExp(regex.source, regex.flags + 'g');
  }
  while ((match = regex.exec(text)) !== null) {
    positions.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  return positions;
}

findAllPositions('hello world hello', /\w+/);
// [
//   { text: 'hello', start: 0, end: 5 },
//   { text: 'world', start: 6, end: 11 },
//   { text: 'hello', start: 12, end: 17 }
// ]
```

---

## Summary: RegExp Methods

**Key Takeaways:**

1. **test()** - Returns boolean (true/false), use for existence checks
2. **exec()** - Returns match details with groups, index, and input
3. **String.match()** - Returns all matches; null if none
4. **String.matchAll()** - Returns iterator with full details for each match
5. **String.search()** - Returns index of first match or -1
6. **String.replace()** - Replaces first match or all (with /g)
7. **String.split()** - Splits string by regex pattern

**Method Selection Guide:**

| Need | Method |
|------|--------|
| Check if matches | `regex.test()` or `string.includes()` |
| Get first match | `regex.exec()` or `string.match()` |
| Get all matches | `string.match(/g)` or `string.matchAll()` |
| Get match position | `regex.exec()` with `.index` |
| Find index | `string.search()` |
| Replace text | `string.replace()` or `string.replaceAll()` |
| Split string | `string.split(/pattern/)` |

**Performance Tips:**
- Cache regex patterns for reuse
- Use simple methods first: `includes()`, `startsWith()`, `endsWith()`
- Use `test()` for boolean checks (fastest)
- Use `search()` for first position only
- Use `match(/g)` or `matchAll()` for all matches
- Reset `lastIndex` when reusing global regex

**Common Patterns Reference:**
```javascript
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL = /^https?:\/\/.+$/;
const PHONE = /^\d{3}-?\d{3}-?\d{4}$/;
const DIGITS = /\d+/g;
const WORDS = /\w+/g;
const SPACES = /\s+/;
```