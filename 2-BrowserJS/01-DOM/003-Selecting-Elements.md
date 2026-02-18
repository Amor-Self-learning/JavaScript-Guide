# 1.3 Selecting Elements

Selecting elements is the most fundamental DOM operation. Before you can read content, change styles, or attach event listeners, you must first obtain a reference to the target element. JavaScript provides multiple selection methods, each with distinct performance characteristics and use cases.

This chapter covers every selection method in depth — when to use each, performance implications, and common pitfalls that trip up developers.

---

## 1.3.1 getElementById

The fastest and most direct way to select a single element.

### How It Works

```javascript
// HTML: <div id="app">Content</div>

const app = document.getElementById('app');

console.log(app);              // <div id="app">Content</div>
console.log(app.id);           // "app"
console.log(app.textContent);  // "Content"
```

### Key Characteristics

```javascript
// Returns single Element or null (never a collection)
const found = document.getElementById('exists');     // Element
const notFound = document.getElementById('missing'); // null

// IDs should be unique; if duplicates exist, returns FIRST match
// <div id="dup">First</div>
// <div id="dup">Second</div>
const el = document.getElementById('dup');  // First one

// ID matching is case-sensitive in HTML5
document.getElementById('App');  // null (if id is "app")

// Do NOT include # in the ID
document.getElementById('#app');  // null (wrong!)
document.getElementById('app');   // correct
```

### Performance

```javascript
// getElementById is the FASTEST selection method
// Browsers maintain an ID → Element hash map

// Benchmark comparison (relative):
// getElementById:    1x (baseline)
// querySelector:     2-3x slower
// getElementsByClassName: 1.5x slower (but returns collection)

// Use getElementById when:
// - You know the exact ID
// - You need maximum performance
// - You only need one element
```

### Gotchas

```javascript
// ❌ GOTCHA: IDs with special characters need querySelector
// <div id="user:123">...</div>
document.getElementById('user:123');  // null (some browsers)
document.querySelector('#user\\:123');  // Works (escaped)

// ❌ GOTCHA: getElementById only on document
const parent = document.getElementById('parent');
parent.getElementById('child');  // ERROR: not a method on Element!

// ✅ Use querySelector on elements
parent.querySelector('#child');  // Works
```

---

## 1.3.2 getElementsByClassName

Returns a **live HTMLCollection** of elements with the specified class.

### How It Works

```javascript
// HTML:
// <p class="intro">First</p>
// <p class="intro">Second</p>
// <p class="outro">Third</p>

const intros = document.getElementsByClassName('intro');

console.log(intros);           // HTMLCollection(2) [p.intro, p.intro]
console.log(intros.length);    // 2
console.log(intros[0]);        // <p class="intro">First</p>
console.log(intros.item(1));   // <p class="intro">Second</p>
```

### Multiple Classes

```javascript
// Match elements with BOTH classes
// <div class="card featured">...</div>
// <div class="card">...</div>
// <div class="featured">...</div>

const featuredCards = document.getElementsByClassName('card featured');
console.log(featuredCards.length);  // 1 (only the element with both)

// Order doesn't matter
document.getElementsByClassName('featured card');  // Same result
```

### Live Collection Behavior

```javascript
const items = document.getElementsByClassName('item');
console.log(items.length);  // 3

// Add a new element with class="item"
const newItem = document.createElement('div');
newItem.className = 'item';
document.body.appendChild(newItem);

console.log(items.length);  // 4 (automatically updated!)

// ⚠️ This can cause issues in loops
const elements = document.getElementsByClassName('remove-me');

// ❌ WRONG: Collection shrinks as you remove, skipping elements!
for (let i = 0; i < elements.length; i++) {
  elements[i].remove();
}

// ✅ CORRECT: Iterate backwards
for (let i = elements.length - 1; i >= 0; i--) {
  elements[i].remove();
}

// ✅ CORRECT: Convert to static array first
Array.from(elements).forEach(el => el.remove());

// ✅ CORRECT: Use while loop
while (elements.length > 0) {
  elements[0].remove();
}
```

### Scoped Selection

```javascript
// Can be called on any element, not just document
const nav = document.getElementById('nav');
const navLinks = nav.getElementsByClassName('link');

// Only finds .link elements inside #nav
```

---

## 1.3.3 getElementsByTagName

Returns a **live HTMLCollection** of elements with the specified tag name.

### How It Works

```javascript
const paragraphs = document.getElementsByTagName('p');

console.log(paragraphs);        // HTMLCollection of all <p> elements
console.log(paragraphs.length); // Number of paragraphs

// Tag name is case-insensitive
document.getElementsByTagName('DIV');  // Same as 'div'
document.getElementsByTagName('P');    // Same as 'p'
```

