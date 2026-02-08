# 9.4 Advanced RegExp

**Advanced techniques** for mastering complex regex patterns and special features.

---

## 9.4.1 Backreferences

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

## 9.4.2 Named Capture Groups

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

## 9.4.3 Unicode and Property Escapes

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

## 9.4.4 lastIndex and Stateful Regex

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

## 9.4.5 Match Indices (d flag)

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