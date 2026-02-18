# 12.6 Proximity API

The Proximity API provides information about the distance between the device and nearby objects. This chapter covers the proximity sensor events and their applications.

---

## 12.6.1 Proximity Overview

### What Is the Proximity API?

```javascript
// Proximity API provides:
// - Detection of nearby objects
// - Used primarily for phone calls
// - Triggers screen dimming during calls

// Note: Extremely limited support
// Deprecated in most browsers
// Security/privacy concerns
```

### Check Support

```javascript
// Legacy event
if ('ondeviceproximity' in window) {
  console.log('deviceproximity supported');
}

if ('onuserproximity' in window) {
  console.log('userproximity supported');
}

// Generic Sensor API
if ('ProximitySensor' in window) {
  console.log('ProximitySensor supported');
}
```

---

## 12.6.2 ProximitySensor (Generic Sensor API)

### Basic Usage

```javascript
try {
  const sensor = new ProximitySensor();
  
  sensor.addEventListener('reading', () => {
    console.log('Distance:', sensor.distance);  // cm or null
    console.log('Near:', sensor.near);          // boolean
    console.log('Max:', sensor.max);            // maximum range
  });
  
  sensor.addEventListener('error', (event) => {
    console.error('Sensor error:', event.error.name);
  });
  
  sensor.start();
} catch (error) {
  console.error('Sensor not supported:', error);
}
```

### Sensor Properties

```javascript
const sensor = new ProximitySensor();

sensor.addEventListener('reading', () => {
  // Distance in centimeters (may be null)
  console.log('Distance:', sensor.distance);
  
  // Boolean - is object near?
  console.log('Near:', sensor.near);
  
  // Maximum detection distance
  console.log('Max range:', sensor.max);
});
```

---

## 12.6.3 Legacy Events (Deprecated)

### deviceproximity Event

```javascript
// Detailed proximity data (Firefox only, removed)
window.addEventListener('deviceproximity', (event) => {
  console.log('Value:', event.value);  // Distance in cm
  console.log('Min:', event.min);      // Minimum range
  console.log('Max:', event.max);      // Maximum range
});
```

### userproximity Event

```javascript
// Simple near/far boolean (Firefox only, removed)
window.addEventListener('userproximity', (event) => {
  if (event.near) {
    console.log('Object is near');
  } else {
    console.log('Object is far');
  }
});
```

---

## 12.6.4 Practical Applications

### Auto-Pause Video

```javascript
class ProximityPause {
  constructor(video) {
    this.video = video;
    this.wasPlaying = false;
    this.sensor = null;
  }
  
  async start() {
    if (!('ProximitySensor' in window)) {
      console.log('Proximity not supported');
      return;
    }
    
    try {
      this.sensor = new ProximitySensor();
      
      this.sensor.addEventListener('reading', () => {
        if (this.sensor.near) {
          // Object near - pause video
          if (!this.video.paused) {
            this.wasPlaying = true;
            this.video.pause();
          }
        } else {
          // Object far - resume if was playing
          if (this.wasPlaying) {
            this.wasPlaying = false;
            this.video.play();
          }
        }
      });
      
      this.sensor.start();
    } catch (error) {
      console.error('Failed to start sensor:', error);
    }
  }
  
  stop() {
    this.sensor?.stop();
  }
}
```

### Screen Dimming

```javascript
class ProximityDimmer {
  constructor() {
    this.sensor = null;
    this.originalOpacity = 1;
  }
  
  async start() {
    if (!('ProximitySensor' in window)) return;
    
    try {
      this.sensor = new ProximitySensor();
      
      this.sensor.addEventListener('reading', () => {
        if (this.sensor.near) {
          this.dimScreen();
        } else {
          this.restoreScreen();
        }
      });
      
      this.sensor.start();
    } catch (error) {
      console.error('Proximity sensor error:', error);
    }
  }
  
  dimScreen() {
    document.body.style.opacity = '0.3';
    document.body.style.pointerEvents = 'none';
  }
  
  restoreScreen() {
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
  }
  
  stop() {
    this.sensor?.stop();
    this.restoreScreen();
  }
}
```

---

## 12.6.5 Summary

### ProximitySensor Properties

| Property | Type | Description |
|----------|------|-------------|
| `distance` | Number/null | Distance in cm |
| `near` | Boolean | Object is near |
| `max` | Number | Maximum range |

### Events

| Event | Description |
|-------|-------------|
| `reading` | New reading available |
| `error` | Sensor error |
| `activate` | Sensor started |

### Browser Support

| API | Support |
|-----|---------|
| ProximitySensor | Very limited |
| deviceproximity | Deprecated/Removed |
| userproximity | Deprecated/Removed |

### Use Cases

- Phone call screen dimming
- Auto-pause media
- Gesture detection (limited)
- Accessibility features

### Best Practices

1. **Always feature detect**
2. **Provide graceful fallback**
3. **Don't rely on proximity** for core features
4. **Consider privacy** implications
5. **Test on real devices**

---

**End of Chapter 12.6: Proximity API**

This completes the Device APIs group. Next section: **Group 13 — Sensor APIs** — covers the Generic Sensor API framework.