### Special Cases

```javascript
// Get ALL elements
const allElements = document.getElementsByTagName('*');
console.log(allElements.length);  // Total number of elements

// Scoped to parent
const table = document.querySelector('table');
const cells = table.getElementsByTagName('td');

// Works with SVG and other namespaced elements
const svgElements = document.getElementsByTagName('circle');
```

### Performance Note

```javascript
// getElementsByTagName is very fast for simple tag queries
// Use it when:
// - You need all elements of a specific type
// - You're working with a known structure
// - You need a live collection

// Avoid when:
// - You need to filter by attributes/classes (use querySelector)
// - You need a static snapshot (convert to array)
```

---

## 1.3.4 getElementsByName

Returns a **live NodeList** of elements with the specified `name` attribute.

### How It Works

```javascript
// HTML:
// <input type="radio" name="color" value="red">
// <input type="radio" name="color" value="blue">
// <input type="radio" name="size" value="large">

const colorInputs = document.getElementsByName('color');

console.log(colorInputs);        // NodeList(2)
console.log(colorInputs.length); // 2
console.log(colorInputs[0].value); // "red"
```

### Primary Use Case: Form Controls

```javascript
// Radio button groups
const colors = document.getElementsByName('color');
let selectedColor;
colors.forEach(radio => {
  if (radio.checked) {
    selectedColor = radio.value;
  }
});

// Or more concisely
const selected = document.querySelector('input[name="color"]:checked');

// Checkbox groups
const features = document.getElementsByName('features');
const selectedFeatures = Array.from(features)
  .filter(cb => cb.checked)
  .map(cb => cb.value);
```

### Note: Returns NodeList, Not HTMLCollection

```javascript
// getElementsByName returns NodeList (has forEach)
const inputs = document.getElementsByName('field');
inputs.forEach(input => console.log(input.value));

// getElementsByClassName/TagName return HTMLCollection (no forEach)
const divs = document.getElementsByClassName('box');
// divs.forEach(...)  // ERROR!
Array.from(divs).forEach(div => console.log(div));
```

---

## 1.3.5 querySelector

Returns the **first** element matching a CSS selector. The most versatile selection method.

### How It Works

```javascript
// Select by ID
const app = document.querySelector('#app');

// Select by class
const firstCard = document.querySelector('.card');

// Select by tag
const firstParagraph = document.querySelector('p');

// Select by attribute
const emailInput = document.querySelector('input[type="email"]');

// Complex selectors
const activeMenuItem = document.querySelector('nav > ul > li.active');
const firstChildParagraph = document.querySelector('article p:first-child');
```

### Returns First Match or Null

```javascript
// Always returns ONE element or null
const card = document.querySelector('.card');

if (card) {
  card.classList.add('selected');
}

// For multiple elements, use querySelectorAll
```

### Any Valid CSS Selector Works

```javascript
// Descendant
document.querySelector('article p');

// Child
document.querySelector('ul > li');

// Adjacent sibling
document.querySelector('h2 + p');

// General sibling
document.querySelector('h2 ~ p');

// Attribute selectors
document.querySelector('[data-id]');           // Has attribute
document.querySelector('[data-id="123"]');     // Exact value
document.querySelector('[href^="https"]');     // Starts with
document.querySelector('[href$=".pdf"]');      // Ends with
document.querySelector('[class*="card"]');     // Contains

// Pseudo-classes
document.querySelector('li:first-child');
document.querySelector('li:last-child');
document.querySelector('li:nth-child(2)');
document.querySelector('li:nth-child(odd)');
document.querySelector('input:checked');
document.querySelector('input:disabled');
document.querySelector('a:not(.external)');
document.querySelector('input:focus');

// Multiple selectors (matches first from either)
document.querySelector('h1, h2, h3');

// Pseudo-elements DON'T work (they're not elements)
document.querySelector('p::before');  // null (can't select pseudo-elements)
```

### Scoped Selection

```javascript
// Call querySelector on any element
const nav = document.getElementById('nav');
const activeLink = nav.querySelector('a.active');

// Selectors are relative to the element
// <nav id="nav">
//   <ul>
//     <li><a class="active">Link</a></li>
//   </ul>
// </nav>

nav.querySelector('a');  // First <a> inside nav
nav.querySelector('ul > li:first-child a');  // More specific
```

### :scope Pseudo-Class

