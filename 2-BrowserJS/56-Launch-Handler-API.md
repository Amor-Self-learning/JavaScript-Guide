# 56.1 Launch Handler API

The Launch Handler API controls how a PWA handles being launched.

---

## 56.1.1 Manifest Configuration

```json
{
  "name": "My App",
  "launch_handler": {
    "client_mode": "navigate-new"
  }
}
```

---

## 56.1.2 Client Modes

| Mode | Behavior |
|------|----------|
| `auto` | Browser decides |
| `navigate-new` | Always new window |
| `navigate-existing` | Focus existing, navigate |
| `focus-existing` | Focus existing, don't navigate |

---

## 56.1.3 Handle Launch

```javascript
if ('launchQueue' in window) {
  launchQueue.setConsumer((launchParams) => {
    if (launchParams.targetURL) {
      console.log('Launched with:', launchParams.targetURL);
    }
    
    if (launchParams.files?.length > 0) {
      // Handle file launch
      for (const file of launchParams.files) {
        handleFile(file);
      }
    }
  });
}
```

---

## 56.1.4 Launch with Files

```json
{
  "file_handlers": [
    {
      "action": "/open",
      "accept": {
        "text/plain": [".txt"]
      }
    }
  ],
  "launch_handler": {
    "client_mode": "focus-existing"
  }
}
```

---

## 56.1.5 Summary

| Property | Description |
|----------|-------------|
| `launchQueue` | Queue of launch events |
| `setConsumer()` | Handle launches |
| `targetURL` | URL that triggered launch |
| `files` | Files opened with app |

---

**End of Chapter 56.1: Launch Handler API**

This completes Group 56. Next: **Group 57 — Window Management API**.
