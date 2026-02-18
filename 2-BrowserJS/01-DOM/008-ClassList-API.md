# 1.8 ClassList API

The `classList` property provides a powerful, intuitive API for manipulating CSS classes on elements. Before `classList`, developers used string manipulation on the `className` property — error-prone and verbose. `classList` makes class manipulation clean, efficient, and safe.

This chapter covers the complete `classList` API with practical patterns for state management, animations, and component development.

---

## 1.8.1 The DOMTokenList Interface

`classList` returns a `DOMTokenList` — a live, ordered collection of class tokens.

### Basic Access

```javascript
const element = document.getElementById('card');
// <div id="card" class="card featured active">

// Access classList
const classes = element.classList;

console.log(classes);          // DOMTokenList ["card", "featured", "active"]
console.log(classes.length);   // 3
console.log(classes[0]);       // "card"
console.log(classes[1]);       // "featured"
console.log(classes.value);    // "card featured active" (string)
```

### Live Nature

```javascript
const classes = element.classList;
console.log(classes.length);  // 3

element.classList.add('new-class');
console.log(classes.length);  // 4 (automatically updated)

// classList and className are linked
element.className = 'single-class';
console.log(classes.length);  // 1 (reflects className change)
```

### Iteration

```javascript
const element = document.querySelector('.multi-class');

// forEach
element.classList.forEach(className => {
  console.log(className);
});

// for...of
for (const className of element.classList) {
  console.log(className);
}

// Convert to array
const classArray = Array.from(element.classList);
const classArray2 = [...element.classList];

// entries, keys, values
for (const [index, className] of element.classList.entries()) {
  console.log(`${index}: ${className}`);
}
```

---

## 1.8.2 add()

Adds one or more classes to the element.

### Basic Usage

```javascript
const element = document.getElementById('box');

// Add single class
element.classList.add('active');

// Add multiple classes
element.classList.add('highlighted', 'visible', 'animated');

// Spread array of classes
const classesToAdd = ['class1', 'class2', 'class3'];
element.classList.add(...classesToAdd);
```

### Behavior Details

```javascript
// Adding existing class does nothing (no duplicates)
element.classList.add('active');
element.classList.add('active');  // No error, no duplicate
console.log(element.className);   // "... active ..." (only once)

// Empty strings and whitespace throw errors
element.classList.add('');           // SyntaxError!
element.classList.add('has space');  // InvalidCharacterError!
element.classList.add('has\ttab');   // InvalidCharacterError!

// Returns undefined
const result = element.classList.add('test');
console.log(result);  // undefined
```

### Common Patterns

```javascript
// Show element
element.classList.add('visible');

// Activate item
element.classList.add('active');

// Apply animation
element.classList.add('animate-fade-in');

// Multiple state classes
function selectCard(card) {
  card.classList.add('selected', 'elevated', 'focused');
}
```

---

## 1.8.3 remove()

Removes one or more classes from the element.

### Basic Usage

```javascript
const element = document.getElementById('modal');

// Remove single class
element.classList.remove('hidden');

// Remove multiple classes
element.classList.remove('loading', 'pending', 'disabled');

// Spread array
const classesToRemove = ['temp1', 'temp2'];
element.classList.remove(...classesToRemove);
```

### Behavior Details

```javascript
// Removing non-existent class does nothing (no error)
element.classList.remove('nonexistent');  // Safe, no error

// Cannot remove with empty/whitespace strings
element.classList.remove('');           // SyntaxError!
element.classList.remove('has space');  // InvalidCharacterError!

// Returns undefined
const result = element.classList.remove('test');
console.log(result);  // undefined
```

### Common Patterns

```javascript
// Hide element
element.classList.remove('visible');

// Clear loading state
element.classList.remove('loading', 'spinner-active');

// Cleanup animation classes
function onAnimationEnd(element) {
  element.classList.remove(
    'animate-slide-in',
    'animate-fade-in',
    'animate-bounce'
  );
}

// Remove all matching classes
function removeClassesStartingWith(element, prefix) {
  const toRemove = Array.from(element.classList)
    .filter(c => c.startsWith(prefix));
  element.classList.remove(...toRemove);
}

removeClassesStartingWith(element, 'temp-');
```

---

## 1.8.4 toggle()

