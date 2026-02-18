# 1.4 Creating Elements

Creating DOM elements programmatically is fundamental to building dynamic web applications. Whether you're rendering data from an API, building UI components, or creating interactive features, you'll frequently need to create and insert elements.

This chapter covers all element creation methods, from basic `createElement` to performance-optimized `DocumentFragment`, plus cloning techniques and best practices.

---

## 1.4.1 createElement

The primary method for creating new elements.

### How It Works

```javascript
// Create an element by tag name
const div = document.createElement('div');
const paragraph = document.createElement('p');
const button = document.createElement('button');

// Element is created but NOT in the document yet
console.log(div.parentNode);  // null

// Add to document
document.body.appendChild(div);
console.log(div.parentNode);  // <body>
```

### Setting Properties and Attributes

```javascript
const link = document.createElement('a');

// Set properties directly
link.href = 'https://example.com';
link.textContent = 'Visit Example';
link.className = 'external-link';
link.id = 'main-link';

// Set attributes
link.setAttribute('target', '_blank');
link.setAttribute('rel', 'noopener noreferrer');
link.setAttribute('data-category', 'external');

// Custom data attributes
link.dataset.trackId = '12345';
link.dataset.source = 'homepage';

// Result:
// <a href="https://example.com" 
//    class="external-link" 
//    id="main-link" 
//    target="_blank" 
//    rel="noopener noreferrer"
//    data-category="external"
//    data-track-id="12345"
//    data-source="homepage">Visit Example</a>
```

### Creating Different Element Types

```javascript
// Form elements
const input = document.createElement('input');
input.type = 'email';
input.name = 'email';
input.placeholder = 'Enter your email';
input.required = true;

const select = document.createElement('select');
select.name = 'country';

const option = document.createElement('option');
option.value = 'us';
option.textContent = 'United States';
select.appendChild(option);

// Table elements
const table = document.createElement('table');
const row = document.createElement('tr');
const cell = document.createElement('td');
cell.textContent = 'Cell content';
row.appendChild(cell);
table.appendChild(row);

// Image
const img = document.createElement('img');
img.src = '/images/photo.jpg';
img.alt = 'A photo';
img.loading = 'lazy';  // Native lazy loading

// Canvas
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d');
```

### Creating Custom Elements

```javascript
// If you've defined a custom element
class MyCard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div class="card-content"></div>';
  }
}
customElements.define('my-card', MyCard);

// Create it like any other element
const card = document.createElement('my-card');
document.body.appendChild(card);
```

---

## 1.4.2 createTextNode

Creates a text node that can be appended to elements.

### How It Works

```javascript
const text = document.createTextNode('Hello, World!');

const paragraph = document.createElement('p');
paragraph.appendChild(text);
document.body.appendChild(paragraph);

// Result: <p>Hello, World!</p>
```

### Why Use createTextNode?

```javascript
// createTextNode is safe from XSS - content is never parsed as HTML
const userInput = '<script>alert("XSS")</script>';

// ❌ DANGEROUS: innerHTML parses HTML
const div1 = document.createElement('div');
div1.innerHTML = userInput;  // XSS risk!

// ✅ SAFE: createTextNode treats input as plain text
const div2 = document.createElement('div');
const text = document.createTextNode(userInput);
div2.appendChild(text);
// Result: <div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>
// The script is displayed as text, not executed

// ✅ ALSO SAFE: textContent treats input as plain text
const div3 = document.createElement('div');
div3.textContent = userInput;  // Same safe result
```

### Combining Text with Other Elements

```javascript
// Building: <p>Click <a href="#">here</a> to continue.</p>

const p = document.createElement('p');

// Add text node
p.appendChild(document.createTextNode('Click '));

// Add link
const link = document.createElement('a');
link.href = '#';
link.textContent = 'here';
p.appendChild(link);

// Add more text
p.appendChild(document.createTextNode(' to continue.'));

document.body.appendChild(p);
```

### Whitespace and Special Characters

