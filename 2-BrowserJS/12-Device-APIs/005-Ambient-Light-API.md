# 12.5 Ambient Light API

The Ambient Light API provides information about the light intensity around the device. This chapter covers accessing light sensor data and practical applications.

---

## 12.5.1 Ambient Light Overview

### What Is the Ambient Light API?

```javascript
// Ambient Light API provides:
// - Current light level (lux)
// - Real-time updates
// - Useful for auto-adjusting UI

// Note: Very limited browser support
// Privacy concerns led to restrictions
```

### Check Support

```javascript
if ('AmbientLightSensor' in window) {
  console.log('Ambient Light Sensor supported');
}

// Legacy devicelight event
if ('ondevicelight' in window) {
  console.log('devicelight event supported');
}
```

---

## 12.5.2 AmbientLightSensor (Generic Sensor API)

### Basic Usage

```javascript
try {
  const sensor = new AmbientLightSensor();
  
  sensor.addEventListener('reading', () => {
    console.log('Light level:', sensor.illuminance, 'lux');
  });
  
  sensor.addEventListener('error', (event) => {
    console.error('Sensor error:', event.error.name);
  });
  
  sensor.start();
} catch (error) {
  console.error('Sensor not supported:', error);
}
```

### Request Permission

```javascript
async function requestLightSensorPermission() {
  try {
    const result = await navigator.permissions.query({
      name: 'ambient-light-sensor'
    });
    
    return result.state === 'granted';
  } catch (error) {
    console.error('Permission query failed:', error);
    return false;
  }
}
```

### Reading Values

```javascript
const sensor = new AmbientLightSensor();

sensor.addEventListener('reading', () => {
  const lux = sensor.illuminance;
  
  // Light level categories (approximate)
  if (lux < 10) {
    console.log('Dark');
  } else if (lux < 50) {
    console.log('Dim');
  } else if (lux < 1000) {
    console.log('Indoor lighting');
  } else if (lux < 10000) {
    console.log('Overcast');
  } else {
    console.log('Direct sunlight');
  }
});

sensor.start();
```

---

## 12.5.3 Legacy devicelight Event

### Usage (Deprecated)

```javascript
// Legacy API (Firefox only, now removed)
window.addEventListener('devicelight', (event) => {
  console.log('Light level:', event.value, 'lux');
});
```

---

## 12.5.4 Practical Applications

### Auto Dark Mode

```javascript
class AutoTheme {
  constructor(darkThreshold = 50, lightThreshold = 200) {
    this.darkThreshold = darkThreshold;
    this.lightThreshold = lightThreshold;
    this.currentTheme = 'auto';
    this.sensor = null;
  }
  
  async start() {
    if (!('AmbientLightSensor' in window)) {
      console.log('Ambient Light Sensor not supported');
      return;
    }
    
    try {
      this.sensor = new AmbientLightSensor();
      
      this.sensor.addEventListener('reading', () => {
        this.updateTheme(this.sensor.illuminance);
      });
      
      this.sensor.addEventListener('error', (e) => {
        console.error('Sensor error:', e.error.name);
      });
      
      this.sensor.start();
    } catch (error) {
      console.error('Failed to start sensor:', error);
    }
  }
  
  stop() {
    this.sensor?.stop();
  }
  
  updateTheme(lux) {
    let newTheme = this.currentTheme;
    
    if (lux < this.darkThreshold) {
      newTheme = 'dark';
    } else if (lux > this.lightThreshold) {
      newTheme = 'light';
    }
    
    if (newTheme !== this.currentTheme) {
      this.currentTheme = newTheme;
      this.applyTheme(newTheme);
    }
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Theme changed to:', theme);
  }
}

const autoTheme = new AutoTheme();
autoTheme.start();
```

### Brightness Adjustment

```javascript
class BrightnessController {
  constructor(minBrightness = 0.5, maxBrightness = 1.0) {
    this.min = minBrightness;
    this.max = maxBrightness;
    this.sensor = null;
  }
  
  async start() {
    if (!('AmbientLightSensor' in window)) return;
    
    this.sensor = new AmbientLightSensor();
    
    this.sensor.addEventListener('reading', () => {
      const brightness = this.calculateBrightness(this.sensor.illuminance);
      this.applyBrightness(brightness);
    });
    
    this.sensor.start();
  }
  
  calculateBrightness(lux) {
    // Map lux (0-10000) to brightness range
    const normalized = Math.min(lux / 10000, 1);
    return this.min + (this.max - this.min) * normalized;
  }
  
  applyBrightness(value) {
    // Apply via CSS filter
    document.body.style.filter = `brightness(${value})`;
    
    // Or adjust CSS variable
    document.documentElement.style.setProperty('--screen-brightness', value);
  }
  
  stop() {
    this.sensor?.stop();
    document.body.style.filter = '';
  }
}
```

---

## 12.5.5 Lux Reference Values

### Light Levels

| Environment | Lux |
|-------------|-----|
| Moonlight | 0.1 |
| Street lighting | 10-20 |
| Dark room | 10-50 |
| Home lighting | 150-300 |
| Office | 300-500 |
| Overcast day | 1,000 |
| Full daylight | 10,000-25,000 |
| Direct sunlight | 100,000+ |

---

## 12.5.6 Summary

### AmbientLightSensor Properties

| Property | Description |
|----------|-------------|
| `illuminance` | Light level in lux |

### Sensor Methods

| Method | Description |
|--------|-------------|
| `start()` | Begin readings |
| `stop()` | Stop readings |

### Events

| Event | When |
|-------|------|
| `reading` | New reading available |
| `error` | Error occurred |
| `activate` | Sensor activated |

### Browser Support

- Very limited support
- Requires HTTPS
- May need permissions
- Privacy restrictions apply

### Best Practices

1. **Feature detect** before using
2. **Provide fallbacks** (prefers-color-scheme)
3. **Use thresholds** to prevent flickering
4. **Respect privacy** concerns
5. **Combine with** user preference

---

**End of Chapter 12.5: Ambient Light API**

Next chapter: **12.6 Proximity API** — covers proximity sensor.
