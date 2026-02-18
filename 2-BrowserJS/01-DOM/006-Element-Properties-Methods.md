# 1.6 Element Properties and Methods

Every DOM element exposes properties and methods that let you read and modify its content, attributes, dimensions, and styles. This chapter covers the most important element APIs — from content manipulation with `innerHTML` and `textContent` to position calculation with `getBoundingClientRect`.

Understanding these properties deeply enables you to build responsive, dynamic interfaces that adapt to content and user interactions.

---

## 1.6.1 Content Properties: innerHTML, textContent, outerHTML

Three ways to read and modify element content, each with distinct behavior.

### innerHTML

Reads or sets the HTML content inside an element.

```javascript
const div = document.getElementById('content');

// Read HTML content
console.log(div.innerHTML);
// "<p>Hello <strong>World</strong></p>"

// Set HTML content (parses HTML)
div.innerHTML = '<h1>New Title</h1><p>New paragraph</p>';

// Append HTML (warning: has performance issues)
div.innerHTML += '<p>Appended</p>';  // Reparsing entire content!
```

### ⚠️ innerHTML Security Warning

```javascript
// ❌ DANGEROUS: Never use innerHTML with untrusted data!
const userInput = '<img src=x onerror="alert(\'XSS\')">';
div.innerHTML = userInput;  // XSS attack executes!

// ❌ DANGEROUS: Query parameters, form inputs, URLs
const param = new URLSearchParams(location.search).get('q');
div.innerHTML = param;  // Potential XSS!

// ✅ SAFE: Use textContent for user data
div.textContent = userInput;  // Displays as text

// ✅ SAFE: If you must use HTML, sanitize first
import DOMPurify from 'dompurify';
div.innerHTML = DOMPurify.sanitize(userInput);
```

### textContent

Reads or sets plain text content. Strips all HTML tags.

```javascript
const div = document.getElementById('content');
// <div id="content"><p>Hello <strong>World</strong></p></div>

// Read text only (no tags)
console.log(div.textContent);  // "Hello World"

// Set text (HTML is escaped, not parsed)
div.textContent = '<script>alert("safe")</script>';
// Displays: <script>alert("safe")</script>
// Does NOT execute!
```

### textContent vs innerText

```javascript
const div = document.createElement('div');
div.innerHTML = 'Hello   <span style="display:none">Hidden</span>   World';

// textContent: raw text, includes hidden, preserves nothing
console.log(div.textContent);  // "Hello   Hidden   World"

// innerText: rendered text, respects CSS, collapses whitespace
console.log(div.innerText);    // "Hello World" (hidden text excluded)

// innerText causes reflow (performance impact)
// textContent is faster

// Use textContent unless you specifically need rendered text
```

### outerHTML

Includes the element itself, not just its contents.

```javascript
const p = document.querySelector('p');
// <p class="intro">Hello</p>

// Read: includes the element
console.log(p.outerHTML);  // '<p class="intro">Hello</p>'

// Write: replaces the element entirely
p.outerHTML = '<div class="new">Replaced</div>';
// ⚠️ After this, 'p' variable still references the OLD element!
// The old element is no longer in DOM

// Gotcha: variable becomes stale
const element = document.querySelector('.item');
element.outerHTML = '<div class="new-item">New</div>';
console.log(element.parentNode);  // null (removed from DOM!)
// Must re-query to get the new element
const newElement = document.querySelector('.new-item');
```

### Comparison Table

| Property | Reads | Writes | HTML Parsed? | Safe for User Input? |
|----------|-------|--------|--------------|---------------------|
| `innerHTML` | HTML string | HTML string | Yes | ❌ No |
| `textContent` | Plain text | Plain text | No (escaped) | ✅ Yes |
| `innerText` | Rendered text | Plain text | No | ✅ Yes |
| `outerHTML` | Element + content | Element + content | Yes | ❌ No |

---

## 1.6.2 Attribute Methods

Elements have attributes in HTML and corresponding properties in JavaScript.

### getAttribute and setAttribute

