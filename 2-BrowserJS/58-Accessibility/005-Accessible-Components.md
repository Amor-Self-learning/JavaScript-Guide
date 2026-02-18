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
