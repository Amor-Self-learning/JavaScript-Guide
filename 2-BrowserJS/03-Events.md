# 3.1 Event Fundamentals

Events are the heartbeat of interactive web applications. They represent things that happen in the browser — user actions, system notifications, and DOM changes. Understanding how events work, flow through the DOM, and can be controlled is fundamental to building responsive, interactive interfaces.

This chapter covers the event model itself — how events propagate, what happens at each phase, and how the browser processes event flow.

---

## 3.1.1 What Are Events?

Events are objects that represent occurrences in the browser. They can be triggered by user actions, browser activities, or programmatically.

### Types of Events

```javascript
// User interaction events
// - click, dblclick, contextmenu
// - mousedown, mouseup, mousemove
// - keydown, keyup
// - focus, blur
// - submit, change, input

// Browser/system events
// - load, DOMContentLoaded
// - resize, scroll
// - online, offline
// - visibilitychange

// DOM mutation events (legacy)
// - DOMNodeInserted, DOMNodeRemoved (deprecated)
// Modern alternative: MutationObserver

// Custom events
// - Any event you define
```

### Event-Driven Programming

```javascript
// Instead of polling (checking repeatedly):
// ❌ Inefficient
setInterval(() => {
  if (button.isClicked) {
    handleClick();
  }
}, 100);

// ✅ Event-driven (react when it happens)
button.addEventListener('click', handleClick);

// Benefits:
// - Efficient (browser notifies you)
// - Responsive (immediate reaction)
// - Decoupled (separation of concerns)
```

---

## 3.1.2 Event Flow: The Three Phases

When an event occurs on an element, it travels through the DOM in three phases.

### Phase 1: Capturing (or Capture)

```javascript
// Event travels DOWN from window to target element
// window → document → html → body → ... → target

// Register for capture phase
element.addEventListener('click', handler, true);
// or
element.addEventListener('click', handler, { capture: true });
```

### Phase 2: Target

```javascript
// Event reaches the element that triggered it
// The handler on the target element fires

// Both capture and bubble handlers on target fire here
// Order depends on registration order
```

### Phase 3: Bubbling

```javascript
// Event travels UP from target back to window
// target → ... → body → html → document → window

// Default event registration is for bubbling phase
element.addEventListener('click', handler);  // Bubbling
element.addEventListener('click', handler, false);  // Explicit bubbling
```

### Visual Representation

```
        CAPTURING PHASE                    BUBBLING PHASE
              │                                  ▲
              ▼                                  │
         ┌─────────────────────────────────────────┐
         │  window                                 │
         │  ┌─────────────────────────────────────┐│
         │  │  document                           ││
         │  │  ┌─────────────────────────────────┐││
         │  │  │  <html>                         │││
         │  │  │  ┌─────────────────────────────┐│││
         │  │  │  │  <body>                     ││││
         │  │  │  │  ┌─────────────────────────┐││││
         │  │  │  │  │  <div>                  │││││
         │  │  │  │  │  ┌─────────────────────┐│││││
         │  │  │  │  │  │  <button> ← TARGET  ││││││
         │  │  │  │  │  └─────────────────────┘│││││
         │  │  │  │  └─────────────────────────┘││││
         │  │  │  └─────────────────────────────┘│││
         │  │  └─────────────────────────────────┘││
         │  └─────────────────────────────────────┘│
         └─────────────────────────────────────────┘
```

### Demonstrating Event Flow

```javascript
const button = document.querySelector('button');
const div = document.querySelector('div');
const body = document.body;

// Capture phase handlers
body.addEventListener('click', () => console.log('1. body capture'), true);
div.addEventListener('click', () => console.log('2. div capture'), true);
button.addEventListener('click', () => console.log('3. button capture'), true);

// Bubble phase handlers
button.addEventListener('click', () => console.log('4. button bubble'));
div.addEventListener('click', () => console.log('5. div bubble'));
body.addEventListener('click', () => console.log('6. body bubble'));

// Click on button outputs:
// 1. body capture
// 2. div capture
// 3. button capture
// 4. button bubble
// 5. div bubble
// 6. body bubble
```

---

## 3.1.3 Event Bubbling

Most events bubble up through the DOM tree after reaching the target.

### How Bubbling Works

```javascript
// HTML:
// <div id="outer">
//   <div id="inner">
//     <button>Click me</button>
//   </div>
// </div>

document.getElementById('outer').addEventListener('click', (e) => {
  console.log('outer clicked, target:', e.target.tagName);
});

document.getElementById('inner').addEventListener('click', (e) => {
  console.log('inner clicked, target:', e.target.tagName);
});

// Click on button:
// inner clicked, target: BUTTON
// outer clicked, target: BUTTON
// (Both handlers fire, target is always the original element)
```

### Events That Don't Bubble

```javascript
// Some events don't bubble (check event.bubbles property)
// - focus, blur (use focusin, focusout for bubbling versions)
// - mouseenter, mouseleave (use mouseover, mouseout for bubbling)
// - load, unload, abort, error (on elements)
// - scroll (doesn't bubble from most elements)

element.addEventListener('blur', handler);  // Doesn't bubble
element.addEventListener('focusout', handler);  // Bubbles!

element.addEventListener('mouseenter', handler);  // Doesn't bubble
element.addEventListener('mouseover', handler);  // Bubbles!
```

### Checking If Event Bubbles

```javascript
element.addEventListener('click', (event) => {
  console.log('Does this event bubble?', event.bubbles);  // true
});

element.addEventListener('focus', (event) => {
  console.log('Does this event bubble?', event.bubbles);  // false
});
```

---

## 3.1.4 Event Capturing

The capture phase happens before bubbling and travels in the opposite direction.

### Why Use Capture?

```javascript
// Capture is useful for:
// 1. Intercepting events before they reach target
// 2. Implementing certain UI patterns
// 3. Event delegation on non-bubbling events

// Example: Global click handler that runs FIRST
document.addEventListener('click', (e) => {
  console.log('Click intercepted before any element handlers');
  
  // Could potentially stop propagation here
  // to prevent the click from reaching elements
}, true);  // ← capture: true
```

### Capture vs Bubble Order

```javascript
const parent = document.getElementById('parent');
const child = document.getElementById('child');

// Same element, different phases
parent.addEventListener('click', () => console.log('parent capture'), true);
parent.addEventListener('click', () => console.log('parent bubble'), false);

child.addEventListener('click', () => console.log('child capture'), true);
child.addEventListener('click', () => console.log('child bubble'), false);

// Click on child:
// parent capture (going down)
// child capture (at target)
// child bubble (at target)
// parent bubble (going up)
```

---

## 3.1.5 Stopping Propagation

You can stop an event from continuing its journey through the DOM.

### stopPropagation()

```javascript
// Stops event from traveling to next element in the phase
element.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('Event stops here, won\'t reach parent');
});

parent.addEventListener('click', () => {
  console.log('This will NOT fire if child stops propagation');
});
```

### stopImmediatePropagation()

```javascript
// Stops event from:
// 1. Traveling to next element (like stopPropagation)
// 2. Firing other handlers on SAME element

// Two handlers on same element
element.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('First handler');
});

element.addEventListener('click', () => {
  console.log('Second handler - WILL NOT FIRE');
});

// With just stopPropagation():
element.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('First handler');
});

element.addEventListener('click', () => {
  console.log('Second handler - WILL fire');
});
```

### When to Stop Propagation

```javascript
// ✅ Good use: Modal close button shouldn't close modal AND do modal's click action
modalCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();  // Don't let modal's click handler fire
  closeModal();
});

modal.addEventListener('click', () => {
  // Some action when modal content is clicked
});

// ❌ Bad use: Don't stop propagation just because
// It breaks event delegation and analytics
element.addEventListener('click', (e) => {
  e.stopPropagation();  // This might break parent handlers!
  doSomething();
});

// ✅ Better: Let events bubble, handle appropriately
element.addEventListener('click', (e) => {
  doSomething();
  // Let parent handlers decide what to do
});
```

---

## 3.1.6 Preventing Default Behavior

Many events have default browser behaviors that you can prevent.

### preventDefault()

```javascript
// Prevent link navigation
link.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Link clicked but not followed');
});

// Prevent form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Form submitted via JavaScript instead');
  submitViaAjax(form);
});

// Prevent context menu
element.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showCustomContextMenu(e.clientX, e.clientY);
});

// Prevent keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 's' && e.ctrlKey) {
    e.preventDefault();
    customSave();
  }
});
```

### Checking If Preventable

```javascript
element.addEventListener('click', (e) => {
  // Check if default can be prevented
  if (e.cancelable) {
    e.preventDefault();
  }
  
  // Check if it was already prevented
  console.log('Default prevented?', e.defaultPrevented);
});
```

### preventDefault vs stopPropagation

```javascript
// They do different things!

// preventDefault: Stop default browser behavior
// - Link navigation, form submission, keyboard shortcuts
// - Does NOT stop other event handlers from running

// stopPropagation: Stop event flow through DOM
// - Other handlers on parent/child elements won't fire
// - Does NOT stop default browser behavior

// Example: A link in a card
link.addEventListener('click', (e) => {
  e.preventDefault();       // Don't navigate
  // Event still bubbles to card!
});

card.addEventListener('click', () => {
  console.log('Card clicked');  // This still fires!
});

// To stop both:
link.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
```

---

## 3.1.7 Event Target vs Current Target

Understanding which element triggered the event vs which element's handler is running.

### target

```javascript
// e.target: The element that triggered the event (the original source)

parentDiv.addEventListener('click', (e) => {
  console.log('target:', e.target);  // Could be a child element!
});

// Click on child <button> inside parentDiv:
// target: <button>
```

### currentTarget

```javascript
// e.currentTarget: The element that the handler is attached to

parentDiv.addEventListener('click', (e) => {
  console.log('currentTarget:', e.currentTarget);  // Always parentDiv
  console.log('target:', e.target);  // Whatever was clicked
});

// Click on child <button>:
// currentTarget: <div> (the parentDiv)
// target: <button>
```

### Practical Example

```javascript
// Event delegation pattern
const list = document.getElementById('todo-list');

list.addEventListener('click', (e) => {
  // currentTarget: the <ul> we attached the handler to
  console.log(e.currentTarget);  // <ul id="todo-list">
  
  // target: the actual element clicked
  console.log(e.target);  // Could be <li>, <button>, <span>, etc.
  
  // Find the list item
  const item = e.target.closest('li');
  if (item) {
    handleItemClick(item);
  }
});
```

### this vs currentTarget

```javascript
// In a regular function, `this` === `e.currentTarget`
element.addEventListener('click', function(e) {
  console.log(this === e.currentTarget);  // true
});

// In an arrow function, `this` is the outer scope
element.addEventListener('click', (e) => {
  console.log(this);  // Window (or whatever outer scope is)
  console.log(e.currentTarget);  // The element (use this instead)
});
```

---

## 3.1.8 Event Phases Property

The `eventPhase` property tells you which phase the event is currently in.

```javascript
element.addEventListener('click', (e) => {
  switch (e.eventPhase) {
    case Event.NONE:           // 0
      console.log('No event is being processed');
      break;
    case Event.CAPTURING_PHASE: // 1
      console.log('Capturing phase');
      break;
    case Event.AT_TARGET:       // 2
      console.log('At target element');
      break;
    case Event.BUBBLING_PHASE:  // 3
      console.log('Bubbling phase');
      break;
  }
});

// Constants
console.log(Event.CAPTURING_PHASE);  // 1
console.log(Event.AT_TARGET);        // 2
console.log(Event.BUBBLING_PHASE);   // 3
```

---

## 3.1.9 Common Event Flow Patterns

### Pattern: Capture for Global Interception

```javascript
// Track all clicks for analytics
document.addEventListener('click', (e) => {
  analytics.track('click', {
    element: e.target.tagName,
    id: e.target.id,
    classes: e.target.className
  });
}, true);  // Capture phase = runs first

// Individual handlers won't affect this tracking
// (unless they stop propagation in capture phase)
```

### Pattern: Bubble for Event Delegation

```javascript
// Handle clicks on dynamic content
document.addEventListener('click', (e) => {
  // Handle delete buttons
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (deleteBtn) {
    handleDelete(deleteBtn);
    return;
  }
  
  // Handle edit buttons
  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn) {
    handleEdit(editBtn);
    return;
  }
});  // Bubbling phase (default)
```