```javascript
const link = document.querySelector('a');

// Get attribute value
const href = link.getAttribute('href');
const target = link.getAttribute('target');

// Get non-existent attribute
link.getAttribute('data-missing');  // null

// Set attribute
link.setAttribute('href', 'https://example.com');
link.setAttribute('target', '_blank');
link.setAttribute('rel', 'noopener noreferrer');

// Set custom attributes
link.setAttribute('data-track-id', '12345');
```

### hasAttribute and removeAttribute

```javascript
const input = document.querySelector('input');

// Check if attribute exists
if (input.hasAttribute('required')) {
  console.log('This field is required');
}

// Remove attribute
input.removeAttribute('disabled');
input.removeAttribute('data-temp');

// Boolean attributes
input.setAttribute('disabled', '');  // Presence = true
input.removeAttribute('disabled');    // Removal = false
```

### Attributes vs Properties

```javascript
// Attributes: HTML markup values (strings)
// Properties: DOM object values (can be any type)

const checkbox = document.querySelector('input[type="checkbox"]');

// These are different!
checkbox.getAttribute('checked');  // "checked" or null (initial HTML)
checkbox.checked;                   // true or false (current state)

// Setting attribute doesn't always update property
checkbox.setAttribute('checked', 'checked');
// Visual state might not change if user already unchecked

// Setting property DOES update state
checkbox.checked = true;  // Immediately checks the box

// For form elements, prefer properties:
input.value = 'new value';     // ✅ Property (current value)
input.setAttribute('value', 'new');  // ❌ Attribute (initial value only)
```

### Common Attribute/Property Differences

```javascript
// href: property returns absolute URL
const link = document.createElement('a');
link.setAttribute('href', '/page');
link.getAttribute('href');  // "/page" (relative)
link.href;                   // "https://example.com/page" (absolute)

// class: attribute name differs from property
element.getAttribute('class');  // "foo bar"
element.className;              // "foo bar"
element.classList;              // DOMTokenList

// for: attribute name differs from property
label.getAttribute('for');      // "input-id"
label.htmlFor;                  // "input-id"

// style: attribute is string, property is object
element.getAttribute('style');  // "color: red; font-size: 16px"
element.style;                  // CSSStyleDeclaration object
```

---

## 1.6.3 data-* Attributes (dataset)

Custom data attributes provide a clean way to store data on elements.

### Reading and Writing Data Attributes

```javascript
// HTML: <div id="user" data-user-id="42" data-role="admin">

const div = document.getElementById('user');

// Read via dataset (camelCase)
console.log(div.dataset.userId);  // "42"
console.log(div.dataset.role);    // "admin"

// Write via dataset
div.dataset.score = '100';
div.dataset.lastLogin = '2024-01-15';

// Results in:
// <div data-user-id="42" data-role="admin" 
//      data-score="100" data-last-login="2024-01-15">

// Delete data attribute
delete div.dataset.score;
```

### Naming Convention

```javascript
// HTML attribute:  data-user-name     → dataset.userName  (camelCase)
// HTML attribute:  data-api-endpoint  → dataset.apiEndpoint
// HTML attribute:  data-x             → dataset.x
// HTML attribute:  data-XMLParser     → dataset.xmlparser (lowercased)

// Setting via dataset:
div.dataset.firstName = 'John';
// Creates: data-first-name="John"

div.dataset.apiURL = 'https://...';
// Creates: data-api-u-r-l="https://..."  ⚠️ Watch for this!
```

### Practical Use Cases

```javascript
// 1. Store metadata for event handlers
const buttons = document.querySelectorAll('[data-action]');
buttons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    handleAction(action, id);
  });
});

// 2. Configure components
const carousel = document.querySelector('[data-carousel]');
const config = {
  autoplay: carousel.dataset.autoplay === 'true',
  interval: parseInt(carousel.dataset.interval) || 3000,
  loop: carousel.dataset.loop !== 'false'
};

// 3. Track state
function toggleExpand(element) {
  if (element.dataset.expanded === 'true') {
    element.dataset.expanded = 'false';
    element.classList.remove('expanded');
  } else {
    element.dataset.expanded = 'true';
    element.classList.add('expanded');
  }
}

// 4. CSS hooks
// [data-state="loading"] { opacity: 0.5; }
// [data-state="error"] { border-color: red; }
element.dataset.state = 'loading';
```

