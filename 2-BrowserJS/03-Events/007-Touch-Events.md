# 3.7 Touch Events

Touch events enable you to respond to finger interactions on touch-enabled devices. This chapter covers touch event types, handling multi-touch, touch lists, and common gesture patterns.

---

## 3.7.1 Touch Event Types

### touchstart

```javascript
// Fires when finger touches the screen
element.addEventListener('touchstart', (e) => {
  console.log('Touch started');
  console.log('Touches:', e.touches.length);
});

// Similar to mousedown
// Fires before any mouse emulation events
```

### touchmove

```javascript
// Fires when finger moves on screen
element.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  console.log('Position:', touch.clientX, touch.clientY);
});

// ⚠️ Can cause scroll/zoom if not prevented
element.addEventListener('touchmove', (e) => {
  e.preventDefault();  // Prevent scrolling
  handleDrag(e);
}, { passive: false });  // Must be non-passive to prevent
```

### touchend

```javascript
// Fires when finger leaves the screen
element.addEventListener('touchend', (e) => {
  console.log('Touch ended');
  // ⚠️ e.touches is empty at this point
  // Use e.changedTouches for the ending touch
  console.log('Changed touches:', e.changedTouches.length);
});
```

### touchcancel

```javascript
// Fires when touch is interrupted
element.addEventListener('touchcancel', (e) => {
  console.log('Touch cancelled');
  // System took over: alert, phone call, notification
  // Tab switched, element moved, etc.
  
  resetGestureState();
});

// Always handle touchcancel for proper cleanup
```

---

## 3.7.2 Touch Lists

### TouchList Properties

```javascript
element.addEventListener('touchstart', (e) => {
  // e.touches: all current touches on screen
  // e.targetTouches: touches on this element
  // e.changedTouches: touches that changed in this event
  
  console.log('All touches:', e.touches.length);
  console.log('On this element:', e.targetTouches.length);
  console.log('Changed:', e.changedTouches.length);
});

// Access individual touches
element.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];  // First touch
  const touch2 = e.touches[1]; // Second touch (if any)
  
  // Or iterate
  for (const touch of e.touches) {
    console.log(touch.identifier, touch.clientX, touch.clientY);
  }
});
```

### Touch Object Properties

```javascript
element.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  
  // Unique identifier for this touch
  console.log('ID:', touch.identifier);
  
  // Position relative to viewport
  console.log('Client:', touch.clientX, touch.clientY);
  
  // Position relative to page
  console.log('Page:', touch.pageX, touch.pageY);
  
  // Position relative to screen
  console.log('Screen:', touch.screenX, touch.screenY);
  
  // Element that touch started on
  console.log('Target:', touch.target);
  
  // Touch dimensions (if supported)
  console.log('Radius:', touch.radiusX, touch.radiusY);
  console.log('Rotation:', touch.rotationAngle);
  console.log('Force:', touch.force);  // 0-1
});
```

### Tracking Individual Touches

```javascript
const activeTouches = new Map();

element.addEventListener('touchstart', (e) => {
  for (const touch of e.changedTouches) {
    activeTouches.set(touch.identifier, {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY
    });
  }
});

element.addEventListener('touchmove', (e) => {
  for (const touch of e.changedTouches) {
    const data = activeTouches.get(touch.identifier);
    if (data) {
      data.currentX = touch.clientX;
      data.currentY = touch.clientY;
    }
  }
});

element.addEventListener('touchend', (e) => {
  for (const touch of e.changedTouches) {
    const data = activeTouches.get(touch.identifier);
    if (data) {
      const deltaX = data.currentX - data.startX;
      const deltaY = data.currentY - data.startY;
      console.log(`Touch ${touch.identifier} moved: ${deltaX}, ${deltaY}`);
      activeTouches.delete(touch.identifier);
    }
  }
});
```

---

## 3.7.3 Passive Event Listeners

```javascript
// By default, browsers wait to see if you'll call preventDefault()
// This can delay scrolling

// ⚠️ Non-passive (can cause scroll delay)
element.addEventListener('touchmove', handler);

// ✅ Passive: promises not to prevent default
element.addEventListener('touchmove', handler, { passive: true });

// If you NEED to prevent default:
element.addEventListener('touchmove', (e) => {
  e.preventDefault();  // This will throw error if passive
  handleDrag(e);
}, { passive: false });  // Explicit non-passive

// Modern browsers default touchstart/touchmove on document to passive
// Be explicit when needed
```

