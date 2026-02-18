# 1.1 DOM Fundamentals

The **Document Object Model (DOM)** is the programming interface that bridges HTML/XML documents and JavaScript. When a browser parses an HTML file, it does not keep the raw text in memory — it constructs a live, in-memory tree of objects. JavaScript reads and manipulates that tree, and the browser synchronises the screen with every change.

Understanding the DOM at a deep level is the foundation for all browser-side JavaScript: event handling, dynamic UIs, animations, and frameworks like React and Vue all operate on top of these primitives.

---

## 1.1.1 DOM Tree Structure

### What the DOM Is

The DOM is defined by the **WHATWG DOM Living Standard** (https://dom.spec.whatwg.org/). It specifies a language-neutral, platform-independent API — implementations exist in every browser and even in server-side environments such as jsdom (used by Jest and Node.js testing).

When a browser receives this HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Example</title>
  </head>
  <body>
    <h1 id="title">Hello</h1>
    <p class="intro">World</p>
  </body>
</html>
```

It builds this tree:

```
Document
└── DocumentType (<!DOCTYPE html>)
└── Element <html lang="en">
    ├── Element <head>
    │   └── Element <title>
    │       └── Text "Example"
    └── Element <body>
        ├── Text "\n    "           ← whitespace text node
        ├── Element <h1 id="title">
        │   └── Text "Hello"
        ├── Text "\n    "
        ├── Element <p class="intro">
        │   └── Text "World"
        └── Text "\n  "
```

Every box in the diagram is a **node** — an object that implements the `Node` interface.

### Key Structural Facts

1. **There is exactly one root node per document** — the `Document` node.
2. **Every element is surrounded by whitespace text nodes** when the source is formatted with indentation. This surprises beginners: `document.body.firstChild` is often a text node, not an element.
3. **The DOM is a live view** — modify it and the browser repaints automatically.
4. **The DOM is ordered** — children have a defined index order matching source order.
5. **The tree is deep, not flat** — nesting produces depth; typical real-world pages have DOM trees hundreds of levels deep.

### The DOM is Not HTML

The DOM and the HTML source are related but distinct:

```javascript
// The parser repairs invalid HTML
// Source: <table><td>cell</td></table>  (missing <tr>)
// DOM:    table > tbody > tr > td

// innerHTML can differ from source
const el = document.createElement('div');
el.innerHTML = '<p>Hello</p>';
console.log(el.innerHTML);  // "<p>Hello</p>" — serialised DOM, not original source

// The DOM reflects live state; HTML is static text
document.title = 'New Title';
// <title> in DOM is updated; original HTML file is unchanged
```

---

## 1.1.2 Node Types

Every object in the DOM tree is a **Node**. The `Node` interface defines a numeric `nodeType` property (an integer constant) that identifies what kind of node it is.

### All 12 Node Types

| Constant | Value | Description | Example |
|---|---|---|---|
| `Node.ELEMENT_NODE` | 1 | HTML or SVG element | `<div>`, `<p>`, `<svg>` |
| `Node.ATTRIBUTE_NODE` | 2 | Element attribute *(deprecated as node)* | `id="title"` |
| `Node.TEXT_NODE` | 3 | Text content | `"Hello, World"` |
| `Node.CDATA_SECTION_NODE` | 4 | CDATA section (XML only) | `<![CDATA[...]]>` |
| `Node.ENTITY_REFERENCE_NODE` | 5 | *(Removed from DOM4)* | — |
| `Node.ENTITY_NODE` | 6 | *(Removed from DOM4)* | — |
| `Node.PROCESSING_INSTRUCTION_NODE` | 7 | XML processing instruction | `<?xml version="1.0"?>` |
| `Node.COMMENT_NODE` | 8 | HTML/XML comment | `<!-- comment -->` |
| `Node.DOCUMENT_NODE` | 9 | The `document` itself | `document` |
| `Node.DOCUMENT_TYPE_NODE` | 10 | Doctype declaration | `<!DOCTYPE html>` |
| `Node.DOCUMENT_FRAGMENT_NODE` | 11 | Lightweight document | `createDocumentFragment()` |
| `Node.NOTATION_NODE` | 12 | *(Removed from DOM4)* | — |

> **In practice, types 2, 4, 5, 6, 12 are either deprecated or XML-only. Day-to-day browser work uses types 1, 3, 8, 9, 10, and 11.**

### Checking `nodeType`

```javascript
// Always check nodeType when traversing raw childNodes
function logNodeInfo(node) {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:           // 1
      console.log('Element:', node.tagName);
      break;
    case Node.TEXT_NODE:              // 3
      console.log('Text:', JSON.stringify(node.nodeValue));
      break;
    case Node.COMMENT_NODE:           // 8
      console.log('Comment:', node.nodeValue);
      break;
    case Node.DOCUMENT_NODE:          // 9
      console.log('Document');
      break;
    case Node.DOCUMENT_TYPE_NODE:     // 10
      console.log('Doctype:', node.name);
      break;
    case Node.DOCUMENT_FRAGMENT_NODE: // 11
      console.log('DocumentFragment');
      break;
    default:
      console.log('Other node type:', node.nodeType);
  }
}

logNodeInfo(document);              // Document
logNodeInfo(document.doctype);      // Doctype: html
logNodeInfo(document.body);         // Element: BODY
logNodeInfo(document.body.firstChild); // Text: "\n  " (whitespace)
```

### `Node.ELEMENT_NODE` (type 1) — the most common

Element nodes represent HTML tags. They are the only node type that can have attributes and child elements.

```javascript
const div = document.createElement('div');
console.log(div.nodeType);    // 1
console.log(div.nodeName);    // "DIV"  (uppercase for HTML, lowercase for SVG/XML)
console.log(div.tagName);     // "DIV"  (same as nodeName for elements)
console.log(div.nodeValue);   // null   (elements have no direct value)

// For SVG elements:
const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
console.log(circle.nodeName); // "circle" (lowercase for SVG namespace)
```

### `Node.TEXT_NODE` (type 3) — the invisible workhorse

Text nodes hold the actual text content. They are children of elements, and they are created implicitly by the parser for any text between tags.

```javascript
const p = document.createElement('p');
p.textContent = 'Hello world';

const textNode = p.firstChild;
console.log(textNode.nodeType);    // 3
console.log(textNode.nodeName);    // "#text"
console.log(textNode.nodeValue);   // "Hello world"
console.log(textNode.data);        // "Hello world" (alias for nodeValue on text nodes)
console.log(textNode.length);      // 11

// Whitespace creates text nodes
document.body.innerHTML = `
  <p>First</p>
  <p>Second</p>
`;
// document.body.childNodes contains:
//   [0] Text "\n  "
//   [1] Element <p>
//   [2] Text "\n  "
//   [3] Element <p>
//   [4] Text "\n"
console.log(document.body.childNodes.length); // 5, not 2!
```

**Common Gotcha — Whitespace Text Nodes:**

```javascript
// FRAGILE: assumes first child is the <p> element
const firstParagraph = document.body.firstChild; // ❌ This is a text node!

// ROBUST: use firstElementChild to skip text nodes
const firstParagraph = document.body.firstElementChild; // ✅ Element <p>
```

### `Node.COMMENT_NODE` (type 8)

HTML comments are full nodes in the DOM. This matters when traversing raw `childNodes`.

```javascript
document.body.innerHTML = '<!-- Step 1 --><p>Content</p>';
document.body.childNodes[0].nodeType; // 8 (comment)
document.body.childNodes[0].nodeValue; // " Step 1 "

// Comments are sometimes used as placeholders by frameworks
// e.g., Angular uses <!--bindings={...}--> markers
```

### `Node.DOCUMENT_NODE` (type 9)

There is exactly one `Document` node — the global `document` object in browsers.

```javascript
console.log(document.nodeType);  // 9
console.log(document.nodeName);  // "#document"
console.log(document === document.ownerDocument); // false — document has no ownerDocument
console.log(document.body.ownerDocument === document); // true
```

### `Node.DOCUMENT_TYPE_NODE` (type 10)

```javascript
const doctype = document.doctype;
console.log(doctype.nodeType);  // 10
console.log(doctype.name);      // "html"
console.log(doctype.publicId);  // "" (empty for HTML5)
console.log(doctype.systemId);  // "" (empty for HTML5)
```

### `Node.DOCUMENT_FRAGMENT_NODE` (type 11)

A `DocumentFragment` is a lightweight, detached subtree. It is used as an off-screen staging area to batch DOM changes efficiently.

```javascript
const fragment = document.createDocumentFragment();
console.log(fragment.nodeType);  // 11
console.log(fragment.nodeName);  // "#document-fragment"

// Build a list off-screen, then insert in one operation
const ul = document.querySelector('ul');
const frag = document.createDocumentFragment();

['Alpha', 'Beta', 'Gamma'].forEach(text => {
  const li = document.createElement('li');
  li.textContent = text;
  frag.appendChild(li);
});

ul.appendChild(frag); // Single reflow — all three <li>s inserted at once
// Note: the fragment itself is not inserted; only its children are moved
console.log(frag.childNodes.length); // 0 — fragment is now empty
```

---

## 1.1.3 Node Interface: Core Properties

Every node, regardless of type, inherits these properties from the `Node` interface:

```javascript
// Common Node properties
node.nodeType       // Integer (1–12), see table above
node.nodeName       // String: "DIV", "#text", "#comment", "html", etc.
node.nodeValue      // String | null — text for TEXT/COMMENT, null for ELEMENT
node.textContent    // Get/set all text content (strips tags)
node.ownerDocument  // The Document this node belongs to
node.parentNode     // Parent node (any type) or null
node.parentElement  // Parent element node or null (null if parent is Document)
node.childNodes     // NodeList of all children (all node types)
node.firstChild     // First child (any type) or null
node.lastChild      // Last child (any type) or null
node.nextSibling    // Next sibling (any type) or null
node.previousSibling// Previous sibling (any type) or null
node.isConnected    // true if this node is in the live document
```

### `textContent` vs `nodeValue` vs `data`

```javascript
const p = document.createElement('p');
p.innerHTML = '<strong>Hello</strong> world';

// textContent: all text inside the element, tags stripped
console.log(p.textContent);  // "Hello world"

// Setting textContent replaces ALL children with a single text node
p.textContent = 'Plain text <with> "entities"';
console.log(p.innerHTML);    // "Plain text &lt;with&gt; &quot;entities&quot;"
// ↑ Safe: textContent never interprets HTML, so no XSS risk

// nodeValue: null for elements; actual text for text/comment nodes
console.log(p.nodeValue);    // null
console.log(p.firstChild.nodeValue); // "Plain text <with> \"entities\""

// .data is an alias for nodeValue on CharacterData nodes (Text, Comment, CDATASection)
console.log(p.firstChild.data); // same as nodeValue
```

---

## 1.1.4 Node Relationships (Parent, Child, Sibling)

The DOM tree has three fundamental relationship types: **ancestry** (parent/child/descendant/ancestor), **siblinghood**, and **ownership** (the `ownerDocument`).

### Parent–Child Relationships

```javascript
// Given this HTML:
// <div id="outer">
//   <p id="inner">Text</p>
// </div>

const outer = document.getElementById('outer');
const inner = document.getElementById('inner');
const textNode = inner.firstChild; // Text node "Text"

// Parent relationships
console.log(inner.parentNode);     // <div id="outer">
console.log(inner.parentElement);  // <div id="outer">

// parentNode vs parentElement:
// parentNode can be Document, DocumentFragment, or Element
// parentElement is null when the parent is not an Element
console.log(document.documentElement.parentNode);     // document (Document node)
console.log(document.documentElement.parentElement);  // null

// Child relationships
console.log(outer.childNodes);       // NodeList [text, p, text] (if whitespace present)
console.log(outer.children);         // HTMLCollection [p]   ← elements only
console.log(outer.firstChild);       // Text node (whitespace) or <p>
console.log(outer.firstElementChild);// <p id="inner">
console.log(outer.lastChild);        // Text node (whitespace) or <p>
console.log(outer.lastElementChild); // <p id="inner">
console.log(outer.childElementCount);// 1

// Checking if a node contains another (inclusive)
console.log(outer.contains(inner));  // true
console.log(outer.contains(textNode));// true
console.log(inner.contains(outer));  // false

// Checking ancestor–descendant with compareDocumentPosition
const pos = outer.compareDocumentPosition(inner);
// Returns a bitmask:
// Node.DOCUMENT_POSITION_CONTAINED_BY = 16 → inner is inside outer
console.log(pos & Node.DOCUMENT_POSITION_CONTAINED_BY); // 16 (truthy)
```

### Sibling Relationships

```javascript
// <ul>
//   <li id="a">A</li>
//   <li id="b">B</li>
//   <li id="c">C</li>
// </ul>

const b = document.getElementById('b');

// Raw siblings (include text nodes)
console.log(b.previousSibling); // Text "\n  " (whitespace)
console.log(b.nextSibling);     // Text "\n  " (whitespace)

