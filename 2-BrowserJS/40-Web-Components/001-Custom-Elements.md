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
