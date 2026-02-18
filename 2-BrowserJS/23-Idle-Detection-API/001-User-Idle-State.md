# 23.1 User Idle State

The Idle Detection API allows applications to detect when users are idle or away from their devices. This chapter covers idle detection setup and state monitoring.

---

## 23.1.1 Basic Usage

### Create Idle Detector

```javascript
async function startIdleDetection() {
  if (!('IdleDetector' in window)) {
    console.log('Idle Detection not supported');
    return null;
  }
  
  // Request permission first
  const permission = await IdleDetector.requestPermission();
  
  if (permission !== 'granted') {
    console.log('Permission denied');
    return null;
  }
  
  const detector = new IdleDetector();
  
  detector.addEventListener('change', () => {
    console.log('User state:', detector.userState);
    console.log('Screen state:', detector.screenState);
  });
  
  await detector.start({
    threshold: 60000  // 60 seconds
  });
  
  return detector;
}
```

---

## 23.1.2 State Values

### User State

```javascript
// detector.userState values:
// 'active' - User is interacting
// 'idle' - No interaction for threshold time
```

### Screen State

```javascript
// detector.screenState values:
// 'unlocked' - Screen is on
// 'locked' - Screen is locked
```

### Combined States

```javascript
detector.addEventListener('change', () => {
  const { userState, screenState } = detector;
  
  if (userState === 'idle' && screenState === 'locked') {
    // User is away with locked screen
    handleUserAway();
  } else if (userState === 'idle') {
    // User is idle but screen on
    handleUserIdle();
  } else {
    // User is active
    handleUserActive();
  }
});
```

---

## 23.1.3 Configuration

### Threshold

```javascript
// Minimum idle time before state changes to 'idle'
await detector.start({
  threshold: 60000     // 60 seconds minimum
  // Minimum is 60000ms (1 minute)
});

// ❌ Won't work - threshold too low
await detector.start({
  threshold: 10000  // Error: must be >= 60000
});
```

---

## 23.1.4 Stop Detection

### Cleanup

```javascript
let idleDetector = null;

async function startDetection() {
  idleDetector = new IdleDetector();
  
  idleDetector.addEventListener('change', handleChange);
  
  await idleDetector.start({ threshold: 60000 });
}

function stopDetection() {
  if (idleDetector) {
    idleDetector.abort();
    idleDetector = null;
  }
}

// Stop when page unloads
window.addEventListener('beforeunload', stopDetection);
```

---

## 23.1.5 Permission Handling

### Request Permission

```javascript
async function checkIdlePermission() {
  // Check if API is available
  if (!('IdleDetector' in window)) {
    return 'unsupported';
  }
  
  // Request permission
  try {
    const permission = await IdleDetector.requestPermission();
    return permission;  // 'granted' or 'denied'
  } catch (error) {
    return 'error';
  }
}
```

### Permission UI Pattern

```javascript
async function setupIdleDetection() {
  const permission = await checkIdlePermission();
  
  switch (permission) {
    case 'granted':
      startIdleDetector();
      break;
      
    case 'denied':
      showPermissionDeniedMessage();
      break;
      
    case 'unsupported':
      useFallbackDetection();
      break;
  }
}
```

---

## 23.1.6 Use Cases

### Auto-Logout

```javascript
class AutoLogout {
  constructor(options = {}) {
    this.warningTime = options.warningTime || 4 * 60 * 1000;  // 4 min
    this.logoutTime = options.logoutTime || 5 * 60 * 1000;    // 5 min
    this.detector = null;
    this.warningTimeout = null;
    this.logoutTimeout = null;
  }
  
  async start() {
    if (!('IdleDetector' in window)) return;
    
    const permission = await IdleDetector.requestPermission();
    if (permission !== 'granted') return;
    
    this.detector = new IdleDetector();
    this.detector.addEventListener('change', () => this.handleChange());
    
    await this.detector.start({ threshold: 60000 });
  }
  
  handleChange() {
    if (this.detector.userState === 'idle') {
      this.startIdleTimers();
    } else {
      this.clearIdleTimers();
    }
  }
  
  startIdleTimers() {
    this.warningTimeout = setTimeout(() => {
      this.showWarning();
    }, this.warningTime - 60000);  // Subtract initial threshold
    
    this.logoutTimeout = setTimeout(() => {
      this.logout();
    }, this.logoutTime - 60000);
  }
  
  clearIdleTimers() {
    clearTimeout(this.warningTimeout);
    clearTimeout(this.logoutTimeout);
    this.hideWarning();
  }
  
  showWarning() {
    // Show "Are you still there?" dialog
  }
  
  hideWarning() {
    // Hide warning dialog
  }
  
  logout() {
    // Perform logout
    window.location.href = '/logout';
  }
  
  stop() {
    this.clearIdleTimers();
    this.detector?.abort();
  }
}
```

