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
