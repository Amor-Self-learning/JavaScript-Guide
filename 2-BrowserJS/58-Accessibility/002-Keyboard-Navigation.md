# 58.2 Keyboard Navigation

Proper keyboard navigation ensures all users can interact with your application.

---

## 58.2.1 Tab Order

### Natural Tab Order

```html
<!-- Follow DOM order -->
<input type="text">    <!-- Tab 1 -->
<button>Submit</button> <!-- Tab 2 -->
<a href="#">Link</a>    <!-- Tab 3 -->
```

### Modify Tab Order

```html
<!-- Remove from tab order -->
<div tabindex="-1">Not tabbable, but focusable programmatically</div>

<!-- Add to tab order -->
<div tabindex="0">Tabbable in DOM order</div>

<!-- ❌ Avoid positive tabindex -->
<div tabindex="1">Avoid this</div>
```

---

## 58.2.2 Focus Management

### Programmatic Focus

```javascript
// Focus element
element.focus();

// Focus with scroll prevention
element.focus({ preventScroll: true });

// Check current focus
const focused = document.activeElement;
```

### Focus Trapping (Modal)

```javascript
function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
```

---

## 58.2.3 Keyboard Shortcuts

### Handle Key Events

```javascript
element.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      activate();
      break;
    case 'Escape':
      close();
      break;
    case 'ArrowDown':
      e.preventDefault();
      focusNext();
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusPrevious();
      break;
  }
});
```

---

## 58.2.4 Focus Indicators

### CSS Focus Styles

```css
/* Always provide visible focus */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Focus-visible for keyboard only */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

---

## 58.2.5 Summary

| Concept | Best Practice |
|---------|---------------|
| Tab order | Use tabindex 0 or -1 only |
| Focus management | Trap focus in modals |
| Keyboard events | Handle Enter, Space, Escape, Arrows |
| Focus indicators | Always visible, use :focus-visible |

---

**End of Chapter 58.2: Keyboard Navigation**

Next: **58.3 Screen Reader Support**.
