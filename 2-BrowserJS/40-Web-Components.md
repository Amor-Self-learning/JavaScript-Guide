# 40.1 Custom Elements

Custom Elements allow you to define new HTML elements with custom behavior.

---

## 40.1.1 Define Custom Element

### Autonomous Custom Element

```javascript
class MyButton extends HTMLElement {
  constructor() {
    super();
    // Don't manipulate DOM in constructor
  }
  
  connectedCallback() {
    this.innerHTML = '<button>Click me</button>';
    this.querySelector('button').onclick = () => this.handleClick();
  }
  
  handleClick() {
    this.dispatchEvent(new CustomEvent('my-click'));
  }
}

customElements.define('my-button', MyButton);
```

### Usage

```html
<my-button></my-button>
```

---

## 40.1.2 Lifecycle Callbacks

```javascript
class MyElement extends HTMLElement {
  connectedCallback() {
    // Added to DOM
  }
  
  disconnectedCallback() {
    // Removed from DOM
  }
  
  adoptedCallback() {
    // Moved to new document
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    // Observed attribute changed
  }
  
  static get observedAttributes() {
    return ['disabled', 'value'];
  }
}
```

---

## 40.1.3 Customized Built-in Elements

```javascript
class FancyButton extends HTMLButtonElement {
  connectedCallback() {
    this.style.background = 'linear-gradient(45deg, red, blue)';
  }
}

customElements.define('fancy-button', FancyButton, { extends: 'button' });
```

### Usage

```html
<button is="fancy-button">Click</button>
```

---

## 40.1.4 Wait for Definition

```javascript
// Check if defined
const isDefined = customElements.get('my-element') !== undefined;

// Wait for definition
await customElements.whenDefined('my-element');
```

---

## 40.1.5 Summary

| Callback | When Called |
|----------|-------------|
| `connectedCallback` | Added to DOM |
| `disconnectedCallback` | Removed from DOM |
| `adoptedCallback` | Moved to new document |
| `attributeChangedCallback` | Attribute changed |

---

**End of Chapter 40.1: Custom Elements**

Next: **40.2 Shadow DOM**.
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
# 40.3 HTML Templates

The `<template>` element holds HTML that isn't rendered until cloned.

---

## 40.3.1 Define Template

```html
<template id="card-template">
  <style>
    .card { border: 1px solid #ccc; padding: 16px; }
  </style>
  <div class="card">
    <h2></h2>
    <p></p>
  </div>
</template>
```

---

## 40.3.2 Clone and Use

```javascript
const template = document.getElementById('card-template');
const clone = template.content.cloneNode(true);

clone.querySelector('h2').textContent = 'Title';
clone.querySelector('p').textContent = 'Description';

document.body.appendChild(clone);
```

---

## 40.3.3 With Custom Elements

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('card-template');
    const content = template.content.cloneNode(true);
    
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(content);
  }
}
```

---

## 40.3.4 Declarative Shadow DOM

```html
<my-element>
  <template shadowrootmode="open">
    <style>:host { color: blue; }</style>
    <slot></slot>
  </template>
  Content here
</my-element>
```

---

## 40.3.5 Summary

| Method | Description |
|--------|-------------|
| `template.content` | DocumentFragment |
| `cloneNode(true)` | Deep clone |
| `shadowrootmode` | Declarative shadow |

---

**End of Chapter 40.3: HTML Templates**

This completes Group 40 — Web Components. Next: **Group 41 — Encoding API**.
