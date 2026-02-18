# 37.6 Long Tasks API

The Long Tasks API detects JavaScript tasks that block the main thread for more than 50ms.

---

## 37.6.1 Observe Long Tasks

### Setup Observer

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Long task detected');
    console.log('Duration:', entry.duration);
    console.log('Start:', entry.startTime);
    console.log('Attribution:', entry.attribution);
  });
});

observer.observe({ type: 'longtask', buffered: true });
```

---

## 37.6.2 Task Attribution

### Identify Source

```javascript
entry.attribution.forEach(attr => {
  console.log('Container:', attr.containerType);
  console.log('Container ID:', attr.containerId);
  console.log('Container Name:', attr.containerName);
  console.log('Container Src:', attr.containerSrc);
});
```

---

## 37.6.3 Use Cases

### Detect Jank

```javascript
let longTaskCount = 0;
let totalBlockingTime = 0;

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    longTaskCount++;
    totalBlockingTime += entry.duration - 50;  // Blocking time above 50ms
  });
});

observer.observe({ type: 'longtask', buffered: true });
```

---

## 37.6.4 Summary

### Long Task Properties

| Property | Description |
|----------|-------------|
| `duration` | Task duration (>50ms) |
| `startTime` | Task start time |
| `attribution` | Source attribution |

---

**End of Chapter 37.6: Long Tasks API**

Next: **37.7 Element Timing API**.