// Element-only siblings (skip text nodes)
console.log(b.previousElementSibling); // <li id="a">
console.log(b.nextElementSibling);     // <li id="c">

// Getting index among siblings
function getElementIndex(el) {
  let index = 0;
  let sibling = el.previousElementSibling;
  while (sibling) {
    index++;
    sibling = sibling.previousElementSibling;
  }
  return index;
}
console.log(getElementIndex(b)); // 1 (zero-based)
```

### Ancestry — Walking Up the Tree

```javascript
// Check if an element is inside another
function isDescendant(ancestor, descendant) {
  return ancestor.contains(descendant);
}

// Find the closest ancestor matching a CSS selector (built-in)
const link = document.querySelector('.nav a');
const navContainer = link.closest('.nav');    // walks up the tree
const tableCell = link.closest('td, th');     // first td or th ancestor

// Manual ancestor walk
function getAncestors(node) {
  const ancestors = [];
  let current = node.parentElement;
  while (current) {
    ancestors.push(current);
    current = current.parentElement;
  }
  return ancestors;
}
```

### The `compareDocumentPosition` Bitmask

```javascript
// Node.compareDocumentPosition() returns a bitmask of these flags:
const flags = {
  DOCUMENT_POSITION_DISCONNECTED:            1,  // Nodes in different trees
  DOCUMENT_POSITION_PRECEDING:               2,  // Argument precedes in tree order
  DOCUMENT_POSITION_FOLLOWING:               4,  // Argument follows in tree order
  DOCUMENT_POSITION_CONTAINS:               8,  // Argument contains this node
  DOCUMENT_POSITION_CONTAINED_BY:           16, // Argument is contained by this node
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
};

const a = document.getElementById('a');
const c = document.getElementById('c');

const result = a.compareDocumentPosition(c);
// c follows a in the document
console.log(result & 4); // 4 — DOCUMENT_POSITION_FOLLOWING (truthy: c is after a)
console.log(result & 2); // 0 — not PRECEDING

// Practical: sort nodes in document order
function sortByDocumentOrder(nodes) {
  return [...nodes].sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    return pos & 4 ? -1 : pos & 2 ? 1 : 0;
  });
}
```

---

## 1.1.5 NodeList vs HTMLCollection

The DOM exposes two collection types for groups of nodes. They have different behaviours, and confusing them is a very common source of bugs.

### `NodeList`

A `NodeList` is a collection of `Node` objects (any node type). It is returned by:

- `node.childNodes`  ← **live** NodeList
- `document.querySelectorAll()` ← **static** NodeList
- `node.querySelectorAll()` ← **static** NodeList

```javascript
// NodeList basics
const all = document.querySelectorAll('p');
console.log(all instanceof NodeList); // true
console.log(all.length);             // e.g. 3

// Indexed access
console.log(all[0]);        // first <p>
console.log(all.item(0));   // same as all[0]

// NodeList is array-like but NOT an Array
console.log(Array.isArray(all)); // false
console.log(typeof all.map);     // "undefined" — no .map() method!

// Convert to real array for full array methods
const array = Array.from(all);          // modern, preferred
const array2 = [...all];                // spread (also works)
const array3 = Array.prototype.slice.call(all); // legacy

array.map(p => p.textContent);     // ✅ now .map() works
array.filter(p => p.id !== '');    // ✅
array.sort((a, b) => ...);         // ✅

// NodeList IS iterable (supports for...of)
for (const p of all) {
  console.log(p.textContent);
}

// NodeList also supports forEach directly (since ~2016)
all.forEach(p => console.log(p.textContent));
```

### `HTMLCollection`

An `HTMLCollection` is a collection of **`Element`** nodes only (no text nodes, no comments). It is returned by:

- `node.children` ← **live** HTMLCollection
- `document.getElementsByTagName()` ← **live** HTMLCollection
- `document.getElementsByClassName()` ← **live** HTMLCollection
- `document.getElementsByName()` ← **live** NodeList (special case)
- `form.elements` ← **live** HTMLFormControlsCollection (subtype)

```javascript
const children = document.body.children;
console.log(children instanceof HTMLCollection); // true

// Named access by id or name attribute (unique to HTMLCollection)
document.body.innerHTML = '<div id="hero"></div>';
const divs = document.body.children;
console.log(divs.namedItem('hero')); // <div id="hero">
console.log(divs['hero']);           // same — bracket access works too

// HTMLCollection is NOT iterable in older browsers!
// for...of works in modern browsers but NOT in IE11:
for (const el of children) { ... } // ✅ modern
// For legacy support, convert first:
Array.from(children).forEach(el => ...);

// HTMLCollection has no forEach, no map, no filter — convert always
Array.from(children).filter(el => el.classList.contains('active'));
```

---

## 1.1.6 Live vs Static Collections

This is the most important distinction between collection types and the source of subtle, hard-to-find bugs.

### Live Collections

A **live collection** automatically reflects DOM changes. If you add or remove nodes that match the collection's criteria, the collection updates itself instantly — without any re-query.

```javascript
// ─── Live NodeList example ───
const list = document.createElement('ul');
document.body.appendChild(list);

list.innerHTML = '<li>First</li><li>Second</li>';
const liveChildren = list.childNodes;  // Live NodeList
console.log(liveChildren.length);      // 2

// Add a new child
const li = document.createElement('li');
li.textContent = 'Third';
list.appendChild(li);

// The collection updated automatically
console.log(liveChildren.length);      // 3  ← reflects the new node

// ─── Live HTMLCollection example ───
const livePs = document.getElementsByTagName('p');
console.log(livePs.length);            // 2 (say)

document.body.appendChild(document.createElement('p'));
console.log(livePs.length);            // 3  ← live update

// ─── Bug: Infinite loop with live collections ───
const items = document.getElementsByClassName('item'); // live
// DON'T DO THIS — every iteration of the loop changes items.length:
for (let i = 0; i < items.length; i++) {
  const clone = items[i].cloneNode(true);
  clone.classList.add('item');
  document.body.appendChild(clone); // adds to items → loop never ends!
}

// FIX: snapshot the live collection first
const snapshot = Array.from(items); // static copy
for (const item of snapshot) {
  const clone = item.cloneNode(true);
  clone.classList.add('item');
  document.body.appendChild(clone); // safe
}
```

**Live collections that mutate during loops:**

```javascript
// Another common bug: removing elements by class with getElementsByClassName
const toRemove = document.getElementsByClassName('remove-me'); // live
// WRONG: as elements are removed, indices shift
for (let i = 0; i < toRemove.length; i++) {
  toRemove[i].remove(); // only removes odd-indexed elements!
}
// After removing index 0, what was index 1 becomes index 0, so i=1 skips it.

// FIX 1: iterate backwards
for (let i = toRemove.length - 1; i >= 0; i--) {
  toRemove[i].remove(); // ✅ safe
}

// FIX 2: convert to array
Array.from(toRemove).forEach(el => el.remove()); // ✅ safe
// [...toRemove].forEach(el => el.remove());       // ✅ also works

// FIX 3: use querySelectorAll (static)
document.querySelectorAll('.remove-me').forEach(el => el.remove()); // ✅
```

### Static Collections

A **static collection** is a snapshot taken at the moment of the query. Subsequent DOM changes do not affect it.

```javascript
// querySelectorAll returns a STATIC NodeList
const staticPs = document.querySelectorAll('p');
const countBefore = staticPs.length;

document.body.appendChild(document.createElement('p'));
const countAfter = staticPs.length;

console.log(countBefore === countAfter); // true — static snapshot not updated

// Compare: live vs static side by side
const live = document.getElementsByTagName('div');   // live HTMLCollection
const stat = document.querySelectorAll('div');        // static NodeList

const newDiv = document.createElement('div');
document.body.appendChild(newDiv);

console.log(live.length); // increased by 1
console.log(stat.length); // unchanged
```

### Choosing Between Live and Static

| Use case | Recommended | Reason |
|---|---|---|
| One-time DOM manipulation | `querySelectorAll` (static) | Predictable; avoids mutation bugs |
| Observing structural changes | Live (`children`, `childNodes`) | Automatically up-to-date |
| Iterating and removing nodes | Static or reverse iteration | Avoids shifting indices |
| Performance-sensitive repeated reads | Live then cache `.length` | Avoids re-querying |
| Building interactive UIs | Static | Easier to reason about |

```javascript
// Performance note: querying the DOM is relatively expensive.
// Cache static snapshots when you will reuse the result.
const buttons = document.querySelectorAll('.btn'); // query once
buttons.forEach(btn => {
  btn.addEventListener('click', handleClick); // use the snapshot
});
// vs querying inside a loop (bad):
document.querySelectorAll('.btn').forEach(...); // re-queries every time in a loop context
```

---

## 1.1.7 The `Node` Interface in Depth

Beyond the basics, the `Node` interface exposes several utility methods essential for every-day DOM work.

### Cloning Nodes

```javascript
// node.cloneNode(deep)
// deep = false: clone only the node itself (no children)
// deep = true:  clone the node and all descendants

const original = document.getElementById('card');

// Shallow clone — no children
const shallow = original.cloneNode(false);
console.log(shallow.childNodes.length); // 0

// Deep clone — full subtree
const deep = original.cloneNode(true);
console.log(deep.innerHTML); // same as original.innerHTML

// ⚠️ Important: cloneNode does NOT copy event listeners
// (listeners attached with addEventListener are not cloned)
original.addEventListener('click', handler);
const clone = original.cloneNode(true);
// clone does NOT have the click handler

// ⚠️ Cloning elements with id creates duplicate IDs — fix immediately
const cloneWithId = original.cloneNode(true);
cloneWithId.id = 'card-clone'; // remove or change the id
cloneWithId.querySelectorAll('[id]').forEach(el => {
  el.id = el.id + '-clone'; // suffix all descendant ids
});
```

### Comparing Nodes

```javascript
// node.isSameNode(other) — checks if they are the exact same object (reference equality)
const div = document.createElement('div');
const ref = div;
console.log(div.isSameNode(ref));      // true  (same reference)
console.log(div.isSameNode(div.cloneNode(true))); // false (different objects)

// Alternative: === operator (identical behaviour)
console.log(div === ref);              // true

// node.isEqualNode(other) — checks structural equality (same type, attributes, children)
const a = document.createElement('p');
const b = document.createElement('p');
a.textContent = 'Hello';
b.textContent = 'Hello';
console.log(a.isSameNode(b));   // false — different objects
console.log(a.isEqualNode(b));  // true  — same structure

a.setAttribute('class', 'note');
console.log(a.isEqualNode(b));  // false — different attributes now
```

### Checking Node Containment

```javascript
// node.contains(other)
// Returns true if 'other' is this node, a child, or any descendant
const container = document.getElementById('container');
const button = document.getElementById('button');

if (container.contains(button)) {
  console.log('button is inside container');
}

// Practical use: event delegation (checking if click target is inside an element)
document.addEventListener('click', event => {
  if (!dropdown.contains(event.target)) {
    dropdown.classList.remove('open'); // close dropdown when clicking outside
  }
});

// node.getRootNode() — walk up to the root (Document or ShadowRoot)
console.log(button.getRootNode()); // document (or ShadowRoot if in shadow DOM)
console.log(button.getRootNode({ composed: true })); // document (even from inside shadow)
```

### Inserting and Moving Nodes

```javascript
// node.appendChild(child) — appends child as last child
const ul = document.querySelector('ul');
const li = document.createElement('li');
li.textContent = 'New item';
ul.appendChild(li);        // li is now the last child of ul

// node.insertBefore(newNode, referenceNode) — inserts before reference
const first = ul.firstElementChild;
ul.insertBefore(li, first); // li is now the first child

// Moving: appending an existing node removes it from its current position
const existingLi = document.querySelector('li.special');
ul.appendChild(existingLi); // moves it (not copies) to the end

// node.removeChild(child)
ul.removeChild(ul.firstChild); // removes the first child

// Modern alternatives (covered in detail in chapter 1.5):
// append(), prepend(), before(), after(), replaceWith(), remove()
```

### Normalising the DOM

```javascript
// node.normalize() — merges adjacent text nodes and removes empty text nodes
const div = document.createElement('div');
div.appendChild(document.createTextNode('Hello'));
div.appendChild(document.createTextNode(' '));
div.appendChild(document.createTextNode('World'));
console.log(div.childNodes.length); // 3 — three text nodes

div.normalize();
console.log(div.childNodes.length); // 1 — merged into "Hello World"
console.log(div.firstChild.nodeValue); // "Hello World"

// Why normalize? Text nodes can become fragmented after:
// - Direct text node manipulation
// - Using splitText()
// - Undo/redo in contenteditable
```

### `splitText` — Splitting Text Nodes

```javascript
const p = document.createElement('p');
p.textContent = 'Hello World';

const textNode = p.firstChild; // "Hello World"
const secondHalf = textNode.splitText(6); // split at index 6

console.log(textNode.nodeValue);    // "Hello " (first part)
console.log(secondHalf.nodeValue);  // "World"  (new text node)
console.log(p.childNodes.length);   // 2