### Dataset vs getAttribute

```javascript
// Both work, but dataset is cleaner for data-* attributes
div.getAttribute('data-user-id');  // "42"
div.dataset.userId;                // "42"

// dataset only works for data-* attributes
div.getAttribute('id');            // Works
div.dataset.id;                    // undefined! (id is not data-id)

// Performance: roughly equivalent for reads
// dataset creates the DOMStringMap object once
```

---

## 1.6.4 The style Property

Direct access to an element's inline styles.

### Reading and Writing Styles

```javascript
const div = document.getElementById('box');

// Write styles (use camelCase)
div.style.backgroundColor = 'blue';
div.style.fontSize = '16px';
div.style.marginTop = '10px';
div.style.border = '1px solid black';

// Read inline styles only
console.log(div.style.backgroundColor);  // "blue" (if set inline)

// Does NOT read styles from CSS!
// <div style="">  ← no inline styles
console.log(div.style.backgroundColor);  // "" (empty string)
```

### CSS Property Names

```javascript
// CSS property → JavaScript property
// background-color  → backgroundColor
// font-size         → fontSize
// z-index           → zIndex
// -webkit-transform → webkitTransform

// Some properties have special names
div.style.cssFloat = 'left';  // Not 'float' (reserved word)

// CSS custom properties (variables)
div.style.setProperty('--theme-color', 'blue');
div.style.getPropertyValue('--theme-color');  // "blue"
```

### Removing Styles

```javascript
// Set to empty string
div.style.backgroundColor = '';

// Or removeProperty
div.style.removeProperty('background-color');  // Use CSS name

// Clear all inline styles
div.style.cssText = '';
// Or
div.removeAttribute('style');
```

### style.cssText

```javascript
// Set multiple styles at once
div.style.cssText = 'color: red; font-size: 20px; margin: 10px';

// ⚠️ Overwrites ALL inline styles
div.style.cssText = 'color: blue';  // fontSize and margin are gone

// Read all inline styles as string
console.log(div.style.cssText);  // "color: blue;"
```

### getComputedStyle

```javascript
// To read ACTUAL applied styles (from CSS + inline)
const div = document.getElementById('styled');
const computed = getComputedStyle(div);

// Read computed values
console.log(computed.backgroundColor);  // "rgb(0, 0, 255)"
console.log(computed.fontSize);          // "16px"
console.log(computed.display);           // "block"

// Computed values are RESOLVED (rgb, px, etc.)
// Not the values you wrote in CSS

// Pseudo-elements
const beforeStyles = getComputedStyle(div, '::before');
console.log(beforeStyles.content);  // '"Hello"'

// ⚠️ getComputedStyle is read-only
computed.backgroundColor = 'red';  // Does nothing
```

---

## 1.6.5 Dimensions and Position

### Element Dimensions

```javascript
const box = document.getElementById('box');

// Content dimensions (CSS width/height)
console.log(box.clientWidth);   // Content + padding (no border, no scrollbar)
console.log(box.clientHeight);

console.log(box.offsetWidth);   // Content + padding + border + scrollbar
console.log(box.offsetHeight);

console.log(box.scrollWidth);   // Full scrollable width (including overflow)
console.log(box.scrollHeight);  // Full scrollable height

// Visual representation (box 200x100, padding 10, border 2):
// offsetWidth  = 200 + 10*2 + 2*2 = 224
// clientWidth  = 200 + 10*2       = 220
// scrollWidth  = actual content width (may be larger if overflow)
```

### getBoundingClientRect

Returns element's size and position relative to viewport.

