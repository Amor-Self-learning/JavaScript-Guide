# 14.4 Network Information API

The Network Information API provides information about the system's connection type and quality. This enables adaptive content delivery based on network conditions.

---

## 14.4.1 Basic Usage

### Access Connection Info

```javascript
const connection = navigator.connection || 
                   navigator.mozConnection || 
                   navigator.webkitConnection;

if (connection) {
  console.log('Type:', connection.effectiveType);
  console.log('Downlink:', connection.downlink, 'Mbps');
  console.log('RTT:', connection.rtt, 'ms');
}
```

---

## 14.4.2 Connection Properties

### effectiveType

```javascript
// Effective connection type based on measured performance
// Values: 'slow-2g', '2g', '3g', '4g'

const connection = navigator.connection;

switch (connection.effectiveType) {
  case 'slow-2g':
  case '2g':
    loadLowQualityImages();
    break;
  case '3g':
    loadMediumQualityImages();
    break;
  case '4g':
    loadHighQualityImages();
    break;
}
```

### downlink

```javascript
// Estimated download speed in Mbps
const speed = connection.downlink;

if (speed < 1) {
  console.log('Slow connection');
} else if (speed < 5) {
  console.log('Moderate connection');
} else {
  console.log('Fast connection');
}
```

### rtt (Round-Trip Time)

```javascript
// Network round-trip time in milliseconds
const latency = connection.rtt;

if (latency > 500) {
  console.log('High latency connection');
}
```

### saveData

```javascript
// User has requested reduced data usage
if (connection.saveData) {
  disableAutoplay();
  loadCompressedAssets();
}
```

### type (Physical Connection)

```javascript
// Physical network type (limited support)
// Values: 'bluetooth', 'cellular', 'ethernet', 'wifi', 'wimax', 'none', 'other', 'unknown'

if (connection.type) {
  console.log('Connection type:', connection.type);
  
  if (connection.type === 'cellular') {
    warnAboutDataUsage();
  }
}
```

---

## 14.4.3 Change Events

### Monitor Connection Changes

```javascript
const connection = navigator.connection;

connection.addEventListener('change', () => {
  console.log('Connection changed');
  console.log('New type:', connection.effectiveType);
  console.log('New speed:', connection.downlink);
  
  updateContentQuality();
});
```

---

## 14.4.4 Adaptive Loading

### Image Quality

```javascript
function getImageQuality() {
  const connection = navigator.connection;
  
  if (!connection) return 'high';
  
  if (connection.saveData) return 'low';
  
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return 'medium';
    default:
      return 'high';
  }
}

function loadImage(baseSrc) {
  const quality = getImageQuality();
  const img = new Image();
  
  img.src = `${baseSrc}?quality=${quality}`;
  return img;
}
```

### Video Quality

```javascript
function getVideoSource(sources) {
  const connection = navigator.connection;
  
  if (!connection) return sources.high;
  
  if (connection.effectiveType === '4g' && connection.downlink > 5) {
    return sources.high;
  } else if (connection.effectiveType === '3g') {
    return sources.medium;
  } else {
    return sources.low;
  }
}
```

### Prefetch Strategy

```javascript
function setupPrefetch() {
  const connection = navigator.connection;
  
  if (!connection) return;
  
  // Only prefetch on fast connections
  if (connection.effectiveType === '4g' && !connection.saveData) {
    prefetchNextPage();
    preloadImages();
  }
}
```

---

## 14.4.5 Complete Example

### Adaptive Media Loader

```javascript
class AdaptiveLoader {
  constructor() {
    this.connection = navigator.connection;
    this.quality = this.determineQuality();
    
    if (this.connection) {
      this.connection.addEventListener('change', () => {
        this.quality = this.determineQuality();
        this.onQualityChange?.(this.quality);
      });
    }
  }
  
  determineQuality() {
    if (!this.connection) return 'high';
    
    const { effectiveType, saveData, downlink } = this.connection;
    
    if (saveData) return 'low';
    
    if (effectiveType === '4g' && downlink > 5) return 'high';
    if (effectiveType === '3g' || downlink > 1) return 'medium';
    return 'low';
  }
  
  getImageSrc(baseSrc) {
    const sizes = { low: 480, medium: 720, high: 1080 };
    return `${baseSrc}?w=${sizes[this.quality]}`;
  }
  
  shouldAutoplay() {
    if (!this.connection) return true;
    return this.connection.effectiveType === '4g' && 
           !this.connection.saveData;
  }
  
  shouldPreload() {
    return this.quality === 'high';
  }
}

const loader = new AdaptiveLoader();
loader.onQualityChange = (quality) => {
  console.log('Quality changed to:', quality);
};
```

---

## 14.4.6 Browser Support

### Feature Detection

```javascript
function isNetworkInfoSupported() {
  return 'connection' in navigator || 
         'mozConnection' in navigator || 
         'webkitConnection' in navigator;
}

function getConnection() {
  return navigator.connection || 
         navigator.mozConnection || 
         navigator.webkitConnection;
}
```

### Polyfill Strategy

```javascript
function getNetworkInfo() {
  const connection = getConnection();
  
  if (connection) {
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 50,
      saveData: connection.saveData || false
    };
  }
  
  // Default fallback
  return {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  };
}
```

---

## 14.4.7 Summary

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `effectiveType` | String | '2g', '3g', '4g' |
| `downlink` | Number | Speed in Mbps |
| `rtt` | Number | Latency in ms |
| `saveData` | Boolean | Data saver enabled |
| `type` | String | Physical type |

### Events

| Event | When |
|-------|------|
| `change` | Connection changes |

### Best Practices

1. **Feature detect** before using
2. **Provide fallbacks** for unsupported browsers
3. **Respect saveData** preference
4. **Adapt content** based on connection
5. **Listen for changes** to update dynamically
6. **Don't block** on slow connections

---

**End of Chapter 14.4: Network Information API**

This completes Group 14 — Connectivity APIs. Next section: **Group 15 — Security and Authentication**.
