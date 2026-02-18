# 37.10 Performance Observer

PerformanceObserver provides an efficient way to subscribe to performance entries as they occur.

---

## 37.10.1 Basic Usage

### Create Observer

```javascript
const observer = new PerformanceObserver((list, observer) => {
  list.getEntries().forEach(entry => {
    console.log(entry.entryType, entry.name, entry.duration);
  });
});

// Observe specific types
observer.observe({ entryTypes: ['resource', 'paint'] });
```

---

## 37.10.2 Observe Options

### Entry Types

```javascript
// Multiple types
observer.observe({ entryTypes: ['resource', 'measure', 'mark'] });

// Single type with buffered
observer.observe({ type: 'paint', buffered: true });
```

### Buffered Entries

```javascript
// Get entries from before observer was created
observer.observe({ type: 'navigation', buffered: true });
```

---

## 37.10.3 Disconnect

### Stop Observing

```javascript
// Stop observer
observer.disconnect();

// Get pending entries
const pending = observer.takeRecords();
```

---

## 37.10.4 Supported Types

| Type | Description |
|------|-------------|
| `navigation` | Page navigation |
| `resource` | Resource loads |
| `paint` | Paint events |
| `mark` | User marks |
| `measure` | User measures |
| `longtask` | Long tasks |
| `element` | Element timing |
| `event` | Event timing |
| `first-input` | First input |
| `largest-contentful-paint` | LCP |
| `layout-shift` | CLS |

---

## 37.10.5 Complete Example

```javascript
// Monitor all Web Vitals
function observeWebVitals() {
  // LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lcp = entries[entries.length - 1];
    console.log('LCP:', lcp.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  
  // FID
  new PerformanceObserver((list) => {
    const fid = list.getEntries()[0];
    console.log('FID:', fid.processingStart - fid.startTime);
  }).observe({ type: 'first-input', buffered: true });
  
  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    console.log('CLS:', clsValue);
  }).observe({ type: 'layout-shift', buffered: true });
}
```

---

**End of Chapter 37.10: Performance Observer**

This completes Group 37 — Performance APIs. Next: **Group 38 — Reporting API**.
