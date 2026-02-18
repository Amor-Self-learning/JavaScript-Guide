# 30.1 Orientation Control

The Screen Orientation API provides control over screen orientation, enabling apps to lock orientation and detect changes.

---

## 30.1.1 Current Orientation

### Get Orientation

```javascript
const orientation = screen.orientation;

console.log('Type:', orientation.type);
// 'portrait-primary', 'portrait-secondary',
// 'landscape-primary', 'landscape-secondary'

console.log('Angle:', orientation.angle);
// 0, 90, 180, 270
```

---

## 30.1.2 Lock Orientation

### Lock to Specific Type

```javascript
async function lockOrientation(type) {
  try {
    await screen.orientation.lock(type);
    console.log('Locked to:', type);
  } catch (error) {
    console.error('Lock failed:', error);
  }
}

// Usage
await lockOrientation('landscape');
await lockOrientation('portrait');
await lockOrientation('landscape-primary');
```

### Lock Types

```javascript
// Primary orientations
'portrait-primary'     // Normal portrait
'landscape-primary'    // Normal landscape

// Secondary orientations (upside down)
'portrait-secondary'
'landscape-secondary'

// Any orientation within category
'portrait'             // Either portrait
'landscape'            // Either landscape

// Natural orientation
'natural'              // Device's natural orientation

// Any orientation
'any'                  // Allow all orientations
```

---

## 30.1.3 Unlock Orientation

### Release Lock

```javascript
screen.orientation.unlock();
console.log('Orientation unlocked');
```

---

## 30.1.4 Orientation Change Event

### Listen for Changes

```javascript
screen.orientation.addEventListener('change', () => {
  console.log('New orientation:', screen.orientation.type);
  console.log('Angle:', screen.orientation.angle);
  
  handleOrientationChange();
});

function handleOrientationChange() {
  const isLandscape = screen.orientation.type.includes('landscape');
  
  if (isLandscape) {
    showLandscapeUI();
  } else {
    showPortraitUI();
  }
}
```

---

## 30.1.5 Requirements

### Fullscreen Required

```javascript
// Orientation lock often requires fullscreen
async function lockLandscape() {
  try {
    // Enter fullscreen first
    await document.documentElement.requestFullscreen();
    
    // Then lock orientation
    await screen.orientation.lock('landscape');
    
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

---

## 30.1.6 Complete Example

### Orientation Manager

```javascript
class OrientationManager {
  constructor() {
    this.locked = false;
    
    screen.orientation.addEventListener('change', () => {
      this.onChange?.();
    });
  }
  
  get current() {
    return screen.orientation.type;
  }
  
  get angle() {
    return screen.orientation.angle;
  }
  
  get isPortrait() {
    return this.current.includes('portrait');
  }
  
  get isLandscape() {
    return this.current.includes('landscape');
  }
  
  async lock(type = 'landscape') {
    try {
      // May need fullscreen
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      
      await screen.orientation.lock(type);
      this.locked = true;
      return true;
      
    } catch (error) {
      console.warn('Lock failed:', error);
      return false;
    }
  }
  
  unlock() {
    screen.orientation.unlock();
    this.locked = false;
  }
}

// Usage
const orientation = new OrientationManager();
orientation.onChange = () => console.log('Changed:', orientation.current);
await orientation.lock('landscape');
```

---

## 30.1.7 Summary

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `screen.orientation.type` | String | Current orientation |
| `screen.orientation.angle` | Number | Rotation angle |

### Methods

| Method | Description |
|--------|-------------|
| `lock(type)` | Lock to orientation |
| `unlock()` | Release lock |

### Orientation Types

| Type | Description |
|------|-------------|
| `portrait-primary` | Normal portrait |
| `portrait-secondary` | Upside-down portrait |
| `landscape-primary` | Normal landscape |
| `landscape-secondary` | Upside-down landscape |
| `portrait` | Any portrait |
| `landscape` | Any landscape |
| `natural` | Device natural |
| `any` | All allowed |

### Best Practices

1. **Check fullscreen** — often required for lock
2. **Handle errors** — lock may not be supported
3. **Unlock when done** — respect user preference
4. **Listen for changes** — adapt UI

---

**End of Chapter 30.1: Orientation Control**

Next: **31.1 Fullscreen Mode** — Fullscreen API.
