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