// Use case: wrap a specific portion of text in a <strong>
function wrapText(textNode, start, end) {
  // Split into three: before, target, after
  const after = textNode.splitText(end);
  const target = textNode.splitText(start);
  // At this point: textNode = before, target = middle, after = end
  const strong = document.createElement('strong');
  target.parentNode.insertBefore(strong, target);
  strong.appendChild(target);
  return strong;
}
```

---

## 1.1.8 The Document Fragment

`DocumentFragment` (node type 11) is one of the most important performance tools in the DOM API. It acts as a temporary, lightweight container for building subtrees off-screen.

### Why Fragments Matter

Every time you insert a node into the live DOM, the browser may need to recalculate layout (reflow) and repaint. Inserting many nodes individually triggers many reflows:

```javascript
// Slow: 100 reflows
const list = document.querySelector('ul');
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  list.appendChild(li); // each triggers a potential reflow
}

// Fast: 1 reflow
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // off-screen — no reflow
}
list.appendChild(fragment); // single DOM insertion = single reflow
```

### Fragment Behaviour

```javascript
const frag = document.createDocumentFragment();

// Fragments can hold multiple top-level children
frag.appendChild(document.createElement('div'));
frag.appendChild(document.createElement('p'));
frag.appendChild(document.createTextNode('Some text'));
console.log(frag.childNodes.length); // 3

// When inserted, the fragment itself is NOT added — only its children are
const container = document.querySelector('#container');
container.appendChild(frag);
console.log(frag.childNodes.length); // 0 — fragment is now empty (children moved)
console.log(container.childNodes.length); // 3

// Fragments can be cloned to reuse the same template
const template = document.createDocumentFragment();
const card = document.createElement('div');
card.className = 'card';
template.appendChild(card);

function cloneTemplate() {
  return template.firstElementChild.cloneNode(true);
}
// Use cloneTemplate() to create new cards from the template
```

### Modern Alternative: `<template>` Element

The HTML `<template>` element provides declarative fragment templates in HTML:

```html
<template id="card-template">
  <article class="card">
    <h2 class="card-title"></h2>
    <p class="card-body"></p>
  </article>
</template>
```

```javascript
const tpl = document.getElementById('card-template');
// tpl.content is a DocumentFragment containing the template's subtree
console.log(tpl.content.nodeType);  // 11 (DocumentFragment)
console.log(tpl.content.querySelector('.card-title')); // h2.card-title

// Clone the template content to create a new instance
function createCard(title, body) {
  const instance = tpl.content.cloneNode(true); // deep clone
  instance.querySelector('.card-title').textContent = title;
  instance.querySelector('.card-body').textContent = body;
  return instance; // returns a DocumentFragment
}

const container = document.querySelector('#cards');
container.appendChild(createCard('First Card', 'Some text here.'));
container.appendChild(createCard('Second Card', 'More text here.'));
```

---

## 1.1.9 Practical Patterns and Gotchas

### Gotcha 1 — `innerHTML` Parses HTML (XSS Risk)

```javascript
// DANGEROUS: user-controlled input
const userInput = '<img src=x onerror="alert(1)">';
el.innerHTML = userInput;     // ❌ Executes XSS payload

// SAFE alternatives:
el.textContent = userInput;   // ✅ Treats everything as text
// or:
el.insertAdjacentText('beforeend', userInput); // ✅ Text only
// or use the Sanitizer API (discussed in chapter 54):
el.setHTML(userInput);        // ✅ Sanitizes HTML (newer browsers)
```

### Gotcha 2 — `innerHTML` Destroys Event Listeners

```javascript
const container = document.getElementById('container');
const button = container.querySelector('button');
button.addEventListener('click', () => console.log('clicked'));

// Re-assigning innerHTML destroys the entire subtree and recreates it from scratch
container.innerHTML += '<span>extra</span>'; // ❌ button's listener is lost!

// Better: use appendChild/append for additive changes
const span = document.createElement('span');
span.textContent = 'extra';
container.appendChild(span); // ✅ existing children (and their listeners) intact
```

### Gotcha 3 — Scripts Injected via `innerHTML` Do Not Execute

```javascript
// innerHTML does NOT execute scripts — this is intentional security behaviour
el.innerHTML = '<script>alert("XSS")</script>'; // script tag created but NOT run

// However, event-handler attributes and some elements still fire:
el.innerHTML = '<img src=x onerror=alert(1)>'; // ❌ this DOES fire
el.innerHTML = '<svg onload=alert(1)>';          // ❌ this also fires

// Only DOMParser / createContextualFragment execute sanitised content
```

### Gotcha 4 — Table Elements Require Proper Nesting

```javascript
// Browsers require <table> > <tbody> > <tr> > <td>
// Direct innerHTML injection may auto-wrap or silently drop elements:
const table = document.createElement('table');
table.innerHTML = '<td>Cell</td>'; // ❌ parsed differently — td stripped!

// Correct: use full nesting
table.innerHTML = '<tbody><tr><td>Cell</td></tr></tbody>'; // ✅

// Or build programmatically
const tbody = table.createTBody();
const row = tbody.insertRow();
const cell = row.insertCell();
cell.textContent = 'Cell'; // ✅
```

### Gotcha 5 — Detached Nodes

A node that has been created but not inserted into the document is **detached**. Queries against detached trees work, but you cannot use `document.getElementById()` on them — you must query relative to the root element.

```javascript
const div = document.createElement('div');
div.innerHTML = '<p id="foo">Hello</p>';

// getElementById only searches the live document
document.getElementById('foo');    // null — div is not in the document

// querySelector works on any node
div.querySelector('#foo');          // <p id="foo"> ✅
div.querySelector('p');             // <p id="foo"> ✅

// Check if a node is in the live document
console.log(div.isConnected);       // false — detached
document.body.appendChild(div);
console.log(div.isConnected);       // true  — connected

// getElementById now works
document.getElementById('foo');    // <p id="foo"> ✅
```

### Gotcha 6 — `document.body` Can Be `null`

If a script runs in the `<head>` before `<body>` is parsed, `document.body` is `null`.

```html
<head>
  <script>
    console.log(document.body); // null — body not parsed yet
  </script>
</head>
```

```javascript
// Solutions:
// 1. Move scripts to bottom of <body>
// 2. Use defer attribute
// 3. Listen for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Safe to access document.body here
  console.log(document.body); // <body>
});
```

---

## 1.1.10 `Node` vs `Element` — The Interface Hierarchy

The DOM is built on a rich inheritance chain. Understanding it prevents confusion about which properties and methods are available where.

```
EventTarget
  └── Node
        ├── CharacterData
        │     ├── Text
        │     ├── Comment
        │     └── CDATASection
        ├── Document
        │     └── HTMLDocument
        ├── DocumentFragment
        ├── DocumentType
        └── Element
              └── HTMLElement
                    ├── HTMLDivElement
                    ├── HTMLInputElement
                    ├── HTMLAnchorElement
                    └── ... (one per HTML tag)
```

```javascript
const div = document.createElement('div');

// EventTarget
console.log(div instanceof EventTarget); // true
div.addEventListener('click', () => {});

// Node
console.log(div instanceof Node);        // true
console.log(div.nodeType);               // 1
console.log(div.parentNode);             // null (detached)

// Element
console.log(div instanceof Element);     // true
console.log(div.tagName);               // "DIV"
console.log(div.getAttribute('id'));    // null

// HTMLElement
console.log(div instanceof HTMLElement); // true
console.log(div.hidden);                // false
console.log(div.style);                 // CSSStyleDeclaration {}

// HTMLDivElement (specific)
console.log(div instanceof HTMLDivElement); // true
// (HTMLDivElement adds no additional properties; just marks the specific type)

// Text node — does NOT implement Element interface
const text = document.createTextNode('hi');
console.log(text instanceof Node);    // true
console.log(text instanceof Element); // false  ← no tagName, no classList, etc.
console.log(text.nodeName);           // "#text"
// text.tagName   → undefined (not inherited)
// text.classList → TypeError in older browsers; undefined in newer
```

### Properties Unique to `Element` (not on plain `Node`)

```javascript
// These are available on Element nodes but NOT on Text, Comment, or Document:
element.tagName           // "DIV"
element.id                // ""
element.className         // ""
element.classList         // DOMTokenList []
element.attributes        // NamedNodeMap (all attributes)
element.getAttribute()    // read attribute by name
element.setAttribute()    // set attribute
element.removeAttribute() // remove attribute
element.hasAttribute()    // check attribute existence
element.querySelector()   // search subtree
element.querySelectorAll()// search subtree
element.closest()         // walk ancestors
element.matches()         // test CSS selector
element.children          // HTMLCollection of child elements
element.childElementCount // count of child elements
element.innerHTML         // HTML string of content
element.outerHTML         // HTML string including the element itself
element.insertAdjacentHTML()  // insert HTML relative to element
element.getBoundingClientRect()// size and position
element.scrollIntoView()  // scroll to element
```

---

## 1.1.11 Performance Considerations

DOM operations are among the most expensive things JavaScript can do. The DOM is maintained in a separate process (the rendering engine), and every crossing of the JS–rendering boundary has overhead.

### Minimise DOM Reads That Force Layout

Some DOM properties force the browser to **flush the layout queue** (synchronously recalculate all pending style/layout changes) before they can return a value:

```javascript
// Layout-forcing properties (partial list):
element.offsetWidth  / element.offsetHeight
element.offsetTop    / element.offsetLeft
element.scrollWidth  / element.scrollHeight
element.scrollTop    / element.scrollLeft
element.clientWidth  / element.clientHeight
element.getBoundingClientRect()
window.getComputedStyle(element)
```

**Layout thrashing** — alternating reads and writes in a loop — is a catastrophic performance pattern:

```javascript
// BAD: Layout thrashing (forces layout on every iteration)
const items = document.querySelectorAll('.item');
for (const item of items) {
  const height = item.offsetHeight;           // READ  — forces layout
  item.style.height = (height * 2) + 'px';   // WRITE — invalidates layout
}
// N reads × N writes = N reflows

// GOOD: Batch reads, then batch writes
const heights = [];
for (const item of items) {
  heights.push(item.offsetHeight);            // READ batch
}
for (let i = 0; i < items.length; i++) {
  items[i].style.height = (heights[i] * 2) + 'px'; // WRITE batch
}
// 1 reflow total
```

### Cache Node References

```javascript
// BAD: Queries the DOM on every call
function updateTitle() {
  document.querySelector('#title').textContent = getNewTitle();
}

// GOOD: Cache the reference
const titleEl = document.querySelector('#title');
function updateTitle() {
  titleEl.textContent = getNewTitle(); // no DOM query
}
```

### Use `DocumentFragment` and `innerHTML` Strategically

```javascript
// For building large lists from data, innerHTML can be faster than individual appends:
const items = ['A', 'B', 'C', /* ...1000 items */];
const ul = document.querySelector('ul');

// Approach 1: fragment (good for generic nodes)
const frag = document.createDocumentFragment();
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  frag.appendChild(li);
});
ul.appendChild(frag);

// Approach 2: innerHTML (fastest for large amounts of static HTML)
ul.innerHTML = items.map(item => `<li>${item}</li>`).join('');
// ⚠️ Only safe if items are trusted (not user input); destroys existing event listeners

// Approach 3: insertAdjacentHTML (fast, does not destroy existing content)
ul.insertAdjacentHTML('beforeend', items.map(item => `<li>${item}</li>`).join(''));
```

---

## 1.1.12 Summary

| Concept | Key Points |
|---|---|
| DOM tree | In-memory tree of Node objects; built from parsed HTML; live view of the document |
| Node types | 12 types; practical ones are Element (1), Text (3), Comment (8), Document (9), DocType (10), Fragment (11) |
| `nodeType` | Integer constant identifying the type; use `Node.ELEMENT_NODE` etc. |
| `nodeName` | `"DIV"`, `"#text"`, `"#comment"`, `"#document"`, `"html"`, `"#document-fragment"` |
| `nodeValue` | Text content for Text/Comment nodes; `null` for Element and Document |
| `textContent` | All text inside a node, HTML stripped; setting it is XSS-safe |
| Relationships | `parentNode`/`parentElement`, `childNodes`/`children`, `firstChild`/`firstElementChild`, siblings |
| `NodeList` | Can hold any node type; `querySelectorAll` → static; `childNodes` → live |
| `HTMLCollection` | Elements only; always live; returned by `getElementsByTagName`, `.children` |
| Live collection | Reflects DOM changes automatically; dangerous in mutation loops |
| Static collection | Snapshot at query time; predictable; returned by `querySelectorAll` |
| `DocumentFragment` | Off-screen container; children moved (not copied) on insert; enables batch inserts |
| `isConnected` | `true` if node is in the live document tree |
| Layout thrashing | Alternating DOM reads/writes in a loop; batch reads then writes to avoid |

---

**End of Chapter 1.1: DOM Fundamentals**

This chapter established the foundational model for all browser-side JavaScript. You now understand:

- The DOM as a live, in-memory tree of Node objects built from parsed HTML
- All 12 node types, their `nodeType` constants, and when each appears
- How `parentNode`, `parentElement`, `childNodes`, `children`, and sibling properties differ
- The critical distinction between live collections (`getElementsByTagName`, `.childNodes`) and static snapshots (`querySelectorAll`)
- How `DocumentFragment` enables high-performance batch DOM insertions
- The `Node` → `Element` → `HTMLElement` inheritance chain and which APIs each level provides
- Common gotchas: whitespace text nodes, `innerHTML` XSS risk, live-collection mutation bugs, and layout thrashing

Chapter 1.2 explores the `document` object itself — its properties, methods, and lifecycle events.
# 1.2 Document Interface

The `document` object is the entry point to the DOM. It represents the entire HTML or XML document loaded in the browser and provides properties and methods to access every element, create new content, and query document state. Every script that manipulates the page starts here.

Understanding the Document interface deeply is essential because:
- **All element access starts here** — `getElementById`, `querySelector`, etc. are Document methods
- **Document state matters** — code that runs before `DOMContentLoaded` can't find elements
- **Security boundaries** — cookies, referrer, and origin are exposed through Document
- **Dynamic content** — creating elements, writing HTML, and managing the document lifecycle all happen through this interface

---

## 1.2.1 The document Object

### What It Is

The `document` object is a global variable (actually `window.document`) that implements the `Document` interface. In a browser, it's always an `HTMLDocument` (which extends `Document`).

```javascript
// document is globally available
console.log(document);                    // #document
console.log(document.constructor.name);   // HTMLDocument
console.log(document instanceof Document); // true
console.log(document.nodeType);           // 9 (Node.DOCUMENT_NODE)

