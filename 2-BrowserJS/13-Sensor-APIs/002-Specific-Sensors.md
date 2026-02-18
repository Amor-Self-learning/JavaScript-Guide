# 13.2 Specific Sensors

This chapter covers the specific sensor implementations built on the Generic Sensor API, including Accelerometer, Gyroscope, Magnetometer, and Orientation sensors.

---

## 13.2.1 Accelerometer

### Basic Usage

```javascript
const accelerometer = new Accelerometer({ frequency: 60 });

accelerometer.addEventListener('reading', () => {
  console.log('X:', accelerometer.x);  // m/s²
  console.log('Y:', accelerometer.y);
  console.log('Z:', accelerometer.z);
});

accelerometer.addEventListener('error', (e) => {
  console.error('Error:', e.error.name);
});

accelerometer.start();
```

### Understanding Values

```javascript
// Accelerometer measures acceleration including gravity
// When device is flat and stationary:
// x ≈ 0, y ≈ 0, z ≈ 9.8 (gravity)

// When device is tilted:
// Gravity component shifts between axes
```

### Example: Shake Detection

```javascript
class ShakeDetector {
  constructor(threshold = 15, onShake) {
    this.threshold = threshold;
    this.onShake = onShake;
    this.lastX = 0;
    this.lastY = 0;
    this.lastZ = 0;
    this.lastTime = Date.now();
    
    this.sensor = new Accelerometer({ frequency: 60 });
    this.sensor.addEventListener('reading', () => this.check());
  }
  
  check() {
    const now = Date.now();
    const delta = now - this.lastTime;
    
    if (delta > 100) {
      const { x, y, z } = this.sensor;
      const speed = Math.abs(x + y + z - this.lastX - this.lastY - this.lastZ) / delta * 10000;
      
      if (speed > this.threshold) {
        this.onShake();
      }
      
      this.lastX = x;
      this.lastY = y;
      this.lastZ = z;
      this.lastTime = now;
    }
  }
  
  start() { this.sensor.start(); }
  stop() { this.sensor.stop(); }
}
```

---

## 13.2.2 LinearAccelerationSensor

### Gravity-Free Acceleration

```javascript
// Measures acceleration without gravity
const sensor = new LinearAccelerationSensor({ frequency: 60 });

sensor.addEventListener('reading', () => {
  console.log('X:', sensor.x);  // Linear acceleration only
  console.log('Y:', sensor.y);
  console.log('Z:', sensor.z);
  
  // When stationary: all values ≈ 0
});

sensor.start();
```

### Use Case: Motion Detection

```javascript
const sensor = new LinearAccelerationSensor({ frequency: 30 });
const THRESHOLD = 1.0;

sensor.addEventListener('reading', () => {
  const magnitude = Math.sqrt(
    sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2
  );
  
  if (magnitude > THRESHOLD) {
    console.log('Device is moving');
  }
});
```

---

## 13.2.3 GravitySensor

### Gravity Vector

```javascript
// Measures gravity direction
const sensor = new GravitySensor({ frequency: 30 });

sensor.addEventListener('reading', () => {
  console.log('Gravity X:', sensor.x);
  console.log('Gravity Y:', sensor.y);
  console.log('Gravity Z:', sensor.z);
  
  // Magnitude ≈ 9.8 m/s²
});

sensor.start();
```

### Use Case: Tilt Detection

```javascript
const gravity = new GravitySensor({ frequency: 30 });

gravity.addEventListener('reading', () => {
  // Calculate tilt angles
  const roll = Math.atan2(gravity.y, gravity.z) * 180 / Math.PI;
  const pitch = Math.atan2(-gravity.x, Math.sqrt(gravity.y ** 2 + gravity.z ** 2)) * 180 / Math.PI;
  
  console.log('Roll:', roll.toFixed(1), '°');
  console.log('Pitch:', pitch.toFixed(1), '°');
});
```

---

## 13.2.4 Gyroscope

### Angular Velocity

```javascript
const gyroscope = new Gyroscope({ frequency: 60 });

gyroscope.addEventListener('reading', () => {
  console.log('X:', gyroscope.x);  // rad/s
  console.log('Y:', gyroscope.y);
  console.log('Z:', gyroscope.z);
});

gyroscope.start();
```

### Rotation Tracking

```javascript
class RotationTracker {
  constructor() {
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.lastTimestamp = null;
    
    this.gyro = new Gyroscope({ frequency: 60 });
    this.gyro.addEventListener('reading', () => this.update());
  }
  
  update() {
    if (this.lastTimestamp !== null) {
      const dt = (this.gyro.timestamp - this.lastTimestamp) / 1000;
      
      this.rotationX += this.gyro.x * dt * (180 / Math.PI);
      this.rotationY += this.gyro.y * dt * (180 / Math.PI);
      this.rotationZ += this.gyro.z * dt * (180 / Math.PI);
    }
    
    this.lastTimestamp = this.gyro.timestamp;
  }
  
  reset() {
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
  }
  
  start() { this.gyro.start(); }
  stop() { this.gyro.stop(); }
}
```

---

## 13.2.5 Magnetometer

### Magnetic Field

