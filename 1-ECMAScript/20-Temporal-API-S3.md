# 20 Temporal API (Stage 3)

---

## Why Temporal Matters

The JavaScript `Date` object is fundamentally broken. It was copied from Java's `java.util.Date` in 1995, which Java itself deprecated in 1997. Every professional JavaScript developer has encountered these problems:

### Problems with Date

```javascript
// ❌ Problem 1: Months are 0-indexed (January = 0)
const date = new Date(2024, 1, 1);  // February 1st, NOT January!
console.log(date);  // Thu Feb 01 2024

// ❌ Problem 2: Date is mutable (causes bugs)
const original = new Date('2024-01-15');
const modified = original;
modified.setMonth(5);
console.log(original);  // June! Original was mutated!

// ❌ Problem 3: Parsing is inconsistent across browsers
new Date('2024-01-15');     // Parsed as UTC in some browsers, local in others
new Date('2024-1-15');      // Invalid in some browsers, works in others
new Date('01/15/2024');     // US format? European? Depends on locale

// ❌ Problem 4: No timezone support
const nyTime = new Date();  // What timezone is this? Depends on system!
// Can't represent "3pm in Tokyo" - only "3pm in local timezone"

// ❌ Problem 5: DST handling is a nightmare
const dst = new Date('2024-03-10T02:30:00');  // 2:30 AM doesn't exist! (DST skip)
// Date silently gives wrong time

// ❌ Problem 6: No duration type
const start = new Date('2024-01-01');
const end = new Date('2024-12-31');
const diff = end - start;  // 31449600000 ms... now what?
// How many months? No way to know!

// ❌ Problem 7: No calendar support
// Can't work with Hebrew, Islamic, Japanese calendars
```

### How Temporal Fixes Everything

```javascript
// ✅ Fix 1: Human-readable month (1-indexed)
const date = Temporal.PlainDate.from({ year: 2024, month: 1, day: 1 });
console.log(date.toString());  // 2024-01-01 (January!)

// ✅ Fix 2: Immutable (no mutation bugs)
const original = Temporal.PlainDate.from('2024-01-15');
const modified = original.with({ month: 6 });
console.log(original.toString());  // 2024-01-15 (unchanged!)
console.log(modified.toString());  // 2024-06-15

// ✅ Fix 3: Consistent parsing
const parsed = Temporal.PlainDate.from('2024-01-15');  // Always works
// Temporal.PlainDate.from('01/15/2024');  // Throws! Ambiguous formats rejected

// ✅ Fix 4: First-class timezone support
const tokyo = Temporal.ZonedDateTime.from('2024-01-15T15:00[Asia/Tokyo]');
const newYork = tokyo.withTimeZone('America/New_York');
console.log(tokyo.toString());    // 2024-01-15T15:00:00+09:00[Asia/Tokyo]
console.log(newYork.toString());  // 2024-01-15T01:00:00-05:00[America/New_York]

// ✅ Fix 5: DST is handled correctly
const beforeDST = Temporal.ZonedDateTime.from('2024-03-10T01:30[America/New_York]');
const afterDST = beforeDST.add({ hours: 1 });
console.log(afterDST.toString());  // 2024-03-10T03:30:00-04:00 (skipped 2AM correctly!)

// ✅ Fix 6: Real duration type
const start = Temporal.PlainDate.from('2024-01-01');
const end = Temporal.PlainDate.from('2024-12-31');
const duration = start.until(end, { largestUnit: 'months' });
console.log(duration.months, duration.days);  // 11 months, 30 days

// ✅ Fix 7: Multiple calendar systems
const hebrew = Temporal.PlainDate.from('2024-01-15').withCalendar('hebrew');
console.log(hebrew.toString());  // 2024-01-15[u-ca=hebrew]
console.log(hebrew.year, hebrew.month, hebrew.day);  // Hebrew year/month/day
```

---

**Note:** The Temporal API is currently a Stage 3 proposal. This document describes the proposed API which may change before final standardization. You may need a polyfill to use Temporal in current environments.

**Installation (Polyfill):**

```bash
npm install @js-temporal/polyfill
```

```javascript
// Import polyfill
import { Temporal } from '@js-temporal/polyfill';

// Or in browser:
// <script src="https://cdn.jsdelivr.net/npm/@js-temporal/polyfill/dist/index.umd.js"></script>
```

---

## 20.1 Temporal.Instant

`Temporal.Instant` represents an absolute point in time, independent of timezone or calendar. It's like a timestamp.

### Absolute Point in Time

An Instant is a precise moment in the universal timeline.

**Creating Instants:**

```javascript
// Current moment
const now = Temporal.Now.instant();
console.log(now.toString());
// "2024-02-10T14:30:45.123456789Z"

// From epoch nanoseconds
const instant1 = Temporal.Instant.fromEpochNanoseconds(1707574245123456789n);
console.log(instant1.toString());

// From epoch milliseconds
const instant2 = Temporal.Instant.fromEpochMilliseconds(1707574245123);
console.log(instant2.toString());

// From ISO string
const instant3 = Temporal.Instant.from('2024-02-10T14:30:45.123456789Z');
console.log(instant3.toString());

// From Date object
const date = new Date();
const instant4 = Temporal.Instant.fromEpochMilliseconds(date.getTime());
console.log(instant4.toString());
```

**Comparing Instants:**

```javascript
const instant1 = Temporal.Instant.from('2024-02-10T10:00:00Z');
const instant2 = Temporal.Instant.from('2024-02-10T12:00:00Z');

// Compare
console.log(Temporal.Instant.compare(instant1, instant2)); // -1 (instant1 is earlier)
console.log(Temporal.Instant.compare(instant2, instant1)); // 1 (instant2 is later)
console.log(Temporal.Instant.compare(instant1, instant1)); // 0 (equal)

// Equality
console.log(instant1.equals(instant2)); // false
console.log(instant1.equals(instant1)); // true

// Comparison methods
console.log(instant1.toString() < instant2.toString()); // true (string comparison works)
```

**Arithmetic with Instants:**

```javascript
const instant = Temporal.Instant.from('2024-02-10T10:00:00Z');

// Add duration
const later = instant.add({ hours: 2, minutes: 30 });
console.log(later.toString()); // "2024-02-10T12:30:00Z"

// Subtract duration
const earlier = instant.subtract({ hours: 1 });
console.log(earlier.toString()); // "2024-02-10T09:00:00Z"

// Time between instants
const instant1 = Temporal.Instant.from('2024-02-10T10:00:00Z');
const instant2 = Temporal.Instant.from('2024-02-10T12:30:00Z');

const duration = instant1.until(instant2);
console.log(duration.toString()); // "PT2H30M"
console.log(duration.hours); // 2
console.log(duration.minutes); // 30

// Time since
const duration2 = instant2.since(instant1);
console.log(duration2.toString()); // "PT2H30M"
```

### UTC Timestamps

Instants are always in UTC and can be converted to/from various timestamp formats.

**Epoch Time Conversions:**

```javascript
const instant = Temporal.Instant.from('2024-02-10T14:30:45.123456789Z');

// Get epoch times
console.log('Nanoseconds:', instant.epochNanoseconds);
// 1707574245123456789n

console.log('Microseconds:', instant.epochMicroseconds);
// 1707574245123456n

console.log('Milliseconds:', instant.epochMilliseconds);
// 1707574245123

console.log('Seconds:', instant.epochSeconds);
// 1707574245

// Convert to Date
const jsDate = new Date(instant.epochMilliseconds);
console.log(jsDate.toISOString());
```

**High-Precision Timestamps:**