### Pattern: Stop Propagation for Nested Interactives

```javascript
// Nested interactive elements
// <div class="card" onclick="openCard()">
//   <button class="close">X</button>
// </div>

const card = document.querySelector('.card');
const closeBtn = card.querySelector('.close');

card.addEventListener('click', () => openCard());

closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();  // Don't open card when closing
  closeCard();
});
```

---

## 3.1.10 Summary

| Concept | Description |
|---------|-------------|
| Event | Object representing something that happened |
| Capturing | Event travels DOWN from window to target |
| Target | Event reaches the element that triggered it |
| Bubbling | Event travels UP from target to window |
| `target` | Element that triggered the event |
| `currentTarget` | Element handler is attached to |
| `stopPropagation()` | Stop event from traveling further |
| `stopImmediatePropagation()` | Stop event + remaining handlers on element |
| `preventDefault()` | Stop default browser behavior |
| `eventPhase` | Which phase event is currently in |

### Event Phase Order

1. **Capture phase** — Window → ... → Parent → Target
2. **Target phase** — At the target element
3. **Bubble phase** — Target → Parent → ... → Window

### Best Practices

1. **Use bubbling by default** — it's what most code expects
2. **Use capture sparingly** — for interception or non-bubbling events
3. **Avoid stopping propagation** unless necessary — it breaks delegation
4. **Use `closest()` with bubbling** for event delegation
5. **Check `e.target` vs `e.currentTarget`** for delegated handlers

---

**End of Chapter 3.1: Event Fundamentals**

Next chapter: **3.2 Event Handling** — covers `addEventListener`, `removeEventListener`, handler options, and legacy event patterns.
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
# 3.5 Keyboard Events

Keyboard events enable you to respond to user typing, implement keyboard shortcuts, and create accessible interfaces. This chapter covers keyboard event types, key identification, modifier handling, and common patterns for keyboard interaction.

---

## 3.5.1 Keyboard Event Types

### keydown

```javascript
// Fires when any key is pressed
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key);
});

// Fires repeatedly if key is held (auto-repeat)
document.addEventListener('keydown', (e) => {
  if (e.repeat) {
    console.log('Key held down, auto-repeating');
  }
});

// Most common for handling keyboard input
// Fires BEFORE the character is inserted
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();  // Can prevent default
    handleSubmit();
  }
});
```

### keyup

```javascript
// Fires when key is released
document.addEventListener('keyup', (e) => {
  console.log('Key released:', e.key);
});

// Does NOT fire repeatedly
// Only fires once when key is released

// Good for toggle states
const pressedKeys = new Set();

document.addEventListener('keydown', (e) => {
  pressedKeys.add(e.key);
});

document.addEventListener('keyup', (e) => {
  pressedKeys.delete(e.key);
});
```

### keypress (Deprecated)

```javascript
// ⚠️ DEPRECATED - do not use
// Only fired for printable characters
// Inconsistent behavior across browsers

element.addEventListener('keypress', (e) => {
  console.log('Character:', e.key);
});

// ✅ Use keydown instead
element.addEventListener('keydown', (e) => {
  if (e.key.length === 1) {
    console.log('Character:', e.key);
  }
});
```

### Event Order

```javascript
// For a single keystroke:
// 1. keydown
// 2. (beforeinput - if it's a text input)
// 3. (input - if it's a text input)
// 4. keyup

// For typing "a":
input.addEventListener('keydown', () => console.log('1. keydown'));
input.addEventListener('beforeinput', () => console.log('2. beforeinput'));
input.addEventListener('input', () => console.log('3. input'));
input.addEventListener('keyup', () => console.log('4. keyup'));
```

---

## 3.5.2 Key Identification

### e.key

```javascript
// Human-readable key value
document.addEventListener('keydown', (e) => {
  console.log(e.key);
  
  // Letters: "a", "A", "b", "B", etc.
  // Numbers: "1", "2", "3", etc.
  // Special: "Enter", "Tab", "Escape", "Backspace"
  // Arrow keys: "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"
  // Function keys: "F1", "F2", etc.
  // Modifiers: "Shift", "Control", "Alt", "Meta"
});

// Case-sensitive for letters (reflects Shift state)
// Shift + a = "A"
// Just a = "a"
```

### e.code

```javascript
// Physical key location (layout-independent)
document.addEventListener('keydown', (e) => {
  console.log(e.code);
  
  // Letters: "KeyA", "KeyB", "KeyC", etc.
  // Numbers: "Digit1", "Digit2", etc.
  // Numpad: "Numpad0", "NumpadEnter", etc.
  // Special: "Enter", "Tab", "Escape", "Backspace"
  // Arrow keys: "ArrowUp", "ArrowDown", etc.
  // Function keys: "F1", "F2", etc.
  // Modifiers: "ShiftLeft", "ShiftRight", "ControlLeft", etc.
});

// Same code regardless of keyboard layout
// QWERTY "A" key = "KeyA" even on AZERTY keyboard
```

### key vs code

```javascript
// key: what character you get
// code: which physical key was pressed

document.addEventListener('keydown', (e) => {
  console.log(`key: ${e.key}, code: ${e.code}`);
});

// Examples:
// Pressing "A" on QWERTY: key="a", code="KeyA"
// Pressing Shift+"A" on QWERTY: key="A", code="KeyA"
// Pressing "1" above letters: key="1", code="Digit1"
// Pressing "1" on numpad: key="1", code="Numpad1"
// Pressing "Q" on AZERTY: key="a", code="KeyQ"

// Use key for: text input, characters
// Use code for: game controls, keyboard shortcuts (position-based)
```

### e.keyCode (Deprecated)

```javascript
// ⚠️ DEPRECATED - use key or code instead
document.addEventListener('keydown', (e) => {
  console.log(e.keyCode);  // Numeric code
  
  // Common codes:
  // Enter: 13
  // Escape: 27
  // Space: 32
  // Arrow Up: 38
  // Arrow Down: 40
  // A: 65, B: 66, etc.
});

// Still seen in older code
// Legacy support
if (e.keyCode === 13 || e.key === 'Enter') {
  handleEnter();
}
```

---

## 3.5.3 Modifier Keys

### Checking Modifiers

```javascript
document.addEventListener('keydown', (e) => {
  // Boolean properties for modifiers
  console.log('Shift:', e.shiftKey);
  console.log('Ctrl:', e.ctrlKey);
  console.log('Alt:', e.altKey);
  console.log('Meta:', e.metaKey);  // Cmd on Mac, Win key on Windows
  
  // Combinations
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    save();
  }
  
  if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
    e.preventDefault();
    redo();
  }
});
```

### Platform-Aware Modifiers

```javascript
// Mac uses Cmd (metaKey), others use Ctrl
const isMac = navigator.platform.toUpperCase().includes('MAC');

function isPrimaryModifier(e) {
  return isMac ? e.metaKey : e.ctrlKey;
}

document.addEventListener('keydown', (e) => {
  if (isPrimaryModifier(e) && e.key === 's') {
    e.preventDefault();
    save();
  }
});

// Or check both
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
});
```

### getModifierState()

```javascript
// Check if modifier is active
document.addEventListener('keydown', (e) => {
  console.log('CapsLock:', e.getModifierState('CapsLock'));
  console.log('NumLock:', e.getModifierState('NumLock'));
  console.log('ScrollLock:', e.getModifierState('ScrollLock'));
  
  // Also works for regular modifiers
  console.log('Shift:', e.getModifierState('Shift'));
});
```

---

## 3.5.4 Preventing Default Behavior

### Common Defaults to Prevent

```javascript
// Prevent form submission on Enter
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
  }
});

// Prevent tab navigation
element.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    customTabBehavior();
  }
});

// Prevent browser shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+S - browser save
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    customSave();
  }
  
  // Ctrl+P - browser print
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
    customPrint();
  }
  
  // F1 - browser help
  if (e.key === 'F1') {
    e.preventDefault();
    showHelp();
  }
});

// ⚠️ Some shortcuts can't be overridden
// Ctrl+W (close tab), Ctrl+N (new window), etc.
```

---

## 3.5.5 Common Patterns

### Keyboard Shortcuts

```javascript
// Simple shortcut handler
const shortcuts = {
  'ctrl+s': save,
  'ctrl+z': undo,
  'ctrl+shift+z': redo,
  'ctrl+c': copy,
  'ctrl+v': paste,
  'escape': closeModal,
  'f1': showHelp,
};

document.addEventListener('keydown', (e) => {
  const modifiers = [];
  if (e.ctrlKey || e.metaKey) modifiers.push('ctrl');
  if (e.shiftKey) modifiers.push('shift');
  if (e.altKey) modifiers.push('alt');
  
  const key = e.key.toLowerCase();
  const combo = [...modifiers, key].join('+');
  
  if (shortcuts[combo]) {
    e.preventDefault();
    shortcuts[combo]();
  }
});

// More robust shortcut system
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  
  register(combo, handler, options = {}) {
    this.shortcuts.set(combo.toLowerCase(), { handler, ...options });
    return () => this.shortcuts.delete(combo.toLowerCase());
  }
  
  handleKeydown(e) {
    const combo = this.getCombo(e);
    const shortcut = this.shortcuts.get(combo);
    
    if (shortcut) {
      // Skip if in input and not global
      if (!shortcut.global && this.isInInput(e)) {
        return;
      }
      
      e.preventDefault();
      shortcut.handler(e);
    }
  }
  
  getCombo(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }
  
  isInInput(e) {
    const tag = e.target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
  }
}

const shortcuts = new KeyboardShortcuts();
shortcuts.register('ctrl+s', save, { global: true });
shortcuts.register('escape', closeModal);
```

### Arrow Key Navigation

```javascript
// Navigate list with arrow keys
const items = document.querySelectorAll('.list-item');
let currentIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentIndex = Math.min(currentIndex + 1, items.length - 1);
    items[currentIndex].focus();
  }
  
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentIndex = Math.max(currentIndex - 1, 0);
    items[currentIndex].focus();
  }
  
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    selectItem(items[currentIndex]);
  }
});
```

### Text Input Validation

```javascript
// Allow only numbers
input.addEventListener('keydown', (e) => {
  // Allow: backspace, delete, tab, escape, enter, arrows
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
                   'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  
  if (allowed.includes(e.key)) return;
  
  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key)) return;
  
  // Block non-numbers
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
});

// ✅ Better: use input event for validation
input.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});
```

### Game Controls (Using code)

```javascript
// Use code for position-based controls
const keys = new Set();

document.addEventListener('keydown', (e) => {
  keys.add(e.code);
});

document.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

function gameLoop() {
  // WASD controls (works on any keyboard layout)
  if (keys.has('KeyW')) moveForward();
  if (keys.has('KeyA')) moveLeft();
  if (keys.has('KeyS')) moveBackward();
  if (keys.has('KeyD')) moveRight();
  if (keys.has('Space')) jump();
  if (keys.has('ShiftLeft')) run();
  
  requestAnimationFrame(gameLoop);
}
```

### Focus Trap

```javascript
// Keep focus within modal
function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift+Tab: if on first, go to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last, go to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

---

## 3.5.6 Accessibility Considerations

```javascript
// Make custom elements keyboard accessible
customButton.addEventListener('keydown', (e) => {
  // Activate on Enter or Space (like native buttons)
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    customButton.click();
  }
});

// Ensure element is focusable
customButton.setAttribute('tabindex', '0');
customButton.setAttribute('role', 'button');

