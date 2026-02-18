# 3.13 Event Delegation

Event delegation uses event bubbling to handle events on multiple elements with a single listener. This chapter covers delegation patterns, performance benefits, and handling dynamic content.

---

## 3.13.1 What Is Event Delegation?

### The Problem

```javascript
// ❌ Without delegation: listener per element
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('click', handleClick);
});

// Problems:
// - Memory: 1000 buttons = 1000 listeners
// - Dynamic content: new buttons need manual listener attachment
// - Cleanup: must remove 1000 listeners on cleanup
```

### The Solution

```javascript
// ✅ With delegation: one listener on parent
const container = document.querySelector('.button-container');

container.addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    handleClick(e);
  }
});

// Benefits:
// - Memory: 1 listener regardless of button count
// - Dynamic content: new buttons work automatically
// - Cleanup: remove 1 listener
```

---

## 3.13.2 Basic Delegation Pattern

### Using matches()

```javascript
// Check if clicked element matches selector
document.addEventListener('click', (e) => {
  // Handle button clicks
  if (e.target.matches('.btn')) {
    handleButton(e.target);
  }
  
  // Handle link clicks
  if (e.target.matches('a[data-ajax]')) {
    e.preventDefault();
    handleAjaxLink(e.target);
  }
  
  // Handle delete buttons
  if (e.target.matches('.delete-btn')) {
    e.preventDefault();
    handleDelete(e.target);
  }
});
```

### Using closest() for Nested Elements

```javascript
// Handle clicks on buttons OR their children
// <button class="btn"><span class="icon">✓</span> Submit</button>

document.addEventListener('click', (e) => {
  // ❌ Fails when clicking the icon
  if (e.target.matches('.btn')) {
    handleButton(e.target);
  }
  
  // ✅ Works for button or any child
  const button = e.target.closest('.btn');
  if (button) {
    handleButton(button);
  }
});

// closest() returns the element itself or nearest ancestor matching selector
```

---

## 3.13.3 Data Attributes with Delegation

### Using data-action

```javascript
// HTML
// <button data-action="save">Save</button>
// <button data-action="delete">Delete</button>
// <button data-action="cancel">Cancel</button>

const actions = {
  save: () => saveDocument(),
  delete: () => deleteDocument(),
  cancel: () => cancelEdit()
};

document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action]');
  
  if (button) {
    const action = button.dataset.action;
    
    if (actions[action]) {
      actions[action](button);
    }
  }
});
```

### Using data-id

```javascript
// HTML
// <li data-id="1">Item 1 <button class="edit">Edit</button></li>
// <li data-id="2">Item 2 <button class="edit">Edit</button></li>

list.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.edit');
  
  if (editBtn) {
    const item = editBtn.closest('[data-id]');
    const id = item.dataset.id;
    
    editItem(id);
  }
});
```

---

## 3.13.4 Delegation for Dynamic Content

### Why It Works

```javascript
// Container exists when page loads
const list = document.querySelector('#todo-list');

// Single listener handles all items, even future ones
list.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.delete');
  if (deleteBtn) {
    deleteBtn.closest('li').remove();
  }
  
  const checkbox = e.target.closest('input[type="checkbox"]');
  if (checkbox) {
    toggleComplete(checkbox);
  }
});

// Adding new items - they work immediately!
function addTodo(text) {
  const li = document.createElement('li');
  li.innerHTML = `
    <input type="checkbox">
    <span>${text}</span>
    <button class="delete">×</button>
  `;
  list.appendChild(li);
  // No need to add event listeners!
}
```

### Framework-like Component Pattern

```javascript
class TodoList {
  constructor(container) {
    this.container = container;
    this.items = [];
    
    // One listener for all interactions
    container.addEventListener('click', (e) => this.handleClick(e));
    container.addEventListener('change', (e) => this.handleChange(e));
  }
  
  handleClick(e) {
    const target = e.target;
    
    if (target.closest('.delete')) {
      const item = target.closest('[data-id]');
      this.deleteItem(item.dataset.id);
    }
    
    if (target.closest('.edit')) {
      const item = target.closest('[data-id]');
      this.editItem(item.dataset.id);
    }
    
    if (target.closest('.add')) {
      this.addItem();
    }
  }
  
  handleChange(e) {
    if (e.target.matches('input[type="checkbox"]')) {
      const item = e.target.closest('[data-id]');
      this.toggleItem(item.dataset.id, e.target.checked);
    }
  }
  
  render() {
    this.container.innerHTML = this.items.map(item => `
      <li data-id="${item.id}">
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span>${item.text}</span>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </li>
    `).join('');
  }
  
  deleteItem(id) { /* ... */ }
  editItem(id) { /* ... */ }
  addItem() { /* ... */ }
  toggleItem(id, done) { /* ... */ }
}
```

