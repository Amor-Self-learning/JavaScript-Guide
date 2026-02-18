# 37.1 Performance Object

The Performance API provides access to high-resolution timing and performance metrics. This chapter covers the performance object basics.

---

## 37.1.1 High-Resolution Time

### performance.now()

```javascript
// High-resolution timestamp in milliseconds
const start = performance.now();

// Do work
doSomething();

const end = performance.now();
console.log(`Took ${end - start} ms`);
```

### Precision

```javascript
// Sub-millisecond precision
console.log(performance.now());  // e.g., 1234.567890123
```

---

## 37.1.2 Time Origin

### performance.timeOrigin

```javascript
// Time origin (document load start) as Unix timestamp
const origin = performance.timeOrigin;
console.log(new Date(origin));

// Current Unix time
const now = performance.timeOrigin + performance.now();
```

---

## 37.1.3 Performance Entries

### Get All Entries

```javascript
const entries = performance.getEntries();
entries.forEach(entry => {
  console.log(entry.name, entry.entryType, entry.duration);
});
```

### Get by Type

```javascript
// Navigation entries
const navEntries = performance.getEntriesByType('navigation');

// Resource entries
const resourceEntries = performance.getEntriesByType('resource');

// Paint entries
const paintEntries = performance.getEntriesByType('paint');
```

### Get by Name

```javascript
const entries = performance.getEntriesByName('https://example.com/script.js');
```

---

## 37.1.4 Clear Entries

### Clear Performance Data

```javascript
// Clear resource entries
performance.clearResourceTimings();

// Clear marks
performance.clearMarks();
performance.clearMarks('mark-name');

// Clear measures
performance.clearMeasures();
performance.clearMeasures('measure-name');
```

---

## 37.1.5 Summary

### Methods

| Method | Description |
|--------|-------------|
| `now()` | High-res timestamp |
| `getEntries()` | All entries |
| `getEntriesByType(type)` | Entries by type |
| `getEntriesByName(name)` | Entries by name |
| `clearResourceTimings()` | Clear resources |
| `clearMarks(name?)` | Clear marks |
| `clearMeasures(name?)` | Clear measures |

### Properties

| Property | Description |
|----------|-------------|
| `timeOrigin` | Navigation start time |

---

**End of Chapter 37.1: Performance Object**

Next: **37.2 Navigation Timing API**.
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
# 37.3 Resource Timing API

The Resource Timing API provides timing data for resources loaded on a page.

---

## 37.3.1 Get Resource Entries

### Access Resource Timing

```javascript
const resources = performance.getEntriesByType('resource');

resources.forEach(resource => {
  console.log(resource.name);
  console.log('Duration:', resource.duration);
  console.log('Size:', resource.transferSize);
});
```

---

## 37.3.2 Resource Properties

### Timing Data

```javascript
resources.forEach(res => {
  // Timing
  const dns = res.domainLookupEnd - res.domainLookupStart;
  const tcp = res.connectEnd - res.connectStart;
  const request = res.responseStart - res.requestStart;
  const response = res.responseEnd - res.responseStart;
  
  // Size (requires Timing-Allow-Origin header)
  console.log('Transfer size:', res.transferSize);
  console.log('Encoded size:', res.encodedBodySize);
  console.log('Decoded size:', res.decodedBodySize);
  
  // Type
  console.log('Initiator:', res.initiatorType);  // script, img, css, etc.
});
```

---

## 37.3.3 Filter Resources

### By Type

```javascript
const scripts = performance.getEntriesByType('resource')
  .filter(r => r.initiatorType === 'script');

const images = performance.getEntriesByType('resource')
  .filter(r => r.initiatorType === 'img');
```

---

## 37.3.4 Summary

### Resource Entry Properties

| Property | Description |
|----------|-------------|
| `name` | Resource URL |
| `initiatorType` | script, img, css, etc. |
| `duration` | Total load time |
| `transferSize` | Transfer size |
| `encodedBodySize` | Compressed size |
| `decodedBodySize` | Decompressed size |

---

**End of Chapter 37.3: Resource Timing API**

Next: **37.4 User Timing API**.
# 37.4 User Timing API

The User Timing API enables custom performance measurements with marks and measures.

---

## 37.4.1 Performance Marks

### Create Marks

```javascript
// Create a mark
performance.mark('start-task');

// Do work
doTask();

// Create end mark
performance.mark('end-task');
```

### Get Marks

```javascript
const marks = performance.getEntriesByType('mark');
const startMark = performance.getEntriesByName('start-task')[0];

console.log('Mark time:', startMark.startTime);
```

---

## 37.4.2 Performance Measures

### Create Measures

```javascript
// Measure between two marks
performance.measure('task-duration', 'start-task', 'end-task');

// Measure from navigation start
performance.measure('time-to-task', undefined, 'end-task');

// Get measure
const measures = performance.getEntriesByType('measure');
console.log('Duration:', measures[0].duration);
```

### Measure Options

```javascript
performance.measure('my-measure', {
  start: 'mark-a',
  end: 'mark-b',
  detail: { info: 'custom data' }
});
```

---

## 37.4.3 Clear Timing Data

```javascript
performance.clearMarks();
performance.clearMarks('specific-mark');

performance.clearMeasures();
performance.clearMeasures('specific-measure');
```

---

## 37.4.4 Example: Function Timing

```javascript
function timeFunction(fn, name) {
  const markStart = `${name}-start`;
  const markEnd = `${name}-end`;
  
  performance.mark(markStart);
  const result = fn();
  performance.mark(markEnd);
  
  performance.measure(name, markStart, markEnd);
  
  const [measure] = performance.getEntriesByName(name);
  console.log(`${name}: ${measure.duration}ms`);
  
  return result;
}
```

