# 9.1 RegExp Basics

**Regular Expressions** are patterns used to match, search, and manipulate strings. They provide powerful pattern matching capabilities essential for text processing.

---

## 9.1.1 Literal Syntax

**Literal syntax** uses forward slashes to define regex patterns directly in code.

```javascript
// Basic literal pattern
let regex = /hello/;
typeof regex;                    // 'object'
regex instanceof RegExp;         // true

// Test method - returns boolean
regex.test('hello world');       // true
regex.test('HELLO');             // false (case-sensitive by default)

// Match exact string
let pattern = /cat/;
pattern.test('cat');             // true
pattern.test('catch');           // true (contains 'cat')
pattern.test('dog');             // false

// Special characters need escaping
let decimal = /\./;              // Match literal dot (. is special)
decimal.test('3.14');            // true
decimal.test('314');             // false

// Multiple escape sequences
let regex2 = /\d\d\d-\d\d\d\d/;  // Pattern: ###-####
regex2.test('555-1234');         // true

// Empty regex (matches everything)
let empty = //;
empty.test('anything');          // true

// Complex pattern
let email = /@/;                 // Simple: contains @
email.test('user@example.com');  // true

// Literal regex is immutable
let r1 = /pattern/;
r1.source;                       // 'pattern'
r1.flags;                        // '' (no flags)

// Each literal creates new object
let r2 = /pattern/;
let r3 = /pattern/;
r2 === r3;                       // false (different objects)
r2.source === r3.source;         // true (same pattern)
```

**Syntax Limitations of Literals:**

```javascript
// ✓ Works with literal
let regex = /[a-z]+/;

// ✗ Cannot use variables in literal
let digit = 'd';
let badRegex = /\${digit}/;      // Literal: matches "${digit}"

// Must use variables → Constructor syntax needed
```

---

## 9.1.2 Constructor Syntax

**Constructor syntax** uses `new RegExp()` to create patterns with dynamic values.

```javascript
// Basic constructor
let regex = new RegExp('hello');
typeof regex;                    // 'object'
regex instanceof RegExp;         // true

// Equivalent to literal
/hello/.source === new RegExp('hello').source;  // true

// Constructor with flags (second parameter)
let caseInsensitive = new RegExp('hello', 'i');
caseInsensitive.test('HELLO');   // true

// Dynamic pattern using variables
let word = 'javascript';
let regex2 = new RegExp(word);
regex2.test('javascript');       // true
regex2.test('python');           // false

// Build pattern from user input
function buildPhoneRegex(format) {
  // format: "###-###-####"
  let pattern = format
    .replace(/#/g, '\\d')        // Replace # with \d
    .replace(/[()]/g, '\\$&');   // Escape parentheses
  return new RegExp('^' + pattern + '$');
}

let phoneRegex = buildPhoneRegex('(###) ###-####');
phoneRegex.test('(555) 123-4567');  // true

// Escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let literal = escapeRegex('example.com?');
// Returns: 'example\\.com\\?'
let regex3 = new RegExp(literal);
regex3.test('example.com?');     // true (literal match)

// String patterns vs literal escaping
new RegExp('\\d').test('5');     // true (\\d becomes \d)
/\d/.test('5');                  // true (literal \d)

// Double escaping in constructor
new RegExp('\\\\');              // Matches single backslash
/\\/;                            // Matches single backslash
// Constructor uses string escaping first, then regex interpretation

// Complex pattern with constructor
let domainPattern = new RegExp(
  '^' +                          // Start of string
  '[a-zA-Z0-9]+' +              // Domain name
  '\\.' +                        // Literal dot
  '[a-zA-Z]{2,}' +              // TLD
  '$'                            // End of string
);

domainPattern.test('example.com');   // true
domainPattern.test('example.c');     // false (TLD too short)

// Combining literals or dynamic patterns
function buildSearchPattern(keywords, caseSensitive = true) {
  let pattern = keywords.join('|');  // OR alternatives
  let flags = caseSensitive ? '' : 'i';
  return new RegExp(pattern, flags);
}

let search = buildSearchPattern(['cat', 'dog', 'bird']);
search.test('I have a cat');     // true

// Constructor with empty pattern
let empty = new RegExp('');
empty.test('');                  // true
empty.test('anything');          // true (empty matches everything)

// When to use literal vs constructor
// Literal: Known pattern at compile time
let knownPattern = /\d{3}-\d{3}-\d{4}/;

// Constructor: Dynamic pattern at runtime
let pattern = inputFromUser;
let dynamicRegex = new RegExp(pattern, 'i');

// Getting pattern information
let regex4 = /hello/gi;
regex4.source;                   // 'hello'
regex4.flags;                    // 'gi'
regex4.global;                   // true
regex4.ignoreCase;               // true
regex4.multiline;                // false

// Creating copy with different flags
let original = /pattern/;
let caseInsensitiveCopy = new RegExp(original.source, original.flags + 'i');
```

