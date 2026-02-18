# 12.1 Geolocation API

The Geolocation API provides access to the user's geographical location. This chapter covers getting position, watching location, handling errors, and privacy considerations.

---

## 12.1.1 Geolocation Overview

### What Is the Geolocation API?

```javascript
// Geolocation API provides:
// - User's current position
// - Continuous position tracking
// - Works on mobile and desktop
// - Requires user permission
// - Can use GPS, WiFi, IP address
```

### Check Support

```javascript
if ('geolocation' in navigator) {
  console.log('Geolocation supported');
}
```

---

## 12.1.2 Getting Current Position

### Basic Usage

```javascript
navigator.geolocation.getCurrentPosition(
  // Success callback
  (position) => {
    console.log('Latitude:', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
  },
  // Error callback
  (error) => {
    console.error('Error:', error.message);
  }
);
```

### With Options

```javascript
const options = {
  enableHighAccuracy: true,  // Use GPS if available
  timeout: 10000,            // Timeout in milliseconds
  maximumAge: 0              // Don't use cached position
};

navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  options
);
```

### Promise Wrapper

```javascript
function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Usage
async function getLocation() {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000
    });
    
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error) {
    throw new Error(`Geolocation failed: ${error.message}`);
  }
}
```

---

## 12.1.3 Position Object

### Coordinates

```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const coords = position.coords;
  
  // Always available
  console.log('Latitude:', coords.latitude);      // degrees
  console.log('Longitude:', coords.longitude);    // degrees
  console.log('Accuracy:', coords.accuracy);      // meters
  
  // May be null
  console.log('Altitude:', coords.altitude);              // meters
  console.log('Altitude Accuracy:', coords.altitudeAccuracy);  // meters
  console.log('Heading:', coords.heading);                // degrees (0-360)
  console.log('Speed:', coords.speed);                    // meters/second
  
  // Timestamp
  console.log('Timestamp:', position.timestamp);
});
```

### Using Position Data

```javascript
async function displayLocation() {
  const position = await getCurrentPosition();
  const { latitude, longitude, accuracy } = position.coords;
  
  // Display on map
  map.setCenter({ lat: latitude, lng: longitude });
  
  // Show accuracy circle
  const accuracyCircle = new google.maps.Circle({
    center: { lat: latitude, lng: longitude },
    radius: accuracy,
    map: map
  });
}
```

---

## 12.1.4 Watching Position

### watchPosition

```javascript
// Start watching
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log('Position updated:', position.coords);
    updateLocationOnMap(position);
  },
  (error) => {
    console.error('Watch error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);

// Stop watching
function stopWatching() {
  navigator.geolocation.clearWatch(watchId);
}
```

### Location Tracker

```javascript
class LocationTracker {
  constructor(onUpdate, onError) {
    this.onUpdate = onUpdate;
    this.onError = onError;
    this.watchId = null;
    this.history = [];
  }
  
  start(options = {}) {
    if (this.watchId !== null) return;
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.history.push({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        
        this.onUpdate(position);
      },
      this.onError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );
  }
  
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  getDistance() {
    if (this.history.length < 2) return 0;
    
    let total = 0;
    for (let i = 1; i < this.history.length; i++) {
      total += this.calculateDistance(
        this.history[i - 1],
        this.history[i]
      );
    }
    return total;
  }
  
  calculateDistance(point1, point2) {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
}
```

---

## 12.1.5 Error Handling

### Error Codes

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => { /* success */ },
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied geolocation permission');
        showPermissionInstructions();
        break;
        
      case error.POSITION_UNAVAILABLE:
        console.error('Position unavailable');
        showOfflineMessage();
        break;
        
      case error.TIMEOUT:
        console.error('Request timed out');
        retryWithLowerAccuracy();
        break;
        
      default:
        console.error('Unknown error:', error.message);
    }
  }
);
```

### Retry Logic

```javascript
async function getLocationWithRetry(maxRetries = 3) {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await getCurrentPosition(options);
    } catch (error) {
      if (error.code === error.TIMEOUT && i < maxRetries - 1) {
        // Increase timeout and try again
        options.timeout *= 2;
        console.log(`Retrying with timeout: ${options.timeout}ms`);
        continue;
      }
      throw error;
    }
  }
}
```

---

## 12.1.6 Options

### enableHighAccuracy

```javascript
// High accuracy (GPS, slower, more battery)
{
  enableHighAccuracy: true
}

