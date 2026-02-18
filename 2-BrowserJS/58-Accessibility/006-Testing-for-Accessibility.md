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
