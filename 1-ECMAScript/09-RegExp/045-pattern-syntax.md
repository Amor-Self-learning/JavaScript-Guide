# 9.2 Pattern Syntax

**Pattern syntax** defines the rules and notation used to specify what to match. Understanding patterns is fundamental to effective regex use.

---

## 9.2.1 Literal Characters and Escaping

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

## 9.2.2 Character Classes

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

## 9.2.3 Predefined Character Classes

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

## 9.2.4 Quantifiers

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

## 9.2.5 Anchors

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

## 9.2.6 Groups and Capture

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

## 9.2.7 Alternation

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

## 9.2.8 Lookahead and Lookbehind

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