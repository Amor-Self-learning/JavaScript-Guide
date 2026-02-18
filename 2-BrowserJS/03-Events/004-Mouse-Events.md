# 3.4 Mouse Events

Mouse events are among the most commonly used events in web applications. From simple clicks to complex drag interactions, understanding mouse events enables you to build intuitive, interactive interfaces. This chapter covers all mouse event types, their properties, and common patterns.

---

## 3.4.1 Click Events

### click

```javascript
// Fires when element is clicked (mousedown + mouseup on same element)
element.addEventListener('click', (e) => {
  console.log('Clicked!');
  console.log('Button:', e.button);  // 0 = left click
});

// Click fires AFTER mouseup
element.addEventListener('mousedown', () => console.log('1. mousedown'));
element.addEventListener('mouseup', () => console.log('2. mouseup'));
element.addEventListener('click', () => console.log('3. click'));

// Output: 1. mousedown, 2. mouseup, 3. click
```

### dblclick

```javascript
// Fires on double-click
element.addEventListener('dblclick', (e) => {
  console.log('Double-clicked!');
});

// Event order for double-click:
// mousedown → mouseup → click → mousedown → mouseup → click → dblclick

// ⚠️ If you handle both click and dblclick, click fires first
element.addEventListener('click', () => console.log('click'));
element.addEventListener('dblclick', () => console.log('dblclick'));
// Double-click outputs: click, click, dblclick

// Pattern: Distinguish click from double-click
let clickTimer;
element.addEventListener('click', (e) => {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    // This was a double-click, ignore
    return;
  }
  
  clickTimer = setTimeout(() => {
    clickTimer = null;
    handleSingleClick(e);
  }, 250);
});

element.addEventListener('dblclick', (e) => {
  handleDoubleClick(e);
});
```

### auxclick

```javascript
// Fires for non-primary button clicks (middle, right)
element.addEventListener('auxclick', (e) => {
  console.log('Non-primary click, button:', e.button);
  // 1 = middle, 2 = right
});

// More reliable than checking button in click event
// click only fires for primary button (usually)
```

### contextmenu

```javascript
// Fires on right-click (or context menu key)
element.addEventListener('contextmenu', (e) => {
  e.preventDefault();  // Prevent browser context menu
  showCustomContextMenu(e.clientX, e.clientY);
});

// Works on any element
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.no-context-menu')) {
    e.preventDefault();
  }
});
```

---

## 3.4.2 Mouse Button Events

### mousedown

```javascript
// Fires when mouse button is pressed (before release)
element.addEventListener('mousedown', (e) => {
  console.log('Button pressed:', e.button);
  // 0 = left, 1 = middle, 2 = right, 3 = back, 4 = forward
  
  console.log('Buttons held:', e.buttons);
  // Bitmask: 1 = left, 2 = right, 4 = middle
});

// Start tracking for drag
let isDragging = false;
element.addEventListener('mousedown', (e) => {
  if (e.button === 0) {  // Left button only
    isDragging = true;
    startDrag(e);
  }
});
```

### mouseup

```javascript
// Fires when mouse button is released
element.addEventListener('mouseup', (e) => {
  console.log('Button released:', e.button);
});

// End tracking
document.addEventListener('mouseup', (e) => {
  if (isDragging) {
    isDragging = false;
    endDrag(e);
  }
});
```

### Button Values

| e.button | e.buttons (bitmask) | Meaning |
|----------|---------------------|---------|
| 0 | 1 | Primary (usually left) |
| 1 | 4 | Middle (scroll wheel) |
| 2 | 2 | Secondary (usually right) |
| 3 | 8 | Back button |
| 4 | 16 | Forward button |

```javascript
// Check multiple buttons held
element.addEventListener('mousemove', (e) => {
  if (e.buttons & 1) console.log('Left held');
  if (e.buttons & 2) console.log('Right held');
  if (e.buttons & 4) console.log('Middle held');
  
  // Both left and right
  if ((e.buttons & 1) && (e.buttons & 2)) {
    console.log('Left and right held');
  }
});
```

---

## 3.4.3 Mouse Movement Events

### mousemove

```javascript
// Fires when mouse moves over element
element.addEventListener('mousemove', (e) => {
  console.log(`Position: ${e.clientX}, ${e.clientY}`);
});

// ⚠️ Fires very frequently - throttle for performance
const throttledMove = throttle((e) => {
  updatePosition(e.clientX, e.clientY);
}, 16);  // ~60fps

element.addEventListener('mousemove', throttledMove);

// Custom cursor following
document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});
```

