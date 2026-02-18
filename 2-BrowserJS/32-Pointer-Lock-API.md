# 32.1 Mouse Lock

The Pointer Lock API captures the mouse cursor, enabling unlimited mouse movement for games and 3D applications.

---

## 32.1.1 Request Pointer Lock

### Lock Pointer

```javascript
async function lockPointer(element) {
  try {
    await element.requestPointerLock();
    console.log('Pointer locked');
  } catch (error) {
    console.error('Lock failed:', error);
  }
}

// Usage - requires user gesture
canvas.addEventListener('click', () => {
  lockPointer(canvas);
});
```

---

## 32.1.2 Exit Pointer Lock

### Release Lock

```javascript
function exitPointerLock() {
  document.exitPointerLock();
}

// Or press Escape key (automatic)
```

---

## 32.1.3 Check Lock State

### Current State

```javascript
if (document.pointerLockElement) {
  console.log('Locked to:', document.pointerLockElement);
} else {
  console.log('Not locked');
}
```

---

## 32.1.4 Movement Data

### Get Mouse Movement

```javascript
document.addEventListener('mousemove', (event) => {
  if (!document.pointerLockElement) return;
  
  // Movement delta (not absolute position)
  const deltaX = event.movementX;
  const deltaY = event.movementY;
  
  console.log('Movement:', deltaX, deltaY);
});
```

### Use for Camera Control

```javascript
let cameraYaw = 0;
let cameraPitch = 0;
const sensitivity = 0.002;

document.addEventListener('mousemove', (event) => {
  if (!document.pointerLockElement) return;
  
  cameraYaw -= event.movementX * sensitivity;
  cameraPitch -= event.movementY * sensitivity;
  
  // Clamp pitch
  cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
  
  updateCamera();
});
```

---

## 32.1.5 Lock Events

### Listen for Changes

```javascript
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {
    console.log('Pointer locked');
    showCrosshair();
  } else {
    console.log('Pointer unlocked');
    hideCrosshair();
  }
});

document.addEventListener('pointerlockerror', () => {
  console.error('Pointer lock failed');
});
```

---

## 32.1.6 Complete Example

### First-Person Controls

```javascript
class FPSControls {
  constructor(element) {
    this.element = element;
    this.locked = false;
    
    this.yaw = 0;
    this.pitch = 0;
    this.sensitivity = 0.002;
    
    this.setupEvents();
  }
  
  setupEvents() {
    this.element.addEventListener('click', () => {
      this.lock();
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.element;
      this.onLockChange?.(this.locked);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      
      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      
      // Clamp pitch to prevent flipping
      this.pitch = Math.max(-Math.PI / 2 + 0.01, 
                   Math.min(Math.PI / 2 - 0.01, this.pitch));
      
      this.onMove?.(this.yaw, this.pitch);
    });
  }
  
  async lock() {
    try {
      await this.element.requestPointerLock();
    } catch (error) {
      console.error('Lock failed:', error);
    }
  }
  
  unlock() {
    document.exitPointerLock();
  }
  
  getDirection() {
    return {
      x: Math.sin(this.yaw) * Math.cos(this.pitch),
      y: Math.sin(this.pitch),
      z: Math.cos(this.yaw) * Math.cos(this.pitch)
    };
  }
}

// Usage
const controls = new FPSControls(canvas);
controls.onMove = (yaw, pitch) => {
  camera.rotation.set(pitch, yaw, 0);
};
```

---

## 32.1.7 Summary

### Methods

| Method | Description |
|--------|-------------|
| `element.requestPointerLock()` | Lock pointer |
| `document.exitPointerLock()` | Release lock |

### Properties

| Property | Description |
|----------|-------------|
| `document.pointerLockElement` | Locked element |

### Mouse Event Properties

| Property | Description |
|----------|-------------|
| `movementX` | Horizontal delta |
| `movementY` | Vertical delta |

### Events

| Event | When |
|-------|------|
| `pointerlockchange` | Lock state changes |
| `pointerlockerror` | Lock request fails |

### Best Practices

1. **Request on user gesture** — required
2. **Use in fullscreen** — better UX
3. **Provide escape method** — Escape key or button
4. **Show custom cursor** — crosshair for games
5. **Clamp pitch** — prevent camera flip

---

**End of Chapter 32.1: Mouse Lock**

Next: **33.1 Visibility State** — Page Visibility API.
