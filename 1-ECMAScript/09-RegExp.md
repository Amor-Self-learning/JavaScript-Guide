# 9 Regular Expressions

Regular expressions are patterns for matching text. JavaScript provides the `RegExp` object and regex literals for powerful string pattern matching.

---

## 9.1 RegExp Basics

**Regular Expressions** are patterns used to match, search, and manipulate strings. They provide powerful pattern matching capabilities essential for text processing.

---

### 9.1.1 Literal Syntax

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

### 9.1.2 Constructor Syntax

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

### 9.1.3 Flags

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

### 9.1.4 RegExp Properties

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

### 9.1.5 Creating Regex Dynamically

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
## 9.2 Pattern Syntax

**Pattern syntax** defines the rules and notation used to specify what to match. Understanding patterns is fundamental to effective regex use.

---

### 9.2.1 Literal Characters and Escaping

**Literal characters** match exactly what they are unless they have special meaning.

```javascript
// Simple literal matches
/hello/.test('hello world');     // true
/hello/.test('Hello world');     // false (case-sensitive)

// Numbers as literals
/123/.test('abc123def');         // true

// Special characters need escaping
/./;                             // Matches any character
/\./;                            // Matches literal dot

// Escape sequences
let patterns = {
  dot: /\./,                     // Literal dot
  star: /\*/,                    // Literal asterisk
  plus: /\+/,                    // Literal plus
  question: /\?/,                // Literal question mark
  pipe: /\|/,                    // Literal pipe
  caret: /\^/,                   // Literal caret
  dollar: /\$/,                  // Literal dollar
  backslash: /\\/,               // Literal backslash
  bracket: /\[/,                 // Literal bracket
  paren: /\(/,                   // Literal parenthesis
  brace: /\{/                    // Literal brace
};

patterns.dot.test('3.14');       // true
patterns.dot.test('314');        // false

// Characters that don't need escaping (in most contexts)
/hello-world/.test('hello-world');   // true (hyphen safe outside char class)
/hello world/.test('hello world');   // true (space literal)
/hello_world/.test('hello_world');   // true (underscore literal)

// Escaping in strings for constructor
new RegExp('\\.');               // Matches literal dot
new RegExp('\\\\');              // Matches literal backslash
new RegExp('\\d');               // Matches digit (not literal d)

// Double escaping in constructor strings
let escapeInString = '\\d';      // String contains: \d
let regex = new RegExp(escapeInString);  // Matches any digit

// Numeric literals
/[0-9]/.test('5');               // true
/[0-9]/.test('a');               // false

// Word characters (alphanumeric + underscore)
/\w/.test('a');                  // true
/\w/.test('_');                  // true
/\w/.test('!');                  // false

// Whitespace characters
/\s/.test(' ');                  // true (space)
/\s/.test('\t');                 // true (tab)
/\s/.test('\n');                 // true (newline)
/\s/.test('a');                  // false

// Non-whitespace
/\S/.test('a');                  // true
/\S/.test(' ');                  // false
```

---

### 9.2.2 Character Classes

**Character classes** match any one character from a set.

```javascript
// Character class - any one character inside brackets
/[abc]/.test('a');               // true
/[abc]/.test('d');               // false
/[abc]/.test('abc');             // true (matches first 'a')

// Negated character class
/[^abc]/.test('d');              // true
/[^abc]/.test('a');              // false

// Range - characters between two values
/[a-z]/.test('m');               // true
/[a-z]/.test('M');               // false (case-sensitive)

// Multiple ranges
/[a-zA-Z]/.test('M');            // true
/[a-zA-Z]/.test('5');            // false

// Digit range
/[0-9]/.test('5');               // true
/[0-9]/.test('a');               // false

// Negated ranges
/[^0-9]/.test('a');              // true
/[^0-9]/.test('5');              // false

// Multiple characters and ranges
/[a-zA-Z0-9_]/.test('X');        // true (letter)
/[a-zA-Z0-9_]/.test('5');        // true (digit)
/[a-zA-Z0-9_]/.test('_');        // true (underscore)
/[a-zA-Z0-9_]/.test('!');        // false

// Special characters in class (usually don't need escaping)
/[!@#$%]/.test('@');             // true
/[.+*]/.test('+');               // true

// Hyphen must be escaped or positioned carefully
/[a-z]/.test('-');               // false (hyphen means range)
/[a-z-]/.test('-');              // true (hyphen at end)
/[-a-z]/.test('-');              // true (hyphen at start)
/[a\-z]/.test('-');              // true (escaped hyphen)

// Bracket needs escaping
/[]abc]/.test(']');              // true
/[abc\]]/.test(']');             // true

// Caret at start negates class
/[^abc]/.test('d');              // true (NOT a, b, or c)
/[^abc]/.test('a');              // false

// Caret not at start is literal
/[a^bc]/.test('^');              // true

// Common character classes
/[a-z]/.test('letter');          // true (lowercase)
/[A-Z]/.test('LETTER');          // true (uppercase)
/[0-9]/.test('123');             // true (digit)
/[0-9a-f]/.test('ff');           // true (hex digit)

// Combining multiple classes in pattern
/[0-9][a-z][A-Z]/.test('5aZ');   // true
/[0-9][a-z][A-Z]/.test('5a');    // false (need 3 chars)

// Negated complex classes
/[^a-zA-Z0-9]/.test('_');        // true (non-alphanumeric)
/[^a-zA-Z0-9]/.test('a');        // false (is alphanumeric)

// Unicode property escapes (modern)
/\p{Lowercase}/u.test('a');      // true
/\p{Uppercase}/u.test('A');      // true
/\p{Digit}/u.test('5');          // true

// Practical patterns
let lowercase = /[a-z]/;
let uppercase = /[A-Z]/;
let digit = /[0-9]/;
let alphanumeric = /[a-zA-Z0-9]/;
let hexDigit = /[0-9a-fA-F]/;
let specialChar = /[!@#$%^&*()]/;
```