// Handle Escape for modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAnyOpenModal();
  }
});
```

---

## 3.5.7 Summary

### Keyboard Events

| Event | When | Repeats? | Use For |
|-------|------|----------|---------|
| `keydown` | Key pressed | Yes | Shortcuts, navigation |
| `keyup` | Key released | No | Toggle states |
| `keypress` | ⚠️ Deprecated | Yes | Don't use |

### Key Properties

| Property | Returns | Use For |
|----------|---------|---------|
| `key` | Character ("a", "Enter") | Text, shortcuts |
| `code` | Physical key ("KeyA", "Enter") | Games, layout-independent |
| `keyCode` | ⚠️ Deprecated number | Legacy support |

### Modifier Properties

| Property | Meaning |
|----------|---------|
| `shiftKey` | Shift is held |
| `ctrlKey` | Ctrl is held |
| `altKey` | Alt is held |
| `metaKey` | Cmd (Mac) / Win key |
| `repeat` | Key is auto-repeating |

### Best Practices

1. **Use `key` for most cases** — human-readable, handles layout
2. **Use `code` for games/position-based** — physical key location
3. **Handle both Ctrl and Meta** for cross-platform shortcuts
4. **Don't block standard shortcuts** unnecessarily
5. **Make custom elements keyboard accessible**
6. **Use `keydown` for shortcuts**, `keyup` for toggle states

---

**End of Chapter 3.5: Keyboard Events**

Next chapter: **3.6 Form Events** — covers submit, reset, input, change, focus, blur, and form validation events.
# 3.6 Form Events

Form events enable you to respond to user input, validate data, and control form submission. This chapter covers all form-related events, from input changes to submission handling.

---

## 3.6.1 Input Events

### input Event

```javascript
// Fires immediately on every change
const input = document.querySelector('input');

input.addEventListener('input', (e) => {
  console.log('Current value:', e.target.value);
});

// Works on:
// - <input> (text, number, email, etc.)
// - <textarea>
// - <select>
// - contenteditable elements

// Fires for:
// - Typing characters
// - Pasting text
// - Cutting text
// - Speech input
// - Autocomplete
// - Drag and drop text
```

### change Event

```javascript
// Fires when element loses focus AND value changed
// Or immediately for checkboxes/radios/selects

// Text input: fires on blur if value changed
textInput.addEventListener('change', (e) => {
  console.log('Final value:', e.target.value);
});

// Checkbox: fires immediately on change
checkbox.addEventListener('change', (e) => {
  console.log('Checked:', e.target.checked);
});

// Select: fires immediately on selection change
select.addEventListener('change', (e) => {
  console.log('Selected:', e.target.value);
});

// Radio: fires when selection changes
radio.addEventListener('change', (e) => {
  console.log('Selected option:', e.target.value);
});
```

### input vs change

```javascript
// input: real-time updates
// change: committed value

const input = document.querySelector('#search');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');

// Real-time preview
input.addEventListener('input', (e) => {
  preview.textContent = e.target.value;
});

// Save when done
input.addEventListener('change', (e) => {
  status.textContent = `Saved: "${e.target.value}"`;
  saveToServer(e.target.value);
});
```

### beforeinput Event

```javascript
// Fires before input is modified (can be canceled)
input.addEventListener('beforeinput', (e) => {
  console.log('Input type:', e.inputType);
  console.log('Data to insert:', e.data);
  
  // Prevent certain input
  if (e.inputType === 'insertFromPaste') {
    e.preventDefault();
    // Handle paste manually
    const cleaned = cleanPastedContent(e.data);
    document.execCommand('insertText', false, cleaned);
  }
});

// Common inputType values:
// insertText, insertFromPaste, insertFromDrop
// deleteContentBackward, deleteContentForward
// insertParagraph, insertLineBreak
```

---

## 3.6.2 Focus Events

### focus and blur

```javascript
// focus: element receives focus
input.addEventListener('focus', (e) => {
  e.target.parentElement.classList.add('focused');
});

// blur: element loses focus
input.addEventListener('blur', (e) => {
  e.target.parentElement.classList.remove('focused');
  validateField(e.target);
});

// ⚠️ focus and blur do NOT bubble
// Use focusin/focusout for event delegation
```

### focusin and focusout

```javascript
// These events bubble (unlike focus/blur)
form.addEventListener('focusin', (e) => {
  console.log('Focus moved to:', e.target.name);
  highlightField(e.target);
});

form.addEventListener('focusout', (e) => {
  console.log('Focus left:', e.target.name);
  validateField(e.target);
});

// Use for event delegation
document.addEventListener('focusin', (e) => {
  if (e.target.matches('.validate-on-focus')) {
    showFieldHelp(e.target);
  }
});
```

### relatedTarget

```javascript
// relatedTarget tells you where focus came from/goes to
input.addEventListener('focus', (e) => {
  console.log('Focus came from:', e.relatedTarget);
});

input.addEventListener('blur', (e) => {
  console.log('Focus going to:', e.relatedTarget);
  
  // Check if focus is leaving the form entirely
  if (!form.contains(e.relatedTarget)) {
    validateForm();
  }
});
```

### Controlling Focus

```javascript
// Set focus programmatically
input.focus();

// Remove focus
input.blur();

// Focus with scroll control
input.focus({ preventScroll: true });

// Check if element is focused
const isFocused = document.activeElement === input;

// Get currently focused element
console.log('Active element:', document.activeElement);
```

---

## 3.6.3 Form Submission

### submit Event

```javascript
// Fires when form is submitted
form.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent page reload
  
  const formData = new FormData(form);
  submitToServer(formData);
});

// Triggers for:
// - Clicking submit button
// - Pressing Enter in text input (if form has submit button)
// - form.submit() does NOT trigger this event!

// ⚠️ form.submit() bypasses submit event
form.submit();  // No event fired!

// ✅ Use requestSubmit() to trigger the event
form.requestSubmit();  // Event fires, validation runs
```

### Validation on Submit

```javascript
form.addEventListener('submit', (e) => {
  const isValid = validateAllFields();
  
  if (!isValid) {
    e.preventDefault();
    showErrors();
    return;
  }
  
  // Continue with submission
  handleSubmit(new FormData(form));
});

// Using built-in validation
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();  // Show validation messages
    return;
  }
  
  handleSubmit(new FormData(form));
});
```

### reset Event

```javascript
// Fires when form is reset
form.addEventListener('reset', (e) => {
  // Optionally prevent
  if (!confirm('Clear all fields?')) {
    e.preventDefault();
    return;
  }
  
  // Clean up any custom state
  clearErrors();
  resetCustomFields();
});

// Triggers for:
// - Clicking reset button
// - form.reset() method
```

### formdata Event

```javascript
// Fires when FormData is constructed from a form
form.addEventListener('formdata', (e) => {
  // Modify FormData before it's used
  e.formData.append('timestamp', Date.now());
  e.formData.append('source', 'web');
  
  // Remove sensitive data
  e.formData.delete('debug-field');
});

// Useful for adding computed fields
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);  // formdata event fires here
  sendData(formData);
});
```

---

## 3.6.4 Selection Events

### select Event

```javascript
// Fires when text is selected in input/textarea
input.addEventListener('select', (e) => {
  const selected = e.target.value.substring(
    e.target.selectionStart,
    e.target.selectionEnd
  );
  console.log('Selected:', selected);
});

// Selection properties
console.log('Start:', input.selectionStart);
console.log('End:', input.selectionEnd);
console.log('Direction:', input.selectionDirection);

// Set selection programmatically
input.setSelectionRange(0, 5);  // Select first 5 characters
input.select();  // Select all
```

---

## 3.6.5 Form Validation Events

### invalid Event

```javascript
// Fires when validation fails on submit
input.addEventListener('invalid', (e) => {
  e.preventDefault();  // Prevent default error UI
  showCustomError(e.target, e.target.validationMessage);
});

// Customize validation message
input.addEventListener('invalid', (e) => {
  if (e.target.validity.valueMissing) {
    e.target.setCustomValidity('Please fill in this field');
  } else if (e.target.validity.typeMismatch) {
    e.target.setCustomValidity('Please enter a valid email');
  }
});

// Clear custom message on input
input.addEventListener('input', (e) => {
  e.target.setCustomValidity('');
});
```

### Validation API

```javascript
// Check validity
console.log(input.checkValidity());    // Returns boolean
console.log(form.checkValidity());     // Checks all fields

// Show validation UI
input.reportValidity();
form.reportValidity();

// Validity state object
const validity = input.validity;
console.log({
  valid: validity.valid,
  valueMissing: validity.valueMissing,      // required
  typeMismatch: validity.typeMismatch,      // type="email" etc.
  patternMismatch: validity.patternMismatch, // pattern attr
  tooShort: validity.tooShort,              // minlength
  tooLong: validity.tooLong,                // maxlength
  rangeUnderflow: validity.rangeUnderflow,  // min
  rangeOverflow: validity.rangeOverflow,    // max
  stepMismatch: validity.stepMismatch,      // step
  badInput: validity.badInput,              // unparseable input
  customError: validity.customError         // setCustomValidity
});
```

---

## 3.6.6 Common Patterns

### Real-Time Validation

```javascript
// Validate as user types
input.addEventListener('input', (e) => {
  const value = e.target.value;
  const isValid = validateValue(value);
  
  e.target.classList.toggle('valid', isValid);
  e.target.classList.toggle('invalid', !isValid);
  
  // Update error message
  const error = e.target.nextElementSibling;
  error.textContent = isValid ? '' : getErrorMessage(value);
});

// Debounced validation (for expensive checks)
let timeout;
input.addEventListener('input', (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    checkUsernameAvailable(e.target.value);
  }, 300);
});
```

### Character Counter

```javascript
const textarea = document.querySelector('textarea');
const counter = document.querySelector('.counter');
const maxLength = 280;

textarea.addEventListener('input', (e) => {
  const remaining = maxLength - e.target.value.length;
  counter.textContent = remaining;
  counter.classList.toggle('warning', remaining < 20);
  counter.classList.toggle('error', remaining < 0);
});
```

### Auto-Save

```javascript
let saveTimeout;

form.addEventListener('input', (e) => {
  // Debounce saves
  clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    const formData = new FormData(form);
    localStorage.setItem('draft', JSON.stringify(Object.fromEntries(formData)));
    showSaveIndicator();
  }, 1000);
});

// Restore on load
window.addEventListener('load', () => {
  const draft = localStorage.getItem('draft');
  if (draft) {
    const data = JSON.parse(draft);
    Object.entries(data).forEach(([name, value]) => {
      const field = form.elements[name];
      if (field) field.value = value;
    });
  }
});
```

### Multi-Step Form

```javascript
class MultiStepForm {
  constructor(form) {
    this.form = form;
    this.steps = form.querySelectorAll('.step');
    this.currentStep = 0;
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  showStep(index) {
    this.steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });
    this.currentStep = index;
  }
  
  nextStep() {
    const currentFields = this.steps[this.currentStep].querySelectorAll('input');
    const allValid = [...currentFields].every(f => f.checkValidity());
    
    if (!allValid) {
      currentFields.forEach(f => f.reportValidity());
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }
  
  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  handleSubmit(e) {
    e.preventDefault();
    if (this.currentStep < this.steps.length - 1) {
      this.nextStep();
    } else {
      this.submit();
    }
  }
  
  submit() {
    const formData = new FormData(this.form);
    // Submit logic
  }
}
```

---

## 3.6.7 Gotchas

```javascript
// ❌ form.submit() doesn't trigger submit event
form.submit();

// ✅ Use requestSubmit() to trigger event
form.requestSubmit();

// ❌ Relying on keypress for Enter detection
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitForm();  // Deprecated event
});

// ✅ Use keydown or form submit event
form.addEventListener('submit', (e) => {
  e.preventDefault();
  submitForm();
});

// ❌ Not clearing custom validity
input.setCustomValidity('Invalid!');
// Field stays invalid even after correction

// ✅ Clear on input
input.addEventListener('input', () => {
  input.setCustomValidity('');
});

// ❌ focus/blur don't bubble
container.addEventListener('focus', handleFocus);  // Won't work

// ✅ Use focusin/focusout for delegation
container.addEventListener('focusin', handleFocus);
```

---

## 3.6.8 Summary

### Form Events

| Event | When | Bubbles |
|-------|------|---------|
| `input` | Value changes (real-time) | Yes |
| `change` | Value committed (blur or select) | Yes |
| `beforeinput` | Before value changes | Yes |
| `submit` | Form submitted | Yes |
| `reset` | Form reset | Yes |
| `formdata` | FormData constructed | Yes |

### Focus Events

| Event | When | Bubbles |
|-------|------|---------|
| `focus` | Element receives focus | No |
| `blur` | Element loses focus | No |
| `focusin` | Element receives focus | Yes |
| `focusout` | Element loses focus | Yes |

### Validation Events

| Event | When | Use For |
|-------|------|---------|
| `invalid` | Validation fails | Custom error UI |

### Best Practices

1. **Use `input` for real-time feedback**, `change` for commits
2. **Use `focusin`/`focusout` for delegation** (they bubble)
3. **Use `requestSubmit()` instead of `submit()`** to trigger validation
4. **Clear `setCustomValidity('')` on input** to reset validation
5. **Debounce expensive operations** (server validation, auto-save)

---

**End of Chapter 3.6: Form Events**

Next chapter: **3.7 Touch Events** — covers touchstart, touchmove, touchend, touch lists, and gesture handling.
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
# 3.9 Drag and Drop Events

The native HTML5 Drag and Drop API enables dragging elements and data between applications. This chapter covers drag events, DataTransfer, drop zones, and common drag and drop patterns.

---

## 3.9.1 Making Elements Draggable

### The draggable Attribute

```html
<!-- Make any element draggable -->
<div draggable="true">Drag me!</div>

