# 40.2 Shadow DOM

Shadow DOM provides encapsulation for component styles and markup.

---

## 40.2.1 Attach Shadow Root

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; border: 1px solid #ccc; }
        .title { font-weight: bold; }
      </style>
      <div class="title"><slot name="title"></slot></div>
      <div class="content"><slot></slot></div>
    `;
  }
}
```

---

## 40.2.2 Mode: Open vs Closed

```javascript
// Open - shadowRoot accessible from outside
this.attachShadow({ mode: 'open' });
element.shadowRoot;  // Returns shadow root

// Closed - shadowRoot not accessible
this.attachShadow({ mode: 'closed' });
element.shadowRoot;  // Returns null
```

---

## 40.2.3 Slots

### Named Slots

```html
<my-card>
  <span slot="title">Card Title</span>
  <p>Card content goes here</p>
</my-card>
```

### Slot Events

```javascript
const slot = this.shadowRoot.querySelector('slot');

slot.addEventListener('slotchange', () => {
  const nodes = slot.assignedNodes();
  console.log('Slotted:', nodes);
});
```

---

## 40.2.4 Styling

### :host Selector

```css
:host { display: block; }
:host([disabled]) { opacity: 0.5; }
:host(:hover) { background: #f0f0f0; }
:host-context(.dark-theme) { background: #333; }
```

### ::slotted Selector

```css
::slotted(*) { margin: 0; }
::slotted(p) { color: blue; }
```

---

## 40.2.5 Summary

| Concept | Description |
|---------|-------------|
| `attachShadow()` | Create shadow root |
| `mode: 'open'` | Accessible shadow |
| `mode: 'closed'` | Hidden shadow |
| `<slot>` | Content projection |
| `:host` | Style host element |

---

**End of Chapter 40.2: Shadow DOM**

Next: **40.3 HTML Templates**.