```javascript
// Whitespace is preserved
const text1 = document.createTextNode('   spaces preserved   ');

// Special characters are displayed, not interpreted
const text2 = document.createTextNode('5 > 3 and 2 < 4');
// Result: "5 > 3 and 2 < 4" (displayed correctly)

// Newlines become single spaces in inline context
const text3 = document.createTextNode('Line 1\nLine 2');
// In HTML: appears as "Line 1 Line 2" unless in <pre> or white-space: pre
```

---

## 1.4.3 createDocumentFragment

A lightweight container for building DOM structures efficiently.

### The Problem It Solves

```javascript
// ❌ SLOW: Multiple DOM operations cause multiple reflows
const list = document.getElementById('list');

for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  list.appendChild(li);  // 1000 DOM operations!
}
```

### Using DocumentFragment

```javascript
// ✅ FAST: Build in fragment, insert once
const list = document.getElementById('list');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);  // No reflow - fragment is not in DOM
}

list.appendChild(fragment);  // Single DOM operation!
```

### How It Works

```javascript
const fragment = document.createDocumentFragment();

// Fragment is a minimal document that can hold nodes
console.log(fragment.nodeType);  // 11 (DOCUMENT_FRAGMENT_NODE)

// You can append multiple elements
const h1 = document.createElement('h1');
h1.textContent = 'Title';
const p = document.createElement('p');
p.textContent = 'Content';

fragment.appendChild(h1);
fragment.appendChild(p);

// Fragment itself is never inserted
// Only its children are moved to the target
document.body.appendChild(fragment);

// After insertion, fragment is empty
console.log(fragment.childNodes.length);  // 0
console.log(fragment.hasChildNodes());    // false
```

### Building Complex Structures

```javascript
function createCard(data) {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('article');
  card.className = 'card';
  
  const header = document.createElement('header');
  header.textContent = data.title;
  
  const content = document.createElement('div');
  content.className = 'content';
  content.textContent = data.description;
  
  const footer = document.createElement('footer');
  const button = document.createElement('button');
  button.textContent = 'Learn More';
  footer.appendChild(button);
  
  card.appendChild(header);
  card.appendChild(content);
  card.appendChild(footer);
  
  fragment.appendChild(card);
  
  return fragment;
}

// Usage
const container = document.getElementById('cards');
const data = [
  { title: 'Card 1', description: 'First card' },
  { title: 'Card 2', description: 'Second card' },
];

const fragment = document.createDocumentFragment();
data.forEach(item => {
  fragment.appendChild(createCard(item));
});
container.appendChild(fragment);
```

### Query Methods on Fragments

```javascript
const fragment = document.createDocumentFragment();

const div1 = document.createElement('div');
div1.className = 'item';
div1.id = 'first';

const div2 = document.createElement('div');
div2.className = 'item';

fragment.appendChild(div1);
fragment.appendChild(div2);

// querySelector works on fragments
const first = fragment.querySelector('.item');
console.log(first.id);  // "first"

// querySelectorAll too
const items = fragment.querySelectorAll('.item');
console.log(items.length);  // 2

// But getElementById does NOT work
fragment.getElementById('first');  // ERROR: not a method
```

---

## 1.4.4 cloneNode

Creates a copy of an existing node.

### Shallow Clone

```javascript
const original = document.querySelector('.card');
// <div class="card" data-id="1">
//   <h2>Title</h2>
//   <p>Content</p>
// </div>

// Shallow clone - copies element only, not children
const shallowClone = original.cloneNode(false);
console.log(shallowClone.outerHTML);
// <div class="card" data-id="1"></div>
// Note: children are NOT copied
```

### Deep Clone

```javascript
// Deep clone - copies element AND all descendants
const deepClone = original.cloneNode(true);
console.log(deepClone.outerHTML);
// <div class="card" data-id="1">
//   <h2>Title</h2>
//   <p>Content</p>
// </div>
```

### What Gets Cloned