Toggles a class — adds if missing, removes if present.

### Basic Usage

```javascript
const button = document.getElementById('toggle-btn');

// Toggle class
button.classList.toggle('active');

// Returns new state: true if added, false if removed
const isNowActive = button.classList.toggle('active');
console.log(isNowActive);  // true or false
```

### Conditional Toggle (Force Parameter)

```javascript
const element = document.getElementById('box');

// toggle(class, force)
// force = true: always add (like add)
// force = false: always remove (like remove)

element.classList.toggle('visible', true);   // Always adds
element.classList.toggle('visible', false);  // Always removes

// Useful for binding to conditions
const isLoggedIn = checkAuth();
element.classList.toggle('authenticated', isLoggedIn);
element.classList.toggle('guest', !isLoggedIn);

// Sync with variable
let darkMode = loadPreference('darkMode');
document.body.classList.toggle('dark-theme', darkMode);

function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-theme', darkMode);
  savePreference('darkMode', darkMode);
}
```

### Common Patterns

```javascript
// Expand/collapse
function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const isExpanded = header.classList.toggle('expanded');
  content.classList.toggle('expanded', isExpanded);
  header.setAttribute('aria-expanded', isExpanded);
}

// Menu toggle
function toggleMenu() {
  const isOpen = navMenu.classList.toggle('open');
  menuButton.classList.toggle('active', isOpen);
  menuButton.setAttribute('aria-expanded', isOpen);
}

// Selection toggle
function toggleSelection(item) {
  item.classList.toggle('selected');
}

// Toggle with animation
function togglePanel(panel) {
  const isOpening = panel.classList.toggle('open');
  
  if (isOpening) {
    panel.classList.add('animating-in');
    panel.addEventListener('animationend', () => {
      panel.classList.remove('animating-in');
    }, { once: true });
  } else {
    panel.classList.add('animating-out');
    panel.addEventListener('animationend', () => {
      panel.classList.remove('animating-out');
    }, { once: true });
  }
}
```

---

## 1.8.5 contains()

Checks if the element has a specific class.

### Basic Usage

```javascript
const element = document.getElementById('box');

// Check for class
const hasActive = element.classList.contains('active');
console.log(hasActive);  // true or false

// Common usage
if (element.classList.contains('loading')) {
  console.log('Still loading...');
}

if (!element.classList.contains('initialized')) {
  initializeComponent(element);
  element.classList.add('initialized');
}
```

### Patterns

```javascript
// State checking
function isSelected(item) {
  return item.classList.contains('selected');
}

// Filter elements by class
const cards = document.querySelectorAll('.card');
const activeCards = Array.from(cards)
  .filter(card => card.classList.contains('active'));

// Conditional actions
function handleClick(element) {
  if (element.classList.contains('disabled')) {
    return;  // Don't process disabled elements
  }
  
  if (element.classList.contains('expandable')) {
    toggleExpand(element);
  }
}

// Accessibility: sync with ARIA
function updateAccessibility(button) {
  const isPressed = button.classList.contains('pressed');
  button.setAttribute('aria-pressed', isPressed);
}
```

---

## 1.8.6 replace()

Replaces one class with another in a single operation.

### Basic Usage

```javascript
const element = document.getElementById('status');

// Replace old class with new class
element.classList.replace('loading', 'loaded');

// Returns true if old class was replaced
const wasReplaced = element.classList.replace('pending', 'complete');
console.log(wasReplaced);  // true if 'pending' existed and was replaced

// Returns false if old class didn't exist
const notReplaced = element.classList.replace('nonexistent', 'new');
console.log(notReplaced);  // false (nothing happened)
```

### vs remove() + add()

```javascript
// These are functionally similar but...
element.classList.replace('old', 'new');

// vs
element.classList.remove('old');
element.classList.add('new');

// replace() advantages:
// - Single operation (potentially faster)
// - Returns whether replacement occurred
// - More semantic intent
// - Atomic: both happen or neither

// remove+add advantages:
// - Works even if old class doesn't exist
// - Can remove/add different numbers of classes
```

### Common Patterns