```javascript
// :scope refers to the element querySelector is called on
const parent = document.querySelector('.parent');

// Select direct children only
parent.querySelector(':scope > .child');

// Without :scope, this would search anywhere in parent:
parent.querySelector('.child');  // Any .child descendant
```

---

## 1.3.6 querySelectorAll

Returns a **static NodeList** of ALL elements matching a CSS selector.

### How It Works

```javascript
const cards = document.querySelectorAll('.card');

console.log(cards);        // NodeList(5)
console.log(cards.length); // 5
console.log(cards[0]);     // First card
```

### Static Collection (Not Live)

```javascript
const cards = document.querySelectorAll('.card');
console.log(cards.length);  // 3

// Add a new card
const newCard = document.createElement('div');
newCard.className = 'card';
document.body.appendChild(newCard);

console.log(cards.length);  // Still 3! (not updated)

// To get updated list, call querySelectorAll again
const updatedCards = document.querySelectorAll('.card');
console.log(updatedCards.length);  // 4
```

### Iterating NodeList

```javascript
const items = document.querySelectorAll('.item');

// forEach (works on NodeList!)
items.forEach(item => {
  console.log(item.textContent);
});

// for...of
for (const item of items) {
  console.log(item.textContent);
}

// Classic for loop
for (let i = 0; i < items.length; i++) {
  console.log(items[i].textContent);
}

// Convert to array for array methods
const itemArray = Array.from(items);
const filtered = itemArray.filter(item => item.classList.contains('active'));

// Or spread
const itemArray2 = [...items];
```

### Complex Selections

```javascript
// Multiple selectors (OR)
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

// Specific patterns
const evenRows = document.querySelectorAll('tr:nth-child(even)');
const notFirst = document.querySelectorAll('li:not(:first-child)');
const hasDataId = document.querySelectorAll('[data-id]');

// Scoped selection
const nav = document.querySelector('nav');
const navLinks = nav.querySelectorAll('a');
```

---

## 1.3.7 closest

Traverses UP the DOM tree to find the nearest ancestor (including self) matching a selector.

### How It Works

```javascript
// HTML:
// <div class="card" data-id="42">
//   <div class="content">
//     <button class="delete">Delete</button>
//   </div>
// </div>

const button = document.querySelector('.delete');

// Find closest ancestor with class "card"
const card = button.closest('.card');
console.log(card);               // <div class="card" data-id="42">
console.log(card.dataset.id);    // "42"

// closest checks the element itself first
button.closest('.delete');       // Returns the button itself
button.closest('button');        // Also returns the button

// Returns null if no match found
button.closest('form');          // null
```

### Primary Use Case: Event Delegation

```javascript
// Handle clicks on dynamically added elements
document.body.addEventListener('click', (e) => {
  // Find if click was inside a card
  const card = e.target.closest('.card');
  if (card) {
    console.log('Clicked card:', card.dataset.id);
  }
  
  // Check for specific button
  const deleteBtn = e.target.closest('.delete-btn');
  if (deleteBtn) {
    const card = deleteBtn.closest('.card');
    deleteCard(card);
  }
});
```

### Gotchas

```javascript
// closest starts from the element itself
const div = document.querySelector('.child');

// If .child is itself inside .parent, this works:
div.closest('.parent');  // Finds the parent

// If .child IS the .parent, it returns itself:
// <div class="child parent">...</div>
div.closest('.parent');  // Returns div (itself!)

// closest doesn't search DOWN, only UP
const parent = document.querySelector('.parent');
parent.closest('.child');  // null (children are not ancestors)
```

---

## 1.3.8 matches

Tests whether an element matches a CSS selector. Returns boolean.

### How It Works

```javascript
const element = document.querySelector('.card');

// Test if element matches selector
console.log(element.matches('.card'));         // true
console.log(element.matches('.card.active'));  // depends on classes
console.log(element.matches('div'));           // true if it's a div
console.log(element.matches('#myCard'));       // depends on ID
```

### Use Case: Filtering Elements

```javascript
const elements = document.querySelectorAll('.item');

// Filter to only active items
const activeItems = Array.from(elements)
  .filter(el => el.matches('.active'));

// Check condition
elements.forEach(el => {
  if (el.matches('[data-important]')) {
    el.classList.add('highlighted');
  }
});
```

### Use Case: Event Delegation

```javascript
// Check if clicked element matches a selector
document.body.addEventListener('click', (e) => {
  if (e.target.matches('button.submit')) {
    handleSubmit(e);
  }
  
  if (e.target.matches('a[href^="http"]')) {
    // External link clicked
    trackOutboundLink(e.target.href);
  }
});
```

### Combined with closest