### mouseenter and mouseleave

```javascript
// mouseenter: mouse enters element (doesn't bubble)
element.addEventListener('mouseenter', (e) => {
  console.log('Mouse entered element');
  element.classList.add('hover');
});

// mouseleave: mouse leaves element (doesn't bubble)
element.addEventListener('mouseleave', (e) => {
  console.log('Mouse left element');
  element.classList.remove('hover');
});

// Key characteristic: doesn't fire for children
// <div id="parent">
//   <span id="child">Text</span>
// </div>

parent.addEventListener('mouseenter', () => {
  console.log('Entered parent');
});
// Only fires when entering parent from outside
// NOT when moving from parent to child
```

### mouseover and mouseout

```javascript
// mouseover: mouse enters element OR any descendant (bubbles)
element.addEventListener('mouseover', (e) => {
  console.log('Over:', e.target);
  console.log('From:', e.relatedTarget);
});

// mouseout: mouse leaves element OR moves to descendant (bubbles)
element.addEventListener('mouseout', (e) => {
  console.log('Left:', e.target);
  console.log('To:', e.relatedTarget);
});

// Fires for EVERY child element entered/left
// <div id="parent">
//   <span>One</span>
//   <span>Two</span>
// </div>

parent.addEventListener('mouseover', () => console.log('over'));
// Fires when entering parent, then again for each span
```

### Comparison: enter/leave vs over/out

| Feature | mouseenter/leave | mouseover/out |
|---------|------------------|---------------|
| Bubbles | No | Yes |
| Child elements | Ignored | Fire events |
| Use case | Simple hover | Delegation |

```javascript
// For simple hover effects, use enter/leave
element.addEventListener('mouseenter', showTooltip);
element.addEventListener('mouseleave', hideTooltip);

// For delegated hover detection, use over/out
list.addEventListener('mouseover', (e) => {
  const item = e.target.closest('li');
  if (item) highlightItem(item);
});
```

---

## 3.4.4 Position Properties

### Client, Page, Screen, and Offset Coordinates

```javascript
element.addEventListener('mousemove', (e) => {
  // CLIENT: Relative to viewport (visible area)
  console.log('clientX:', e.clientX);  // Pixels from left of viewport
  console.log('clientY:', e.clientY);  // Pixels from top of viewport
  
  // PAGE: Relative to document (includes scroll)
  console.log('pageX:', e.pageX);  // clientX + scrollX
  console.log('pageY:', e.pageY);  // clientY + scrollY
  
  // SCREEN: Relative to physical screen
  console.log('screenX:', e.screenX);  // Pixels from left of screen
  console.log('screenY:', e.screenY);  // Pixels from top of screen
  
  // OFFSET: Relative to target element
  console.log('offsetX:', e.offsetX);  // Pixels from left of e.target
  console.log('offsetY:', e.offsetY);  // Pixels from top of e.target
});
```

### Visual Representation

```
┌─────────────────────────────────────────────────────┐
│ SCREEN (screenX, screenY from here)                │
│  ┌───────────────────────────────────────────────┐ │
│  │ BROWSER WINDOW                                │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │ VIEWPORT (clientX, clientY from here)   │ │ │
│  │  │                                         │ │ │
│  │  │    ┌─────────────────────────────────┐ │ │ │
│  │  │    │ DOCUMENT (pageX, pageY from     │ │ │ │
│  │  │    │    document start, may be       │ │ │ │
│  │  │    │    scrolled)                    │ │ │ │
│  │  │    │    ┌────────────────────────┐  │ │ │ │
│  │  │    │    │ ELEMENT               │  │ │ │ │
│  │  │    │    │ (offsetX, offsetY     │  │ │ │ │
│  │  │    │    │  from element corner) │  │ │ │ │
│  │  │    │    └────────────────────────┘  │ │ │ │
│  │  │    └─────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Calculating Positions

```javascript
// Element-relative from client coordinates
element.addEventListener('click', (e) => {
  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  console.log(`Click at (${x}, ${y}) within element`);
});