<!-- Default draggable elements -->
<img src="photo.jpg">  <!-- Images are draggable by default -->
<a href="/link">Link</a>  <!-- Links are draggable by default -->
<div>Not draggable</div>  <!-- Other elements need draggable="true" -->
```

```javascript
// Enable draggability via JavaScript
element.draggable = true;

// Check if element is draggable
console.log(element.draggable);
```

---

## 3.9.2 Drag Events

### Events on Draggable Elements

```javascript
// dragstart: dragging begins
element.addEventListener('dragstart', (e) => {
  console.log('Started dragging');
  // Set the data being dragged
  e.dataTransfer.setData('text/plain', element.id);
});

// drag: fires continuously while dragging
element.addEventListener('drag', (e) => {
  // ⚠️ Fires frequently - use sparingly
  console.log('Dragging...');
});

// dragend: dragging ends (success or cancel)
element.addEventListener('dragend', (e) => {
  console.log('Drag ended');
  console.log('Drop effect:', e.dataTransfer.dropEffect);
  
  if (e.dataTransfer.dropEffect === 'none') {
    console.log('Drag was cancelled');
  } else {
    console.log('Drop was successful');
  }
});
```

### Events on Drop Targets

```javascript
// dragenter: dragged item enters drop zone
dropZone.addEventListener('dragenter', (e) => {
  e.preventDefault();  // Allow drop
  dropZone.classList.add('drag-over');
});

// dragover: dragged item is over drop zone
// Must call preventDefault() to allow drop!
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();  // REQUIRED to allow drop
  e.dataTransfer.dropEffect = 'move';
});

// dragleave: dragged item leaves drop zone
dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drag-over');
});

// drop: item is dropped
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();  // Prevent default handling
  dropZone.classList.remove('drag-over');
  
  const data = e.dataTransfer.getData('text/plain');
  console.log('Dropped:', data);
});
```

### Event Flow

```javascript
// Complete drag and drop flow:
// 1. User starts dragging → dragstart (on draggable)
// 2. While dragging → drag (on draggable, continuous)
// 3. Enter drop zone → dragenter (on drop zone)
// 4. Over drop zone → dragover (on drop zone, continuous)
// 5. Leave drop zone → dragleave (on drop zone)
// 6. Drop on target → drop (on drop zone)
// 7. End drag → dragend (on draggable)
```

---

## 3.9.3 DataTransfer Object

### Setting Data

```javascript
element.addEventListener('dragstart', (e) => {
  // Set text data
  e.dataTransfer.setData('text/plain', 'Hello World');
  
  // Set HTML data
  e.dataTransfer.setData('text/html', '<b>Hello</b> World');
  
  // Set URL
  e.dataTransfer.setData('text/uri-list', 'https://example.com');
  
  // Set custom data
  e.dataTransfer.setData('application/json', JSON.stringify({
    id: element.id,
    type: 'card',
    data: { title: 'Task 1' }
  }));
  
  // Multiple types can be set
  // Drop target chooses which to use
});
```

### Getting Data

```javascript
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  // Get text data
  const text = e.dataTransfer.getData('text/plain');
  
  // Get HTML
  const html = e.dataTransfer.getData('text/html');
  
  // Get custom data
  const json = e.dataTransfer.getData('application/json');
  if (json) {
    const data = JSON.parse(json);
    console.log('Dropped:', data);
  }
  
  // Check available types
  console.log('Types:', e.dataTransfer.types);
});
```

### Checking Available Types

```javascript
dropZone.addEventListener('dragover', (e) => {
  // Check what types are available
  const types = e.dataTransfer.types;
  
  if (types.includes('application/json')) {
    e.preventDefault();  // Accept this drop
    e.dataTransfer.dropEffect = 'move';
  }
});
```

### Drop Effect and Effect Allowed

```javascript
// On dragstart: specify what operations are allowed
element.addEventListener('dragstart', (e) => {
  // Options: "none", "copy", "move", "link", 
  // "copyMove", "copyLink", "linkMove", "all"
  e.dataTransfer.effectAllowed = 'copyMove';
});

// On dragover: specify what will happen
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  // Options: "none", "copy", "move", "link"
  e.dataTransfer.dropEffect = 'move';
  // Cursor changes to indicate effect
});

// On dragend: check what happened
element.addEventListener('dragend', (e) => {
  if (e.dataTransfer.dropEffect === 'move') {
    // Remove element from source
    element.remove();
  }
});
```

---

## 3.9.4 Dragging Files

### Detecting File Drops

```javascript
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  
  // Check for files
  if (e.dataTransfer.types.includes('Files')) {
    e.dataTransfer.dropEffect = 'copy';
  }
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  // Access dropped files
  const files = e.dataTransfer.files;
  
  for (const file of files) {
    console.log('File:', file.name);
    console.log('Type:', file.type);
    console.log('Size:', file.size);
    
    // Process file
    handleFile(file);
  }
});

async function handleFile(file) {
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    showImage(url);
  } else if (file.type === 'application/json') {
    const text = await file.text();
    const data = JSON.parse(text);
    processData(data);
  }
}
```

### File Drop Zone Pattern

```javascript
class FileDropZone {
  constructor(element, options = {}) {
    this.element = element;
    this.accept = options.accept || '*/*';
    this.onDrop = options.onDrop || (() => {});
    
    this.setup();
  }
  