---

## 37.4.5 Summary

### Methods

| Method | Description |
|--------|-------------|
| `mark(name, options?)` | Create mark |
| `measure(name, start?, end?)` | Create measure |
| `clearMarks(name?)` | Clear marks |
| `clearMeasures(name?)` | Clear measures |

---

**End of Chapter 37.4: User Timing API**

Next: **37.5 Paint Timing API**.
# 37.5 Paint Timing API

The Paint Timing API provides metrics for First Paint and First Contentful Paint.

---

## 37.5.1 Get Paint Entries

### Access Paint Timing

```javascript
const paintEntries = performance.getEntriesByType('paint');

paintEntries.forEach(entry => {
  console.log(entry.name, entry.startTime);
});

// Output:
// first-paint 123.45
// first-contentful-paint 234.56
```

---

## 37.5.2 Paint Metrics

### First Paint (FP)

```javascript
const fp = performance.getEntriesByName('first-paint')[0];
console.log('First Paint:', fp?.startTime);
```

### First Contentful Paint (FCP)

```javascript
const fcp = performance.getEntriesByName('first-contentful-paint')[0];
console.log('FCP:', fcp?.startTime);
```

---

## 37.5.3 With PerformanceObserver

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(entry.name, entry.startTime);
  });
});

observer.observe({ type: 'paint', buffered: true });
```

---

## 37.5.4 Summary

### Paint Entry Types

| Name | Description |
|------|-------------|
| `first-paint` | First pixel rendered |
| `first-contentful-paint` | First content rendered |

---

**End of Chapter 37.5: Paint Timing API**

Next: **37.6 Long Tasks API**.
# 37.6 Long Tasks API

The Long Tasks API detects JavaScript tasks that block the main thread for more than 50ms.

---

## 37.6.1 Observe Long Tasks

### Setup Observer

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Long task detected');
    console.log('Duration:', entry.duration);
    console.log('Start:', entry.startTime);
    console.log('Attribution:', entry.attribution);
  });
});

observer.observe({ type: 'longtask', buffered: true });
```

---

## 37.6.2 Task Attribution

### Identify Source

```javascript
entry.attribution.forEach(attr => {
  console.log('Container:', attr.containerType);
  console.log('Container ID:', attr.containerId);
  console.log('Container Name:', attr.containerName);
  console.log('Container Src:', attr.containerSrc);
});
```

---

## 37.6.3 Use Cases

### Detect Jank

```javascript
let longTaskCount = 0;
let totalBlockingTime = 0;

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    longTaskCount++;
    totalBlockingTime += entry.duration - 50;  // Blocking time above 50ms
  });
});

observer.observe({ type: 'longtask', buffered: true });
```

---

## 37.6.4 Summary

### Long Task Properties

| Property | Description |
|----------|-------------|
| `duration` | Task duration (>50ms) |
| `startTime` | Task start time |
| `attribution` | Source attribution |

---

**End of Chapter 37.6: Long Tasks API**

Next: **37.7 Element Timing API**.
# 37.7 Element Timing API

The Element Timing API measures render timing for specific elements marked with the `elementtiming` attribute.

---

## 37.7.1 Mark Elements

### HTML Attribute

```html
<img src="hero.jpg" elementtiming="hero-image" alt="Hero">
<div elementtiming="main-content">Main content here</div>
```

---

## 37.7.2 Observe Element Timing

### Setup Observer

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Element:', entry.identifier);
    console.log('Render time:', entry.renderTime);
    console.log('Load time:', entry.loadTime);
    console.log('Size:', entry.intersectionRect);
  });
});

observer.observe({ type: 'element', buffered: true });
```

---

## 37.7.3 Entry Properties

### Available Data

```javascript
entry.identifier;      // elementtiming attribute value
entry.renderTime;      // When element was painted
entry.loadTime;        // When element finished loading
entry.element;         // The element reference
entry.url;             // Resource URL (for images)
entry.naturalWidth;    // Image natural width
entry.naturalHeight;   // Image natural height
```

---

## 37.7.4 Summary

### Setup Steps

1. Add `elementtiming="name"` to elements
2. Create PerformanceObserver for 'element' type
3. Read timing entries

---

**End of Chapter 37.7: Element Timing API**

Next: **37.8 Event Timing API**.
# 37.8 Event Timing API

The Event Timing API measures input responsiveness, including First Input Delay (FID) and Interaction to Next Paint (INP).

---

## 37.8.1 Observe Event Timing

### Setup Observer

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    // Input delay
    const delay = entry.processingStart - entry.startTime;
    
    // Processing time
    const processing = entry.processingEnd - entry.processingStart;
    
    // Total duration
    console.log('Delay:', delay);
    console.log('Processing:', processing);
    console.log('Duration:', entry.duration);
  });
});

observer.observe({ type: 'event', buffered: true });
```

---

## 37.8.2 First Input Delay

### Measure FID

```javascript
const observer = new PerformanceObserver((list) => {
  const firstInput = list.getEntries()[0];
  const fid = firstInput.processingStart - firstInput.startTime;
  
  console.log('FID:', fid);
  observer.disconnect();
});

observer.observe({ type: 'first-input', buffered: true });
```

---

## 37.8.3 Event Entry Properties

| Property | Description |
|----------|-------------|
| `name` | Event type |
| `startTime` | Event timestamp |
| `processingStart` | Handler start |
| `processingEnd` | Handler end |
| `duration` | Total duration |
| `cancelable` | Was cancelable |

---

**End of Chapter 37.8: Event Timing API**

Next: **37.9 Server Timing API**.
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