// document is the same as window.document
console.log(document === window.document); // true
```

### Document vs HTMLDocument

```javascript
// Document is the base interface (XML and HTML)
// HTMLDocument extends Document with HTML-specific properties

// HTML-specific properties (only on HTMLDocument):
document.body;        // <body> element
document.head;        // <head> element
document.cookie;      // Cookie access
document.domain;      // Security domain

// Generic Document properties (XML and HTML):
document.documentElement;  // Root element
document.doctype;          // DOCTYPE declaration
document.URL;              // Document URL
```

---

## 1.2.2 documentElement, head, and body

### documentElement

The `documentElement` property returns the root element of the document — for HTML, this is always `<html>`.

```javascript
const html = document.documentElement;

console.log(html.tagName);        // "HTML"
console.log(html.nodeName);       // "HTML"
console.log(html === document.querySelector('html')); // true

// documentElement is the parent of <head> and <body>
console.log(html.children.length);    // 2 (head + body, typically)
console.log(html.children[0].tagName); // "HEAD"
console.log(html.children[1].tagName); // "BODY"

// Useful for getting viewport dimensions
const viewportWidth = document.documentElement.clientWidth;
const viewportHeight = document.documentElement.clientHeight;
```

### head

The `head` property returns the `<head>` element — there's always exactly one.

```javascript
const head = document.head;

console.log(head.tagName);  // "HEAD"

// Access meta tags, stylesheets, scripts in head
const metas = head.querySelectorAll('meta');
const title = head.querySelector('title');

// Add a new stylesheet dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/styles/dynamic.css';
head.appendChild(link);

// Add a meta tag
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1';
head.appendChild(meta);
```

### body

The `body` property returns the `<body>` element (or `<frameset>` in legacy documents).

```javascript
const body = document.body;

console.log(body.tagName);  // "BODY"

// ⚠️ GOTCHA: body can be null if accessed too early
// This happens in <head> scripts before body is parsed
console.log(document.body);  // null (if script is in <head>)

// Safe pattern: wait for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log(document.body);  // <body> element (guaranteed)
});

// Or place scripts at end of <body>
// Or use defer attribute on script tags
```

### Gotcha: Accessing body Too Early

```javascript
// ❌ WRONG: Script in <head> without waiting
// <head>
//   <script>
//     document.body.style.background = 'red';  // TypeError: null
//   </script>
// </head>

// ✅ CORRECT: Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.background = 'red';  // Works
});

// ✅ CORRECT: Use defer
// <script defer src="app.js"></script>
// Script runs after DOM is ready

// ✅ CORRECT: Place script at end of body
// <body>
//   ...content...
//   <script src="app.js"></script>
// </body>
```

---

## 1.2.3 Document Properties

### title

The `title` property gets or sets the document title (shown in browser tab).

```javascript
// Get current title
console.log(document.title);  // "My Page"

// Set new title
document.title = 'Updated Title';

// Dynamic title based on state
function updateTitle(unreadCount) {
  document.title = unreadCount > 0 
    ? `(${unreadCount}) Messages` 
    : 'Messages';
}

// Restore title on visibility change
let originalTitle = document.title;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.title = 'Come back!';
  } else {
    document.title = originalTitle;
  }
});
```

### URL, domain, and origin

```javascript
// URL - full URL of the document (read-only)
console.log(document.URL);
// "https://example.com/page?query=1#section"

// Same as location.href
console.log(document.URL === location.href);  // true

// documentURI - same as URL in HTML documents
console.log(document.documentURI);

// domain - hostname (can be relaxed for same-origin policy)
console.log(document.domain);  // "example.com"

// ⚠️ Setting domain is deprecated and restricted
// document.domain = 'example.com';  // Deprecated

// origin - scheme + host (inherited from location)
// Note: document doesn't have origin, use location
console.log(location.origin);  // "https://example.com"
```

### referrer

The `referrer` property contains the URL of the page that linked to the current page.

```javascript
console.log(document.referrer);
// "https://google.com/search?q=..." (if from Google)
// "" (if direct navigation or referrer blocked)

// Use cases:
// 1. Analytics - track where visitors come from
if (document.referrer.includes('google.com')) {
  analytics.track('organic_search');
}

// 2. Conditional content
if (document.referrer.includes('partner-site.com')) {
  showPartnerDiscount();
}

// ⚠️ Security: referrer can be empty or spoofed
// - Empty if: direct navigation, HTTPS→HTTP, Referrer-Policy: no-referrer
// - Don't rely on it for security decisions
```

### characterSet

```javascript
// Returns the character encoding of the document
console.log(document.characterSet);  // "UTF-8"

// Also available as charset (legacy alias)
console.log(document.charset);  // "UTF-8"

// Should match <meta charset="UTF-8">
```

### contentType

```javascript
// MIME type of the document
console.log(document.contentType);  // "text/html"

// For XML documents: "application/xml" or "text/xml"
// For XHTML: "application/xhtml+xml"
```

### lastModified

```javascript
// Date the document was last modified (from HTTP header)
console.log(document.lastModified);  // "02/18/2024 15:30:45"

// ⚠️ Format is locale-dependent, not ISO
// ⚠️ May return current time if server doesn't send Last-Modified header
```

### dir

```javascript
// Base text direction of the document
console.log(document.dir);  // "ltr" or "rtl" or ""

// Set document direction
document.dir = 'rtl';  // Right-to-left (Arabic, Hebrew)
document.dir = 'ltr';  // Left-to-right (English, etc.)

// Usually set via <html dir="rtl"> attribute
```

---

## 1.2.4 readyState and DOMContentLoaded

### readyState

The `readyState` property indicates the loading state of the document.

```javascript
// Three possible values:
console.log(document.readyState);
// "loading"     - Document is still loading
// "interactive" - DOM is ready, but resources (images) still loading
// "complete"    - Everything loaded

// Check if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();  // DOM already ready
}
```

### readystatechange Event

```javascript
// Fires when readyState changes
document.addEventListener('readystatechange', () => {
  console.log(`State: ${document.readyState}`);
});

// Output order:
// State: loading      (initial, or not fired if already past)
// State: interactive  (DOMContentLoaded fires here)
// State: complete     (load event fires here)
```

### DOMContentLoaded vs load

```javascript
// DOMContentLoaded - fires when HTML is parsed and DOM tree is built
// Does NOT wait for stylesheets, images, subframes
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');
  // Safe to query and manipulate DOM
  const el = document.getElementById('app');
});

// load - fires when EVERYTHING is loaded (images, styles, etc.)
window.addEventListener('load', () => {
  console.log('Everything loaded');
  // Safe to get computed styles, image dimensions, etc.
  const img = document.querySelector('img');
  console.log(img.naturalWidth);  // Actual image width
});

// Timing:
// 1. HTML parsing begins
// 2. Scripts execute (unless defer/async)
// 3. DOM tree complete → readyState = "interactive"
// 4. DOMContentLoaded fires
// 5. Images, stylesheets, iframes load
// 6. readyState = "complete"
// 7. load fires
```

### Best Practice: Safe DOM Access

```javascript
// Pattern 1: Wrap in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // All DOM code here
});

// Pattern 2: Check readyState first
function whenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

whenReady(() => {
  console.log('DOM is ready');
});

// Pattern 3: Use defer attribute (preferred)
// <script defer src="app.js"></script>
// Script runs after DOM ready, before DOMContentLoaded
```

---

## 1.2.5 cookie Property

The `document.cookie` property provides read/write access to cookies for the current document.

### Reading Cookies

```javascript
// Get all cookies as a single string
console.log(document.cookie);
// "session_id=abc123; user_name=john; theme=dark"

// Parse cookies into an object
function getCookies() {
  return document.cookie
    .split('; ')
    .reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=');
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
}

const cookies = getCookies();
console.log(cookies.session_id);  // "abc123"
console.log(cookies.theme);       // "dark"

// Get a specific cookie
function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(^|; )' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}

console.log(getCookie('theme'));  // "dark"
```

### Writing Cookies

```javascript
// Set a simple cookie
document.cookie = 'username=john';

// ⚠️ Setting document.cookie ADDS a cookie, doesn't replace all!
document.cookie = 'theme=dark';
// Now both username and theme are set

// Cookie with options
document.cookie = 'token=xyz; max-age=3600; path=/; secure; samesite=strict';

// Cookie options:
// expires=DATE    - Expiration date (UTC string)
// max-age=SECONDS - Seconds until expiration (preferred over expires)
// path=PATH       - Cookie path (default: current path)
// domain=DOMAIN   - Cookie domain (default: current host)
// secure          - Only send over HTTPS
// samesite=VALUE  - CSRF protection (strict/lax/none)
```

### Setting Cookies with Helper

```javascript
function setCookie(name, value, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (options.maxAge) {
    cookie += `; max-age=${options.maxAge}`;
  }
  if (options.expires) {
    cookie += `; expires=${options.expires.toUTCString()}`;
  }
  if (options.path) {
    cookie += `; path=${options.path}`;
  }
  if (options.domain) {
    cookie += `; domain=${options.domain}`;
  }
  if (options.secure) {
    cookie += '; secure';
  }
  if (options.sameSite) {
    cookie += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookie;
}

// Usage
setCookie('session', 'abc123', {
  maxAge: 86400,      // 1 day
  path: '/',
  secure: true,
  sameSite: 'strict'
});
```

### Deleting Cookies

```javascript
// Delete by setting expiration in the past
function deleteCookie(name, path = '/') {
  document.cookie = `${name}=; max-age=0; path=${path}`;
}

deleteCookie('session');

// ⚠️ Must match the path used when setting
// Cookie set with path=/admin can only be deleted with path=/admin
```

### Cookie Limitations and Security

```javascript
// ❌ LIMITATIONS:
// - 4KB max per cookie
// - ~50 cookies per domain
// - Sent with EVERY request (bandwidth)
// - String-only (must serialize objects)

// ❌ SECURITY ISSUES:
// - XSS can steal cookies (unless HttpOnly)
// - CSRF if SameSite not set

// ✅ BEST PRACTICES:
// 1. Use HttpOnly for sensitive cookies (set by server, not JS)
// 2. Use Secure flag for HTTPS-only
// 3. Use SameSite=Strict or Lax
// 4. Set appropriate expiration
// 5. Use narrow path when possible

// For client-side storage, prefer:
// - localStorage/sessionStorage (more space, no request overhead)
// - IndexedDB (structured data)
```

---

## 1.2.6 Document Methods

### open(), write(), close()

These legacy methods write to the document stream. **Avoid them in modern code.**

```javascript
// ❌ LEGACY: document.write()
// Opens stream, writes HTML, can replace entire document
document.write('<h1>Hello</h1>');

// ⚠️ DANGEROUS: If called after page load, replaces entire document!
window.addEventListener('load', () => {
  document.write('Oops!');  // Entire page replaced with "Oops!"
});

// document.open() - explicitly opens the stream
// document.close() - closes the stream

// ✅ MODERN ALTERNATIVE: innerHTML or DOM methods
document.body.innerHTML = '<h1>Hello</h1>';

// Or:
const h1 = document.createElement('h1');
h1.textContent = 'Hello';
document.body.appendChild(h1);
```

### hasFocus()

```javascript
// Returns true if document or any element in it has focus
console.log(document.hasFocus());  // true (if tab is active)

// Use case: pause animations when tab loses focus
if (!document.hasFocus()) {
  pauseAnimation();
}

// Listen for focus changes
window.addEventListener('blur', () => {
  console.log('Window lost focus');
});
window.addEventListener('focus', () => {
  console.log('Window gained focus');
});
```

### activeElement

```javascript
// Returns the currently focused element
console.log(document.activeElement);  // <input>, <button>, etc.

// If no element is focused, returns <body> or null
console.log(document.activeElement.tagName);  // "BODY"

// Useful for:
// 1. Saving focus before modal opens
const previousFocus = document.activeElement;
openModal();
// ... later
previousFocus.focus();  // Restore focus

// 2. Validating which element has focus
if (document.activeElement === usernameInput) {
  showUsernameTips();
}
```

### getSelection()

```javascript
// Returns the Selection object representing selected text
const selection = document.getSelection();

console.log(selection.toString());    // Selected text as string
console.log(selection.rangeCount);    // Number of selection ranges
console.log(selection.anchorNode);    // Node where selection started
console.log(selection.focusNode);     // Node where selection ended

// Get selected range
if (selection.rangeCount > 0) {
  const range = selection.getRangeAt(0);
  console.log(range.startContainer);  // Start node
  console.log(range.endContainer);    // End node
}

// Clear selection
selection.removeAllRanges();

// Programmatically select text
const range = document.createRange();
range.selectNodeContents(document.getElementById('content'));
selection.removeAllRanges();
selection.addRange(range);
```

### elementFromPoint() and elementsFromPoint()

```javascript
// Get element at specific coordinates
const element = document.elementFromPoint(100, 200);
console.log(element);  // Element at x=100, y=200

// Get all elements at coordinates (topmost first)
const elements = document.elementsFromPoint(100, 200);
console.log(elements);  // [<span>, <div>, <body>, <html>]

// Use case: Custom tooltip at cursor position
document.addEventListener('mousemove', (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el.dataset.tooltip) {
    showTooltip(el.dataset.tooltip, e.clientX, e.clientY);
  }
});
```

---

## 1.2.7 Document Collections

### forms, images, links, scripts

```javascript
// Legacy HTMLCollections - live collections of specific elements