---

### 9.2.3 Predefined Character Classes

**Predefined classes** are shorthand for common character sets.

```javascript
// Digit: [0-9]
/\d/.test('5');                  // true
/\d/.test('a');                  // false

// Non-digit: [^0-9]
/\D/.test('a');                  // true
/\D/.test('5');                  // false

// Word character: [a-zA-Z0-9_]
/\w/.test('a');                  // true
/\w/.test('_');                  // true
/\w/.test('5');                  // true
/\w/.test('!');                  // false

// Non-word character: [^a-zA-Z0-9_]
/\W/.test('!');                  // true
/\W/.test('a');                  // false

// Whitespace: [ \t\n\r\f\v]
/\s/.test(' ');                  // true (space)
/\s/.test('\t');                 // true (tab)
/\s/.test('\n');                 // true (newline)
/\s/.test('a');                  // false

// Non-whitespace: [^ \t\n\r\f\v]
/\S/.test('a');                  // true
/\S/.test(' ');                  // false

// Dot: any character except newline
/./.test('a');                   // true
/./.test('5');                   // true
/./.test('!');                   // true
/./.test('\n');                  // false

// Dot with dotAll flag (s): any character including newline
/./s.test('\n');                 // true

// Common combinations
/\d+/.test('123');               // true (one or more digits)
/\w+/.test('hello_world');       // true (word characters)
/\s+/.test('   ');               // true (whitespace)

// Mixed patterns
/\d\w\s/.test('5a ');            // true (digit, word char, whitespace)

// Negation patterns
/\D\D\D/.test('abc');            // true (3 non-digits)
/\D\D\D/.test('a5c');            // false (second is digit)

// Real-world examples
let phone = /\d{3}-\d{3}-\d{4}/; // Phone: ###-###-####
phone.test('555-123-4567');      // true

let slug = /^[a-z0-9-]+$/;       // Slugs: lowercase, numbers, hyphens
slug.test('my-slug-123');        // true
slug.test('My-Slug');            // false (uppercase)

let password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
// Password: at least 8 chars with digit, lowercase, uppercase

let whitespaceNorm = /\s+/g;     // Normalize multiple spaces
'hello    world'.replace(whitespaceNorm, ' ');  // 'hello world'

// Unicode categories (with 'u' flag)
/\p{Letter}/u.test('A');         // true
/\p{Letter}/u.test('α');         // true (Greek)
/\p{Letter}/u.test('5');         // false

/\p{Number}/u.test('5');         // true
/\p{Number}/u.test('٥');         // true (Arabic 5)

/\p{Punctuation}/u.test('.');    // true
/\p{Symbol}/u.test('€');         // true
```

---

### 9.2.4 Quantifiers

**Quantifiers** specify how many times to match.

```javascript
// Asterisk: 0 or more times
/a*/.test('');                   // true
/a*/.test('a');                  // true
/a*/.test('aaa');                // true

// Plus: 1 or more times
/a+/.test('');                   // false
/a+/.test('a');                  // true
/a+/.test('aaa');                // true

// Question mark: 0 or 1 time (optional)
/colou?r/.test('color');         // true
/colou?r/.test('colour');        // true
/colou?r/.test('coluur');        // false

// Exact count: {n}
/a{3}/.test('aa');               // false
/a{3}/.test('aaa');              // true
/a{3}/.test('aaaa');             // true (matches first 3)

// Minimum: {n,}
/a{2,}/.test('a');               // false
/a{2,}/.test('aa');              // true
/a{2,}/.test('aaa');             // true

// Range: {n,m}
/a{2,4}/.test('a');              // false
/a{2,4}/.test('aa');             // true
/a{2,4}/.test('aaa');            // true
/a{2,4}/.test('aaaa');           // true
/a{2,4}/.test('aaaaa');          // true (matches first 4)

// Common patterns
/\d{3}-\d{3}-\d{4}/.test('555-123-4567');  // Phone pattern
/[a-z]{2,4}/.test('go');         // 2-4 lowercase letters
/\w{8,}/.test('password123');    // 8+ word characters

// Greedy vs Non-greedy quantifiers
let greedy = /a+/;
'aaaa'.match(greedy);             // ['aaaa'] (matches all)

let nonGreedy = /a+?/;
'aaaa'.match(nonGreedy);          // ['a'] (matches minimum)

// Greedy by default with global
/\d+/g.exec('123 456 789');
// First match: '123' (all digits)

// Non-greedy with ?
/\d+?/g.exec('123 456');
// First match: '1' (minimum digits)

// HTML tag example (dangerous!)
/<.+>/.exec('<div>content</div>');
// ['<div>content</div>'] (greedy, matches too much!)

/<.+?>/.exec('<div>content</div>');
// ['<div>'] (non-greedy, matches tag)

// Combining quantifiers
/\d{3}-?\d{3}-?\d{4}/.test('555-1234');  // true (hyphen optional)
/\d{3}-?\d{3}-?\d{4}/.test('5551234');   // true

// Quantifier on groups (covered later)
/(ab){3}/.test('ababab');         // true
/(ab){3}/.test('ab');             // false

// Complex quantified patterns
let email = /[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
email.test('user@example.com');   // true

let url = /https?:\/\/[a-z0-9.-]+/i;
url.test('https://example.com');  // true
url.test('http://example.com');   // true

// Practical: flexible whitespace
/hello\s*world/.test('hello world');     // true
/hello\s*world/.test('hello    world');  // true
/hello\s*world/.test('helloworld');      // true

// Quantifier combinations
/a*b+c?d{2,}/;                   // 0+ 'a', 1+ 'b', 0-1 'c', 2+ 'd'
```