// Percentage position within element
element.addEventListener('mousemove', (e) => {
  const rect = element.getBoundingClientRect();
  const percentX = (e.clientX - rect.left) / rect.width * 100;
  const percentY = (e.clientY - rect.top) / rect.height * 100;
  console.log(`Position: ${percentX.toFixed(1)}% x ${percentY.toFixed(1)}%`);
});
```

---

## 3.4.5 Wheel Events

### wheel

```javascript
// Fires when scroll wheel is used
element.addEventListener('wheel', (e) => {
  console.log('deltaX:', e.deltaX);  // Horizontal scroll
  console.log('deltaY:', e.deltaY);  // Vertical scroll (most common)
  console.log('deltaZ:', e.deltaZ);  // Z-axis (rare)
  console.log('deltaMode:', e.deltaMode);
  // 0 = pixels, 1 = lines, 2 = pages
});

// Prevent scroll
element.addEventListener('wheel', (e) => {
  e.preventDefault();  // Block scrolling
}, { passive: false });  // Must be non-passive to prevent

// Custom zoom with wheel
element.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    currentZoom = Math.max(0.1, Math.min(5, currentZoom + zoomDelta));
    applyZoom(currentZoom);
  }
}, { passive: false });
```

### Normalize Wheel Delta

```javascript
// Different browsers/devices report different delta values
function normalizeWheel(e) {
  let deltaY = e.deltaY;
  
  // Normalize to pixels
  if (e.deltaMode === 1) {
    deltaY *= 16;  // Lines to pixels
  } else if (e.deltaMode === 2) {
    deltaY *= 100;  // Pages to pixels
  }
  
  return deltaY;
}
```

---

## 3.4.6 Common Patterns

### Drag and Drop (Basic)

```javascript
let isDragging = false;
let startX, startY;
let elementStartX, elementStartY;

element.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;  // Left button only
  
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  elementStartX = element.offsetLeft;
  elementStartY = element.offsetTop;
  
  e.preventDefault();  // Prevent text selection
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  
  element.style.left = `${elementStartX + deltaX}px`;
  element.style.top = `${elementStartY + deltaY}px`;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});
```

### Click Outside to Close

```javascript
// Close dropdown/modal when clicking outside
function setupClickOutside(element, onClickOutside) {
  const handler = (e) => {
    if (!element.contains(e.target)) {
      onClickOutside();
    }
  };
  
  // Delay to prevent immediate trigger
  setTimeout(() => {
    document.addEventListener('click', handler);
  }, 0);
  
  return () => document.removeEventListener('click', handler);
}

// Usage
const cleanup = setupClickOutside(dropdown, () => {
  dropdown.classList.remove('open');
  cleanup();
});
```

### Hover with Delay

```javascript
// Show tooltip after hovering for 500ms
let hoverTimeout;

element.addEventListener('mouseenter', () => {
  hoverTimeout = setTimeout(() => {
    showTooltip();
  }, 500);
});

element.addEventListener('mouseleave', () => {
  clearTimeout(hoverTimeout);
  hideTooltip();
});
```

### Drawing on Canvas

```javascript
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});
```

---

## 3.4.7 Summary

### Mouse Events

| Event | Fires When |
|-------|------------|
| `click` | Left button pressed and released |
| `dblclick` | Double click |
| `auxclick` | Non-primary button click |
| `contextmenu` | Right-click / context menu |
| `mousedown` | Any button pressed |
| `mouseup` | Any button released |
| `mousemove` | Mouse moves over element |
| `mouseenter` | Mouse enters element (no bubble) |
| `mouseleave` | Mouse leaves element (no bubble) |
| `mouseover` | Mouse enters element (bubbles) |
| `mouseout` | Mouse leaves element (bubbles) |
| `wheel` | Scroll wheel rotated |

### Position Properties

| Property | Relative To |
|----------|-------------|
| `clientX/Y` | Viewport |
| `pageX/Y` | Document |
| `screenX/Y` | Screen |
| `offsetX/Y` | Target element |

### Best Practices

1. **Use `mouseenter/leave`** for simple hover effects
2. **Use `mouseover/out`** for event delegation
3. **Throttle `mousemove`** handlers for performance
4. **Attach move/up to document** for drag operations
5. **Check `e.button`** to handle specific buttons
6. **Use `{ passive: false }`** when calling preventDefault on wheel

---

**End of Chapter 3.4: Mouse Events**

Next chapter: **3.5 Keyboard Events** — covers keydown, keyup, key identification, shortcuts, and input handling.
