# 8.4 String Internationalization (i18n)

**Internationalization** handles locale-specific string operations for languages, character sets, and cultural conventions. JavaScript provides the `Intl` API for proper i18n support.

---

## 8.4.1 Intl.Collator

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

## 8.4.2 Locale-Aware String Operations

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

## 8.4.3 Formatting with Locales

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

## 8.4.4 Best Practices and Gotchas

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