# 3.3 Event Object

Every event handler receives an Event object containing information about what happened. The event object provides details like which element triggered the event, what type of event it was, and methods to control event behavior. Different event types extend the base Event interface with additional properties.

---

## 3.3.1 The Event Interface

All events inherit from the base `Event` interface.

### Creating Events Manually

```javascript
// Create a basic event
const event = new Event('click');
console.log(event.type);  // "click"

// Dispatch it
element.dispatchEvent(event);

// With options
const customEvent = new Event('myevent', {
  bubbles: true,      // Does event bubble? (default: false)
  cancelable: true,   // Can preventDefault()? (default: false)
  composed: true      // Crosses shadow DOM? (default: false)
});
```

---

## 3.3.2 Core Event Properties

### type

```javascript
// The event type as a string
element.addEventListener('click', (e) => {
  console.log(e.type);  // "click"
});

element.addEventListener('keydown', (e) => {
  console.log(e.type);  // "keydown"
});

// Useful when sharing handlers
const handler = (e) => {
  switch (e.type) {
    case 'click':
      handleClick(e);
      break;
    case 'keydown':
      handleKeydown(e);
      break;
  }
};

element.addEventListener('click', handler);
element.addEventListener('keydown', handler);
```

### target

```javascript
// The element that triggered the event
document.addEventListener('click', (e) => {
  console.log('You clicked:', e.target);
  console.log('Tag name:', e.target.tagName);
  console.log('ID:', e.target.id);
  console.log('Classes:', e.target.className);
});

// ⚠️ target can be a child element
parentDiv.addEventListener('click', (e) => {
  console.log(e.target);  // Could be any descendant!
});
```

### currentTarget

```javascript
// The element the handler is attached to
parentDiv.addEventListener('click', (e) => {
  console.log('target:', e.target);        // What was clicked
  console.log('currentTarget:', e.currentTarget);  // parentDiv
  
  // currentTarget is always the element with the listener
  console.log(e.currentTarget === parentDiv);  // true
});

// ⚠️ currentTarget is null after async operations
parentDiv.addEventListener('click', async (e) => {
  console.log(e.currentTarget);  // parentDiv
  
  await fetch('/api');
  
  console.log(e.currentTarget);  // null!
  
  // Solution: save reference
  const target = e.currentTarget;
  await fetch('/api');
  console.log(target);  // parentDiv
});
```

### relatedTarget

```javascript
// Secondary element involved in the event
// Used for: focus, blur, mouseenter, mouseleave, dragenter, dragleave

element.addEventListener('mouseenter', (e) => {
  console.log('Mouse came from:', e.relatedTarget);
});

element.addEventListener('mouseleave', (e) => {
  console.log('Mouse going to:', e.relatedTarget);
});

element.addEventListener('focus', (e) => {
  console.log('Focus came from:', e.relatedTarget);  // Previous focused element
});

element.addEventListener('blur', (e) => {
  console.log('Focus going to:', e.relatedTarget);  // Next focused element
});
```

---

## 3.3.3 Event State Properties

### bubbles

```javascript
// Whether the event bubbles up through the DOM
element.addEventListener('click', (e) => {
  console.log(e.bubbles);  // true
});

element.addEventListener('focus', (e) => {
  console.log(e.bubbles);  // false (focus doesn't bubble)
});

// Check before relying on bubbling
if (event.bubbles) {
  // Safe to use event delegation
}
```

### cancelable

```javascript
// Whether preventDefault() will work
element.addEventListener('click', (e) => {
  console.log(e.cancelable);  // true
});

element.addEventListener('scroll', (e) => {
  console.log(e.cancelable);  // false (scroll not cancelable)
});

// Safe prevention pattern
if (e.cancelable) {
  e.preventDefault();
}
```

### defaultPrevented

```javascript
// Whether preventDefault() was called
link.addEventListener('click', (e) => {
  e.preventDefault();
});

// Check elsewhere
document.addEventListener('click', (e) => {
  if (e.defaultPrevented) {
    console.log('Default was prevented');
  }
});
```

### eventPhase

