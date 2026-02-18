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