  setup() {
    // Prevent default drag behavior on document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
      document.body.addEventListener(event, e => e.preventDefault());
    });
    
    this.element.addEventListener('dragenter', this.highlight.bind(this));
    this.element.addEventListener('dragover', this.highlight.bind(this));
    this.element.addEventListener('dragleave', this.unhighlight.bind(this));
    this.element.addEventListener('drop', this.handleDrop.bind(this));
  }
  
  highlight(e) {
    e.preventDefault();
    this.element.classList.add('drag-active');
  }
  
  unhighlight(e) {
    this.element.classList.remove('drag-active');
  }
  
  handleDrop(e) {
    e.preventDefault();
    this.unhighlight(e);
    
    const files = [...e.dataTransfer.files].filter(file => {
      if (this.accept === '*/*') return true;
      return this.accept.split(',').some(type => {
        type = type.trim();
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
    });
    
    if (files.length > 0) {
      this.onDrop(files);
    }
  }
}

// Usage
new FileDropZone(document.querySelector('.drop-zone'), {
  accept: 'image/*,application/pdf',
  onDrop: (files) => {
    files.forEach(uploadFile);
  }
});
```

---

## 3.9.5 Custom Drag Image

```javascript
element.addEventListener('dragstart', (e) => {
  // Create custom drag image
  const dragImage = document.createElement('div');
  dragImage.textContent = 'Dragging...';
  dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    background: #333;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
  `;
  document.body.appendChild(dragImage);
  
  // Set as drag image (element, offsetX, offsetY)
  e.dataTransfer.setDragImage(dragImage, 50, 25);
  
  // Clean up
  setTimeout(() => dragImage.remove(), 0);
});

// Using an existing image
element.addEventListener('dragstart', (e) => {
  const img = new Image();
  img.src = 'drag-icon.png';
  e.dataTransfer.setDragImage(img, 25, 25);
});
```

---

## 3.9.6 Common Patterns

### Sortable List

```javascript
class SortableList {
  constructor(container) {
    this.container = container;
    this.draggedItem = null;
    
    container.querySelectorAll('.sortable-item').forEach(item => {
      item.draggable = true;
      this.addDragListeners(item);
    });
  }
  
  addDragListeners(item) {
    item.addEventListener('dragstart', (e) => {
      this.draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });
    
    item.addEventListener('dragend', () => {
      this.draggedItem = null;
      item.classList.remove('dragging');
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (item === this.draggedItem) return;
      
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (e.clientY < midY) {
        item.parentNode.insertBefore(this.draggedItem, item);
      } else {
        item.parentNode.insertBefore(this.draggedItem, item.nextSibling);
      }
    });
  }
}
```

### Kanban Board

```javascript
class KanbanBoard {
  constructor(board) {
    this.board = board;
    this.draggedCard = null;
    
    // Setup columns
    board.querySelectorAll('.column').forEach(column => {
      column.addEventListener('dragover', this.handleDragOver.bind(this));
      column.addEventListener('drop', this.handleDrop.bind(this));
    });
    
    // Setup cards
    board.querySelectorAll('.card').forEach(card => {
      this.setupCard(card);
    });
  }
  
  setupCard(card) {
    card.draggable = true;
    
    card.addEventListener('dragstart', (e) => {
      this.draggedCard = card;
      card.classList.add('dragging');
      e.dataTransfer.setData('application/json', JSON.stringify({
        id: card.dataset.id
      }));
    });
    
    card.addEventListener('dragend', () => {
      this.draggedCard = null;
      card.classList.remove('dragging');
    });
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const column = e.currentTarget;
    const afterCard = this.getCardAfterDrag(column, e.clientY);
    
    if (afterCard) {
      column.insertBefore(this.draggedCard, afterCard);
    } else {
      column.appendChild(this.draggedCard);
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    const column = e.currentTarget;
    const cardId = this.draggedCard.dataset.id;
    const newStatus = column.dataset.status;
    
    // Update backend
    this.updateCardStatus(cardId, newStatus);
  }
  
  getCardAfterDrag(column, y) {
    const cards = [...column.querySelectorAll('.card:not(.dragging)')];
    
    return cards.reduce((closest, card) => {
      const rect = card.getBoundingClientRect();
      const offset = y - rect.top - rect.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  updateCardStatus(cardId, status) {
    // API call to update card
  }
}
```

### Drag Between Lists

```javascript
class DragBetweenLists {
  constructor(lists) {
    this.lists = lists;
    this.draggedItem = null;
    this.sourceList = null;
    
    lists.forEach(list => this.setupList(list));
  }
  
  setupList(list) {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.classList.add('drop-target');
    });
    
    list.addEventListener('dragleave', () => {
      list.classList.remove('drop-target');
    });
    
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      list.classList.remove('drop-target');
      
      if (this.draggedItem) {
        list.appendChild(this.draggedItem);
        this.onMove(this.draggedItem, this.sourceList, list);
      }
    });
    
    list.querySelectorAll('.item').forEach(item => {
      this.setupItem(item);
    });
  }
  
  setupItem(item) {
    item.draggable = true;
    
    item.addEventListener('dragstart', (e) => {
      this.draggedItem = item;
      this.sourceList = item.parentElement;
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      this.draggedItem = null;
      this.sourceList = null;
      item.classList.remove('dragging');
    });
  }
  
  onMove(item, from, to) {
    console.log(`Moved ${item.textContent} from ${from.id} to ${to.id}`);
  }
}
```

---

## 3.9.7 Accessibility Considerations

```javascript
// Native drag and drop is NOT keyboard accessible
// Provide keyboard alternatives

class AccessibleDragDrop {
  constructor(container) {
    this.container = container;
    this.selectedItem = null;
    
    container.querySelectorAll('.item').forEach(item => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-grabbed', 'false');
      
      item.addEventListener('keydown', this.handleKeydown.bind(this));
    });
    
    container.setAttribute('role', 'listbox');
    container.setAttribute('aria-label', 'Sortable list');
  }
  
  handleKeydown(e) {
    const item = e.target;
    
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        this.toggleSelection(item);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (this.selectedItem) {
          this.moveUp(this.selectedItem);
        } else {
          this.focusPrevious(item);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (this.selectedItem) {
          this.moveDown(this.selectedItem);
        } else {
          this.focusNext(item);
        }
        break;
        
      case 'Escape':
        if (this.selectedItem) {
          this.deselect();
        }
        break;
    }
  }
  
  toggleSelection(item) {
    if (this.selectedItem === item) {
      this.deselect();
    } else {
      if (this.selectedItem) {
        this.deselect();
      }
      this.selectedItem = item;
      item.setAttribute('aria-grabbed', 'true');
      item.classList.add('selected');
    }
  }
  
  deselect() {
    if (this.selectedItem) {
      this.selectedItem.setAttribute('aria-grabbed', 'false');
      this.selectedItem.classList.remove('selected');
      this.selectedItem = null;
    }
  }
  
  moveUp(item) {
    const prev = item.previousElementSibling;
    if (prev) {
      item.parentNode.insertBefore(item, prev);
      item.focus();
    }
  }
  
  moveDown(item) {
    const next = item.nextElementSibling;
    if (next) {
      item.parentNode.insertBefore(next, item);
      item.focus();
    }
  }
  
  focusPrevious(item) {
    const prev = item.previousElementSibling;
    if (prev) prev.focus();
  }
  
  focusNext(item) {
    const next = item.nextElementSibling;
    if (next) next.focus();
  }
}
```

---

## 3.9.8 Gotchas

```javascript
// ❌ Forgetting preventDefault on dragover
dropZone.addEventListener('dragover', handler);
// Drop will NOT work without preventDefault!

// ✅ Always prevent default on dragover
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});

// ❌ Trying to access dataTransfer data in dragover
dropZone.addEventListener('dragover', (e) => {
  const data = e.dataTransfer.getData('text');
  // Returns empty string! (security restriction)
});

// ✅ Only access data in drop event
dropZone.addEventListener('drop', (e) => {
  const data = e.dataTransfer.getData('text');
  // Works here
});

// ❌ dragleave fires when entering child elements
dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('active');
  // Flickers when moving over children!
});

// ✅ Check if actually leaving the drop zone
dropZone.addEventListener('dragleave', (e) => {
  if (!dropZone.contains(e.relatedTarget)) {
    dropZone.classList.remove('active');
  }
});

// ❌ Not preventing default on drop
dropZone.addEventListener('drop', (e) => {
  // Browser may navigate to dropped URL or open file!
});

// ✅ Always prevent default on drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  handleDrop(e);
});
```

---

## 3.9.9 Summary

### Drag Events

| Event | Target | When |
|-------|--------|------|
| `dragstart` | Draggable | Drag begins |
| `drag` | Draggable | While dragging |
| `dragend` | Draggable | Drag ends |
| `dragenter` | Drop zone | Enter drop zone |
| `dragover` | Drop zone | Over drop zone |
| `dragleave` | Drop zone | Leave drop zone |
| `drop` | Drop zone | Item dropped |

### DataTransfer Properties

| Property | Description |
|----------|-------------|
| `setData(type, data)` | Set drag data |
| `getData(type)` | Get drag data (drop only) |
| `types` | Array of data types |
| `files` | FileList for file drops |
| `effectAllowed` | Allowed operations |
| `dropEffect` | Current operation |
| `setDragImage()` | Custom drag image |

### Best Practices

1. **Always `preventDefault` on `dragover`** to enable drops
2. **Always `preventDefault` on `drop`** to prevent browser defaults
3. **Handle `dragleave` carefully** — use `relatedTarget` check
4. **Set data in `dragstart`** — only accessible in `drop`
5. **Provide keyboard alternatives** for accessibility
6. **Use `effectAllowed` and `dropEffect`** for visual feedback

---

**End of Chapter 3.9: Drag and Drop Events**

Next chapter: **3.10 Window Events** — covers load, resize, scroll, beforeunload, and other window-level events.
# 3.10 Window Events

Window events handle page lifecycle, viewport changes, and user departure. This chapter covers load events, resize, scroll, visibility, and beforeunload for exit confirmation.

---

## 3.10.1 Load Events

### load Event

```javascript
// Fires when entire page is loaded (including images, stylesheets, etc.)
window.addEventListener('load', () => {
  console.log('Page fully loaded');
  console.log('All images loaded');
  console.log('All stylesheets applied');
  
  // Safe to interact with images
  const img = document.querySelector('img');
  console.log('Image dimensions:', img.naturalWidth, img.naturalHeight);
});

// Also fires on individual elements
const img = document.querySelector('img');
img.addEventListener('load', () => {
  console.log('This image loaded');
});
```

### DOMContentLoaded vs load

```javascript
// DOMContentLoaded: HTML parsed, DOM ready
// (Fires BEFORE images and stylesheets finish loading)
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready!');
  // Safe to query DOM
  // Images may still be loading
});

// load: Everything finished
window.addEventListener('load', () => {
  console.log('Everything loaded!');
  // All resources ready
});

// Typical order:
// 1. DOMContentLoaded
// 2. Images load
// 3. Stylesheets load
// 4. window.load
```

### error Event

```javascript
// Handle resource loading errors
const img = document.querySelector('img');

img.addEventListener('error', () => {
  console.log('Image failed to load');
  img.src = 'fallback.png';
});

// Global error handler
window.addEventListener('error', (e) => {
  if (e.target !== window) {
    // Resource loading error
    console.log('Resource failed:', e.target.src || e.target.href);
  } else {
    // JavaScript error
    console.log('JS error:', e.message);
  }
});
```

---

## 3.10.2 Resize Event

### Basic Usage

```javascript
window.addEventListener('resize', () => {
  console.log('Window resized');
  console.log('New size:', window.innerWidth, window.innerHeight);
});

// ⚠️ Fires frequently during resize
// Debounce for performance
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    handleResize();
  }, 100);
});
```

### Window Dimensions

```javascript
// Viewport size (excluding scrollbars)
console.log('Inner:', window.innerWidth, window.innerHeight);

// Outer window size (including chrome)
console.log('Outer:', window.outerWidth, window.outerHeight);

// Screen size
console.log('Screen:', screen.width, screen.height);

// Available screen (minus taskbar)
console.log('Available:', screen.availWidth, screen.availHeight);
```

### ResizeObserver Alternative

```javascript
// For element resizing (more efficient than window resize)
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log('Element resized:', entry.contentRect.width);
  }
});

observer.observe(document.querySelector('.container'));
```

---

## 3.10.3 Scroll Events

### Basic Scroll Handling

```javascript
window.addEventListener('scroll', () => {
  console.log('Scroll position:', window.scrollX, window.scrollY);
});

// ⚠️ Fires very frequently
// Use passive listener for performance
window.addEventListener('scroll', handleScroll, { passive: true });
```

### Throttling Scroll

```javascript
// Throttle scroll handler
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

function handleScroll() {
  const scrollY = window.scrollY;
  // Handle scroll
}
```

### Scroll Position

```javascript
// Current scroll position
const scrollX = window.scrollX;  // or pageXOffset
const scrollY = window.scrollY;  // or pageYOffset

// Document dimensions
const docHeight = document.documentElement.scrollHeight;
const docWidth = document.documentElement.scrollWidth;

// Viewport dimensions
const viewHeight = window.innerHeight;
const viewWidth = window.innerWidth;

// Scroll progress (0 to 1)
const progress = scrollY / (docHeight - viewHeight);
```

### Scroll-Based Animations

```javascript
// Progress bar
const progressBar = document.querySelector('.progress');

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = window.scrollY / scrollable;
  progressBar.style.width = `${progress * 100}%`;
}, { passive: true });

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

---

## 3.10.4 Page Lifecycle Events

### beforeunload

```javascript
// Prompt before leaving (for unsaved changes)
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    // Modern browsers ignore custom messages
    e.preventDefault();
    // Some browsers require returnValue
    e.returnValue = '';
    return '';
  }
});

// Only attach when needed
function markUnsaved() {
  hasUnsavedChanges = true;
  window.addEventListener('beforeunload', handleBeforeUnload);
}

function markSaved() {
  hasUnsavedChanges = false;
  window.removeEventListener('beforeunload', handleBeforeUnload);
}
```

### unload (Deprecated)

```javascript
// ⚠️ Deprecated - avoid using
// Prevents back-forward cache (bfcache)
window.addEventListener('unload', () => {
  // Don't use this!
});

// ✅ Use pagehide instead
window.addEventListener('pagehide', (e) => {
  if (e.persisted) {
    // Page is being cached
  } else {
    // Page is being unloaded
  }
  
  // Send analytics
  navigator.sendBeacon('/analytics', data);
});
```

### visibilitychange

```javascript
// Fires when page becomes visible/hidden
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Page is visible');
    resumeVideo();
    reconnectWebSocket();
  } else {
    console.log('Page is hidden');
    pauseVideo();
    // visibilityState can be: "visible", "hidden"
  }
});

// Check current state
console.log('Hidden:', document.hidden);
console.log('State:', document.visibilityState);
```

### pageshow and pagehide

```javascript
// Better alternatives to load/unload for bfcache compatibility

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Restored from bfcache
    console.log('Page restored from cache');
    refreshData();
  } else {
    // Fresh page load
    console.log('Fresh page load');
  }
});

window.addEventListener('pagehide', (e) => {
  if (e.persisted) {
    // Being put in bfcache
    console.log('Page may be cached');
  }
});
```

---

## 3.10.5 Online/Offline Events

```javascript
// Detect connection changes
window.addEventListener('online', () => {
  console.log('Back online');
  syncData();
  showNotification('Connection restored');
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  showNotification('You are offline');
});

// Check current state
console.log('Online:', navigator.onLine);
```

---

## 3.10.6 Print Events

```javascript
// Before print dialog opens
window.addEventListener('beforeprint', () => {
  console.log('Preparing to print');
  expandAllSections();
  showPrintStyles();
});

// After print dialog closes
window.addEventListener('afterprint', () => {
  console.log('Print finished/cancelled');
  restoreNormalView();
});

// Alternative: matchMedia
const printQuery = window.matchMedia('print');
printQuery.addEventListener('change', (e) => {
  if (e.matches) {
    // Entering print mode
  } else {
    // Exiting print mode
  }
});
```

---

## 3.10.7 Focus Events

```javascript
// Window gains focus
window.addEventListener('focus', () => {
  console.log('Window focused');
  document.title = 'My App';
});

// Window loses focus
window.addEventListener('blur', () => {
  console.log('Window blurred');
  document.title = '(Paused) My App';
});

// Check if window has focus
console.log('Has focus:', document.hasFocus());
```

---

## 3.10.8 Common Patterns

### Sticky Header

```javascript
const header = document.querySelector('header');
const headerTop = header.offsetTop;

