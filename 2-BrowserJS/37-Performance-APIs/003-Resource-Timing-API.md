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