```javascript
document.body.addEventListener('click', (e) => {
  // Does clicked element or any ancestor match?
  const button = e.target.closest('button');
  if (button && button.matches('.delete')) {
    handleDelete(button);
  }
});
```

---

## 1.3.9 Live vs Static Collections

Understanding the difference is crucial for avoiding bugs.

### HTMLCollection (Live)

```javascript
// getElementsByClassName, getElementsByTagName return HTMLCollection

const items = document.getElementsByClassName('item');
console.log(items.length);  // 3

// Add element
document.body.innerHTML += '<div class="item">New</div>';
console.log(items.length);  // 4 (automatically updated!)

// Remove element
items[0].remove();
console.log(items.length);  // 3 (automatically updated!)

// HTMLCollection characteristics:
// - Live (updates automatically)
// - No forEach (must convert to array)
// - Access by index or namedItem()
```

### NodeList (Can Be Live or Static)

```javascript
// querySelectorAll returns STATIC NodeList
const qsItems = document.querySelectorAll('.item');
// Changes to DOM don't affect qsItems

// childNodes returns LIVE NodeList
const children = document.body.childNodes;
// Adding children updates this list

// NodeList characteristics:
// - Has forEach
// - Has length
// - Has item() method
```

### When to Use Each

```javascript
// Use getElementsBy* when:
// - You need a live collection (rare)
// - Maximum performance for simple queries
// - You're repeatedly checking the collection

// Use querySelectorAll when:
// - You need a snapshot at a point in time
// - You want forEach support
// - You have complex selection criteria
// - You're modifying the DOM in a loop

// Performance comparison:
// getElementsByClassName: ~0.1ms
// querySelectorAll:       ~0.3ms
// But querySelectorAll is more predictable
```

---

## 1.3.10 Selection Performance

### Performance Hierarchy

```javascript
// Fastest to slowest:
// 1. getElementById         - O(1) hash lookup
// 2. getElementsByClassName - optimized internal
// 3. getElementsByTagName   - optimized internal
// 4. querySelector          - CSS parser overhead
// 5. querySelectorAll       - CSS parser + collection build

// But... readability and maintainability often matter more
// The difference is microseconds in most cases
```

### Caching Selections

```javascript
// ❌ BAD: Re-selecting in loop
function highlightAll() {
  for (let i = 0; i < 1000; i++) {
    const box = document.getElementById('box');  // 1000 lookups!
    box.style.opacity = i / 1000;
  }
}

// ✅ GOOD: Cache the selection
function highlightAll() {
  const box = document.getElementById('box');  // 1 lookup
  for (let i = 0; i < 1000; i++) {
    box.style.opacity = i / 1000;
  }
}

// ✅ GOOD: Cache at module level for frequently used elements
const elements = {
  app: document.getElementById('app'),
  header: document.getElementById('header'),
  nav: document.querySelector('nav'),
};

function update() {
  elements.header.textContent = 'Updated';
}
```

### Narrow Your Scope

```javascript
// ❌ Slow: Search entire document
const button = document.querySelector('section#main article.featured button.cta');

// ✅ Faster: Narrow scope first
const section = document.getElementById('main');
const article = section.querySelector('.featured');
const button = article.querySelector('.cta');

// Each query searches fewer elements
```

---

## 1.3.11 Summary

| Method | Returns | Live? | Performance | Use Case |
|--------|---------|-------|-------------|----------|
| `getElementById` | Element/null | N/A | Fastest | Single element by ID |
| `getElementsByClassName` | HTMLCollection | Yes | Fast | Multiple by class |
| `getElementsByTagName` | HTMLCollection | Yes | Fast | Multiple by tag |
| `getElementsByName` | NodeList | Yes | Fast | Form elements |
| `querySelector` | Element/null | N/A | Medium | First match, any selector |
| `querySelectorAll` | NodeList | No | Medium | All matches, any selector |
| `closest` | Element/null | N/A | Medium | Find ancestor |
| `matches` | Boolean | N/A | Fast | Test selector |

### Best Practices

1. **Use `getElementById` for IDs** — fastest and clearest
2. **Use `querySelector` for complex selections** — most flexible
3. **Cache DOM references** — don't re-query in loops
4. **Be aware of live vs static** — convert to array when modifying
5. **Narrow your scope** — call selection methods on parent elements
6. **Use `closest` for event delegation** — cleaner than manual traversal

---

**End of Chapter 1.3: Selecting Elements**

Next chapter: **1.4 Creating Elements** — covers `createElement`, `createTextNode`, `createDocumentFragment`, and `cloneNode`.