```javascript
// Temporal preserves nanosecond precision
const precise = Temporal.Instant.fromEpochNanoseconds(
  1707574245123456789n
);

console.log('Nanoseconds:', precise.epochNanoseconds);
// 1707574245123456789n

// Date only has millisecond precision
const jsDate = new Date(precise.epochMilliseconds);
console.log('JS Date ms:', jsDate.getTime());
// 1707574245123 (nanoseconds lost)

// Temporal preserves all precision
const roundTrip = Temporal.Instant.fromEpochMilliseconds(
  precise.epochMilliseconds
);
console.log('Round trip:', roundTrip.epochNanoseconds);
// 1707574245123000000n (microseconds/nanoseconds lost)
```

**Measuring Performance:**

```javascript
// High-resolution timing
const start = Temporal.Now.instant();

// Do some work
for (let i = 0; i < 1000000; i++) {
  Math.sqrt(i);
}

const end = Temporal.Now.instant();

// Calculate duration
const elapsed = start.until(end);
console.log('Elapsed time:', elapsed.toString());

// Get precise nanoseconds
const nanos = end.epochNanoseconds - start.epochNanoseconds;
console.log('Nanoseconds:', nanos);

// Convert to milliseconds
const ms = Number(nanos) / 1_000_000;
console.log('Milliseconds:', ms.toFixed(3));
```

**Instant Methods:**

```javascript
const instant = Temporal.Now.instant();

// Convert to timezone-aware datetime
const zonedDateTime = instant.toZonedDateTimeISO('America/New_York');
console.log(zonedDateTime.toString());

// Round to nearest unit
const rounded = instant.round({
  smallestUnit: 'second',
  roundingMode: 'halfExpand'
});
console.log(rounded.toString());

// Round to nearest hour
const hourly = instant.round({ smallestUnit: 'hour' });
console.log(hourly.toString());

// Format as string with different precisions
console.log(instant.toString({ smallestUnit: 'second' }));
console.log(instant.toString({ smallestUnit: 'millisecond' }));
console.log(instant.toString({ smallestUnit: 'microsecond' }));
console.log(instant.toString({ smallestUnit: 'nanosecond' }));
```

---

## 20.2 Temporal.ZonedDateTime

`Temporal.ZonedDateTime` represents a date and time in a specific timezone.

### Date/Time with Timezone

ZonedDateTime combines a wall-clock time with a timezone.

**Creating ZonedDateTime:**

```javascript
// Current time in a timezone
const now = Temporal.Now.zonedDateTimeISO('America/New_York');
console.log(now.toString());
// "2024-02-10T09:30:45.123456789-05:00[America/New_York]"

// From ISO string
const zdt1 = Temporal.ZonedDateTime.from(
  '2024-02-10T14:30:00-05:00[America/New_York]'
);
console.log(zdt1.toString());

// From object
const zdt2 = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 2,
  day: 10,
  hour: 14,
  minute: 30,
  timeZone: 'America/New_York'
});
console.log(zdt2.toString());

// From instant
const instant = Temporal.Now.instant();
const zdt3 = instant.toZonedDateTimeISO('Europe/London');
console.log(zdt3.toString());
```

**Timezone Conversions:**

```javascript
const nyTime = Temporal.ZonedDateTime.from(
  '2024-02-10T14:30:00-05:00[America/New_York]'
);

// Convert to different timezone (same instant)
const tokyoTime = nyTime.withTimeZone('Asia/Tokyo');
console.log('New York:', nyTime.toString());
console.log('Tokyo:', tokyoTime.toString());

// Convert to UTC
const utcTime = nyTime.withTimeZone('UTC');
console.log('UTC:', utcTime.toString());

// Convert to London
const londonTime = nyTime.withTimeZone('Europe/London');
console.log('London:', londonTime.toString());

// All represent the same instant
console.log(nyTime.epochMilliseconds === tokyoTime.epochMilliseconds); // true
```

**Accessing Components:**

```javascript
const zdt = Temporal.ZonedDateTime.from(
  '2024-02-10T14:30:45.123-05:00[America/New_York]'
);

// Date components
console.log('Year:', zdt.year);           // 2024
console.log('Month:', zdt.month);         // 2
console.log('Day:', zdt.day);             // 10

// Time components
console.log('Hour:', zdt.hour);           // 14
console.log('Minute:', zdt.minute);       // 30
console.log('Second:', zdt.second);       // 45
console.log('Millisecond:', zdt.millisecond); // 123

// Timezone information
console.log('Timezone:', zdt.timeZoneId); // "America/New_York"
console.log('Offset:', zdt.offset);       // "-05:00"
console.log('Offset nanoseconds:', zdt.offsetNanoseconds); // -18000000000000

// Day of week
console.log('Day of week:', zdt.dayOfWeek); // 6 (Saturday)

// Day of year
console.log('Day of year:', zdt.dayOfYear); // 41
```

**Arithmetic with Timezone Awareness:**

```javascript
const zdt = Temporal.ZonedDateTime.from(
  '2024-03-10T01:30:00-05:00[America/New_York]'
);

// Add 2 hours (crosses DST boundary in this example)
const later = zdt.add({ hours: 2 });
console.log('Original:', zdt.toString());
console.log('Later:', later.toString());

// Duration respects timezone rules
const zdt1 = Temporal.ZonedDateTime.from(
  '2024-03-09T23:00:00-05:00[America/New_York]'
);
const zdt2 = zdt1.add({ hours: 3 });
console.log('Before DST:', zdt1.toString());
console.log('After DST:', zdt2.toString());
// Note: The offset changes due to DST

// Add days (maintains wall-clock time)
const tomorrow = zdt.add({ days: 1 });
console.log('Tomorrow:', tomorrow.toString());
```

**DST Handling:**

```javascript
// DST transition in America/New_York (Spring Forward)
// March 10, 2024, 2:00 AM → 3:00 AM

const beforeDST = Temporal.ZonedDateTime.from(
  '2024-03-10T01:30:00-05:00[America/New_York]'
);

// Add 1 hour (crosses DST)
const afterDST = beforeDST.add({ hours: 1 });

console.log('Before DST:', beforeDST.toString());
// "2024-03-10T01:30:00-05:00[America/New_York]"

console.log('After DST:', afterDST.toString());
// "2024-03-10T03:30:00-04:00[America/New_York]"
// Note: Time jumped from 1:30 to 3:30 (2:30 doesn't exist)
// Offset changed from -05:00 to -04:00

// Time that doesn't exist (during DST gap)
// This is handled gracefully
const nonexistent = Temporal.ZonedDateTime.from({
  year: 2024,
  month: 3,
  day: 10,
  hour: 2,
  minute: 30,
  timeZone: 'America/New_York',
  // Can specify disambiguation: 'compatible', 'earlier', 'later', 'reject'
  disambiguation: 'compatible' // default: chooses later time
});

console.log('Nonexistent time:', nonexistent.toString());
// "2024-03-10T03:30:00-04:00[America/New_York]"
```

**Comparing ZonedDateTime:**

```javascript
const ny1 = Temporal.ZonedDateTime.from(
  '2024-02-10T14:30:00-05:00[America/New_York]'
);

const ny2 = Temporal.ZonedDateTime.from(
  '2024-02-10T15:30:00-05:00[America/New_York]'
);

// Same instant in different timezone
const tokyo = ny1.withTimeZone('Asia/Tokyo');

// Compare
console.log(Temporal.ZonedDateTime.compare(ny1, ny2)); // -1
console.log(ny1.equals(ny2)); // false
console.log(ny1.equals(tokyo)); // false (different timezone)

// Check if same instant
console.log(ny1.epochMilliseconds === tokyo.epochMilliseconds); // true
```

---

## 20.3 Temporal.PlainDate

`Temporal.PlainDate` represents a calendar date without time or timezone.

