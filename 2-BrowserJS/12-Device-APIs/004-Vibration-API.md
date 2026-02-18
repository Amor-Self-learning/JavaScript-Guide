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