window.addEventListener('scroll', () => {
  if (window.scrollY >= headerTop) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
}, { passive: true });
```

### Infinite Scroll

```javascript
function setupInfiniteScroll() {
  let loading = false;
  
  window.addEventListener('scroll', async () => {
    if (loading) return;
    
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    // Load more when near bottom
    if (docHeight - scrollBottom < 200) {
      loading = true;
      await loadMoreContent();
      loading = false;
    }
  }, { passive: true });
}
```

### Unsaved Changes Warning

```javascript
class UnsavedChangesGuard {
  constructor(form) {
    this.form = form;
    this.hasChanges = false;
    
    form.addEventListener('input', () => {
      this.hasChanges = true;
    });
    
    form.addEventListener('submit', () => {
      this.hasChanges = false;
    });
    
    window.addEventListener('beforeunload', (e) => {
      if (this.hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
}
```

### Responsive Breakpoints

```javascript
class BreakpointWatcher {
  constructor(breakpoints) {
    this.breakpoints = breakpoints;
    this.current = this.getCurrent();
    
    window.addEventListener('resize', this.checkBreakpoint.bind(this));
  }
  
  getCurrent() {
    const width = window.innerWidth;
    for (const [name, minWidth] of Object.entries(this.breakpoints)) {
      if (width >= minWidth) return name;
    }
    return 'xs';
  }
  
  checkBreakpoint() {
    const newBreakpoint = this.getCurrent();
    if (newBreakpoint !== this.current) {
      this.current = newBreakpoint;
      this.onChange(newBreakpoint);
    }
  }
  
  onChange(breakpoint) {
    document.body.dataset.breakpoint = breakpoint;
  }
}

new BreakpointWatcher({
  xl: 1200,
  lg: 992,
  md: 768,
  sm: 576
});
```

---

## 3.10.9 Gotchas

```javascript
// ❌ Using unload event (breaks bfcache)
window.addEventListener('unload', sendAnalytics);

// ✅ Use pagehide or sendBeacon
window.addEventListener('pagehide', () => {
  navigator.sendBeacon('/analytics', data);
});

// ❌ Not throttling scroll/resize handlers
window.addEventListener('scroll', heavyComputation);

// ✅ Throttle with requestAnimationFrame
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      heavyComputation();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ❌ Using passive: false on scroll without needing preventDefault
window.addEventListener('scroll', handler);  // Non-passive by default

// ✅ Use passive: true when not preventing default
window.addEventListener('scroll', handler, { passive: true });

// ❌ Relying on navigator.onLine for actual connectivity
if (navigator.onLine) {
  // Might be online but server unreachable!
}

// ✅ Actually test connectivity
async function isOnline() {
  try {
    await fetch('/ping', { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}
```

---

## 3.10.10 Summary

### Window Events

| Event | When |
|-------|------|
| `load` | Page fully loaded (all resources) |
| `DOMContentLoaded` | DOM parsed (document event) |
| `beforeunload` | Before leaving page |
| `pagehide` | Page is being hidden/unloaded |
| `pageshow` | Page is shown (including bfcache) |

### Viewport Events

| Event | When |
|-------|------|
| `resize` | Window size changes |
| `scroll` | Page is scrolled |

### Visibility Events

| Event | When |
|-------|------|
| `visibilitychange` | Page visibility changes (document event) |
| `focus` | Window gains focus |
| `blur` | Window loses focus |
| `online` | Connection restored |
| `offline` | Connection lost |

### Best Practices

1. **Use `DOMContentLoaded`** for DOM manipulation, `load` for resources
2. **Use `pagehide`** instead of `unload` (bfcache friendly)
3. **Throttle scroll/resize** with `requestAnimationFrame`
4. **Use `passive: true`** for scroll handlers when possible
5. **Use `sendBeacon`** for analytics on page leave
6. **Only attach `beforeunload`** when actually needed

---

**End of Chapter 3.10: Window Events**

Next chapter: **3.11 Document Events** — covers DOMContentLoaded, readystatechange, visibilitychange, and fullscreen events.
# 3.11 Document Events

Document events handle DOM readiness, document state changes, and full-screen mode. This chapter covers DOMContentLoaded, readyState, clipboard events on document, and fullscreen API events.

---

## 3.11.1 DOM Ready Events

### DOMContentLoaded

```javascript
// Fires when HTML is parsed and DOM tree is ready
// Does NOT wait for stylesheets, images, or subframes
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready');
  
  // Safe to query DOM
  const app = document.querySelector('#app');
  initializeApp(app);
});

// If script is at end of body, DOM is already ready
// But DOMContentLoaded is still useful for:
// - Scripts in <head> with defer
// - Dynamic script loading
// - Ensuring all DOM is parsed
```

### readystatechange

```javascript
// Fires when document.readyState changes
document.addEventListener('readystatechange', () => {
  console.log('State:', document.readyState);
});

// readyState values:
// "loading" - Document is loading
// "interactive" - DOM parsed (DOMContentLoaded fires here)
// "complete" - All resources loaded (load fires here)

// Wait for specific state
function waitForReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          resolve();
        }
      });
    }
  });
}
```

### Checking if DOM is Ready

```javascript
// Pattern for scripts that might load at any time
function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    // DOM is already ready
    callback();
  }
}

// Usage
onReady(() => {
  initializeApp();
});

// jQuery-style ready function
function $(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

$(() => {
  console.log('Ready!');
});
```

---

## 3.11.2 Visibility Events

### visibilitychange

```javascript
// Fires when page visibility changes
// More reliable than window focus/blur for tab switching
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Page is now visible');
    resumeAnimations();
    checkForUpdates();
  } else if (document.visibilityState === 'hidden') {
    console.log('Page is now hidden');
    pauseAnimations();
    saveProgress();
  }
});

// Check current visibility
console.log('Hidden:', document.hidden);
console.log('State:', document.visibilityState);
// visibilityState: "visible", "hidden"
```

### Use Cases

```javascript
// Pause video when tab is hidden
const video = document.querySelector('video');

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
  } else {
    video.play();
  }
});

// Pause game loop
let animationId;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else {
    animationId = requestAnimationFrame(gameLoop);
  }
});

// Refresh data when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    fetchLatestData();
  }
});
```

---

## 3.11.3 Selection Events

### selectionchange

```javascript
// Fires when text selection changes
document.addEventListener('selectionchange', () => {
  const selection = document.getSelection();
  
  if (selection.toString()) {
    console.log('Selected text:', selection.toString());
    showSelectionToolbar(selection);
  } else {
    hideSelectionToolbar();
  }
});

// Get selection details
function getSelectionDetails() {
  const selection = document.getSelection();
  
  return {
    text: selection.toString(),
    rangeCount: selection.rangeCount,
    anchorNode: selection.anchorNode,
    focusNode: selection.focusNode,
    isCollapsed: selection.isCollapsed
  };
}
```

### selectstart

```javascript
// Fires when selection starts
document.addEventListener('selectstart', (e) => {
  console.log('Selection starting on:', e.target);
  
  // Prevent selection on certain elements
  if (e.target.classList.contains('no-select')) {
    e.preventDefault();
  }
});

// CSS alternative for preventing selection
// user-select: none;
```

---

## 3.11.4 Fullscreen Events

### Entering/Exiting Fullscreen

```javascript
// Request fullscreen on an element
const element = document.querySelector('.player');

async function enterFullscreen() {
  try {
    await element.requestFullscreen();
  } catch (err) {
    console.error('Fullscreen failed:', err);
  }
}

// Exit fullscreen
async function exitFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
}

// Toggle fullscreen
async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await element.requestFullscreen();
  }
}
```

### fullscreenchange Event

```javascript
// Fires when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen:', document.fullscreenElement);
    showFullscreenUI();
  } else {
    console.log('Exited fullscreen');
    showNormalUI();
  }
});

// Check current state
console.log('Fullscreen element:', document.fullscreenElement);
console.log('Is fullscreen:', !!document.fullscreenElement);
console.log('Fullscreen enabled:', document.fullscreenEnabled);
```

### fullscreenerror Event

```javascript
// Fires if fullscreen request fails
document.addEventListener('fullscreenerror', (e) => {
  console.error('Fullscreen error on:', e.target);
  showError('Fullscreen not available');
});

// Common failure reasons:
// - No user gesture
// - iframe without allowfullscreen
// - Browser restrictions
```

### Fullscreen CSS

```css
/* Style fullscreen element */
:fullscreen {
  background: black;
}

/* Style backdrop (empty space) */
::backdrop {
  background: rgba(0, 0, 0, 0.9);
}

/* Different fullscreen states */
.player:fullscreen .controls {
  position: fixed;
  bottom: 20px;
}
```

---

## 3.11.5 Clipboard Events on Document

```javascript
// Document-level clipboard events
// (See chapter 3.6 for form-level clipboard events)

document.addEventListener('copy', (e) => {
  console.log('Copy event on document');
  
  // Modify copied content
  const selection = document.getSelection().toString();
  const modified = `${selection}\n\nCopied from MyApp`;
  
  e.clipboardData.setData('text/plain', modified);
  e.preventDefault();
});

document.addEventListener('cut', (e) => {
  console.log('Cut event');
});

document.addEventListener('paste', (e) => {
  const text = e.clipboardData.getData('text/plain');
  console.log('Pasted:', text);
  
  // Check for images
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      handlePastedImage(file);
    }
  }
});
```

---

## 3.11.6 Scroll-Related Document Properties

```javascript
// Document scroll dimensions
const scrollHeight = document.documentElement.scrollHeight;
const scrollWidth = document.documentElement.scrollWidth;

// Client dimensions (viewport)
const clientHeight = document.documentElement.clientHeight;
const clientWidth = document.documentElement.clientWidth;

// Scroll position
const scrollTop = document.documentElement.scrollTop;
const scrollLeft = document.documentElement.scrollLeft;

// Scroll to position
document.documentElement.scrollTo({
  top: 0,
  behavior: 'smooth'
});

// Scroll by amount
document.documentElement.scrollBy({
  top: 100,
  behavior: 'smooth'
});
```

---

## 3.11.7 Common Patterns

### Loading Indicator

```javascript
class LoadingIndicator {
  constructor() {
    this.indicator = this.createIndicator();
    document.body.appendChild(this.indicator);
    
    // Show until DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      this.hide();
    });
    
    // Or until fully loaded
    window.addEventListener('load', () => {
      this.indicator.remove();
    });
  }
  
  createIndicator() {
    const div = document.createElement('div');
    div.className = 'loading-overlay';
    div.innerHTML = '<div class="spinner"></div>';
    return div;
  }
  
  hide() {
    this.indicator.classList.add('fade-out');
  }
}
```

### Copy-to-Clipboard Feature

```javascript
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast('Copied!');
  }
}
```

### Idle Detection

```javascript
class IdleDetector {
  constructor(timeout = 60000) {
    this.timeout = timeout;
    this.timer = null;
    this.isIdle = false;
    
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.reset(), { passive: true });
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.goIdle();
      } else {
        this.reset();
      }
    });
    
    this.reset();
  }
  
  reset() {
    if (this.isIdle) {
      this.isIdle = false;
      this.onActive();
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.goIdle(), this.timeout);
  }
  
  goIdle() {
    this.isIdle = true;
    this.onIdle();
  }
  
  onIdle() {
    console.log('User is idle');
  }
  
  onActive() {
    console.log('User is active');
  }
}
```

---

## 3.11.8 Gotchas

```javascript
// ❌ Waiting for DOMContentLoaded when DOM is already ready
document.addEventListener('DOMContentLoaded', init);
// If script runs after DOM is ready, callback never fires!

// ✅ Check readyState first
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ❌ Using document.body before it exists
// In <head>, document.body is null
console.log(document.body);  // null in <head>

// ✅ Wait for DOMContentLoaded or use documentElement
document.addEventListener('DOMContentLoaded', () => {
  console.log(document.body);  // Now exists
});

// ❌ Fullscreen without user gesture
requestFullscreen();  // Will fail!

// ✅ Trigger from user interaction
button.addEventListener('click', () => {
  element.requestFullscreen();
});

// ❌ Forgetting vendor prefixes for older browsers
element.requestFullscreen();  // May not work

// ✅ Use with fallbacks
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  }
}
```

---

## 3.11.9 Summary

### Document Ready Events

| Event | When | Target |
|-------|------|--------|
| `DOMContentLoaded` | DOM parsed | document |
| `readystatechange` | readyState changes | document |
| `load` | All resources loaded | window |

### Document States

| readyState | Meaning |
|------------|---------|
| `"loading"` | Document loading |
| `"interactive"` | DOM ready |
| `"complete"` | Fully loaded |

### Fullscreen Events

| Event | When |
|-------|------|
| `fullscreenchange` | Enter/exit fullscreen |
| `fullscreenerror` | Fullscreen request failed |

### Key Properties

| Property | Description |
|----------|-------------|
| `document.readyState` | Current loading state |
| `document.hidden` | Page visibility boolean |
| `document.visibilityState` | "visible" or "hidden" |
| `document.fullscreenElement` | Current fullscreen element |
| `document.fullscreenEnabled` | Fullscreen supported |

### Best Practices

1. **Check `readyState` before adding `DOMContentLoaded`**
2. **Use `visibilitychange` for pausing/resuming**
3. **Fullscreen requires user gesture**
4. **Use `selectionchange` for custom selection UI**
5. **Handle both DOM ready and full load as needed**

---

**End of Chapter 3.11: Document Events**

Next chapter: **3.12 Custom Events** — covers creating and dispatching CustomEvent with detail data.
# 3.12 Custom Events

Custom events enable components to communicate without tight coupling. This chapter covers creating events with CustomEvent, dispatching them, passing data, and building event-driven architectures.

---

## 3.12.1 Creating Custom Events

### CustomEvent Constructor

```javascript
// Basic custom event
const event = new CustomEvent('myevent');

// Custom event with data
const eventWithData = new CustomEvent('userlogin', {
  detail: {
    userId: 123,
    username: 'alice',
    timestamp: Date.now()
  }
});