### Calendar Date (No Time)

PlainDate is useful for dates like birthdays, holidays, or deadlines.

**Creating PlainDate:**

```javascript
// Today's date
const today = Temporal.Now.plainDateISO();
console.log(today.toString()); // "2024-02-10"

// From components
const date1 = Temporal.PlainDate.from({ year: 2024, month: 2, day: 10 });
console.log(date1.toString()); // "2024-02-10"

// From ISO string
const date2 = Temporal.PlainDate.from('2024-02-10');
console.log(date2.toString());

// Specific calendar
const date3 = new Temporal.PlainDate(2024, 2, 10, 'iso8601');
console.log(date3.toString());
```

**Accessing Components:**

```javascript
const date = Temporal.PlainDate.from('2024-02-10');

console.log('Year:', date.year);         // 2024
console.log('Month:', date.month);       // 2
console.log('Day:', date.day);           // 10
console.log('Day of week:', date.dayOfWeek); // 6 (Saturday)
console.log('Day of year:', date.dayOfYear); // 41
console.log('Week of year:', date.weekOfYear); // 6
console.log('Days in month:', date.daysInMonth); // 29 (2024 is leap year)
console.log('Days in year:', date.daysInYear); // 366
console.log('Months in year:', date.monthsInYear); // 12
console.log('Is leap year:', date.inLeapYear); // true

// Month code (useful for non-Gregorian calendars)
console.log('Month code:', date.monthCode); // "M02"
```

**Date Arithmetic:**

```javascript
const date = Temporal.PlainDate.from('2024-02-10');

// Add duration
const nextWeek = date.add({ weeks: 1 });
console.log('Next week:', nextWeek.toString()); // "2024-02-17"

const nextMonth = date.add({ months: 1 });
console.log('Next month:', nextMonth.toString()); // "2024-03-10"

const nextYear = date.add({ years: 1 });
console.log('Next year:', nextYear.toString()); // "2025-02-10"

// Subtract duration
const lastWeek = date.subtract({ weeks: 1 });
console.log('Last week:', lastWeek.toString()); // "2024-02-03"

// Complex durations
const later = date.add({ years: 1, months: 2, days: 15 });
console.log('Later:', later.toString()); // "2025-04-25"
```

**Date Comparison:**

```javascript
const date1 = Temporal.PlainDate.from('2024-02-10');
const date2 = Temporal.PlainDate.from('2024-03-15');
const date3 = Temporal.PlainDate.from('2024-02-10');

// Compare
console.log(Temporal.PlainDate.compare(date1, date2)); // -1
console.log(Temporal.PlainDate.compare(date2, date1)); // 1
console.log(Temporal.PlainDate.compare(date1, date3)); // 0

// Equality
console.log(date1.equals(date2)); // false
console.log(date1.equals(date3)); // true
```

**Duration Between Dates:**

```javascript
const start = Temporal.PlainDate.from('2024-02-10');
const end = Temporal.PlainDate.from('2024-05-20');

// Duration until
const duration = start.until(end);
console.log(duration.toString()); // "P3M10D"
console.log('Months:', duration.months); // 3
console.log('Days:', duration.days); // 10

// Total days
const totalDays = start.until(end, { largestUnit: 'day' });
console.log('Total days:', totalDays.days); // 100

// Duration since
const duration2 = end.since(start);
console.log(duration2.toString()); // "P3M10D"

// Different units
const weeks = start.until(end, { largestUnit: 'week' });
console.log('Weeks:', weeks.weeks, 'Days:', weeks.days);
```

**Practical Examples:**

```javascript
// Calculate age
function calculateAge(birthDate) {
  const today = Temporal.Now.plainDateISO();
  const age = birthDate.until(today, { largestUnit: 'year' });
  return age.years;
}

const birthDate = Temporal.PlainDate.from('1990-05-15');
console.log('Age:', calculateAge(birthDate));

// Days until event
function daysUntil(eventDate) {
  const today = Temporal.Now.plainDateISO();
  const duration = today.until(eventDate, { largestUnit: 'day' });
  return duration.days;
}

const christmas = Temporal.PlainDate.from('2024-12-25');
console.log('Days until Christmas:', daysUntil(christmas));

// Is weekend
function isWeekend(date) {
  return date.dayOfWeek === 6 || date.dayOfWeek === 7; // Saturday or Sunday
}

console.log('Is today weekend?', isWeekend(today));

// Next business day
function nextBusinessDay(date) {
  let next = date.add({ days: 1 });
  while (isWeekend(next)) {
    next = next.add({ days: 1 });
  }
  return next;
}

console.log('Next business day:', nextBusinessDay(today).toString());
```

---

## 20.4 Temporal.PlainTime

`Temporal.PlainTime` represents a wall-clock time without date or timezone.

### Clock Time (No Date)

PlainTime is useful for times like "9:00 AM" or "14:30".

**Creating PlainTime:**

```javascript
// Current time
const now = Temporal.Now.plainTimeISO();
console.log(now.toString()); // "14:30:45.123456789"

// From components
const time1 = Temporal.PlainTime.from({ hour: 14, minute: 30 });
console.log(time1.toString()); // "14:30:00"

const time2 = Temporal.PlainTime.from({
  hour: 14,
  minute: 30,
  second: 45,
  millisecond: 123
});
console.log(time2.toString()); // "14:30:45.123"

// From ISO string
const time3 = Temporal.PlainTime.from('14:30:45.123');
console.log(time3.toString());

// From partial object
const time4 = Temporal.PlainTime.from({ hour: 9 });
console.log(time4.toString()); // "09:00:00"
```

**Accessing Components:**

```javascript
const time = Temporal.PlainTime.from('14:30:45.123456789');

console.log('Hour:', time.hour);                 // 14
console.log('Minute:', time.minute);             // 30
console.log('Second:', time.second);             // 45
console.log('Millisecond:', time.millisecond);   // 123
console.log('Microsecond:', time.microsecond);   // 456
console.log('Nanosecond:', time.nanosecond);     // 789
```

**Time Arithmetic:**

```javascript
const time = Temporal.PlainTime.from('14:30:00');

// Add duration
const later = time.add({ hours: 2, minutes: 30 });
console.log('Later:', later.toString()); // "17:00:00"

const muchLater = time.add({ hours: 12 });
console.log('Much later:', muchLater.toString()); // "02:30:00" (wraps around)

// Subtract duration
const earlier = time.subtract({ hours: 1, minutes: 15 });
console.log('Earlier:', earlier.toString()); // "13:15:00"

// Duration between times
const time1 = Temporal.PlainTime.from('09:00:00');
const time2 = Temporal.PlainTime.from('17:30:00');

const duration = time1.until(time2);
console.log('Duration:', duration.toString()); // "PT8H30M"
console.log('Hours:', duration.hours); // 8
console.log('Minutes:', duration.minutes); // 30
```

**Time Comparison:**

```javascript
const time1 = Temporal.PlainTime.from('09:00:00');
const time2 = Temporal.PlainTime.from('17:30:00');
const time3 = Temporal.PlainTime.from('09:00:00');

// Compare
console.log(Temporal.PlainTime.compare(time1, time2)); // -1
console.log(Temporal.PlainTime.compare(time2, time1)); // 1
console.log(Temporal.PlainTime.compare(time1, time3)); // 0

// Equality
console.log(time1.equals(time2)); // false
console.log(time1.equals(time3)); // true
```

**Practical Examples:**