```javascript
const original = document.getElementById('original');

// These ARE copied:
// - The element itself
// - All attributes (class, id, data-*, etc.)
// - Inline styles
// - Children (if deep clone)

// These are NOT copied:
// - Event listeners added with addEventListener
// - Properties set via JavaScript (that aren't attributes)
// - Expanded state of form elements (partially)

// Example with event listeners
original.addEventListener('click', () => console.log('clicked'));
const clone = original.cloneNode(true);
// clone does NOT have the click listener!

// Example with properties
original.myCustomProp = 'value';
const clone2 = original.cloneNode(true);
console.log(clone2.myCustomProp);  // undefined
```

### Handling ID Conflicts

```javascript
// ⚠️ Cloning an element with an ID creates duplicates!
const original = document.getElementById('uniqueId');
const clone = original.cloneNode(true);
document.body.appendChild(clone);

// Now there are TWO elements with id="uniqueId" - bad!
// document.getElementById('uniqueId') returns the first one

// ✅ Always update IDs on clones
const clone2 = original.cloneNode(true);
clone2.id = 'uniqueId-copy';
// Or remove it
clone2.removeAttribute('id');
```

### Common Use Cases

```javascript
// 1. Template-based creation
const template = document.querySelector('.card-template');
function createCard(data) {
  const card = template.cloneNode(true);
  card.classList.remove('card-template');
  card.classList.add('card');
  card.querySelector('.title').textContent = data.title;
  card.querySelector('.content').textContent = data.content;
  card.removeAttribute('hidden');
  return card;
}

// 2. Repeating elements
const row = document.querySelector('tr.template');
for (let i = 0; i < 10; i++) {
  const newRow = row.cloneNode(true);
  newRow.classList.remove('template');
  newRow.cells[0].textContent = i + 1;
  tbody.appendChild(newRow);
}

// 3. Moving elements (clone then remove original)
const element = document.getElementById('moveable');
const clone = element.cloneNode(true);
newParent.appendChild(clone);
element.remove();
```

---

## 1.4.5 Using Templates

The `<template>` element provides a native way to define reusable content.

### Template Element Basics

```html
<!-- Templates are not rendered -->
<template id="card-template">
  <div class="card">
    <h2 class="card-title"></h2>
    <p class="card-content"></p>
    <button class="card-action">Learn More</button>
  </div>
</template>
```

```javascript
// Get the template
const template = document.getElementById('card-template');

// Template content is in a DocumentFragment
console.log(template.content);  // #document-fragment

// Clone the content
const clone = template.content.cloneNode(true);

// Fill in the data
clone.querySelector('.card-title').textContent = 'My Card';
clone.querySelector('.card-content').textContent = 'Card description here';

// Insert into document
document.getElementById('container').appendChild(clone);
```

### Why Use Templates

```javascript
// 1. Better separation of concerns
// HTML structure stays in HTML, not JavaScript strings

// 2. Better IDE support
// Templates in HTML get syntax highlighting, validation

// 3. No XSS from template
// Template content is inert - scripts don't run, images don't load

// 4. Performance
// Browser parses template once, cloning is fast
```

### Template with Slots (Shadow DOM)

