# 37.9 Server Timing API

The Server Timing API exposes backend performance metrics through HTTP headers.

---

## 37.9.1 Server Header

### Send Timing Data

```http
Server-Timing: db;dur=53, app;dur=47.2;desc="app logic", cache;desc="Cache Read"
```

---

## 37.9.2 Access in JavaScript

### Read Server Timing

```javascript
const resources = performance.getEntriesByType('resource');

resources.forEach(resource => {
  if (resource.serverTiming) {
    resource.serverTiming.forEach(timing => {
      console.log(timing.name);        // "db", "app", "cache"
      console.log(timing.duration);    // 53, 47.2, 0
      console.log(timing.description); // "", "app logic", "Cache Read"
    });
  }
});
```

---

## 37.9.3 Navigation Server Timing

```javascript
const [nav] = performance.getEntriesByType('navigation');

nav.serverTiming?.forEach(timing => {
  console.log(timing.name, timing.duration);
});
```

---

## 37.9.4 Summary

### ServerTiming Entry

| Property | Description |
|----------|-------------|
| `name` | Metric name |
| `duration` | Duration in ms |
| `description` | Description string |

---

**End of Chapter 37.9: Server Timing API**

Next: **37.10 Performance Observer**.
