# 3.8 Pointer Events

Pointer Events provide a unified API for handling mouse, touch, and pen input. This chapter covers the Pointer Events model, pointer types, capture, and migrating from separate touch/mouse handling.

---

## 3.8.1 Why Pointer Events?

```javascript
// ❌ Old approach: separate handlers for each input type
element.addEventListener('mousedown', handleStart);
element.addEventListener('mousemove', handleMove);
element.addEventListener('mouseup', handleEnd);
element.addEventListener('touchstart', handleStart);
element.addEventListener('touchmove', handleMove);
element.addEventListener('touchend', handleEnd);

// ✅ Pointer Events: one API for all input types
element.addEventListener('pointerdown', handleStart);
element.addEventListener('pointermove', handleMove);
element.addEventListener('pointerup', handleEnd);

// Benefits:
// - Single code path for mouse, touch, and pen
// - Consistent event properties
// - Built-in pointer capture
// - Better pressure/tilt support
```

---

## 3.8.2 Pointer Event Types

### Basic Events

```javascript
// pointerdown: input begins (finger, mouse button, pen)
element.addEventListener('pointerdown', (e) => {
  console.log('Pointer down:', e.pointerId, e.pointerType);
});

// pointermove: pointer moves
element.addEventListener('pointermove', (e) => {
  console.log('Position:', e.clientX, e.clientY);
});

// pointerup: input ends
element.addEventListener('pointerup', (e) => {
  console.log('Pointer up:', e.pointerId);
});

// pointercancel: pointer cancelled (similar to touchcancel)
element.addEventListener('pointercancel', (e) => {
  console.log('Pointer cancelled');
  cleanup();
});
```

### Enter/Leave Events

```javascript
// pointerenter: pointer enters element (doesn't bubble)
element.addEventListener('pointerenter', (e) => {
  element.classList.add('hover');
});

// pointerleave: pointer leaves element (doesn't bubble)
element.addEventListener('pointerleave', (e) => {
  element.classList.remove('hover');
});

// pointerover: pointer over element (bubbles)
element.addEventListener('pointerover', (e) => {
  console.log('Over:', e.target);
});

// pointerout: pointer out of element (bubbles)
element.addEventListener('pointerout', (e) => {
  console.log('Out:', e.target);
});
```

### gotpointercapture / lostpointercapture

```javascript
// Fires when pointer capture is acquired
element.addEventListener('gotpointercapture', (e) => {
  console.log('Captured pointer:', e.pointerId);
});

// Fires when pointer capture is released
element.addEventListener('lostpointercapture', (e) => {
  console.log('Released pointer:', e.pointerId);
});
```

---

## 3.8.3 Pointer Event Properties

### Basic Properties

```javascript
element.addEventListener('pointerdown', (e) => {
  // Unique identifier for this pointer
  console.log('ID:', e.pointerId);
  
  // Type: "mouse", "touch", or "pen"
  console.log('Type:', e.pointerType);
  
  // Is this the primary pointer?
  console.log('Primary:', e.isPrimary);
  
  // Position (inherited from MouseEvent)
  console.log('Client:', e.clientX, e.clientY);
  console.log('Page:', e.pageX, e.pageY);
  console.log('Screen:', e.screenX, e.screenY);
  
  // Button info (inherited from MouseEvent)
  console.log('Button:', e.button);
  console.log('Buttons:', e.buttons);
});
```

### Pressure and Geometry

```javascript
element.addEventListener('pointermove', (e) => {
  // Pressure (0-1, 0.5 for mouse without pressure)
  console.log('Pressure:', e.pressure);
  
  // Tangential pressure (like airbrush wheel)
  console.log('Tangential:', e.tangentialPressure);
  
  // Contact dimensions
  console.log('Width:', e.width);   // Contact width
  console.log('Height:', e.height); // Contact height
  
  // Pen tilt angles (-90 to 90 degrees)
  console.log('Tilt X:', e.tiltX);
  console.log('Tilt Y:', e.tiltY);
  
  // Pen rotation (0-359 degrees)
  console.log('Twist:', e.twist);
});
```

### Predicted and Coalesced Events

```javascript
// High-frequency moves are coalesced for performance
// getCoalescedEvents() retrieves all intermediate positions

element.addEventListener('pointermove', (e) => {
  // All moves since last event (for smooth drawing)
  const coalesced = e.getCoalescedEvents();
  
  for (const event of coalesced) {
    drawLine(event.clientX, event.clientY);
  }
});

// Predicted future positions (for reduced latency)
element.addEventListener('pointermove', (e) => {
  const predicted = e.getPredictedEvents();
  
  // Draw predicted position with transparency
  for (const event of predicted) {
    drawGhost(event.clientX, event.clientY);
  }
});
```

---