```javascript
// Business hours check
function isDuringBusinessHours(time) {
  const start = Temporal.PlainTime.from('09:00');
  const end = Temporal.PlainTime.from('17:00');
  
  return Temporal.PlainTime.compare(time, start) >= 0 &&
         Temporal.PlainTime.compare(time, end) < 0;
}

const checkTime = Temporal.PlainTime.from('14:30');
console.log('During business hours?', isDuringBusinessHours(checkTime));

// Calculate work hours
function calculateWorkHours(clockIn, clockOut) {
  const duration = clockIn.until(clockOut, { largestUnit: 'hour' });
  return duration.hours + duration.minutes / 60;
}

const clockIn = Temporal.PlainTime.from('09:00');
const clockOut = Temporal.PlainTime.from('17:30');
console.log('Work hours:', calculateWorkHours(clockIn, clockOut)); // 8.5

// Round to nearest 15 minutes
function roundToQuarterHour(time) {
  const totalMinutes = time.hour * 60 + time.minute;
  const rounded = Math.round(totalMinutes / 15) * 15;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  
  return Temporal.PlainTime.from({ hour: hours, minute: minutes });
}

const time = Temporal.PlainTime.from('14:37:00');
console.log('Rounded:', roundToQuarterHour(time).toString()); // "14:45:00"
```

---

## 20.5 Temporal.PlainDateTime

`Temporal.PlainDateTime` represents a date and time without timezone information.

### Date and Time (No Timezone)

PlainDateTime combines date and time but has no timezone awareness.

**Creating PlainDateTime:**

```javascript
// Current date and time
const now = Temporal.Now.plainDateTimeISO();
console.log(now.toString()); // "2024-02-10T14:30:45.123456789"

// From components
const dt1 = Temporal.PlainDateTime.from({
  year: 2024,
  month: 2,
  day: 10,
  hour: 14,
  minute: 30
});
console.log(dt1.toString()); // "2024-02-10T14:30:00"

// From ISO string
const dt2 = Temporal.PlainDateTime.from('2024-02-10T14:30:45');
console.log(dt2.toString());

// From date and time
const date = Temporal.PlainDate.from('2024-02-10');
const time = Temporal.PlainTime.from('14:30:00');
const dt3 = date.toPlainDateTime(time);
console.log(dt3.toString()); // "2024-02-10T14:30:00"
```

**Accessing Components:**

```javascript
const dt = Temporal.PlainDateTime.from('2024-02-10T14:30:45.123');

// Date components
console.log('Year:', dt.year);           // 2024
console.log('Month:', dt.month);         // 2
console.log('Day:', dt.day);             // 10
console.log('Day of week:', dt.dayOfWeek); // 6

// Time components
console.log('Hour:', dt.hour);           // 14
console.log('Minute:', dt.minute);       // 30
console.log('Second:', dt.second);       // 45
console.log('Millisecond:', dt.millisecond); // 123

// Extract date and time
const dateOnly = dt.toPlainDate();
console.log('Date only:', dateOnly.toString()); // "2024-02-10"

const timeOnly = dt.toPlainTime();
console.log('Time only:', timeOnly.toString()); // "14:30:45.123"
```

**DateTime Arithmetic:**

```javascript
const dt = Temporal.PlainDateTime.from('2024-02-10T14:30:00');

// Add duration
const later = dt.add({ days: 1, hours: 2, minutes: 30 });
console.log('Later:', later.toString()); // "2024-02-11T17:00:00"

// Subtract duration
const earlier = dt.subtract({ hours: 3 });
console.log('Earlier:', earlier.toString()); // "2024-02-10T11:30:00"

// Duration between datetimes
const dt1 = Temporal.PlainDateTime.from('2024-02-10T09:00:00');
const dt2 = Temporal.PlainDateTime.from('2024-02-12T17:30:00');

const duration = dt1.until(dt2);
console.log('Duration:', duration.toString()); // "P2DT8H30M"
console.log('Days:', duration.days);     // 2
console.log('Hours:', duration.hours);   // 8
console.log('Minutes:', duration.minutes); // 30

// Total hours
const totalHours = dt1.until(dt2, { largestUnit: 'hour' });
console.log('Total hours:', totalHours.hours); // 56
```

**Converting to ZonedDateTime:**

```javascript
const dt = Temporal.PlainDateTime.from('2024-02-10T14:30:00');

// Add timezone to create ZonedDateTime
const zdtNY = dt.toZonedDateTime('America/New_York');
console.log('New York:', zdtNY.toString());

const zdtTokyo = dt.toZonedDateTime('Asia/Tokyo');
console.log('Tokyo:', zdtTokyo.toString());

// Same wall-clock time, different instants
console.log('NY epoch:', zdtNY.epochMilliseconds);
console.log('Tokyo epoch:', zdtTokyo.epochMilliseconds);
console.log('Different instants:', 
  zdtNY.epochMilliseconds !== zdtTokyo.epochMilliseconds);
```

**Practical Examples:**

```javascript
// Meeting scheduler
function scheduleMeeting(startDateTime, durationHours) {
  const start = Temporal.PlainDateTime.from(startDateTime);
  const end = start.add({ hours: durationHours });
  
  return {
    start: start.toString(),
    end: end.toString(),
    duration: `${durationHours} hours`
  };
}

const meeting = scheduleMeeting('2024-02-10T14:00:00', 2);
console.log(meeting);
// { start: "2024-02-10T14:00:00", end: "2024-02-10T16:00:00", duration: "2 hours" }

// Event duration formatter
function formatEventDuration(start, end) {
  const startDT = Temporal.PlainDateTime.from(start);
  const endDT = Temporal.PlainDateTime.from(end);
  
  const duration = startDT.until(endDT);
  
  const parts = [];
  if (duration.days > 0) parts.push(`${duration.days} day(s)`);
  if (duration.hours > 0) parts.push(`${duration.hours} hour(s)`);
  if (duration.minutes > 0) parts.push(`${duration.minutes} minute(s)`);
  
  return parts.join(', ');
}

console.log(formatEventDuration(
  '2024-02-10T09:00:00',
  '2024-02-11T14:30:00'
));
// "1 day(s), 5 hour(s), 30 minute(s)"
```

---

## 20.6 Temporal.Duration

`Temporal.Duration` represents a length of time, independent of any starting point.

### Time Duration

Duration represents amounts of time like "2 hours and 30 minutes" or "3 days".

**Creating Durations:**

```javascript
// From object
const duration1 = Temporal.Duration.from({
  hours: 2,
  minutes: 30
});
console.log(duration1.toString()); // "PT2H30M"

const duration2 = Temporal.Duration.from({
  days: 3,
  hours: 4,
  minutes: 15,
  seconds: 30
});
console.log(duration2.toString()); // "P3DT4H15M30S"

// From ISO string
const duration3 = Temporal.Duration.from('PT2H30M');
console.log(duration3.toString());

const duration4 = Temporal.Duration.from('P1Y2M3DT4H5M6S');
console.log(duration4.toString());

// All units
const fullDuration = Temporal.Duration.from({
  years: 1,
  months: 2,
  weeks: 3,
  days: 4,
  hours: 5,
  minutes: 6,
  seconds: 7,
  milliseconds: 8,
  microseconds: 9,
  nanoseconds: 10
});
console.log(fullDuration.toString());
```

**Accessing Duration Components:**

```javascript
const duration = Temporal.Duration.from('P1Y2M3W4DT5H6M7.008009010S');

console.log('Years:', duration.years);             // 1
console.log('Months:', duration.months);           // 2
console.log('Weeks:', duration.weeks);             // 3
console.log('Days:', duration.days);               // 4
console.log('Hours:', duration.hours);             // 5
console.log('Minutes:', duration.minutes);         // 6
console.log('Seconds:', duration.seconds);         // 7
console.log('Milliseconds:', duration.milliseconds); // 8
console.log('Microseconds:', duration.microseconds); // 9
console.log('Nanoseconds:', duration.nanoseconds); // 10

// Sign
console.log('Sign:', duration.sign); // 1 (positive)

// Blank (zero duration)
const zeroDuration = Temporal.Duration.from('PT0S');
console.log('Blank:', zeroDuration.blank); // true
```