### Presence Indicator

```javascript
class PresenceIndicator {
  constructor(userId) {
    this.userId = userId;
    this.detector = null;
    this.lastState = 'active';
  }
  
  async start() {
    if (!('IdleDetector' in window)) {
      // Fallback: just report as active
      this.updatePresence('active');
      return;
    }
    
    const permission = await IdleDetector.requestPermission();
    if (permission !== 'granted') return;
    
    this.detector = new IdleDetector();
    this.detector.addEventListener('change', () => this.handleChange());
    
    await this.detector.start({ threshold: 120000 });  // 2 min
  }
  
  handleChange() {
    const { userState, screenState } = this.detector;
    let presence;
    
    if (userState === 'active') {
      presence = 'online';
    } else if (screenState === 'locked') {
      presence = 'away';
    } else {
      presence = 'idle';
    }
    
    if (presence !== this.lastState) {
      this.lastState = presence;
      this.updatePresence(presence);
    }
  }
  
  async updatePresence(status) {
    await fetch('/api/presence', {
      method: 'POST',
      body: JSON.stringify({
        userId: this.userId,
        status
      }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  stop() {
    this.detector?.abort();
    this.updatePresence('offline');
  }
}
```

### Pause Media When Idle

```javascript
class SmartMediaPlayer {
  constructor(mediaElement) {
    this.media = mediaElement;
    this.detector = null;
    this.wasPlayingBeforeIdle = false;
  }
  
  async enableIdlePause() {
    if (!('IdleDetector' in window)) return;
    
    const permission = await IdleDetector.requestPermission();
    if (permission !== 'granted') return;
    
    this.detector = new IdleDetector();
    this.detector.addEventListener('change', () => {
      if (this.detector.userState === 'idle') {
        this.handleIdle();
      } else {
        this.handleActive();
      }
    });
    
    await this.detector.start({ threshold: 60000 });
  }
  
  handleIdle() {
    if (!this.media.paused) {
      this.wasPlayingBeforeIdle = true;
      this.media.pause();
    }
  }
  
  handleActive() {
    if (this.wasPlayingBeforeIdle) {
      this.wasPlayingBeforeIdle = false;
      this.media.play();
    }
  }
}
```

---

## 23.1.7 Summary

### Static Methods

| Method | Description |
|--------|-------------|
| `IdleDetector.requestPermission()` | Request permission |

### Instance Methods

| Method | Description |
|--------|-------------|
| `start(options)` | Start detecting |
| `abort()` | Stop detecting |

### Properties

| Property | Values | Description |
|----------|--------|-------------|
| `userState` | 'active', 'idle' | User interaction state |
| `screenState` | 'unlocked', 'locked' | Screen lock state |

### Start Options

| Option | Type | Description |
|--------|------|-------------|
| `threshold` | Number | Idle time in ms (min 60000) |

### Events

| Event | When |
|-------|------|
| `change` | User or screen state changes |

### Best Practices

1. **Request permission** with user explanation
2. **Handle denied permission** gracefully
3. **Use appropriate threshold** (1-5 minutes typical)
4. **Clean up** with abort() when done
5. **Provide fallback** for unsupported browsers
6. **Respect privacy** — don't track unnecessarily

---

**End of Chapter 23.1: User Idle State**

This completes Group 23 — Idle Detection API. Continuing with specialized device APIs.