// Low accuracy (WiFi/Cell, faster, less battery)
{
  enableHighAccuracy: false
}
```

### timeout

```javascript
// Maximum time to wait for position
{
  timeout: 5000  // 5 seconds
}

// No timeout (wait indefinitely)
{
  timeout: Infinity
}
```

### maximumAge

```javascript
// Don't use cached position
{
  maximumAge: 0
}

// Accept position cached up to 5 minutes ago
{
  maximumAge: 300000
}

// Accept any cached position
{
  maximumAge: Infinity
}
```

---

## 12.1.7 Common Patterns

### Geofencing

```javascript
class Geofence {
  constructor(center, radius, onEnter, onExit) {
    this.center = center;
    this.radius = radius;
    this.onEnter = onEnter;
    this.onExit = onExit;
    this.isInside = false;
    this.watchId = null;
  }
  
  start() {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.checkPosition(position),
      (error) => console.error('Geofence error:', error),
      { enableHighAccuracy: true }
    );
  }
  
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  checkPosition(position) {
    const distance = this.calculateDistance(
      { lat: position.coords.latitude, lng: position.coords.longitude },
      this.center
    );
    
    const nowInside = distance <= this.radius;
    
    if (nowInside && !this.isInside) {
      this.isInside = true;
      this.onEnter();
    } else if (!nowInside && this.isInside) {
      this.isInside = false;
      this.onExit();
    }
  }
  
  calculateDistance(point1, point2) {
    // Haversine formula (see above)
  }
}

// Usage
const fence = new Geofence(
  { lat: 37.7749, lng: -122.4194 },
  100, // 100 meters
  () => console.log('Entered geofence'),
  () => console.log('Exited geofence')
);

fence.start();
```

---

## 12.1.8 Summary

### Methods

| Method | Description |
|--------|-------------|
| `getCurrentPosition()` | Get current location once |
| `watchPosition()` | Track location changes |
| `clearWatch()` | Stop watching |

### Position Coordinates

| Property | Description | Always Available |
|----------|-------------|------------------|
| `latitude` | Degrees | ✅ |
| `longitude` | Degrees | ✅ |
| `accuracy` | Meters | ✅ |
| `altitude` | Meters | ❌ |
| `altitudeAccuracy` | Meters | ❌ |
| `heading` | Degrees | ❌ |
| `speed` | m/s | ❌ |

### Error Codes

| Code | Constant | Meaning |
|------|----------|---------|
| 1 | `PERMISSION_DENIED` | User denied |
| 2 | `POSITION_UNAVAILABLE` | No position |
| 3 | `TIMEOUT` | Timed out |

### Best Practices

1. **Handle permission denial** gracefully
2. **Use appropriate accuracy** for battery life
3. **Set reasonable timeouts**
4. **Clear watch** when not needed
5. **Provide fallbacks** when unavailable
6. **Respect user privacy**

---

**End of Chapter 12.1: Geolocation API**

Next chapter: **12.2 Device Orientation and Motion** — covers accelerometer and gyroscope.
# 12.2 Device Orientation and Motion

The Device Orientation and Motion events provide access to device sensors like accelerometers and gyroscopes. This chapter covers orientation events, motion events, and practical applications.

---

## 12.2.1 Overview

### What Are Device Orientation Events?

```javascript
// Device events provide:
// - Device orientation (alpha, beta, gamma)
// - Device motion (acceleration, rotation rate)
// - Works on mobile devices and laptops with sensors
// - May require permission on iOS 13+
```

### Check Support

```javascript
if ('DeviceOrientationEvent' in window) {
  console.log('Device orientation supported');
}

if ('DeviceMotionEvent' in window) {
  console.log('Device motion supported');
}
```

---

## 12.2.2 Permission (iOS 13+)

### Request Permission

```javascript
// iOS 13+ requires permission
async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }
  // Permission not required on this device
  return true;
}