// Full options
const fullEvent = new CustomEvent('notification', {
  detail: { message: 'Hello!' },
  bubbles: true,       // Event bubbles up the DOM
  cancelable: true,    // Can be prevented with preventDefault()
  composed: true       // Crosses shadow DOM boundaries
});
```

### Event Constructor (Generic)

```javascript
// Basic Event (no detail property)
const event = new Event('customevent');

const bubblingEvent = new Event('customevent', {
  bubbles: true,
  cancelable: true
});

// Use CustomEvent when you need to pass data
// Use Event for simple notifications
```

---

## 3.12.2 Dispatching Events

### dispatchEvent

```javascript
// Dispatch on any element
const element = document.querySelector('#myComponent');

element.addEventListener('myevent', (e) => {
  console.log('Event received!');
});

element.dispatchEvent(new CustomEvent('myevent'));

// Dispatch with data
element.dispatchEvent(new CustomEvent('datachange', {
  detail: { newValue: 42 }
}));

// Dispatch returns false if event was cancelled
const event = new CustomEvent('action', { cancelable: true });
const wasNotCancelled = element.dispatchEvent(event);

if (!wasNotCancelled) {
  console.log('Event was cancelled');
}
```

### Dispatching on Document or Window

```javascript
// Global events often dispatch on document or window
document.dispatchEvent(new CustomEvent('app:ready', {
  detail: { version: '1.0.0' }
}));

window.dispatchEvent(new CustomEvent('theme:change', {
  detail: { theme: 'dark' }
}));

// Listeners
document.addEventListener('app:ready', (e) => {
  console.log('App version:', e.detail.version);
});
```

---

## 3.12.3 Accessing Event Data

### The detail Property

```javascript
// Sender
element.dispatchEvent(new CustomEvent('productselected', {
  detail: {
    product: {
      id: 'prod-123',
      name: 'Widget',
      price: 29.99
    },
    quantity: 2
  },
  bubbles: true
}));

// Receiver
document.addEventListener('productselected', (e) => {
  const { product, quantity } = e.detail;
  
  console.log(`Selected: ${quantity}x ${product.name}`);
  console.log(`Total: $${product.price * quantity}`);
});
```

### Event Properties

```javascript
element.addEventListener('myevent', (e) => {
  // Standard event properties
  console.log('Type:', e.type);
  console.log('Target:', e.target);
  console.log('Current Target:', e.currentTarget);
  console.log('Bubbles:', e.bubbles);
  console.log('Cancelable:', e.cancelable);
  console.log('Timestamp:', e.timeStamp);
  
  // Custom data
  console.log('Detail:', e.detail);
});
```

---

## 3.12.4 Bubbling and Propagation

### Bubbling Custom Events

```javascript
// Child dispatches event
child.dispatchEvent(new CustomEvent('itemclick', {
  bubbles: true,
  detail: { itemId: 42 }
}));

// Parent can listen
parent.addEventListener('itemclick', (e) => {
  console.log('Item clicked:', e.detail.itemId);
  console.log('Event came from:', e.target);
});

// This is event delegation with custom events
```

### Stopping Propagation

```javascript
// Stop bubbling
element.addEventListener('myevent', (e) => {
  e.stopPropagation();
  // Event won't reach parent listeners
});

// Stop all handlers
element.addEventListener('myevent', (e) => {
  e.stopImmediatePropagation();
  // No more handlers, including on same element
});
```

### Cancelable Events

```javascript
// Make event cancelable
const event = new CustomEvent('beforeaction', {
  cancelable: true,
  detail: { action: 'delete' }
});

// Listener can prevent default
element.addEventListener('beforeaction', (e) => {
  if (!confirm(`Are you sure you want to ${e.detail.action}?`)) {
    e.preventDefault();
  }
});

// Check if cancelled
const result = element.dispatchEvent(event);

if (result) {
  // Event was not cancelled, proceed
  performAction();
} else {
  // Event was cancelled
  console.log('Action cancelled');
}
```

---

## 3.12.5 Common Patterns

### Event Emitter Component

```javascript
class EventEmitter {
  constructor() {
    this.target = document.createDocumentFragment();
  }
  
  on(type, listener) {
    this.target.addEventListener(type, listener);
  }
  
  off(type, listener) {
    this.target.removeEventListener(type, listener);
  }
  
  emit(type, detail = {}) {
    const event = new CustomEvent(type, { detail });
    this.target.dispatchEvent(event);
  }
  
  once(type, listener) {
    this.target.addEventListener(type, listener, { once: true });
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on('message', (e) => {
  console.log('Message:', e.detail);
});

emitter.emit('message', { text: 'Hello!' });
```

### Component Communication

```javascript
// Cart Component
class CartComponent {
  constructor(element) {
    this.element = element;
    this.items = [];
  }
  
  addItem(product, quantity = 1) {
    this.items.push({ product, quantity });
    
    // Notify parent/other components
    this.element.dispatchEvent(new CustomEvent('cart:update', {
      bubbles: true,
      detail: {
        action: 'add',
        product,
        quantity,
        total: this.getTotal()
      }
    }));
  }
  
  getTotal() {
    return this.items.reduce((sum, item) => 
      sum + item.product.price * item.quantity, 0
    );
  }
}

// Header Component (listens for cart updates)
class HeaderComponent {
  constructor(element) {
    this.element = element;
    this.cartBadge = element.querySelector('.cart-badge');
    
    // Listen for cart events from anywhere in document
    document.addEventListener('cart:update', (e) => {
      this.updateCartBadge(e.detail);
    });
  }
  
  updateCartBadge({ total }) {
    this.cartBadge.textContent = `$${total.toFixed(2)}`;
  }
}
```

### Before/After Events

```javascript
class DataLoader {
  constructor(element) {
    this.element = element;
  }
  
  async load(url) {
    // Before event (cancelable)
    const beforeEvent = new CustomEvent('load:before', {
      cancelable: true,
      bubbles: true,
      detail: { url }
    });
    
    if (!this.element.dispatchEvent(beforeEvent)) {
      console.log('Load cancelled');
      return null;
    }
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Success event
      this.element.dispatchEvent(new CustomEvent('load:success', {
        bubbles: true,
        detail: { url, data }
      }));
      
      return data;
    } catch (error) {
      // Error event
      this.element.dispatchEvent(new CustomEvent('load:error', {
        bubbles: true,
        detail: { url, error }
      }));
      
      throw error;
    } finally {
      // After event (always fires)
      this.element.dispatchEvent(new CustomEvent('load:after', {
        bubbles: true,
        detail: { url }
      }));
    }
  }
}
```

### Pub/Sub System

```javascript
class PubSub {
  constructor() {
    this.channel = new EventTarget();
  }
  
  subscribe(topic, callback) {
    const handler = (e) => callback(e.detail);
    this.channel.addEventListener(topic, handler);
    
    // Return unsubscribe function
    return () => this.channel.removeEventListener(topic, handler);
  }
  
  publish(topic, data) {
    this.channel.dispatchEvent(new CustomEvent(topic, {
      detail: data
    }));
  }
}

// Global pub/sub
const pubsub = new PubSub();

// Subscribe
const unsubscribe = pubsub.subscribe('user:login', (user) => {
  console.log('User logged in:', user.name);
});

// Publish
pubsub.publish('user:login', { id: 1, name: 'Alice' });

// Unsubscribe when done
unsubscribe();
```

### Event-Driven State Management

```javascript
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.channel = new EventTarget();
  }
  
  getState() {
    return { ...this.state };
  }
  
  setState(updates) {
    const prevState = this.state;
    this.state = { ...this.state, ...updates };
    
    // Emit change event with diff
    const changed = Object.keys(updates).filter(
      key => prevState[key] !== this.state[key]
    );
    
    this.channel.dispatchEvent(new CustomEvent('change', {
      detail: {
        state: this.getState(),
        prevState,
        changed
      }
    }));
  }
  
  subscribe(callback) {
    const handler = (e) => callback(e.detail);
    this.channel.addEventListener('change', handler);
    return () => this.channel.removeEventListener('change', handler);
  }
}

// Usage
const store = new Store({ count: 0, user: null });

store.subscribe(({ state, changed }) => {
  console.log('State changed:', changed);
  console.log('New state:', state);
});

store.setState({ count: 1 });
store.setState({ user: { name: 'Alice' } });
```

---

## 3.12.6 Shadow DOM and composed

```javascript
// Events and shadow DOM
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <button id="inner">Click me</button>
    `;
    
    this.shadowRoot.querySelector('#inner').addEventListener('click', () => {
      // composed: true allows event to cross shadow boundary
      this.dispatchEvent(new CustomEvent('inner-click', {
        bubbles: true,
        composed: true,
        detail: { source: 'inner button' }
      }));
    });
  }
}

customElements.define('my-component', MyComponent);

// External listener can receive the event
document.querySelector('my-component').addEventListener('inner-click', (e) => {
  console.log('Received:', e.detail);
});
```

---

## 3.12.7 Gotchas

```javascript
// ❌ Forgetting to set bubbles: true
element.dispatchEvent(new CustomEvent('myevent', {
  detail: { data: 123 }
}));
// Parent listeners won't receive this!

// ✅ Set bubbles: true for event delegation
element.dispatchEvent(new CustomEvent('myevent', {
  bubbles: true,
  detail: { data: 123 }
}));

// ❌ Modifying detail object after dispatch
const detail = { value: 1 };
element.dispatchEvent(new CustomEvent('event', { detail }));
detail.value = 2;  // Might affect listeners still processing!

// ✅ Consider detail immutable
const detail = Object.freeze({ value: 1 });

// ❌ Using Event instead of CustomEvent for data
const event = new Event('myevent');
event.detail = { data: 123 };  // Won't work as expected

// ✅ Use CustomEvent for detail
const event = new CustomEvent('myevent', {
  detail: { data: 123 }
});

// ❌ Expecting sync behavior with async handlers
element.dispatchEvent(new CustomEvent('fetch', { cancelable: true }));
// If handler is async, dispatchEvent returns before handler completes

// ✅ Use before/after pattern or promises
const event = new CustomEvent('beforefetch', { cancelable: true });
if (element.dispatchEvent(event)) {
  await doFetch();
  element.dispatchEvent(new CustomEvent('afterfetch'));
}
```

---

## 3.12.8 Summary

### CustomEvent Options

| Option | Default | Description |
|--------|---------|-------------|
| `detail` | `null` | Custom data to pass |
| `bubbles` | `false` | Event bubbles up DOM |
| `cancelable` | `false` | Can use `preventDefault()` |
| `composed` | `false` | Crosses shadow DOM |

### Key Methods

| Method | Description |
|--------|-------------|
| `new CustomEvent(type, options)` | Create event |
| `element.dispatchEvent(event)` | Fire event |
| `event.preventDefault()` | Cancel (if cancelable) |
| `event.stopPropagation()` | Stop bubbling |

### Event Data Access

| Property | Description |
|----------|-------------|
| `event.type` | Event name |
| `event.target` | Element that dispatched |
| `event.detail` | Custom data object |

### Best Practices

1. **Use `bubbles: true`** for event delegation
2. **Use `cancelable: true`** for before-action events
3. **Namespace event names** (`app:event`, `cart:update`)
4. **Use CustomEvent for data**, Event for simple signals
5. **Consider detail immutable** after dispatch
6. **Use `composed: true`** for shadow DOM crossing

---

**End of Chapter 3.12: Custom Events**

Next chapter: **3.13 Event Delegation** — covers efficient event handling patterns for dynamic content.
# 3.13 Event Delegation

Event delegation uses event bubbling to handle events on multiple elements with a single listener. This chapter covers delegation patterns, performance benefits, and handling dynamic content.

---

## 3.13.1 What Is Event Delegation?

### The Problem

```javascript
// ❌ Without delegation: listener per element
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('click', handleClick);
});

// Problems:
// - Memory: 1000 buttons = 1000 listeners
// - Dynamic content: new buttons need manual listener attachment
// - Cleanup: must remove 1000 listeners on cleanup
```

### The Solution

```javascript
// ✅ With delegation: one listener on parent
const container = document.querySelector('.button-container');

container.addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleClick(e);
  }
});

// Benefits:
// - Memory: 1 listener regardless of button count
// - Dynamic content: new buttons work automatically
// - Cleanup: remove 1 listener
```

