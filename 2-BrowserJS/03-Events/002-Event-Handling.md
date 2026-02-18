# 3.2 Event Handling

Event handling is how you connect JavaScript code to events. This chapter covers all the ways to attach, configure, and remove event handlers — from modern `addEventListener` with its rich options to legacy patterns you'll still encounter in older codebases.

---

## 3.2.1 addEventListener

The modern, preferred way to attach event handlers.

### Basic Syntax

```javascript
// addEventListener(type, listener)
// addEventListener(type, listener, options)
// addEventListener(type, listener, useCapture)

element.addEventListener('click', function(event) {
  console.log('Element clicked');
});

// Named function
function handleClick(event) {
  console.log('Clicked!');
}
element.addEventListener('click', handleClick);

// Arrow function
element.addEventListener('click', (e) => {
  console.log('Arrow handler', e.target);
});
```

### Multiple Handlers

```javascript
// You can add multiple handlers for the same event
element.addEventListener('click', handler1);
element.addEventListener('click', handler2);
element.addEventListener('click', handler3);

// All three will fire in registration order
// Click → handler1 → handler2 → handler3

// Same handler added twice is ignored (by reference)
element.addEventListener('click', handleClick);
element.addEventListener('click', handleClick);  // Ignored, same reference

// But different functions are both added
element.addEventListener('click', () => console.log('first'));
element.addEventListener('click', () => console.log('second'));
// Both fire (different arrow function references)
```

### Handler Types

```javascript
// 1. Regular function
element.addEventListener('click', function(e) {
  console.log(this);  // the element
  console.log(e);     // the event
});

// 2. Arrow function
element.addEventListener('click', (e) => {
  console.log(this);  // outer scope (not element!)
  console.log(e);     // the event
});

// 3. Named function (for removal)
function myHandler(e) {
  console.log('Handled');
}
element.addEventListener('click', myHandler);

// 4. Object with handleEvent method
const handler = {
  handleEvent(e) {
    console.log('Handled by object');
    console.log(this);  // the handler object
  }
};
element.addEventListener('click', handler);
```

---

## 3.2.2 Handler Options

The third parameter can be a boolean or an options object.

### capture Option

```javascript
// Boolean shorthand
element.addEventListener('click', handler, true);   // Capture phase
element.addEventListener('click', handler, false);  // Bubble phase (default)

// Options object
element.addEventListener('click', handler, {
  capture: true  // Run during capture phase
});
```

### once Option

```javascript
// Handler fires only once, then auto-removes
element.addEventListener('click', handler, {
  once: true
});

// Equivalent to:
function onceHandler(e) {
  element.removeEventListener('click', onceHandler);
  handler(e);
}
element.addEventListener('click', onceHandler);

// Practical use cases:
// - First interaction tracking
// - Modal first open
// - Animation end cleanup
button.addEventListener('click', () => {
  console.log('This only fires once');
}, { once: true });
```

### passive Option

```javascript
// Promise not to call preventDefault()
// Allows browser to optimize (especially for scroll)
element.addEventListener('scroll', handler, {
  passive: true
});

// Touch events benefit most from passive
element.addEventListener('touchstart', handler, {
  passive: true
});

// If you try to preventDefault in a passive handler:
element.addEventListener('touchstart', (e) => {
  e.preventDefault();  // Warning! Ignored in passive handler
}, { passive: true });

// ⚠️ Some browsers default to passive for touch/wheel
// To explicitly allow preventDefault:
element.addEventListener('touchmove', (e) => {
  e.preventDefault();  // Works
}, { passive: false });
```

### signal Option (AbortController)

```javascript
// Remove listener via AbortController
const controller = new AbortController();

element.addEventListener('click', handler, {
  signal: controller.signal
});

// Later: remove the handler
controller.abort();

// Useful for cleanup
class Component {
  constructor() {
    this.abortController = new AbortController();
  }
  
  mount() {
    window.addEventListener('resize', this.handleResize, {
      signal: this.abortController.signal
    });
    document.addEventListener('click', this.handleClick, {
      signal: this.abortController.signal
    });
  }
  
  unmount() {
    // Remove all listeners at once
    this.abortController.abort();
  }
  
  handleResize = () => { /* ... */ };
  handleClick = () => { /* ... */ };
}
```

### Combining Options

```javascript
// Multiple options together
element.addEventListener('touchstart', handler, {
  capture: true,
  once: true,
  passive: true,
  signal: controller.signal
});
```

---

## 3.2.3 removeEventListener

Remove previously added event handlers.

### Basic Removal

