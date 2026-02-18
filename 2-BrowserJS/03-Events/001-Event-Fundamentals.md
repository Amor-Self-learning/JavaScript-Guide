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