```javascript
const element = document.getElementById('target');
const rect = element.getBoundingClientRect();

console.log(rect.top);      // Distance from viewport top
console.log(rect.right);    // Distance from viewport left to element right
console.log(rect.bottom);   // Distance from viewport top to element bottom
console.log(rect.left);     // Distance from viewport left
console.log(rect.width);    // Element width (including border)
console.log(rect.height);   // Element height (including border)
console.log(rect.x);        // Same as left
console.log(rect.y);        // Same as top

// ⚠️ Values change as page scrolls!
// ⚠️ Can be fractional (subpixel precision)
```

### Position Relative to Document

```javascript
function getDocumentPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };
}

// Or use offsetTop/offsetLeft (relative to offsetParent)
const pos = {
  top: element.offsetTop,
  left: element.offsetLeft
};
```

### Offset Properties

```javascript
const element = document.querySelector('.child');

// Position relative to offsetParent
console.log(element.offsetTop);     // Pixels from offsetParent top
console.log(element.offsetLeft);    // Pixels from offsetParent left
console.log(element.offsetParent);  // Nearest positioned ancestor

// offsetParent is null for:
// - document.body (or <html>)
// - Elements with display: none
// - Fixed position elements (varies by browser)
```

### Check Element Visibility

```javascript
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Partially visible
function isPartiallyVisible(element) {
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top < viewHeight &&
    rect.bottom > 0 &&
    rect.left < viewWidth &&
    rect.right > 0
  );
}
```

---

## 1.6.6 Scroll Properties and Methods

### Scroll Position

```javascript
const scrollable = document.getElementById('scrollable');

// Current scroll position
console.log(scrollable.scrollTop);   // Pixels scrolled from top
console.log(scrollable.scrollLeft);  // Pixels scrolled from left

// Set scroll position
scrollable.scrollTop = 100;   // Scroll to 100px from top
scrollable.scrollLeft = 0;    // Scroll to left edge

// Document scroll
console.log(window.scrollY);  // Or pageYOffset (alias)
console.log(window.scrollX);  // Or pageXOffset (alias)
```

### Scroll Methods

```javascript
const element = document.getElementById('target');

// Scroll element into view
element.scrollIntoView();               // Align to top
element.scrollIntoView(false);          // Align to bottom
element.scrollIntoView({ 
  behavior: 'smooth',                   // 'auto' or 'smooth'
  block: 'center',                      // 'start', 'center', 'end', 'nearest'
  inline: 'nearest'                     // 'start', 'center', 'end', 'nearest'
});

// Scroll container
const container = document.getElementById('container');
container.scrollTo(0, 500);             // scrollTo(x, y)
container.scrollTo({ 
  top: 500, 
  left: 0, 
  behavior: 'smooth' 
});

container.scrollBy(0, 100);             // Scroll by relative amount
container.scrollBy({ 
  top: 100, 
  behavior: 'smooth' 
});

// Window scroll
window.scrollTo(0, 0);                  // Scroll to top
window.scrollTo({ top: 0, behavior: 'smooth' });
```

---

## 1.6.7 className and classList

### className Property

```javascript
const div = document.getElementById('box');

// Read all classes as string
console.log(div.className);  // "card featured active"

// Set all classes (replaces existing)
div.className = 'card highlighted';

// Add class (clunky)
div.className += ' new-class';

// ⚠️ className replaces everything - easy to lose classes
```

### classList API (Preferred)

```javascript
const div = document.getElementById('box');

// Add classes
div.classList.add('active');
div.classList.add('highlighted', 'featured');  // Multiple

// Remove classes
div.classList.remove('active');
div.classList.remove('highlighted', 'featured');

// Toggle class
div.classList.toggle('active');  // Add if missing, remove if present
const isNowActive = div.classList.toggle('active');  // Returns new state

// Conditional toggle
div.classList.toggle('active', condition);  // Add if true, remove if false

// Check for class
if (div.classList.contains('active')) {
  console.log('Is active');
}

// Replace class
div.classList.replace('old-class', 'new-class');

// Iterate classes
div.classList.forEach(className => {
  console.log(className);
});

// Access by index
console.log(div.classList[0]);      // First class
console.log(div.classList.length);  // Number of classes
```

### classList Best Practices

