# 37.2 Navigation Timing API

The Navigation Timing API provides metrics about page load performance. This chapter covers navigation timing entries.

---

## 37.2.1 Get Navigation Timing

### Access Metrics

```javascript
const [navigation] = performance.getEntriesByType('navigation');

console.log('Type:', navigation.type);  // 'navigate', 'reload', 'back_forward'
console.log('Duration:', navigation.duration);
```

---

## 37.2.2 Timing Metrics

### Key Timestamps

```javascript
const nav = performance.getEntriesByType('navigation')[0];

// DNS lookup
const dnsTime = nav.domainLookupEnd - nav.domainLookupStart;

// TCP connection
const tcpTime = nav.connectEnd - nav.connectStart;

// TLS handshake
const tlsTime = nav.secureConnectionStart > 0 
  ? nav.connectEnd - nav.secureConnectionStart : 0;

// Request/Response
const requestTime = nav.responseStart - nav.requestStart;
const responseTime = nav.responseEnd - nav.responseStart;

// DOM processing
const domProcessing = nav.domComplete - nav.responseEnd;

// Total load time
const totalTime = nav.loadEventEnd - nav.startTime;
```

---

## 37.2.3 Page Load Metrics

### Common Measurements

```javascript
const nav = performance.getEntriesByType('navigation')[0];

// Time to First Byte (TTFB)
const ttfb = nav.responseStart - nav.requestStart;

// DOM Content Loaded
const dcl = nav.domContentLoadedEventEnd - nav.startTime;

// Load Event
const load = nav.loadEventEnd - nav.startTime;

// DOM Interactive
const domInteractive = nav.domInteractive - nav.startTime;

console.log('TTFB:', ttfb);
console.log('DOMContentLoaded:', dcl);
console.log('Load:', load);
```

---

## 37.2.4 Summary

### Timeline Properties

| Property | Description |
|----------|-------------|
| `startTime` | Navigation start |
| `domainLookupStart/End` | DNS timing |
| `connectStart/End` | TCP timing |
| `secureConnectionStart` | TLS start |
| `requestStart` | Request sent |
| `responseStart/End` | Response timing |
| `domInteractive` | DOM interactive |
| `domContentLoadedEventStart/End` | DCL event |
| `loadEventStart/End` | Load event |
| `domComplete` | DOM complete |

---

**End of Chapter 37.2: Navigation Timing API**

Next: **37.3 Resource Timing API**.