// Must be triggered by user gesture
button.addEventListener('click', async () => {
  const granted = await requestOrientationPermission();
  if (granted) {
    startOrientationTracking();
  }
});
```

---

## 12.2.3 Device Orientation Event

### Basic Usage

```javascript
window.addEventListener('deviceorientation', (event) => {
  // Alpha: rotation around z-axis (0-360)
  // Compass direction when device is flat
  console.log('Alpha (compass):', event.alpha);
  
  // Beta: rotation around x-axis (-180 to 180)
  // Front-to-back tilt
  console.log('Beta (front/back):', event.beta);
  
  // Gamma: rotation around y-axis (-90 to 90)
  // Left-to-right tilt
  console.log('Gamma (left/right):', event.gamma);
  
  // Is calibrated compass?
  console.log('Absolute:', event.absolute);
});
```

### Understanding Axes

```javascript
// Device orientation axes:
//
//        ^ beta (x)
//        |
//        |
//    γ <---- α (z pointing up)
//   gamma
//
// alpha: Compass direction (0=North, 90=East, 180=South, 270=West)
// beta:  Front-to-back tilt (-180=face down, 0=vertical, 180=face up)
// gamma: Left-to-right tilt (-90=left, 0=flat, 90=right)
```

### Compass Example

```javascript
const compass = document.getElementById('compass');

window.addEventListener('deviceorientation', (event) => {
  if (event.alpha !== null) {
    // Rotate compass needle
    compass.style.transform = `rotate(${-event.alpha}deg)`;
  }
});
```

### Level/Bubble Example

```javascript
const bubble = document.getElementById('bubble');

window.addEventListener('deviceorientation', (event) => {
  const beta = event.beta || 0;
  const gamma = event.gamma || 0;
  
  // Map tilt to bubble position (-90 to 90 degrees to pixels)
  const x = gamma * 2;  // Adjust multiplier as needed
  const y = beta * 2;
  
  bubble.style.transform = `translate(${x}px, ${y}px)`;
});
```

---

## 12.2.4 Device Motion Event

### Basic Usage

```javascript
window.addEventListener('devicemotion', (event) => {
  // Acceleration including gravity
  const accWithGravity = event.accelerationIncludingGravity;
  console.log('Acc+G:', accWithGravity.x, accWithGravity.y, accWithGravity.z);
  
  // Acceleration without gravity (linear acceleration)
  const acc = event.acceleration;
  if (acc) {
    console.log('Linear:', acc.x, acc.y, acc.z);
  }
  
  // Rotation rate (degrees per second)
  const rotation = event.rotationRate;
  if (rotation) {
    console.log('Rotation:', rotation.alpha, rotation.beta, rotation.gamma);
  }
  
  // Interval between data collection (milliseconds)
  console.log('Interval:', event.interval);
});
```

### Understanding Acceleration

```javascript
// Acceleration axes (same as orientation):
// x: Left/right
// y: Forward/backward
// z: Up/down

// accelerationIncludingGravity:
// - Includes gravity (~9.8 m/s²)
// - When flat: x≈0, y≈0, z≈9.8

// acceleration (linear):
// - Gravity removed
// - When stationary: x≈0, y≈0, z≈0
```

---

## 12.2.5 Practical Examples

### Shake Detection

```javascript
class ShakeDetector {
  constructor(threshold = 15, callback) {
    this.threshold = threshold;
    this.callback = callback;
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
    this.lastTime = Date.now();
  }
  
  start() {
    window.addEventListener('devicemotion', this.handleMotion);
  }
  
  stop() {
    window.removeEventListener('devicemotion', this.handleMotion);
  }
  
  handleMotion = (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;
    
    const now = Date.now();
    const timeDiff = now - this.lastTime;
    
    if (timeDiff > 100) {
      const deltaX = Math.abs(acc.x - (this.lastX || 0));
      const deltaY = Math.abs(acc.y - (this.lastY || 0));
      const deltaZ = Math.abs(acc.z - (this.lastZ || 0));
      
      const speed = (deltaX + deltaY + deltaZ) / timeDiff * 10000;
      
      if (speed > this.threshold) {
        this.callback();
      }
      
      this.lastX = acc.x;
      this.lastY = acc.y;
      this.lastZ = acc.z;
      this.lastTime = now;
    }
  };
}