```javascript
// ✅ Use classList for class manipulation
element.classList.add('active');
element.classList.remove('loading');

// ❌ Avoid className for add/remove (loses other classes)
element.className = 'active';  // Removes all other classes!

// ✅ Use toggle for binary states
element.classList.toggle('expanded');

// ✅ Use conditional toggle for state binding
element.classList.toggle('visible', isVisible);
element.classList.toggle('error', hasError);

// ✅ Use replace for state changes
element.classList.replace('loading', 'loaded');
```

---

## 1.6.8 Hidden and Visibility

### hidden Attribute

```javascript
const element = document.getElementById('modal');

// Hide element (like display: none)
element.hidden = true;

// Show element
element.hidden = false;

// Check visibility
if (element.hidden) {
  console.log('Element is hidden');
}

// hidden is a boolean attribute
// <div hidden>  is hidden
// <div>         is visible
```

### hidden vs CSS

```javascript
// hidden attribute = display: none
element.hidden = true;

// Equivalent CSS
element.style.display = 'none';

// But hidden can be overridden by CSS!
// If your CSS says .modal { display: block !important; }
// element.hidden = true won't hide it

// Use CSS for complex visibility logic
// Use hidden for simple show/hide
```

### Checking Actual Visibility

```javascript
function isElementVisible(element) {
  // Check multiple conditions
  if (element.hidden) return false;
  
  const style = getComputedStyle(element);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;
  
  // Check if in viewport (optional)
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  
  return true;
}
```

---

## 1.6.9 Other Useful Properties

### id

```javascript
element.id = 'new-id';
console.log(element.id);  // "new-id"
```

### tagName and nodeName

```javascript
const div = document.querySelector('div');
console.log(div.tagName);   // "DIV" (uppercase)
console.log(div.nodeName);  // "DIV" (uppercase)

// For elements, they're the same
// For other nodes, nodeName varies:
// Text node: "#text"
// Comment: "#comment"
// Document: "#document"
```

### children vs childNodes

```javascript
const parent = document.getElementById('parent');

// children: only Element nodes
console.log(parent.children);        // HTMLCollection of child elements
console.log(parent.children.length); // Number of child elements

// childNodes: all nodes including text and comments
console.log(parent.childNodes);        // NodeList of all child nodes
console.log(parent.childNodes.length); // Includes whitespace text nodes!
```

### parentElement vs parentNode

```javascript
const element = document.querySelector('.child');

// Usually the same
console.log(element.parentElement);  // Parent Element
console.log(element.parentNode);     // Parent Node

// Differ at document level
console.log(document.documentElement.parentElement);  // null
console.log(document.documentElement.parentNode);     // #document
```

---

## 1.6.10 Summary

| Property/Method | Purpose | Read/Write |
|-----------------|---------|------------|
| `innerHTML` | HTML content | Both |
| `textContent` | Plain text content (safe) | Both |
| `outerHTML` | Element + content as HTML | Both |
| `getAttribute/setAttribute` | HTML attributes | Both |
| `dataset` | data-* attributes | Both |
| `style` | Inline CSS styles | Both |
| `getComputedStyle()` | Computed CSS values | Read |
| `classList` | CSS classes | Both |
| `className` | Class attribute string | Both |
| `hidden` | Visibility (display: none) | Both |
| `getBoundingClientRect()` | Position and size | Read |
| `clientWidth/Height` | Content + padding | Read |
| `offsetWidth/Height` | Including border | Read |
| `scrollWidth/Height` | Full scrollable size | Read |
| `scrollTop/Left` | Scroll position | Both |

### Best Practices

1. **Use `textContent` for user data** — prevents XSS
2. **Prefer `classList` over `className`** — safer manipulation
3. **Use `dataset` for custom data** — clean, semantic
4. **Use `getComputedStyle` to read styles** — `style` only reads inline
5. **Cache `getBoundingClientRect` results** — triggers reflow
6. **Use properties over attributes** for form elements

---

**End of Chapter 1.6: Element Properties and Methods**

Next chapter: **1.7 DOM Traversal** — covers navigating between elements with `parentNode`, `children`, `siblings`, and more.