## 3.8.4 Pointer Capture

### What Is Pointer Capture?

```javascript
// Pointer capture redirects all events for a pointer to one element
// Even when pointer moves outside that element

// Without capture: events go to element under pointer
// With capture: events always go to capturing element

// Essential for drag operations
element.addEventListener('pointerdown', (e) => {
  element.setPointerCapture(e.pointerId);
  // Now all pointer events go to this element until release
});
```

### Using Pointer Capture

```javascript
class Draggable {
  constructor(element) {
    this.element = element;
    this.isDragging = false;
    
    element.addEventListener('pointerdown', this.onDown.bind(this));
    element.addEventListener('pointermove', this.onMove.bind(this));
    element.addEventListener('pointerup', this.onUp.bind(this));
    element.addEventListener('pointercancel', this.onUp.bind(this));
  }
  
  onDown(e) {
    this.isDragging = true;
    
    // Capture this pointer
    this.element.setPointerCapture(e.pointerId);
    
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    // Prevent text selection
    e.preventDefault();
  }
  
  onMove(e) {
    if (!this.isDragging) return;
    
    // Events continue even outside element (due to capture)
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    
    this.element.style.transform = `translate(${dx}px, ${dy}px)`;
  }
  
  onUp(e) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Release capture (usually automatic on pointerup)
    this.element.releasePointerCapture(e.pointerId);
  }
}
```

### Checking Capture Status

```javascript
// Check if element has capture for a pointer
const hasCapture = element.hasPointerCapture(pointerId);

// Get capture events
element.addEventListener('gotpointercapture', (e) => {
  console.log('Got capture for:', e.pointerId);
});

element.addEventListener('lostpointercapture', (e) => {
  console.log('Lost capture for:', e.pointerId);
  // Cleanup drag state
});
```

---

## 3.8.5 Touch Action CSS

```css
/* Control how browser handles touch input */

/* Disable all browser handling (full control in JS) */
.custom-control {
  touch-action: none;
}

/* Allow only horizontal panning */
.horizontal-slider {
  touch-action: pan-x;
}

/* Allow only vertical scrolling */
.vertical-list {
  touch-action: pan-y;
}

/* Allow panning but disable zoom */
.map {
  touch-action: pan-x pan-y;
}

/* Allow panning and pinch-zoom (default) */
.normal {
  touch-action: manipulation;
}

/* Default behavior */
.default {
  touch-action: auto;
}
```

```javascript
// touch-action determines which gestures the browser handles
// vs which ones fire pointer events to your code

// touch-action: none → all input goes to your code
// touch-action: auto → browser handles scrolling/zooming first

// Set via JavaScript
element.style.touchAction = 'none';
```

---

## 3.8.6 Common Patterns

### Drawing Application

```javascript
class DrawingCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isDrawing = false;
    
    // Disable browser touch handling
    canvas.style.touchAction = 'none';
    
    canvas.addEventListener('pointerdown', this.startStroke.bind(this));
    canvas.addEventListener('pointermove', this.draw.bind(this));
    canvas.addEventListener('pointerup', this.endStroke.bind(this));
    canvas.addEventListener('pointerleave', this.endStroke.bind(this));
  }
  
  startStroke(e) {
    this.isDrawing = true;
    this.canvas.setPointerCapture(e.pointerId);
    
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
    
    // Set line width based on pressure
    this.ctx.lineWidth = e.pressure * 10 || 2;
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    
    // Use coalesced events for smooth lines
    const events = e.getCoalescedEvents();
    
    for (const point of events) {
      this.ctx.lineTo(point.offsetX, point.offsetY);
      // Vary width with pressure
      this.ctx.lineWidth = point.pressure * 10 || 2;
    }
    
    this.ctx.stroke();
  }
  
  endStroke(e) {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.ctx.closePath();
    }
  }
}
```

### Multi-Touch Support

```javascript
class MultiTouchHandler {
  constructor(element) {
    this.element = element;
    this.activePointers = new Map();
    
    element.style.touchAction = 'none';
    
    element.addEventListener('pointerdown', this.onDown.bind(this));
    element.addEventListener('pointermove', this.onMove.bind(this));
    element.addEventListener('pointerup', this.onUp.bind(this));
    element.addEventListener('pointercancel', this.onUp.bind(this));
  }
  
  onDown(e) {
    this.activePointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      type: e.pointerType
    });
    
    element.setPointerCapture(e.pointerId);
    
    console.log('Active pointers:', this.activePointers.size);
    
    if (this.activePointers.size === 2) {
      this.startPinch();
    }
  }
  
  onMove(e) {
    const pointer = this.activePointers.get(e.pointerId);
    if (!pointer) return;
    
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    
    if (this.activePointers.size === 2) {
      this.handlePinch();
    } else if (this.activePointers.size === 1) {
      this.handleDrag();
    }
  }
  
  onUp(e) {
    this.activePointers.delete(e.pointerId);
    
    if (this.activePointers.size < 2) {
      this.endPinch();
    }
  }
  
  startPinch() {
    const [p1, p2] = [...this.activePointers.values()];
    this.initialDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }
  
  handlePinch() {
    const [p1, p2] = [...this.activePointers.values()];
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const scale = distance / this.initialDistance;
    
    console.log('Pinch scale:', scale);
  }
  
  handleDrag() { /* ... */ }
  endPinch() { /* ... */ }
}
```