// Usage
const detector = new ShakeDetector(15, () => {
  console.log('Shake detected!');
});
detector.start();
```

### Tilt Controls (Game)

```javascript
class TiltController {
  constructor(element, options = {}) {
    this.element = element;
    this.sensitivity = options.sensitivity || 3;
    this.maxTilt = options.maxTilt || 30;
  }
  
  start() {
    window.addEventListener('deviceorientation', this.handleOrientation);
  }
  
  stop() {
    window.removeEventListener('deviceorientation', this.handleOrientation);
  }
  
  handleOrientation = (event) => {
    let gamma = event.gamma || 0;  // Left/right
    let beta = event.beta || 0;    // Forward/back
    
    // Clamp values
    gamma = Math.max(-this.maxTilt, Math.min(this.maxTilt, gamma));
    beta = Math.max(-this.maxTilt, Math.min(this.maxTilt, beta));
    
    // Calculate position
    const x = gamma * this.sensitivity;
    const y = (beta - 45) * this.sensitivity;  // Offset for comfortable hold
    
    // Move element
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  };
}
```

### Step Counter (Pedometer)

```javascript
class StepCounter {
  constructor(onStep) {
    this.onStep = onStep;
    this.steps = 0;
    this.threshold = 1.2;
    this.lastPeak = 0;
    this.lastValue = 0;
    this.rising = false;
  }
  
  start() {
    window.addEventListener('devicemotion', this.handleMotion);
  }
  
  stop() {
    window.removeEventListener('devicemotion', this.handleMotion);
  }
  
  handleMotion = (event) => {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc) return;
    
    // Calculate magnitude
    const magnitude = Math.sqrt(
      acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
    );
    
    // Peak detection
    const now = Date.now();
    
    if (magnitude > this.lastValue && !this.rising) {
      this.rising = true;
    } else if (magnitude < this.lastValue && this.rising) {
      this.rising = false;
      
      // Check if peak is significant and not too close to last
      if (magnitude > this.threshold && now - this.lastPeak > 300) {
        this.steps++;
        this.lastPeak = now;
        this.onStep(this.steps);
      }
    }
    
    this.lastValue = magnitude;
  };
  
  reset() {
    this.steps = 0;
  }
}
```

---

## 12.2.6 Absolute Orientation

### deviceorientationabsolute Event

```javascript
// More reliable compass heading
window.addEventListener('deviceorientationabsolute', (event) => {
  // Always relative to Earth's coordinate frame
  console.log('Absolute alpha:', event.alpha);
  console.log('Absolute beta:', event.beta);
  console.log('Absolute gamma:', event.gamma);
  console.log('Is absolute:', event.absolute);  // Always true
});
```

---

## 12.2.7 Summary

### Device Orientation Properties

| Property | Range | Description |
|----------|-------|-------------|
| `alpha` | 0-360 | Compass direction (z-axis rotation) |
| `beta` | -180 to 180 | Front-back tilt (x-axis rotation) |
| `gamma` | -90 to 90 | Left-right tilt (y-axis rotation) |

### Device Motion Properties

| Property | Description |
|----------|-------------|
| `acceleration` | Linear acceleration (gravity removed) |
| `accelerationIncludingGravity` | Total acceleration |
| `rotationRate` | Angular velocity (α, β, γ) |
| `interval` | Time between samples |

### Best Practices

1. **Request permission on iOS** via user gesture
2. **Check for null values** — not all properties available
3. **Debounce/throttle** high-frequency events
4. **Use low-pass filter** for smooth readings
5. **Test on real devices** — simulators differ
6. **Provide fallbacks** for unsupported devices

---

**End of Chapter 12.2: Device Orientation and Motion**

Next chapter: **12.3 Battery Status API** — covers battery level and charging state.
# 12.3 Battery Status API

The Battery Status API provides information about the system's battery level and charging status. This chapter covers accessing battery information and responding to battery changes.

---

## 12.3.1 Battery API Overview

### What Is the Battery API?

```javascript
// Battery Status API provides:
// - Current battery level
// - Charging status
// - Time until charged/discharged
// - Events for battery changes

