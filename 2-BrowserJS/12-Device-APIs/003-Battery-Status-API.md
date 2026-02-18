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