---

## 3.13.2 Basic Delegation Pattern

### Using matches()

```javascript
// Check if clicked element matches selector
document.addEventListener('click', (e) => {
  // Handle button clicks
  if (e.target.matches('.btn')) {
    handleButton(e.target);
  }
  
  // Handle link clicks
  if (e.target.matches('a[data-ajax]')) {
    e.preventDefault();
    handleAjaxLink(e.target);
  }
  
  // Handle delete buttons
  if (e.target.matches('.delete-btn')) {
    e.preventDefault();
    handleDelete(e.target);
  }
});
```

### Using closest() for Nested Elements

```javascript
// Handle clicks on buttons OR their children
// <button class="btn"><span class="icon">✓</span> Submit</button>

document.addEventListener('click', (e) => {
  // ❌ Fails when clicking the icon
  if (e.target.matches('.btn')) {
    handleButton(e.target);
  }
  
  // ✅ Works for button or any child
  const button = e.target.closest('.btn');
  if (button) {
    handleButton(button);
  }
});

// closest() returns the element itself or nearest ancestor matching selector
```

---

## 3.13.3 Data Attributes with Delegation

### Using data-action

```javascript
// HTML
// <button data-action="save">Save</button>
// <button data-action="delete">Delete</button>
// <button data-action="cancel">Cancel</button>

const actions = {
  save: () => saveDocument(),
  delete: () => deleteDocument(),
  cancel: () => cancelEdit()
};

document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action]');
  
  if (button) {
    const action = button.dataset.action;
    
    if (actions[action]) {
      actions[action](button);
    }
  }
});
```

### Using data-id

```javascript
// HTML
// <li data-id="1">Item 1 <button class="edit">Edit</button></li>
// <li data-id="2">Item 2 <button class="edit">Edit</button></li>

list.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit');
  
  if (editBtn) {
    const item = editBtn.closest('[data-id]');
    const id = item.dataset.id;
    
    editItem(id);
  }
});
```

---

## 3.13.4 Delegation for Dynamic Content

### Why It Works

```javascript
// Container exists when page loads
const list = document.querySelector('#todo-list');

// Single listener handles all items, even future ones
list.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.delete');
  if (deleteBtn) {
    deleteBtn.closest('li').remove();
  }
  
  const checkbox = e.target.closest('input[type="checkbox"]');
  if (checkbox) {
    toggleComplete(checkbox);
  }
});

// Adding new items - they work immediately!
function addTodo(text) {
  const li = document.createElement('li');
  li.innerHTML = `
    <input type="checkbox">
    <span>${text}</span>
    <button class="delete">×</button>
  `;
  list.appendChild(li);
  // No need to add event listeners!
}
```

### Framework-like Component Pattern

```javascript
class TodoList {
  constructor(container) {
    this.container = container;
    this.items = [];
    
    // One listener for all interactions
    container.addEventListener('click', (e) => this.handleClick(e));
    container.addEventListener('change', (e) => this.handleChange(e));
  }
  
  handleClick(e) {
    const target = e.target;
    
    if (target.closest('.delete')) {
      const item = target.closest('[data-id]');
      this.deleteItem(item.dataset.id);
    }
    
    if (target.closest('.edit')) {
      const item = target.closest('[data-id]');
      this.editItem(item.dataset.id);
    }
    
    if (target.closest('.add')) {
      this.addItem();
    }
  }
  
  handleChange(e) {
    if (e.target.matches('input[type="checkbox"]')) {
      const item = e.target.closest('[data-id]');
      this.toggleItem(item.dataset.id, e.target.checked);
    }
  }
  
  render() {
    this.container.innerHTML = this.items.map(item => `
      <li data-id="${item.id}">
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span>${item.text}</span>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </li>
    `).join('');
  }
  
  deleteItem(id) { /* ... */ }
  editItem(id) { /* ... */ }
  addItem() { /* ... */ }
  toggleItem(id, done) { /* ... */ }
}
```

---

## 3.13.5 Delegation Scope

### Document-Level Delegation

```javascript
// Handle all clicks on the page
document.addEventListener('click', (e) => {
  // Modals
  if (e.target.closest('.modal-close')) {
    closeModal(e.target.closest('.modal'));
  }
  
  // Dropdowns
  if (!e.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
  
  // Links
  if (e.target.closest('a[href^="#"]')) {
    e.preventDefault();
    smoothScrollTo(e.target.closest('a').hash);
  }
});
```

### Scoped Delegation

```javascript
// Limit scope to reduce unnecessary checks
const sidebar = document.querySelector('.sidebar');
const main = document.querySelector('.main-content');

// Sidebar-specific events
sidebar.addEventListener('click', (e) => {
  if (e.target.closest('.nav-link')) {
    handleNavigation(e.target.closest('.nav-link'));
  }
});

// Main content events
main.addEventListener('click', (e) => {
  if (e.target.closest('.card')) {
    handleCardClick(e.target.closest('.card'));
  }
});
```

---

## 3.13.6 Multiple Event Types

### Combined Delegation

```javascript
class InteractiveList {
  constructor(element) {
    this.element = element;
    
    // Multiple event types
    element.addEventListener('click', (e) => this.onClick(e));
    element.addEventListener('dblclick', (e) => this.onDblClick(e));
    element.addEventListener('keydown', (e) => this.onKeydown(e));
    element.addEventListener('focusin', (e) => this.onFocus(e));
    element.addEventListener('focusout', (e) => this.onBlur(e));
  }
  
  onClick(e) {
    const item = e.target.closest('.item');
    if (item) this.selectItem(item);
  }
  
  onDblClick(e) {
    const item = e.target.closest('.item');
    if (item) this.editItem(item);
  }
  
  onKeydown(e) {
    const item = e.target.closest('.item');
    if (!item) return;
    
    switch (e.key) {
      case 'Enter':
        this.activateItem(item);
        break;
      case 'Delete':
        this.deleteItem(item);
        break;
      case 'ArrowDown':
        this.focusNext(item);
        e.preventDefault();
        break;
      case 'ArrowUp':
        this.focusPrevious(item);
        e.preventDefault();
        break;
    }
  }
  
  onFocus(e) {
    const item = e.target.closest('.item');
    if (item) item.classList.add('focused');
  }
  
  onBlur(e) {
    const item = e.target.closest('.item');
    if (item) item.classList.remove('focused');
  }
  
  // ...methods
}
```

---

## 3.13.7 Performance Considerations

### When Delegation Helps

```javascript
// ✅ Many similar elements
const list = document.querySelector('#user-list');
list.addEventListener('click', handleUserClick);

// ✅ Frequently added/removed elements
const chat = document.querySelector('#chat-messages');
chat.addEventListener('click', handleMessageClick);

// ✅ Memory-constrained environments
// 1 listener vs thousands
```

### When Direct Listeners Are Fine

```javascript
// ✅ Few static elements
const submitBtn = document.querySelector('#submit');
submitBtn.addEventListener('click', handleSubmit);

// ✅ Unique handlers
const playBtn = document.querySelector('#play');
const pauseBtn = document.querySelector('#pause');

playBtn.addEventListener('click', play);
pauseBtn.addEventListener('click', pause);

// ✅ Complex event handling needing specific options
element.addEventListener('scroll', handler, { passive: true });
```

### Avoiding Over-Delegation

```javascript
// ❌ Too generic - checks every click
document.addEventListener('click', (e) => {
  // Inefficient if most clicks aren't handled
  if (e.target.closest('.specific-component .specific-button')) {
    // ...
  }
});

// ✅ Scope to relevant container
const component = document.querySelector('.specific-component');
component.addEventListener('click', (e) => {
  if (e.target.closest('.specific-button')) {
    // ...
  }
});
```

---

## 3.13.8 Common Patterns

### Table Row Actions

```javascript
const table = document.querySelector('table');

table.addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (!row) return;
  
  const rowId = row.dataset.id;
  
  if (e.target.closest('.edit-btn')) {
    editRow(rowId);
  } else if (e.target.closest('.delete-btn')) {
    deleteRow(rowId);
  } else if (e.target.closest('.view-btn')) {
    viewRow(rowId);
  } else {
    // Click on row itself
    selectRow(row);
  }
});
```

### Accordion

```javascript
const accordion = document.querySelector('.accordion');

accordion.addEventListener('click', (e) => {
  const header = e.target.closest('.accordion-header');
  if (!header) return;
  
  const item = header.closest('.accordion-item');
  const content = item.querySelector('.accordion-content');
  
  // Close others (optional)
  accordion.querySelectorAll('.accordion-item.open').forEach(other => {
    if (other !== item) {
      other.classList.remove('open');
    }
  });
  
  // Toggle this one
  item.classList.toggle('open');
});
```

### Tab Panel

```javascript
const tabContainer = document.querySelector('.tabs');

tabContainer.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (!tab) return;
  
  // Update tab states
  tabContainer.querySelectorAll('[role="tab"]').forEach(t => {
    t.setAttribute('aria-selected', t === tab);
  });
  
  // Show corresponding panel
  const panelId = tab.getAttribute('aria-controls');
  const panels = document.querySelectorAll('[role="tabpanel"]');
  
  panels.forEach(panel => {
    panel.hidden = panel.id !== panelId;
  });
});
```

### Form Validation

```javascript
const form = document.querySelector('form');

form.addEventListener('focusout', (e) => {
  const input = e.target.closest('input, textarea, select');
  if (!input) return;
  
  validateField(input);
});

form.addEventListener('input', (e) => {
  const input = e.target.closest('input, textarea');
  if (!input) return;
  
  // Clear error on input
  clearError(input);
});
```

---

## 3.13.9 Gotchas

```javascript
// ❌ Stopping propagation breaks delegation
button.addEventListener('click', (e) => {
  e.stopPropagation();  // Parent delegation won't work!
});

// ✅ Be careful with stopPropagation
// Only use when intentionally blocking bubbling

// ❌ Forgetting to check with closest()
list.addEventListener('click', (e) => {
  if (e.target.classList.contains('item')) {  // Misses child clicks
    handleItem(e.target);
  }
});

// ✅ Use closest() for nested elements
list.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) {
    handleItem(item);
  }
});

// ❌ Events that don't bubble
container.addEventListener('focus', handler);  // Won't catch children!
container.addEventListener('blur', handler);

// ✅ Use focusin/focusout (they bubble)
container.addEventListener('focusin', handler);
container.addEventListener('focusout', handler);

// ❌ Relying on currentTarget in async code
container.addEventListener('click', async (e) => {
  await someAsyncOperation();
  console.log(e.currentTarget);  // Might be null!
});

// ✅ Store reference before async
container.addEventListener('click', async (e) => {
  const container = e.currentTarget;
  await someAsyncOperation();
  console.log(container);  // Safe
});
```

---

## 3.13.10 Summary

### Core Pattern

```javascript
// 1. Listen on parent/container
container.addEventListener('click', (e) => {
  // 2. Check what was clicked
  const target = e.target.closest('.selector');
  
  // 3. Handle if match found
  if (target) {
    handleElement(target);
  }
});
```

### Key Methods

| Method | Description |
|--------|-------------|
| `element.matches(selector)` | Check if element matches |
| `element.closest(selector)` | Find nearest matching ancestor |

### Events That Bubble

| Bubbles | Doesn't Bubble |
|---------|----------------|
| `click`, `dblclick` | `focus`, `blur` |
| `keydown`, `keyup` | `mouseenter`, `mouseleave` |
| `input`, `change` | `load`, `error` (on elements) |
| `submit`, `reset` | |
| `focusin`, `focusout` | |

### Best Practices

1. **Use `closest()` for nested elements** — handles child clicks
2. **Use `data-*` attributes** for action/id identification
3. **Scope to relevant container** — not always document
4. **Use `focusin`/`focusout`** instead of `focus`/`blur` for delegation
5. **Don't over-delegate** — balance with direct listeners
6. **Be careful with `stopPropagation`** — breaks parent delegation

### When to Delegate

| Delegate | Direct Listener |
|----------|-----------------|
| Many similar elements | Few static elements |
| Dynamic content | Unique handlers per element |
| Memory constrained | Special event options needed |

---

**End of Chapter 3.13: Event Delegation**

**End of Group 3: Events**

Next group: **4. Forms** — covers form elements, validation, FormData, and submission handling.