### Hover Preview (Pen/Mouse Only)

```javascript
// Show preview for hover-capable devices
element.addEventListener('pointerenter', (e) => {
  // Only mouse and pen support hover
  if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
    showPreview();
  }
});

element.addEventListener('pointerleave', (e) => {
  if (e.pointerType !== 'touch') {
    hidePreview();
  }
});
```

---

## 3.8.7 Migration from Touch/Mouse Events

```javascript
// From touch events:
// touchstart → pointerdown
// touchmove → pointermove
// touchend → pointerup
// touchcancel → pointercancel
// e.touches[0] → e (single property access)
// e.changedTouches[0] → e (single property access)

// From mouse events:
// mousedown → pointerdown
// mousemove → pointermove
// mouseup → pointerup
// mouseenter → pointerenter
// mouseleave → pointerleave

// Key differences:
// 1. Must handle pointercancel (like touchcancel)
// 2. Use pointer capture instead of document listeners
// 3. Set touch-action CSS for proper behavior
// 4. Check pointerType if you need type-specific handling
```

---

## 3.8.8 Browser Support and Polyfills

```javascript
// Check for Pointer Events support
if (window.PointerEvent) {
  element.addEventListener('pointerdown', handler);
} else {
  // Fallback to touch/mouse events
  element.addEventListener('touchstart', handler);
  element.addEventListener('mousedown', handler);
}

// Or use feature detection
const supportsPointerEvents = 'onpointerdown' in window;
```

---

## 3.8.9 Gotchas

```javascript
// ❌ Forgetting touch-action CSS
element.addEventListener('pointermove', (e) => {
  e.preventDefault();  // Won't prevent scrolling!
});

// ✅ Use touch-action CSS
// CSS: touch-action: none;
element.addEventListener('pointermove', handler);

// ❌ Not handling pointercancel
element.addEventListener('pointerup', cleanup);
// Pointer can be cancelled without pointerup!

// ✅ Handle both
element.addEventListener('pointerup', cleanup);
element.addEventListener('pointercancel', cleanup);

// ❌ Using document listeners for drag
document.addEventListener('pointermove', dragHandler);
// Doesn't work well across elements/iframes

// ✅ Use pointer capture
element.setPointerCapture(e.pointerId);
element.addEventListener('pointermove', dragHandler);

// ❌ Assuming primary pointer
// On touch, first finger is primary
// Additional fingers are not primary

// ✅ Track all pointers or check isPrimary
if (e.isPrimary || this.trackAllPointers) {
  handlePointer(e);
}
```

---

## 3.8.10 Summary

### Pointer Events

| Event | When | Equivalent |
|-------|------|------------|
| `pointerdown` | Input begins | mousedown, touchstart |
| `pointermove` | Pointer moves | mousemove, touchmove |
| `pointerup` | Input ends | mouseup, touchend |
| `pointercancel` | Input cancelled | touchcancel |
| `pointerenter` | Enter element | mouseenter |
| `pointerleave` | Leave element | mouseleave |

### Key Properties

| Property | Description |
|----------|-------------|
| `pointerId` | Unique identifier |
| `pointerType` | "mouse", "touch", "pen" |
| `isPrimary` | Primary pointer for this type |
| `pressure` | Input pressure (0-1) |
| `tiltX/tiltY` | Pen tilt angles |
| `width/height` | Contact dimensions |

### Pointer Capture Methods

| Method | Description |
|--------|-------------|
| `setPointerCapture(id)` | Capture pointer events |
| `releasePointerCapture(id)` | Release capture |
| `hasPointerCapture(id)` | Check if capturing |

### Best Practices

1. **Use Pointer Events** instead of separate touch/mouse handlers
2. **Set `touch-action` CSS** to control browser gesture handling
3. **Use pointer capture** for drag operations
4. **Handle `pointercancel`** for proper cleanup
5. **Use `getCoalescedEvents()`** for smooth drawing
6. **Check `pointerType`** only when input-specific behavior needed

---

**End of Chapter 3.8: Pointer Events**

Next chapter: **3.9 Drag and Drop Events** — covers the native drag and drop API with DataTransfer.
