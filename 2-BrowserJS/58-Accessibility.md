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
# 58.3 Screen Reader Support

Screen readers vocalize page content for visually impaired users.

---

## 58.3.1 Accessible Names

### Provide Labels

```html
<!-- Visible label -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- aria-label (invisible) -->
<button aria-label="Close dialog">×</button>

<!-- aria-labelledby -->
<h2 id="section-title">Settings</h2>
<section aria-labelledby="section-title">...</section>
```

---

## 58.3.2 Alternative Text

### Images

```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 25% in Q4">

<!-- Decorative image -->
<img src="decoration.png" alt="" role="presentation">

<!-- Complex image -->
<figure>
  <img src="diagram.png" alt="System architecture diagram">
  <figcaption>Detailed description...</figcaption>
</figure>
```

---

## 58.3.3 Hidden Content

### Visually Hidden

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```html
<button>
  <span class="visually-hidden">Close</span>
  <span aria-hidden="true">×</span>
</button>
```

### Hide from Screen Readers

```html
<!-- Hide decorative content -->
<span aria-hidden="true">★★★★☆</span>
<span class="visually-hidden">4 out of 5 stars</span>
```

---

## 58.3.4 Descriptions

### Additional Context

```html
<input 
  type="password"
  aria-describedby="password-requirements"
>
<p id="password-requirements">
  Must be 8+ characters with a number
</p>
```

---

## 58.3.5 Summary

| Technique | Use Case |
|-----------|----------|
| `aria-label` | Invisible label |
| `aria-labelledby` | Reference existing text |
| `aria-describedby` | Additional context |
| `aria-hidden` | Hide from screen readers |
| `alt=""` | Decorative images |
| `.visually-hidden` | Screen reader only text |

---

**End of Chapter 58.3: Screen Reader Support**

Next: **58.4 Accessible Forms**.
# 58.4 Accessible Forms

Forms must be usable by all users including those with assistive technologies.

---

## 58.4.1 Labels

### Explicit Labels

```html
<label for="name">Name</label>
<input id="name" type="text">
```

### Implicit Labels

```html
<label>
  Name
  <input type="text">
</label>
```

---

## 58.4.2 Required Fields

```html
<label for="email">
  Email <span aria-hidden="true">*</span>
</label>
<input id="email" type="email" aria-required="true" required>
```

---

## 58.4.3 Error Messages

### Associate Errors

```html
<label for="email">Email</label>
<input 
  id="email" 
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

### Error Summary

```html
<div role="alert" aria-labelledby="error-heading">
  <h2 id="error-heading">Please fix the following errors:</h2>
  <ul>
    <li><a href="#email">Email is required</a></li>
    <li><a href="#password">Password too short</a></li>
  </ul>
</div>
```

---

## 58.4.4 Field Groups

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input id="street" type="text">
  <!-- More fields -->
</fieldset>

<!-- Radio/Checkbox groups -->
<fieldset>
  <legend>Payment Method</legend>
  <input type="radio" id="card" name="payment">
  <label for="card">Credit Card</label>
  <input type="radio" id="paypal" name="payment">
  <label for="paypal">PayPal</label>
</fieldset>
```

---

## 58.4.5 Input Hints

```html
<label for="dob">Date of Birth</label>
<input 
  id="dob" 
  type="text"
  aria-describedby="dob-format"
  placeholder="MM/DD/YYYY"
>
<p id="dob-format">Format: MM/DD/YYYY</p>
```

---

## 58.4.6 Summary

| Requirement | Implementation |
|-------------|----------------|
| Labels | `<label>` with `for` attribute |
| Required fields | `aria-required` + `required` |
| Errors | `aria-invalid` + `aria-describedby` |
| Groups | `<fieldset>` + `<legend>` |
| Hints | `aria-describedby` |

---

**End of Chapter 58.4: Accessible Forms**

Next: **58.5 Accessible Components**.
# 58.5 Accessible Components

Common UI components require specific accessibility patterns.

---

## 58.5.1 Modal Dialogs

```html
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Confirm Delete</h2>
  <p>Are you sure you want to delete this item?</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

```javascript
function openModal(modal) {
  const previousFocus = document.activeElement;
  modal.hidden = false;
  modal.querySelector('button').focus();
  
  // Return focus on close
  modal.addEventListener('close', () => {
    previousFocus.focus();
  });
}
```

---

## 58.5.2 Tabs

```html
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1">
    General
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2">
    Privacy
  </button>
</div>

