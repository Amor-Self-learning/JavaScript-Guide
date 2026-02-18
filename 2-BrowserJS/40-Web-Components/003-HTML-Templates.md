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