---

## 3.13.5 Delegation Scope

### Document-Level Delegation

```javascript
// Handle all clicks on the page
document.addEventListener('click', (e) => {
  // Modals
  if (e.target.closest('.modal-close')) {
    closeModal(e.target.closest('.modal'));
  }
  
  // Dropdowns
  if (!e.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
  
  // Links
  if (e.target.closest('a[href^="#"]')) {
    e.preventDefault();
    smoothScrollTo(e.target.closest('a').hash);
  }
});
```

### Scoped Delegation

```javascript
// Limit scope to reduce unnecessary checks
const sidebar = document.querySelector('.sidebar');
const main = document.querySelector('.main-content');

// Sidebar-specific events
sidebar.addEventListener('click', (e) => {
  if (e.target.closest('.nav-link')) {
    handleNavigation(e.target.closest('.nav-link'));
  }
});

// Main content events
main.addEventListener('click', (e) => {
  if (e.target.closest('.card')) {
    handleCardClick(e.target.closest('.card'));
  }
});
```

---

## 3.13.6 Multiple Event Types

### Combined Delegation

```javascript
class InteractiveList {
  constructor(element) {
    this.element = element;
    
    // Multiple event types
    element.addEventListener('click', (e) => this.onClick(e));
    element.addEventListener('dblclick', (e) => this.onDblClick(e));
    element.addEventListener('keydown', (e) => this.onKeydown(e));
    element.addEventListener('focusin', (e) => this.onFocus(e));
    element.addEventListener('focusout', (e) => this.onBlur(e));
  }
  
  onClick(e) {
    const item = e.target.closest('.item');
    if (item) this.selectItem(item);
  }
  
  onDblClick(e) {
    const item = e.target.closest('.item');
    if (item) this.editItem(item);
  }
  
  onKeydown(e) {
    const item = e.target.closest('.item');
    if (!item) return;
    
    switch (e.key) {
      case 'Enter':
        this.activateItem(item);
        break;
      case 'Delete':
        this.deleteItem(item);
        break;
      case 'ArrowDown':
        this.focusNext(item);
        e.preventDefault();
        break;
      case 'ArrowUp':
        this.focusPrevious(item);
        e.preventDefault();
        break;
    }
  }
  
  onFocus(e) {
    const item = e.target.closest('.item');
    if (item) item.classList.add('focused');
  }
  
  onBlur(e) {
    const item = e.target.closest('.item');
    if (item) item.classList.remove('focused');
  }
  
  // ...methods
}
```

---

## 3.13.7 Performance Considerations

### When Delegation Helps

```javascript
// ✅ Many similar elements
const list = document.querySelector('#user-list');
list.addEventListener('click', handleUserClick);

// ✅ Frequently added/removed elements
const chat = document.querySelector('#chat-messages');
chat.addEventListener('click', handleMessageClick);

// ✅ Memory-constrained environments
// 1 listener vs thousands
```

### When Direct Listeners Are Fine

```javascript
// ✅ Few static elements
const submitBtn = document.querySelector('#submit');
submitBtn.addEventListener('click', handleSubmit);

// ✅ Unique handlers
const playBtn = document.querySelector('#play');
const pauseBtn = document.querySelector('#pause');

playBtn.addEventListener('click', play);
pauseBtn.addEventListener('click', pause);

// ✅ Complex event handling needing specific options
element.addEventListener('scroll', handler, { passive: true });
```

### Avoiding Over-Delegation

```javascript
// ❌ Too generic - checks every click
document.addEventListener('click', (e) => {
  // Inefficient if most clicks aren't handled
  if (e.target.closest('.specific-component .specific-button')) {
    // ...
  }
});

// ✅ Scope to relevant container
const component = document.querySelector('.specific-component');
component.addEventListener('click', (e) => {
  if (e.target.closest('.specific-button')) {
    // ...
  }
});
```

---

## 3.13.8 Common Patterns

### Table Row Actions

```javascript
const table = document.querySelector('table');

table.addEventListener('click', (e) => {
  const row = e.target.closest('tr');
  if (!row) return;
  
  const rowId = row.dataset.id;
  
  if (e.target.closest('.edit-btn')) {
    editRow(rowId);
  } else if (e.target.closest('.delete-btn')) {
    deleteRow(rowId);
  } else if (e.target.closest('.view-btn')) {
    viewRow(rowId);
  } else {
    // Click on row itself
    selectRow(row);
  }
});
```