---

## 3.7.4 Common Gesture Patterns

### Tap Detection

```javascript
class TapDetector {
  constructor(element) {
    this.element = element;
    this.startTime = 0;
    this.startX = 0;
    this.startY = 0;
    
    element.addEventListener('touchstart', this.onStart.bind(this));
    element.addEventListener('touchend', this.onEnd.bind(this));
  }
  
  onStart(e) {
    if (e.touches.length !== 1) return;
    
    this.startTime = Date.now();
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }
  
  onEnd(e) {
    const touch = e.changedTouches[0];
    const elapsed = Date.now() - this.startTime;
    const deltaX = Math.abs(touch.clientX - this.startX);
    const deltaY = Math.abs(touch.clientY - this.startY);
    
    // Tap: short duration, minimal movement
    if (elapsed < 300 && deltaX < 10 && deltaY < 10) {
      this.element.dispatchEvent(new CustomEvent('tap', {
        detail: { x: touch.clientX, y: touch.clientY }
      }));
    }
  }
}
```

### Long Press

```javascript
class LongPress {
  constructor(element, duration = 500) {
    this.element = element;
    this.duration = duration;
    this.timer = null;
    
    element.addEventListener('touchstart', this.onStart.bind(this));
    element.addEventListener('touchend', this.onEnd.bind(this));
    element.addEventListener('touchmove', this.onMove.bind(this));
    element.addEventListener('touchcancel', this.onEnd.bind(this));
  }
  
  onStart(e) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    
    this.timer = setTimeout(() => {
      this.element.dispatchEvent(new CustomEvent('longpress', {
        detail: { x: this.startX, y: this.startY }
      }));
    }, this.duration);
  }
  
  onMove(e) {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.startX);
    const deltaY = Math.abs(touch.clientY - this.startY);
    
    // Cancel if moved too much
    if (deltaX > 10 || deltaY > 10) {
      clearTimeout(this.timer);
    }
  }
  
  onEnd() {
    clearTimeout(this.timer);
  }
}
```

### Swipe Detection

```javascript
class SwipeDetector {
  constructor(element, options = {}) {
    this.element = element;
    this.threshold = options.threshold || 50;
    this.restraint = options.restraint || 100;
    this.maxTime = options.maxTime || 300;
    
    element.addEventListener('touchstart', this.onStart.bind(this));
    element.addEventListener('touchend', this.onEnd.bind(this));
  }
  
  onStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }
  
  onEnd(e) {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const elapsed = Date.now() - this.startTime;
    
    if (elapsed > this.maxTime) return;
    
    let direction = null;
    
    if (Math.abs(deltaX) > this.threshold && Math.abs(deltaY) < this.restraint) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (Math.abs(deltaY) > this.threshold && Math.abs(deltaX) < this.restraint) {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    if (direction) {
      this.element.dispatchEvent(new CustomEvent('swipe', {
        detail: { direction, deltaX, deltaY }
      }));
    }
  }
}

// Usage
const swipe = new SwipeDetector(element);
element.addEventListener('swipe', (e) => {
  console.log('Swiped:', e.detail.direction);
});
```

### Pinch Zoom

```javascript
class PinchZoom {
  constructor(element) {
    this.element = element;
    this.initialDistance = 0;
    this.currentScale = 1;
    
    element.addEventListener('touchstart', this.onStart.bind(this));
    element.addEventListener('touchmove', this.onMove.bind(this));
    element.addEventListener('touchend', this.onEnd.bind(this));
  }
  
  getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  getCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }
  
  onStart(e) {
    if (e.touches.length === 2) {
      this.initialDistance = this.getDistance(e.touches);
      this.initialScale = this.currentScale;
    }
  }
  
  onMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      
      const distance = this.getDistance(e.touches);
      const scale = (distance / this.initialDistance) * this.initialScale;
      const center = this.getCenter(e.touches);
      
      this.currentScale = Math.min(Math.max(scale, 0.5), 3);
      
      this.element.dispatchEvent(new CustomEvent('pinch', {
        detail: {
          scale: this.currentScale,
          center
        }
      }));
    }
  }
  
  onEnd(e) {
    if (e.touches.length < 2) {
      this.initialDistance = 0;
    }
  }
}
```

### Drag and Pan