**Duration Arithmetic:**

```javascript
const duration1 = Temporal.Duration.from({ hours: 2, minutes: 30 });
const duration2 = Temporal.Duration.from({ hours: 1, minutes: 45 });

// Add durations
const sum = duration1.add(duration2);
console.log('Sum:', sum.toString()); // "PT4H15M"

// Subtract durations
const diff = duration1.subtract(duration2);
console.log('Difference:', diff.toString()); // "PT45M"

// Negate
const negative = duration1.negated();
console.log('Negated:', negative.toString()); // "-PT2H30M"

// Absolute value
const absolute = negative.abs();
console.log('Absolute:', absolute.toString()); // "PT2H30M"
```

**Duration Comparison:**

```javascript
const duration1 = Temporal.Duration.from({ hours: 2 });
const duration2 = Temporal.Duration.from({ minutes: 120 });
const duration3 = Temporal.Duration.from({ hours: 3 });

// Note: Durations with calendar units (years, months) cannot be compared
// without a reference point, because their lengths vary

// Compare time durations
console.log(Temporal.Duration.compare(duration1, duration2)); // 0 (equal)
console.log(Temporal.Duration.compare(duration1, duration3)); // -1

// Equality
console.log(duration1.equals(duration2)); // false (different representation)

// Same total time
console.log(duration1.total({ unit: 'minutes' }) === 
           duration2.total({ unit: 'minutes' })); // true
```

**Duration Balancing:**

```javascript
// Convert to larger units
const duration = Temporal.Duration.from({ minutes: 150 });

const balanced = duration.round({
  largestUnit: 'hour',
  smallestUnit: 'minute'
});
console.log(balanced.toString()); // "PT2H30M"

// Round to different units
const seconds = Temporal.Duration.from({ seconds: 90 });

const roundedToMinutes = seconds.round({ largestUnit: 'minute' });
console.log(roundedToMinutes.toString()); // "PT1M30S"

const roundedUp = seconds.round({ 
  largestUnit: 'minute',
  smallestUnit: 'minute',
  roundingMode: 'ceil'
});
console.log(roundedUp.toString()); // "PT2M"
```

**Total Time in Units:**

```javascript
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });

// Convert to total minutes
console.log('Total minutes:', duration.total({ unit: 'minute' })); // 150

// Convert to total seconds
console.log('Total seconds:', duration.total({ unit: 'second' })); // 9000

// Convert to total hours (fractional)
console.log('Total hours:', duration.total({ unit: 'hour' })); // 2.5

// With reference date for calendar units
const calendarDuration = Temporal.Duration.from({ months: 2 });
const referenceDate = Temporal.PlainDate.from('2024-01-01');

const totalDays = calendarDuration.total({ 
  unit: 'day',
  relativeTo: referenceDate
});
console.log('Total days:', totalDays); // 60 (Jan + Feb in 2024)
```

**Practical Examples:**

```javascript
// Format duration as human-readable
function formatDuration(duration) {
  const parts = [];
  
  if (duration.years) parts.push(`${duration.years} year(s)`);
  if (duration.months) parts.push(`${duration.months} month(s)`);
  if (duration.days) parts.push(`${duration.days} day(s)`);
  if (duration.hours) parts.push(`${duration.hours} hour(s)`);
  if (duration.minutes) parts.push(`${duration.minutes} minute(s)`);
  if (duration.seconds) parts.push(`${duration.seconds} second(s)`);
  
  return parts.join(', ') || '0 seconds';
}

const duration = Temporal.Duration.from('P1DT2H30M');
console.log(formatDuration(duration)); // "1 day(s), 2 hour(s), 30 minute(s)"

// Calculate project timeline
function calculateProjectEnd(startDate, estimatedHours) {
  const start = Temporal.PlainDate.from(startDate);
  const workHoursPerDay = 8;
  const days = Math.ceil(estimatedHours / workHoursPerDay);
  
  const duration = Temporal.Duration.from({ days });
  return start.add(duration).toString();
}

console.log(calculateProjectEnd('2024-02-10', 50)); // "2024-02-17"

// Timer/stopwatch
function formatElapsed(milliseconds) {
  const duration = Temporal.Duration.from({ milliseconds });
  const balanced = duration.round({ largestUnit: 'hour' });
  
  const hours = String(balanced.hours).padStart(2, '0');
  const minutes = String(balanced.minutes).padStart(2, '0');
  const seconds = String(balanced.seconds).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

console.log(formatElapsed(3665000)); // "01:01:05"
```

---

## 20.7 Temporal.Calendar

`Temporal.Calendar` handles different calendar systems beyond the ISO 8601 calendar.

### Calendar Systems

Temporal supports multiple calendar systems.

**Available Calendars:**

```javascript
// ISO 8601 calendar (default)
const isoCalendar = Temporal.Calendar.from('iso8601');
console.log(isoCalendar.id); // "iso8601"

// Other calendars
const hebrewCalendar = Temporal.Calendar.from('hebrew');
const islamicCalendar = Temporal.Calendar.from('islamic');
const chineseCalendar = Temporal.Calendar.from('chinese');
const japaneseCalendar = Temporal.Calendar.from('japanese');
const gregorianCalendar = Temporal.Calendar.from('gregory');

// List some supported calendars:
// iso8601, gregory, japanese, buddhist, chinese, coptic,
// dangi, ethioaa, ethiopic, hebrew, indian, islamic,
// islamic-umalqura, islamic-tbla, islamic-civil, islamic-rgsa,
// islamicc, persian, roc
```

**Using Different Calendars:**

```javascript
// Create date in ISO calendar
const isoDate = Temporal.PlainDate.from('2024-02-10');
console.log(isoDate.toString()); // "2024-02-10"
console.log(isoDate.calendarId); // "iso8601"

// Create date in Hebrew calendar
const hebrewDate = Temporal.PlainDate.from({
  year: 5784,
  monthCode: 'M05',
  day: 1,
  calendar: 'hebrew'
});
console.log(hebrewDate.toString()); // "5784-05-01[u-ca=hebrew]"

// Convert between calendars
const isoFromHebrew = hebrewDate.withCalendar('iso8601');
console.log(isoFromHebrew.toString()); // Corresponding ISO date
```

**Calendar-Specific Properties:**

```javascript
// Japanese calendar with eras
const japaneseDate = Temporal.PlainDate.from({
  year: 6, // Reiwa 6
  monthCode: 'M02',
  day: 10,
  calendar: 'japanese'
});

console.log(japaneseDate.toString()); // "0006-02-10[u-ca=japanese]"
console.log(japaneseDate.era); // "reiwa"
console.log(japaneseDate.eraYear); // 6

// Hebrew calendar
const hebrewDate = Temporal.PlainDate.from({
  year: 5784,
  monthCode: 'M05',
  day: 15,
  calendar: 'hebrew'
});

console.log('Hebrew year:', hebrewDate.year); // 5784
console.log('Month code:', hebrewDate.monthCode); // "M05"
console.log('Days in month:', hebrewDate.daysInMonth);
console.log('Months in year:', hebrewDate.monthsInYear);
```

**Calendar Arithmetic:**

```javascript
// Arithmetic respects calendar rules
const hebrewDate = Temporal.PlainDate.from({
  year: 5784,
  monthCode: 'M12',
  day: 29,
  calendar: 'hebrew'
});

// Add one month (Hebrew calendar rules apply)
const nextMonth = hebrewDate.add({ months: 1 });
console.log('Next month:', nextMonth.toString());

// Leap years in Hebrew calendar
const hebrewLeap = hebrewDate.with({ year: 5784 });
console.log('Is leap year:', hebrewLeap.inLeapYear);
console.log('Months in year:', hebrewLeap.monthsInYear); // 13 in leap year
```

