# 37.1 Performance Object

The Performance API provides access to high-resolution timing and performance metrics. This chapter covers the performance object basics.

---

## 37.1.1 High-Resolution Time

### performance.now()

```javascript
// High-resolution timestamp in milliseconds
const start = performance.now();

// Do work
doSomething();

const end = performance.now();
console.log(`Took ${end - start} ms`);
```

### Precision

```javascript
// Sub-millisecond precision
console.log(performance.now());  // e.g., 1234.567890123
```

---

## 37.1.2 Time Origin

### performance.timeOrigin

```javascript
// Time origin (document load start) as Unix timestamp
const origin = performance.timeOrigin;
console.log(new Date(origin));

// Current Unix time
const now = performance.timeOrigin + performance.now();
```

---

## 37.1.3 Performance Entries

### Get All Entries

```javascript
const entries = performance.getEntries();
entries.forEach(entry => {
  console.log(entry.name, entry.entryType, entry.duration);
});
```

### Get by Type

```javascript
// Navigation entries
const navEntries = performance.getEntriesByType('navigation');

// Resource entries
const resourceEntries = performance.getEntriesByType('resource');

// Paint entries
const paintEntries = performance.getEntriesByType('paint');
```

### Get by Name

```javascript
const entries = performance.getEntriesByName('https://example.com/script.js');
```

---

## 37.1.4 Clear Entries

### Clear Performance Data

```javascript
// Clear resource entries
performance.clearResourceTimings();

// Clear marks
performance.clearMarks();
performance.clearMarks('mark-name');

// Clear measures
performance.clearMeasures();
performance.clearMeasures('measure-name');
```

---

## 37.1.5 Summary

### Methods

| Method | Description |
|--------|-------------|
| `now()` | High-res timestamp |
| `getEntries()` | All entries |
| `getEntriesByType(type)` | Entries by type |
| `getEntriesByName(name)` | Entries by name |
| `clearResourceTimings()` | Clear resources |
| `clearMarks(name?)` | Clear marks |
| `clearMeasures(name?)` | Clear measures |

### Properties

| Property | Description |
|----------|-------------|
| `timeOrigin` | Navigation start time |

---

**End of Chapter 37.1: Performance Object**

Next: **37.2 Navigation Timing API**.