```javascript
class TouchDrag {
  constructor(element) {
    this.element = element;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    
    element.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
    element.addEventListener('touchmove', this.onMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.onEnd.bind(this));
    element.addEventListener('touchcancel', this.onEnd.bind(this));
  }
  
  onStart(e) {
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    this.isDragging = true;
    
    const touch = e.touches[0];
    this.startX = touch.clientX - this.offsetX;
    this.startY = touch.clientY - this.offsetY;
    
    this.element.classList.add('dragging');
  }
  
  onMove(e) {
    if (!this.isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    this.offsetX = touch.clientX - this.startX;
    this.offsetY = touch.clientY - this.startY;
    
    this.element.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
  }
  
  onEnd() {
    this.isDragging = false;
    this.element.classList.remove('dragging');
  }
}
```

---

## 3.7.5 Touch and Mouse Compatibility

### Unified Event Handling

```javascript
// Handle both touch and mouse
function addUnifiedListeners(element, handlers) {
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();  // Prevent mouse emulation
    handlers.start?.(e.touches[0]);
  }, { passive: false });
  
  element.addEventListener('touchmove', (e) => {
    handlers.move?.(e.touches[0]);
  }, { passive: false });
  
  element.addEventListener('touchend', (e) => {
    handlers.end?.(e.changedTouches[0]);
  });
  
  element.addEventListener('mousedown', (e) => {
    handlers.start?.(e);
  });
  
  element.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
      handlers.move?.(e);
    }
  });
  
  element.addEventListener('mouseup', (e) => {
    handlers.end?.(e);
  });
}

// ✅ Better: use Pointer Events (see chapter 3.8)
```

### Detecting Touch Support

```javascript
// Check for touch support
const hasTouch = 'ontouchstart' in window || 
                 navigator.maxTouchPoints > 0;

// But devices can have both touch AND mouse
// Better to respond to actual events
element.addEventListener('touchstart', handleTouch);
element.addEventListener('mousedown', handleMouse);
```

### 300ms Click Delay

```javascript
// Older mobile browsers had 300ms delay for double-tap zoom

// Solutions:
// 1. Use touch-action CSS
// touch-action: manipulation;  /* Disable double-tap zoom */

// 2. Use viewport meta tag
// <meta name="viewport" content="width=device-width">

// 3. Modern browsers have eliminated the delay
// when viewport is properly configured
```

---

## 3.7.6 Gotchas

```javascript
// ❌ e.touches is empty in touchend
element.addEventListener('touchend', (e) => {
  const touch = e.touches[0];  // undefined!
});

// ✅ Use changedTouches for ending touches
element.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
});

// ❌ Forgetting touchcancel
element.addEventListener('touchstart', startDrag);
element.addEventListener('touchend', endDrag);
// Touch can be cancelled without touchend!

// ✅ Always handle touchcancel
element.addEventListener('touchcancel', endDrag);

// ❌ Not using passive: false when preventing default
element.addEventListener('touchmove', (e) => {
  e.preventDefault();  // Error in passive listener!
});

// ✅ Explicit passive: false
element.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

// ❌ Mixing touch and mouse without preventing double events
// Touch devices fire: touchstart → touchend → mousedown → click

// ✅ Prevent mouse emulation
element.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleInteraction(e.touches[0]);
});
```

---

## 3.7.7 Summary

### Touch Events

| Event | When | TouchLists Available |
|-------|------|---------------------|
| `touchstart` | Finger touches screen | touches, targetTouches, changedTouches |
| `touchmove` | Finger moves | touches, targetTouches, changedTouches |
| `touchend` | Finger leaves screen | targetTouches, changedTouches (no touches) |
| `touchcancel` | Touch interrupted | changedTouches |

### TouchList Types

| Property | Contains |
|----------|----------|
| `touches` | All current touches on screen |
| `targetTouches` | Touches on this element |
| `changedTouches` | Touches changed in this event |

### Touch Object Properties

| Property | Description |
|----------|-------------|
| `identifier` | Unique ID for tracking |
| `clientX/Y` | Position relative to viewport |
| `pageX/Y` | Position relative to page |
| `target` | Element touch started on |
| `force` | Pressure (0-1) |

### Best Practices

1. **Always handle `touchcancel`** for cleanup
2. **Use `changedTouches` in `touchend`** (touches is empty)
3. **Use `{ passive: false }` when preventing default**
4. **Consider Pointer Events** for unified touch/mouse handling
5. **Track touches by identifier** for multi-touch

---

**End of Chapter 3.7: Touch Events**

Next chapter: **3.8 Pointer Events** — covers unified mouse, touch, and pen input with the modern Pointer Events API.