// Note: Limited browser support
// Chrome removed in 2016 for privacy
// Available in some contexts (Firefox, etc.)
```

### Check Support

```javascript
if ('getBattery' in navigator) {
  console.log('Battery API supported');
}
```

---

## 12.3.2 Getting Battery Status

### Basic Usage

```javascript
async function getBatteryStatus() {
  try {
    const battery = await navigator.getBattery();
    
    console.log('Level:', battery.level * 100 + '%');
    console.log('Charging:', battery.charging);
    console.log('Charging time:', battery.chargingTime);
    console.log('Discharging time:', battery.dischargingTime);
    
    return battery;
  } catch (error) {
    console.error('Battery API not available:', error);
    return null;
  }
}

getBatteryStatus();
```

### BatteryManager Properties

```javascript
const battery = await navigator.getBattery();

// Level (0.0 to 1.0)
const percentage = battery.level * 100;  // e.g., 75%

// Charging state
const isCharging = battery.charging;  // true or false

// Time until fully charged (seconds)
// Infinity if not charging or unknown
const chargingTime = battery.chargingTime;

// Time until empty (seconds)
// Infinity if charging or unknown
const dischargingTime = battery.dischargingTime;
```

---

## 12.3.3 Battery Events

### Event Listeners

```javascript
const battery = await navigator.getBattery();

// Charging state changed
battery.addEventListener('chargingchange', () => {
  console.log('Charging:', battery.charging);
});

// Battery level changed
battery.addEventListener('levelchange', () => {
  console.log('Level:', battery.level * 100 + '%');
});

// Charging time updated
battery.addEventListener('chargingtimechange', () => {
  console.log('Charging time:', battery.chargingTime);
});

// Discharging time updated
battery.addEventListener('dischargingtimechange', () => {
  console.log('Discharging time:', battery.dischargingTime);
});
```

### Using Event Properties

```javascript
battery.onchargingchange = function() {
  if (this.charging) {
    console.log('Device is now charging');
  } else {
    console.log('Device unplugged');
  }
};

battery.onlevelchange = function() {
  if (this.level < 0.2) {
    console.warn('Low battery: ' + (this.level * 100) + '%');
  }
};
```

---

## 12.3.4 Practical Examples

### Battery Monitor

```javascript
class BatteryMonitor {
  constructor() {
    this.battery = null;
    this.listeners = new Set();
  }
  
  async init() {
    if (!('getBattery' in navigator)) {
      throw new Error('Battery API not supported');
    }
    
    this.battery = await navigator.getBattery();
    this.setupListeners();
    
    return this.getStatus();
  }
  
  setupListeners() {
    this.battery.addEventListener('chargingchange', () => this.notify());
    this.battery.addEventListener('levelchange', () => this.notify());
  }
  
  getStatus() {
    return {
      level: Math.round(this.battery.level * 100),
      charging: this.battery.charging,
      chargingTime: this.formatTime(this.battery.chargingTime),
      dischargingTime: this.formatTime(this.battery.dischargingTime)
    };
  }
  