**Custom Calendar:**

```javascript
// You can create custom calendars (advanced)
class FiscalYearCalendar extends Temporal.Calendar {
  constructor() {
    super('iso8601');
    this.id = 'fiscal-year';
  }
  
  // Fiscal year starts July 1
  year(date) {
    const isoDate = date.withCalendar('iso8601');
    if (isoDate.month >= 7) {
      return isoDate.year + 1;
    }
    return isoDate.year;
  }
  
  month(date) {
    const isoDate = date.withCalendar('iso8601');
    // Shift months: July = 1, August = 2, ..., June = 12
    return ((isoDate.month - 7 + 12) % 12) + 1;
  }
}

// Note: Full custom calendar implementation is complex
// This is a simplified example
```

---

## 20.8 Temporal.TimeZone

`Temporal.TimeZone` handles timezone operations and conversions.

### Timezone Handling

TimeZone provides timezone-aware date/time operations.

**Creating TimeZones:**

```javascript
// From IANA timezone ID
const nyTZ = Temporal.TimeZone.from('America/New_York');
console.log(nyTZ.id); // "America/New_York"

const tokyoTZ = Temporal.TimeZone.from('Asia/Tokyo');
console.log(tokyoTZ.id); // "Asia/Tokyo"

// UTC
const utcTZ = Temporal.TimeZone.from('UTC');
console.log(utcTZ.id); // "UTC"

// From offset string
const offsetTZ = Temporal.TimeZone.from('-05:00');
console.log(offsetTZ.id); // "-05:00"
```

**Getting Offset:**

```javascript
const nyTZ = Temporal.TimeZone.from('America/New_York');

// Get offset for specific instant
const instant = Temporal.Instant.from('2024-02-10T19:30:00Z');
const offset = nyTZ.getOffsetStringFor(instant);
console.log('Offset:', offset); // "-05:00"

// Get offset nanoseconds
const offsetNs = nyTZ.getOffsetNanosecondsFor(instant);
console.log('Offset ns:', offsetNs); // -18000000000000

// Different seasons have different offsets (DST)
const summer = Temporal.Instant.from('2024-07-10T19:30:00Z');
const summerOffset = nyTZ.getOffsetStringFor(summer);
console.log('Summer offset:', summerOffset); // "-04:00" (DST)
```

**Converting to Local Time:**

```javascript
const instant = Temporal.Instant.from('2024-02-10T19:30:00Z');

// Convert to different timezones
const nyTZ = Temporal.TimeZone.from('America/New_York');
const nyTime = instant.toZonedDateTimeISO(nyTZ);
console.log('New York:', nyTime.toString());
// "2024-02-10T14:30:00-05:00[America/New_York]"

const tokyoTZ = Temporal.TimeZone.from('Asia/Tokyo');
const tokyoTime = instant.toZonedDateTimeISO(tokyoTZ);
console.log('Tokyo:', tokyoTime.toString());
// "2024-02-11T04:30:00+09:00[Asia/Tokyo]"

const londonTZ = Temporal.TimeZone.from('Europe/London');
const londonTime = instant.toZonedDateTimeISO(londonTZ);
console.log('London:', londonTime.toString());
// "2024-02-10T19:30:00+00:00[Europe/London]"
```

**Timezone Transitions (DST):**

```javascript
const nyTZ = Temporal.TimeZone.from('America/New_York');

// Find DST transitions
const transitions = nyTZ.getNextTransition(
  Temporal.Instant.from('2024-01-01T00:00:00Z')
);
console.log('Next transition:', transitions?.toString());

// Get all transitions in a year
function getDSTTransitions(timeZone, year) {
  const tz = Temporal.TimeZone.from(timeZone);
  const yearStart = Temporal.Instant.from(`${year}-01-01T00:00:00Z`);
  const yearEnd = Temporal.Instant.from(`${year + 1}-01-01T00:00:00Z`);
  
  const transitions = [];
  let current = yearStart;
  
  while (current && Temporal.Instant.compare(current, yearEnd) < 0) {
    const next = tz.getNextTransition(current);
    if (!next || Temporal.Instant.compare(next, yearEnd) >= 0) break;
    transitions.push(next);
    current = next;
  }
  
  return transitions;
}

const nyTransitions = getDSTTransitions('America/New_York', 2024);
console.log('2024 DST transitions in NY:');
nyTransitions.forEach(t => {
  const zdt = t.toZonedDateTimeISO('America/New_York');
  console.log(zdt.toString());
});
```

**Possible Instant Disambiguation:**

```javascript
const nyTZ = Temporal.TimeZone.from('America/New_York');

// During DST transition, some times don't exist or occur twice
const plainDT = Temporal.PlainDateTime.from('2024-03-10T02:30:00');

// This time doesn't exist (DST spring forward)
// 2:00 AM → 3:00 AM

// Compatible (default): choose later time
const compatible = nyTZ.getInstantFor(plainDT, { disambiguation: 'compatible' });
console.log('Compatible:', compatible.toZonedDateTimeISO(nyTZ).toString());
// "2024-03-10T03:30:00-04:00[America/New_York]"

// Earlier: choose earlier time
const earlier = nyTZ.getInstantFor(plainDT, { disambiguation: 'earlier' });
console.log('Earlier:', earlier.toZonedDateTimeISO(nyTZ).toString());

// Later: choose later time
const later = nyTZ.getInstantFor(plainDT, { disambiguation: 'later' });
console.log('Later:', later.toZonedDateTimeISO(nyTZ).toString());

// Reject: throw error
try {
  nyTZ.getInstantFor(plainDT, { disambiguation: 'reject' });
} catch (e) {
  console.log('Rejected:', e.message);
}
```

**Getting Possible Instants:**

```javascript
const nyTZ = Temporal.TimeZone.from('America/New_York');

// Normal time (one possibility)
const normalDT = Temporal.PlainDateTime.from('2024-02-10T14:30:00');
const normalInstants = nyTZ.getPossibleInstantsFor(normalDT);
console.log('Normal time instants:', normalInstants.length); // 1

// During DST gap (no possibilities)
const gapDT = Temporal.PlainDateTime.from('2024-03-10T02:30:00');
const gapInstants = nyTZ.getPossibleInstantsFor(gapDT);
console.log('Gap time instants:', gapInstants.length); // 0

// During DST overlap (two possibilities)
const overlapDT = Temporal.PlainDateTime.from('2024-11-03T01:30:00');
const overlapInstants = nyTZ.getPossibleInstantsFor(overlapDT);
console.log('Overlap time instants:', overlapInstants.length); // 2

if (overlapInstants.length === 2) {
  console.log('First occurrence:', 
    overlapInstants[0].toZonedDateTimeISO(nyTZ).toString());
  console.log('Second occurrence:', 
    overlapInstants[1].toZonedDateTimeISO(nyTZ).toString());
}
```

**Practical Examples:**