---

### 9.2.5 Anchors

**Anchors** match positions rather than characters.

```javascript
// Caret (^): start of string
/^hello/.test('hello world');     // true
/^hello/.test('say hello');       // false

// Dollar ($): end of string
/world$/.test('hello world');     // true
/world$/.test('world hello');     // false

// Both anchors: exact match
/^hello$/.test('hello');          // true
/^hello$/.test('hello world');    // false

// Multiline mode: ^ and $ match line boundaries
let text = 'line1\nline2\nline3';

/^line/.test(text);               // true (start of string)
/^line/m.test(text);              // true (start of string or line)

// Word boundary: \b
/\bworld\b/.test('hello world');  // true
/\bworld\b/.test('worldly');      // false

// Non-word boundary: \B
/\Bworld/.test('worldly');        // true (part of word)
/\Bworld/.test('hello world');    // false

// Practical patterns
let lineStart = /^hello/m;        // Start of any line
let lineEnd = /world$/m;          // End of any line
let exactMatch = /^hello$/;       // Entire string is 'hello'

// Finding whole words
let word = /\bword\b/;
word.test('word');                // true
word.test('words');               // false
word.test('sword');               // false

// Email-like: @ must not be at start/end
let email = /^[^@]+@[^@]+$/;
email.test('user@example.com');   // true
email.test('@example.com');       // false

// URL must start with protocol
let url = /^https?:\/\//;
url.test('https://example.com');  // true
url.test('example.com');          // false

// Line anchors in multiline
let lines = 'start\nmiddle\nend';
let endLines = /\w+$/gm;          // Each word at line end
lines.match(endLines);            // ['start', 'middle', 'end']

// Word boundary uses \w definition ([a-zA-Z0-9_])
/\b\d+\b/.test('123 abc');       // true
/\b\d+\b/.test('abc123');        // true
/\b\d+\b/.test('abc_123');       // false (_ connects them)

// Common anchor patterns
/^[a-z]/;                        // Start with lowercase
/[a-z]$/;                        // End with lowercase
/^\d{3}-\d{4}$/;                 // Exactly phone format
/^https?:\/\/\w+\.\w+$/;         // Basic URL validation

// Lookahead / Lookbehind (advanced, covered later)
/(?=@)/;                          // Positive lookahead
/(?!@)/;                          // Negative lookahead
/(?<=@)/;                         // Positive lookbehind
/(?<!@)/;                         // Negative lookbehind
```

---

### 9.2.6 Groups and Capture

**Groups** organize patterns and capture matched text.

```javascript
// Capturing group: parentheses ()
let regex = /(\d{3})-(\d{4})/;
let match = 'call 555-1234'.match(regex);
match[0];                        // '555-1234' (full match)
match[1];                        // '555' (first group)
match[2];                        // '1234' (second group)

// Multiple groups
let pattern = /(\w+)\s(\w+)/;
let text = 'John Doe';
let result = text.match(pattern);
result[1];                       // 'John'
result[2];                       // 'Doe'

// Non-capturing group: (?:...)
let nonCapture = /(?:cat|dog)/;
let match2 = nonCapture.exec('I have a cat');
match2[0];                       // 'cat'
match2[1];                       // undefined (no group)

// Capturing vs non-capturing
/(hello)/;                        // 1 group (captures)
/(?:hello)/;                      // 0 groups (non-capturing)

// Named groups: (?<name>...)
let namedPattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
let dateMatch = '2024-02-08'.match(namedPattern);
dateMatch.groups.year;           // '2024'
dateMatch.groups.month;          // '02'
dateMatch.groups.day;            // '08'

// Accessing named groups
let regex2 = /(?<first>\w+) (?<last>\w+)/;
let textMatch = 'Alice Bob'.match(regex2);
textMatch.groups;                // { first: 'Alice', last: 'Bob' }
textMatch.groups.first;          // 'Alice'

// Using groups in replacement
let phone = '5551234567';
phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
// '(555) 123-4567'

// Using named groups in replacement
let date = '2024-02-08';
date.replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  '$<day>/$<month>/$<year>'
);
// '08/02/2024'

// Groups with quantifiers
/(abc)+/.test('abcabcabc');      // true (repeat group)
/(abc)+/.exec('abcabcabc')[1];   // 'abc' (last occurrence)

// Nested groups
/((a)(b))/.exec('ab');
// ['ab', 'ab', 'a', 'b']
// Group 0: full match
// Group 1: outer group (ab)
// Group 2: inner group a
// Group 3: inner group b

// Optional groups
let pattern2 = /(\w+)(?:_(\w+))?/;
pattern2.exec('hello');          // ['hello', 'hello', undefined]
pattern2.exec('hello_world');    // ['hello_world', 'hello', 'world']

// Alternation with groups
/(cat|dog|bird)/.exec('I have a cat');
// ['cat', 'cat'] (group captures 'cat')

// Real-world: email extraction
let emailPattern = /([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+)/;
let email = emailPattern.exec('user@example.com');
email[1];                        // 'user'
email[2];                        // 'example.com'

// URL parsing
let urlPattern = /^(https?):\/\/([^\/]+)(\/.*)?$/;
let url = 'https://example.com/path/to/page';
let urlMatch = urlPattern.exec(url);
urlMatch[1];                     // 'https'
urlMatch[2];                     // 'example.com'
urlMatch[3];                     // '/path/to/page'

// Backreferences (matching repeated groups) - covered in 9.4
/(\w)\1/.test('hello');          // true (double letter 'l')
```

