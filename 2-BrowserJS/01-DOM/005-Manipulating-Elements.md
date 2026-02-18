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
