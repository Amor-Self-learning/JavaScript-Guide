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