---

### 9.2.7 Alternation

**Alternation** matches one pattern or another.

```javascript
// Pipe (|): OR operator
/cat|dog/.test('I have a cat');  // true
/cat|dog/.test('I have a dog');  // true
/cat|dog/.test('I have a bird'); // false

// Multiple alternatives
/red|green|blue/.test('green');  // true

// Order matters (first match wins)
/cat|category/.test('category'); // true (matches 'cat' first)
/category|cat/.test('category'); // true (matches full 'category')

// Group alternations
/(cat|dog)/.exec('cat');         // ['cat', 'cat']
/(cat|dog)/.exec('dog');         // ['dog', 'dog']

// Complex alternations
let pattern = /\d{3}-\d{4}|\d{3}-\d{3}-\d{4}/;
pattern.test('555-1234');        // true
pattern.test('555-123-4567');    // true

// Alternation in groups
/(PNG|JPG|GIF)/.test('image.PNG');   // true
/(PNG|JPG|GIF)/.test('image.bmp');   // false

// Escaping in alternatives (no special meaning needed)
/hello|world|!/.test('!');       // true

// Longer to shorter (greedy matching)
/(is|isolate)/.exec('isolate');
// ['is', 'is'] (matches 'is' first)

/(isolate|is)/.exec('isolate');
// ['isolate', 'isolate'] (matches 'isolate')

// Real-world: file extensions
let imageFile = /\.(png|jpg|jpeg|gif|webp)$/i;
imageFile.test('photo.jpg');     // true
imageFile.test('photo.PNG');     // true
imageFile.test('photo.bmp');     // false

// Phone or email
let contactPattern = /\d{3}-\d{3}-\d{4}|[a-z]+@[a-z]+\.[a-z]+/i;
contactPattern.test('555-123-4567');       // true
contactPattern.test('user@example.com');   // true

// Protocols
let protocol = /^https?:\/\/(ftp:\/\/)?/;
protocol.test('https://');       // true
protocol.test('ftp://');         // true

// Time format (12 or 24 hour)
let time = /\d{1,2}:\d{2}(AM|PM)?/;
time.test('3:30PM');             // true
time.test('15:30');              // true

// Non-capturing alternation
/(?:cat|dog)/.exec('cat');
// ['cat'] (no capturing group)

// Mixed with other patterns
/^(start|begin) \w+/.test('start action');  // true
```

---

### 9.2.8 Lookahead and Lookbehind

**Lookahead and lookbehind** assert what comes before/after without consuming characters.

```javascript
// Positive lookahead: (?=pattern)
/\d+(?=px)/.exec('24px');        // ['24'] (digit followed by 'px')
/\d+(?=px)/.exec('24');          // null (no 'px' after)

// Negative lookahead: (?!pattern)
/\d+(?!px)/.exec('24');          // ['24'] (not followed by 'px')
/\d+(?!px)/.exec('24px');        // null (is followed by 'px')

// Positive lookbehind: (?<=pattern)
/(?<=\$)\d+/.exec('$50');        // ['50'] (preceded by $)
/(?<=\$)\d+/.exec('50');         // null (not preceded by $)

// Negative lookbehind: (?<!\$)
/(?<!\$)\d+/.exec('50');         // ['50'] (not preceded by $)
/(?<!\$)\d+/.exec('$50');        // null (is preceded by $)

// Combining lookahead and lookbehind
/(?<=\$)(\d+)(?=px)/.exec('$50px');  // ['50', '50']

// Real-world: extract number from price
let price = '$19.99';
/(?<=\$)[\d.]+/.exec(price)[0];  // '19.99'

// Password validation: must contain digit
/(?=.*\d)/.test('password');     // false
/(?=.*\d)/.test('password1');    // true

// Username not starting with underscore
/(?<!_)[a-z]+/.exec('_username');  // ['sername'] (starts at non-underscore)
/(?<!_)[a-z]+/.exec('username');   // ['username']

// Find word boundaries
/(?<=\s)\w+/.exec('hello world'); // ['world'] (after space)
/\w+(?=\s)/.exec('hello world');  // ['hello'] (before space)

// Complex password validation
let password = 'MyPass123!';
let hasUpper = /(?=.*[A-Z])/.test(password);      // true
let hasLower = /(?=.*[a-z])/.test(password);      // true
let hasDigit = /(?=.*\d)/.test(password);         // true
let hasSpecial = /(?=.*[!@#$%])/.test(password);  // true
let isLongEnough = /.{8,}/.test(password);        // true

// All conditions in one pattern
let strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%]).{8,}$/;
strongPassword.test(password);   // true

// Matching but not consuming
/foo(?=bar)/.exec('foobar');     // ['foo'] (bar not included)
/(?<=foo)bar/.exec('foobar');    // ['bar'] (foo not included)

// URL protocol not http
/https?(?=:\/\/)/.exec('https://');  // ['https']
/(?<!:)\/\//.exec('example.com://'); // No match
/(?<!:)\/\//.exec('example.com//');  // ['//']

// Variable-width lookbehind (not all engines support)
// /(?<=\$\d{1,3})/.test('$123'); // May not work in all browsers
```

