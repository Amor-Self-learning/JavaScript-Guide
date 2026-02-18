# 37.4 User Timing API

The User Timing API enables custom performance measurements with marks and measures.

---

## 37.4.1 Performance Marks

### Create Marks

```javascript
// Create a mark
performance.mark('start-task');

// Do work
doTask();

// Create end mark
performance.mark('end-task');
```

### Get Marks

```javascript
const marks = performance.getEntriesByType('mark');
const startMark = performance.getEntriesByName('start-task')[0];

console.log('Mark time:', startMark.startTime);
```

---

## 37.4.2 Performance Measures

### Create Measures

```javascript
// Measure between two marks
performance.measure('task-duration', 'start-task', 'end-task');

// Measure from navigation start
performance.measure('time-to-task', undefined, 'end-task');

// Get measure
const measures = performance.getEntriesByType('measure');
console.log('Duration:', measures[0].duration);
```

### Measure Options

```javascript
performance.measure('my-measure', {
  start: 'mark-a',
  end: 'mark-b',
  detail: { info: 'custom data' }
});
```

---

## 37.4.3 Clear Timing Data

```javascript
performance.clearMarks();
performance.clearMarks('specific-mark');

performance.clearMeasures();
performance.clearMeasures('specific-measure');
```

---

## 37.4.4 Example: Function Timing

```javascript
function timeFunction(fn, name) {
  const markStart = `${name}-start`;
  const markEnd = `${name}-end`;
  
  performance.mark(markStart);
  const result = fn();
  performance.mark(markEnd);
  
  performance.measure(name, markStart, markEnd);
  
  const [measure] = performance.getEntriesByName(name);
  console.log(`${name}: ${measure.duration}ms`);
  
  return result;
}
```

---

## 37.4.5 Summary

### Methods

| Method | Description |
|--------|-------------|
| `mark(name, options?)` | Create mark |
| `measure(name, start?, end?)` | Create measure |
| `clearMarks(name?)` | Clear marks |
| `clearMeasures(name?)` | Clear measures |

---

**End of Chapter 37.4: User Timing API**

Next: **37.5 Paint Timing API**.