```javascript
// For Web Components, templates work with slots
const template = document.createElement('template');
template.innerHTML = `
  <style>
    .wrapper { border: 1px solid #ccc; padding: 1rem; }
  </style>
  <div class="wrapper">
    <slot name="title"></slot>
    <slot></slot>
  </div>
`;

class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }
}
```

---

## 1.4.6 createElement vs innerHTML

Understanding when to use each approach.

### innerHTML: Quick but Risky

```javascript
// ✅ innerHTML is fast for static content
container.innerHTML = '<h1>Welcome</h1><p>Hello there</p>';

// ❌ Never use innerHTML with user data!
const userInput = '<img src=x onerror="alert(\'XSS\')">';
container.innerHTML = userInput;  // XSS attack!

// innerHTML destroys existing event listeners
container.innerHTML += '<p>More content</p>';
// All listeners on existing children are gone!
```

### createElement: Safe and Flexible

```javascript
// ✅ Safe with any input
const div = document.createElement('div');
div.textContent = userInput;  // Treated as text, not HTML

// ✅ Preserves existing content and listeners
container.appendChild(div);  // Existing children untouched

// ❌ More verbose for complex structures
const list = document.createElement('ul');
const items = ['a', 'b', 'c'];
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  list.appendChild(li);
});
```

### Performance Comparison

```javascript
// For small, simple content: innerHTML is faster
container.innerHTML = '<div><p>Small content</p></div>';

// For many items: createElement + fragment is faster
const fragment = document.createDocumentFragment();
for (let i = 0; i < 10000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}
container.appendChild(fragment);

// innerHTML with large strings forces complete re-parse
// createElement builds the tree directly
```

### Best Practice: Sanitize or Avoid

```javascript
// If you must use innerHTML with user data, sanitize it
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(userInput);
container.innerHTML = clean;

// Or use a templating library that auto-escapes
// (React, Vue, etc. do this automatically)
```

---

## 1.4.7 Factory Pattern for Elements

Creating helper functions for cleaner code.

### Basic Factory

```javascript
function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  // Set attributes
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      element.setAttribute(key, value);
    }
  }
  
  // Set properties
  if (options.props) {
    Object.assign(element, options.props);
  }
  
  // Add classes
  if (options.classes) {
    element.classList.add(...options.classes);
  }
  
  // Set text content
  if (options.text) {
    element.textContent = options.text;
  }
  
  // Append children
  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }
  
  // Add event listeners
  if (options.events) {
    for (const [event, handler] of Object.entries(options.events)) {
      element.addEventListener(event, handler);
    }
  }
  
  return element;
}
```

### Usage

```javascript
const card = createElement('article', {
  classes: ['card', 'featured'],
  attrs: { 'data-id': '42' },
  children: [
    createElement('h2', { text: 'Card Title' }),
    createElement('p', { 
      text: 'Card content goes here',
      classes: ['content']
    }),
    createElement('button', {
      text: 'Click Me',
      events: {
        click: () => console.log('Clicked!')
      }
    })
  ]
});

document.body.appendChild(card);
```

### JSX-like Syntax (without React)

```javascript
// A more React-like factory
function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  }
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

// Usage looks cleaner
const nav = h('nav', { className: 'main-nav' },
  h('a', { href: '/', onClick: handleHome }, 'Home'),
  h('a', { href: '/about' }, 'About'),
  h('a', { href: '/contact' }, 'Contact')
);
```

---

## 1.4.8 Summary

| Method | Purpose | Returns | Key Notes |
|--------|---------|---------|-----------|
| `createElement(tag)` | Create new element | Element | Main creation method |
| `createTextNode(text)` | Create text node | Text | XSS-safe for user input |
| `createDocumentFragment()` | Create container | DocumentFragment | Batch insertions, no reflow |
| `cloneNode(deep)` | Copy existing node | Node | Events not copied |
| `template.content` | Get template content | DocumentFragment | Native templating |

### Best Practices

1. **Use `createDocumentFragment`** when adding multiple elements
2. **Never use `innerHTML` with user data** — XSS vulnerability
3. **Use `textContent` or `createTextNode`** for user-provided text
4. **Remember to update IDs** when cloning elements
5. **Consider `<template>` elements** for reusable structures
6. **Build factory functions** for cleaner code at scale
7. **Clone event listeners manually** — they don't copy with `cloneNode`

### Common Gotchas

```javascript
// ❌ Forgetting that fragment empties after insertion
const fragment = document.createDocumentFragment();
fragment.appendChild(div);
body.appendChild(fragment);
console.log(fragment.childNodes.length);  // 0, not 1!

// ❌ Expecting cloned elements to have event listeners
const clone = original.cloneNode(true);
// Clone has no listeners — add them after cloning

// ❌ Creating duplicate IDs with cloneNode
// Always remove or change IDs on clones

// ❌ Using innerHTML += (destroys existing listeners)
container.innerHTML += '<p>New</p>';  // Bad
container.appendChild(createElement('p'));  // Good
```

---

**End of Chapter 1.4: Creating Elements**

Next chapter: **1.5 Manipulating Elements** — covers inserting, removing, and moving elements with `appendChild`, `insertBefore`, `remove`, `append`, `prepend`, `before`, `after`, and `replaceWith`.