  formatTime(seconds) {
    if (seconds === Infinity) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notify() {
    const status = this.getStatus();
    this.listeners.forEach(cb => cb(status));
  }
}

// Usage
const monitor = new BatteryMonitor();
monitor.init().then(status => {
  console.log('Initial status:', status);
  
  monitor.subscribe(status => {
    console.log('Battery changed:', status);
  });
});
```

### Power-Saving Mode

```javascript
async function enablePowerSaving() {
  const battery = await navigator.getBattery();
  
  function checkBattery() {
    if (!battery.charging && battery.level < 0.2) {
      activatePowerSaveMode();
    } else {
      deactivatePowerSaveMode();
    }
  }
  
  battery.addEventListener('levelchange', checkBattery);
  battery.addEventListener('chargingchange', checkBattery);
  
  checkBattery();
}

function activatePowerSaveMode() {
  // Reduce animations
  document.documentElement.classList.add('reduce-motion');
  
  // Reduce polling frequency
  pollingInterval = 60000;  // 1 minute instead of 10 seconds
  
  // Disable background sync
  pauseBackgroundSync();
  
  console.log('Power save mode activated');
}

function deactivatePowerSaveMode() {
  document.documentElement.classList.remove('reduce-motion');
  pollingInterval = 10000;
  resumeBackgroundSync();
  
  console.log('Power save mode deactivated');
}
```

### Battery-Aware Features

```javascript
async function configureFeaturesBasedOnBattery() {
  const battery = await navigator.getBattery();
  
  const config = {
    autoplay: true,
    highQuality: true,
    animations: true,
    backgroundSync: true
  };
  
  if (!battery.charging && battery.level < 0.5) {
    // Medium battery - reduce some features
    config.highQuality = false;
  }
  
  if (!battery.charging && battery.level < 0.2) {
    // Low battery - minimal features
    config.autoplay = false;
    config.highQuality = false;
    config.animations = false;
    config.backgroundSync = false;
  }
  
  return config;
}
```

---

## 12.3.5 Summary

### BatteryManager Properties

| Property | Type | Description |
|----------|------|-------------|
| `level` | Number | 0.0 to 1.0 |
| `charging` | Boolean | Is charging |
| `chargingTime` | Number | Seconds until full |
| `dischargingTime` | Number | Seconds until empty |

### BatteryManager Events

| Event | When |
|-------|------|
| `chargingchange` | Plugged/unplugged |
| `levelchange` | Level changes |
| `chargingtimechange` | Charging time updates |
| `dischargingtimechange` | Discharging time updates |

### Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Removed (privacy) |
| Firefox | Available |
| Safari | Not supported |
| Edge | Removed |

### Best Practices

1. **Check support** before using
2. **Provide fallbacks** for unsupported browsers
3. **Use for enhancement** not core functionality
4. **Respect privacy** — don't fingerprint
5. **Implement power-saving** features thoughtfully

---

**End of Chapter 12.3: Battery Status API**

Next chapter: **12.4 Vibration API** — covers haptic feedback.
# 12.4 Vibration API

The Vibration API provides access to the device's vibration hardware. This chapter covers triggering vibrations and creating vibration patterns.

---

## 12.4.1 Vibration Overview

### What Is the Vibration API?

```javascript
// Vibration API provides:
// - Simple vibration feedback
// - Pattern-based vibrations
// - Works on mobile devices
// - Simple, single method API
```

### Check Support

```javascript
if ('vibrate' in navigator) {
  console.log('Vibration supported');
}
```

---

## 12.4.2 Basic Vibration

### Single Vibration

```javascript
// Vibrate for 200 milliseconds
navigator.vibrate(200);

// Vibrate for 1 second
navigator.vibrate(1000);
```

### Stop Vibration

```javascript
// Stop any ongoing vibration
navigator.vibrate(0);

// Or pass empty array
navigator.vibrate([]);
```

---

## 12.4.3 Vibration Patterns

### Pattern Array

```javascript
// Pattern: [vibrate, pause, vibrate, pause, ...]
// Vibrate 100ms, pause 50ms, vibrate 100ms
navigator.vibrate([100, 50, 100]);

// Longer pattern
navigator.vibrate([
  100,  // vibrate
  50,   // pause
  100,  // vibrate
  50,   // pause
  200   // vibrate
]);
```

### Common Patterns

```javascript
// Notification
navigator.vibrate([100, 50, 100]);

// Alert
navigator.vibrate([200, 100, 200, 100, 200]);

// Success
navigator.vibrate([50, 50, 100]);

// Error
navigator.vibrate([300, 100, 300, 100, 300]);

// Heartbeat
navigator.vibrate([100, 50, 100, 200, 100, 50, 100, 500]);
```

---

## 12.4.4 Pattern Library

### Reusable Patterns

```javascript
const VibrationPatterns = {
  // Feedback
  tap: [50],
  doubleTap: [50, 50, 50],
  
  // Notifications
  notification: [100, 50, 100],
  alert: [200, 100, 200, 100, 200],
  reminder: [300, 200, 300],
  
  // Results
  success: [50, 50, 100],
  warning: [200, 100, 200],
  error: [300, 100, 300, 100, 300],
  
  // Fun
  heartbeat: [100, 50, 100, 200, 100, 50, 100, 500],
  sos: [100, 30, 100, 30, 100, 200, 300, 30, 300, 30, 300, 200, 100, 30, 100, 30, 100],
  
  // Games
  explosion: [50, 25, 100, 25, 150, 25, 200],
  powerUp: [50, 50, 75, 50, 100, 50, 150]
};

function vibrate(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(VibrationPatterns[pattern] || pattern);
  }
}