### Accordion

```javascript
const accordion = document.querySelector('.accordion');

accordion.addEventListener('click', (e) => {
  const header = e.target.closest('.accordion-header');
  if (!header) return;
  
  const item = header.closest('.accordion-item');
  const content = item.querySelector('.accordion-content');
  
  // Close others (optional)
  accordion.querySelectorAll('.accordion-item.open').forEach(other => {
    if (other !== item) {
      other.classList.remove('open');
    }
  });
  
  // Toggle this one
  item.classList.toggle('open');
});
```

### Tab Panel

```javascript
const tabContainer = document.querySelector('.tabs');

tabContainer.addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (!tab) return;
  
  // Update tab states
  tabContainer.querySelectorAll('[role="tab"]').forEach(t => {
    t.setAttribute('aria-selected', t === tab);
  });
  
  // Show corresponding panel
  const panelId = tab.getAttribute('aria-controls');
  const panels = document.querySelectorAll('[role="tabpanel"]');
  
  panels.forEach(panel => {
    panel.hidden = panel.id !== panelId;
  });
});
```

### Form Validation

```javascript
const form = document.querySelector('form');

form.addEventListener('focusout', (e) => {
  const input = e.target.closest('input, textarea, select');
  if (!input) return;
  
  validateField(input);
});

form.addEventListener('input', (e) => {
  const input = e.target.closest('input, textarea');
  if (!input) return;
  
  // Clear error on input
  clearError(input);
});
```

---

## 3.13.9 Gotchas

```javascript
// ❌ Stopping propagation breaks delegation
button.addEventListener('click', (e) => {
  e.stopPropagation();  // Parent delegation won't work!
});

// ✅ Be careful with stopPropagation
// Only use when intentionally blocking bubbling

// ❌ Forgetting to check with closest()
list.addEventListener('click', (e) => {
  if (e.target.classList.contains('item')) {  // Misses child clicks
    handleItem(e.target);
  }
});

// ✅ Use closest() for nested elements
list.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) {
    handleItem(item);
  }
});

// ❌ Events that don't bubble
container.addEventListener('focus', handler);  // Won't catch children!
container.addEventListener('blur', handler);

// ✅ Use focusin/focusout (they bubble)
container.addEventListener('focusin', handler);
container.addEventListener('focusout', handler);

// ❌ Relying on currentTarget in async code
container.addEventListener('click', async (e) => {
  await someAsyncOperation();
  console.log(e.currentTarget);  // Might be null!
});

// ✅ Store reference before async
container.addEventListener('click', async (e) => {
  const container = e.currentTarget;
  await someAsyncOperation();
  console.log(container);  // Safe
});
```

---

## 3.13.10 Summary

### Core Pattern

```javascript
// 1. Listen on parent/container
container.addEventListener('click', (e) => {
  // 2. Check what was clicked
  const target = e.target.closest('.selector');
  
  // 3. Handle if match found
  if (target) {
    handleElement(target);
  }
});
```

### Key Methods

| Method | Description |
|--------|-------------|
| `element.matches(selector)` | Check if element matches |
| `element.closest(selector)` | Find nearest matching ancestor |

### Events That Bubble

| Bubbles | Doesn't Bubble |
|---------|----------------|
| `click`, `dblclick` | `focus`, `blur` |
| `keydown`, `keyup` | `mouseenter`, `mouseleave` |
| `input`, `change` | `load`, `error` (on elements) |
| `submit`, `reset` | |
| `focusin`, `focusout` | |

### Best Practices

1. **Use `closest()` for nested elements** — handles child clicks
2. **Use `data-*` attributes** for action/id identification
3. **Scope to relevant container** — not always document
4. **Use `focusin`/`focusout`** instead of `focus`/`blur` for delegation
5. **Don't over-delegate** — balance with direct listeners
6. **Be careful with `stopPropagation`** — breaks parent delegation

### When to Delegate

| Delegate | Direct Listener |
|----------|-----------------|
| Many similar elements | Few static elements |
| Dynamic content | Unique handlers per element |
| Memory constrained | Special event options needed |

---

**End of Chapter 3.13: Event Delegation**

**End of Group 3: Events**

Next group: **4. Forms** — covers form elements, validation, FormData, and submission handling.