```javascript
const magnetometer = new Magnetometer({ frequency: 30 });

magnetometer.addEventListener('reading', () => {
  console.log('X:', magnetometer.x);  // microTesla
  console.log('Y:', magnetometer.y);
  console.log('Z:', magnetometer.z);
});

magnetometer.start();
```

### Compass

```javascript
const magnetometer = new Magnetometer({ frequency: 30 });

magnetometer.addEventListener('reading', () => {
  // Calculate compass heading
  let heading = Math.atan2(magnetometer.y, magnetometer.x) * 180 / Math.PI;
  
  // Normalize to 0-360
  if (heading < 0) heading += 360;
  
  console.log('Heading:', heading.toFixed(1), '°');
  
  // Cardinal direction
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(heading / 45) % 8;
  console.log('Direction:', directions[index]);
});
```

---

## 13.2.6 AbsoluteOrientationSensor

### Device Orientation (Earth Frame)

```javascript
// Orientation relative to Earth's reference frame
const sensor = new AbsoluteOrientationSensor({ frequency: 60 });

sensor.addEventListener('reading', () => {
  // Quaternion representation
  console.log('Quaternion:', sensor.quaternion);
  // [x, y, z, w]
});

sensor.start();
```

### Convert to Euler Angles

```javascript
function quaternionToEuler(q) {
  const [x, y, z, w] = q;
  
  // Roll (x-axis rotation)
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);
  
  // Pitch (y-axis rotation)
  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 
    ? Math.sign(sinp) * Math.PI / 2 
    : Math.asin(sinp);
  
  // Yaw (z-axis rotation)
  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);
  
  return {
    roll: roll * 180 / Math.PI,
    pitch: pitch * 180 / Math.PI,
    yaw: yaw * 180 / Math.PI
  };
}

sensor.addEventListener('reading', () => {
  const euler = quaternionToEuler(sensor.quaternion);
  console.log('Roll:', euler.roll.toFixed(1));
  console.log('Pitch:', euler.pitch.toFixed(1));
  console.log('Yaw:', euler.yaw.toFixed(1));
});
```

### Apply to 3D Object

```javascript
// Using Three.js
const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
const object3D = new THREE.Mesh(geometry, material);

sensor.addEventListener('reading', () => {
  object3D.quaternion.fromArray(sensor.quaternion);
});
```

---

## 13.2.7 RelativeOrientationSensor

### Device-Relative Orientation

```javascript
// Orientation relative to device's initial position
const sensor = new RelativeOrientationSensor({ frequency: 60 });

sensor.addEventListener('reading', () => {
  console.log('Quaternion:', sensor.quaternion);
});

sensor.start();
```

### Reference Frame Option

```javascript
// 'device' - x forward, y right, z up
// 'screen' - x right, y up, z out of screen
const sensor = new RelativeOrientationSensor({
  frequency: 60,
  referenceFrame: 'screen'
});
```

---

## 13.2.8 Sensor Fusion Example

### Combining Sensors

```javascript
class MotionSensors {
  constructor(frequency = 60) {
    this.frequency = frequency;
    this.sensors = {};
    this.data = {};
  }
  
  async init() {
    try {
      this.sensors.accel = new Accelerometer({ frequency: this.frequency });
      this.sensors.gyro = new Gyroscope({ frequency: this.frequency });
      
      // Set up listeners
      this.sensors.accel.addEventListener('reading', () => {
        this.data.acceleration = {
          x: this.sensors.accel.x,
          y: this.sensors.accel.y,
          z: this.sensors.accel.z
        };
      });
      
      this.sensors.gyro.addEventListener('reading', () => {
        this.data.rotation = {
          x: this.sensors.gyro.x,
          y: this.sensors.gyro.y,
          z: this.sensors.gyro.z
        };
      });
      
      // Start all
      Object.values(this.sensors).forEach(s => s.start());
      
    } catch (error) {
      console.error('Sensor init failed:', error);
      throw error;
    }
  }
  
  getData() {
    return { ...this.data };
  }
  
  stop() {
    Object.values(this.sensors).forEach(s => s.stop());
  }
}
```

---

## 13.2.9 Summary

### Available Sensors

| Sensor | Measures | Unit |
|--------|----------|------|
| Accelerometer | Acceleration + gravity | m/s² |
| LinearAccelerationSensor | Acceleration only | m/s² |
| GravitySensor | Gravity vector | m/s² |
| Gyroscope | Angular velocity | rad/s |
| Magnetometer | Magnetic field | µT |
| AbsoluteOrientationSensor | Earth-frame orientation | Quaternion |
| RelativeOrientationSensor | Device-frame orientation | Quaternion |

### Browser Support

| Sensor | Chrome | Firefox | Safari |
|--------|--------|---------|--------|
| Accelerometer | ✅ | ❌ | ❌ |
| Gyroscope | ✅ | ❌ | ❌ |
| Magnetometer | ✅ | ❌ | ❌ |
| Orientation | ✅ | ❌ | ❌ |

### Best Practices

1. **Use appropriate frequency** — higher = more battery
2. **Combine sensors** for better accuracy
3. **Apply filtering** for smooth data
4. **Handle errors** gracefully
5. **Stop when not needed**
6. **Test on real devices**

---

**End of Chapter 13.2: Specific Sensors**

This completes the Sensor APIs group. Next section: **Group 14 — Connectivity APIs** — covers WebSocket, SSE, and network info.
