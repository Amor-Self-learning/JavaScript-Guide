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