<div role="tabpanel" id="panel1" aria-labelledby="tab1">
  General settings content
</div>
<div role="tabpanel" id="panel2" aria-labelledby="tab2" hidden>
  Privacy settings content
</div>
```

---

## 58.5.3 Menus

```html
<button aria-haspopup="menu" aria-expanded="false" aria-controls="menu">
  Options
</button>
<ul role="menu" id="menu" hidden>
  <li role="menuitem" tabindex="-1">Edit</li>
  <li role="menuitem" tabindex="-1">Delete</li>
  <li role="separator"></li>
  <li role="menuitem" tabindex="-1">Settings</li>
</ul>
```

---

## 58.5.4 Accordions

```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="section1">
      Section 1
    </button>
  </h3>
  <div id="section1" hidden>
    Section 1 content
  </div>
</div>
```

---

## 58.5.5 Carousels

```html
<div role="region" aria-label="Featured products" aria-roledescription="carousel">
  <button aria-label="Previous slide">←</button>
  
  <div aria-live="polite">
    <div role="group" aria-roledescription="slide" aria-label="1 of 5">
      Slide content
    </div>
  </div>
  
  <button aria-label="Next slide">→</button>
</div>
```

---

## 58.5.6 Summary

| Component | Key Attributes |
|-----------|----------------|
| Dialog | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| Tabs | `role="tablist/tab/tabpanel"`, `aria-selected` |
| Menu | `role="menu/menuitem"`, `aria-haspopup`, `aria-expanded` |
| Accordion | `aria-expanded`, `aria-controls` |
| Carousel | `aria-roledescription`, `aria-live` |

---

**End of Chapter 58.5: Accessible Components**

Next: **58.6 Testing for Accessibility**.
# 58.6 Testing for Accessibility

Accessibility testing ensures your application is usable by everyone.

---

## 58.6.1 Automated Testing

### Browser DevTools

```javascript
// Chrome DevTools Lighthouse
// Accessibility audit in Performance tab

// Firefox Accessibility Inspector
// Shows accessibility tree
```

### axe-core

```javascript
import axe from 'axe-core';

axe.run(document, (err, results) => {
  results.violations.forEach(violation => {
    console.log(violation.id, violation.description);
    violation.nodes.forEach(node => {
      console.log('Element:', node.html);
      console.log('Fix:', node.failureSummary);
    });
  });
});
```

### Testing Library

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 58.6.2 Manual Testing

### Keyboard Testing

1. Tab through entire page
2. Verify all interactive elements are focusable
3. Check focus is visible
4. Verify Enter/Space activate controls
5. Check Escape closes modals

### Screen Reader Testing

| Reader | Platform | Shortcut |
|--------|----------|----------|
| NVDA | Windows | Free download |
| VoiceOver | macOS | Cmd+F5 |
| VoiceOver | iOS | Settings > Accessibility |
| TalkBack | Android | Settings > Accessibility |

---

## 58.6.3 Color Contrast

### WCAG Requirements

| Level | Normal Text | Large Text |
|-------|-------------|------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

### Check Contrast

```javascript
// Use browser DevTools color picker
// Shows contrast ratio automatically
```

---

## 58.6.4 ARIA Validation

```javascript
// Check for common ARIA issues
const issues = [];

// Missing labels
document.querySelectorAll('button:not([aria-label])').forEach(btn => {
  if (!btn.textContent.trim()) {
    issues.push('Button without accessible name');
  }
});

// Invalid ARIA references
document.querySelectorAll('[aria-labelledby]').forEach(el => {
  const id = el.getAttribute('aria-labelledby');
  if (!document.getElementById(id)) {
    issues.push(`aria-labelledby references missing ID: ${id}`);
  }
});
```

---

## 58.6.5 Testing Checklist

| Category | Checks |
|----------|--------|
| Keyboard | Tab order, focus visible, shortcuts work |
| Screen reader | All content announced, live regions work |
| Visual | Contrast, text resize, motion reduced |
| Forms | Labels, errors, required fields |
| Structure | Headings, landmarks, page title |

---

## 58.6.6 Summary

| Tool/Method | Purpose |
|-------------|---------|
| Lighthouse | Automated browser audit |
| axe-core | Programmatic testing |
| jest-axe | Jest integration |
| Keyboard testing | Manual navigation check |
| Screen reader | Real-world assistive tech |
| Color contrast | Visual accessibility |

---

**End of Chapter 58.6: Testing for Accessibility**

This completes Group 58 — Accessibility, and the entire BrowserJS section.
