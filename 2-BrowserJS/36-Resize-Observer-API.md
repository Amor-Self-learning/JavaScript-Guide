# 36.1 Element Size Changes

The ResizeObserver API detects element size changes, enabling responsive components and dynamic layouts.

---

## 36.1.1 Basic Usage

### Create Observer

```javascript
const observer = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    console.log('Element:', entry.target);
    console.log('Width:', entry.contentRect.width);
    console.log('Height:', entry.contentRect.height);
  });
});

// Observe element
observer.observe(document.querySelector('.resizable'));
```

---

## 36.1.2 Entry Properties

### ResizeObserverEntry

```javascript
const observer = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    // Content box (without padding)
    const contentRect = entry.contentRect;
    console.log(contentRect.width, contentRect.height);
    
    // Border box (including padding and border)
    const borderBox = entry.borderBoxSize[0];
    console.log(borderBox.inlineSize, borderBox.blockSize);
    
    // Content box size array
    const contentBox = entry.contentBoxSize[0];
    console.log(contentBox.inlineSize, contentBox.blockSize);
    
    // Device pixel content box
    const devicePixelBox = entry.devicePixelContentBoxSize?.[0];
  });
});
```

---

## 36.1.3 Box Options

### Specify Box Model

```javascript
observer.observe(element, {
  box: 'content-box'  // Default
});

observer.observe(element, {
  box: 'border-box'   // Include padding/border
});

observer.observe(element, {
  box: 'device-pixel-content-box'  // Device pixels
});
```

---

## 36.1.4 Stop Observing

### Unobserve

```javascript
// Stop one element
observer.unobserve(element);

// Stop all
observer.disconnect();
```

---

## 36.1.5 Responsive Components

### Adapt to Size

```javascript
function makeResponsive(element) {
  const observer = new ResizeObserver((entries) => {
    const { width } = entries[0].contentRect;
    
    element.classList.remove('small', 'medium', 'large');
    
    if (width < 400) {
      element.classList.add('small');
    } else if (width < 800) {
      element.classList.add('medium');
    } else {
      element.classList.add('large');
    }
  });
  
  observer.observe(element);
  return observer;
}
```

---

## 36.1.6 Canvas Resize

### Handle Canvas Sizing

```javascript
function setupCanvas(canvas) {
  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    
    // Set canvas resolution
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    
    // Scale for CSS pixels
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Redraw
    draw();
  });
  
  observer.observe(canvas);
}
```

---

## 36.1.7 Complete Example

### Resize Manager

```javascript
class ResizeManager {
  constructor() {
    this.callbacks = new Map();
    
    this.observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const callback = this.callbacks.get(entry.target);
        if (callback) {
          callback({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            target: entry.target
          });
        }
      });
    });
  }
  
  observe(element, callback) {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
    return this;
  }
  
  unobserve(element) {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
    return this;
  }
  
  destroy() {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}

// Usage
const resizer = new ResizeManager();

resizer.observe(container, ({ width, height }) => {
  console.log('Size changed:', width, height);
  updateLayout(width, height);
});
```

---

## 36.1.8 Summary

### Constructor

```javascript
new ResizeObserver(callback)
```

### Methods

| Method | Description |
|--------|-------------|
| `observe(element, options)` | Start observing |
| `unobserve(element)` | Stop observing |
| `disconnect()` | Stop all |

### Entry Properties

| Property | Description |
|----------|-------------|
| `target` | Observed element |
| `contentRect` | Content box DOMRect |
| `borderBoxSize` | Border box sizes |
| `contentBoxSize` | Content box sizes |

### Box Options

| Value | Description |
|-------|-------------|
| `content-box` | Content only (default) |
| `border-box` | With padding/border |
| `device-pixel-content-box` | Device pixels |

### Best Practices

1. **Debounce** if doing expensive work
2. **Use contentRect** for simple cases
3. **Use borderBoxSize** for precise layouts
4. **Disconnect** when no longer needed
5. **Handle initial size** — callback fires immediately

---

**End of Chapter 36.1: Element Size Changes**

This completes Group 36 — Resize Observer API. Next: **Group 37 — Performance APIs**.
