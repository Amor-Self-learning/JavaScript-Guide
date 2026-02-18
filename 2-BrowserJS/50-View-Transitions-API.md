# 50.1 View Transitions

The View Transitions API enables smooth animated transitions between DOM states.

---

## 50.1.1 Basic Transition

```javascript
document.startViewTransition(() => {
  // Update DOM
  document.body.innerHTML = newContent;
});
```

---

## 50.1.2 Transition Lifecycle

```javascript
const transition = document.startViewTransition(async () => {
  await updateDOM();
});

// Wait for transition ready (screenshot taken)
await transition.ready;

// Wait for animation complete
await transition.finished;
```

---

## 50.1.3 Custom Animations

```css
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 50.1.4 Named Transitions

```html
<header style="view-transition-name: header"></header>
```

```css
::view-transition-old(header) {
  animation: slide-out 0.3s;
}

::view-transition-new(header) {
  animation: slide-in 0.3s;
}
```

---

## 50.1.5 Skip Transition

```javascript
const transition = document.startViewTransition(() => updateDOM());

// Skip animation
transition.skipTransition();
```

---

## 50.1.6 Summary

| Pseudo-element | Description |
|----------------|-------------|
| `::view-transition` | Transition root |
| `::view-transition-old(name)` | Outgoing state |
| `::view-transition-new(name)` | Incoming state |
| `::view-transition-group(name)` | Transition group |
| `::view-transition-image-pair(name)` | Image pair |

---

**End of Chapter 50.1: View Transitions**

This completes Group 50 — View Transitions API. Next: **Group 51 — Popover API**.
