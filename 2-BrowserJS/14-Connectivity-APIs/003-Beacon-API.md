# 14.3 Beacon API

The Beacon API provides an asynchronous way to send small amounts of data to a server, guaranteed to be sent even when the page is unloading.

---

## 14.3.1 Basic Usage

### sendBeacon

```javascript
// Send data when page unloads
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/analytics', JSON.stringify({
    event: 'page_exit',
    timestamp: Date.now()
  }));
});
```

### Return Value

```javascript
const success = navigator.sendBeacon('/log', data);

if (success) {
  console.log('Beacon queued');
} else {
  console.log('Beacon failed to queue');
}
```

---

## 14.3.2 Data Types

### String Data

```javascript
navigator.sendBeacon('/log', 'user clicked button');
```

### JSON Data

```javascript
const data = { action: 'click', element: 'submit' };
navigator.sendBeacon('/log', JSON.stringify(data));
```

### FormData

```javascript
const formData = new FormData();
formData.append('event', 'pageview');
formData.append('url', location.href);

navigator.sendBeacon('/analytics', formData);
```

### Blob

```javascript
const blob = new Blob([JSON.stringify({ event: 'exit' })], {
  type: 'application/json'
});

navigator.sendBeacon('/log', blob);
```

### URLSearchParams

```javascript
const params = new URLSearchParams({
  event: 'click',
  target: 'button'
});

navigator.sendBeacon('/track', params);
```

---

## 14.3.3 Common Use Cases

### Analytics Tracking

```javascript
class Analytics {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.queue = [];
    
    window.addEventListener('beforeunload', () => this.flush());
  }
  
  track(event, data = {}) {
    this.queue.push({
      event,
      data,
      timestamp: Date.now()
    });
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    const blob = new Blob([JSON.stringify(this.queue)], {
      type: 'application/json'
    });
    
    navigator.sendBeacon(this.endpoint, blob);
    this.queue = [];
  }
}

const analytics = new Analytics('/analytics');
analytics.track('page_view', { path: location.pathname });
```

### Session Duration

```javascript
const sessionStart = Date.now();

window.addEventListener('beforeunload', () => {
  const duration = Date.now() - sessionStart;
  
  navigator.sendBeacon('/session', JSON.stringify({
    duration,
    pages: pageCount
  }));
});
```

### Error Reporting

```javascript
window.addEventListener('error', (event) => {
  const errorData = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  };
  
  // Queue error for reporting
  errorQueue.push(errorData);
});

window.addEventListener('beforeunload', () => {
  if (errorQueue.length > 0) {
    navigator.sendBeacon('/errors', JSON.stringify(errorQueue));
  }
});
```

---

## 14.3.4 Beacon vs Fetch

### Why Use Beacon?

```javascript
// ❌ Fetch might be cancelled on unload
window.addEventListener('beforeunload', () => {
  fetch('/log', {
    method: 'POST',
    body: JSON.stringify(data)
  });  // May not complete!
});

// ✅ Beacon is guaranteed to be sent
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/log', JSON.stringify(data));
});
```

### Comparison

| Feature | Beacon | Fetch |
|---------|--------|-------|
| Unload safe | ✅ | ❌ |
| Response access | ❌ | ✅ |
| Custom headers | ❌ | ✅ |
| Max size | ~64KB | Unlimited |
| Method | POST only | Any |
| Async | Always | Configurable |

---

## 14.3.5 Limitations

### No Custom Headers

```javascript
// Cannot set Authorization or custom headers
// Use FormData or Blob with appropriate type
```

### POST Only

```javascript
// Always sends POST request
// Cannot use GET, PUT, DELETE, etc.
```

### No Response

```javascript
// Cannot read response
const result = navigator.sendBeacon('/log', data);
// result is just true/false for queue success
```

### Size Limit

```javascript
// Typically 64KB limit
// For larger data, use Fetch with keepalive
```

---

## 14.3.6 Fetch with keepalive

### Alternative for More Control

```javascript
// For larger payloads or custom headers
window.addEventListener('beforeunload', () => {
  fetch('/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(largeData),
    keepalive: true  // Survive page unload
  });
});
```

---

## 14.3.7 Summary

### Syntax

```javascript
navigator.sendBeacon(url)
navigator.sendBeacon(url, data)
```

### Data Types

| Type | Content-Type |
|------|--------------|
| String | text/plain |
| Blob | Blob's type |
| FormData | multipart/form-data |
| URLSearchParams | application/x-www-form-urlencoded |

### Best Practices

1. **Use for analytics** and logging
2. **Queue events** and flush on unload
3. **Keep payload small** (<64KB)
4. **Use Blob** for JSON with proper Content-Type
5. **Use keepalive fetch** for custom headers
6. **Don't rely on response**

---

**End of Chapter 14.3: Beacon API**

Next chapter: **14.4 Network Information API** — detect connection type and quality.