---

## Summary: Pattern Syntax

**Key Takeaways:**

1. **Literal characters** match exactly; special chars need `\` escaping
2. **Character classes** `[abc]` match any one character; `[^abc]` negates
3. **Predefined classes**: `\d` (digit), `\w` (word), `\s` (space), `.` (any)
4. **Quantifiers**: `*` (0+), `+` (1+), `?` (0-1), `{n,m}` (range)
5. **Anchors**: `^` (start), `$` (end), `\b` (boundary)
6. **Groups**: `()` captures, `(?:)` non-captures, `(?<name>)` named captures
7. **Alternation**: `|` matches one or other pattern
8. **Lookahead/Lookbehind**: Assert without consuming: `(?=)`, `(?!)`, `(?<=)`, `(?<!)`

**Common Validation Patterns:**
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- URL: `/^https?:\/\/.+$/`
- Phone: `/^\d{3}-?\d{3}-?\d{4}$/`
- Strong password: `/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/`
- IP address: `/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/`

**Best Practices:**
- Use character classes `[a-z]` instead of alternation `a|b|c`
- Use non-capturing `(?:)` when you don't need the match
- Use lookahead `(?=...)` for assertions without consuming
- Test patterns thoroughly with edge cases
## 9.3 RegExp Methods

**RegExp methods** and **String methods for regex** perform matching, searching, and replacing operations.

---

### 9.3.1 RegExp.prototype.test()

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

### 9.3.2 RegExp.prototype.exec()

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

### 9.3.3 String Methods with RegExp

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
## 9.4 Advanced RegExp

**Advanced techniques** for mastering complex regex patterns and special features.

---

### 9.4.1 Backreferences

**Backreferences** allow referencing previously captured groups within a pattern.

```javascript
// Numbered backreference: \1, \2, etc.
// Match repeated characters
/(\w)\1/.test('hello');          // true ('l' repeated)
/(\w)\1/.test('hi');             // false (no repeats)

// Find word with doubled letter
/(\w)\1\w*/.exec('hello');       // ['ello'] (double 'l' found)

// Match HTML tags with same opening and closing
/<(\w+)>.*?<\/\1>/.test('<div>content</div>');  // true
/<(\w+)>.*?<\/\1>/.test('<div>content</span>'); // false

// Three-digit backreference
/(a)(b)(c)\3\2\1/.test('abccba');  // true (c, b, a in reverse)

// Multiple backreferences
/(\w+)\s(\w+)\2\s\1/.test('hello world world hello');  // true

// Using backreferences in replace
// Swap two words
'hello world'.replace(/(\w+)\s(\w+)/, '$2 $1');  // 'world hello'

// Double-up repeated characters
'hello'.replace(/(\w)\1/, '$1$1$1');  // 'helllo' (if had 'l' repeated)

// Format transformation
'2024-02-08'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
// '08/02/2024'

// Find repeated words
let repeatedWords = /\b(\w+)\s+\1\b/;
repeatedWords.test('the the');   // true
repeatedWords.test('the quick'); // false

// Remove duplicate words
'the the quick brown brown fox'.replace(/\b(\w+)\s+\1\b/g, '$1');
// 'the quick brown fox'

// Match pattern with backreference
/(.)(.)\2\1/.test('abba');       // true
/(.)(.)\2\1/.test('abcd');       // false

// Real-world: validate matching quotes
/"([^"]*)"|\{([^}]*)\}/.test('"hello"');  // true
/"([^"]*)"|\{([^}]*)\}/.test('{hello}');  // true

// Complex pattern: HTML with matching tags
function validateHTML(html) {
  return /<(\w+)[^>]*>.*?<\/\1>/.test(html);
}

validateHTML('<div class="box">content</div>');  // true

// Finding all repeated words
function findRepeatedWords(text) {
  let regex = /\b(\w+)\s+\1\b/gi;
  return text.match(regex) || [];
}

findRepeatedWords('the the dog dog bird');
// ['the the', 'dog dog']

// Case-insensitive backreference (needs group capture)
/([a-z]+):\s*\1/i.test('hello: HELLO');  // true