```javascript
// Meeting across timezones
function scheduleCrossTZMeeting(localTime, localTZ, remoteTZ) {
  const local = Temporal.PlainDateTime.from(localTime);
  const localZoned = local.toZonedDateTime(localTZ);
  const remoteZoned = localZoned.withTimeZone(remoteTZ);
  
  return {
    local: localZoned.toString(),
    remote: remoteZoned.toString(),
    localTime: localZoned.toPlainTime().toString(),
    remoteTime: remoteZoned.toPlainTime().toString()
  };
}

const meeting = scheduleCrossTZMeeting(
  '2024-02-10T14:00:00',
  'America/New_York',
  'Asia/Tokyo'
);
console.log('Meeting times:', meeting);

// Find business hours overlap
function findOverlap(tz1, tz2, startHour = 9, endHour = 17) {
  const now = Temporal.Now.instant();
  const zdt1 = now.toZonedDateTimeISO(tz1);
  const zdt2 = now.toZonedDateTimeISO(tz2);
  
  // Create business hours in each timezone
  const start1 = zdt1.with({ hour: startHour, minute: 0 });
  const end1 = zdt1.with({ hour: endHour, minute: 0 });
  
  const start2 = zdt2.with({ hour: startHour, minute: 0 });
  const end2 = zdt2.with({ hour: endHour, minute: 0 });
  
  // Convert to same timezone for comparison
  const start2InTZ1 = start2.withTimeZone(tz1);
  const end2InTZ1 = end2.withTimeZone(tz1);
  
  // Find overlap
  const overlapStart = Temporal.ZonedDateTime.compare(start1, start2InTZ1) > 0
    ? start1 : start2InTZ1;
  const overlapEnd = Temporal.ZonedDateTime.compare(end1, end2InTZ1) < 0
    ? end1 : end2InTZ1;
  
  if (Temporal.ZonedDateTime.compare(overlapStart, overlapEnd) < 0) {
    return {
      start: overlapStart.toString(),
      end: overlapEnd.toString(),
      duration: overlapStart.until(overlapEnd).toString()
    };
  }
  
  return null; // No overlap
}

const overlap = findOverlap('America/New_York', 'Asia/Tokyo');
console.log('Business hours overlap:', overlap);
```

---

## 20.9 Migrating from Date to Temporal

### Common Migration Patterns

```javascript
// === CREATING DATES ===

// ❌ OLD: new Date()
const now = new Date();

// ✅ NEW: Temporal equivalents
const instant = Temporal.Now.instant();           // Absolute time (like Date)
const zdt = Temporal.Now.zonedDateTimeISO();       // With timezone
const plainDate = Temporal.Now.plainDateISO();     // Just the date
const plainTime = Temporal.Now.plainTimeISO();     // Just the time


// === PARSING ISO STRINGS ===

// ❌ OLD: Parse ISO string
const date1 = new Date('2024-06-15T10:30:00Z');

// ✅ NEW: Parse ISO string
const instant1 = Temporal.Instant.from('2024-06-15T10:30:00Z');
const zdt1 = Temporal.ZonedDateTime.from('2024-06-15T10:30:00Z[UTC]');


// === CREATING SPECIFIC DATES ===

// ❌ OLD: Month is 0-indexed!
const date2 = new Date(2024, 5, 15);  // June 15 (5 = June)

// ✅ NEW: Month is 1-indexed
const plain = Temporal.PlainDate.from({ year: 2024, month: 6, day: 15 });


// === GETTING COMPONENTS ===

// ❌ OLD
const d = new Date('2024-06-15T10:30:00');
const year = d.getFullYear();    // 2024
const month = d.getMonth() + 1;  // 6 (had to add 1!)
const day = d.getDate();         // 15
const hour = d.getHours();       // 10

// ✅ NEW
const pd = Temporal.PlainDateTime.from('2024-06-15T10:30:00');
const year2 = pd.year;   // 2024
const month2 = pd.month; // 6 (no adjustment needed)
const day2 = pd.day;     // 15
const hour2 = pd.hour;   // 10


// === DATE ARITHMETIC ===

// ❌ OLD: Manual calculation, error-prone
const date3 = new Date('2024-06-15');
date3.setDate(date3.getDate() + 30);  // Mutates! Also wrong for months

// ✅ NEW: Clear, immutable
const pd2 = Temporal.PlainDate.from('2024-06-15');
const later = pd2.add({ days: 30 });  // Returns new PlainDate


// === COMPARING DATES ===

// ❌ OLD: Convert to numbers
const d1 = new Date('2024-06-15');
const d2 = new Date('2024-07-01');
const isEarlier = d1.getTime() < d2.getTime();

// ✅ NEW: Built-in comparison
const pd3 = Temporal.PlainDate.from('2024-06-15');
const pd4 = Temporal.PlainDate.from('2024-07-01');
const cmp = Temporal.PlainDate.compare(pd3, pd4);  // -1, 0, or 1


// === TIME DIFFERENCE ===

// ❌ OLD: Manual millisecond math
const start = new Date('2024-01-01');
const end = new Date('2024-06-15');
const diffMs = end - start;
const diffDays = diffMs / (1000 * 60 * 60 * 24);  // Error-prone

// ✅ NEW: Duration objects
const s = Temporal.PlainDate.from('2024-01-01');
const e = Temporal.PlainDate.from('2024-06-15');
const duration = s.until(e);
console.log(duration.days);  // 166


// === FORMATTING ===

// ❌ OLD: toLocaleString or manual formatting
const date4 = new Date('2024-06-15T10:30:00');
const formatted = date4.toLocaleString('en-US', { 
  dateStyle: 'long', 
  timeStyle: 'short' 
});

// ✅ NEW: Same Intl support, but with consistent types
const pdt = Temporal.PlainDateTime.from('2024-06-15T10:30:00');
const fmt = pdt.toLocaleString('en-US', { 
  dateStyle: 'long', 
  timeStyle: 'short' 
});
```

### Converting Between Date and Temporal

```javascript
// Date → Temporal
const date = new Date();

// To Instant
const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());

// To ZonedDateTime (in specific timezone)
const zdt = instant.toZonedDateTimeISO('America/New_York');

// To PlainDateTime (loses timezone)
const pdt = zdt.toPlainDateTime();


// Temporal → Date
const instant2 = Temporal.Now.instant();
const date2 = new Date(instant2.epochMilliseconds);

// Or from ZonedDateTime
const zdt2 = Temporal.Now.zonedDateTimeISO('America/New_York');
const date3 = new Date(zdt2.epochMilliseconds);
```

---

## 20.10 Duration Deep Dive

### Understanding Duration Components

```javascript
// Duration has these components (in order):
// years, months, weeks, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds

const duration = Temporal.Duration.from({
  years: 1,
  months: 2,
  weeks: 3,
  days: 4,
  hours: 5,
  minutes: 6,
  seconds: 7,
  milliseconds: 8,
  microseconds: 9,
  nanoseconds: 10
});

console.log(duration.toString());
// P1Y2M3W4DT5H6M7.008009010S

// ISO 8601 Duration format:
// P = period start
// 1Y = 1 year
// 2M = 2 months
// 3W = 3 weeks
// 4D = 4 days
// T = time start
// 5H = 5 hours
// 6M = 6 minutes
// 7.008009010S = 7 seconds and fractional
```

### Duration Balancing

```javascript
// By default, Duration doesn't balance
const d1 = Temporal.Duration.from({ hours: 36 });
console.log(d1.hours);  // 36 (not converted to days)

// Balancing converts to larger units
const d2 = d1.round({ largestUnit: 'days' });
console.log(d2.days, d2.hours);  // 1 day, 12 hours

// Complex balancing example
const duration = Temporal.Duration.from({
  seconds: 90061  // 25 hours, 1 minute, 1 second
});

const balanced = duration.round({
  largestUnit: 'days',
  smallestUnit: 'seconds'
});
console.log(balanced.toString());  // P1DT1H1M1S
```

### Duration Arithmetic

