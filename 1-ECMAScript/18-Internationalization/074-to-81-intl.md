# Internationalization (Intl)

## Table of Contents

- [18.1 Intl.DateTimeFormat](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#181-intldatetimeformat)
- [18.2 Intl.NumberFormat](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#182-intlnumberformat)
- [18.3 Intl.Collator](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#183-intlcollator)
- [18.4 Intl.PluralRules](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#184-intlpluralrules)
- [18.5 Intl.RelativeTimeFormat](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#185-intlrelativetimeformat)
- [18.6 Intl.ListFormat](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#186-intllistformat)
- [18.7 Intl.Locale](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#187-intllocale)
- [18.8 Intl.Segmenter](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#188-intlsegmenter)

---

## 18.1 Intl.DateTimeFormat

The Intl.DateTimeFormat object enables language-sensitive date and time formatting.

### Locale-Aware Date Formatting

DateTimeFormat adapts date formatting to different locales and cultural conventions.

**Basic Usage:**

```javascript
const date = new Date('2024-03-15T14:30:00');

// Different locales format dates differently
console.log(new Intl.DateTimeFormat('en-US').format(date));
// "3/15/2024"

console.log(new Intl.DateTimeFormat('en-GB').format(date));
// "15/03/2024"

console.log(new Intl.DateTimeFormat('de-DE').format(date));
// "15.3.2024"

console.log(new Intl.DateTimeFormat('ja-JP').format(date));
// "2024/3/15"

console.log(new Intl.DateTimeFormat('ar-EG').format(date));
// "١٥‏/٣‏/٢٠٢٤"

console.log(new Intl.DateTimeFormat('zh-CN').format(date));
// "2024/3/15"
```

**Formatting Multiple Dates:**

```javascript
const dates = [
  new Date('2024-01-01'),
  new Date('2024-06-15'),
  new Date('2024-12-31')
];

const formatter = new Intl.DateTimeFormat('en-US');

dates.forEach(date => {
  console.log(formatter.format(date));
});
// "1/1/2024"
// "6/15/2024"
// "12/31/2024"
```

**Using Default Locale:**

```javascript
const date = new Date('2024-03-15');

// Use user's default locale
const defaultFormatter = new Intl.DateTimeFormat();
console.log(defaultFormatter.format(date));

// Get the resolved locale
console.log(defaultFormatter.resolvedOptions().locale);
```

### Options (dateStyle, timeStyle, etc.)

DateTimeFormat accepts various options to customize formatting.

**dateStyle and timeStyle:**

```javascript
const date = new Date('2024-03-15T14:30:00');

// dateStyle only
console.log(new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full'
}).format(date));
// "Friday, March 15, 2024"

console.log(new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long'
}).format(date));
// "March 15, 2024"

console.log(new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
}).format(date));
// "Mar 15, 2024"

console.log(new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short'
}).format(date));
// "3/15/24"

// timeStyle only
console.log(new Intl.DateTimeFormat('en-US', {
  timeStyle: 'full'
}).format(date));
// "2:30:00 PM Coordinated Universal Time"

console.log(new Intl.DateTimeFormat('en-US', {
  timeStyle: 'long'
}).format(date));
// "2:30:00 PM UTC"

console.log(new Intl.DateTimeFormat('en-US', {
  timeStyle: 'medium'
}).format(date));
// "2:30:00 PM"

console.log(new Intl.DateTimeFormat('en-US', {
  timeStyle: 'short'
}).format(date));
// "2:30 PM"

// Both dateStyle and timeStyle
console.log(new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(date));
// "Mar 15, 2024, 2:30 PM"
```

**Individual Component Options:**

```javascript
const date = new Date('2024-03-15T14:30:45');

// Customize individual components
const formatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',    // "Friday"
  year: 'numeric',    // "2024"
  month: 'long',      // "March"
  day: 'numeric',     // "15"
  hour: 'numeric',    // "2"
  minute: '2-digit',  // "30"
  second: '2-digit',  // "45"
  hour12: true        // Use 12-hour format
});

console.log(formatter.format(date));
// "Friday, March 15, 2024 at 2:30:45 PM"

// 24-hour format
const formatter24 = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

console.log(formatter24.format(date));
// "14:30"
```

**Month and Weekday Formats:**

```javascript
const date = new Date('2024-03-15');

// Different month formats
console.log(new Intl.DateTimeFormat('en-US', {
  month: 'numeric'
}).format(date));
// "3"

console.log(new Intl.DateTimeFormat('en-US', {
  month: '2-digit'
}).format(date));
// "03"

console.log(new Intl.DateTimeFormat('en-US', {
  month: 'short'
}).format(date));
// "Mar"

console.log(new Intl.DateTimeFormat('en-US', {
  month: 'long'
}).format(date));
// "March"

console.log(new Intl.DateTimeFormat('en-US', {
  month: 'narrow'
}).format(date));
// "M"

// Different weekday formats
console.log(new Intl.DateTimeFormat('en-US', {
  weekday: 'short'
}).format(date));
// "Fri"

console.log(new Intl.DateTimeFormat('en-US', {
  weekday: 'long'
}).format(date));
// "Friday"

console.log(new Intl.DateTimeFormat('en-US', {
  weekday: 'narrow'
}).format(date));
// "F"
```

**Time Zone Handling:**

```javascript
const date = new Date('2024-03-15T14:30:00Z');

// Different time zones
console.log(new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  timeStyle: 'long',
  dateStyle: 'short'
}).format(date));
// "3/15/24, 10:30:00 AM EDT"

console.log(new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/London',
  timeStyle: 'long',
  dateStyle: 'short'
}).format(date));
// "3/15/24, 2:30:00 PM GMT"

console.log(new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo',
  timeStyle: 'long',
  dateStyle: 'short'
}).format(date));
// "3/15/24, 11:30:00 PM GMT+9"

// Show time zone name
console.log(new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  timeZoneName: 'long'
}).format(date));
// "3/15/2024, Pacific Daylight Time"

console.log(new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  timeZoneName: 'short'
}).format(date));
// "3/15/2024, PDT"
```

**formatToParts Method:**

```javascript
const date = new Date('2024-03-15T14:30:00');

const formatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const parts = formatter.formatToParts(date);
console.log(parts);
/*
[
  { type: 'weekday', value: 'Friday' },
  { type: 'literal', value: ', ' },
  { type: 'month', value: 'March' },
  { type: 'literal', value: ' ' },
  { type: 'day', value: '15' },
  { type: 'literal', value: ', ' },
  { type: 'year', value: '2024' }
]
*/

// Build custom format
const customFormat = parts
  .map(part => {
    if (part.type === 'weekday') return `**${part.value}**`;
    if (part.type === 'month') return part.value.toUpperCase();
    return part.value;
  })
  .join('');

console.log(customFormat);
// "**Friday**, MARCH 15, 2024"
```

**formatRange and formatRangeToParts:**

```javascript
const start = new Date('2024-03-15');
const end = new Date('2024-03-20');

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
});

// Format date range
console.log(formatter.formatRange(start, end));
// "Mar 15 – 20, 2024"

// Different locales
console.log(new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium'
}).formatRange(start, end));
// "15.–20. März 2024"

// Format range to parts
const rangeParts = formatter.formatRangeToParts(start, end);
console.log(rangeParts);
/*
[
  { type: 'month', value: 'Mar', source: 'startRange' },
  { type: 'literal', value: ' ', source: 'startRange' },
  { type: 'day', value: '15', source: 'startRange' },
  { type: 'literal', value: ' – ', source: 'shared' },
  { type: 'day', value: '20', source: 'endRange' },
  { type: 'literal', value: ', ', source: 'shared' },
  { type: 'year', value: '2024', source: 'shared' }
]
*/
```

**Practical Examples:**

```javascript
// Blog post timestamp
function formatBlogDate(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

console.log(formatBlogDate(new Date()));
// "March 15, 2024 at 2:30 PM"

// Event schedule
function formatEventTime(start, end, locale = 'en-US') {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit'
  });
  
  return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

const eventStart = new Date('2024-03-15T14:00:00');
const eventEnd = new Date('2024-03-15T16:00:00');

console.log(formatEventTime(eventStart, eventEnd));
// "Friday, March 15, 2:00 PM - 4:00 PM"

// Multi-locale support
function createLocalizedFormatter(locale) {
  return {
    short: new Intl.DateTimeFormat(locale, { dateStyle: 'short' }),
    medium: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }),
    long: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }),
    full: new Intl.DateTimeFormat(locale, { dateStyle: 'full' })
  };
}

const enFormatters = createLocalizedFormatter('en-US');
const date = new Date('2024-03-15');

console.log('Short:', enFormatters.short.format(date));
console.log('Medium:', enFormatters.medium.format(date));
console.log('Long:', enFormatters.long.format(date));
console.log('Full:', enFormatters.full.format(date));
```

---

## 18.2 Intl.NumberFormat

The Intl.NumberFormat object enables language-sensitive number formatting.

### Number Formatting

Basic number formatting with locale awareness.

**Basic Usage:**

```javascript
const number = 1234567.89;

// Different locales format numbers differently
console.log(new Intl.NumberFormat('en-US').format(number));
// "1,234,567.89"

console.log(new Intl.NumberFormat('de-DE').format(number));
// "1.234.567,89"

console.log(new Intl.NumberFormat('fr-FR').format(number));
// "1 234 567,89"

console.log(new Intl.NumberFormat('ar-EG').format(number));
// "١٬٢٣٤٬٥٦٧٫٨٩"

console.log(new Intl.NumberFormat('hi-IN').format(number));
// "12,34,567.89" (Indian numbering system)
```

**Decimal Places:**

```javascript
const number = 123.456789;

// Control decimal places
console.log(new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(number));
// "123.46"

console.log(new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
}).format(number));
// "123.4568"

// Significant digits
console.log(new Intl.NumberFormat('en-US', {
  minimumSignificantDigits: 5,
  maximumSignificantDigits: 5
}).format(number));
// "123.46"

console.log(new Intl.NumberFormat('en-US', {
  minimumSignificantDigits: 2,
  maximumSignificantDigits: 2
}).format(number));
// "120"
```

### Currency Formatting

Formatting numbers as currency with proper symbols and positioning.

**Basic Currency:**

```javascript
const amount = 1234.56;

// US Dollar
console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(amount));
// "$1,234.56"

// Euro
console.log(new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR'
}).format(amount));
// "1.234,56 €"

// Japanese Yen
console.log(new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY'
}).format(amount));
// "¥1,235" (no decimal places for JPY)

// British Pound
console.log(new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP'
}).format(amount));
// "£1,234.56"
```

**Currency Display Options:**

```javascript
const amount = 1234.56;

// Different currency display styles
console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'symbol'
}).format(amount));
// "$1,234.56"

console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'code'
}).format(amount));
// "USD 1,234.56"

console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'name'
}).format(amount));
// "1,234.56 US dollars"

console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol'
}).format(amount));
// "$1,234.56"
```

**Currency Sign:**

```javascript
const amount = -1234.56;

// Different sign display options
console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencySign: 'standard'
}).format(amount));
// "-$1,234.56"

console.log(new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencySign: 'accounting'
}).format(amount));
// "($1,234.56)"
```

### Unit Formatting

Formatting numbers with units (length, weight, speed, etc.).

**Basic Unit Formatting:**

```javascript
const value = 50;

// Distance units
console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'kilometer'
}).format(value));
// "50 km"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'mile'
}).format(value));
// "50 mi"

// Speed units
console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'kilometer-per-hour'
}).format(value));
// "50 km/h"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'mile-per-hour'
}).format(value));
// "50 mph"

// Weight units
console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'kilogram'
}).format(value));
// "50 kg"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'pound'
}).format(value));
// "50 lb"
```

**Unit Display Options:**

```javascript
const value = 50;

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'liter',
  unitDisplay: 'long'
}).format(value));
// "50 liters"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'liter',
  unitDisplay: 'short'
}).format(value));
// "50 L"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'liter',
  unitDisplay: 'narrow'
}).format(value));
// "50L"
```

**Complex Units:**

```javascript
// Temperature
console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'celsius'
}).format(25));
// "25°C"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'fahrenheit'
}).format(77));
// "77°F"

// Digital storage
console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'gigabyte'
}).format(256));
// "256 GB"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'megabyte'
}).format(512));
// "512 MB"

// Time
console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'hour'
}).format(24));
// "24 hr"

console.log(new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'minute'
}).format(90));
// "90 min"
```

### Compact Notation

Formatting large numbers in compact form (K, M, B, etc.).

**Compact Long:**

```javascript
console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'long'
}).format(1000));
// "1 thousand"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'long'
}).format(1500));
// "1.5 thousand"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'long'
}).format(1000000));
// "1 million"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'long'
}).format(1234567890));
// "1.2 billion"
```

**Compact Short:**

```javascript
console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1000));
// "1K"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1500));
// "1.5K"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1000000));
// "1M"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1234567890));
// "1.2B"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1234567890123));
// "1.2T"
```

**Locale Variations:**

```javascript
const number = 1234567;

console.log(new Intl.NumberFormat('de-DE', {
  notation: 'compact',
  compactDisplay: 'long'
}).format(number));
// "1,2 Millionen"

console.log(new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(number));
// "123万"

console.log(new Intl.NumberFormat('ja-JP', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(number));
// "123万"
```

**Scientific and Engineering Notation:**

```javascript
const number = 123456.789;

console.log(new Intl.NumberFormat('en-US', {
  notation: 'scientific'
}).format(number));
// "1.235E5"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'scientific',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(number));
// "1.23E5"

console.log(new Intl.NumberFormat('en-US', {
  notation: 'engineering'
}).format(number));
// "123.457E3"
```

**Practical Examples:**

```javascript
// Social media follower count
function formatFollowers(count, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(count);
}

console.log(formatFollowers(1234)); // "1.2K"
console.log(formatFollowers(1234567)); // "1.2M"
console.log(formatFollowers(1234567890)); // "1.2B"

// File size formatter
function formatFileSize(bytes, locale = 'en-US') {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: units[unitIndex],
    unitDisplay: 'short',
    maximumFractionDigits: 2
  }).format(size);
}

console.log(formatFileSize(1024)); // "1 KB"
console.log(formatFileSize(1536000)); // "1.46 MB"
console.log(formatFileSize(1073741824)); // "1 GB"

// Price formatter
function formatPrice(amount, currency, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

console.log(formatPrice(1234.56, 'USD')); // "$1,234.56"
console.log(formatPrice(1234.56, 'EUR', 'de-DE')); // "1.234,56 €"
console.log(formatPrice(1234.56, 'GBP', 'en-GB')); // "£1,234.56"
```

---

## 18.3 Intl.Collator

The Intl.Collator object enables language-sensitive string comparison.

### String Comparison

Comparing strings according to locale-specific rules.

**Basic Comparison:**

```javascript
const collator = new Intl.Collator('en-US');

console.log(collator.compare('apple', 'banana')); // -1 (apple < banana)
console.log(collator.compare('banana', 'apple')); // 1 (banana > apple)
console.log(collator.compare('apple', 'apple')); // 0 (equal)

// Use in sort
const fruits = ['banana', 'apple', 'cherry', 'date'];
console.log(fruits.sort(collator.compare));
// ['apple', 'banana', 'cherry', 'date']
```

**Locale-Specific Comparison:**

```javascript
const words = ['ä', 'z', 'a'];

// German - ä comes after a
console.log(words.sort(new Intl.Collator('de').compare));
// ['a', 'ä', 'z']

// Swedish - ä comes after z
console.log(words.sort(new Intl.Collator('sv').compare));
// ['a', 'z', 'ä']
```

**Case Sensitivity:**

```javascript
const items = ['Apple', 'banana', 'CHERRY', 'date'];

// Case-sensitive (default)
console.log(items.sort(new Intl.Collator('en', {
  sensitivity: 'case'
}).compare));
// ['Apple', 'CHERRY', 'banana', 'date']

// Case-insensitive
console.log(items.sort(new Intl.Collator('en', {
  sensitivity: 'base'
}).compare));
// ['Apple', 'banana', 'CHERRY', 'date']
```

**Sensitivity Options:**

```javascript
const collatorBase = new Intl.Collator('en', { sensitivity: 'base' });
const collatorAccent = new Intl.Collator('en', { sensitivity: 'accent' });
const collatorCase = new Intl.Collator('en', { sensitivity: 'case' });
const collatorVariant = new Intl.Collator('en', { sensitivity: 'variant' });

// 'base': only base letters differ
console.log(collatorBase.compare('a', 'á')); // 0 (equal)
console.log(collatorBase.compare('a', 'A')); // 0 (equal)

// 'accent': accents matter, case doesn't
console.log(collatorAccent.compare('a', 'á')); // -1 (different)
console.log(collatorAccent.compare('a', 'A')); // 0 (equal)

// 'case': case matters, accents don't
console.log(collatorCase.compare('a', 'á')); // 0 (equal)
console.log(collatorCase.compare('a', 'A')); // -1 (different)

// 'variant': both matter
console.log(collatorVariant.compare('a', 'á')); // -1 (different)
console.log(collatorVariant.compare('a', 'A')); // -1 (different)
```

### Sorting with Locale Awareness

Using Collator for proper locale-aware sorting.

**Numeric Sorting:**

```javascript
const files = ['file1.txt', 'file10.txt', 'file2.txt', 'file20.txt'];

// Default string sort (incorrect for numbers)
console.log(files.sort());
// ['file1.txt', 'file10.txt', 'file2.txt', 'file20.txt']

// Numeric collator
const numericCollator = new Intl.Collator('en', { numeric: true });
console.log(files.sort(numericCollator.compare));
// ['file1.txt', 'file2.txt', 'file10.txt', 'file20.txt']
```

**Ignoring Punctuation:**

```javascript
const words = ['coop', 'co-op', 'coöp'];

// With punctuation
console.log(words.sort(new Intl.Collator('en').compare));
// ['co-op', 'coop', 'coöp']

// Ignore punctuation
console.log(words.sort(new Intl.Collator('en', {
  ignorePunctuation: true
}).compare));
// ['coop', 'co-op', 'coöp']
```

**Complex Sorting Example:**

```javascript
const contacts = [
  { name: 'Müller', city: 'Berlin' },
  { name: 'SMITH', city: 'London' },
  { name: 'zhang', city: 'Beijing' },
  { name: 'Øberg', city: 'Oslo' }
];

// Sort by name (case-insensitive, locale-aware)
const nameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  usage: 'sort'
});

contacts.sort((a, b) => nameCollator.compare(a.name, b.name));

console.log(contacts.map(c => c.name));
// ['Müller', 'Øberg', 'SMITH', 'zhang']
```

**Search Usage:**

```javascript
// For searching (more lenient)
const searchCollator = new Intl.Collator('en', {
  usage: 'search',
  sensitivity: 'base'
});

function searchInList(list, query) {
  return list.filter(item => 
    searchCollator.compare(item, query) === 0
  );
}

const items = ['café', 'CAFÉ', 'Café', 'cafe'];
console.log(searchInList(items, 'cafe'));
// ['café', 'CAFÉ', 'Café', 'cafe'] (all match)
```

**Practical Sorting Examples:**

```javascript
// Multi-field sorting
function createSorter(fields, locales = 'en') {
  const collators = fields.map(field => ({
    key: field.key,
    collator: new Intl.Collator(locales, field.options || {})
  }));
  
  return function(a, b) {
    for (const { key, collator } of collators) {
      const result = collator.compare(a[key], b[key]);
      if (result !== 0) return result;
    }
    return 0;
  };
}

const users = [
  { lastName: 'Smith', firstName: 'John', age: 30 },
  { lastName: 'Smith', firstName: 'Alice', age: 25 },
  { lastName: 'Johnson', firstName: 'Bob', age: 35 }
];

const sorter = createSorter([
  { key: 'lastName', options: { sensitivity: 'base' } },
  { key: 'firstName', options: { sensitivity: 'base' } }
]);

users.sort(sorter);
console.log(users);
// Sorted by lastName, then firstName
```

---

## 18.4 Intl.PluralRules

The Intl.PluralRules object enables plural-sensitive formatting.

### Plural Form Selection

Determining the correct plural form for different locales.

**Basic Usage:**

```javascript
const enRules = new Intl.PluralRules('en-US');

console.log(enRules.select(0)); // "other"
console.log(enRules.select(1)); // "one"
console.log(enRules.select(2)); // "other"
console.log(enRules.select(5)); // "other"

// Different locales have different rules
const arRules = new Intl.PluralRules('ar-EG');

console.log(arRules.select(0)); // "zero"
console.log(arRules.select(1)); // "one"
console.log(arRules.select(2)); // "two"
console.log(arRules.select(5)); // "few"
console.log(arRules.select(11)); // "many"
console.log(arRules.select(100)); // "other"
```

**Ordinal vs Cardinal:**

```javascript
// Cardinal (default) - for counting
const cardinalRules = new Intl.PluralRules('en-US', {
  type: 'cardinal'
});

console.log(cardinalRules.select(1)); // "one"
console.log(cardinalRules.select(2)); // "other"
console.log(cardinalRules.select(3)); // "other"

// Ordinal - for ordering (1st, 2nd, 3rd, etc.)
const ordinalRules = new Intl.PluralRules('en-US', {
  type: 'ordinal'
});

console.log(ordinalRules.select(1)); // "one" (1st)
console.log(ordinalRules.select(2)); // "two" (2nd)
console.log(ordinalRules.select(3)); // "few" (3rd)
console.log(ordinalRules.select(4)); // "other" (4th)
console.log(ordinalRules.select(21)); // "one" (21st)
console.log(ordinalRules.select(22)); // "two" (22nd)
```

**Building Plural Messages:**

```javascript
function pluralize(count, singular, plural, locale = 'en-US') {
  const rules = new Intl.PluralRules(locale);
  const form = rules.select(count);
  
  const forms = {
    one: singular,
    other: plural
  };
  
  return `${count} ${forms[form] || plural}`;
}

console.log(pluralize(0, 'apple', 'apples')); // "0 apples"
console.log(pluralize(1, 'apple', 'apples')); // "1 apple"
console.log(pluralize(5, 'apple', 'apples')); // "5 apples"
```

**Complex Plural Rules:**

```javascript
function createPluralizer(locale, forms) {
  const rules = new Intl.PluralRules(locale);
  
  return function(count) {
    const form = rules.select(count);
    const template = forms[form] || forms.other;
    return template.replace('{count}', count);
  };
}

// English (simple: one/other)
const enPlural = createPluralizer('en-US', {
  one: '{count} item',
  other: '{count} items'
});

console.log(enPlural(0)); // "0 items"
console.log(enPlural(1)); // "1 item"
console.log(enPlural(5)); // "5 items"

// Polish (complex: one/few/many/other)
const plPlural = createPluralizer('pl-PL', {
  one: '{count} plik',
  few: '{count} pliki',
  many: '{count} plików',
  other: '{count} pliku'
});

console.log(plPlural(1)); // "1 plik"
console.log(plPlural(2)); // "2 pliki"
console.log(plPlural(5)); // "5 plików"
console.log(plPlural(1.5)); // "1.5 pliku"

// Arabic (very complex: zero/one/two/few/many/other)
const arPlural = createPluralizer('ar-EG', {
  zero: 'لا توجد عناصر',
  one: 'عنصر واحد',
  two: 'عنصران',
  few: '{count} عناصر',
  many: '{count} عنصراً',
  other: '{count} عنصر'
});

console.log(arPlural(0)); // "لا توجد عناصر"
console.log(arPlural(1)); // "عنصر واحد"
console.log(arPlural(2)); // "عنصران"
console.log(arPlural(5)); // "5 عناصر"
console.log(arPlural(11)); // "11 عنصراً"
```

**Ordinal Number Suffixes:**

```javascript
function getOrdinalSuffix(number, locale = 'en-US') {
  const ordinalRules = new Intl.PluralRules(locale, { type: 'ordinal' });
  const form = ordinalRules.select(number);
  
  const suffixes = {
    'en-US': {
      one: 'st',
      two: 'nd',
      few: 'rd',
      other: 'th'
    }
  };
  
  const localeSuffixes = suffixes[locale] || suffixes['en-US'];
  return number + localeSuffixes[form];
}

console.log(getOrdinalSuffix(1)); // "1st"
console.log(getOrdinalSuffix(2)); // "2nd"
console.log(getOrdinalSuffix(3)); // "3rd"
console.log(getOrdinalSuffix(4)); // "4th"
console.log(getOrdinalSuffix(21)); // "21st"
console.log(getOrdinalSuffix(22)); // "22nd"
console.log(getOrdinalSuffix(23)); // "23rd"
console.log(getOrdinalSuffix(24)); // "24th"
```

---

## 18.5 Intl.RelativeTimeFormat

The Intl.RelativeTimeFormat object enables language-sensitive relative time formatting.

### Relative Time Formatting ("2 days ago")

Formatting time differences in human-readable relative terms.

**Basic Usage:**

```javascript
const rtf = new Intl.RelativeTimeFormat('en-US');

// Past
console.log(rtf.format(-1, 'day')); // "1 day ago"
console.log(rtf.format(-2, 'day')); // "2 days ago"
console.log(rtf.format(-1, 'week')); // "1 week ago"

// Future
console.log(rtf.format(1, 'day')); // "in 1 day"
console.log(rtf.format(2, 'day')); // "in 2 days"
console.log(rtf.format(1, 'week')); // "in 1 week"

// Different units
console.log(rtf.format(-30, 'second')); // "30 seconds ago"
console.log(rtf.format(-5, 'minute')); // "5 minutes ago"
console.log(rtf.format(-2, 'hour')); // "2 hours ago"
console.log(rtf.format(-3, 'month')); // "3 months ago"
console.log(rtf.format(-1, 'year')); // "1 year ago"
```

**Style Options:**

```javascript
const value = -2;
const unit = 'day';

// Long style (default)
console.log(new Intl.RelativeTimeFormat('en-US', {
  style: 'long'
}).format(value, unit));
// "2 days ago"

// Short style
console.log(new Intl.RelativeTimeFormat('en-US', {
  style: 'short'
}).format(value, unit));
// "2 days ago"

// Narrow style
console.log(new Intl.RelativeTimeFormat('en-US', {
  style: 'narrow'
}).format(value, unit));
// "2 days ago"
```

**Numeric Options:**

```javascript
const rtfAuto = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto'
});

const rtfAlways = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'always'
});

// Auto uses words when possible
console.log(rtfAuto.format(-1, 'day')); // "yesterday"
console.log(rtfAuto.format(0, 'day')); // "today"
console.log(rtfAuto.format(1, 'day')); // "tomorrow"
console.log(rtfAuto.format(-2, 'day')); // "2 days ago"

// Always uses numbers
console.log(rtfAlways.format(-1, 'day')); // "1 day ago"
console.log(rtfAlways.format(0, 'day')); // "in 0 days"
console.log(rtfAlways.format(1, 'day')); // "in 1 day"
console.log(rtfAlways.format(-2, 'day')); // "2 days ago"
```

**Different Locales:**

```javascript
const value = -3;
const unit = 'day';

console.log(new Intl.RelativeTimeFormat('en-US').format(value, unit));
// "3 days ago"

console.log(new Intl.RelativeTimeFormat('es-ES').format(value, unit));
// "hace 3 días"

console.log(new Intl.RelativeTimeFormat('fr-FR').format(value, unit));
// "il y a 3 jours"

console.log(new Intl.RelativeTimeFormat('de-DE').format(value, unit));
// "vor 3 Tagen"

console.log(new Intl.RelativeTimeFormat('ja-JP').format(value, unit));
// "3 日前"

console.log(new Intl.RelativeTimeFormat('ar-EG').format(value, unit));
// "منذ ٣ أيام"
```

**formatToParts Method:**

```javascript
const rtf = new Intl.RelativeTimeFormat('en-US');

const parts = rtf.formatToParts(-2, 'day');
console.log(parts);
/*
[
  { type: 'integer', value: '2', unit: 'day' },
  { type: 'literal', value: ' ' },
  { type: 'unit', value: 'days' },
  { type: 'literal', value: ' ' },
  { type: 'literal', value: 'ago' }
]
*/

// Build custom format
const customFormat = parts
  .map(part => {
    if (part.type === 'integer') return `**${part.value}**`;
    return part.value;
  })
  .join('');

console.log(customFormat); // "**2** days ago"
```

**Practical Time Difference Calculator:**

```javascript
function getRelativeTime(date, locale = 'en-US') {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diff = date - now;
  
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (Math.abs(diff) < minute) {
    const value = Math.round(diff / second);
    return rtf.format(value, 'second');
  } else if (Math.abs(diff) < hour) {
    const value = Math.round(diff / minute);
    return rtf.format(value, 'minute');
  } else if (Math.abs(diff) < day) {
    const value = Math.round(diff / hour);
    return rtf.format(value, 'hour');
  } else if (Math.abs(diff) < week) {
    const value = Math.round(diff / day);
    return rtf.format(value, 'day');
  } else if (Math.abs(diff) < month) {
    const value = Math.round(diff / week);
    return rtf.format(value, 'week');
  } else if (Math.abs(diff) < year) {
    const value = Math.round(diff / month);
    return rtf.format(value, 'month');
  } else {
    const value = Math.round(diff / year);
    return rtf.format(value, 'year');
  }
}

// Test with various dates
const now = new Date();

console.log(getRelativeTime(new Date(now.getTime() - 30000))); // "30 seconds ago"
console.log(getRelativeTime(new Date(now.getTime() - 3600000))); // "1 hour ago"
console.log(getRelativeTime(new Date(now.getTime() - 86400000))); // "yesterday"
console.log(getRelativeTime(new Date(now.getTime() + 86400000))); // "tomorrow"
console.log(getRelativeTime(new Date(now.getTime() + 604800000))); // "next week"
```

---

## 18.6 Intl.ListFormat

The Intl.ListFormat object enables language-sensitive list formatting.

### List Formatting

Formatting lists of items with proper conjunctions and separators.

**Basic Usage:**

```javascript
const items = ['apple', 'banana', 'cherry'];

// Conjunction (and)
console.log(new Intl.ListFormat('en-US', {
  style: 'long',
  type: 'conjunction'
}).format(items));
// "apple, banana, and cherry"

// Disjunction (or)
console.log(new Intl.ListFormat('en-US', {
  style: 'long',
  type: 'disjunction'
}).format(items));
// "apple, banana, or cherry"

// Unit (no conjunction)
console.log(new Intl.ListFormat('en-US', {
  style: 'long',
  type: 'unit'
}).format(items));
// "apple, banana, cherry"
```

**Style Options:**

```javascript
const items = ['apple', 'banana', 'cherry'];

// Long style
console.log(new Intl.ListFormat('en-US', {
  style: 'long',
  type: 'conjunction'
}).format(items));
// "apple, banana, and cherry"

// Short style
console.log(new Intl.ListFormat('en-US', {
  style: 'short',
  type: 'conjunction'
}).format(items));
// "apple, banana, & cherry"

// Narrow style
console.log(new Intl.ListFormat('en-US', {
  style: 'narrow',
  type: 'conjunction'
}).format(items));
// "apple, banana, cherry"
```

**Different Locales:**

```javascript
const items = ['apple', 'banana', 'cherry'];

console.log(new Intl.ListFormat('en-US').format(items));
// "apple, banana, and cherry"

console.log(new Intl.ListFormat('es-ES').format(items));
// "apple, banana y cherry"

console.log(new Intl.ListFormat('fr-FR').format(items));
// "apple, banana et cherry"

console.log(new Intl.ListFormat('de-DE').format(items));
// "apple, banana und cherry"

console.log(new Intl.ListFormat('ja-JP').format(items));
// "apple、banana、cherry"

console.log(new Intl.ListFormat('ar-EG').format(items));
// "apple و banana و cherry"
```

**Two Items:**

```javascript
const twoItems = ['apple', 'banana'];

console.log(new Intl.ListFormat('en-US', {
  type: 'conjunction'
}).format(twoItems));
// "apple and banana"

console.log(new Intl.ListFormat('en-US', {
  type: 'disjunction'
}).format(twoItems));
// "apple or banana"
```

**One Item:**

```javascript
const oneItem = ['apple'];

console.log(new Intl.ListFormat('en-US').format(oneItem));
// "apple"
```

**formatToParts Method:**

```javascript
const items = ['apple', 'banana', 'cherry'];
const formatter = new Intl.ListFormat('en-US', { type: 'conjunction' });

const parts = formatter.formatToParts(items);
console.log(parts);
/*
[
  { type: 'element', value: 'apple' },
  { type: 'literal', value: ', ' },
  { type: 'element', value: 'banana' },
  { type: 'literal', value: ', and ' },
  { type: 'element', value: 'cherry' }
]
*/

// Build custom format
const customFormat = parts
  .map(part => {
    if (part.type === 'element') return `"${part.value}"`;
    return part.value;
  })
  .join('');

console.log(customFormat); // '"apple", "banana", and "cherry"'
```

**Practical Examples:**

```javascript
// Format user names
function formatUsernames(users, locale = 'en-US') {
  const names = users.map(u => u.name);
  return new Intl.ListFormat(locale, {
    type: 'conjunction'
  }).format(names);
}

const users = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' }
];

console.log(formatUsernames(users));
// "Alice, Bob, and Charlie"

// Format file names
function formatFileList(files, locale = 'en-US') {
  const formatter = new Intl.ListFormat(locale, {
    style: 'narrow',
    type: 'unit'
  });
  
  return `${files.length} files: ${formatter.format(files)}`;
}

console.log(formatFileList(['doc1.pdf', 'doc2.pdf', 'doc3.pdf']));
// "3 files: doc1.pdf, doc2.pdf, doc3.pdf"

// Format choices
function formatChoices(choices, locale = 'en-US') {
  return new Intl.ListFormat(locale, {
    type: 'disjunction'
  }).format(choices);
}

console.log(formatChoices(['red', 'blue', 'green']));
// "red, blue, or green"
```

---

## 18.7 Intl.Locale

The Intl.Locale object represents a Unicode locale identifier.

### Locale Identification

Working with locale identifiers and their components.

**Basic Locale:**

```javascript
const locale = new Intl.Locale('en-US');

console.log(locale.baseName); // "en-US"
console.log(locale.language); // "en"
console.log(locale.region); // "US"
console.log(locale.script); // undefined
```

**Locale with Script:**

```javascript
const locale = new Intl.Locale('zh-Hans-CN');

console.log(locale.baseName); // "zh-Hans-CN"
console.log(locale.language); // "zh"
console.log(locale.script); // "Hans" (Simplified)
console.log(locale.region); // "CN"
```

**Locale Options:**

```javascript
const locale = new Intl.Locale('en-US', {
  calendar: 'gregory',
  numberingSystem: 'latn',
  hourCycle: 'h12',
  caseFirst: 'upper'
});

console.log(locale.calendar); // "gregory"
console.log(locale.numberingSystem); // "latn"
console.log(locale.hourCycle); // "h12"
console.log(locale.caseFirst); // "upper"
console.log(locale.numeric); // false
```

**Unicode Extension:**

```javascript
// Using BCP 47 language tag
const locale = new Intl.Locale('en-US-u-ca-buddhist-nu-thai');

console.log(locale.calendar); // "buddhist"
console.log(locale.numberingSystem); // "thai"
console.log(locale.baseName); // "en-US"
console.log(locale.toString()); // "en-US-u-ca-buddhist-nu-thai"
```

**Maximize and Minimize:**

```javascript
// Maximize - add likely subtags
const short = new Intl.Locale('en');
const maximized = short.maximize();

console.log(short.toString()); // "en"
console.log(maximized.toString()); // "en-Latn-US"

// Minimize - remove likely subtags
const long = new Intl.Locale('en-Latn-US');
const minimized = long.minimize();

console.log(long.toString()); // "en-Latn-US"
console.log(minimized.toString()); // "en"
```

**Locale Information:**

```javascript
function getLocaleInfo(localeString) {
  const locale = new Intl.Locale(localeString);
  
  return {
    baseName: locale.baseName,
    language: locale.language,
    script: locale.script,
    region: locale.region,
    calendar: locale.calendar,
    collation: locale.collation,
    hourCycle: locale.hourCycle,
    numberingSystem: locale.numberingSystem,
    numeric: locale.numeric,
    caseFirst: locale.caseFirst
  };
}

console.log(getLocaleInfo('zh-Hans-CN-u-ca-chinese-nu-hanidec'));
/*
{
  baseName: 'zh-Hans-CN',
  language: 'zh',
  script: 'Hans',
  region: 'CN',
  calendar: 'chinese',
  collation: undefined,
  hourCycle: 'h23',
  numberingSystem: 'hanidec',
  numeric: false,
  caseFirst: 'false'
}
*/
```

---

## 18.8 Intl.Segmenter

The Intl.Segmenter object enables locale-sensitive text segmentation.

### Text Segmentation (Graphemes, Words, Sentences)

Breaking text into meaningful units according to locale rules.

**Grapheme Segmentation:**

```javascript
// Breaking text into grapheme clusters (user-perceived characters)
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

const text = 'Hello 👋 World 🌍';
const segments = segmenter.segment(text);

for (const segment of segments) {
  console.log(segment);
}
/*
{ segment: 'H', index: 0, input: 'Hello 👋 World 🌍', isWordLike: true }
{ segment: 'e', index: 1, input: 'Hello 👋 World 🌍', isWordLike: true }
{ segment: 'l', index: 2, input: 'Hello 👋 World 🌍', isWordLike: true }
{ segment: 'l', index: 3, input: 'Hello 👋 World 🌍', isWordLike: true }
{ segment: 'o', index: 4, input: 'Hello 👋 World 🌍', isWordLike: true }
{ segment: ' ', index: 5, input: 'Hello 👋 World 🌍', isWordLike: false }
{ segment: '👋', index: 6, input: 'Hello 👋 World 🌍', isWordLike: false }
{ segment: ' ', index: 8, input: 'Hello 👋 World 🌍', isWordLike: false }
...
*/

// Extract just the segments
const graphemes = Array.from(segments, s => s.segment);
console.log(graphemes);
// ['H', 'e', 'l', 'l', 'o', ' ', '👋', ' ', 'W', 'o', 'r', 'l', 'd', ' ', '🌍']
```

**Word Segmentation:**

```javascript
const segmenter = new Intl.Segmenter('en', { granularity: 'word' });

const text = 'Hello, world! How are you?';
const segments = segmenter.segment(text);

// Get only words (not punctuation/spaces)
const words = Array.from(segments)
  .filter(s => s.isWordLike)
  .map(s => s.segment);

console.log(words);
// ['Hello', 'world', 'How', 'are', 'you']

// Get all segments
for (const segment of segments) {
  console.log(`"${segment.segment}" at index ${segment.index}`);
}
/*
"Hello" at index 0
"," at index 5
" " at index 6
"world" at index 7
"!" at index 12
" " at index 13
"How" at index 14
" " at index 17
"are" at index 18
" " at index 21
"you" at index 22
"?" at index 25
*/
```

**Sentence Segmentation:**

```javascript
const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });

const text = 'Hello world. How are you? I am fine!';
const segments = segmenter.segment(text);

const sentences = Array.from(segments, s => s.segment);
console.log(sentences);
// ['Hello world. ', 'How are you? ', 'I am fine!']

// Trim sentences
const trimmed = sentences.map(s => s.trim());
console.log(trimmed);
// ['Hello world.', 'How are you?', 'I am fine!']
```

**Locale-Specific Segmentation:**

```javascript
// Thai doesn't use spaces between words
const thaiText = 'สวัสดีครับผมชื่อจอห์น';

const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
const segments = segmenter.segment(thaiText);

const words = Array.from(segments)
  .filter(s => s.isWordLike)
  .map(s => s.segment);

console.log(words);
// ['สวัสดี', 'ครับ', 'ผม', 'ชื่อ', 'จอห์น']

// Japanese text
const japaneseText = 'これは日本語のテストです';

const jpSegmenter = new Intl.Segmenter('ja', { granularity: 'word' });
const jpSegments = jpSegmenter.segment(japaneseText);

const jpWords = Array.from(jpSegments, s => s.segment);
console.log(jpWords);
// Properly segments Japanese text
```

**Practical Applications:**

```javascript
// Word counter
function countWords(text, locale = 'en') {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  const segments = segmenter.segment(text);
  
  return Array.from(segments).filter(s => s.isWordLike).length;
}

const essay = 'This is a sample essay. It has multiple sentences.';
console.log(`Word count: ${countWords(essay)}`);
// "Word count: 9"

// Sentence splitter
function splitSentences(text, locale = 'en') {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'sentence' });
  const segments = segmenter.segment(text);
  
  return Array.from(segments, s => s.segment.trim()).filter(s => s);
}

const paragraph = 'First sentence. Second sentence! Third sentence?';
console.log(splitSentences(paragraph));
// ['First sentence.', 'Second sentence!', 'Third sentence?']

// Truncate to word boundary
function truncateToWord(text, maxLength, locale = 'en') {
  if (text.length <= maxLength) return text;
  
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  const segments = Array.from(segmenter.segment(text));
  
  let result = '';
  for (const segment of segments) {
    if (result.length + segment.segment.length > maxLength) {
      break;
    }
    result += segment.segment;
  }
  
  return result.trim() + '...';
}

const longText = 'This is a very long text that needs to be truncated at a word boundary';
console.log(truncateToWord(longText, 30));
// "This is a very long text..."

// Extract first N words
function getFirstWords(text, count, locale = 'en') {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  const segments = segmenter.segment(text);
  
  const words = Array.from(segments).filter(s => s.isWordLike);
  return words.slice(0, count).map(s => s.segment).join(' ');
}

const article = 'JavaScript is a versatile programming language used for web development';
console.log(getFirstWords(article, 5));
// "JavaScript is a versatile programming"
```

---

## Summary

This document covered Internationalization (Intl) comprehensively:

- **Intl.DateTimeFormat**: Locale-aware date/time formatting with extensive options for date styles, time styles, components, and time zones
- **Intl.NumberFormat**: Number, currency, and unit formatting with compact notation and various display options
- **Intl.Collator**: Locale-aware string comparison and sorting with sensitivity and numeric options
- **Intl.PluralRules**: Determining correct plural forms for different locales (cardinal and ordinal)
- **Intl.RelativeTimeFormat**: Formatting relative time ("2 days ago") with style and numeric options
- **Intl.ListFormat**: Formatting lists with proper conjunctions and separators
- **Intl.Locale**: Working with locale identifiers and their components
- **Intl.Segmenter**: Text segmentation into graphemes, words, and sentences

The Intl API enables building truly internationalized applications that adapt to users' languages and cultural conventions.

---

**Related Topics to Explore Next:**

- ICU MessageFormat for complex message formatting
- Unicode and character encoding
- Right-to-left (RTL) text handling
- Locale negotiation strategies
- Translation management systems