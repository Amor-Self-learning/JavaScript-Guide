# 38.1 Deprecation Reports

The Reporting API allows browsers to report deprecation warnings when your code uses obsolete features.

---

## 38.1.1 Configure Reporting

### HTTP Header

```http
Report-To: { "group": "default", "max_age": 86400, "endpoints": [{ "url": "https://example.com/reports" }] }
```

### Reporting-Endpoints Header

```http
Reporting-Endpoints: default="https://example.com/reports"
```

---

## 38.1.2 Deprecation Report Structure

### Report Format

```json
{
  "type": "deprecation",
  "age": 20,
  "url": "https://example.com/page.html",
  "body": {
    "id": "feature-id",
    "message": "Feature X is deprecated",
    "anticipatedRemoval": "2024-01-01",
    "sourceFile": "https://example.com/script.js",
    "lineNumber": 42,
    "columnNumber": 15
  }
}
```

---

## 38.1.3 JavaScript Access

### ReportingObserver

```javascript
const observer = new ReportingObserver((reports, observer) => {
  reports.forEach(report => {
    if (report.type === 'deprecation') {
      console.warn('Deprecation:', report.body.message);
      console.log('Feature:', report.body.id);
    }
  });
});

observer.observe();
```

---

## 38.1.4 Summary

| Property | Description |
|----------|-------------|
| `id` | Deprecation identifier |
| `message` | Human-readable message |
| `anticipatedRemoval` | Removal date |
| `sourceFile` | Script file |
| `lineNumber` | Line number |

---

**End of Chapter 38.1: Deprecation Reports**

Next: **38.2 Intervention Reports**.
# 38.2 Intervention Reports

Intervention reports notify when the browser modifies your code's behavior for user experience or security.

---

## 38.2.1 What Are Interventions?

Browsers may block or modify behavior:
- Auto-playing audio without user gesture
- Blocking expensive timers on background pages
- Preventing excessive DOM manipulation
- Throttling excessive CPU usage

---

## 38.2.2 Report Structure

```json
{
  "type": "intervention",
  "url": "https://example.com/page.html",
  "body": {
    "id": "audio-autoplay",
    "message": "Audio playback was blocked because user didn't interact",
    "sourceFile": "https://example.com/player.js",
    "lineNumber": 15,
    "columnNumber": 10
  }
}
```

---

## 38.2.3 Observe Interventions

```javascript
const observer = new ReportingObserver((reports) => {
  reports.forEach(report => {
    if (report.type === 'intervention') {
      console.warn('Intervention:', report.body.message);
      analytics.track('browser-intervention', report.body);
    }
  });
}, { types: ['intervention'] });

observer.observe();
```

---

## 38.2.4 Summary

| Intervention | Description |
|--------------|-------------|
| Audio autoplay | Blocked without gesture |
| Background timers | Throttled |
| Heavy ads | May be unloaded |
| CPU usage | May be throttled |

---

**End of Chapter 38.2: Intervention Reports**

Next: **38.3 Crash Reports**.
# 38.3 Crash Reports

Crash reports inform when a document unexpectedly terminates.

---

## 38.3.1 Configure Crash Reporting

### Document-Policy Header

```http
Document-Policy: document-write=?0
Reporting-Endpoints: default="https://example.com/reports"
```

---

## 38.3.2 Report Structure

```json
{
  "type": "crash",
  "url": "https://example.com/page.html",
  "body": {
    "reason": "oom"  // out of memory
  }
}
```

---

## 38.3.3 Crash Reasons

| Reason | Description |
|--------|-------------|
| `oom` | Out of memory |
| `unresponsive` | Page became unresponsive |

---

## 38.3.4 Note

Crash reports are sent asynchronously by the browser after the crash. They cannot be observed with `ReportingObserver` since JavaScript is no longer running.

---

**End of Chapter 38.3: Crash Reports**

Next: **38.4 ReportingObserver**.
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