```javascript
// Which phase the event is in (1, 2, or 3)
element.addEventListener('click', (e) => {
  switch (e.eventPhase) {
    case Event.CAPTURING_PHASE:  // 1
      console.log('Capturing');
      break;
    case Event.AT_TARGET:        // 2
      console.log('At target');
      break;
    case Event.BUBBLING_PHASE:   // 3
      console.log('Bubbling');
      break;
  }
});
```

### isTrusted

```javascript
// True if triggered by user action, false if dispatched by script
element.addEventListener('click', (e) => {
  if (e.isTrusted) {
    console.log('User clicked');
  } else {
    console.log('Simulated click via JavaScript');
  }
});

// Triggered by user: isTrusted = true
// User clicks button

// Triggered by code: isTrusted = false
element.click();
element.dispatchEvent(new Event('click'));

// Security consideration
// Some APIs only work with trusted events
```

---

## 3.3.4 Timing Properties

### timeStamp

```javascript
// Milliseconds since page load (or epoch in older browsers)
element.addEventListener('click', (e) => {
  console.log('Event at:', e.timeStamp);  // e.g., 3451.234
});

// Useful for measuring
let lastClick = 0;
element.addEventListener('click', (e) => {
  const timeSinceLastClick = e.timeStamp - lastClick;
  console.log(`${timeSinceLastClick}ms since last click`);
  lastClick = e.timeStamp;
});

// Double-click detection
let lastClickTime = 0;
element.addEventListener('click', (e) => {
  if (e.timeStamp - lastClickTime < 300) {
    console.log('Double click!');
  }
  lastClickTime = e.timeStamp;
});
```

---

## 3.3.5 Event Methods

### preventDefault()

```javascript
// Stop default browser behavior
link.addEventListener('click', (e) => {
  e.preventDefault();
  // Link won't navigate
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Form won't submit to server
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    // Won't insert newline or submit form
  }
});

// ⚠️ Only works if cancelable is true
// ⚠️ Doesn't stop event propagation
```

### stopPropagation()

```javascript
// Stop event from traveling to other elements
child.addEventListener('click', (e) => {
  e.stopPropagation();
  // Parent handlers won't fire
});

parent.addEventListener('click', (e) => {
  console.log('This will NOT fire if child stops propagation');
});

// ⚠️ Doesn't affect other handlers on same element
element.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('First handler');
});

element.addEventListener('click', (e) => {
  console.log('Second handler still fires!');
});
```

### stopImmediatePropagation()

```javascript
// Stop propagation AND remaining handlers on this element
element.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('First handler');
});

element.addEventListener('click', (e) => {
  console.log('This will NOT fire');
});

parent.addEventListener('click', (e) => {
  console.log('Parent also will NOT fire');
});
```

### composedPath()

```javascript
// Get array of elements event will pass through
element.addEventListener('click', (e) => {
  const path = e.composedPath();
  console.log(path);
  // [button, div, body, html, document, Window]
  
  // First element is the target
  console.log(path[0] === e.target);  // true
  
  // Includes window
  console.log(path[path.length - 1] === window);  // true
});

// Useful for debugging event flow
// Useful for finding ancestors
const hasModalAncestor = e.composedPath().some(el => 
  el.classList?.contains('modal')
);
```

---

## 3.3.6 Specialized Event Types

Different event categories have extended properties.

### MouseEvent

```javascript
// Click, mousedown, mouseup, mousemove, etc.
element.addEventListener('click', (e) => {
  // Position
  console.log(e.clientX, e.clientY);  // Viewport coordinates
  console.log(e.pageX, e.pageY);      // Page coordinates (including scroll)
  console.log(e.screenX, e.screenY);  // Screen coordinates
  console.log(e.offsetX, e.offsetY);  // Relative to target element
  
  // Button pressed
  console.log(e.button);   // 0=left, 1=middle, 2=right
  console.log(e.buttons);  // Bitmask of all buttons currently held
  
  // Modifier keys
  console.log(e.altKey, e.ctrlKey, e.shiftKey, e.metaKey);
});
```

### KeyboardEvent

```javascript
// keydown, keyup
element.addEventListener('keydown', (e) => {
  console.log(e.key);      // "a", "Enter", "ArrowDown"
  console.log(e.code);     // "KeyA", "Enter", "ArrowDown"
  console.log(e.keyCode);  // 65 (deprecated)
  
  // Modifier state
  console.log(e.altKey, e.ctrlKey, e.shiftKey, e.metaKey);
  
  // Repeat (key held down)
  console.log(e.repeat);   // true if auto-repeating
});
```