```javascript
// State transitions
function setStatus(element, newStatus) {
  const statuses = ['pending', 'loading', 'success', 'error'];
  
  for (const status of statuses) {
    if (element.classList.contains(status)) {
      element.classList.replace(status, newStatus);
      return;
    }
  }
  
  // No existing status found, just add
  element.classList.add(newStatus);
}

// Theme switching
function setTheme(theme) {
  const themes = ['theme-light', 'theme-dark', 'theme-auto'];
  const newTheme = `theme-${theme}`;
  
  for (const t of themes) {
    if (document.body.classList.replace(t, newTheme)) {
      return;  // Replaced existing theme
    }
  }
  
  // No existing theme, add new one
  document.body.classList.add(newTheme);
}

// Size variants
function setSize(element, size) {
  const sizes = ['size-sm', 'size-md', 'size-lg', 'size-xl'];
  const newSize = `size-${size}`;
  
  for (const s of sizes) {
    element.classList.replace(s, newSize);
  }
}
```

---

## 1.8.7 item() and Index Access

Access classes by index.

### Usage

```javascript
const element = document.querySelector('.multi-class');
// <div class="primary secondary tertiary">

// Index access
console.log(element.classList[0]);  // "primary"
console.log(element.classList[1]);  // "secondary"

// item() method
console.log(element.classList.item(0));  // "primary"
console.log(element.classList.item(2));  // "tertiary"

// Out of bounds
console.log(element.classList[99]);       // undefined
console.log(element.classList.item(99));  // null

// Practical use is rare - usually use contains() instead
```

---

## 1.8.8 value Property

Access or set all classes as a string.

### Usage

```javascript
const element = document.querySelector('.card');

// Read all classes as string
console.log(element.classList.value);  // "card featured active"

// Same as className
console.log(element.classList.value === element.className);  // true

// Set all classes
element.classList.value = 'new-class other-class';
// Replaces all existing classes

// Functionally same as:
element.className = 'new-class other-class';
```

---

## 1.8.9 Advanced Patterns

### State Machine with Classes

```javascript
class ElementStateMachine {
  constructor(element, states) {
    this.element = element;
    this.states = states;
    this.currentState = null;
  }
  
  setState(newState) {
    if (!this.states.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }
    
    // Remove current state
    if (this.currentState) {
      this.element.classList.remove(`state-${this.currentState}`);
    }
    
    // Add new state
    this.element.classList.add(`state-${newState}`);
    this.currentState = newState;
    
    // Emit event
    this.element.dispatchEvent(new CustomEvent('statechange', {
      detail: { from: this.currentState, to: newState }
    }));
  }
  
  getState() {
    return this.currentState;
  }
}

// Usage
const button = document.getElementById('submit-btn');
const buttonState = new ElementStateMachine(button, [
  'idle', 'loading', 'success', 'error'
]);

buttonState.setState('loading');
// Button now has class "state-loading"
```

### BEM Modifier Management

```javascript
// BEM: Block__Element--Modifier pattern
class BEMElement {
  constructor(element, block, elementName = null) {
    this.element = element;
    this.prefix = elementName ? `${block}__${elementName}` : block;
  }
  
  addModifier(modifier) {
    this.element.classList.add(`${this.prefix}--${modifier}`);
    return this;
  }
  
  removeModifier(modifier) {
    this.element.classList.remove(`${this.prefix}--${modifier}`);
    return this;
  }
  
  toggleModifier(modifier, force) {
    this.element.classList.toggle(`${this.prefix}--${modifier}`, force);
    return this;
  }
  
  hasModifier(modifier) {
    return this.element.classList.contains(`${this.prefix}--${modifier}`);
  }
}

// Usage
const card = new BEMElement(document.querySelector('.card'), 'card');
card.addModifier('featured')
    .addModifier('large');
// Classes: card card--featured card--large

const cardTitle = new BEMElement(
  document.querySelector('.card__title'), 
  'card', 
  'title'
);
cardTitle.addModifier('bold');
// Classes: card__title card__title--bold
```

### Animation Helpers

```javascript
// Trigger CSS animation and clean up
function animate(element, animationClass) {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    
    element.addEventListener('animationend', function handler(e) {
      if (e.target === element) {
        element.classList.remove(animationClass);
        element.removeEventListener('animationend', handler);
        resolve();
      }
    });
  });
}

// Usage
async function showNotification(element) {
  await animate(element, 'slide-in');
  await delay(3000);
  await animate(element, 'fade-out');
  element.remove();
}

// One-time animation
function animateOnce(element, animationClass) {
  element.classList.add(animationClass);
  element.addEventListener('animationend', () => {
    element.classList.remove(animationClass);
  }, { once: true });
}
```

