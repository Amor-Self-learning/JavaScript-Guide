# 37.5 Paint Timing API

The Paint Timing API provides metrics for First Paint and First Contentful Paint.

---

## 37.5.1 Get Paint Entries

### Access Paint Timing

```javascript
const paintEntries = performance.getEntriesByType('paint');

paintEntries.forEach(entry => {
  console.log(entry.name, entry.startTime);
});

// Output:
// first-paint 123.45
// first-contentful-paint 234.56
```

---

## 37.5.2 Paint Metrics

### First Paint (FP)

```javascript
const fp = performance.getEntriesByName('first-paint')[0];
console.log('First Paint:', fp?.startTime);
```

### First Contentful Paint (FCP)

```javascript
const fcp = performance.getEntriesByName('first-contentful-paint')[0];
console.log('FCP:', fcp?.startTime);
```

---

## 37.5.3 With PerformanceObserver

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(entry.name, entry.startTime);
  });
});

observer.observe({ type: 'paint', buffered: true });
```

---

## 37.5.4 Summary

### Paint Entry Types

| Name | Description |
|------|-------------|
| `first-paint` | First pixel rendered |
| `first-contentful-paint` | First content rendered |

---

**End of Chapter 37.5: Paint Timing API**

Next: **37.6 Long Tasks API**.