// All <form> elements
console.log(document.forms);              // HTMLCollection
console.log(document.forms.length);       // Number of forms
console.log(document.forms[0]);           // First form
console.log(document.forms.myForm);       // Form with name="myForm"

// All <img> elements
console.log(document.images);
console.log(document.images.length);

// All <a> and <area> elements with href
console.log(document.links);

// All <script> elements
console.log(document.scripts);

// All <style> and <link rel="stylesheet"> elements
console.log(document.styleSheets);

// All <embed> elements
console.log(document.embeds);
console.log(document.plugins);  // Same as embeds

// ⚠️ These are LIVE collections
// Adding/removing elements updates them automatically
const formCount = document.forms.length;  // e.g., 2
document.body.innerHTML += '<form></form>';
console.log(document.forms.length);       // 3 (updated!)
```

### Accessing Forms by Name

```javascript
// Forms can be accessed by name attribute
// <form name="login">...</form>
const loginForm = document.forms.login;
const loginForm2 = document.forms['login'];
const loginForm3 = document.forms.namedItem('login');

// Form elements can be accessed the same way
// <input name="username">
const username = loginForm.elements.username;
const password = loginForm.elements.password;

// Or by index
const firstInput = loginForm.elements[0];
```

---

## 1.2.8 Common Pitfalls

### Pitfall 1: Accessing DOM Before Ready

```javascript
// ❌ Script in <head> without defer
// document.body is null!
document.body.className = 'loaded';  // TypeError

// ✅ Use DOMContentLoaded or defer
document.addEventListener('DOMContentLoaded', () => {
  document.body.className = 'loaded';
});
```

### Pitfall 2: document.write After Load

```javascript
// ❌ document.write after page load replaces everything
setTimeout(() => {
  document.write('Oops!');  // Entire page wiped!
}, 1000);

// ✅ Use DOM methods instead
setTimeout(() => {
  document.body.innerHTML = '<p>New content</p>';
}, 1000);
```

### Pitfall 3: Cookie String Manipulation

```javascript
// ❌ Thinking document.cookie = 'x=1' replaces all cookies
document.cookie = 'a=1';
document.cookie = 'b=2';  // Both a and b exist now

// ❌ Forgetting to encode values
document.cookie = 'name=John Doe';  // Space may cause issues

// ✅ Always encode
document.cookie = `name=${encodeURIComponent('John Doe')}`;
```

### Pitfall 4: Live vs Static Collections

```javascript
// document.forms/images/links are LIVE
const forms = document.forms;
console.log(forms.length);  // 2

document.body.appendChild(document.createElement('form'));
console.log(forms.length);  // 3 (automatically updated!)

// querySelectorAll returns STATIC NodeList
const forms2 = document.querySelectorAll('form');
console.log(forms2.length);  // 3

document.body.appendChild(document.createElement('form'));
console.log(forms2.length);  // Still 3 (not updated)
```

---

## 1.2.9 Summary

| Property/Method | Purpose |
|-----------------|---------|
| `document.documentElement` | Root `<html>` element |
| `document.head` | `<head>` element |
| `document.body` | `<body>` element |
| `document.title` | Document title (read/write) |
| `document.URL` | Full document URL |
| `document.referrer` | URL of linking page |
| `document.readyState` | Loading state (loading/interactive/complete) |
| `document.cookie` | Cookie access (read/write) |
| `document.activeElement` | Currently focused element |
| `document.hasFocus()` | Whether document has focus |
| `document.getSelection()` | Current text selection |
| `document.elementFromPoint()` | Element at coordinates |
| `document.forms/images/links` | Live element collections |

### Best Practices

1. **Always wait for DOM ready** — use `DOMContentLoaded` or `defer`
2. **Never use `document.write()`** — use DOM methods instead
3. **Use `document.cookie` carefully** — encode values, set proper flags
4. **Prefer `querySelector`** over legacy collections
5. **Check `readyState`** before accessing body

---

**End of Chapter 1.2: Document Interface**

Next chapter: **1.3 Selecting Elements** — covers `getElementById`, `querySelector`, `querySelectorAll`, and more.
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
# 1.5 Manipulating Elements

Once you've selected or created elements, you need to insert them into the DOM, move them around, or remove them. This chapter covers all DOM manipulation methods — from classic approaches like `appendChild` to modern convenience methods like `append` and `replaceWith`.

Understanding these methods is crucial for building dynamic interfaces that respond to user actions and data changes.

---

## 1.5.1 appendChild

The classic method for adding a child element to a parent.

### How It Works

```javascript
const parent = document.getElementById('container');
const child = document.createElement('div');
child.textContent = 'New content';

// appendChild adds the element as the LAST child
parent.appendChild(child);

// Returns the appended node
const appended = parent.appendChild(child);
console.log(appended === child);  // true
```

### Key Behaviors

```javascript
// appendChild moves elements if already in DOM
const existingElement = document.getElementById('moveable');
const newParent = document.getElementById('new-container');

// This MOVES the element, not copies
newParent.appendChild(existingElement);
// existingElement is no longer in its original location

// To copy instead, clone first
const clone = existingElement.cloneNode(true);
newParent.appendChild(clone);
```

### Appending Multiple Elements

```javascript
// appendChild only takes one node at a time
const parent = document.getElementById('list');

// ❌ This doesn't work
parent.appendChild(child1, child2);  // Only child1 is added

// ✅ Loop or chain
parent.appendChild(child1);
parent.appendChild(child2);
parent.appendChild(child3);

// ✅ Or use DocumentFragment
const fragment = document.createDocumentFragment();
fragment.appendChild(child1);
fragment.appendChild(child2);
fragment.appendChild(child3);
parent.appendChild(fragment);

// ✅ Or use append() - see section 1.5.5
parent.append(child1, child2, child3);
```

---

## 1.5.2 insertBefore

Inserts an element before a specific reference node.

### How It Works

```javascript
const parent = document.getElementById('list');
const newItem = document.createElement('li');
newItem.textContent = 'Inserted item';

// Get the reference node (the element to insert before)
const referenceNode = parent.children[2];  // Third child

// Insert newItem before referenceNode
parent.insertBefore(newItem, referenceNode);
```

### Edge Cases

```javascript
// If referenceNode is null, appendChild to end
parent.insertBefore(newItem, null);
// Same as parent.appendChild(newItem)

// Reference must be a child of parent
const unrelatedElement = document.getElementById('other');
parent.insertBefore(newItem, unrelatedElement);
// DOMException: The node before which the new node is to be 
// inserted is not a child of this node.
```

### Insert at Beginning

```javascript
// Insert as first child
const parent = document.getElementById('container');
const newFirst = document.createElement('div');

parent.insertBefore(newFirst, parent.firstChild);

// If parent has no children, firstChild is null
// So this still works (appends)
```

### Insert After (Helper)

```javascript
// DOM has no native "insertAfter" - build your own
function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Usage
const newElement = document.createElement('div');
const existingElement = document.getElementById('existing');
insertAfter(newElement, existingElement);

// Or use modern after() method - see section 1.5.6
existingElement.after(newElement);
```

---

## 1.5.3 removeChild

Removes a child element from its parent.

### How It Works

```javascript
const parent = document.getElementById('container');
const child = document.getElementById('remove-me');

// Remove and get reference to removed node
const removed = parent.removeChild(child);

// The element is removed from DOM but still exists in memory
console.log(removed.id);  // "remove-me"
console.log(removed.parentNode);  // null

// Can re-insert it later
document.body.appendChild(removed);
```

### Common Pattern: Remove Self

```javascript
// To remove an element, you need its parent
const element = document.getElementById('remove-me');

// Classic pattern
element.parentNode.removeChild(element);

// Modern alternative (see section 1.5.4)
element.remove();
```

### Remove All Children

```javascript
const container = document.getElementById('container');

// Method 1: Loop (careful with live collections!)
while (container.firstChild) {
  container.removeChild(container.firstChild);
}

// Method 2: innerHTML (faster but has drawbacks)
container.innerHTML = '';
// ⚠️ Destroys event listeners on children

// Method 3: replaceChildren (modern)
container.replaceChildren();
// Removes all children cleanly
```

### Error Handling

```javascript
const parent = document.getElementById('parent');
const notAChild = document.getElementById('other');

try {
  parent.removeChild(notAChild);
} catch (e) {
  console.log(e.name);  // "NotFoundError"
  // "The node to be removed is not a child of this node"
}

// Check first
if (notAChild.parentNode === parent) {
  parent.removeChild(notAChild);
}
```

---

## 1.5.4 remove

Modern method to remove an element from the DOM.

### How It Works

```javascript
const element = document.getElementById('remove-me');

// Simply remove it - no parent reference needed
element.remove();

// Element is detached but still exists
console.log(element.id);  // "remove-me"
console.log(element.parentNode);  // null
```

### Comparison with removeChild

```javascript
const element = document.getElementById('item');

// Classic way - need parent reference
element.parentNode.removeChild(element);

// Modern way - cleaner
element.remove();

// Both achieve the same result
```

### Remove Multiple Elements

```javascript
// Remove all elements matching a selector
document.querySelectorAll('.temp-item').forEach(el => el.remove());

// Remove children matching a condition
const container = document.getElementById('list');
Array.from(container.children)
  .filter(child => child.classList.contains('completed'))
  .forEach(child => child.remove());
```

---

## 1.5.5 append and prepend

Modern methods for inserting content at the end or beginning.

### append()

```javascript
const parent = document.getElementById('container');

// Append single element
const div = document.createElement('div');
parent.append(div);

// Append multiple elements at once!
const p1 = document.createElement('p');
const p2 = document.createElement('p');
const p3 = document.createElement('p');
parent.append(p1, p2, p3);

// Append strings (converted to text nodes)
parent.append('Hello, ', 'World!');

// Mix elements and strings
const strong = document.createElement('strong');
strong.textContent = 'bold';
parent.append('This is ', strong, ' text.');
```

### prepend()

```javascript
const parent = document.getElementById('container');

// Insert at the beginning
const header = document.createElement('header');
parent.prepend(header);

// Multiple items
parent.prepend(child1, child2, 'Some text');

// After prepend, children are:
// [child1, child2, "Some text", ...existing children]
```

### Comparison: appendChild vs append

```javascript
// appendChild:
// - Takes exactly one Node
// - Returns the appended node
// - Classic, older API

const returned = parent.appendChild(child);
console.log(returned === child);  // true

// append:
// - Takes multiple nodes or strings
// - Returns undefined
// - Modern, more flexible

parent.append(child1, child2, 'text');  // Returns undefined
```

---

## 1.5.6 before and after

Insert elements adjacent to (not inside) an element.

### after()

```javascript
const reference = document.getElementById('reference');

// Insert after the reference element (as next sibling)
const newElement = document.createElement('div');
reference.after(newElement);

// Multiple items
reference.after(sibling1, sibling2, 'Text');

// Structure:
// <parent>
//   <div id="reference"></div>
//   <div><!-- newElement --></div>
//   <!-- sibling1, sibling2, "Text" here -->
// </parent>
```

### before()

```javascript
const reference = document.getElementById('reference');

