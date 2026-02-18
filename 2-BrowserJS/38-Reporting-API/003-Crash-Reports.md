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