```javascript
// Must use same function reference
function handleClick(e) {
  console.log('Clicked');
}

// Add
element.addEventListener('click', handleClick);

// Remove
element.removeEventListener('click', handleClick);

// ❌ This doesn't work (different function reference)
element.addEventListener('click', function(e) { console.log('hi'); });
element.removeEventListener('click', function(e) { console.log('hi'); });
// The anonymous functions are different objects!
```

### Options Must Match

```javascript
// If you used capture option when adding, must use it when removing
element.addEventListener('click', handler, true);
element.removeEventListener('click', handler, true);  // ✅ Works
element.removeEventListener('click', handler, false); // ❌ Doesn't work

element.addEventListener('click', handler, { capture: true });
element.removeEventListener('click', handler, { capture: true });  // ✅ Works

// once and passive don't matter for removal matching
element.addEventListener('click', handler, { once: true });
element.removeEventListener('click', handler);  // ✅ Works (capture defaults false)
```

### Patterns for Removable Handlers

```javascript
// Pattern 1: Named function
function onScroll() { /* ... */ }
window.addEventListener('scroll', onScroll);
window.removeEventListener('scroll', onScroll);

// Pattern 2: Store reference
const handler = (e) => console.log(e);
element.addEventListener('click', handler);
element.removeEventListener('click', handler);

// Pattern 3: Method binding
class MyClass {
  constructor() {
    this.boundHandler = this.handleClick.bind(this);
  }
  
  attach() {
    element.addEventListener('click', this.boundHandler);
  }
  
  detach() {
    element.removeEventListener('click', this.boundHandler);
  }
  
  handleClick(e) {
    console.log(this);  // MyClass instance
  }
}

// Pattern 4: Arrow function as class property
class MyClass2 {
  handleClick = (e) => {
    console.log(this);  // MyClass2 instance
  }
  
  attach() {
    element.addEventListener('click', this.handleClick);
  }
  
  detach() {
    element.removeEventListener('click', this.handleClick);
  }
}

// Pattern 5: AbortController (best for multiple listeners)
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
// Later:
controller.abort();  // No need to track function reference
```

---

## 3.2.4 Legacy Event Handling

Older patterns you'll encounter in existing code.

### Handler Properties (on* Properties)

```javascript
// Set handler as property
element.onclick = function(e) {
  console.log('Clicked');
};

// Overwriting replaces previous handler
element.onclick = function(e) {
  console.log('New handler');
};
// Only "New handler" fires on click

// Remove handler
element.onclick = null;

// Common handler properties:
element.onclick
element.ondblclick
element.onmouseenter
element.onmouseleave
element.onkeydown
element.onkeyup
element.onfocus
element.onblur
element.onsubmit
element.onchange
window.onload
window.onresize
document.onreadystatechange
```

### Inline HTML Handlers

```html
<!-- Handler in HTML attribute -->
<button onclick="handleClick()">Click</button>
<button onclick="console.log('clicked')">Click</button>
<button onclick="handleClick(event)">Click</button>

<!-- Access element with 'this' -->
<button onclick="handleClick(this)">Click</button>

<!-- Multiple statements -->
<button onclick="first(); second(); third();">Click</button>
```

```javascript
// The inline handler is wrapped in a function:
// function onclick(event) {
//   handleClick()
// }

// 'event' is available
// <button onclick="console.log(event.target)">

// ❌ Inline handlers have drawbacks:
// - Mix HTML and JS
// - Global scope only (or use modules workaround)
// - Security (CSP may block)
// - Harder to maintain
```

### Why Prefer addEventListener

```javascript
// addEventListener advantages over onclick and inline:

// 1. Multiple handlers
element.addEventListener('click', handler1);
element.addEventListener('click', handler2);  // Both work

element.onclick = handler1;
element.onclick = handler2;  // Only handler2 works

// 2. Options (capture, once, passive)
element.addEventListener('click', handler, { once: true });
// Not possible with onclick

// 3. Removal control
element.removeEventListener('click', handler);
// More precise than element.onclick = null

// 4. Works on any EventTarget
// addEventListener works on window, document, elements, etc.
// onclick only on elements with that property

// 5. Capture phase access
element.addEventListener('click', handler, true);  // Capture
// Not possible with onclick
```

---

## 3.2.5 Event Handler Context (this)

What `this` refers to inside event handlers.

### In Regular Functions

```javascript
// 'this' is the element the handler is attached to
element.addEventListener('click', function(e) {
  console.log(this);               // element
  console.log(e.currentTarget);    // element (same)
  console.log(this === e.currentTarget);  // true
});

// Same for onclick
element.onclick = function(e) {
  console.log(this);  // element
};
```

### In Arrow Functions