// Match quoted strings (any quote type)
/(['"]).*?\1/.test("'hello'");   // true
/(['"]).*?\1/.test('"hello"');   // true
/(['"]).*?\1/.test('"hello\'');  // false (mismatched)

// Multiple levels of backreferences
let nestPattern = /(\[)(\d+)(\1)(\2)/;
nestPattern.test('[[1]1');       // false
nestPattern.test('[1[[1]1');     // false (complex)

// Using backreference in lookahead (advanced)
/(\w+).*(?=\1)/.test('hello...hello');  // true

// Replace with backreference and function
'hello world'.replace(/(hello)|(world)/, (match, g1, g2) => {
  return g1 ? 'hi' : 'earth';    // 'hi world'
});
```

---

### 9.4.2 Named Capture Groups

**Named capture groups** make patterns more readable by naming groups.

```javascript
// Named group: (?<name>...)
let datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
let match = '2024-02-08'.match(datePattern);

// Access by name
match.groups.year;               // '2024'
match.groups.month;              // '02'
match.groups.day;                // '08'

// Also accessible by index
match[1];                        // '2024' (year)
match[2];                        // '02' (month)
match[3];                        // '08' (day)

// Multiple named groups
let emailPattern = /(?<user>[^@]+)@(?<domain>[^.]+)\.(?<tld>.+)/;
let email = 'john.doe@example.com'.match(emailPattern);
email.groups.user;               // 'john.doe'
email.groups.domain;             // 'example'
email.groups.tld;                // 'com'

// Using named groups in replace
let text = 'John: 25, Alice: 30';
let personPattern = /(?<name>\w+):\s*(?<age>\d+)/g;

text.replace(personPattern, '$<name> is $<age> years old');
// 'John is 25 years old, Alice is 30 years old'

// Named and unnamed groups mixed
let urlPattern = /^(?<protocol>https?):\/{2}(\w+)\.(?<domain>.+)$/;
let url = 'https://www.example.com'.match(urlPattern);
url.groups.protocol;             // 'https'
url.groups.domain;               // 'example.com'
url[2];                          // 'www' (unnamed group)

// Backreference with named groups
// Match repeated words (using named reference)
let repeatedPattern = /\b(?<word>\w+)\s+\k<word>\b/i;
repeatedPattern.test('hello hello');  // true
repeatedPattern.test('hello HELLO');  // true

// Parse person information with names
let personData = 'name: Alice, age: 30, city: NYC';
let personPattern = /(?<key>\w+):\s*(?<value>[^,}]+)/g;
let people = [...personData.matchAll(personPattern)];

people.forEach(match => {
  console.log(`${match.groups.key}: ${match.groups.value}`);
});
// Output:
// name: Alice
// age: 30
// city: NYC

// Complex parsing with named groups
let logPattern = /\[(?<time>\d{2}:\d{2}:\d{2})\]\s(?<level>\w+):\s(?<message>.*)/;
let log = '[14:30:45] ERROR: Database connection failed';
let parsed = log.match(logPattern);

parsed.groups.time;              // '14:30:45'
parsed.groups.level;             // 'ERROR'
parsed.groups.message;           // 'Database connection failed'

// Function receiving named groups
function processMatch(text) {
  let pattern = /(?<method>\w+)\s(?<url>.+)\s(?<status>\d+)/;
  let match = text.match(pattern);
  if (match) {
    return {
      method: match.groups.method,
      url: match.groups.url,
      status: parseInt(match.groups.status)
    };
  }
}

processMatch('GET /api/users 200');
// { method: 'GET', url: '/api/users', status: 200 }

// Optional named groups
let optionalPattern = /(?<first>\w+)(?:\s(?<last>\w+))?/;
'Alice'.match(optionalPattern).groups;     // { first: 'Alice', last: undefined }
'Alice Bob'.match(optionalPattern).groups; // { first: 'Alice', last: 'Bob' }

// Named group with multiple captures (last wins)
let multiCapture = /(?<digits>\d)+/;
let result = 'abc123def'.match(multiCapture);
result.groups.digits;            // '3' (last digit captured)

// Destructuring named groups
let { groups: { year, month, day } } = 
  '2024-02-08'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);

console.log(`${day}/${month}/${year}`);  // '08/02/2024'

// Real-world: Parse CSV with headers
function parseCSV(headerLine, dataLine) {
  let headers = headerLine.split(',').map(h => h.trim());
  let pattern = new RegExp(
    '(' + headers.map(h => `(?<${h}>[^,]+)`).join('|') + ')',
    'g'
  );
  // Complex to construct; simpler to split and assign
  let values = dataLine.split(',').map(v => v.trim());
  return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
}

parseCSV('name,age,city', 'Alice,30,NYC');
// { name: 'Alice', age: '30', city: 'NYC' }
```

---

### 9.4.3 Unicode and Property Escapes

**Unicode support** and **property escapes** for international text.

```javascript
// Unicode flag: 'u'
// Treats regex as Unicode sequences
/./u.test('😀');                 // true (matches emoji)
/./. test('😀');                 // false (without flag, matches half)

// Length with Unicode flag
'😀'.length;                     // 2 (UTF-16 code units)
[...'😀'].length;                // 1 (actual character)

// Unicode character class
/\p{Letter}/u.test('A');         // true
/\p{Letter}/u.test('α');         // true (Greek)
/\p{Letter}/u.test('中');        // true (Chinese)
/\p{Letter}/u.test('5');         // false

// Unicode digit class
/\p{Digit}/u.test('5');          // true
/\p{Digit}/u.test('٥');          // true (Arabic 5)
/\p{Digit}/u.test('五');         // false (Chinese character, not digit)

// Unicode number class
/\p{Number}/u.test('5');         // true
/\p{Number}/u.test('½');         // true (fraction)
/\p{Number}/u.test('Ⅻ');         // true (Roman numeral)

// Negated Unicode property
/\P{Letter}/u.test('5');         // true (not a letter)
/\P{Letter}/u.test('A');         // false (is a letter)

// Case properties
/\p{Uppercase}/u.test('A');      // true
/\p{Uppercase}/u.test('a');      // false

/\p{Lowercase}/u.test('a');      // true
/\p{Lowercase}/u.test('A');      // false

// Punctuation
/\p{Punctuation}/u.test('.');    // true
/\p{Punctuation}/u.test('!');    // true
/\p{Punctuation}/u.test('a');    // false

// Symbol
/\p{Symbol}/u.test('$');         // true
/\p{Symbol}/u.test('€');         // true
/\p{Symbol}/u.test('©');         // true
/\p{Symbol}/u.test('a');         // false

// Separator
/\p{Separator}/u.test(' ');      // true
/\p{Separator}/u.test('\n');     // true
/\p{Separator}/u.test('a');      // false

// Script property (requires special syntax in older engines)
/\p{Script=Latin}/u.test('Hello');     // true
/\p{Script=Greek}/u.test('Γεια');      // true
/\p{Script=Han}/u.test('你好');        // true

// Common Unicode patterns
let word = /\p{Letter}+/u;
word.test('Hello');              // true
word.test('مرحبا');              // true (Arabic)

let number = /\p{Number}+/u;
number.test('123');              // true
number.test('١٢٣');              // true (Arabic numerals)

// Validate international email (simplified)
let intlEmail = /^[\p{Letter}\p{Number}._%-]+@[\p{Letter}\p{Number}.-]+$/u;
intlEmail.test('用户@例え.jp');   // true (Japanese domains)

// Emoji detection
/\p{Emoji}/u.test('😀');         // true (if supported)
/\p{Emoji}/u.test('🎉');         // true

// Character categories
/\p{General_Category=Punctuation}/u.test('.');  // true
/\p{General_Category=Letter}/u.test('A');       // true

// Combining characters (diacritics)
let accented = 'e\u0301';       // é (e + combining acute)
/\p{Mark}/u.test(accented[1]);  // true (combining mark)

// Escape Unicode sequences
/\u0041/.test('A');              // true (code unit)
/\u{1F600}/.test('😀');          // true (full code point with flag)

// Text normalization for comparison
let s1 = 'café';                 // é as single character
let s2 = 'café';                 // e + combining acute
s1 === s2;                       // false (different representations)
s1.normalize() === s2.normalize();  // true (normalized)

// Match any script except Latin
/[^\p{Script=Latin}]/u.test('123');  // false (numbers are neutral)
/[^\p{Script=Latin}]/u.test('café'); // false (Latin)
/[^\p{Script=Latin}]/u.test('你好'); // true (Han script)

// Real-world: validate international phone
function isValidPhone(phone) {
  let pattern = /^\+?[\p{Digit}\s\-()]+$/u;
  return pattern.test(phone);
}

isValidPhone('+1 (555) 123-4567');  // true
isValidPhone('+44 7911 123456');    // true
```

---

### 9.4.4 lastIndex and Stateful Regex

**lastIndex** property maintains state for global and sticky regex.

```javascript
// Global regex: lastIndex persists across exec/test calls
let regex = /\d+/g;
regex.lastIndex;                 // 0 (initial)

regex.exec('a1b2c3');           // ['1']
regex.lastIndex;                // 2 (after match)

regex.exec('a1b2c3');           // ['2']
regex.lastIndex;                // 4

regex.exec('a1b2c3');           // ['3']
regex.lastIndex;                // 6

regex.exec('a1b2c3');           // null (no more)
regex.lastIndex;                // 0 (reset after failure)

// Important: String methods don't modify lastIndex
let regex2 = /\d+/g;
'a1b2c3'.match(regex2);          // ['1', '2', '3']
regex2.lastIndex;                // 0 (unchanged)

// Sticky flag: must match at lastIndex position
let sticky = /\d+/y;
sticky.exec('a1b2c3');           // null (no digit at position 0)

sticky.lastIndex = 1;
sticky.exec('a1b2c3');           // ['1']
sticky.lastIndex;                // 2

sticky.exec('a1b2c3');           // ['2']
sticky.lastIndex;                // 4

sticky.exec('a1b2c3');           // ['3']
sticky.lastIndex;                // 6

// Difference: global allows skipping, sticky doesn't
let globalRegex = /\d+/g;
let stickyRegex = /\d+/y;

globalRegex.exec('a  1b  2');    // ['1']
globalRegex.exec('a  1b  2');    // ['2'] (skipped spaces)

stickyRegex.lastIndex = 0;
stickyRegex.exec('a  1b  2');    // null (no digit at 0)

stickyRegex.lastIndex = 3;
stickyRegex.exec('a  1b  2');    // ['1']

// Token parsing with sticky
function tokenize(input) {
  let tokens = [];
  let regex = /(\d+|\+|-|\*|\/)/y;
  
  while (regex.lastIndex < input.length) {
    let match = regex.exec(input);
    if (!match) break;
    tokens.push(match[1]);
  }
  return tokens;
}

tokenize('12+34*5');             // ['12', '+', '34', '*', '5']

// Resetting lastIndex for reuse
let regex3 = /\d+/g;
function getAllNumbers(str) {
  regex3.lastIndex = 0;          // Reset before use
  return str.match(regex3);
}

getAllNumbers('a1b2');           // ['1', '2']
getAllNumbers('x9y8');           // ['9', '8']

// Manual iteration for complex logic
let regex4 = /\w+/g;
let match;
let words = [];

while ((match = regex4.exec('hello world')) !== null) {
  words.push({
    text: match[0],
    position: match.index,
    length: match[0].length
  });
}

words;
// [
//   { text: 'hello', position: 0, length: 5 },
//   { text: 'world', position: 6, length: 5 }
// ]

// Alternating between regex objects
let regex5 = /\d+/g;
let regex6 = /\w+/g;

regex5.exec('a1b2');             // ['1']
regex5.exec('a1b2');             // ['2'] (continues from last)

regex6.exec('a1b2');             // ['a'] (independent)
regex6.exec('a1b2');             // ['1'] (continues)

// lastIndex doesn't reset when pattern changes
let pattern = /\d/g;
pattern.lastIndex = 10;
pattern = /\w/g;                 // New regex, different lastIndex
pattern.lastIndex;               // 0

// Preserving lastIndex for re-entry
function findNextMatch(regex, string, startFrom = 0) {
  regex.lastIndex = startFrom;
  let match = regex.exec(string);
  return { match, nextIndex: regex.lastIndex };
}

let result1 = findNextMatch(/\d+/g, 'a1b2c3', 0);
let result2 = findNextMatch(/\d+/g, 'a1b2c3', result1.nextIndex);
// result1.match[0] = '1', nextIndex = 2
// result2.match[0] = '2', nextIndex = 4
```

---

### 9.4.5 Match Indices (d flag)

**Match indices** ('d' flag) provides start and end positions of matches and groups.

```javascript
// 'd' flag: provides indices array
let regex = /(\d{3})-(\d{4})/d;
let match = 'call 555-1234'.match(regex);

match[0];                        // '555-1234'
match.indices[0];                // [5, 12] (start, end of full match)
match.indices[1];                // [5, 8] (start, end of group 1: '555')
match.indices[2];                // [9, 12] (start, end of group 2: '1234')

// With global flag
let globalMatch = 'a1b2c3'.match(/(\d+)/gd);
globalMatch.forEach(match => {
  console.log(`${match[0]} at ${match.indices[0]}`);
});
// Output:
// 1 at 1,2
// 2 at 3,4
// 3 at 5,6

// Named groups with indices
let namedPattern = /(?<year>\d{4})-(?<month>\d{2})/d;
let dateMatch = '2024-02'.match(namedPattern);

dateMatch.groups.year;                    // '2024'
dateMatch.indices.groups.year;            // [0, 4]
dateMatch.indices.groups.month;           // [5, 7]

// Finding exact positions in text
function highlightMatches(text, pattern) {
  let matches = text.match(new RegExp(pattern, 'gd'));
  return matches.map(m => ({
    text: m[0],
    start: m.indices[0][0],
    end: m.indices[0][1]
  }));
}

highlightMatches('The year 2024 and 2025', '\\d+');
// [
//   { text: '2024', start: 9, end: 13 },
//   { text: '2025', start: 18, end: 22 }
// ]

// Replacing with position awareness
function replaceAtPositions(text, pattern, replacer) {
  let matches = text.match(new RegExp(pattern, 'gd'));
  let result = '';
  let lastIndex = 0;
  
  matches.forEach(match => {
    let [start, end] = match.indices[0];
    result += text.slice(lastIndex, start);
    result += replacer(match[0], match.indices);
    lastIndex = end;
  });
  
  result += text.slice(lastIndex);
  return result;
}

// Validate HTML structure
function checkHTMLTags(html) {
  let tags = html.match(/<(\w+)[^>]*>|<\/(\w+)>/gd);
  let stack = [];
  
  tags.forEach(tag => {
    let [start, end] = tag.indices[0];
    let isClose = tag.includes('</');
    let tagName = tag.match(/\w+/)[0];
    
    if (isClose) {
      if (stack[stack.length - 1] !== tagName) {
        console.log(`Mismatch at ${start}: expected </${stack[stack.length - 1]}>, got </${tagName}>`);
      } else {
        stack.pop();
      }
    } else {
      stack.push(tagName);
    }
  });
}

checkHTMLTags('<div><p>text</p></div>');  // Valid
checkHTMLTags('<div><p>text</div></p>');  // Mismatch detected
```

---

## Summary: Advanced RegExp

**Key Takeaways:**

1. **Backreferences** `\1`, `\2` - Match previously captured groups
2. **Named groups** `(?<name>...)` - Reference groups by name for clarity
3. **Unicode support** `\p{...}` with 'u' flag - Match international text
4. **lastIndex property** - Tracks position in global/sticky regex
5. **Sticky flag** 'y' - Must match at exact position
6. **Match indices** 'd' flag - Get start/end positions of matches

**When to Use:**

| Feature | Use Case |
|---------|----------|
| Backreferences | Match repeated patterns, validate matching tags |
| Named groups | Complex patterns, improved readability |
| Unicode escapes | International text, emoji, multilingual |
| lastIndex | Token parsing, stateful matching |
| Sticky flag | Tokenization, mandatory position matching |
| Match indices | Precise text replacement, syntax highlighting |

**Performance Considerations:**
- Backreferences can be slow (backtracking)
- Unicode flag adds overhead; use only when needed
- Cache compiled regex patterns
- Sticky regex faster for sequential parsing
- Match indices 'd' flag adds memory overhead

**Common Advanced Patterns:**
```javascript
// Email with international domain
/^[\p{Letter}\p{Number}._%-]+@[\p{Letter}\p{Number}.-]+$/u

// Token parsing
let tokens = [];
let tokenRegex = /(\d+|[+\-*/])/y;

// HTML tag matching
/<(\w+)[^>]*>.*?<\/\1>/

// Repeated word detection
/\b(\w+)\s+\1\b/i
```

## 9.5 RegExp Summary

| Flag | Meaning |
|------|---------|
| `g` | Global (all matches) |
| `i` | Case-insensitive |
| `m` | Multiline |
| `s` | Dotall (`.` matches newlines) |
| `u` | Unicode |
| `v` | Unicode sets (ES2024) |
| `d` | Indices |

---

**End of Chapter 9: Regular Expressions**
