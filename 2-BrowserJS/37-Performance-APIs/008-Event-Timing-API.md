# 37.8 Event Timing API

The Event Timing API measures input responsiveness, including First Input Delay (FID) and Interaction to Next Paint (INP).

---

## 37.8.1 Observe Event Timing

### Setup Observer

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    // Input delay
    const delay = entry.processingStart - entry.startTime;
    
    // Processing time
    const processing = entry.processingEnd - entry.processingStart;
    
    // Total duration
    console.log('Delay:', delay);
    console.log('Processing:', processing);
    console.log('Duration:', entry.duration);
  });
});

observer.observe({ type: 'event', buffered: true });
```

---

## 37.8.2 First Input Delay

### Measure FID

```javascript
const observer = new PerformanceObserver((list) => {
  const firstInput = list.getEntries()[0];
  const fid = firstInput.processingStart - firstInput.startTime;
  
  console.log('FID:', fid);
  observer.disconnect();
});

observer.observe({ type: 'first-input', buffered: true });
```

---

## 37.8.3 Event Entry Properties

| Property | Description |
|----------|-------------|
| `name` | Event type |
| `startTime` | Event timestamp |
| `processingStart` | Handler start |
| `processingEnd` | Handler end |
| `duration` | Total duration |
| `cancelable` | Was cancelable |

---

**End of Chapter 37.8: Event Timing API**

Next: **37.9 Server Timing API**.