### Conditional Class Application

```javascript
// Apply classes based on conditions
function applyClasses(element, classConditions) {
  for (const [className, condition] of Object.entries(classConditions)) {
    element.classList.toggle(className, Boolean(condition));
  }
}

// Usage
applyClasses(element, {
  'is-active': isActive,
  'is-disabled': isDisabled,
  'is-loading': isLoading,
  'has-error': errorMessage,
  'is-empty': items.length === 0
});

// With computed classes
function computeClasses(state) {
  return {
    'card': true,
    'card--featured': state.featured,
    'card--archived': state.archived,
    [`card--${state.size}`]: state.size,
    [`card--theme-${state.theme}`]: state.theme
  };
}

function setClasses(element, classMap) {
  for (const [className, shouldHave] of Object.entries(classMap)) {
    if (shouldHave) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
}

setClasses(cardElement, computeClasses(cardState));
```

---

## 1.8.10 Comparison: classList vs className

### className (Legacy Approach)

```javascript
// Read
const classes = element.className;  // "card active featured"

// Set (replaces ALL classes)
element.className = 'card';

// Add class (string manipulation)
element.className += ' active';  // ⚠️ Leading space needed!

// Remove class (regex)
element.className = element.className.replace(/\bactive\b/g, '').trim();

// Check for class
const hasActive = /\bactive\b/.test(element.className);

// Toggle (complex!)
if (/\bactive\b/.test(element.className)) {
  element.className = element.className.replace(/\bactive\b/g, '');
} else {
  element.className += ' active';
}
```

### classList (Modern Approach)

```javascript
// Read
const classes = element.classList;  // DOMTokenList

// Add
element.classList.add('active');

// Remove
element.classList.remove('active');

// Check
const hasActive = element.classList.contains('active');

// Toggle
element.classList.toggle('active');
```

### Verdict

| Feature | className | classList |
|---------|-----------|-----------|
| Add single class | Awkward | Clean |
| Remove class | Regex needed | Simple |
| Toggle | Manual logic | Built-in |
| Check | Regex needed | Built-in |
| Multiple operations | Multiple assignments | Chained methods |
| Replace all | Direct | Use `.value` |
| Performance | Slightly faster write | Negligible difference |

**Use `classList`** for all class manipulation. **Use `className`** only when you need to replace all classes at once.

---

## 1.8.11 Summary

| Method | Purpose | Returns |
|--------|---------|---------|
| `add(...classes)` | Add classes | `undefined` |
| `remove(...classes)` | Remove classes | `undefined` |
| `toggle(class, force?)` | Toggle class | `boolean` (new state) |
| `contains(class)` | Check for class | `boolean` |
| `replace(old, new)` | Replace class | `boolean` (success) |
| `item(index)` | Get class by index | `string` or `null` |
| `length` | Number of classes | `number` |
| `value` | All classes as string | `string` |

### Best Practices

1. **Use `classList` over `className`** — cleaner, safer, more powerful
2. **Use `toggle` with force parameter** for syncing with state
3. **Use `contains` before conditional operations** when appropriate
4. **Use `replace` for state transitions** — cleaner than remove+add
5. **Handle animation cleanup** — remove animation classes after completion
6. **Consider utility classes** — build helpers for complex patterns
7. **Keep class lists short** — many classes indicate potential refactoring

### Gotchas

```javascript
// ❌ Classes cannot contain spaces
element.classList.add('has space');  // InvalidCharacterError

// ❌ Cannot add empty string
element.classList.add('');  // SyntaxError

// ⚠️ classList is live — loops can be affected
element.classList.forEach(c => element.classList.remove(c));
// May not remove all classes due to live nature

// ✅ Convert to array first
[...element.classList].forEach(c => element.classList.remove(c));
```

---

**End of Chapter 1.8: ClassList API**

This completes Group 01: DOM. Next group: **02 — Browser Object Model (BOM)** — starting with **2.1 Window Object**.