---

## 9.1.3 Flags

**Flags** modify how the regex behaves when matching.

```javascript
// Global flag (g) - find all matches
let globalRegex = /o/g;
let text = 'foo bar boo';
let matches = text.match(globalRegex);
matches;                         // ['o', 'o', 'o']

// Without g flag - only first match
let firstOnly = /o/;
text.match(firstOnly);           // ['o'] (only first)

// Case-insensitive flag (i)
let caseInsensitive = /hello/i;
caseInsensitive.test('HELLO');   // true
caseInsensitive.test('Hello');   // true
caseInsensitive.test('hello');   // true

// Multiline flag (m) - affects ^ and $
let multiline = /^test/m;
let lines = 'line1\ntest\nline3';
multiline.test(lines);           // true (^ matches line start in multiline)

// Without multiline flag
let singleline = /^test/;
singleline.test(lines);          // false (^ only matches string start)

// dotAll flag (s) - . matches newlines
let dotAll = /a.b/s;
dotAll.test('a\nb');             // true (. matches newline)

// Without s flag
let noDotAll = /a.b/;
noDotAll.test('a\nb');           // false (. doesn't match newline)

// Unicode flag (u) - proper Unicode support
let unicode = /./u;
let emoji = '😀';
emoji.match(unicode);            // ['😀'] (correctly matches emoji)

// Without u flag (treats emoji as 2 code units)
let noUnicode = /./;
emoji.match(noUnicode);          // ['?'] (only first code unit)

// Sticky flag (y) - match from lastIndex position
let sticky = /\d+/y;
sticky.lastIndex = 3;
'ab12cd'.match(sticky);          // null (no match at position 3)

sticky.lastIndex = 2;
'ab12cd'.match(sticky);          // ['12'] (matches at position 2)

// Global vs Sticky
// 'g': find any matches anywhere
// 'y': find match starting at lastIndex
// 'gy': find matches from lastIndex onwards

// Indices flag (d) - capture match indices (ES2022)
let indices = /\w+/gd;
'hello world'.match(indices);
// Results include indices property with [start, end] positions

// Combining flags
let combined = /pattern/igm;     // Case-insensitive, global, multiline
combined.flags;                  // 'gim'

// Getting individual flags
let regex = /test/gim;
regex.global;                    // true
regex.ignoreCase;                // true
regex.multiline;                 // true
regex.dotAll;                    // false
regex.unicode;                   // false
regex.sticky;                    // false
regex.hasIndices;                // false

// Creating regex with flags
new RegExp('pattern', 'gi');     // Global + case-insensitive
new RegExp('pattern', 'gim');    // Global + case-insensitive + multiline
new RegExp('pattern', 'giu');    // Global + case-insensitive + Unicode

// Flags affect behavior significantly
let text1 = 'Hello\nworld';

// Single-line (default ^/$ match string boundaries)
/^world/.test(text1);            // false

// Multiline (^/$ match line boundaries)
/^world/m.test(text1);           // true

// Case-sensitive (default)
/hello/.test(text1);             // false

// Case-insensitive
/hello/i.test(text1);            // true

// Real-world: regex with all flags
function validateInput(pattern, input, flags = 'i') {
  // flags: 'i' for case-insensitive, 'g' for global, etc.
  let regex = new RegExp(pattern, flags);
  return regex.test(input);
}

validateInput('hello', 'HELLO');  // true (default 'i' flag)
validateInput('hello', 'HELLO', 'g');  // true (with 'g')
validateInput('hello', 'hello');  // true

// Performance note: global regex with lastIndex
let globalRegex2 = /\d+/g;
globalRegex2.exec('a1b2c3');
// After exec, lastIndex is updated for next search
globalRegex2.lastIndex;          // 2 (position after match)
globalRegex2.exec('a1b2c3');
// Next exec continues from lastIndex
// This is useful for finding all matches in sequence
```