```javascript
// Add durations
const d1 = Temporal.Duration.from({ hours: 5, minutes: 30 });
const d2 = Temporal.Duration.from({ hours: 2, minutes: 45 });
const sum = d1.add(d2);
console.log(sum.toString());  // PT8H15M (unbalanced!)

// Subtract durations
const diff = d1.subtract(d2);
console.log(diff.toString());  // PT2H45M

// Negate duration
const neg = d1.negated();
console.log(neg.toString());  // -PT5H30M

// Absolute value
const abs = neg.abs();
console.log(abs.toString());  // PT5H30M
```

### Duration with Relative Context

```javascript
// Months/years need a reference date (they vary in length!)
const duration = Temporal.Duration.from({ months: 1 });

const jan1 = Temporal.PlainDate.from('2024-01-01');
const feb1 = Temporal.PlainDate.from('2024-02-01');

// January has 31 days, February has 29 (2024 is leap year)
const janDays = jan1.until(jan1.add(duration), { largestUnit: 'days' });
const febDays = feb1.until(feb1.add(duration), { largestUnit: 'days' });

console.log(janDays.days);  // 31
console.log(febDays.days);  // 29

// This is why duration.total() needs relativeTo:
const totalDays = duration.total({
  unit: 'days',
  relativeTo: jan1
});
console.log(totalDays);  // 31
```

### Common Duration Patterns

```javascript
// 1. Human-readable duration
function formatDuration(duration) {
  const parts = [];
  if (duration.years) parts.push(`${duration.years}y`);
  if (duration.months) parts.push(`${duration.months}mo`);
  if (duration.days) parts.push(`${duration.days}d`);
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  if (duration.seconds) parts.push(`${duration.seconds}s`);
  return parts.join(' ') || '0s';
}

const d = Temporal.Duration.from({ hours: 2, minutes: 30 });
console.log(formatDuration(d));  // "2h 30m"


// 2. Age calculation
function getAge(birthDate) {
  const today = Temporal.Now.plainDateISO();
  const birth = Temporal.PlainDate.from(birthDate);
  return birth.until(today, { largestUnit: 'years' });
}

const age = getAge('1990-05-15');
console.log(`${age.years} years, ${age.months} months, ${age.days} days`);


// 3. Time until event
function timeUntil(eventDateTime) {
  const now = Temporal.Now.zonedDateTimeISO();
  const event = Temporal.ZonedDateTime.from(eventDateTime);
  return now.until(event, { largestUnit: 'days' });
}

const countdown = timeUntil('2024-12-31T23:59:59[America/New_York]');
console.log(formatDuration(countdown));


// 4. Business hours calculation
function businessHoursBetween(start, end) {
  let current = start;
  let totalHours = 0;
  
  while (Temporal.PlainDateTime.compare(current, end) < 0) {
    // Skip weekends
    if (current.dayOfWeek <= 5) {  // Mon-Fri
      // Count hours between 9-17
      const dayStart = current.with({ hour: 9, minute: 0 });
      const dayEnd = current.with({ hour: 17, minute: 0 });
      
      const effectiveStart = Temporal.PlainDateTime.compare(current, dayStart) > 0 
        ? current : dayStart;
      const effectiveEnd = Temporal.PlainDateTime.compare(end, dayEnd) < 0 
        ? end : dayEnd;
      
      if (Temporal.PlainDateTime.compare(effectiveStart, effectiveEnd) < 0) {
        const hours = effectiveStart.until(effectiveEnd, { largestUnit: 'hours' });
        totalHours += hours.hours + hours.minutes / 60;
      }
    }
    
    current = current.add({ days: 1 }).with({ hour: 0, minute: 0 });
  }
  
  return totalHours;
}
```

---

## 20.11 Timezone Gotchas

### DST Transitions

```javascript
// DST "spring forward" - hour doesn't exist
try {
  // 2:30 AM doesn't exist on March 10, 2024 (US DST)
  const impossible = Temporal.ZonedDateTime.from(
    '2024-03-10T02:30[America/New_York]',
    { offset: 'reject' }  // Strict mode
  );
} catch (e) {
  console.log('Time does not exist!');
}

// Default behavior: adjust to valid time
const adjusted = Temporal.ZonedDateTime.from('2024-03-10T02:30[America/New_York]');
console.log(adjusted.toString());  // 2024-03-10T03:30:00-04:00 (moved forward)


// DST "fall back" - hour exists twice
// 1:30 AM happens twice on November 3, 2024
const ambiguous1 = Temporal.ZonedDateTime.from({
  year: 2024, month: 11, day: 3,
  hour: 1, minute: 30,
  timeZone: 'America/New_York',
  offset: '-04:00'  // First 1:30 (before fall back)
});

const ambiguous2 = Temporal.ZonedDateTime.from({
  year: 2024, month: 11, day: 3,
  hour: 1, minute: 30,
  timeZone: 'America/New_York',
  offset: '-05:00'  // Second 1:30 (after fall back)
});

console.log(ambiguous1.epochMilliseconds !== ambiguous2.epochMilliseconds);  // true!
```

### Duration Across DST

```javascript
// Adding hours vs adding days across DST
const beforeDST = Temporal.ZonedDateTime.from('2024-03-10T01:00[America/New_York]');

// Add 24 hours - actual elapsed time
const plus24h = beforeDST.add({ hours: 24 });
console.log(plus24h.toString());  // 2024-03-11T02:00 (clock shows 2AM)

// Add 1 day - same wall clock time
const plus1d = beforeDST.add({ days: 1 });
console.log(plus1d.toString());   // 2024-03-11T01:00 (clock shows 1AM)

// Different results! March 10 only has 23 hours
```

### Common Timezone Mistakes

```javascript
// ❌ WRONG: Assuming all days have 24 hours
function addDayBad(date) {
  return date.add({ hours: 24 });  // Wrong on DST days!
}

// ✅ CORRECT: Use calendar days
function addDayGood(date) {
  return date.add({ days: 1 });  // Correct!
}


// ❌ WRONG: Comparing ZonedDateTime directly
const tokyo = Temporal.ZonedDateTime.from('2024-06-15T15:00[Asia/Tokyo]');
const ny = Temporal.ZonedDateTime.from('2024-06-15T02:00[America/New_York]');
// These are the SAME instant! But string comparison would say tokyo > ny

// ✅ CORRECT: Compare instants
console.log(tokyo.toInstant().equals(ny.toInstant()));  // true!


// ❌ WRONG: Storing timezone name from user, applying to server time
// User says "America/New_York", server is in UTC
const serverTime = Temporal.Now.plainDateTimeISO();  // Server time!
const wrongZDT = serverTime.toZonedDateTime('America/New_York');  // Wrong timezone applied!

// ✅ CORRECT: Use instant, then convert
const instant = Temporal.Now.instant();
const correctZDT = instant.toZonedDateTimeISO('America/New_York');
```

---

## Summary

| Type | Use Case | Example |
|------|----------|---------|
| **Instant** | Timestamps, logs, precise moments | `Temporal.Now.instant()` |
| **ZonedDateTime** | Display times, scheduling across zones | User's local time |
| **PlainDate** | Birthdays, holidays, date-only data | `2024-06-15` |
| **PlainTime** | Alarms, business hours | `09:00` |
| **PlainDateTime** | Form inputs, local events | `2024-06-15T09:00` |
| **Duration** | Time differences, intervals | `P1Y2M3D` |

### Migration Checklist

- [ ] Replace `new Date()` with `Temporal.Now.instant()` or `Temporal.Now.zonedDateTimeISO()`
- [ ] Replace 0-indexed months with 1-indexed months
- [ ] Replace mutable date operations with immutable `.with()` and `.add()`
- [ ] Replace `getTime()` comparisons with `Temporal.*.compare()`
- [ ] Replace manual duration math with `Duration` objects
- [ ] Store timezones explicitly with `ZonedDateTime`

---

**End of Chapter 20**