### InputEvent

```javascript
// input, beforeinput
input.addEventListener('input', (e) => {
  console.log(e.data);       // Characters inserted
  console.log(e.inputType);  // "insertText", "deleteContentBackward", etc.
  console.log(e.isComposing); // true during IME composition
});
```

### FocusEvent

```javascript
// focus, blur, focusin, focusout
input.addEventListener('focus', (e) => {
  console.log(e.relatedTarget);  // Previous focused element
});

input.addEventListener('blur', (e) => {
  console.log(e.relatedTarget);  // Next focused element
});
```

### WheelEvent

```javascript
// wheel (scroll wheel)
element.addEventListener('wheel', (e) => {
  console.log(e.deltaX);     // Horizontal scroll
  console.log(e.deltaY);     // Vertical scroll
  console.log(e.deltaZ);     // Z-axis scroll (rare)
  console.log(e.deltaMode);  // 0=pixels, 1=lines, 2=pages
});
```

### TouchEvent

```javascript
// touchstart, touchmove, touchend, touchcancel
element.addEventListener('touchstart', (e) => {
  console.log(e.touches);        // All current touches
  console.log(e.targetTouches);  // Touches on this element
  console.log(e.changedTouches); // Touches changed in this event
  
  const touch = e.touches[0];
  console.log(touch.clientX, touch.clientY);
  console.log(touch.identifier);  // Unique touch ID
});
```

---

## 3.3.7 Accessing Event Data

### Getting Position

```javascript
element.addEventListener('click', (e) => {
  // Relative to viewport (visible area)
  const viewportX = e.clientX;
  const viewportY = e.clientY;
  
  // Relative to document (includes scroll)
  const documentX = e.pageX;
  const documentY = e.pageY;
  
  // Relative to target element
  const elementX = e.offsetX;
  const elementY = e.offsetY;
  
  // Relative to target element (alternative)
  const rect = e.target.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  const relativeY = e.clientY - rect.top;
});
```

### Getting Modifier Keys

```javascript
element.addEventListener('click', (e) => {
  // Individual checks
  if (e.ctrlKey) console.log('Ctrl held');
  if (e.shiftKey) console.log('Shift held');
  if (e.altKey) console.log('Alt held');
  if (e.metaKey) console.log('Meta (Cmd/Win) held');
  
  // Combinations
  if (e.ctrlKey && e.shiftKey) {
    console.log('Ctrl+Shift+Click');
  }
  
  // Platform-aware (Cmd on Mac, Ctrl elsewhere)
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const modKey = isMac ? e.metaKey : e.ctrlKey;
  
  if (modKey) {
    console.log('Primary modifier key held');
  }
});
```

---

## 3.3.8 Event Properties Summary

### Base Event Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | Event type name |
| `target` | Element | Element that triggered event |
| `currentTarget` | Element | Element with handler attached |
| `relatedTarget` | Element | Secondary element (focus, mouse) |
| `bubbles` | boolean | Does event bubble? |
| `cancelable` | boolean | Can call preventDefault()? |
| `defaultPrevented` | boolean | Was preventDefault() called? |
| `eventPhase` | number | Current phase (1, 2, 3) |
| `isTrusted` | boolean | User-triggered or script? |
| `timeStamp` | number | When event occurred |

### Event Methods

| Method | Description |
|--------|-------------|
| `preventDefault()` | Stop default behavior |
| `stopPropagation()` | Stop traveling to other elements |
| `stopImmediatePropagation()` | Stop all remaining handlers |
| `composedPath()` | Get element path array |

### Best Practices

1. **Always handle null currentTarget** after async operations
2. **Check `cancelable` before `preventDefault()`** for safety
3. **Use `e.target` for delegation**, `e.currentTarget` for the attached element
4. **Check `isTrusted`** for security-sensitive operations
5. **Save event references** if needed after async operations
6. **Use `composedPath()`** for ancestor checking

---

**End of Chapter 3.3: Event Object**

Next chapter: **3.4 Mouse Events** — covers click, double-click, context menu, mouse movement, and mouse button handling.