**Flag Summary Table:**

| Flag | Name | Effect | Example |
|------|------|--------|---------|
| `g` | Global | Find all matches | `/.../g` finds multiple |
| `i` | Case-insensitive | Ignore case | `/hello/i` matches "HELLO" |
| `m` | Multiline | `^`/`$` match lines | `/^text/m` matches after newline |
| `s` | Dotall | `.` matches newline | `/a.b/s` matches "a\nb" |
| `u` | Unicode | Proper Unicode | `/./u` correctly handles emoji |
| `y` | Sticky | Match from lastIndex | `/\d+/y` from specific position |
| `d` | Indices | Include match indices | `/\d+/d` returns positions (ES2022) |

---

## 9.1.4 RegExp Properties

**Properties** provide information about regex objects.

```javascript
// source property - get pattern string
let regex = /hello/i;
regex.source;                    // 'hello' (not the flags)

// flags property - get all flags
regex.flags;                     // 'i'

let regex2 = /test/gim;
regex2.flags;                    // 'gim'

// Individual flag properties
let regex3 = /pattern/gi;
regex3.global;                   // true
regex3.ignoreCase;               // true
regex3.multiline;                // false
regex3.dotAll;                   // false
regex3.unicode;                  // false
regex3.sticky;                   // false
regex3.hasIndices;               // false

// lastIndex - position of next match (with g/y flags)
let globalRegex = /\d/g;
globalRegex.lastIndex;           // 0 (initial)

globalRegex.exec('a1b2c3');      // ['1']
globalRegex.lastIndex;           // 2 (after first match)

globalRegex.exec('a1b2c3');      // ['2']
globalRegex.lastIndex;           // 4 (after second match)

// Resetting lastIndex for re-executing
globalRegex.lastIndex = 0;       // Reset
globalRegex.exec('a1b2c3');      // ['1'] (starts from beginning)

// lastIndex with sticky flag
let sticky = /\d/y;
sticky.lastIndex = 0;
sticky.exec('a1b2c3');           // null (no digit at position 0)

sticky.lastIndex = 1;
sticky.exec('a1b2c3');           // ['1'] (digit at position 1)

// lastIndex is not reset automatically with test()
let regex4 = /\d/g;
regex4.test('1a2b3');            // true
regex4.lastIndex;                // 1

regex4.test('1a2b3');            // true (continues from lastIndex)
regex4.lastIndex;                // 3

regex4.test('1a2b3');            // false (no more digits)
regex4.lastIndex;                // 0 (reset when match fails)

// Getting all regex info
function regexInfo(regex) {
  return {
    source: regex.source,
    flags: regex.flags,
    global: regex.global,
    ignoreCase: regex.ignoreCase,
    multiline: regex.multiline,
    dotAll: regex.dotAll,
    unicode: regex.unicode,
    sticky: regex.sticky,
    hasIndices: regex.hasIndices,
    lastIndex: regex.lastIndex
  };
}

regexInfo(/hello/gi);
// Returns all properties in one object

// Regex equality comparison
let r1 = /pattern/i;
let r2 = /pattern/i;
r1 === r2;                       // false (different objects)

// Compare patterns and flags
function regexEqual(r1, r2) {
  return r1.source === r2.source && r1.flags === r2.flags;
}

regexEqual(/pattern/i, /pattern/i);  // true

// Common pattern: check flag status
function isGlobal(regex) {
  return regex.global;
}

function isCaseInsensitive(regex) {
  return regex.ignoreCase;
}

// Creating copy with modified flags
function addFlag(regex, flag) {
  let newFlags = regex.flags;
  if (!newFlags.includes(flag)) {
    newFlags += flag;
  }
  return new RegExp(regex.source, newFlags);
}

let original = /test/;
let withGlobal = addFlag(original, 'g');
withGlobal.flags;                // 'g'

// Removing flags
function removeFlag(regex, flag) {
  let newFlags = regex.flags.replace(flag, '');
  return new RegExp(regex.source, newFlags);
}

let removeCase = removeFlag(/test/i, 'i');
removeCase.flags;                // ''
```

---

## 9.1.5 Creating Regex Dynamically

**Dynamic regex** construction enables pattern building at runtime.

