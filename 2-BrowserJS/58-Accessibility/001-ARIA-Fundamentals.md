# 58.1 ARIA Fundamentals

Accessible Rich Internet Applications (ARIA) enhances HTML accessibility for assistive technologies.

---

## 58.1.1 ARIA Roles

### Landmark Roles

```html
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Widget Roles

```html
<div role="button" tabindex="0">Click me</div>
<div role="checkbox" aria-checked="false">Option</div>
<div role="dialog" aria-labelledby="title">...</div>
<ul role="menu">...</ul>
<div role="tablist">...</div>
```

---

## 58.1.2 ARIA States and Properties

### Common States

```html
<!-- Expanded/Collapsed -->
<button aria-expanded="false" aria-controls="menu">Menu</button>

<!-- Selected -->
<li role="option" aria-selected="true">Item</li>

<!-- Disabled -->
<button aria-disabled="true">Disabled</button>

<!-- Busy/Loading -->
<div aria-busy="true">Loading...</div>
```

### Common Properties

```html
<!-- Label -->
<input aria-label="Search" type="search">

<!-- Labelled by -->
<div id="title">Dialog Title</div>
<div role="dialog" aria-labelledby="title">...</div>

<!-- Described by -->
<input aria-describedby="hint">
<p id="hint">Enter your email</p>
```

---

## 58.1.3 Live Regions

### Announce Changes

```html
<!-- Polite: announce when idle -->
<div aria-live="polite" aria-atomic="true">
  Status message
</div>

<!-- Assertive: announce immediately -->
<div aria-live="assertive" role="alert">
  Error: Invalid input
</div>
```

### Dynamic Updates

```javascript
const status = document.getElementById('status');
status.setAttribute('aria-live', 'polite');

// Changes will be announced
status.textContent = 'File uploaded successfully';
```

---

## 58.1.4 Best Practices

### Use Semantic HTML First

```html
<!-- ❌ ARIA when native element exists -->
<div role="button">Click</div>

<!-- ✅ Use native elements -->
<button>Click</button>
```

### Don't Override Semantics

```html
<!-- ❌ Wrong: button with heading role -->
<button role="heading">Title</button>

<!-- ✅ Correct -->
<h2>Title</h2>
```

---

## 58.1.5 Summary

| Category | Examples |
|----------|----------|
| Landmarks | banner, navigation, main, complementary |
| Widgets | button, checkbox, dialog, menu, tab |
| States | expanded, selected, disabled, busy |
| Properties | label, labelledby, describedby |
| Live Regions | polite, assertive, atomic |

---

**End of Chapter 58.1: ARIA Fundamentals**

Next: **58.2 Keyboard Navigation**.