// Insert before the reference element (as previous sibling)
const newElement = document.createElement('div');
reference.before(newElement);

// Multiple items
reference.before(item1, item2);

// Structure:
// <parent>
//   <!-- item1, item2 here -->
//   <div><!-- newElement --></div>
//   <div id="reference"></div>
// </parent>
```

### Use Cases

```javascript
// Insert error message after input
const input = document.querySelector('input[name="email"]');
const error = document.createElement('span');
error.className = 'error';
error.textContent = 'Invalid email';
input.after(error);

// Insert icon before button text
const button = document.querySelector('button');
const icon = document.createElement('span');
icon.className = 'icon';
button.prepend(icon);  // Inside button, at start

// Insert wrapper around element
const element = document.getElementById('wrap-me');
const wrapper = document.createElement('div');
wrapper.className = 'wrapper';
element.before(wrapper);
wrapper.append(element);  // Move element into wrapper
```

---

## 1.5.7 replaceChild and replaceWith

Replace existing elements with new content.

### replaceChild()

```javascript
const parent = document.getElementById('container');
const oldChild = document.getElementById('old');
const newChild = document.createElement('div');
newChild.textContent = 'New content';

// Replace old with new (returns the old element)
const replaced = parent.replaceChild(newChild, oldChild);

console.log(replaced === oldChild);  // true
console.log(oldChild.parentNode);    // null (removed from DOM)
```

### replaceWith()

```javascript
const oldElement = document.getElementById('old');
const newElement = document.createElement('div');
newElement.textContent = 'Replacement';

// Replace oldElement with newElement
oldElement.replaceWith(newElement);

// Can replace with multiple nodes/strings
oldElement.replaceWith(
  document.createElement('p'),
  'Some text',
  document.createElement('span')
);

// Returns undefined
```

### Common Use Cases

```javascript
// Replace loading placeholder with content
const placeholder = document.querySelector('.loading');
const content = document.createElement('div');
content.innerHTML = fetchedHTML;  // Sanitized!
placeholder.replaceWith(content);

// Swap elements
function swapElements(el1, el2) {
  const temp = document.createElement('div');
  el1.replaceWith(temp);
  el2.replaceWith(el1);
  temp.replaceWith(el2);
}
```

---

## 1.5.8 replaceChildren

Replace all children of an element at once.

### How It Works

```javascript
const container = document.getElementById('container');

// Replace all children with new content
const newChild1 = document.createElement('p');
const newChild2 = document.createElement('p');
container.replaceChildren(newChild1, newChild2);

// Previous children are removed, new ones inserted

// Clear all children
container.replaceChildren();
// Equivalent to removing all children
```

### Comparison with innerHTML

```javascript
// innerHTML approach:
container.innerHTML = '';  // Clear
container.appendChild(child1);
container.appendChild(child2);

// replaceChildren approach:
container.replaceChildren(child1, child2);

// replaceChildren advantages:
// - Single operation
// - Works with Node objects directly
// - Doesn't require HTML parsing
// - Preserves references to inserted nodes
```

### Use Case: Re-render List

```javascript
function renderList(items, container) {
  const elements = items.map(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    return li;
  });
  
  // Replace all existing items with new ones
  container.replaceChildren(...elements);
}

// Usage
const list = document.getElementById('todo-list');
renderList(todos, list);

// When data changes, just call again
renderList(updatedTodos, list);
```

---

## 1.5.9 Moving Elements

Elements can only exist in one place. Appending moves them.

### The Move Behavior

```javascript
// Element in original location
// <div id="source">
//   <p id="moveable">Content</p>
// </div>
// <div id="target"></div>

const element = document.getElementById('moveable');
const target = document.getElementById('target');

// Append moves the element
target.appendChild(element);

// Now:
// <div id="source">
//   <!-- empty -->
// </div>
// <div id="target">
//   <p id="moveable">Content</p>
// </div>
```

### Copy Instead of Move

```javascript
const original = document.getElementById('original');
const target = document.getElementById('target');

// Clone to copy
const copy = original.cloneNode(true);
target.appendChild(copy);

// Original stays in place, copy is added to target
```

### Rearranging Children

```javascript
const list = document.getElementById('sortable-list');

// Move last child to first
const lastItem = list.lastElementChild;
list.insertBefore(lastItem, list.firstElementChild);

// Reverse all children
const children = Array.from(list.children);
children.reverse().forEach(child => list.appendChild(child));

// Sort children alphabetically
const sorted = Array.from(list.children)
  .sort((a, b) => a.textContent.localeCompare(b.textContent));
list.replaceChildren(...sorted);
```

---

## 1.5.10 Batch Operations and Performance

### Minimize Reflows

```javascript
// ❌ BAD: Triggers reflow on each operation
const container = document.getElementById('container');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  container.appendChild(div);  // Reflow!
}

// ✅ GOOD: Single reflow with DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);  // No reflow
}
container.appendChild(fragment);  // Single reflow
```

### Detach, Modify, Reattach

```javascript
const container = document.getElementById('heavy-container');
const parent = container.parentNode;
const nextSibling = container.nextSibling;

// Detach from DOM
container.remove();

// Make many modifications (no reflows!)
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  container.appendChild(div);
}

// Reattach
parent.insertBefore(container, nextSibling);
```

### Use requestAnimationFrame

```javascript
// For visual updates, batch in animation frame
function addManyItems(items) {
  let index = 0;
  
  function processChunk() {
    const chunkSize = 50;
    const end = Math.min(index + chunkSize, items.length);
    
    const fragment = document.createDocumentFragment();
    while (index < end) {
      const el = createItemElement(items[index]);
      fragment.appendChild(el);
      index++;
    }
    container.appendChild(fragment);
    
    if (index < items.length) {
      requestAnimationFrame(processChunk);
    }
  }
  
  requestAnimationFrame(processChunk);
}
```

---

## 1.5.11 Summary

| Method | Called On | Purpose | Accepts |
|--------|-----------|---------|---------|
| `appendChild(node)` | Parent | Add as last child | 1 Node |
| `insertBefore(node, ref)` | Parent | Insert before reference | 1 Node |
| `removeChild(node)` | Parent | Remove child | 1 Node |
| `replaceChild(new, old)` | Parent | Replace child | 2 Nodes |
| `remove()` | Element | Remove self | - |
| `append(...nodes)` | Parent | Add to end | Multiple |
| `prepend(...nodes)` | Parent | Add to start | Multiple |
| `after(...nodes)` | Element | Insert after | Multiple |
| `before(...nodes)` | Element | Insert before | Multiple |
| `replaceWith(...nodes)` | Element | Replace self | Multiple |
| `replaceChildren(...nodes)` | Parent | Replace all children | Multiple |

### Modern vs Classic Methods

| Classic | Modern Equivalent |
|---------|-------------------|
| `parent.appendChild(child)` | `parent.append(child)` |
| `parent.insertBefore(child, first)` | `first.before(child)` |
| `parent.insertBefore(child, ref.nextSibling)` | `ref.after(child)` |
| `parent.removeChild(child)` | `child.remove()` |
| `parent.replaceChild(new, old)` | `old.replaceWith(new)` |

### Best Practices

1. **Use modern methods** (`append`, `remove`, `replaceWith`) — cleaner API
2. **Use DocumentFragment** for batch insertions
3. **Remember moves, not copies** — appending relocates elements
4. **Clone when needed** — use `cloneNode(true)` to copy
5. **Batch DOM operations** — minimize reflows
6. **Use `replaceChildren`** for efficient list re-renders

---

**End of Chapter 1.5: Manipulating Elements**

Next chapter: **1.6 Element Properties and Methods** — covers `innerHTML`, `textContent`, `outerHTML`, `dataset`, `style`, `getBoundingClientRect`, and more.
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
# 1.7 DOM Traversal

DOM traversal is the art of navigating between related elements — moving from parents to children, between siblings, or finding specific ancestors. Efficient traversal is essential for event delegation, dynamic UI updates, and working with complex document structures.

This chapter covers all traversal methods and properties, with patterns for real-world use cases.

---

## 1.7.1 Parent Traversal

### parentNode

Returns the parent of any node, including non-element nodes.

```javascript
const child = document.getElementById('child');

// Get parent
const parent = child.parentNode;

// parentNode can be:
// - Element (most common)
// - Document (for <html>)
// - DocumentFragment

// Chain for ancestors
const grandparent = child.parentNode.parentNode;
const greatGrandparent = child.parentNode.parentNode.parentNode;
```

### parentElement

Returns the parent Element only. Returns `null` if parent is not an Element.

```javascript
const child = document.getElementById('child');

// For most cases, same as parentNode
const parent = child.parentElement;

// Difference at document level
const html = document.documentElement;
console.log(html.parentNode);     // #document (Document node)
console.log(html.parentElement);  // null (Document is not an Element)
```

### Climbing the DOM Tree

```javascript
// Find all ancestors
function getAncestors(element) {
  const ancestors = [];
  let current = element.parentElement;
  
  while (current) {
    ancestors.push(current);
    current = current.parentElement;
  }
  
  return ancestors;
}

const path = getAncestors(document.getElementById('deep-child'));
// [parentDiv, grandparentDiv, ..., body, html]
```

### closest() for Ancestor Selection

```javascript
// Better than manual traversal when you know what you're looking for
const button = document.querySelector('button.delete');

// Find nearest ancestor matching selector
const card = button.closest('.card');
const form = button.closest('form');
const modal = button.closest('[data-modal]');

// closest checks the element itself first!
button.closest('button');  // Returns button itself

// Returns null if not found
button.closest('.nonexistent');  // null
```

---

## 1.7.2 Child Traversal

### children (Element Children Only)

```javascript
const parent = document.getElementById('list');

// Get all child elements
const children = parent.children;  // HTMLCollection (live)

console.log(children.length);     // Number of child elements
console.log(children[0]);         // First child element
console.log(children[children.length - 1]);  // Last child element

// Iterate
for (const child of children) {
  console.log(child.tagName);
}

// Convert to array for array methods
Array.from(children).filter(el => el.classList.contains('active'));
```

### childNodes (All Child Nodes)

```javascript
const parent = document.getElementById('content');

// Get ALL child nodes (elements, text, comments)
const nodes = parent.childNodes;  // NodeList (live)

// Includes whitespace text nodes!
// <div id="content">
//   <p>Hello</p>
// </div>
// childNodes: [TextNode("\n  "), <p>, TextNode("\n")]

nodes.forEach(node => {
  console.log(node.nodeType);
  // 1 = Element
  // 3 = Text
  // 8 = Comment
});

// Filter to elements only
const elements = Array.from(nodes).filter(n => n.nodeType === 1);
```

### firstChild, lastChild

```javascript
const parent = document.getElementById('container');

// First/last of ANY node type
console.log(parent.firstChild);  // Could be text node (whitespace)
console.log(parent.lastChild);   // Could be text node

// Filter for elements
if (parent.firstChild && parent.firstChild.nodeType === 1) {
  // First child is an element
}
```

### firstElementChild, lastElementChild

```javascript
const parent = document.getElementById('container');

// First/last ELEMENT child only (skips text/comments)
const first = parent.firstElementChild;  // First child element
const last = parent.lastElementChild;    // Last child element

// Much cleaner than firstChild when you want elements
if (first) {
  first.classList.add('first-item');
}
if (last) {
  last.classList.add('last-item');
}
```

### childElementCount

```javascript
const parent = document.getElementById('list');

// Number of child elements (not all nodes)
console.log(parent.childElementCount);  // e.g., 5

// Same as children.length but potentially faster
// No HTMLCollection creation
```

---

## 1.7.3 Sibling Traversal

### nextSibling, previousSibling

```javascript
const current = document.getElementById('item-3');

// Get adjacent siblings (any node type)
const next = current.nextSibling;
const prev = current.previousSibling;

// ⚠️ Often returns text nodes (whitespace)!
// <li id="item-2">...</li>
// <li id="item-3">...</li>
// ↑ Text node between them!
```

### nextElementSibling, previousElementSibling

```javascript
const current = document.getElementById('item-3');

// Get adjacent ELEMENT siblings (skip text/comments)
const nextEl = current.nextElementSibling;   // Next element or null
const prevEl = current.previousElementSibling;  // Previous element or null

// Much more useful for most cases
if (nextEl) {
  nextEl.classList.add('after-selected');
}
```

### Getting All Siblings

```javascript
function getSiblings(element) {
  // Get all siblings (excluding self)
  const parent = element.parentElement;
  if (!parent) return [];
  
  return Array.from(parent.children).filter(child => child !== element);
}

function getNextSiblings(element) {
  const siblings = [];
  let current = element.nextElementSibling;
  
  while (current) {
    siblings.push(current);
    current = current.nextElementSibling;
  }
  
  return siblings;
}

function getPreviousSiblings(element) {
  const siblings = [];
  let current = element.previousElementSibling;
  
  while (current) {
    siblings.unshift(current);  // Add to beginning
    current = current.previousElementSibling;
  }
  
  return siblings;
}
```

---

## 1.7.4 Node Type Properties

### nodeType

```javascript
const node = element.firstChild;