```javascript
// Basic dynamic pattern
function searchFor(keyword) {
  return new RegExp(keyword, 'i');
}

let emailSearch = searchFor('email');
emailSearch.test('EMAIL');       // true

// Escaping dynamic input
function literalRegex(str) {
  let escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped);
}

let userInput = 'example.com?';
let regex = literalRegex(userInput);
regex.test('example.com?');      // true (matches literally)
regex.test('exampleXcom');       // false

// Building complex patterns
function rangePattern(from, to) {
  return new RegExp(`[${from}-${to}]`);
}

let lowercase = rangePattern('a', 'z');
lowercase.test('m');             // true
lowercase.test('5');             // false

// OR pattern from array
function anyOf(...words) {
  let pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(pattern, 'i');
}

let colors = anyOf('red', 'blue', 'green');
colors.test('RED');              // true
colors.test('purple');           // false

// Building pattern with optional parts
function optionalPattern(required, optional = '') {
  let pattern = required + (optional ? `(${optional})?` : '');
  return new RegExp(pattern);
}

let areaCode = optionalPattern('\\d{3}', '[- ]?');
areaCode.test('123-4567');       // true
areaCode.test('1234567');        // true

// Quantifier patterns
function repeatPattern(char, min, max) {
  let quantifier = max ? `{${min},${max}}` : `{${min}}`;
  return new RegExp(char + quantifier);
}

let threeDigits = repeatPattern('\\d', 3);
threeDigits.test('123');         // true
threeDigits.test('12');          // false

// Conditional patterns
function emailRegex() {
  let localPart = '[a-zA-Z0-9._%-]+';
  let domain = '[a-zA-Z0-9.-]+';
  let tld = '[a-zA-Z]{2,}';
  let pattern = `^${localPart}@${domain}\\.${tld}$`;
  return new RegExp(pattern);
}

let emailReg = emailRegex();
emailReg.test('user@example.com');  // true

// Template-based patterns
function createMatcher(template) {
  // Replace placeholders with patterns
  let pattern = template
    .replace(/{NUMBER}/g, '\\d+')
    .replace(/{WORD}/g, '\\w+')
    .replace(/{LETTER}/g, '[a-z]')
    .replace(/{SPACE}/g, '\\s');
  return new RegExp(pattern, 'i');
}

let matcher = createMatcher('Name: {WORD}, Age: {NUMBER}');
matcher.test('Name: Alice, Age: 25');  // true

// Performance: compile frequently used patterns once
const COMMON_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+$/,
  phone: /^\d{3}-?\d{3}-?\d{4}$/,
  zipcode: /^\d{5}(-\d{4})?$/
};

COMMON_PATTERNS.email.test('user@example.com');  // true

// Memoization for expensive patterns
const patternCache = new Map();

function getCachedPattern(patternStr, flags = '') {
  const key = patternStr + flags;
  if (!patternCache.has(key)) {
    patternCache.set(key, new RegExp(patternStr, flags));
  }
  return patternCache.get(key);
}

getCachedPattern('\\d+', 'g');   // Creates and caches
getCachedPattern('\\d+', 'g');   // Returns cached version
```

---

## Summary: RegExp Basics

**Key Takeaways:**

1. **Literal syntax** (`/.../flags`) for compile-time patterns
2. **Constructor syntax** (`new RegExp()`) for dynamic patterns
3. **Flags modify behavior**: `g` (global), `i` (case-insensitive), `m` (multiline), `s` (dotall), `u` (Unicode), `y` (sticky), `d` (indices)
4. **Properties** include `source`, `flags`, individual flag properties, and `lastIndex`
5. **Dynamic patterns** enable runtime pattern construction with proper escaping

**When to Use Each:**
- **Literal**: Known patterns, slightly better performance
- **Constructor**: Dynamic patterns, user input, runtime configuration

**Common Patterns Reference:**
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- URL: `/^https?:\/\/.+$/`
- Phone: `/^\d{3}-?\d{3}-?\d{4}$/`
- Digits: `/\d+/g`
- Word: `/\w+/`
- Whitespace: `/\s+/`

**Best Practice:**
```javascript
// Cache frequently used patterns
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS = /\d+/g;

// Use literal for static patterns
let result = EMAIL.test(input);

// Use constructor for dynamic patterns
let pattern = new RegExp(userInput, 'i');
```