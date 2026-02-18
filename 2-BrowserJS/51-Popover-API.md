# 51.1 Popover API

The Popover API provides native support for dismissible popup content.

---

## 51.1.1 Declarative Popover

```html
<button popovertarget="my-popover">Open</button>

<div id="my-popover" popover>
  <p>Popover content</p>
</div>
```

---

## 51.1.2 Popover Modes

```html
<!-- Auto: closes when clicking outside or pressing Escape -->
<div popover="auto">Auto popover</div>

<!-- Manual: must be closed programmatically -->
<div popover="manual">Manual popover</div>
```

---

## 51.1.3 JavaScript Control

```javascript
const popover = document.getElementById('my-popover');

// Show
popover.showPopover();

// Hide
popover.hidePopover();

// Toggle
popover.togglePopover();

// Check state
console.log(popover.matches(':popover-open'));
```

---

## 51.1.4 Events

```javascript
popover.addEventListener('toggle', (event) => {
  if (event.newState === 'open') {
    console.log('Popover opened');
  } else {
    console.log('Popover closed');
  }
});

popover.addEventListener('beforetoggle', (event) => {
  if (event.newState === 'open') {
    // Prepare content before opening
  }
});
```

---

## 51.1.5 Styling

```css
[popover] {
  /* Positioning */
  position: fixed;
  inset: unset;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
}

/* Backdrop */
[popover]::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

/* Open state */
[popover]:popover-open {
  display: block;
}
```

---

## 51.1.6 Summary

| Attribute/Method | Description |
|------------------|-------------|
| `popover="auto"` | Light dismiss |
| `popover="manual"` | Manual control |
| `showPopover()` | Open popover |
| `hidePopover()` | Close popover |
| `togglePopover()` | Toggle state |

---

**End of Chapter 51.1: Popover API**

This completes Group 51. Next: **Group 52 — Dialog Element**.