```javascript
// 'this' is inherited from surrounding scope
element.addEventListener('click', (e) => {
  console.log(this);  // Window (or containing scope)
  console.log(e.currentTarget);  // element (use this instead!)
});

// In a class
class Component {
  constructor() {
    // Arrow function captures 'this' from constructor
    element.addEventListener('click', (e) => {
      console.log(this);  // Component instance
      this.handleClick(e);
    });
  }
}
```

### Method Binding

```javascript
class Component {
  constructor() {
    // Problem: unbound method
    element.addEventListener('click', this.handleClick);
    // 'this' in handleClick will be undefined or element!
  }
  
  handleClick(e) {
    console.log(this);  // undefined in strict mode, or element
  }
}

// Solution 1: bind in constructor
class Component2 {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    element.addEventListener('click', this.handleClick);
  }
  
  handleClick(e) {
    console.log(this);  // Component2 instance ✅
  }
}

// Solution 2: Arrow function property
class Component3 {
  handleClick = (e) => {
    console.log(this);  // Component3 instance ✅
  }
  
  constructor() {
    element.addEventListener('click', this.handleClick);
  }
}

// Solution 3: Wrapper arrow function
class Component4 {
  constructor() {
    element.addEventListener('click', (e) => this.handleClick(e));
  }
  
  handleClick(e) {
    console.log(this);  // Component4 instance ✅
  }
}
```

### handleEvent Object Method

```javascript
// Object with handleEvent method
const handler = {
  count: 0,
  
  handleEvent(e) {
    console.log(this);  // The handler object
    this.count++;
    console.log(`Clicked ${this.count} times`);
  }
};

element.addEventListener('click', handler);

// 'this' in handleEvent is the object, not the element
// Access element via e.target or e.currentTarget
```

---

## 3.2.6 Common Patterns

### Debouncing Events

```javascript
// Delay handler until events stop
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleResize = debounce(() => {
  console.log('Resize finished');
}, 250);

window.addEventListener('resize', handleResize);
```

### Throttling Events

```javascript
// Limit handler to once per interval
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);
```

### One-Time Setup

```javascript
// Using once option
element.addEventListener('click', () => {
  console.log('First click - initializing');
  setupComplexFeature();
}, { once: true });

// Manual removal pattern
function initialize(e) {
  element.removeEventListener('click', initialize);
  setupComplexFeature();
}
element.addEventListener('click', initialize);
```

### Cleanup on Page Unload

```javascript
const controller = new AbortController();

function setupListeners() {
  const options = { signal: controller.signal };
  
  window.addEventListener('resize', handleResize, options);
  document.addEventListener('click', handleClick, options);
  element.addEventListener('mousemove', handleMouseMove, options);
}

// Cleanup all at once
window.addEventListener('beforeunload', () => {
  controller.abort();
});
```

---

## 3.2.7 Summary

| Method | Multiple Handlers | Options | Removal |
|--------|-------------------|---------|---------|
| `addEventListener` | ✅ Yes | ✅ capture, once, passive, signal | `removeEventListener` |
| `on*` property | ❌ No | ❌ None | `= null` |
| Inline HTML | ❌ No | ❌ None | Remove attribute |

### addEventListener Options

| Option | Purpose | Default |
|--------|---------|---------|
| `capture` | Run during capture phase | `false` |
| `once` | Auto-remove after first call | `false` |
| `passive` | Promise not to preventDefault | varies |
| `signal` | AbortSignal for removal | - |

### Best Practices

1. **Always use `addEventListener`** — most flexible and powerful
2. **Use named functions** when you need to remove handlers
3. **Use `once: true`** for one-time handlers
4. **Use `passive: true`** for scroll/touch handlers when possible
5. **Use `AbortController`** for cleanup in components
6. **Be careful with `this`** — bind methods or use arrow functions
7. **Debounce/throttle** frequent events (resize, scroll, input)

### Common Gotchas

```javascript
// ❌ Can't remove anonymous functions
element.addEventListener('click', () => console.log('hi'));
element.removeEventListener('click', () => console.log('hi'));  // Different function!

// ❌ Forgot to bind 'this'
element.addEventListener('click', this.method);  // 'this' is wrong

// ❌ Capture option must match for removal
element.addEventListener('click', handler, true);
element.removeEventListener('click', handler);  // Doesn't match!

// ❌ preventDefault in passive handler is ignored
element.addEventListener('scroll', (e) => e.preventDefault(), { passive: true });
```

---

**End of Chapter 3.2: Event Handling**

Next chapter: **3.3 Event Object** — covers event properties like `target`, `type`, `timeStamp`, and methods like `preventDefault` and `stopPropagation`.
