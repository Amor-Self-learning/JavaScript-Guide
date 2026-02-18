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