// Usage
vibrate('success');
vibrate('error');
vibrate([100, 50, 100]);  // Custom
```

---

## 12.4.5 Practical Examples

### Form Validation

```javascript
function validateForm(form) {
  const errors = [];
  
  // Validate fields...
  if (!form.email.value) {
    errors.push('Email required');
  }
  
  if (errors.length > 0) {
    // Vibrate on error
    navigator.vibrate([100, 50, 100, 50, 100]);
    showErrors(errors);
    return false;
  }
  
  // Success vibration
  navigator.vibrate(50);
  return true;
}
```

### Button Feedback

```javascript
// Add haptic feedback to buttons
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    navigator.vibrate(50);
  });
});

// More sophisticated feedback
document.querySelectorAll('[data-haptic]').forEach(element => {
  element.addEventListener('click', (e) => {
    const pattern = e.target.dataset.haptic;
    
    switch (pattern) {
      case 'light':
        navigator.vibrate(30);
        break;
      case 'medium':
        navigator.vibrate(50);
        break;
      case 'heavy':
        navigator.vibrate(100);
        break;
      default:
        navigator.vibrate(50);
    }
  });
});
```

### Game Feedback

```javascript
class HapticFeedback {
  constructor() {
    this.enabled = true;
  }
  
  toggle() {
    this.enabled = !this.enabled;
  }
  
  vibrate(pattern) {
    if (this.enabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
  
  // Game events
  hit() {
    this.vibrate([50, 25, 75]);
  }
  
  explosion() {
    this.vibrate([100, 50, 150, 50, 200]);
  }
  
  collectItem() {
    this.vibrate([30, 30, 50]);
  }
  
  levelUp() {
    this.vibrate([50, 50, 100, 50, 150, 50, 200]);
  }
  
  gameOver() {
    this.vibrate([500, 100, 500, 100, 500]);
  }
}

const haptic = new HapticFeedback();

// In game
function onCollision() {
  haptic.hit();
}

function onPowerUp() {
  haptic.collectItem();
}
```

### Accessibility Considerations

```javascript
// Respect user preferences
class AccessibleVibration {
  constructor() {
    // Check if user prefers reduced motion
    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    
    // Check saved preference
    this.userDisabled = localStorage.getItem('vibration-disabled') === 'true';
  }
  
  vibrate(pattern) {
    // Skip if reduced motion or user disabled
    if (this.reducedMotion || this.userDisabled) {
      return;
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
  
  disable() {
    this.userDisabled = true;
    localStorage.setItem('vibration-disabled', 'true');
    navigator.vibrate(0);  // Stop any current vibration
  }
  
  enable() {
    this.userDisabled = false;
    localStorage.setItem('vibration-disabled', 'false');
  }
}
```

---

## 12.4.6 Summary

### Methods

| Method | Description |
|--------|-------------|
| `navigator.vibrate(duration)` | Vibrate for duration (ms) |
| `navigator.vibrate(pattern)` | Vibrate with pattern |
| `navigator.vibrate(0)` | Stop vibration |

### Pattern Format

```javascript
[vibrate, pause, vibrate, pause, ...]
// Values in milliseconds
```

### Best Practices

1. **Check support** before using
2. **Keep vibrations short** — battery and UX
3. **Respect reduced motion** preferences
4. **Provide disable option** in settings
5. **Use sparingly** — don't annoy users
6. **Meaningful feedback** — not decoration

### Limitations

- Mobile only (generally)
- Requires user interaction (some browsers)
- Can be disabled by system settings
- Not all patterns feel distinct

---

**End of Chapter 12.4: Vibration API**

Next chapter: **12.5 Ambient Light API** — covers ambient light sensor.
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
