# 13.1 Generic Sensor API

The Generic Sensor API provides a consistent framework for accessing device sensors. This chapter covers the base Sensor interface, sensor lifecycle, and common patterns.

---

## 13.1.1 Overview

### What Is the Generic Sensor API?

```javascript
// Generic Sensor API provides:
// - Unified interface for all sensors
// - Consistent lifecycle management
// - Permission handling
// - Base class for specific sensors

// Available sensors:
// - Accelerometer
// - Gyroscope
// - Magnetometer
// - AbsoluteOrientationSensor
// - RelativeOrientationSensor
// - LinearAccelerationSensor
// - GravitySensor
// - AmbientLightSensor (limited support)
```

### Check Support

```javascript
// Check for specific sensor
if ('Accelerometer' in window) {
  console.log('Accelerometer supported');
}

if ('Gyroscope' in window) {
  console.log('Gyroscope supported');
}
```

---

## 13.1.2 Base Sensor Interface

### Common Properties

```javascript
const sensor = new Accelerometer();

// State
sensor.activated;     // boolean - is sensor active
sensor.hasReading;    // boolean - has reading available
sensor.timestamp;     // DOMHighResTimeStamp - time of reading
```

### Common Methods

```javascript
// Start sensor
sensor.start();

// Stop sensor
sensor.stop();
```

### Common Events

```javascript
// Reading available
sensor.addEventListener('reading', () => {
  console.log('New reading at:', sensor.timestamp);
});

// Sensor activated
sensor.addEventListener('activate', () => {
  console.log('Sensor activated');
});

// Error occurred
sensor.addEventListener('error', (event) => {
  console.error('Sensor error:', event.error.name);
});
```

---

## 13.1.3 Sensor Options

### Frequency

```javascript
// Set reading frequency (Hz)
const sensor = new Accelerometer({ frequency: 60 });

// Default is usually 60Hz, max depends on sensor
```

### Reference Frame

```javascript
// For orientation sensors
const sensor = new AbsoluteOrientationSensor({
  referenceFrame: 'device'  // 'device' or 'screen'
});
```

---

## 13.1.4 Permission Handling

### Check Permission

```javascript
async function checkSensorPermission(name) {
  try {
    const result = await navigator.permissions.query({ name });
    return result.state;  // 'granted', 'denied', 'prompt'
  } catch (error) {
    console.error('Permission check failed:', error);
    return 'unknown';
  }
}

// Check accelerometer
const state = await checkSensorPermission('accelerometer');
```

### Handle Permission Denied

```javascript
const sensor = new Accelerometer();

sensor.addEventListener('error', (event) => {
  if (event.error.name === 'NotAllowedError') {
    console.log('Permission to access sensor denied');
    showPermissionPrompt();
  } else if (event.error.name === 'NotReadableError') {
    console.log('Cannot read sensor data');
  }
});

sensor.start();
```

---

## 13.1.5 Sensor Lifecycle

### Start and Stop

```javascript
const sensor = new Accelerometer({ frequency: 30 });

function startTracking() {
  sensor.start();
}

function stopTracking() {
  sensor.stop();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  sensor.stop();
});
```

### Check State

```javascript
sensor.addEventListener('activate', () => {
  console.log('Sensor is now active');
  console.log('Activated:', sensor.activated);
});

sensor.addEventListener('reading', () => {
  console.log('Has reading:', sensor.hasReading);
});
```

---

## 13.1.6 Error Handling

### Error Types

```javascript
sensor.addEventListener('error', (event) => {
  const error = event.error;
  
  switch (error.name) {
    case 'NotAllowedError':
      console.error('Permission denied');
      break;
      
    case 'NotReadableError':
      console.error('Sensor not available');
      break;
      
    case 'NotSupportedError':
      console.error('Sensor not supported');
      break;
      
    case 'SecurityError':
      console.error('Secure context required');
      break;
      
    default:
      console.error('Unknown error:', error);
  }
});
```

### Safe Sensor Creation

```javascript
function createSensor(SensorClass, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const sensor = new SensorClass(options);
      
      sensor.addEventListener('error', (event) => {
        reject(event.error);
      }, { once: true });
      
      sensor.addEventListener('reading', () => {
        resolve(sensor);
      }, { once: true });
      
      sensor.start();
    } catch (error) {
      reject(error);
    }
  });
}

// Usage
try {
  const accelerometer = await createSensor(Accelerometer, { frequency: 60 });
  console.log('Sensor ready:', accelerometer.x, accelerometer.y, accelerometer.z);
} catch (error) {
  console.error('Failed to create sensor:', error);
}
```

---

## 13.1.7 Sensor Manager Pattern

### Reusable Sensor Manager

```javascript
class SensorManager {
  constructor() {
    this.sensors = new Map();
  }
  
  async add(name, SensorClass, options = {}) {
    if (!SensorClass in window) {
      throw new Error(`${name} not supported`);
    }
    
    const sensor = new SensorClass(options);
    
    return new Promise((resolve, reject) => {
      const onError = (event) => {
        sensor.removeEventListener('reading', onReading);
        reject(event.error);
      };
      
      const onReading = () => {
        sensor.removeEventListener('error', onError);
        this.sensors.set(name, sensor);
        resolve(sensor);
      };
      
      sensor.addEventListener('error', onError, { once: true });
      sensor.addEventListener('reading', onReading, { once: true });
      
      sensor.start();
    });
  }
  
  get(name) {
    return this.sensors.get(name);
  }
  
  stop(name) {
    const sensor = this.sensors.get(name);
    if (sensor) {
      sensor.stop();
      this.sensors.delete(name);
    }
  }
  
  stopAll() {
    this.sensors.forEach(sensor => sensor.stop());
    this.sensors.clear();
  }
}

// Usage
const manager = new SensorManager();
await manager.add('accel', Accelerometer, { frequency: 30 });
await manager.add('gyro', Gyroscope, { frequency: 30 });

console.log(manager.get('accel').x);
manager.stopAll();
```

---

## 13.1.8 Summary

### Base Sensor Properties

| Property | Type | Description |
|----------|------|-------------|
| `activated` | Boolean | Sensor is active |
| `hasReading` | Boolean | Has valid reading |
| `timestamp` | Number | Time of reading |

### Base Sensor Methods

| Method | Description |
|--------|-------------|
| `start()` | Start sensor |
| `stop()` | Stop sensor |

### Events

| Event | When |
|-------|------|
| `reading` | New data available |
| `activate` | Sensor started |
| `error` | Error occurred |

### Error Types

| Error | Meaning |
|-------|---------|
| `NotAllowedError` | Permission denied |
| `NotReadableError` | Cannot read sensor |
| `NotSupportedError` | Not supported |
| `SecurityError` | Requires HTTPS |

### Best Practices

1. **Check support** before creating sensors
2. **Handle permissions** gracefully
3. **Stop sensors** when not needed
4. **Set appropriate frequency** for use case
5. **Use HTTPS** — required for sensors
6. **Clean up** on page unload

---

**End of Chapter 13.1: Generic Sensor API**

Next chapter: **13.2 Specific Sensors** — covers Accelerometer, Gyroscope, and more.
