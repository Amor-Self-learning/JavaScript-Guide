# 38.4 ReportingObserver

ReportingObserver provides JavaScript access to browser reports for deprecations and interventions.

---

## 38.4.1 Create Observer

```javascript
const observer = new ReportingObserver((reports, observer) => {
  for (const report of reports) {
    console.log('Type:', report.type);
    console.log('URL:', report.url);
    console.log('Body:', report.body);
  }
});

observer.observe();
```

---

## 38.4.2 Observer Options

### Filter by Type

```javascript
const observer = new ReportingObserver(callback, {
  types: ['deprecation']  // Only deprecation reports
});

// Or multiple types
const observer2 = new ReportingObserver(callback, {
  types: ['deprecation', 'intervention']
});
```

### Buffered Reports

```javascript
const observer = new ReportingObserver(callback, {
  types: ['deprecation'],
  buffered: true  // Include reports from before observer creation
});
```

---

## 38.4.3 Methods

### takeRecords()

```javascript
// Get pending reports synchronously
const pendingReports = observer.takeRecords();
```

### disconnect()

```javascript
// Stop observing
observer.disconnect();
```

---

## 38.4.4 Summary

| Method | Description |
|--------|-------------|
| `observe()` | Start observing |
| `disconnect()` | Stop observing |
| `takeRecords()` | Get pending reports |

| Option | Description |
|--------|-------------|
| `types` | Report types to observe |
| `buffered` | Include buffered reports |

---

**End of Chapter 38.4: ReportingObserver**

This completes Group 38 — Reporting API. Next: **Group 39 — Web Speech API**.
