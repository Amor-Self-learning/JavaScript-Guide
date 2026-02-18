# 22.1 Preventing Sleep

The Screen Wake Lock API prevents devices from dimming or locking the screen. This chapter covers requesting, releasing, and managing wake locks.

---

## 22.1.1 Basic Usage

### Request Wake Lock

```javascript
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    console.log('Wake Lock not supported');
    return null;
  }
  
  try {
    const wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock acquired');
    return wakeLock;
  } catch (error) {
    console.error('Wake Lock failed:', error);
    return null;
  }
}
```

---

## 22.1.2 Release Wake Lock

### Manual Release

```javascript
let wakeLock = null;

async function enableWakeLock() {
  wakeLock = await navigator.wakeLock.request('screen');
}

function disableWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
    console.log('Wake Lock released');
  }
}
```

### Automatic Release

```javascript
// Wake lock is automatically released when:
// - Tab becomes inactive
// - User switches to another app
// - Device is low on battery

const wakeLock = await navigator.wakeLock.request('screen');

wakeLock.addEventListener('release', () => {
  console.log('Wake Lock was released');
});
```

---

## 22.1.3 Re-acquire on Visibility Change

### Handle Tab Visibility

```javascript
let wakeLock = null;

async function acquireWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock released');
      wakeLock = null;
    });
    
  } catch (error) {
    console.error('Failed to acquire:', error);
  }
}

// Re-acquire when tab becomes visible again
document.addEventListener('visibilitychange', async () => {
  if (wakeLock === null && document.visibilityState === 'visible') {
    await acquireWakeLock();
  }
});

// Initial acquire
acquireWakeLock();
```

---

## 22.1.4 WakeLockSentinel

### Properties

```javascript
const wakeLock = await navigator.wakeLock.request('screen');

wakeLock.type;      // 'screen'
wakeLock.released;  // false (until released)
```

### Events

```javascript
wakeLock.addEventListener('release', () => {
  console.log('Released');
});
```

---

## 22.1.5 Use Cases

### Video Player

```javascript
class VideoPlayer {
  constructor(video) {
    this.video = video;
    this.wakeLock = null;
    
    video.addEventListener('play', () => this.acquireLock());
    video.addEventListener('pause', () => this.releaseLock());
    video.addEventListener('ended', () => this.releaseLock());
  }
  
  async acquireLock() {
    if (!('wakeLock' in navigator)) return;
    
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
    } catch (error) {
      console.warn('Could not acquire wake lock:', error);
    }
  }
  
  releaseLock() {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }
}
```

### Recipe App

```javascript
class RecipeViewer {
  constructor() {
    this.wakeLock = null;
    this.enabled = false;
    
    // Re-acquire on visibility change
    document.addEventListener('visibilitychange', () => {
      if (this.enabled && document.visibilityState === 'visible') {
        this.acquire();
      }
    });
  }
  
  async acquire() {
    if (!('wakeLock' in navigator)) return;
    
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
      });
    } catch (error) {
      console.warn('Wake lock failed:', error);
    }
  }
  
  enable() {
    this.enabled = true;
    this.acquire();
  }
  
  disable() {
    this.enabled = false;
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }
}
```

### Presentation Mode

```javascript
class PresentationMode {
  constructor() {
    this.wakeLock = null;
  }
  
  async start() {
    // Request fullscreen
    await document.documentElement.requestFullscreen();
    
    // Prevent screen sleep
    if ('wakeLock' in navigator) {
      this.wakeLock = await navigator.wakeLock.request('screen');
    }
  }
  
  async stop() {
    // Exit fullscreen
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    
    // Release wake lock
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }
}
```

---

## 22.1.6 Complete Wake Lock Manager

### Reusable Class

```javascript
class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.active = false;
    this.supported = 'wakeLock' in navigator;
    
    if (this.supported) {
      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange();
      });
    }
  }
  
  async request() {
    if (!this.supported) {
      console.warn('Wake Lock not supported');
      return false;
    }
    
    this.active = true;
    return await this.acquire();
  }
  
  async acquire() {
    if (!this.active) return false;
    
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      
      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
        this.onRelease?.();
      });
      
      this.onAcquire?.();
      return true;
      
    } catch (error) {
      this.onError?.(error);
      return false;
    }
  }
  
  async release() {
    this.active = false;
    
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }
  
  handleVisibilityChange() {
    if (this.active && document.visibilityState === 'visible' && !this.wakeLock) {
      this.acquire();
    }
  }
  
  get isLocked() {
    return this.wakeLock !== null;
  }
}

// Usage
const wakelock = new WakeLockManager();

wakelock.onAcquire = () => console.log('Screen will stay awake');
wakelock.onRelease = () => console.log('Screen may sleep');

await wakelock.request();
// ... later
await wakelock.release();
```

---

## 22.1.7 Summary

### Method

```javascript
navigator.wakeLock.request(type)
// type: 'screen' (only type currently)
// Returns: Promise<WakeLockSentinel>
```

### WakeLockSentinel

| Property | Type | Description |
|----------|------|-------------|
| `type` | String | Wake lock type ('screen') |
| `released` | Boolean | Whether released |

| Method | Description |
|--------|-------------|
| `release()` | Release the wake lock |

| Event | When |
|-------|------|
| `release` | Wake lock released |

### Automatic Release Triggers

- Tab becomes hidden
- User switches apps
- System low battery
- Manual `release()` call

### Best Practices

1. **Check support** before using
2. **Re-acquire on visibility change** if needed
3. **Release when not needed** to save battery
4. **Handle release events** for UI updates
5. **Use for appropriate scenarios** (video, recipes, maps)
6. **Don't overuse** — respect user battery

---

**End of Chapter 22.1: Preventing Sleep**

This completes Group 22 — Screen Wake Lock API. Next section: **Group 23 — Idle Detection API**.