// Check what type of node
switch (node.nodeType) {
  case Node.ELEMENT_NODE:         // 1
    console.log('Element:', node.tagName);
    break;
  case Node.TEXT_NODE:            // 3
    console.log('Text:', node.textContent);
    break;
  case Node.COMMENT_NODE:         // 8
    console.log('Comment:', node.textContent);
    break;
  case Node.DOCUMENT_NODE:        // 9
    console.log('Document');
    break;
  case Node.DOCUMENT_TYPE_NODE:   // 10
    console.log('DOCTYPE');
    break;
  case Node.DOCUMENT_FRAGMENT_NODE:  // 11
    console.log('DocumentFragment');
    break;
}

// Common pattern: filter to elements
function getElementChildren(node) {
  return Array.from(node.childNodes)
    .filter(child => child.nodeType === Node.ELEMENT_NODE);
}
```

### nodeName and tagName

```javascript
// nodeName works on any node
textNode.nodeName;      // "#text"
commentNode.nodeName;   // "#comment"
element.nodeName;       // "DIV" (uppercase)
document.nodeName;      // "#document"

// tagName only works on elements
element.tagName;        // "DIV" (uppercase)
textNode.tagName;       // undefined
```

---

## 1.7.5 Traversal Methods Overview

### Element Properties vs Node Properties

| Element Property | Node Property | Returns |
|------------------|---------------|---------|
| `parentElement` | `parentNode` | Parent |
| `children` | `childNodes` | Children |
| `firstElementChild` | `firstChild` | First child |
| `lastElementChild` | `lastChild` | Last child |
| `nextElementSibling` | `nextSibling` | Next sibling |
| `previousElementSibling` | `previousSibling` | Previous sibling |
| `childElementCount` | `childNodes.length` | Child count |

### When to Use Each

```javascript
// ✅ Use Element properties for most DOM work
parent.children                  // Cleaner than filtering childNodes
element.nextElementSibling       // Skips whitespace text nodes
parent.firstElementChild         // Direct access to first element

// ⚠️ Use Node properties when you need ALL nodes
parent.childNodes                // Including text, comments
element.nextSibling              // Including text nodes

// ⚠️ Use Node properties for DOM libraries/parsers
// When you're processing arbitrary content
```

---

## 1.7.6 Tree Walker and Node Iterator

For complex traversal needs, the DOM provides iterator APIs.

### TreeWalker

```javascript
// Create a TreeWalker
const walker = document.createTreeWalker(
  document.body,                      // Root node to traverse
  NodeFilter.SHOW_ELEMENT,            // What to show
  {                                   // Optional filter function
    acceptNode: (node) => {
      return node.classList.contains('skip')
        ? NodeFilter.FILTER_REJECT    // Skip this node and children
        : NodeFilter.FILTER_ACCEPT;   // Include this node
    }
  }
);

// Navigate
const first = walker.firstChild();    // First child of root
const next = walker.nextNode();       // Next node in document order
const prev = walker.previousNode();   // Previous node
const parent = walker.parentNode();   // Parent node
const sibling = walker.nextSibling(); // Next sibling

// Iterate all matching nodes
let node;
while (node = walker.nextNode()) {
  console.log(node.tagName);
}
```

### NodeFilter Constants

```javascript
// What types of nodes to show
NodeFilter.SHOW_ALL           // All nodes
NodeFilter.SHOW_ELEMENT       // Element nodes only
NodeFilter.SHOW_TEXT          // Text nodes only
NodeFilter.SHOW_COMMENT       // Comment nodes only
NodeFilter.SHOW_DOCUMENT      // Document node

// Combine with bitwise OR
const filter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;

// Filter return values
NodeFilter.FILTER_ACCEPT      // Include this node
NodeFilter.FILTER_REJECT      // Skip node and its descendants
NodeFilter.FILTER_SKIP        // Skip node, but check descendants
```

### Use Case: Find All Text Nodes

```javascript
function getAllTextNodes(root) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  while (node = walker.nextNode()) {
    // Skip whitespace-only text nodes
    if (node.textContent.trim()) {
      textNodes.push(node);
    }
  }
  
  return textNodes;
}

const textNodes = getAllTextNodes(document.body);
textNodes.forEach(node => {
  console.log(node.textContent.trim());
});
```

### NodeIterator

```javascript
// Similar to TreeWalker but simpler (forward-only)
const iterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  {
    acceptNode: (node) => {
      return node.tagName === 'P'
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  }
);

// Iterate
let node;
while (node = iterator.nextNode()) {
  console.log(node.textContent);
}

// Can also go back
iterator.previousNode();

// Difference from TreeWalker:
// - NodeIterator: nextNode/previousNode only (no tree navigation)
// - TreeWalker: full tree navigation (firstChild, parentNode, etc.)
```

---

## 1.7.7 Practical Traversal Patterns

### Event Delegation with Traversal

```javascript
// Handle clicks on list items, even dynamic ones
document.getElementById('list').addEventListener('click', (e) => {
  // Find the clicked list item
  const li = e.target.closest('li');
  if (!li) return;
  
  // Do something with the item
  const id = li.dataset.id;
  selectItem(id);
});
```

### Find All Descendants Matching Criteria

```javascript
function findDescendants(root, predicate) {
  const results = [];
  
  function traverse(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (predicate(node)) {
        results.push(node);
      }
      
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  
  for (const child of root.children) {
    traverse(child);
  }
  
  return results;
}

// Find all disabled inputs
const disabled = findDescendants(form, el => 
  el.tagName === 'INPUT' && el.disabled
);

// Usually querySelectorAll is easier:
const disabled2 = form.querySelectorAll('input:disabled');
```

### Find Common Ancestor

```javascript
function findCommonAncestor(element1, element2) {
  const ancestors1 = new Set();
  
  // Collect all ancestors of element1
  let current = element1;
  while (current) {
    ancestors1.add(current);
    current = current.parentElement;
  }
  
  // Walk up element2's tree until we find a match
  current = element2;
  while (current) {
    if (ancestors1.has(current)) {
      return current;
    }
    current = current.parentElement;
  }
  
  return null;  // No common ancestor
}
```

### Check if Element Contains Another

```javascript
const container = document.getElementById('container');
const target = document.getElementById('target');

// Built-in method
if (container.contains(target)) {
  console.log('target is inside container');
}

// contains returns true if:
// - container === target
// - target is a descendant of container

// Check if target is a STRICT descendant (not same element)
if (container.contains(target) && container !== target) {
  console.log('target is a descendant of container');
}
```

### Walk DOM in Document Order

```javascript
function* walkDOM(root) {
  yield root;
  
  for (const child of root.children) {
    yield* walkDOM(child);
  }
}

// Usage
for (const element of walkDOM(document.body)) {
  console.log(element.tagName);
}

// With TreeWalker (more efficient for large DOMs)
function* walkDOMEfficient(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node = walker.currentNode;
  
  while (node) {
    yield node;
    node = walker.nextNode();
  }
}
```

---

## 1.7.8 Performance Considerations

### Cache Traversal Results

```javascript
// ❌ Repeated traversal in loop
function highlightSiblings(element) {
  for (let i = 0; i < 100; i++) {
    element.nextElementSibling.classList.add('highlight');  // Same lookup!
  }
}

// ✅ Cache the result
function highlightSiblings(element) {
  const sibling = element.nextElementSibling;
  if (sibling) {
    for (let i = 0; i < 100; i++) {
      sibling.classList.add('highlight');
    }
  }
}
```

### Avoid Deep Traversal When Possible

```javascript
// ❌ Walking entire tree
function findTarget(root) {
  for (const child of root.children) {
    if (child.id === 'target') return child;
    const found = findTarget(child);
    if (found) return found;
  }
  return null;
}

// ✅ Use built-in methods (optimized by browser)
const target = root.querySelector('#target');
```

### Use Appropriate Collection Type

```javascript
// Live collections update automatically but can be slow
const liveCollection = document.getElementsByClassName('item');

// Static collections are snapshots - faster for iteration
const staticCollection = document.querySelectorAll('.item');

// If you need to iterate and modify, use static
staticCollection.forEach(item => item.remove());  // Safe

// Live collection changes during iteration - problematic
// liveCollection shrinks as you remove items
```

---

## 1.7.9 Summary

| Property/Method | Returns | Notes |
|-----------------|---------|-------|
| `parentNode` | Node | Any parent node |
| `parentElement` | Element | Element parent only |
| `children` | HTMLCollection | Element children (live) |
| `childNodes` | NodeList | All child nodes (live) |
| `firstElementChild` | Element | First element child |
| `lastElementChild` | Element | Last element child |
| `nextElementSibling` | Element | Next element sibling |
| `previousElementSibling` | Element | Previous element sibling |
| `closest(selector)` | Element | Nearest matching ancestor |
| `contains(node)` | Boolean | Check if node is descendant |

### Best Practices

1. **Use Element properties** (`children`, `nextElementSibling`) for typical DOM work
2. **Use `closest()`** for finding ancestors by selector
3. **Use `contains()`** to check ancestor/descendant relationships
4. **Cache traversal results** when used multiple times
5. **Prefer `querySelector`/`querySelectorAll`** over manual traversal
6. **Use TreeWalker** for complex traversal with filtering
7. **Convert live collections to arrays** before modifying DOM

---

**End of Chapter 1.7: DOM Traversal**

Next chapter: **1.8 ClassList API** — deep dive into `add`, `remove`, `toggle`, `contains`, `replace`, and class manipulation patterns.
# 1.8 ClassList API

The `classList` property provides a powerful, intuitive API for manipulating CSS classes on elements. Before `classList`, developers used string manipulation on the `className` property — error-prone and verbose. `classList` makes class manipulation clean, efficient, and safe.

This chapter covers the complete `classList` API with practical patterns for state management, animations, and component development.

---

## 1.8.1 The DOMTokenList Interface

`classList` returns a `DOMTokenList` — a live, ordered collection of class tokens.

### Basic Access

```javascript
const element = document.getElementById('card');
// <div id="card" class="card featured active">

// Access classList
const classes = element.classList;

console.log(classes);          // DOMTokenList ["card", "featured", "active"]
console.log(classes.length);   // 3
console.log(classes[0]);       // "card"
console.log(classes[1]);       // "featured"
console.log(classes.value);    // "card featured active" (string)
```

### Live Nature

```javascript
const classes = element.classList;
console.log(classes.length);  // 3

element.classList.add('new-class');
console.log(classes.length);  // 4 (automatically updated)

// classList and className are linked
element.className = 'single-class';
console.log(classes.length);  // 1 (reflects className change)
```

### Iteration

```javascript
const element = document.querySelector('.multi-class');

// forEach
element.classList.forEach(className => {
  console.log(className);
});

// for...of
for (const className of element.classList) {
  console.log(className);
}

// Convert to array
const classArray = Array.from(element.classList);
const classArray2 = [...element.classList];

// entries, keys, values
for (const [index, className] of element.classList.entries()) {
  console.log(`${index}: ${className}`);
}
```

---

## 1.8.2 add()

Adds one or more classes to the element.

### Basic Usage

```javascript
const element = document.getElementById('box');

// Add single class
element.classList.add('active');

// Add multiple classes
element.classList.add('highlighted', 'visible', 'animated');

// Spread array of classes
const classesToAdd = ['class1', 'class2', 'class3'];
element.classList.add(...classesToAdd);
```

### Behavior Details

```javascript
// Adding existing class does nothing (no duplicates)
element.classList.add('active');
element.classList.add('active');  // No error, no duplicate
console.log(element.className);   // "... active ..." (only once)

// Empty strings and whitespace throw errors
element.classList.add('');           // SyntaxError!
element.classList.add('has space');  // InvalidCharacterError!
element.classList.add('has\ttab');   // InvalidCharacterError!

// Returns undefined
const result = element.classList.add('test');
console.log(result);  // undefined
```

### Common Patterns

```javascript
// Show element
element.classList.add('visible');

// Activate item
element.classList.add('active');

// Apply animation
element.classList.add('animate-fade-in');

// Multiple state classes
function selectCard(card) {
  card.classList.add('selected', 'elevated', 'focused');
}
```

---

## 1.8.3 remove()

Removes one or more classes from the element.

### Basic Usage

```javascript
const element = document.getElementById('modal');

// Remove single class
element.classList.remove('hidden');

// Remove multiple classes
element.classList.remove('loading', 'pending', 'disabled');

// Spread array
const classesToRemove = ['temp1', 'temp2'];
element.classList.remove(...classesToRemove);
```

### Behavior Details

```javascript
// Removing non-existent class does nothing (no error)
element.classList.remove('nonexistent');  // Safe, no error

// Cannot remove with empty/whitespace strings
element.classList.remove('');           // SyntaxError!
element.classList.remove('has space');  // InvalidCharacterError!

// Returns undefined
const result = element.classList.remove('test');
console.log(result);  // undefined
```

### Common Patterns

```javascript
// Hide element
element.classList.remove('visible');

// Clear loading state
element.classList.remove('loading', 'spinner-active');

// Cleanup animation classes
function onAnimationEnd(element) {
  element.classList.remove(
    'animate-slide-in',
    'animate-fade-in',
    'animate-bounce'
  );
}

// Remove all matching classes
function removeClassesStartingWith(element, prefix) {
  const toRemove = Array.from(element.classList)
    .filter(c => c.startsWith(prefix));
  element.classList.remove(...toRemove);
}

removeClassesStartingWith(element, 'temp-');
```

---

## 1.8.4 toggle()

Toggles a class — adds if missing, removes if present.

### Basic Usage

```javascript
const button = document.getElementById('toggle-btn');

// Toggle class
button.classList.toggle('active');

// Returns new state: true if added, false if removed
const isNowActive = button.classList.toggle('active');
console.log(isNowActive);  // true or false
```

### Conditional Toggle (Force Parameter)

```javascript
const element = document.getElementById('box');

// toggle(class, force)
// force = true: always add (like add)
// force = false: always remove (like remove)

element.classList.toggle('visible', true);   // Always adds
element.classList.toggle('visible', false);  // Always removes

// Useful for binding to conditions
const isLoggedIn = checkAuth();
element.classList.toggle('authenticated', isLoggedIn);
element.classList.toggle('guest', !isLoggedIn);

// Sync with variable
let darkMode = loadPreference('darkMode');
document.body.classList.toggle('dark-theme', darkMode);

function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-theme', darkMode);
  savePreference('darkMode', darkMode);
}
```

### Common Patterns

```javascript
// Expand/collapse
function toggleAccordion(header) {
  const content = header.nextElementSibling;
  const isExpanded = header.classList.toggle('expanded');
  content.classList.toggle('expanded', isExpanded);
  header.setAttribute('aria-expanded', isExpanded);
}

