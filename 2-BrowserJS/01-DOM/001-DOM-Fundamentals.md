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