// Menu toggle
function toggleMenu() {
  const isOpen = navMenu.classList.toggle('open');
  menuButton.classList.toggle('active', isOpen);
  menuButton.setAttribute('aria-expanded', isOpen);
}

// Selection toggle
function toggleSelection(item) {
  item.classList.toggle('selected');
}

// Toggle with animation
function togglePanel(panel) {
  const isOpening = panel.classList.toggle('open');
  
  if (isOpening) {
    panel.classList.add('animating-in');
    panel.addEventListener('animationend', () => {
      panel.classList.remove('animating-in');
    }, { once: true });
  } else {
    panel.classList.add('animating-out');
    panel.addEventListener('animationend', () => {
      panel.classList.remove('animating-out');
    }, { once: true });
  }
}
```

---

## 1.8.5 contains()

Checks if the element has a specific class.

### Basic Usage

```javascript
const element = document.getElementById('box');

// Check for class
const hasActive = element.classList.contains('active');
console.log(hasActive);  // true or false

// Common usage
if (element.classList.contains('loading')) {
  console.log('Still loading...');
}

if (!element.classList.contains('initialized')) {
  initializeComponent(element);
  element.classList.add('initialized');
}
```

### Patterns

```javascript
// State checking
function isSelected(item) {
  return item.classList.contains('selected');
}

// Filter elements by class
const cards = document.querySelectorAll('.card');
const activeCards = Array.from(cards)
  .filter(card => card.classList.contains('active'));

// Conditional actions
function handleClick(element) {
  if (element.classList.contains('disabled')) {
    return;  // Don't process disabled elements
  }
  
  if (element.classList.contains('expandable')) {
    toggleExpand(element);
  }
}

// Accessibility: sync with ARIA
function updateAccessibility(button) {
  const isPressed = button.classList.contains('pressed');
  button.setAttribute('aria-pressed', isPressed);
}
```

---

## 1.8.6 replace()

Replaces one class with another in a single operation.

### Basic Usage

```javascript
const element = document.getElementById('status');

// Replace old class with new class
element.classList.replace('loading', 'loaded');

// Returns true if old class was replaced
const wasReplaced = element.classList.replace('pending', 'complete');
console.log(wasReplaced);  // true if 'pending' existed and was replaced

// Returns false if old class didn't exist
const notReplaced = element.classList.replace('nonexistent', 'new');
console.log(notReplaced);  // false (nothing happened)
```

### vs remove() + add()

```javascript
// These are functionally similar but...
element.classList.replace('old', 'new');

// vs
element.classList.remove('old');
element.classList.add('new');

// replace() advantages:
// - Single operation (potentially faster)
// - Returns whether replacement occurred
// - More semantic intent
// - Atomic: both happen or neither

// remove+add advantages:
// - Works even if old class doesn't exist
// - Can remove/add different numbers of classes
```

### Common Patterns

```javascript
// State transitions
function setStatus(element, newStatus) {
  const statuses = ['pending', 'loading', 'success', 'error'];
  
  for (const status of statuses) {
    if (element.classList.contains(status)) {
      element.classList.replace(status, newStatus);
      return;
    }
  }
  
  // No existing status found, just add
  element.classList.add(newStatus);
}

// Theme switching
function setTheme(theme) {
  const themes = ['theme-light', 'theme-dark', 'theme-auto'];
  const newTheme = `theme-${theme}`;
  
  for (const t of themes) {
    if (document.body.classList.replace(t, newTheme)) {
      return;  // Replaced existing theme
    }
  }
  
  // No existing theme, add new one
  document.body.classList.add(newTheme);
}

// Size variants
function setSize(element, size) {
  const sizes = ['size-sm', 'size-md', 'size-lg', 'size-xl'];
  const newSize = `size-${size}`;
  
  for (const s of sizes) {
    element.classList.replace(s, newSize);
  }
}
```

---

## 1.8.7 item() and Index Access

Access classes by index.

### Usage

```javascript
const element = document.querySelector('.multi-class');
// <div class="primary secondary tertiary">

// Index access
console.log(element.classList[0]);  // "primary"
console.log(element.classList[1]);  // "secondary"

// item() method
console.log(element.classList.item(0));  // "primary"
console.log(element.classList.item(2));  // "tertiary"

// Out of bounds
console.log(element.classList[99]);       // undefined
console.log(element.classList.item(99));  // null

// Practical use is rare - usually use contains() instead
```

---

## 1.8.8 value Property

Access or set all classes as a string.

### Usage

```javascript
const element = document.querySelector('.card');

// Read all classes as string
console.log(element.classList.value);  // "card featured active"

// Same as className
console.log(element.classList.value === element.className);  // true

// Set all classes
element.classList.value = 'new-class other-class';
// Replaces all existing classes

// Functionally same as:
element.className = 'new-class other-class';
```

---

## 1.8.9 Advanced Patterns

### State Machine with Classes

```javascript
class ElementStateMachine {
  constructor(element, states) {
    this.element = element;
    this.states = states;
    this.currentState = null;
  }
  
  setState(newState) {
    if (!this.states.includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }
    
    // Remove current state
    if (this.currentState) {
      this.element.classList.remove(`state-${this.currentState}`);
    }
    
    // Add new state
    this.element.classList.add(`state-${newState}`);
    this.currentState = newState;
    
    // Emit event
    this.element.dispatchEvent(new CustomEvent('statechange', {
      detail: { from: this.currentState, to: newState }
    }));
  }
  
  getState() {
    return this.currentState;
  }
}

// Usage
const button = document.getElementById('submit-btn');
const buttonState = new ElementStateMachine(button, [
  'idle', 'loading', 'success', 'error'
]);

buttonState.setState('loading');
// Button now has class "state-loading"
```

### BEM Modifier Management

```javascript
// BEM: Block__Element--Modifier pattern
class BEMElement {
  constructor(element, block, elementName = null) {
    this.element = element;
    this.prefix = elementName ? `${block}__${elementName}` : block;
  }
  
  addModifier(modifier) {
    this.element.classList.add(`${this.prefix}--${modifier}`);
    return this;
  }
  
  removeModifier(modifier) {
    this.element.classList.remove(`${this.prefix}--${modifier}`);
    return this;
  }
  
  toggleModifier(modifier, force) {
    this.element.classList.toggle(`${this.prefix}--${modifier}`, force);
    return this;
  }
  
  hasModifier(modifier) {
    return this.element.classList.contains(`${this.prefix}--${modifier}`);
  }
}

// Usage
const card = new BEMElement(document.querySelector('.card'), 'card');
card.addModifier('featured')
    .addModifier('large');
// Classes: card card--featured card--large

const cardTitle = new BEMElement(
  document.querySelector('.card__title'), 
  'card', 
  'title'
);
cardTitle.addModifier('bold');
// Classes: card__title card__title--bold
```

### Animation Helpers

```javascript
// Trigger CSS animation and clean up
function animate(element, animationClass) {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    
    element.addEventListener('animationend', function handler(e) {
      if (e.target === element) {
        element.classList.remove(animationClass);
        element.removeEventListener('animationend', handler);
        resolve();
      }
    });
  });
}

// Usage
async function showNotification(element) {
  await animate(element, 'slide-in');
  await delay(3000);
  await animate(element, 'fade-out');
  element.remove();
}

// One-time animation
function animateOnce(element, animationClass) {
  element.classList.add(animationClass);
  element.addEventListener('animationend', () => {
    element.classList.remove(animationClass);
  }, { once: true });
}
```

### Conditional Class Application

```javascript
// Apply classes based on conditions
function applyClasses(element, classConditions) {
  for (const [className, condition] of Object.entries(classConditions)) {
    element.classList.toggle(className, Boolean(condition));
  }
}

// Usage
applyClasses(element, {
  'is-active': isActive,
  'is-disabled': isDisabled,
  'is-loading': isLoading,
  'has-error': errorMessage,
  'is-empty': items.length === 0
});

// With computed classes
function computeClasses(state) {
  return {
    'card': true,
    'card--featured': state.featured,
    'card--archived': state.archived,
    [`card--${state.size}`]: state.size,
    [`card--theme-${state.theme}`]: state.theme
  };
}

function setClasses(element, classMap) {
  for (const [className, shouldHave] of Object.entries(classMap)) {
    if (shouldHave) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
}

setClasses(cardElement, computeClasses(cardState));
```

---

## 1.8.10 Comparison: classList vs className

### className (Legacy Approach)

```javascript
// Read
const classes = element.className;  // "card active featured"

// Set (replaces ALL classes)
element.className = 'card';

// Add class (string manipulation)
element.className += ' active';  // ⚠️ Leading space needed!

// Remove class (regex)
element.className = element.className.replace(/\bactive\b/g, '').trim();

// Check for class
const hasActive = /\bactive\b/.test(element.className);

// Toggle (complex!)
if (/\bactive\b/.test(element.className)) {
  element.className = element.className.replace(/\bactive\b/g, '');
} else {
  element.className += ' active';
}
```

### classList (Modern Approach)

```javascript
// Read
const classes = element.classList;  // DOMTokenList

// Add
element.classList.add('active');

// Remove
element.classList.remove('active');

// Check
const hasActive = element.classList.contains('active');

// Toggle
element.classList.toggle('active');
```

### Verdict

| Feature | className | classList |
|---------|-----------|-----------|
| Add single class | Awkward | Clean |
| Remove class | Regex needed | Simple |
| Toggle | Manual logic | Built-in |
| Check | Regex needed | Built-in |
| Multiple operations | Multiple assignments | Chained methods |
| Replace all | Direct | Use `.value` |
| Performance | Slightly faster write | Negligible difference |

**Use `classList`** for all class manipulation. **Use `className`** only when you need to replace all classes at once.

---

## 1.8.11 Summary

| Method | Purpose | Returns |
|--------|---------|---------|
| `add(...classes)` | Add classes | `undefined` |
| `remove(...classes)` | Remove classes | `undefined` |
| `toggle(class, force?)` | Toggle class | `boolean` (new state) |
| `contains(class)` | Check for class | `boolean` |
| `replace(old, new)` | Replace class | `boolean` (success) |
| `item(index)` | Get class by index | `string` or `null` |
| `length` | Number of classes | `number` |
| `value` | All classes as string | `string` |

### Best Practices

1. **Use `classList` over `className`** — cleaner, safer, more powerful
2. **Use `toggle` with force parameter** for syncing with state
3. **Use `contains` before conditional operations** when appropriate
4. **Use `replace` for state transitions** — cleaner than remove+add
5. **Handle animation cleanup** — remove animation classes after completion
6. **Consider utility classes** — build helpers for complex patterns
7. **Keep class lists short** — many classes indicate potential refactoring

### Gotchas

```javascript
// ❌ Classes cannot contain spaces
element.classList.add('has space');  // InvalidCharacterError

// ❌ Cannot add empty string
element.classList.add('');  // SyntaxError

// ⚠️ classList is live — loops can be affected
element.classList.forEach(c => element.classList.remove(c));
// May not remove all classes due to live nature

// ✅ Convert to array first
[...element.classList].forEach(c => element.classList.remove(c));
```

---

**End of Chapter 1.8: ClassList API**

This completes Group 01: DOM. Next group: **02 — Browser Object Model (BOM)** — starting with **2.1 Window Object**.
